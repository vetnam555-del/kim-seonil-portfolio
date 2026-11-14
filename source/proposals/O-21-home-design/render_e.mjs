// 제안 E(사례 표지) — 지금 홈(mock-now.html)을 그대로 두고 대표 사례 다섯 장의 표지만 바꾼다.
// 표지 = 사례 색 바탕 + 브랜드 이름 + 소재 낱장 세 장(왼쪽에서 오른쪽으로 한 계단씩 올라간다).
// Usage: node render_e.mjs <site dir> <base url> <out dir>
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
const { chromium } = createRequire(import.meta.url)("playwright");
const [, , siteDir, baseUrl, outDir] = process.argv;
mkdirSync(outDir, { recursive: true });
const T = "/kim-seonil-portfolio/mockimg/tiles/";
const SETS = {
  "case-jestina": { kind: "sq", tiles: ["jestina-1", "jestina-3", "jestina-4"] },
  "case-newbalance": { kind: "wide", tiles: ["newbalance-1", "newbalance-3", "newbalance-7"] },
  "case-daekyo": { kind: "sq", tiles: ["daekyo-1", "daekyo-4", "daekyo-6"] },
  "case-gangwon": { kind: "sq", tiles: ["gangwon-1", "gangwon-3", "gangwon-6"] },
  "case-dyson": { kind: "tall", tiles: ["dyson-1", "dyson-2", "dyson-4"] },
};
const css = `
.folio-case-media{position:relative;display:block;padding:0;aspect-ratio:16/10;border-radius:22px;background:var(--tint,#f1f2f4);overflow:hidden;isolation:isolate}
.folio-case-sm .folio-case-media{padding:0;aspect-ratio:4/3}
.folio-case-media>img{display:none}
.cv-name{position:absolute;left:28px;top:26px;z-index:2;max-width:46%;font-family:var(--font-sans,Pretendard),sans-serif;font-size:clamp(24px,2.5vw,36px);line-height:1.12;font-weight:900;letter-spacing:-.035em;color:#0f1216;word-break:keep-all}
.folio-case-sm .cv-name{left:22px;top:20px;max-width:none;font-size:clamp(21px,1.75vw,25px)}
.cv-stack{position:absolute;right:30px;bottom:0;width:68%;height:100%}
.cv-stack i{position:absolute;display:block;width:44%;aspect-ratio:1;overflow:hidden;border-radius:12px;background:#fff;box-shadow:0 18px 34px -14px rgba(15,18,22,.4),0 0 0 1px rgba(15,18,22,.06);transition:transform .5s cubic-bezier(.22,1,.36,1)}
.cv-stack.is-tall i{aspect-ratio:3/4;width:36%}
.cv-stack i img{display:block;width:100%;height:100%;object-fit:cover;object-position:50% 20%}
.cv-stack i:nth-child(1){left:0;bottom:8%;z-index:1}.cv-stack i:nth-child(2){left:28%;bottom:17%;z-index:2}.cv-stack i:nth-child(3){left:56%;bottom:26%;z-index:3}
.cv-stack.is-tall i:nth-child(1){left:4%}.cv-stack.is-tall i:nth-child(2){left:34%}.cv-stack.is-tall i:nth-child(3){left:64%}
.folio-case:hover .cv-stack i:nth-child(1){transform:translateY(-4px)}.folio-case:hover .cv-stack i:nth-child(2){transform:translateY(-8px)}.folio-case:hover .cv-stack i:nth-child(3){transform:translateY(-12px)}
.folio-case-sm .cv-stack{left:22px;right:22px;width:auto}
.folio-case-sm .cv-stack i{width:39%}
.folio-case-sm .cv-stack i:nth-child(n){z-index:auto}
.folio-case-sm .cv-stack.is-tall i{width:31%}
.folio-case-sm .cv-stack i:nth-child(1){left:0;bottom:7%}.folio-case-sm .cv-stack i:nth-child(2){left:30.5%;bottom:13%}.folio-case-sm .cv-stack i:nth-child(3){left:61%;bottom:19%}
.folio-case-sm .cv-stack.is-tall i:nth-child(1){left:2%}.folio-case-sm .cv-stack.is-tall i:nth-child(2){left:34.5%}.folio-case-sm .cv-stack.is-tall i:nth-child(3){left:67%}
/* 가로로 긴 배너(비즈보드): 세 줄을 한 계단씩 오른쪽으로 */
.cv-stack.is-wide{display:block;right:0;bottom:26px;top:auto;width:66%;height:auto}
.cv-stack.is-wide i{position:static;width:auto;aspect-ratio:4/1;border-radius:10px 0 0 10px;margin-top:10px}
.cv-stack.is-wide i:nth-child(1){margin-left:24%}.cv-stack.is-wide i:nth-child(2){margin-left:12%}.cv-stack.is-wide i:nth-child(3){margin-left:0}
.cv-stack.is-wide i img{object-position:0 50%}
.folio-case:hover .cv-stack.is-wide i:nth-child(n){transform:translateX(-8px)}
.folio-case-brand.is-moved{display:none}
@media (max-width:767px){.cv-name{left:20px;top:18px;font-size:24px}.cv-stack{right:16px;width:66%}.cv-stack.is-wide{width:72%;bottom:18px}.cv-stack.is-wide i{margin-top:7px}.folio-case-sm .cv-name{font-size:23px}.folio-case-sm .cv-stack{left:18px;right:18px}}
`;
const augment = `(${function (SETS, T) {
  Object.keys(SETS).forEach(function (id) {
    var art = document.getElementById(id); if (!art) return; var set = SETS[id];
    var media = art.querySelector(".folio-case-media"); var brand = art.querySelector(".folio-case-brand");
    var name = document.createElement("span"); name.className = "cv-name"; name.textContent = brand.textContent; brand.classList.add("is-moved");
    var stack = document.createElement("span"); stack.className = "cv-stack" + (set.kind === "wide" ? " is-wide" : set.kind === "tall" ? " is-tall" : "");
    set.tiles.forEach(function (t) { var i = document.createElement("i"); var im = document.createElement("img"); im.src = T + t + ".webp"; im.alt = ""; i.appendChild(im); stack.appendChild(i); });
    media.appendChild(name); media.appendChild(stack);
  });
}.toString()})(${JSON.stringify(SETS)}, ${JSON.stringify(T)});`;
let html = readFileSync(join(siteDir, "mock-now.html"), "utf8");
html = html.replace("</head>", `<style id="e-css">${css}</style></head>`).replace("</body>", `<script>${augment}</script></body>`);
writeFileSync(join(siteDir, "mock-e.html"), html);
const browser = await chromium.launch();
for (const [v, w, h, s] of [["now", 1440, 900, 1], ["e", 1440, 900, 1], ["now", 390, 844, 2], ["e", 390, 844, 2]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: s, isMobile: w < 600, hasTouch: w < 600 });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
  await p.goto(`${baseUrl}/mock-${v}.html`, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => null))));
  await p.waitForTimeout(400);
  const el = await p.$("#projects");
  await el.screenshot({ path: join(outDir, `${v}-projects-${w}.png`) });
  const info = await p.evaluate(() => ({ docW: document.documentElement.scrollWidth, vw: innerWidth, h: Math.round(document.querySelector("#projects").getBoundingClientRect().height) }));
  console.log(v, w, JSON.stringify(info), errs);
  await ctx.close();
}
await browser.close();
