/**
 * 접근성 검수 — 빌드된 페이지(out/)에 Lighthouse 접근성 항목만 돌려 100 이 아닌 화면과 걸린 항목을 적는다.
 *
 * 왜 따로 있나: 접근성 점수는 라이브 점검(`npm run health:full`)만 쟀고 그것은 배포한 **뒤에** 돈다.
 * 2026.11.17 홈에 EDIT H 릴스 띠를 넣을 때 연회색 가운뎃점 하나(대비 1.87:1)와 제목 단계 건너뛰기(h2 → h4)가
 * 정적 검수 · 배치 검수 · 출시 승인을 모두 지나 라이브에 나간 뒤에야 잡혔다(홈 100 → 97, EDIT H 사례 100 → 99).
 * 화면에 보이는 것을 바꿨으면 배포 전에 이 검수를 돌린다(SKILL 3절).
 *
 * 재는 것은 health_check 와 같은 Lighthouse 판(12.8.2)의 접근성 범주다 — 채점 기준(BACKLOG)과 같은 잣대.
 * 홈(국 · 영)은 휴대폰 · 데스크톱 두 화면, 나머지는 휴대폰 화면으로 잰다(데스크톱에서만 보이는 요소는 홈에 몰려 있다).
 *
 * 실행: npm run qa:a11y                         # 모든 페이지 (22화면 · 약 8분)
 *       node scripts/qa_a11y.mjs / /en/ /projects/edith/   # 고친 쪽만 (화면당 약 20초)
 * 브라우저: CHROME_PATH (클라우드는 CHROME_PATH=$PWD/scripts/cloud_chromium.sh)
 */
import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, rmSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const OUT = "out";
const CHROME = process.env.CHROME_PATH ?? process.env.QA_BROWSER ?? "/opt/pw-browsers/chromium";
const PORT = 8900 + Math.floor(Math.random() * 90);
const BASE = "/kim-seonil-portfolio";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

if (!existsSync(join(OUT, "index.html"))) {
  console.error("out/ 이 없다 — 먼저 빌드해라 (npm run build:general)");
  process.exit(1);
}
if (!readFileSync(join(OUT, "index.html"), "utf8").includes(`${BASE}/_next/`)) {
  console.error("out/ 이 일반판이 아니다 — 이 검수는 일반판만 본다");
  process.exit(1);
}

function pages(dir = OUT, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) pages(p, acc);
    else if (n === "index.html") acc.push(`/${p.replace(/\\/g, "/").replace(`${OUT}/`, "").replace(/index\.html$/, "")}`);
  }
  return acc;
}
const asked = process.argv.slice(2).filter((a) => a.startsWith("/"));
const routes = (asked.length ? asked : pages().filter((r) => !r.startsWith("/_") && !r.startsWith("/404"))).sort();
const isHome = (r) => r === "/" || r === "/en/";
/* 홈은 인트로를 끈 주소로 잰다(health_check 와 같다) */
const targets = routes.flatMap((r) => (isHome(r) ? [["mobile", r], ["desktop", r]] : [["mobile", r]]));

const server = spawn(process.execPath, ["scripts/serve_export.mjs", "general", OUT, String(PORT)], { stdio: "ignore" });
await sleep(900);

function audit(form, route) {
  const json = join(tmpdir(), `a11y-${process.pid}-${Math.random().toString(36).slice(2)}.json`);
  const url = `http://127.0.0.1:${PORT}${BASE}${route}${isHome(route) ? "?intro=0" : ""}`;
  const args = ["-y", "lighthouse@12.8.2", url, "--quiet", "--output=json", `--output-path=${json}`,
    "--only-categories=accessibility", "--throttling-method=provided", "--chrome-flags=--headless=new --no-sandbox"];
  if (form === "desktop") args.push("--preset=desktop");
  const r = spawnSync("npx", args, { encoding: "utf8", env: { ...process.env, CHROME_PATH: CHROME }, timeout: 180000 });
  try {
    const d = JSON.parse(readFileSync(json, "utf8"));
    if (d.runtimeError || d.categories.accessibility.score == null) throw new Error(d.runtimeError?.code ?? "점수 없음");
    /* 가중치 0 인 항목(Lighthouse 가 점수에 넣지 않는 실험 규칙 — aria-allowed-role · label-content-name-mismatch 등)도 실패로 센다.
       점수는 100 이어도 실제 결함이었다(2026.11.17 — 사례 표지 링크 이름에 보이는 브랜드 이름이 없었다 · WCAG 2.5.3). */
    const failed = d.categories.accessibility.auditRefs
      .map((ref) => ({ ...d.audits[ref.id], weight: ref.weight }))
      .filter((a) => a.score != null && a.score < 1)
      .map((a) => ({
        id: a.id,
        title: a.title,
        scored: a.weight > 0,
        nodes: (a.details?.items ?? []).slice(0, 5).map((it) => ({
          selector: it.node?.selector ?? "",
          why: (it.node?.explanation ?? "").replace(/\s*\n\s*/g, " ").replace(/^Fix any of the following:\s*/, "").slice(0, 220),
        })),
      }));
    return { score: Math.round(d.categories.accessibility.score * 100), failed };
  } catch (e) {
    return { error: `${e.message} ${(r.stderr || "").split("\n").slice(-2).join(" ").slice(0, 160)}`.trim() };
  } finally {
    rmSync(json, { force: true });
  }
}

console.log(`=== 접근성 검수 · general · ${targets.length}화면 (Lighthouse 12.8.2 접근성) ===`);
let bad = 0;
try {
  for (const [form, route] of targets) {
    const res = audit(form, route);
    const name = `${form === "desktop" ? "데스크톱" : "휴대폰"} ${route}`;
    if (res.error) {
      bad += 1;
      console.log(`  ✗ ${name} — 못 쟀다: ${res.error}`);
    } else if (res.score < 100 || res.failed.length) {
      bad += 1;
      console.log(`  ✗ ${name} — ${res.score}`);
      for (const f of res.failed) {
        console.log(`      ${f.id}${f.scored ? "" : " (점수 밖)"}: ${f.title}`);
        for (const n of f.nodes) console.log(`        · ${n.selector}${n.why ? ` — ${n.why}` : ""}`);
      }
    } else {
      console.log(`  · ${name} — 100`);
    }
  }
} finally {
  server.kill();
}
console.log(bad ? `실패 ${bad}화면 — 걸린 항목을 고친 뒤 다시 빌드해서 재실행` : `통과 — ${targets.length}화면 모두 100 · 걸린 항목 0`);
process.exit(bad ? 1 : 0);
