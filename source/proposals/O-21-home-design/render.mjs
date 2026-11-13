// 홈 디자인 시안(O-21)을 실제 홈(빌드 결과) 위에 입혀 한 장의 이미지로 찍는다. 쓰는 법은 ../O-21-home-design.md.
// 홈의 index.html 을 읽어 스크립트를 빼고(하이드레이션 없음), 경력 · 일하는 순서 · 대표 사례 구간만 시안의 마크업으로 바꾼 뒤
// 같은 폴더에 mock-<시안>.html 로 써서 로컬 서버로 연다. 글꼴 · 이미지 · 첫 화면은 사이트의 것을 그대로 쓴다.
// <site dir> 는 루트 빌드 결과의 **사본**이어야 한다(저장소 루트를 주면 mock-*.html 이 빌드 결과에 섞인다).
// Usage: node render.mjs <site dir> <base url> <out dir> <a|b|now> [width=1440] [scale=1]
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

// Playwright 는 이 프로젝트의 의존성이 아니다(클라우드 컨테이너에는 깔려 있다). 없으면 HTML 만 쓰고 끝낸다 — 그 파일을 브라우저로 열면 된다
let chromium = null;
try { ({ chromium } = createRequire(import.meta.url)("playwright")); } catch { /* HTML 만 */ }
const [, , siteDir, baseUrl, outDir, variant, W = "1440", SCALE = "1"] = process.argv;
mkdirSync(outDir, { recursive: true });

let h = readFileSync(join(siteDir, "index.html"), "utf8");
const cut = (from, to) => { h = h.slice(0, from) + h.slice(to); };
const sectionRange = (id) => {
  const i = h.indexOf(`<section id="${id}"`);
  if (i < 0) throw new Error(`section ${id} not found`);
  const j = h.indexOf("</section>", i) + "</section>".length;
  return [i, j];
};

// 1) 스크립트를 모두 뺀다 — 찍는 동안 화면이 다시 그려지지 않게
h = h.replace(/<script\b[\s\S]*?<\/script>/g, "").replace(/<link[^>]+as="script"[^>]*>/g, "");
// 글꼴 선언은 스크립트가 없을 때 쓰는 <noscript> 안에 있다 — 스크립트를 뺐으니 그 선언을 쓴다
h = h.replace(/<\/?noscript>/g, "");
// 화면 밖 이미지도 바로 받게 한다(지연 로딩이면 전체 쪽 캡처에서 비어 나오고, 기다리는 쪽이 끝나지 않는다)
h = h.replace(/loading="lazy"/g, 'loading="eager"').replace(/decoding="async"/g, 'decoding="sync"');

// 2) 이번 시안이 다루지 않는 뒤쪽 구간(자동화 · 연락 · 바닥글)은 뺀다
{
  const [a] = sectionRange("automation");
  const end = h.indexOf("</footer>") + "</footer>".length;
  cut(a, end);
}

let css = `
.intro, .scroll-progress, [data-testid="scroll-progress"] { display: none !important; }
.site-header { position: absolute !important; }
.folio > * { content-visibility: visible !important; }
.count-up-visual { display: none !important; } .count-up-measure { visibility: visible !important; }
*, *::before, *::after { animation: none !important; transition: none !important; }
`;

if (variant !== "now") {
  const mod = await import(`./variant_${variant}.mjs`);
  // 3) 대표 사례 → 일하는 순서 → 경력 순으로(뒤에서부터) 바꾼다. 앞을 먼저 바꾸면 뒤의 위치가 밀린다
  {
    const [a, b] = sectionRange("projects");
    h = h.slice(0, a) + `<section id="projects" class="mk-sec">${mod.html.work}</section>` + h.slice(b);
  }
  {
    const [a, b] = sectionRange("capabilities");
    h = h.slice(0, a) + `<section id="capabilities" class="mk-sec">${mod.html.loop}</section>` + h.slice(b);
  }
  {
    const [a, b] = sectionRange("hero");
    const k = h.indexOf(`<div class="folio-wrap"><div class="folio-career">`, a);
    if (k < 0 || k > b) throw new Error("career block not found inside the hero");
    h = h.slice(0, k) + "</section>" + mod.html.career + h.slice(b);
  }
  css += mod.css;
  if (variant === "b") h = h.replace("site-header site-header-light", "site-header");
}
h = h.replace("</head>", `<style id="mock">${css}</style></head>`);
const name = `mock-${variant}.html`;
writeFileSync(join(siteDir, name), h);

if (!chromium) { console.log(JSON.stringify({ html: join(siteDir, name), open: `${baseUrl}/${name}`, note: "playwright 없음 — HTML 만 썼다" })); process.exit(0); }
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +W, height: 900 }, deviceScaleFactor: +SCALE, reducedMotion: "reduce" });
const p = await ctx.newPage();
const failed = [];
p.on("requestfailed", (r) => failed.push(r.url()));
p.on("response", (r) => { if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`); });
await p.goto(`${baseUrl}/${name}`, { waitUntil: "load", timeout: 30000 });
console.error("loaded", name);
await p.evaluate(() => document.fonts.ready);
// 이미지가 다 그려질 때까지
await p.evaluate(() => Promise.race([
  Promise.all([...document.images].map((im) => (im.complete ? null : new Promise((res) => { im.onload = im.onerror = res; })))),
  new Promise((res) => setTimeout(res, 8000)),
]));
await p.waitForTimeout(400);
const info = await p.evaluate(() => {
  const r = (sel) => { const el = document.querySelector(sel); if (!el) return null; const b = el.getBoundingClientRect(); return { top: Math.round(b.top + scrollY), h: Math.round(b.height) }; };
  const over = [...document.querySelectorAll(".mk *")].filter((el) => el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflow === "visible" && el.clientWidth > 0)
    .slice(0, 12).map((el) => `${el.className || el.tagName} ${el.scrollWidth}>${el.clientWidth}`);
  return { total: document.documentElement.scrollHeight, docW: document.documentElement.scrollWidth, hero: r("#hero"), career: r("#mk-career"), loop: r("#capabilities"), work: r("#projects"), careerNow: r("#hero .folio-career"),
    fonts: [...document.fonts].filter((f) => f.status === "loaded").map((f) => `${f.family} ${f.weight}`).filter((v, i, a) => a.indexOf(v) === i).slice(0, 30), over };
});
const out = join(outDir, `${variant}-${W}.png`);
await p.screenshot({ path: out, fullPage: true });
const report = JSON.stringify({ out, ...info, failed: failed.slice(0, 10) }, null, 1);
writeFileSync(join(outDir, `${variant}.json`), report);   // compare.mjs 가 구간 높이를 여기서 읽는다
console.log(report);
await browser.close();
