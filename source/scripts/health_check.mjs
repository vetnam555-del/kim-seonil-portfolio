/**
 * 라이브 사이트 정기 점검 (2026.10.10) — 배포된 것이 main 과 같은지, 링크가 살아 있는지, PDF 가 원칙을 지키는지,
 * 속도가 어떤지를 본다. 원본 품질(문구·레이아웃)은 qa_release 가 보고, 이 스크립트는 "실제로 나가 있는 것"만 본다.
 *
 *   node scripts/health_check.mjs                 # 라이브 · main 대조 · PDF · 외부 링크
 *   node scripts/health_check.mjs --lighthouse    # + Lighthouse (npx lighthouse, 모바일 홈·사례 / 데스크톱 홈)
 *
 * 결과: artifacts/health/health-YYYY-MM-DD.{json,md}. 확실한 결함(라이브 접속 실패 · main 과 다른 배포 ·
 * 죽은 링크 · 이력서 원칙 위반)이 있으면 종료 코드 1. 403·429 같은 차단 응답은 사람이 확인할 경고로만 남긴다.
 * main 과 대조하려면 git fetch origin main 이 되어 있어야 한다.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

const LIVE = process.env.LIVE_BASE ?? "https://vetnam555-del.github.io/kim-seonil-portfolio";
const REF = process.env.HEALTH_REF ?? "origin/main";
const LIGHTHOUSE = process.argv.includes("--lighthouse");
const CHROME = process.env.CHROME_PATH ?? "/opt/pw-browsers/chromium";
const ROOT = process.cwd();
const OUT = join(ROOT, "artifacts", "health");
const today = new Date().toISOString().slice(0, 10);
const HEADERS = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "accept-language": "ko-KR,ko;q=0.9,en;q=0.8",
};

const hard = [];
const warn = [];
const pdfFlags = { untagged: 0, resumePages: true, pii: false };
const report = { date: today, live: LIVE, ref: REF, pages: [], pdfs: [], links: {}, lighthouse: [] };

const git = (...args) => execFileSync("git", args, { cwd: ROOT, maxBuffer: 64 * 1024 * 1024 });
async function get(url, timeout = 20000) {
  const ac = new AbortController();
  const t = setTimeout(() => ac.abort(), timeout);
  try {
    const r = await fetch(url, { headers: HEADERS, redirect: "follow", signal: ac.signal });
    return { status: r.status, body: Buffer.from(await r.arrayBuffer()) };
  } catch (e) {
    return { status: 0, error: e.name === "AbortError" ? "응답 없음" : "연결 실패" };
  } finally {
    clearTimeout(t);
  }
}

/* 1. 배포 파일 목록 — main 의 HTML 페이지와 PDF */
let files = [];
try {
  /* --full-tree: source/ 안에서 실행해도 저장소 루트 기준 목록을 받는다 */
  files = git("ls-tree", "-r", "--full-tree", "--name-only", REF).toString().split("\n").filter(Boolean);
} catch {
  hard.push(`${REF} 를 읽지 못했습니다 — git fetch origin main 을 먼저 실행하세요`);
}
const pages = files.filter((f) => f.endsWith("index.html") && !f.startsWith("_not-found") && f !== "404/index.html");
const pdfs = files.filter((f) => f.endsWith(".pdf") && !f.includes("/"));
if (files.length && (!pages.length || !pdfs.length)) hard.push(`${REF} 에서 페이지(${pages.length})나 PDF(${pdfs.length})를 찾지 못했습니다`);

/* 2. 라이브 페이지가 열리고 main 과 같은가 (다르면 배포가 덜 됐거나 캐시가 남은 것) */
for (const f of pages) {
  const path = f === "index.html" ? "/" : `/${f.replace(/index\.html$/, "")}`;
  const r = await get(`${LIVE}${path}`);
  const same = r.body ? Buffer.compare(r.body, git("show", `${REF}:${f}`)) === 0 : false;
  report.pages.push({ path, status: r.status, sameAsMain: same });
  if (r.status !== 200) hard.push(`라이브 ${path} → ${r.status || r.error}`);
  else if (!same) hard.push(`라이브 ${path} 가 ${REF} 와 다릅니다(배포 지연 또는 캐시)`);
}

/* 3. PDF — main 과 같은가, 쪽수, 이력서 개인정보 */
const pdfInfo = (buf, name) => {
  const p = join(tmpdir(), `health-${process.pid}-${name}`);
  writeFileSync(p, buf);
  try {
    const info = spawnSync("pdfinfo", [p], { encoding: "utf8" }).stdout || "";
    const text = spawnSync("pdftotext", ["-layout", p, "-"], { encoding: "utf8", maxBuffer: 32 * 1024 * 1024 }).stdout || "";
    return {
      pages: Number((info.match(/Pages:\s+(\d+)/) || [])[1] || 0),
      tagged: /Tagged:\s+yes/.test(info),
      text,
    };
  } finally {
    rmSync(p, { force: true });
  }
};
for (const f of pdfs) {
  const r = await get(`${LIVE}/${f}`, 60000);
  const same = r.body ? Buffer.compare(r.body, git("show", `${REF}:${f}`)) === 0 : false;
  const info = r.body ? pdfInfo(r.body, f) : { pages: 0, tagged: false, text: "" };
  if (!info.tagged) pdfFlags.untagged += 1;
  const row = { file: f, status: r.status, sameAsMain: same, pages: info.pages, tagged: info.tagged, kb: r.body ? Math.round(r.body.length / 1024) : 0 };
  report.pdfs.push(row);
  if (r.status !== 200) hard.push(`라이브 ${f} → ${r.status || r.error}`);
  else if (!same) hard.push(`라이브 ${f} 가 ${REF} 와 다릅니다`);
  if (/resume/.test(f)) {
    if (info.pages !== 5) {
      pdfFlags.resumePages = false;
      hard.push(`이력서 PDF 가 ${info.pages}쪽입니다(원칙 5쪽)`);
    }
    /* 공개 이력서에는 전화번호·주소·생년월일을 싣지 않는다 */
    if (/01[016789][-.\s]?\d{3,4}[-.\s]?\d{4}/.test(info.text)) {
      pdfFlags.pii = true;
      hard.push("이력서 PDF 에 전화번호 형식이 있습니다");
    }
    /* "전화번호·주소·생년월일 … 싣지 않았습니다" 안내 문장은 걸리지 않게, 항목 표기(라벨 + 콜론)만 본다 */
    if (/(생년월일|주\s*소)\s*[:：|]/.test(info.text)) {
      pdfFlags.pii = true;
      hard.push("이력서 PDF 에 생년월일·주소 항목이 있습니다");
    }
  } else if (!info.tagged) {
    warn.push(`${f} 에 접근성 태그가 없습니다`);
  }
}

/* 4. 외부 링크 — 홈·이력서·사례의 http(s) 링크 */
const urls = new Set();
for (const f of pages) {
  for (const m of git("show", `${REF}:${f}`).toString().matchAll(/href="(https?:\/\/[^"]+)"/g)) {
    if (!m[1].startsWith(LIVE)) urls.add(m[1].replace(/&amp;/g, "&"));
  }
}
const linkRows = await Promise.all(
  [...urls].map(async (u) => {
    let r = await get(u);
    if (r.status === 0 || r.status >= 500) r = await get(u);
    return { url: u, status: r.status, error: r.error };
  })
);
for (const row of linkRows) {
  const s = row.status;
  const blocked = s === 403 || s === 429 || (s === 999 && /linkedin\.com/.test(row.url));
  row.kind = s >= 200 && s < 400 ? "ok" : blocked ? "blocked" : s === 0 ? "unreachable" : "dead";
  if (row.kind === "dead") hard.push(`죽은 링크 ${row.url} → ${s}`);
  if (row.kind === "blocked") warn.push(`차단 응답 ${row.url} → ${s} (브라우저로 확인)`);
  if (row.kind === "unreachable") warn.push(`연결 실패 ${row.url} (${row.error})`);
}
report.links = {
  total: linkRows.length,
  ok: linkRows.filter((r) => r.kind === "ok").length,
  blocked: linkRows.filter((r) => r.kind === "blocked").map((r) => `${r.url} (${r.status})`),
  dead: linkRows.filter((r) => r.kind === "dead").map((r) => `${r.url} (${r.status})`),
  unreachable: linkRows.filter((r) => r.kind === "unreachable").map((r) => r.url),
};

/* 5. Lighthouse — 모바일 홈·대표 사례, 데스크톱 홈 */
if (LIGHTHOUSE) {
  const runs = [
    ["mobile", `${LIVE}/?intro=0`, "홈"],
    ["mobile", `${LIVE}/projects/newbalance/`, "뉴발란스 사례"],
    ["desktop", `${LIVE}/?intro=0`, "홈"],
  ];
  for (const [ff, url, label] of runs) {
    const json = join(tmpdir(), `lh-${process.pid}-${ff}-${report.lighthouse.length}.json`);
    const args = ["-y", "lighthouse@12.8.2", url, "--quiet", "--output=json", `--output-path=${json}`,
      "--only-categories=performance,accessibility,best-practices", "--chrome-flags=--headless=new --no-sandbox"];
    if (ff === "desktop") args.push("--preset=desktop");
    const r = spawnSync("npx", args, { encoding: "utf8", env: { ...process.env, CHROME_PATH: CHROME }, timeout: 240000 });
    try {
      const d = JSON.parse(readFileSync(json, "utf8"));
      /* 페이지를 못 연 경우(인증서·네트워크) 점수가 null 이다 — 0점으로 적지 않고 경고로 남긴다.
         클라우드에서 ERR_CERT_AUTHORITY_INVALID 가 나면 bash scripts/cloud_browser_ca.sh 로 프록시 CA 를 브라우저 저장소에 넣는다 */
      if (d.runtimeError || d.categories.performance.score == null) throw new Error(d.runtimeError?.code ?? "점수 없음");
      const a = d.audits;
      report.lighthouse.push({
        form: ff, page: label,
        performance: Math.round(d.categories.performance.score * 100),
        accessibility: Math.round(d.categories.accessibility.score * 100),
        bestPractices: Math.round(d.categories["best-practices"].score * 100),
        lcp: a["largest-contentful-paint"].displayValue, cls: a["cumulative-layout-shift"].displayValue, tbt: a["total-blocking-time"].displayValue,
        clsValue: a["cumulative-layout-shift"].numericValue,
      });
      rmSync(json, { force: true });
    } catch (e) {
      warn.push(`Lighthouse ${ff} ${label} 실행 실패: ${e.message} ${(r.stderr || "").split("\n").slice(-2).join(" ").slice(0, 120)}`.trim());
    }
  }
}

/* 6. 측정 점수 — source/BACKLOG.md 의 채점 기준 표와 같은 구간. 기준을 바꾸면 두 곳을 같이 고친다 */
const band = (v, rows) => rows.find(([min]) => v >= min)?.[1] ?? rows.at(-1)[1];
const scores = [];
const lh = report.lighthouse;
const mobileHome = lh.find((l) => l.form === "mobile" && l.page === "홈");
if (mobileHome) scores.push(["모바일 속도 (모바일 홈 성능)", mobileHome.performance, band(mobileHome.performance, [[90, 10], [85, 9], [80, 8.5], [70, 7], [0, 5]])]);
if (lh.length) {
  const a11y = Math.min(...lh.map((l) => l.accessibility));
  scores.push(["접근성 (세 화면 최저)", a11y, band(a11y, [[100, 10], [97, 9], [95, 8.5], [90, 7], [0, 5]])]);
  const cls = Math.max(...lh.map((l) => l.clsValue ?? 0));
  scores.push(["CLS (세 화면 최대)", Number(cls.toFixed(3)), cls <= 0.1 ? 10 : cls <= 0.25 ? 8.5 : 7]);
}
scores.push(["죽은 외부 링크", report.links.dead.length, [10, 7][report.links.dead.length] ?? 5]);
scores.push([
  "PDF (태그 · 이력서 5쪽 · 개인정보)",
  `태그 없음 ${pdfFlags.untagged}`,
  pdfFlags.pii ? 5 : !pdfFlags.resumePages ? 7 : pdfFlags.untagged === 0 ? 10 : 9,
]);
report.scores = scores.map(([area, value, score]) => ({ area, value, score }));

/* 7. 보고서 */
report.hard = hard;
report.warn = warn;
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, `health-${today}.json`), JSON.stringify(report, null, 1));
const md = [
  `# 라이브 점검 ${today}`,
  ``,
  `- 대상: ${LIVE} · 기준: ${REF}`,
  `- 결과: **${hard.length ? `결함 ${hard.length}건` : "결함 없음"}** · 경고 ${warn.length}건`,
  ``,
  `## 페이지 (${report.pages.length}쪽)`,
  `- 열림 ${report.pages.filter((p) => p.status === 200).length} · main 과 같음 ${report.pages.filter((p) => p.sameAsMain).length}`,
  ``,
  `## PDF`,
  ...report.pdfs.map((p) => `- ${p.file}: ${p.status} · ${p.pages}쪽 · ${p.kb}KB · main 과 ${p.sameAsMain ? "같음" : "다름"} · 태그 ${p.tagged ? "있음" : "없음"}`),
  ``,
  `## 외부 링크 (${report.links.total}개)`,
  `- 정상 ${report.links.ok} · 차단 응답 ${report.links.blocked.length} · 죽은 링크 ${report.links.dead.length} · 연결 실패 ${report.links.unreachable.length}`,
  ...report.links.blocked.map((u) => `  - 차단(브라우저 확인): ${u}`),
  ...report.links.dead.map((u) => `  - 죽음: ${u}`),
  ...(report.lighthouse.length
    ? [``, `## Lighthouse`, ...report.lighthouse.map((l) => `- ${l.form} ${l.page}: 성능 ${l.performance} · 접근성 ${l.accessibility} · 권장사항 ${l.bestPractices} · LCP ${l.lcp} · CLS ${l.cls} · TBT ${l.tbt}`)]
    : []),
  ``,
  `## 측정 점수 (BACKLOG.md 채점 기준)`,
  ...report.scores.map((s) => `- ${s.area}: ${s.value} → ${s.score}`),
  ``,
  `## 결함`,
  ...(hard.length ? hard.map((h) => `- ${h}`) : ["- 없음"]),
  ``,
  `## 경고`,
  ...(warn.length ? warn.map((w) => `- ${w}`) : ["- 없음"]),
  ``,
].join("\n");
writeFileSync(join(OUT, `health-${today}.md`), md);
console.log(md);
process.exit(hard.length ? 1 : 0);
