/**
 * 제출 전 최종 검수 — 합격 기준을 코드로 고정한다.
 *
 * 이 사이트에서 반복해서 났던 사고는 두 종류였다.
 *   (1) 데이터에는 썼는데 화면에는 안 그려지는 것 (expertise 배열, archive 등급의 execution·evidence)
 *   (2) 타입 검사와 배포 검증을 모두 통과한 채 잘못된 문구가 배포되는 것 (오타 '캐페인', 절대값 누락)
 * 그래서 이 검사는 소스가 아니라 **빌드 산출물의 렌더 텍스트**를 기준으로 본다.
 *
 * 사용: node scripts/qa_final.mjs [edition]   (기본 general — out/ 이 그 판으로 빌드돼 있어야 한다)
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "out");
const EVID = join(ROOT, "public", "evidence");
const edition = process.argv[2] || "general";

const failures = [];
const notes = [];
const fail = (code, msg) => failures.push(`${code}  ${msg}`);
const note = (msg) => notes.push(msg);

/* ── 유틸 ─────────────────────────────────────────────── */

const ENT = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", "#x27": "'", "#39": "'", "#x2F": "/" };
function htmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&(#x?[0-9a-fA-F]+|\w+);/g, (m, k) => {
      if (ENT[k] !== undefined) return ENT[k];
      if (k[0] === "#") {
        const n = k[1] === "x" || k[1] === "X" ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10);
        return Number.isFinite(n) ? String.fromCodePoint(n) : m;
      }
      return m;
    })
    .replace(/\s+/g, " ")
    .trim();
}
const norm = (s) => s.replace(/\s+/g, " ").trim();

/** 이미지 실제 픽셀 폭·높이 (webp / png / jpeg) */
function imageSize(path) {
  const b = readFileSync(path);
  if (b.slice(0, 4).toString("ascii") === "RIFF" && b.slice(8, 12).toString("ascii") === "WEBP") {
    const fmt = b.slice(12, 16).toString("ascii");
    if (fmt === "VP8X") return { w: 1 + b.readUIntLE(24, 3), h: 1 + b.readUIntLE(27, 3) };
    if (fmt === "VP8 ") return { w: b.readUInt16LE(26) & 0x3fff, h: b.readUInt16LE(28) & 0x3fff };
    if (fmt === "VP8L") {
      const bits = b.readUInt32LE(21);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
  }
  if (b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    let i = 2;
    while (i < b.length) {
      if (b[i] !== 0xff) { i++; continue; }
      const m = b[i + 1];
      if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc)
        return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

/** projects.ts 를 케이스 블록으로 쪼갠다 (정규식 기반 — 타입 로딩 없이 소스 사실만 본다) */
function parseCases() {
  const src = readFileSync(join(ROOT, "src", "data", "projects.ts"), "utf8");
  /*
   * 들여쓰기를 4칸으로 못 박았더니 조건부 스프레드 안에 있는 케이스를 통째로 놓쳤다 —
   * 신세계판 전용 samsonite 는 `...(edition.showWhyShinsegae ? [ { slug: ... ` 안에 있어
   * 8칸이고, 그래서 그 판의 대표 케이스가 한 번도 검사되지 않았다(증빙 0장이었다).
   * 들여쓰기와 무관하게 잡는다.
   */
  const marks = [...src.matchAll(/\n\s{4,}slug: "([\w-]+)",/g)];
  return marks.map((m, i) => {
    const start = m.index;
    const end = i + 1 < marks.length ? marks[i + 1].index : src.length;
    const body = src.slice(start, end);
    /* 들여쓰기 폭을 고정하면 조건부 스프레드 안의 케이스를 못 읽는다 (samsonite 는 12칸) */
    const one = (k) => {
      const r = new RegExp(`\\n\\s{4,}${k}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`);
      const mm = body.match(r);
      return mm ? mm[1].replace(/\\"/g, '"').replace(/\\n/g, " ") : null;
    };
    const evBlockStart = body.indexOf("evidence: [");
    const evBlock = evBlockStart < 0 ? "" : body.slice(evBlockStart);
    const evidence = [...evBlock.matchAll(/\{\s*(?:\/\*[\s\S]*?\*\/\s*)?file: "([^"]+)"([\s\S]*?)\n\s{8}\}/g)].map((e) => {
      const inner = e[2];
      const g = (k) => {
        const mm = inner.match(new RegExp(`${k}:\\s*\\n?\\s*"((?:[^"\\\\]|\\\\.)*)"`));
        return mm ? mm[1].replace(/\\"/g, '"') : null;
      };
      return { file: e[1], file960: g("file960"), video: g("video"), alt: g("alt"), caption: g("caption"), href: g("href") };
    });
    const listOf = (k) => {
      const s = body.indexOf(`${k}: [`);
      if (s < 0) return [];
      /* 닫는 괄호의 들여쓰기도 케이스마다 다르다 — 폭을 고정하지 않고 첫 `],` 를 찾는다 */
      const close = body.slice(s).search(/\n\s+\],/);
      const seg = close < 0 ? body.slice(s) : body.slice(s, s + close);
      return [...seg.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((x) => x[1].replace(/\\"/g, '"'));
    };
    return {
      slug: m[1],
      brand: one("brand"),
      tier: one("tier"),
      period: one("period"),
      source: one("source"),
      learnings: one("learnings"),
      contribution: one("contribution"),
      evidence,
      execution: listOf("execution"),
      body,
    };
  });
}

/* ── 검사 ─────────────────────────────────────────────── */

if (!existsSync(OUT)) {
  console.error("out/ 가 없다. 먼저 npm run build:" + edition);
  process.exit(2);
}

const cases = parseCases();
note(`케이스 ${cases.length}건 · 판 ${edition}`);

/*
 * 케이스 중에는 특정 판에만 나오는 것이 있다 (신세계판 전용 samsonite).
 * projects.ts 는 판과 무관하게 전부 담고 있으므로, 이 빌드에 페이지가 없는 케이스는
 * 결함이 아니라 "이 판에 없음"이다 — 검사 대상에서 뺀다.
 */
const activeCases = cases.filter((c) => existsSync(join(OUT, "projects", c.slug, "index.html")));
const absent = cases.filter((c) => !activeCases.includes(c));
if (absent.length) note(`이 판에 없는 케이스 ${absent.length}건: ${absent.map((c) => c.slug).join(", ")}`);

const pageText = new Map();
for (const c of activeCases) {
  pageText.set(c.slug, htmlToText(readFileSync(join(OUT, "projects", c.slug, "index.html"), "utf8")));
}

/* G7 · 케이스마다 증빙이 최소 1장 */
for (const c of activeCases) {
  if (c.evidence.length === 0) fail("G7", `${c.slug}(${c.brand}) 증빙 0장`);
}

/* G1 · 증빙 자산 존재 + G5 alt/caption + G12 폭 */
const seen = new Map();
for (const c of activeCases) {
  for (const e of c.evidence) {
    /* 영상 증빙은 file 이 포스터, video 가 mp4 다 — 둘 다 있어야 화면이 성립한다 */
    for (const f of [e.file, e.file960, e.video].filter(Boolean)) {
      if (!existsSync(join(EVID, f))) fail("G1", `${c.slug} · public/evidence/${f} 없음`);
      else if (!existsSync(join(OUT, "evidence", f))) fail("G1", `${c.slug} · out/evidence/${f} 없음 (빌드 누락)`);
    }
    if (!e.alt || e.alt.length < 10) fail("G5", `${c.slug} · ${e.file} alt 없음/너무 짧음`);
    if (!e.caption || e.caption.length < 20) fail("G5", `${c.slug} · ${e.file} caption 없음/너무 짧음`);
    /* G6 · 같은 파일을 두 케이스가 나눠 쓰지 않는다 */
    if (seen.has(e.file)) fail("G6", `${e.file} 중복 사용 — ${seen.get(e.file)} / ${c.slug}`);
    else seen.set(e.file, c.slug);
    /* G12 · 1x(960) 이 실제로 960 폭인지 */
    if (e.file960 && existsSync(join(EVID, e.file960))) {
      const sz = imageSize(join(EVID, e.file960));
      if (sz && sz.w !== 960) fail("G12", `${e.file960} 폭 ${sz.w} — 960 이어야 한다`);
    }
    /* G14 · -960 파일이 디스크에 있는데 file960 을 선언하지 않으면 모바일에 원본이 나간다 */
    if (!e.file960 && !e.video) {
      const cand = e.file.replace(/(\.\w+)$/, "-960$1");
      if (existsSync(join(EVID, cand))) fail("G14", `${c.slug} · ${cand} 이 있는데 file960 미선언`);
    }
    /* 2x 는 1x 보다 넓어야 한다 */
    if (e.file960 && existsSync(join(EVID, e.file)) && existsSync(join(EVID, e.file960))) {
      const a = imageSize(join(EVID, e.file)), b = imageSize(join(EVID, e.file960));
      if (a && b && a.w <= b.w) fail("G12", `${e.file} (${a.w}) 가 ${e.file960} (${b.w}) 보다 넓지 않다`);
    }
  }
}

/* G2 · 증빙이 실제로 그 페이지에 그려지는가 (데이터에만 있고 렌더 안 되는 사고 방지) */
for (const c of activeCases) {
  const p = join(OUT, "projects", c.slug, "index.html");
  if (!existsSync(p)) { fail("G2", `${c.slug} 페이지 없음`); continue; }
  const html = readFileSync(p, "utf8");
  for (const e of c.evidence) {
    if (!html.includes(`evidence/${e.file}`)) fail("G2", `${c.slug} · ${e.file} 이 페이지에 렌더되지 않음`);
    if (e.video && !html.includes(`evidence/${e.video}`)) fail("G2", `${c.slug} · ${e.video} 이 페이지에 렌더되지 않음`);
  }
}

/* G3 · 서술 필드가 화면에 실제로 나오는가 */
for (const c of activeCases) {
  const t = pageText.get(c.slug);
  if (!t) continue;
  const probe = (label, str) => {
    if (!str) return;
    const s = norm(str);
    const head = s.slice(0, 40);
    if (!t.includes(head)) fail("G3", `${c.slug} · ${label} 이 화면에 없음 — "${head}…"`);
  };
  probe("source", c.source);
  probe("learnings", c.learnings);
  probe("contribution", c.contribution);
  c.execution.forEach((x, i) => probe(`execution[${i}]`, x));
  c.evidence.forEach((e) => probe(`caption(${e.file})`, e.caption));
}

/* G4 · 성과 절대값 금지
 *
 * 이 사이트는 "전환매출·광고비·건수 같은 절대값은 싣지 않고 비율만 쓴다"를 규칙으로 둔다
 * (다이슨 유튜브 구독전환 캠페인만 사용자 지정 예외).
 * 광고 소재 카피에 들어간 할인가·쿠폰액은 광고주가 공개한 판촉 문구라 규칙 대상이 아니므로
 * 문맥으로 걸러 낸다. 단가 지표(CPC·CPM·CPA·객단가)도 비율성 지표라 허용한다.
 */
const MONEY = [
  /(전환매출액?|광고매출|주문금액|광고비|집행비|매출)\s*(약\s*)?[0-9]{1,3}(,[0-9]{3})+\s*원?/,
  /[0-9]{1,3}(,[0-9]{3})+\s*원/,
  /[0-9]{1,3}(,[0-9]{3})+\s*건/,
  /*
   * 위 패턴은 쉼표가 있는 숫자만 본다. 강원심층수 "리타겟팅 전환 911건" 이 그래서
   * 통과했다 — 네 자리 미만이라 쉼표가 없다. 성과 명사가 바로 앞에 붙은 건수는
   * 자릿수와 무관하게 잡는다. "처리 84건" "변경 0건" "설계안 4건" 처럼 성과가 아닌
   * 건수까지 걸리면 안 되므로, 명사를 붙여 쓴 것만 본다.
   */
  /(전환|구매|주문|리드|상담|가입|설치|결제|매출)\s*(수)?\s*(약\s*)?[0-9][0-9,]*\s*건/,
  /[0-9]+(\.[0-9]+)?\s*억/,
  /₩\s?[0-9]{1,3}(,[0-9]{3})+/,
];
const MONEY_ALLOW = [
  /할인/, /쿠폰/, /특가/, /최저가/, /적립/, /상품권/, /캐시백/, /증정/, /혜택/, /페이백/,
  /객단가/, /CPC/, /CPM/, /CPA/, /CPI/, /CPO/, /입찰/, /단가/,
  /월\s*10억\+/, /운영\s*규모/, /집행\s*규모/, /소재\s*[0-9]/, /행\s*·/, /원본\s*기준/,
  /* 사용자 지정 예외 — 다이슨 유튜브 구독전환 캠페인의 구독 전환 건수는 싣기로 했다.
     케이스 페이지뿐 아니라 홈·이력서에도 같은 수치가 나오므로 페이지가 아니라 문맥으로 판단한다. */
  /구독\s*전환/, /유료\s*구독/,
];
const pages = [
  ["home", join(OUT, "index.html")],
  /* 2026.09.24 공용판은 옛 홈의 깊은 층이 /about/ 에 있다 — 금액·중복 검사를 같이 받는다 */
  ["about", join(OUT, "about", "index.html")],
  ["resume", join(OUT, "resume", "index.html")],
  ...activeCases.map((c) => [c.slug, join(OUT, "projects", c.slug, "index.html")]),
];
for (const [name, p] of pages) {
  if (!existsSync(p) || name === "dyson") continue;
  const t = name === "home" || name === "about" || name === "resume" ? htmlToText(readFileSync(p, "utf8")) : pageText.get(name);
  if (!t) continue;
  for (const re of MONEY) {
    const g = new RegExp(re.source, "g");
    let m;
    while ((m = g.exec(t))) {
      const ctx = t.slice(Math.max(0, m.index - 45), m.index + m[0].length + 35);
      if (MONEY_ALLOW.some((a) => a.test(ctx))) continue;
      /* 다음 프로젝트 내비게이션에 실린 다른 케이스 문구는 그 케이스에서 잡는다 */
      if (/다음 프로젝트/.test(t.slice(Math.max(0, m.index - 220), m.index))) continue;
      fail("G4", `${name} · 성과 절대값 — "${norm(ctx)}"`);
    }
  }
}

/* G9 · 빌드 산출물의 로컬 자산 참조가 전부 실재하는가 */
function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (f.endsWith(".html")) out.push(p);
  }
  return out;
}
/* basePath 는 판마다 다르다 — 하드코딩하지 않고 산출물에서 읽는다 */
const homeHtml = readFileSync(join(OUT, "index.html"), "utf8");
const bpMatch = homeHtml.match(/(?:src|href)="(\/kim-seonil-portfolio[\w-]*)\/_next\//);
const basePath = bpMatch ? bpMatch[1] : "/kim-seonil-portfolio";
note(`basePath ${basePath}`);
const expectBase = edition === "nw" ? "/kim-seonil-portfolio_new"
  : edition === "v260908" ? "/kim-seonil-portfolio_260908"
  : edition === "general" ? "/kim-seonil-portfolio"
  : edition === "hll"
      ? "/kim-seonil-portfolio_HLL"
      : edition === "ably"
        ? "/kim-seonil-portfolio_ABLY"
        : "/kim-seonil-portfolio_shinsegae";
if (basePath !== expectBase) fail("G0", `out/ 은 ${basePath} 판인데 ${edition} 으로 검사를 요청했다 — 먼저 npm run build:${edition}`);
let refCount = 0;
const missing = new Set();
for (const p of walk(OUT)) {
  const html = readFileSync(p, "utf8");
  for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) {
    const u = m[1];
    if (!u.startsWith(basePath)) continue;
    const rel = u.slice(basePath.length).split(/[?#]/)[0];
    if (!rel || rel.endsWith("/")) continue;
    refCount++;
    if (!existsSync(join(OUT, rel))) missing.add(rel);
  }
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(",")) {
      const u = part.trim().split(/\s+/)[0];
      if (!u.startsWith(basePath)) continue;
      refCount++;
      const rel = u.slice(basePath.length);
      if (!existsSync(join(OUT, rel))) missing.add(rel);
    }
  }
}
for (const r of missing) fail("G9", `깨진 자산 참조 ${r}`);
note(`로컬 자산 참조 ${refCount}건 검사`);

/* G10 · 고아 증빙 (public/evidence 에 있는데 아무 케이스도 안 쓰는 파일) */
const used = new Set();
for (const c of activeCases) for (const e of c.evidence) { used.add(e.file); if (e.file960) used.add(e.file960); if (e.video) used.add(e.video); }
const home = readFileSync(join(OUT, "index.html"), "utf8");
const orphans = readdirSync(EVID).filter((f) => !used.has(f) && !home.includes(`evidence/${f}`));
if (orphans.length) note(`케이스 미사용 증빙 ${orphans.length}건 (홈 전용이거나 사용 안 함): ${orphans.join(", ")}`);

/* G15 · 같은 문장이 사이트 안에서 반복되지 않는가
 *
 * 예전에 역할 목록이 세 곳에 똑같이 실려 있었는데, 구조만 훑어서는 못 잡고
 * 페이지를 읽어야 보였다. 문장 단위로 세어 자동으로 잡는다.
 */
{
  /* 헤더·푸터·내비는 모든 페이지에 같은 문장이 나오도록 만든 공통 요소다.
     본문(main)만 떼어 내고, 그 안의 내비(사례 흐름·다음 프로젝트)도 뺀다. */
  const mainText = (html) => {
    const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    const body = (m ? m[1] : html).replace(/<nav[\s\S]*?<\/nav>/g, " ");
    return htmlToText(body);
  };
  /* 컴포넌트가 붙이는 안내문은 요소마다 반복되는 것이 정상이다 (카피 중복이 아니다) */
  const CHROME = [/모바일에서는 좌우로 밀어/, /집계 범위와 원자료 출처 보기/, /공개 자료는 실제 운영·집행 맥락/];
  const counts = new Map();
  for (const [name, p] of pages) {
    if (!existsSync(p)) continue;
    const t = mainText(readFileSync(p, "utf8"));
    const seenHere = new Set();
    for (const raw of t.split(/(?<=[.!?])\s+|\s{2,}/)) {
      const s = norm(raw);
      if (s.length < 25) continue;
      if (CHROME.some((c) => c.test(s))) continue;
      if (seenHere.has(s)) continue;
      seenHere.add(s);
      counts.set(s, (counts.get(s) || 0) + 1);
    }
  }
  /* 케이스 카드는 홈·상세에 같은 문장이 나오도록 설계된 것이라 2회까지는 정상으로 본다 */
  for (const [s, n] of counts) if (n >= 3) fail("G15", `같은 문장이 ${n}개 페이지에 반복 — "${s.slice(0, 60)}…"`);
}

/* G17 · tldr 과 overview 가 같은 말을 하지 않는가
 *
 * 아카이브 등급은 문제 정의·데이터 분석 블록을 그리지 않아서, 두 문장이 겹치면
 * 짧은 페이지에서 같은 문장이 네 번 반복되는 것처럼 읽힌다 (한샘·KT알파에서 실제로 그랬다).
 */
{
  const ratio = (a, b) => {
    /* 문자 2-그램 자카드 — 한국어 조사 변화에 덜 민감하다 */
    const grams = (s) => { const g = new Set(); const t = s.replace(/\s+/g, ""); for (let i = 0; i < t.length - 1; i++) g.add(t.slice(i, i + 2)); return g; };
    const A = grams(a), B = grams(b);
    let inter = 0; for (const x of A) if (B.has(x)) inter++;
    return inter / (A.size + B.size - inter || 1);
  };
  const src = readFileSync(join(ROOT, "src", "data", "projects.ts"), "utf8");
  for (const c of activeCases) {
    const f = (k) => { const m = c.body.match(new RegExp(k + ':\\s*\\n?\\s*"([^"]*)"')); return m ? m[1] : null; };
    const t = f("tldr"), o = f("overview");
    if (!t || !o) continue;
    const r = ratio(t, o);
    if (r > 0.5) fail("G17", `${c.slug} · tldr 과 overview 가 ${(r * 100).toFixed(0)}% 겹침`);
  }
  void src;
}

/* G18 · 문장 뒤에 줄표를 붙여 부연하는 버릇
 *
 * "~습니다 — 부연" 은 LLM 이 쓰는 대표적인 리듬이다. 한국어 기획서에서 흔한
 * "항목명 — 세부" 목록 표기는 정상이므로, 문장 종결 뒤에 오는 것만 센다.
 * 페이지당 2건까지는 강조로 보고, 그 이상이면 버릇으로 본다.
 */
{
  for (const [name, p] of pages) {
    if (!existsSync(p)) continue;
    const t = htmlToText(readFileSync(p, "utf8"));
    const n = (t.match(/(?:니다|입니다|었다|한다)\s*—/g) || []).length;
    if (n > 2) fail("G18", `${name} · 문장 뒤 줄표 부연 ${n}건 (2건까지)`);
  }
}

/* G19 · 인접한 문단이 같은 어구로 시작하지 않는가
 *
 * 첫 화면에서 두 문단이 "산업디자인과 창업…" 으로 연달아 시작한 적이 있다.
 * 사람은 이걸 분량으로 느끼는데 구조 검사로는 잡히지 않아 규칙으로 넣는다.
 * 화면용(no-print)과 인쇄용(print-only)은 동시에 보이지 않으므로 인쇄용은 뺀다.
 */
{
  for (const [name, p] of pages) {
    if (!existsSync(p)) continue;
    let html = readFileSync(p, "utf8");
    html = html.replace(/<[^>]*class="[^"]*print-only[^"]*"[\s\S]*?<\/[a-z]+>/g, " ");
    const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    let b = (m ? m[1] : html).replace(/<span class="sr-only">[\s\S]*?<\/span>/g, " ");
    b = b.replace(/<\/(p|h1|h2|h3|li|figcaption|blockquote)>/g, "\n");
    const blocks = htmlToText(b).split("\n").map(norm).filter((x) => x.length > 25);
    for (let i = 0; i < blocks.length - 1; i++) {
      const a = blocks[i], c = blocks[i + 1];
      let k = 0;
      while (k < Math.min(a.length, c.length, 22) && a[k] === c[k]) k++;
      if (k >= 8) fail("G19", `${name} · 인접 문단이 "${a.slice(0, k)}" 로 함께 시작`);
      /* 앞머리가 달라도 같은 사실을 두 번 말하면 읽는 쪽은 분량으로 느낀다.
         뉴발란스의 '문제'와 '데이터에서 확인한 것' 이 실제로 그랬다. */
      if (a.length > 60 && c.length > 60) {
        const gram = (x) => { const g = new Set(); const t2 = x.replace(/\s+/g, ""); for (let j = 0; j < t2.length - 1; j++) g.add(t2.slice(j, j + 2)); return g; };
        const A = gram(a), C = gram(c);
        let inter = 0; for (const x of A) if (C.has(x)) inter++;
        const r = inter / (A.size + C.size - inter || 1);
        if (r > 0.42) fail("G19", `${name} · 인접 문단이 ${(r * 100).toFixed(0)}% 겹침 — "${a.slice(0, 44)}…"`);
      }
    }
  }
}

/* G20 · 지나치게 긴 문장
 *
 * 절대값을 지우고 다른 말로 바꾸다가 뒤 조사가 남아 문장이 깨진 적이 있다
 * ("전환매출 절대값은 비공개은 같은 표의 …"). 타입 검사도 문구 가드도 못 잡는다.
 * 문장이 길어지면 그런 파손이 눈에 안 띄므로, 긴 문장을 매번 표면에 올려 사람이 읽게 한다.
 * 실패가 아니라 경고다 — 근거·산정 기준 문단은 길 수밖에 없는 자리가 있다.
 */
{
  const long = [];
  for (const [name, p] of pages) {
    if (!existsSync(p)) continue;
    const html = readFileSync(p, "utf8");
    const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    const body = (m ? m[1] : html).replace(/<script[\s\S]*?<\/script>/g, " ");
    for (const para of body.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/g)) {
      const t = htmlToText(para[1]);
      for (const sent of t.split(/(?<=다\.)\s+/)) {
        const s2 = norm(sent);
        if (s2.length >= 160) long.push(`${name} · ${s2.length}자 — "${s2.slice(0, 50)}…"`);
      }
    }
  }
  const uniq = [...new Set(long)];
  if (uniq.length) note(`160자 넘는 문장 ${uniq.length}건 (읽어서 확인): ${uniq.slice(0, 4).join(" / ")}`);
}

/* G16 · 외부 링크 생존 */
{
  const urls = new Set();
  for (const p of walk(OUT)) {
    for (const m of readFileSync(p, "utf8").matchAll(/href="(https?:\/\/[^"]+)"/g)) urls.add(m[1]);
  }
  note(`외부 링크 ${urls.size}건 확인`);
  /* 언론사 서버는 기본 fetch 를 봇으로 보고 끊는다 — 실제로 국민일보 기사 링크가
     살아 있는데 죽은 것으로 잡혔다. 브라우저와 같은 헤더로 요청하고 한 번 더 시도한다. */
  const HEADERS = {
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "ko-KR,ko;q=0.9,en;q=0.8",
  };
  const tryOnce = async (u) => {
    const ac = new AbortController();
    const t = setTimeout(() => ac.abort(), 15000);
    try {
      const r = await fetch(u, { redirect: "follow", signal: ac.signal, headers: HEADERS });
      return r;
    } finally {
      clearTimeout(t);
    }
  };
  const results = await Promise.all(
    [...urls].map(async (u) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        try {
          const r = await tryOnce(u);
          /* LinkedIn 은 봇에 999 를 준다 — 죽은 링크가 아니라 차단 응답이다 */
          if (r.status === 999 && /linkedin\.com/.test(u)) return null;
          if (r.ok) return null;
          if (attempt === 1) return { hard: `${u} → ${r.status}` };
        } catch (e) {
          /*
           * 연결 단계에서 끊긴 것은 "죽은 링크"와 구분되지 않는다. 실제로 국민일보 기사는
           * 브라우저와 curl 로는 200 인데 Node fetch 만 TLS 협상에서 끊긴다.
           * 상태 코드가 돌아온 것만 실패로 보고, 전송 실패는 경고로 남겨 사람이 확인하게 한다.
           */
          if (attempt === 1) return { soft: `${u} → ${e.name === "AbortError" ? "응답 없음" : "연결 실패"}` };
        }
      }
      return null;
    })
  );
  const soft = [];
  for (const r of results) {
    if (!r) continue;
    if (r.hard) fail("G16", `외부 링크 ${r.hard}`);
    else soft.push(r.soft);
  }
  if (soft.length) note(`외부 링크 확인 불가 ${soft.length}건 (브라우저로 직접 확인 필요): ${soft.join(", ")}`);
}

/* ── 출력 ─────────────────────────────────────────────── */
console.log("\n=== 최종 검수 · " + edition + " ===");
for (const n of notes) console.log("  · " + n);
console.log("");
for (const c of activeCases) {
  const t = pageText.get(c.slug) || "";
  console.log(`  ${(c.brand || c.slug).padEnd(16)} ${String(c.tier).padEnd(10)} 증빙 ${String(c.evidence.length).padStart(2)} · 본문 ${String(t.length).padStart(5)}자`);
}
console.log("");
if (failures.length === 0) {
  console.log(`통과 — 위반 0건 (기준 G0·G1·G2·G3·G4·G5·G6·G7·G9·G12·G14·G15·G16·G17·G18·G19·G20)`);
  process.exit(0);
}
console.log(`실패 ${failures.length}건:`);
for (const f of failures) console.log("  ✗ " + f);
process.exit(1);
