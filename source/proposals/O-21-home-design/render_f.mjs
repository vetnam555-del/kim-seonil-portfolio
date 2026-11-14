// 제안 F(힘 빼기) — 제안 E(사례 표지)를 얹은 지금 홈에서 글자와 색의 힘만 뺀다. 글 · 숫자 · 배치는 그대로다.
// f1 = 강조색은 지금의 빨강 그대로 · f2 = 강조색을 차분한 청록(지금 사이트의 --color-system)으로.
// 먼저 render_e.mjs 로 mock-e.html 을 만들어 둔다.
// Usage: node render_f.mjs <site dir> <base url> <out dir>
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");
const [, , siteDir, baseUrl, outDir] = process.argv;
mkdirSync(outDir, { recursive: true });
const soft = `
/* 1) 폭 넓고 굵은 영문 → 보통 폭 · 한 단계 가늘게 */
.folio-hero-title .folio-hero-display{font-stretch:100%;font-weight:800;letter-spacing:-.035em;line-height:1.04}
.folio-proofs .folio-proof-value,.loop-metric-value,.loop-stages b,.loop-panel-stage span,.folio-capindex-stage,.figure,.figure-live{font-stretch:100%}
.folio-proofs .folio-proof-value{font-weight:700;letter-spacing:-.03em}
.loop-metric-value{font-weight:700;letter-spacing:-.035em}
.loop-stages b{font-weight:700;font-size:34px;letter-spacing:-.03em}
.folio-case-metric{font-weight:700}
/* 2) 머리줄: 네모 칸 · 고정폭 글자 → 둥근 칸 · 본문 글자 */
.site-header .font-mono{font-family:var(--font-sans);letter-spacing:0}
.site-header a.border{border-radius:999px}
/* 3) 구간 바탕: 일하는 순서 · 자동화에 옅은 종이색 띠 */
.loop,#automation{background:#f8f6f1}
.loop{border-top:0}
/* 4) 제목: 조금 덜 굵게, 줄 사이를 넉넉히 */
.folio-h2,.loop-title,.folio-contact-title{letter-spacing:-.035em}
.folio-case-title,.loop-panel-line{font-weight:700}
.folio-hero-photo img{box-shadow:0 30px 60px -40px rgba(15,18,22,.42)}
`;
const teal = `:root{--color-signal:#1a6f6b;--color-signal-ink:#4fd1cd;--color-accent:#1a6f6b;--color-accent-hover:#145652;--color-up:#1a6f6b}.folio-hero-photo::before{background:radial-gradient(closest-side,rgba(26,111,107,.3),rgba(79,209,205,.12) 58%,transparent 74%)}`;
const base = readFileSync(join(siteDir, "mock-e.html"), "utf8");
writeFileSync(join(siteDir, "mock-f1.html"), base.replace("</head>", `<style id="f-css">${soft}</style></head>`));
writeFileSync(join(siteDir, "mock-f2.html"), base.replace("</head>", `<style id="f-css">${soft}${teal}</style></head>`));
const browser = await chromium.launch();
for (const [v, w, h, s] of [["now", 1440, 900, 1], ["f1", 1440, 900, 1], ["f2", 1440, 900, 1], ["now", 390, 844, 2], ["f1", 390, 844, 2], ["f2", 390, 844, 2]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: s, isMobile: w < 600, hasTouch: w < 600 });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  await p.goto(`${baseUrl}/mock-${v}.html`, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => null))));
  await p.waitForTimeout(400);
  await p.screenshot({ path: join(outDir, `${v}-first-${w}.png`) });
  const info = await p.evaluate(() => { const b = (q) => { const e = document.querySelector(q); return e ? Math.round(e.getBoundingClientRect().bottom) : null; }; return { total: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, vw: innerWidth, vh: innerHeight, proofs: b(".folio-proofs"), firstBtn: b(".folio-hero-actions a") }; });
  await p.screenshot({ path: join(outDir, `${v}-full-${w}.png`), fullPage: true });
  console.log(v, w, JSON.stringify(info), errs);
  await ctx.close();
}
await browser.close();
