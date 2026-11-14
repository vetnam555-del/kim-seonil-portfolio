// 지금 홈(스크립트 뺀 사본)의 첫 화면을 찍는다 — 비교용.  Usage: node shot_now.mjs <base url> <out.png> <width> <height> [scale]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [, , baseUrl, out, W, H, S = "2"] = process.argv;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: +S, isMobile: +W < 600, hasTouch: +W < 600 });
const p = await ctx.newPage();
await p.goto(`${baseUrl}/mock-now.html`, { waitUntil: "load" });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => null))));
await p.waitForTimeout(400);
const m = await p.evaluate(() => { const b = (s) => { const e = document.querySelector(s); return e ? Math.round(e.getBoundingClientRect().bottom) : null; }; return { vh: innerHeight, proofs: b(".folio-proofs"), firstBtn: b(".folio-hero-actions a"), heroCopy: b(".folio-hero-copy") }; });
await p.screenshot({ path: out });
console.log(JSON.stringify(m));
await browser.close();
