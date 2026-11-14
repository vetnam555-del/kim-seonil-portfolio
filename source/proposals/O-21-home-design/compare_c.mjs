// '지금 → 보완안 C' 를 구간별로 나란히 놓은 비교판(PC 화면). 먼저 render_c.mjs 로 now · c 를 같은 <out dir> 에 1440 폭으로 찍어 둔다.
// Usage: node compare_c.mjs <site dir> <base url> <render 의 out dir> <out.jpg>
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const { chromium } = createRequire(import.meta.url)("playwright");
const [, , siteDir, baseUrl, src, out] = process.argv;
const info = Object.fromEntries(["now", "c"].map((v) => [v, JSON.parse(readFileSync(join(src, `${v}-1440.json`), "utf8"))]));
mkdirSync(join(siteDir, "mockimg"), { recursive: true });
for (const v of ["now", "c"]) copyFileSync(join(src, `${v}-1440.png`), join(siteDir, "mockimg", `${v}-full.png`));

const end = (o) => o.top + o.h;
const cuts = (j, v) => [
  v === "now" ? [j.career.top - 24, end(j.hero)] : [j.career.top, end(j.career)],
  [j.loop.top, end(j.loop)],
  [j.work.top, end(j.work)],
  [j.auto.top, end(j.auto)],
  [j.contact.top, end(j.contact)],
];
const rows = ["경력", "일하는 순서", "대표 사례 · 그 외 기록", "업무 자동화", "연락"];
const cols = [{ v: "now", name: "지금", sub: "현재 사이트" }, { v: "c", name: "보완안 C", sub: "문장은 그대로 · 배치와 표현만" }];
const CW = 900; const S = CW / 1440;
const C = Object.fromEntries(cols.map((c) => [c.v, cuts(info[c.v], c.v)]));
const cell = (v, [y0, y1]) => `<div class="cell" style="height:${Math.round((y1 - y0) * S)}px"><img src="mockimg/${v}-full.png" style="margin-top:${-Math.round(y0 * S)}px" alt=""></div>`;
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>compare</title>
<style>
@font-face{font-family:"Pretendard";src:url("fonts/Pretendard-Regular.woff2") format("woff2");font-weight:400}
@font-face{font-family:"Pretendard";src:url("fonts/Pretendard-Bold.woff2") format("woff2");font-weight:700}
@font-face{font-family:"Pretendard";src:url("fonts/Pretendard-Black.woff2") format("woff2");font-weight:900}
*{box-sizing:border-box;margin:0;padding:0}
body{width:${CW * 2 + 36 + 56 * 2}px;padding:48px 56px 64px;background:#dedad0;color:#0b0d10;font-family:"Pretendard",sans-serif;word-break:keep-all}
h1{font-size:34px;font-weight:900;letter-spacing:-.03em}
.lead{margin-top:10px;font-size:18px;line-height:1.6;color:#3d4552}
.grid{display:grid;grid-template-columns:repeat(2,${CW}px);gap:0 36px;margin-top:32px}
.colhead{padding:18px 22px;border-radius:16px;background:#57626f;color:#f5f3ef}
.colhead.is-new{background:#c7301b}
.colhead b{font-size:26px;font-weight:900;letter-spacing:-.02em}
.colhead span{margin-left:12px;font-size:17px;opacity:.86}
.rowhead{grid-column:1/-1;display:flex;align-items:center;gap:14px;margin:34px 0 14px;font-size:21px;font-weight:900}
.rowhead i{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#0b0d10;color:#fff;font-style:normal;font-size:16px}
.rowhead::after{content:"";flex:1;height:1px;background:#b3ad9e}
.cell{overflow:hidden;align-self:start;border-radius:10px;background:#fff;box-shadow:0 1px 0 rgba(11,13,16,.06),0 18px 40px -28px rgba(11,13,16,.5)}
.cell img{display:block;width:${CW}px;height:auto}
</style></head><body>
<h1>홈 화면 — 지금과 보완안 C</h1>
<p class="lead">첫 화면은 그대로 두고 그 아래를 바꿨습니다. 문장과 숫자는 지금 홈의 것을 한 글자도 다시 치지 않고 그대로 옮겼습니다.</p>
<div class="grid">
  ${cols.map((c) => `<div class="colhead${c.v === "c" ? " is-new" : ""}"><b>${c.name}</b><span>${c.sub}</span></div>`).join("")}
  ${rows.map((r, i) => `<p class="rowhead"><i>${i + 1}</i>${r}</p>${cols.map((c) => cell(c.v, C[c.v][i])).join("")}`).join("")}
</div>
</body></html>`;
writeFileSync(join(siteDir, "mock-compare-c.html"), html);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: CW * 2 + 36 + 56 * 2, height: 1000 }, deviceScaleFactor: 1 });
const p = await ctx.newPage();
await p.goto(`${baseUrl}/mock-compare-c.html`, { waitUntil: "load", timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => null))));
await p.waitForTimeout(300);
const size = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
await p.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 90 });
console.log(JSON.stringify({ out, ...size }));
await browser.close();
