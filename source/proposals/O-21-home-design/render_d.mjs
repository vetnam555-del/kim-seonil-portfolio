// 제안 D 를 만든다: content.json → mock-d.html(로컬 서버용) → 화면 그림.
// content.json 은 extract.mjs 가 만든 것을 사이트 사본 옆(<site dir>/../content.json)에서 읽는다.
// Usage: node render_d.mjs <site dir> <base url> <out dir> [width=1440] [height=900] [scale=1] [--first]   (--first: 첫 화면 한 장만 찍고 결과 칸 · 첫 버튼의 아래 끝을 잰다)
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { build } from "./variant_d.mjs";

const { chromium } = createRequire(import.meta.url)("playwright");
const args = process.argv.slice(2).filter((a) => !a.startsWith("--"));
const [siteDir, baseUrl, outDir, W = "1440", H = "900", SCALE = "1"] = args;
const FIRST = process.argv.includes("--first");
mkdirSync(outDir, { recursive: true });
const d = JSON.parse(readFileSync(join(siteDir, "..", "content.json"), "utf8"));
writeFileSync(join(siteDir, "mock-d.html"), build(d));

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: +SCALE, isMobile: +W < 600, hasTouch: +W < 600 });
await ctx.addInitScript(() => { window.__capture = true; });
const p = await ctx.newPage();
const errors = []; const failed = [];
p.on("pageerror", (e) => errors.push(String(e).slice(0, 300)));
p.on("requestfailed", (r) => failed.push(r.url()));
p.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
await p.goto(`${baseUrl}/mock-d.html`, { waitUntil: "load", timeout: 30000 });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => null))));
let t = 0;
const run = async (ms, step = 100) => { for (let k = 0; k < ms / step; k += 1) { t += step; await p.evaluate((tt) => window.__d && window.__d.tick(tt), t); } };
await run(2600);
if (FIRST) {
  const file = join(outDir, `d-first-${W}x${H}.png`);
  await p.screenshot({ path: file });
  const m = await p.evaluate(() => { const b = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().bottom) : null; }; return { vh: innerHeight, proofs: b(".proofs"), firstBtn: b(".hero-actions .pill.solid"), hero: b("#hero"), docW: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth }; });
  console.log(JSON.stringify({ file, ...m, errors, failed: failed.slice(0, 5) }));
} else {
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y <= total; y += Math.round(+H * 0.35)) { await p.evaluate((v) => window.scrollTo(0, v), y); await run(500, 125); }
  await run(2400);
  await p.evaluate(() => { window.__still = true; window.scrollTo(0, 0); });
  await run(600);
  const info = await p.evaluate(() => {
    const r = (sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), h: Math.round(b.height) }; };
    const vw = document.documentElement.clientWidth;
    const out = [...document.querySelectorAll("main *, footer *")].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && (b.right > vw + 1 || b.left < -1) && !el.closest(".marquee, .step-ghost, .hero") && getComputedStyle(el).position !== "absolute"; })
      .slice(0, 8).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} ${Math.round(el.getBoundingClientRect().left)}–${Math.round(el.getBoundingClientRect().right)}`);
    return { total: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, vw, hero: r("#hero"), say: r(".say"), brands: r(".brands"), career: r("#career"), loop: r("#capabilities"), work: r("#projects"), auto: r("#automation"), contact: r("#contact"), out };
  });
  const file = join(outDir, `d-${W}.png`);
  await p.screenshot({ path: file, fullPage: true });
  const report = JSON.stringify({ file, ...info, errors, failed: failed.slice(0, 6) }, null, 1);
  writeFileSync(join(outDir, `d-${W}.json`), report);
  console.log(report);
}
await browser.close();
