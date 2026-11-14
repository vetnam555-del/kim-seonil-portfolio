// '지금 · 시안 A · 시안 B' 를 구간별로 나란히 놓은 비교판을 만든다.
// 먼저 render.mjs 로 now · a · b 를 같은 <out dir> 에 찍어 둔다(구간 높이가 적힌 json 과 png 를 거기서 읽는다).
// Usage: node compare.mjs <site dir> <base url> <render 의 out dir> <out.jpg>
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { join } from "node:path";

const { chromium } = createRequire(import.meta.url)("playwright");
const [, , siteDir, baseUrl, x2, out] = process.argv;

const info = Object.fromEntries(["now", "a", "b"].map((v) => [v, JSON.parse(readFileSync(join(x2, `${v}.json`), "utf8"))]));
mkdirSync(join(siteDir, "mockimg"), { recursive: true });
for (const v of ["now", "a", "b"]) copyFileSync(join(x2, `${v}-1440.png`), join(siteDir, "mockimg", `${v}.png`));

// 구간별 [위, 아래](쪽 좌표, 1440 기준)
const cuts = (j, v) => {
  const end = (o) => o.top + o.h;
  if (v === "now") return [[0, j.careerNow.top - 24], [j.careerNow.top - 24, end(j.hero)], [j.loop.top, end(j.loop)], [j.work.top, end(j.work)]];
  return [[0, end(j.hero)], [j.career.top, end(j.career)], [j.loop.top, end(j.loop)], [j.work.top, end(j.work)]];
};
const cols = [
  { v: "now", name: "지금", sub: "현재 사이트" },
  { v: "a", name: "시안 A", sub: "밝은 매거진형" },
  { v: "b", name: "시안 B", sub: "어두운 대시보드형" },
];
const rows = ["첫 화면", "경력", "일하는 순서", "대표 사례"];
const CW = 720; const S = CW / 1440;
const C = Object.fromEntries(cols.map((c) => [c.v, cuts(info[c.v], c.v)]));

const cell = (v, [y0, y1]) => `<div class="cell" style="height:${Math.round((y1 - y0) * S)}px"><img src="mockimg/${v}.png" style="margin-top:${-Math.round(y0 * S)}px" alt=""></div>`;
const html = `<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>compare</title>
<style>
@font-face{font-family:"Pretendard";src:url("fonts/Pretendard-Regular.woff2") format("woff2");font-weight:400}
@font-face{font-family:"Pretendard";src:url("fonts/Pretendard-Bold.woff2") format("woff2");font-weight:700}
@font-face{font-family:"Pretendard";src:url("fonts/Pretendard-Black.woff2") format("woff2");font-weight:900}
*{box-sizing:border-box;margin:0;padding:0}
body{width:${CW * 3 + 32 * 2 + 56 * 2}px;padding:48px 56px 64px;background:#e9e6df;color:#0b0d10;font-family:"Pretendard",sans-serif;word-break:keep-all}
h1{font-size:34px;font-weight:900;letter-spacing:-.03em}
.lead{margin-top:10px;font-size:18px;color:#3d4552}
.grid{display:grid;grid-template-columns:repeat(3,${CW}px);gap:0 32px;margin-top:36px}
.colhead{position:relative;padding:18px 22px;border-radius:16px 16px 0 0;background:#0b0d10;color:#f5f3ef}
.colhead b{font-size:26px;font-weight:900;letter-spacing:-.02em}
.colhead span{margin-left:12px;font-size:17px;color:#a8b0ba}
.colhead.is-now{background:#57626f}
.rowhead{grid-column:1/-1;display:flex;align-items:center;gap:14px;margin:34px 0 14px;font-size:20px;font-weight:900}
.rowhead i{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#c7301b;color:#fff;font-style:normal;font-size:16px}
.rowhead::after{content:"";flex:1;height:1px;background:#bdb7a8}
.first .rowhead{margin-top:20px}
.cell{overflow:hidden;border-radius:10px;background:#fff;box-shadow:0 1px 0 rgba(11,13,16,.06),0 18px 40px -28px rgba(11,13,16,.5)}
.cell img{display:block;width:${CW}px;height:auto}
</style></head><body>
<h1>홈 화면 디자인 시안 비교</h1>
<p class="lead">같은 내용(지금 홈에 있는 문장 · 숫자)을 세 가지 모습으로 나란히 놓았습니다. 첫 화면 → 경력 → 일하는 순서 → 대표 사례 순서입니다.</p>
<div class="grid">
  ${cols.map((c) => `<div class="colhead${c.v === "now" ? " is-now" : ""}"><b>${c.name}</b><span>${c.sub}</span></div>`).join("")}
  ${rows.map((r, i) => `<p class="rowhead"><i>${i + 1}</i>${r}</p>${cols.map((c) => cell(c.v, C[c.v][i])).join("")}`).join("")}
</div>
</body></html>`;
writeFileSync(join(siteDir, "mock-compare.html"), html);

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: CW * 3 + 32 * 2 + 56 * 2, height: 1000 }, deviceScaleFactor: 1.5 });
const p = await ctx.newPage();
await p.goto(`${baseUrl}/mock-compare.html`, { waitUntil: "load", timeout: 60000 });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => null))));
await p.waitForTimeout(300);
const size = await p.evaluate(() => ({ w: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight }));
await p.screenshot({ path: out, fullPage: true, type: out.endsWith(".png") ? "png" : "jpeg", ...(out.endsWith(".png") ? {} : { quality: 90 }) });
console.log(JSON.stringify({ out, ...size }));
await browser.close();
