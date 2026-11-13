/**
 * 사이트 밖 프로필 원문(JOB_PLATFORMS.md · LINKEDIN.md)을 사이트 빌드 결과와 대조한다 (2026.11.13).
 *
 * 이 두 문서는 사람이 다섯 곳(리멤버 · 사람인 · 잡코리아 · 원티드 · 링크드인)에 붙여 넣는 글이라 빌드에 들어가지 않는다.
 * 그래서 사이트가 바뀌어도 아무 검수에 걸리지 않고 낡는다 — EDIT H 문구는 문서만 고치고 붙여넣기 페이지는 그대로 둔 채
 * 일주일이 지났다(2026.11.06 → 11.13). 그 틈을 막는다.
 *
 *   node scripts/check_platform_copy.mjs               문서 ↔ 사이트(루트 빌드 결과). 실패가 있으면 종료 코드 1
 *   node scripts/check_platform_copy.mjs --fix-counts   칸 이름 옆 '(글자 수 / 한도)'의 글자 수를 실제 값으로 고친다
 *   node scripts/check_platform_copy.mjs --pages <구직 페이지.html> <링크드인 페이지.html>
 *                                                      올린 붙여넣기 페이지(Artifact read 로 받은 HTML)가 문서와 같은지
 *   node scripts/check_platform_copy.mjs --pages <구직 페이지.html> <링크드인 페이지.html> --stamp
 *                                                      위 확인에 실패가 없을 때만 문서 머리의 지문을 지금 원문으로 고친다(--pages 없이는 안 고친다)
 *   node scripts/check_platform_copy.mjs --release      출시 검수(qa_release.mjs)가 부르는 방식 — D 지문은 경고로만 남긴다.
 *                                                      페이지는 Claude 만 다시 올릴 수 있어서, 그것 때문에 사이트 출시가 막히면 안 된다
 *
 * 사이트 글자는 QA_EXPORT_ROOT(출시 검수가 넘기는 out/)가 있으면 거기서, 없으면 저장소 루트의 빌드 결과에서 읽는다.
 *
 * '붙여 넣는 글'은 문서의 ```text 블록 · `백틱` 값 · 표다(platform_docs.mjs). 설명 문단은 보지 않는다.
 *
 * 실패(고쳐야 한다)
 *   A 숫자   붙여 넣는 글의 숫자(단위 · 부호 포함)가 사이트 화면 글자에 없다. 사이트 전체에서 찾으므로, 틀린 숫자라도 다른 쪽에 같은
 *            숫자 · 단위가 있으면 통과한다(예: '40여 개') — 문장이 사이트와 달라진 것은 W2 가 알린다
 *   B 표기   경력 연수 · '전 HLL중앙' · 줄여 쓴 수상 이름 · 전화번호 · 포트폴리오 PDF 주소 · 구직 문구
 *   C 길이   칸 이름 옆에 적은 글자 수가 실제와 다르거나 한도를 넘는다
 *   D 지문   문서 머리에 적힌 지문이 지금 것과 다르다 — 문서 · 템플릿 · 만드는 규칙이 바뀌었는데 페이지를 다시 올리지 않았다.
 *            지문은 메모 없이 만든 두 페이지 전체의 해시다(build_paste_pages.mjs pageFingerprint). --release 에서는 경고
 *   E 페이지 (--pages) 올린 페이지가, 그 페이지의 메모로 지금 다시 만든 것과 글자 하나까지 같지 않다
 *            (빠진 칸 · 남는 칸 · 다른 탭으로 옮겨진 칸 · 바뀐 이름표 · 옛 템플릿). 페이지는 문서 순서대로 넘긴다
 * 경고(읽고 판단한다)
 *   W1 같은 줄이 두 곳에서 조금 다르다   W2 사이트 문장과 거의 같지만 다르다   W3 상투 표현
 */
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { PAGES, comparePublished, pageFingerprint } from "./build_paste_pages.mjs";
import { COUNT_RE, DOCS, ROOT, SOURCE, STAMP_RE, count, noUrls, numberTokens, parseDoc, plain, squash } from "./platform_docs.mjs";

const AWARD_FULL = "대한민국 디지털 광고 대상 통합 퍼포먼스 부문 우수상";
/* 문서에 글자 수를 적지 않았어도 지켜야 하는 한도 — 사람인 고객센터 '이력서 제목은 최대 100자' */
const KNOWN_LIMITS = [[/^이력서 제목/, 100]];

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const pagesAt = args.indexOf("--pages");
const pageFiles = pagesAt >= 0 ? args.slice(pagesAt + 1).filter((a) => !a.startsWith("--")) : [];

/* ── 사이트 화면 글자 (루트 빌드 결과) ─────────────────── */
function htmlFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    if (["source", "node_modules", ".git", ".github", ".claude", "_next"].includes(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) htmlFiles(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}
function visibleText(html) {
  /* 사진 설명(alt) · 버튼 이름(aria-label)도 화면에 실린 사실이다 */
  const attrs = [...html.matchAll(/\b(?:alt|aria-label|title|content)="([^"]*)"/g)].map((m) => m[1]).join(" \n ");
  const body = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<(?:br|\/p|\/li|\/div|\/h[1-6]|\/td|\/th|\/dd|\/dt|\/figcaption|\/summary)\b[^>]*>/g, " \n ")
    .replace(/<[^>]+>/g, " ");
  return plain(`${body} \n ${attrs}`);
}
const exported = process.env.QA_EXPORT_ROOT ? resolve(SOURCE, process.env.QA_EXPORT_ROOT) : "";
const SITE_ROOT = exported && existsSync(join(exported, "index.html")) ? exported : ROOT;
const site = { ko: "", en: "" };
const siteFiles = htmlFiles(SITE_ROOT);
for (const file of siteFiles) {
  const rel = relative(SITE_ROOT, file).replace(/\\/g, "/");
  site[rel.startsWith("en/") ? "en" : "ko"] += `\n${visibleText(readFileSync(file, "utf8"))}`;
}
if (!site.ko.includes("김선일")) {
  console.error(`${SITE_ROOT} 에 일반판 빌드 결과가 없다 — cd source && npm run publish:general 뒤에 다시 돌린다.`);
  process.exit(2);
}

/* ── 사이트의 숫자 — 숫자와 단위, 그리고 부호(platform_docs.mjs numberTokens) ── */
function tokenSets(text) {
  const sets = { any: new Set(), neg: new Set(), nonneg: new Set() };
  for (const t of numberTokens(text)) {
    sets.any.add(t.token);
    (t.sign === "-" ? sets.neg : sets.nonneg).add(t.token);
  }
  return sets;
}
const siteTokens = { ko: tokenSets(site.ko), en: tokenSets(site.en) };
/* 부호를 적은 숫자는 사이트에도 같은 쪽 부호로 있어야 한다: '−N' 은 '−N' 으로, '+N' 은 '+N' 이나 부호 없는 N 으로.
   부호 없이 적은 숫자는 어느 쪽으로 있든 된다('14.1% 줄였습니다'처럼 방향을 글로 쓸 수 있다).
   영문판의 숫자는 한국어판에도 있어야 하므로 영문 글은 두 쪽을 다 본다 */
const pick = (sets, t) => (t.sign === "-" ? sets.neg : t.sign === "+" ? sets.nonneg : sets.any).has(t.token);
const hasToken = (lang, t) => pick(siteTokens[lang], t) || (lang === "en" && pick(siteTokens.ko, t));
const hasOtherSign = (lang, t) => siteTokens[lang].any.has(t.token) || (lang === "en" && siteTokens.ko.any.has(t.token));

/* ── 문서 ──────────────────────────────────────────────── */
let docs = DOCS.map(parseDoc);

if (flag("--fix-counts")) {
  let fixed = 0;
  for (const d of docs) {
    const lines = readFileSync(d.file, "utf8").split("\n");
    for (const b of d.blocks) {
      if (b.kind !== "block" || b.limit == null) continue;
      const n = count(b.text);
      if (n === b.declared) continue;
      const i = b.labelLine - 1;
      lines[i] = lines[i].replace(COUNT_RE, ` (${n.toLocaleString("en-US")} / ${b.limit.toLocaleString("en-US")})`);
      fixed += 1;
    }
    writeFileSync(d.file, lines.join("\n"));
  }
  console.log(`글자 수 ${fixed}곳을 고쳤다.`);
  docs = DOCS.map(parseDoc);
}

const blocks = docs.flatMap((d) => d.blocks);
const pasteBlocks = blocks.filter((b) => b.kind === "block");
const langOf = (b) => (/[가-힣]/.test(b.text) ? "ko" : "en");
/* 다른 앱에 주는 요청문은 프로필에 실리는 글이 아니다 — 숫자 · 문장 대조에서 뺀다 */
const isPrompt = (b) => /^요청문/.test(b.label);

const fails = [];
const warns = [];
const where = (b) => `${b.doc}:${b.line} [${(b.label || b.section).replace(/\s+/g, " ").slice(0, 40)}]`;

/* ── A 숫자 ────────────────────────────────────────────── */
for (const b of blocks) {
  if (isPrompt(b)) continue;
  const lang = langOf(b);
  const seen = new Set();
  for (const t of numberTokens(b.text)) {
    const key = t.sign + t.token;
    if (seen.has(key) || hasToken(lang, t)) continue;
    seen.add(key);
    fails.push(`A 숫자  ${where(b)} — '${t.shown}' 이(가) 사이트 화면 글자에 없다${hasOtherSign(lang, t) ? " — 사이트에는 부호가 반대인 값만 있다" : ""}`);
  }
}

/* ── B 표기 ────────────────────────────────────────────── */
const BANNED = [
  [/경력\s*\d+\s*년|\d+\s*년\s*차(?!\s*개선)|\d+\s*년\s*(?:동안|간)(?![가-힣])|\d+\+?\s*years?\s+of\s+experience|\b\d+\s*yrs\b/i, "경력 연수"],
  [/전\s*HLL중앙|Ex-HLL/i, "'전 HLL중앙' 표기"],
  [/01[016789][- .]?\d{3,4}[- .]?\d{4}/, "전화번호"],
  [/kim-seonil-performance-marketing-portfolio\.pdf/, "포트폴리오 PDF 주소(헤드헌터에게만 공유한다)"],
  [/다음 역할에서|다음 팀을 찾|이직을 준비|구직 중입니다/, "구직 문구(재직 중)"],
];
for (const b of blocks) {
  for (const [re, name] of BANNED) {
    const m = b.text.match(re);
    if (m) fails.push(`B 표기  ${where(b)} — ${name}: '${m[0]}'`);
  }
  /* 수상 이름은 부문 · 등급까지. '대상'만 남으면 대상을 받은 것으로 읽힌다(같은 줄 안에 부문과 등급이 있어야 한다) */
  for (const line of b.text.split("\n")) {
    if (line.includes("디지털 광고 대상") && !line.includes("통합 퍼포먼스 부문 우수상")) {
      fails.push(`B 표기  ${where(b)} — 수상 이름에 부문 · 등급이 없다: '${squash(line).slice(0, 70)}' → '${AWARD_FULL}'`);
    }
    if (/Digital Advertising Awards/.test(line) && !/Excellence Award/.test(line)) {
      fails.push(`B 표기  ${where(b)} — 영문 수상에 등급(Excellence Award)이 없다: '${squash(line).slice(0, 70)}'`);
    }
  }
}

/* ── C 길이 ────────────────────────────────────────────── */
for (const b of pasteBlocks) {
  const n = count(b.text);
  if (b.limit != null) {
    if (b.declared !== n) fails.push(`C 길이  ${where(b)} — ${b.declared}자로 적혀 있는데 실제는 ${n}자다(--fix-counts)`);
    if (n > b.limit) fails.push(`C 길이  ${where(b)} — ${n}자, 한도 ${b.limit}자를 넘는다`);
  }
  for (const [re, limit] of KNOWN_LIMITS) {
    if (re.test(b.label) && n > limit) fails.push(`C 길이  ${where(b)} — ${n}자, 한도 ${limit}자를 넘는다`);
  }
}

/* ── W1 같은 줄이 두 곳에서 조금 다르다 ────────────────── */
const grams = (s) => {
  const t = squash(noUrls(s)).replace(/[\s·•—–\-,.()'"‘’“”]/g, "");
  const g = new Set();
  for (let i = 0; i < t.length - 1; i += 1) g.add(t.slice(i, i + 2));
  return g;
};
const similarity = (a, b) => {
  if (!a.size || !b.size) return 0;
  let both = 0;
  for (const x of a) if (b.has(x)) both += 1;
  return both / (a.size + b.size - both);
};
/* 줄 머리의 글머리표와 경력기술서의 '배경 — ' 같은 이름표는 떼고 견준다 */
const bare = (line) => squash(line.replace(/^\s*(?:[•·▸-]|\d+\.)\s*/, "").replace(/^(?:배경|역할|기여|성과)\s*—\s*/, ""));
const docLines = [];
for (const b of pasteBlocks) {
  if (isPrompt(b)) continue;
  for (const raw of b.text.split("\n")) {
    const line = bare(raw);
    if (count(noUrls(line)) >= 18) docLines.push({ b, line, g: grams(line) });
  }
}
const pairSeen = new Set();
for (let i = 0; i < docLines.length; i += 1) {
  for (let j = i + 1; j < docLines.length; j += 1) {
    const a = docLines[i];
    const c = docLines[j];
    if (a.line === c.line) continue;
    const s = similarity(a.g, c.g);
    if (s < 0.86) continue;
    const key = [a.line, c.line].sort().join("\u0001");
    if (pairSeen.has(key)) continue;
    pairSeen.add(key);
    warns.push(`W1 표기 흔들림 (${Math.round(s * 100)}%)\n     ${where(a.b)}  ${a.line}\n     ${where(c.b)}  ${c.line}`);
  }
}

/* ── W2 사이트 문장과 거의 같지만 다르다 ───────────────── */
const sentencesOf = (text) =>
  squash(text)
    .split(/(?<=[.!?。])\s+|\s{2,}/)
    .map((s) => s.trim())
    .filter((s) => count(noUrls(s)) >= 24 && count(s) <= 260);
const siteSentences = { ko: [...new Set(site.ko.split("\n").flatMap(sentencesOf))], en: [...new Set(site.en.split("\n").flatMap(sentencesOf))] };
const siteGrams = { ko: siteSentences.ko.map((s) => [s, grams(s)]), en: siteSentences.en.map((s) => [s, grams(s)]) };
const siteHas = { ko: squash(site.ko), en: squash(site.en) };
/* 사이트 첫 화면은 값 옆에 '우수상'만 쓰고 문서는 늘 다 쓴다 — 그 차이는 일부러 둔 것이다 */
const awardNeutral = (s) => s.replaceAll(AWARD_FULL, "대한민국 디지털 광고 대상 우수상");
const w2Seen = new Set();
for (const b of pasteBlocks) {
  if (isPrompt(b)) continue;
  const lang = langOf(b);
  for (const raw of b.text.split("\n").flatMap(sentencesOf)) {
    const s = awardNeutral(bare(raw));
    if (w2Seen.has(s) || siteHas[lang].includes(s)) continue;
    w2Seen.add(s);
    const g = grams(s);
    let best = 0;
    let bestText = "";
    for (const [t, tg] of siteGrams[lang]) {
      const v = similarity(g, tg);
      if (v > best) [best, bestText] = [v, t];
    }
    if (best >= 0.8 && best < 1) warns.push(`W2 사이트 문장과 비슷하지만 다르다 (${Math.round(best * 100)}%)\n     ${where(b)}  ${s}\n     사이트  ${bestText}`);
  }
}

/* ── W3 상투 표현 (qa_tone.mjs 의 T1 · T2 · T9 와 같은 낱말) ── */
const CLICHE = /(을|를)\s*통해|다양한|효과적인|효율적인|체계적인|전략적인|성공적인|혁신적인|최적의|성공적으로|훌륭히|완벽하게|탁월한|뛰어난|극대화|시너지|열정|에 있어서/;
for (const b of pasteBlocks) {
  if (isPrompt(b)) continue;
  for (const line of b.text.split("\n")) {
    const m = line.match(CLICHE);
    if (m) warns.push(`W3 상투 표현 '${m[0]}'\n     ${where(b)}  ${squash(line).slice(0, 110)}`);
  }
}

/* ── D 지문 — 문서가 바뀌면 붙여넣기 페이지도 다시 올린다 ─ */
const fingerprint = pageFingerprint(docs);
/* --stamp 는 지문을 지금 문서로 고친다. 올린 두 페이지를 --pages 로 같이 넘겨 문서와 같다고 확인됐을 때만, 그리고 다른 실패가 없을 때만
   고친다(맨 아래) — 확인 없이 지문만 고치면 낡은 페이지가 최신으로 보인다. */
const stamping = flag("--stamp");
{
  /* 출시 검수에서는 지문 문제를 모두 경고로만 남긴다 — 페이지를 다시 올리고 지문을 고치는 일은 Claude 세션만 할 수 있고,
     그것 때문에 사이트 출시가 막히면 안 된다(지문 줄이 빠진 것도 같다) */
  const stale = flag("--release") ? warns : fails;
  for (const d of docs) {
    const m = d.text.match(STAMP_RE);
    if (!m) stale.push(`D 지문  ${d.name} — 지문 줄이 없다. 머리말에 '<!-- 붙여넣기 페이지 지문: 없음 -->' 을 넣고 --pages <올린 두 페이지> --stamp`);
    else if (m[1] !== fingerprint && !stamping) {
      stale.push(`D 지문  ${d.name} — 문서 · 템플릿 · 만드는 규칙 가운데 바뀐 것이 있다(적힌 지문 ${m[1]} · 지금 ${fingerprint}). build_paste_pages.mjs 로 페이지를 만들어 다시 올리고 --pages <올린 두 페이지> --stamp`);
    }
  }
  if (stamping && pagesAt < 0) fails.push("D 지문  --stamp 는 --pages <올린 두 페이지> 와 같이 쓴다 — 올린 페이지가 지금 문서와 같은지 확인한 뒤에만 지문을 고친다");
}

/* ── E 올린 붙여넣기 페이지가 지금 만든 것과 같은가 ────── */
/* 받은 페이지에 든 주인 메모로 지금 문서 · 템플릿에서 다시 만들어, 그 결과가 받은 HTML 안에 글자 하나까지 그대로 있는지 본다
   (build_paste_pages.mjs comparePublished). 빠진 칸 · 남는 칸 · 다른 탭으로 옮겨진 칸 · 바뀐 이름표 · 옛 템플릿이 모두 걸린다. */
if (pagesAt >= 0 && pageFiles.length !== docs.length) {
  /* 파일을 하나도 안 넘긴 것도 여기서 막는다 — 확인한 것처럼 조용히 통과하면 안 된다 */
  fails.push(`E 페이지  --pages 에는 올린 페이지 ${docs.length}장을 문서 순서(${DOCS.join(" → ")})대로 넘긴다 — ${pageFiles.length}장을 받았다`);
} else if (pageFiles.length) {
  pageFiles.forEach((file, i) => {
    const d = docs[i];
    const name = file.split(/[\\/]/).pop();
    if (!existsSync(file)) {
      fails.push(`E 페이지  ${file} — 파일이 없다`);
      return;
    }
    const page = PAGES.find((x) => x.doc === d.name);
    const diffs = comparePublished(readFileSync(file, "utf8"), page, d, fingerprint, name);
    console.log(`페이지 ${name} ↔ ${d.name}: ${diffs.length ? `다르다(${diffs.length}곳)` : `같다 — 복사하는 칸 ${d.pasteFields.filter((f) => squash(f.text)).length}개`}`);
    for (const x of diffs) fails.push(`E 페이지  ${name}(${d.name}) — ${x}`);
  });
}

/* ── 보고 ──────────────────────────────────────────────── */
console.log(`프로필 원문 검사 — 붙여 넣는 칸 ${pasteBlocks.length}개 · 짧은 값과 표 ${blocks.length - pasteBlocks.length}개 · 사이트 ${siteFiles.length}쪽과 대조 · 지문 ${fingerprint}`);
if (warns.length && !flag("--quiet")) {
  console.log(`\n경고 ${warns.length}건 (읽고 판단)`);
  for (const w of warns) console.log(`  ${w}`);
} else if (warns.length) console.log(`경고 ${warns.length}건(--quiet 를 빼면 보인다)`);
if (fails.length) {
  console.log(`\n실패 ${fails.length}건`);
  for (const f of fails) console.log(`  ${f}`);
  if (stamping) console.log("\n지문은 고치지 않았다 — 위 실패를 먼저 없앤다.");
  process.exit(1);
}
console.log("\n실패 0건");
if (stamping) {
  for (const d of docs) writeFileSync(d.file, readFileSync(d.file, "utf8").replace(STAMP_RE, `<!-- 붙여넣기 페이지 지문: ${fingerprint} -->`));
  console.log(`올린 두 페이지가 지금 만든 것과 같다 — 문서의 지문을 ${fingerprint} 로 고쳤다.`);
}
