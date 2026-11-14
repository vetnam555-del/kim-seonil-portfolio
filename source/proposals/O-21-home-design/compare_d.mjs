// '지금 → 제안 D' 첫 화면을 나란히 놓은 비교판(PC 1440×900 · 휴대폰 390×844).
// 먼저 같은 <shots dir> 에 shot_now.mjs 로 now-first-<W>x<H>.png 를, render_d.mjs --first 로 d-first-<W>x<H>.png 를 찍어 둔다(둘 다 밀도 2).
// Usage: node compare_d.mjs <site dir> <base url> <shots dir> <out.png>
import { createRequire } from "node:module";
import { writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");
const [, , siteDir, baseUrl, src, out] = process.argv;
mkdirSync(join(siteDir, "mockimg"), { recursive: true });
const sizes = [["1440x900", "PC 첫 화면", 900], ["390x844", "휴대폰 첫 화면", 390]];
for (const [s] of sizes) for (const v of ["now", "d"]) copyFileSync(join(src, `${v}-first-${s}.png`), join(siteDir, "mockimg", `${v}-first-${s}.png`));
const CW = 900;
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>compare</title>
<style>
@font-face{font-family:"Pretendard";src:url("fonts/Pretendard-Regular.woff2") format("woff2");font-weight:400}
@font-face{font-family:"Pretendard";src:url("fonts/Pretendard-Bold.woff2") format("woff2");font-weight:700}
@font-face{font-family:"Pretendard";src:url("fonts/Pretendard-Black.woff2") format("woff2");font-weight:900}
*{box-sizing:border-box;margin:0;padding:0}
body{width:${CW * 2 + 36 + 56 * 2}px;padding:48px 56px 64px;background:#1c2026;color:#f5f3ef;font-family:"Pretendard",sans-serif;word-break:keep-all}
h1{font-size:34px;font-weight:900;letter-spacing:-.03em}
.lead{margin-top:10px;font-size:18px;line-height:1.6;color:#a8b0ba}
.grid{display:grid;grid-template-columns:repeat(2,${CW}px);gap:0 36px;margin-top:32px}
.colhead{padding:18px 22px;border-radius:16px;background:#3a4450}
.colhead.is-new{background:#ff5a3d;color:#0b0d10}
.colhead b{font-size:26px;font-weight:900;letter-spacing:-.02em}
.colhead span{margin-left:12px;font-size:17px;opacity:.86}
.rowhead{grid-column:1/-1;display:flex;align-items:center;gap:14px;margin:34px 0 14px;font-size:21px;font-weight:900}
.rowhead::after{content:"";flex:1;height:1px;background:#3a4450}
.cell{display:flex;justify-content:center;align-self:start}
.cell img{display:block;height:auto;border-radius:10px;box-shadow:0 0 0 1px #3a4450}
</style></head><body>
<h1>첫 화면 — 지금과 제안 D</h1>
<p class="lead">문장과 숫자는 그대로이고 바탕 · 글자 크기 · 배치가 달라집니다. 움직임은 영상과 화면 파일에서 볼 수 있습니다.</p>
<div class="grid">
  <div class="colhead"><b>지금</b><span>현재 사이트</span></div><div class="colhead is-new"><b>제안 D</b><span>검정 · 큰 글자 · 움직임</span></div>
  ${sizes.map(([s, name, w]) => `<p class="rowhead">${name} <span style="font-weight:400;color:#a8b0ba;font-size:16px">${s.replace("x", "×")}</span></p>${["now", "d"].map((v) => `<div class="cell"><img src="mockimg/${v}-first-${s}.png" style="width:${w}px" alt=""></div>`).join("")}`).join("")}
</div>
</body></html>`;
writeFileSync(join(siteDir, "mock-compare-d.html"), html);
const browser = await chromium.launch();
const p = await (await browser.newContext({ viewport: { width: CW * 2 + 36 + 56 * 2, height: 1000 }, deviceScaleFactor: 2 })).newPage();
await p.goto(`${baseUrl}/mock-compare-d.html`, { waitUntil: "load", timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => null))));
await p.waitForTimeout(300);
const size = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
await p.screenshot({ path: out, fullPage: true });
console.log(JSON.stringify({ out, ...size }));
await browser.close();
