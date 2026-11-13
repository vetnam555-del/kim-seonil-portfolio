// 보완안 C(또는 지금 화면)를 빌드 결과의 사본 위에서 끝까지 찍는다. C 는 지금 홈의 마크업을 그대로 두고 스타일과 배치만 바꾼다.
// 스크립트를 뺀 index.html 에 C 의 스타일과 augment() 한 번을 넣어 mock-c.html 로 쓴다(브라우저로 바로 열 수 있다).
// Usage: node render_c.mjs <site dir> <base url> <out dir> <c|now> [width=1440] [height=900] [scale=1]
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

let chromium = null;
try { ({ chromium } = createRequire(import.meta.url)("playwright")); } catch { /* HTML 만 */ }
const [, , siteDir, baseUrl, outDir, variant, W = "1440", H = "900", SCALE = "1"] = process.argv;
mkdirSync(outDir, { recursive: true });

let h = readFileSync(join(siteDir, "index.html"), "utf8");
h = h.replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/<link[^>]+as="script"[^>]*>/g, "");
h = h.replace(/<\/?noscript>/g, "");                                   // 글꼴 선언은 <noscript> 안에 있다
h = h.replace(/loading="lazy"/g, 'loading="eager"').replace(/decoding="async"/g, 'decoding="sync"');

let css = `
.intro, .scroll-progress, [data-testid="scroll-progress"] { display: none !important; }
.site-header { position: absolute !important; }
.folio > * { content-visibility: visible !important; }
.count-up-visual { display: none !important; } .count-up-measure { visibility: visible !important; }
*, *::before, *::after { animation: none !important; transition: none !important; }
`;
let tail = "";
if (variant === "c") {
  const mod = await import("./variant_c.mjs");
  css += mod.css;
  tail = `<script>(${mod.augment.toString()})();</script>`;
}
h = h.replace("</head>", `<style id="mock">${css}</style></head>`).replace("</body>", `${tail}</body>`);
const name = `mock-${variant}.html`;
writeFileSync(join(siteDir, name), h);
if (!chromium) { console.log(JSON.stringify({ html: join(siteDir, name), open: `${baseUrl}/${name}` })); process.exit(0); }

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: +SCALE, reducedMotion: "reduce", isMobile: +W < 600, hasTouch: +W < 600 });
const p = await ctx.newPage();
const failed = []; const errors = [];
p.on("requestfailed", (r) => failed.push(r.url()));
p.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
await p.goto(`${baseUrl}/${name}`, { waitUntil: "load", timeout: 30000 });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => Promise.race([
  Promise.all([...document.images].map((im) => (im.complete ? null : new Promise((res) => { im.onload = im.onerror = res; })))),
  new Promise((res) => setTimeout(res, 8000)),
]));
await p.waitForTimeout(400);
const info = await p.evaluate(() => {
  const r = (sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), h: Math.round(b.height) }; };
  // 화면 밖으로 넘치는 요소(가로)
  const vw = document.documentElement.clientWidth;
  const out = [...document.querySelectorAll("main *")].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && (b.right > vw + 1 || b.left < -1); })
    .slice(0, 10).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} ${Math.round(el.getBoundingClientRect().left)}–${Math.round(el.getBoundingClientRect().right)}`);
  return { total: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, vw,
    hero: r("#hero"), career: r("#career") || r("#hero .folio-career"), loop: r("#capabilities"), work: r("#projects"), more: r(".folio-more"), auto: r("#automation"), contact: r("#contact"), out };
});
const file = join(outDir, `${variant}-${W}.png`);
await p.screenshot({ path: file, fullPage: true });
const report = JSON.stringify({ file, ...info, failed: failed.slice(0, 8), errors }, null, 1);
writeFileSync(join(outDir, `${variant}-${W}.json`), report);
console.log(report);
await browser.close();
