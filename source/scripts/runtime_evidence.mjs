// 클라우드 브라우저 검수 (2026.10.10) — release_contract.mjs 의 runtime 증거를 실제 렌더에서 잰다.
// qa_release --approve 가 요구하는 runtime.json 을 만든다. 사용법은 .claude/skills/portfolio-steward/SKILL.md.
//
//   npm i --prefix /tmp/portfolio-qa-tools --no-save --no-audit --no-fund puppeteer-core@24.43.1   # 한 번
//   node scripts/serve_export.mjs general .. 8154 &                                                 # 루트 빌드 결과를 띄운다
//   node scripts/runtime_evidence.mjs http://127.0.0.1:8154/kim-seonil-portfolio artifacts/release/runtime <fingerprint>
//
// puppeteer-core 는 이 저장소 의존성이 아니다(빌드에 필요 없다). QA_TOOLS_DIR(기본 /tmp/portfolio-qa-tools)에서 읽는다.
import { createRequire } from "node:module";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const TOOLS = process.env.QA_TOOLS_DIR ?? "/tmp/portfolio-qa-tools";
let puppeteer;
try {
  puppeteer = createRequire(join(TOOLS, "index.js"))("puppeteer-core");
} catch {
  console.error(`puppeteer-core 가 ${TOOLS} 에 없습니다 — npm i --prefix ${TOOLS} --no-save puppeteer-core@24.43.1`);
  process.exit(2);
}

const [BASE, OUT, FP] = process.argv.slice(2);
if (!BASE || !OUT || !FP) {
  console.error("사용법: node scripts/runtime_evidence.mjs <base url> <out dir> <fingerprint>");
  process.exit(2);
}
mkdirSync(OUT, { recursive: true });
const browser = await puppeteer.launch({
  executablePath: process.env.CHROME_PATH || "/opt/pw-browsers/chromium",
  headless: "new",
  args: ["--no-sandbox"],
});
const ctx = browser.defaultBrowserContext();
await ctx.overridePermissions(new URL(BASE).origin, ["clipboard-read", "clipboard-write", "clipboard-sanitized-write"]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const HEIGHTS = { 360: 800, 390: 844, 768: 1024, 1024: 768, 1440: 900 };
const evidence = { version: 1, fingerprint: FP, generatedAt: new Date().toISOString(), viewports: [], pages: [], motion: {}, interactions: [], visualReview: { screenshots: [], openIssues: 0, notes: [] } };

async function open(path, width, { intro = false } = {}) {
  const page = await browser.newPage();
  const errors = [];
  page.on("console", (m) => { if (m.type() === "error") errors.push(`console: ${m.text()}`); });
  page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
  page.on("requestfailed", (r) => { const why = r.failure()?.errorText || ""; if (!r.url().includes("_rsc=") && !/ERR_ABORTED/.test(why)) errors.push(`requestfailed: ${r.url()} ${why}`); });
  page.on("response", (r) => { if (r.status() >= 400) errors.push(`http ${r.status()}: ${r.url()}`); });
  await page.setViewport({ width, height: HEIGHTS[width] || 900 });
  const url = `${BASE}${path}${intro ? "" : (path.includes("?") ? "&" : "?") + "intro=0"}`;
  await page.goto(url, { waitUntil: "networkidle0", timeout: 60000 });
  return { page, errors };
}

async function scrollThrough(page) {
  await page.evaluate(async () => {
    const step = Math.max(300, innerHeight * 0.8);
    for (let y = 0; y < document.documentElement.scrollHeight; y += step) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); }
    scrollTo(0, 0);
  });
  await sleep(600);
}

// 1. 홈 폭 다섯 개
for (const width of [360, 390, 768, 1024, 1440]) {
  const { page } = await open("/", width);
  const row = await page.evaluate((width) => {
    const de = document.documentElement;
    const clipped = [];
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) continue;
      const cs = getComputedStyle(el);
      if (cs.position === "fixed" || cs.visibility === "hidden") continue;
      // 가로로 화면 밖으로 나간 것 — 조상이 overflow 로 자르는 경우는 뺀다
      if (r.right > de.clientWidth + 1 && r.left < de.clientWidth) {
        let p = el.parentElement, cut = false;
        while (p && p !== document.body) { const o = getComputedStyle(p); if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) { cut = true; break; } p = p.parentElement; }
        if (!cut) clipped.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)} ${Math.round(r.left)}–${Math.round(r.right)}`);
      }
    }
    // 히어로 핵심(사진·이름·제목·강점·소개·행동 버튼)이 첫 화면 안에 끝나는가 — 행동 버튼 줄의 아래 끝을 문서 기준으로 잰다.
    // 표지 수치 세 칸(folio-proof)은 첫 화면 아래로 이어지도록 설계돼 있어 넣지 않는다.
    const actions = document.querySelector(".folio-hero-actions");
    const heroBottom = actions ? Math.round(actions.getBoundingClientRect().bottom + scrollY) : 0;
    return { width, clientWidth: de.clientWidth, scrollWidth: de.scrollWidth, clipped: clipped.slice(0, 10), heroHeight: heroBottom, heroMeasure: "bottom of .folio-hero-actions (page Y)", height: innerHeight, pageHeight: de.scrollHeight };
  }, width);
  evidence.viewports.push(row);
  const shot = `home-${width}.png`;
  await page.screenshot({ path: join(OUT, shot) });
  evidence.visualReview.screenshots.push(shot);
  await page.close();
}

// 2. 쪽마다 390 · 1440
const routes = ["/", "/resume/", ...["jestina", "newbalance", "daekyo", "gangwon", "dyson", "automation", "edith", "hanssem", "ktalpha"].map((s) => `/projects/${s}/`)];
for (const width of [390, 1440]) {
  for (const route of routes) {
    const { page, errors } = await open(route, width);
    await scrollThrough(page);
    const r = await page.evaluate(() => {
      const de = document.documentElement;
      const brokenImages = [...document.images].filter((i) => i.complete && i.naturalWidth === 0 && i.getAttribute("src")).map((i) => i.currentSrc || i.src);
      return { clientWidth: de.clientWidth, scrollWidth: de.scrollWidth, brokenImages, missingTitle: !document.title || !document.querySelector("h1"), title: document.title, height: de.scrollHeight };
    });
    evidence.pages.push({ width, route, ...r, loadingErrors: [...errors] });
    if ((width === 390 && ["/projects/newbalance/", "/resume/"].includes(route)) || (width === 1440 && ["/projects/jestina/", "/resume/"].includes(route))) {
      const shot = `page-${width}-${route.replaceAll("/", "_").replace(/^_|_$/g, "") || "home"}.png`;
      await page.screenshot({ path: join(OUT, shot) });
      evidence.visualReview.screenshots.push(shot);
    }
    await page.close();
  }
}

// 3. 카운트업 — 홈 표지 · 사례
async function frames(path, selector, scrollTo) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });
  const url = `${BASE}${path}${path.includes("?") ? "&" : "?"}intro=0`;
  await page.goto(url, { waitUntil: "networkidle0" }); // 글꼴·이미지를 캐시에 올려 두고
  await page.goto(url, { waitUntil: scrollTo ? "networkidle0" : "domcontentloaded" }); // 다시 열어 처음부터 잰다 — 글꼴 교체로 폭이 바뀌는 것을 빼기 위해
  /* 캐시에 있어도 글꼴은 FontFace 로 붙어 첫 프레임에는 대체 서체일 수 있다 — 사이트 글꼴 로더가 정한 대로
     window.__ksiFontsReady 를 기다린 뒤 잰다(layout.tsx). 2026.10.31 새 컨테이너에서 첫 프레임만 92.4px(대체 서체)
     → 95.6px 로 잡혀 "count-up changed layout width" 로 두 번 떨어졌다. 카운트업 자체의 폭 변화는 그대로 잰다 */
  await page.evaluate(() => window.__ksiFontsReady || document.fonts.ready);
  if (scrollTo) await page.$eval(scrollTo, (el) => el.scrollIntoView({ block: "center" }));
  const out = [];
  const t0 = Date.now();
  while (Date.now() - t0 < 3200) {
    const f = await page.evaluate((sel) => {
      const el = [...document.querySelectorAll(sel)].find((n) => { const r = n.getBoundingClientRect(); return r.width > 0 && r.top < innerHeight && r.bottom > 0; });
      if (!el) return null;
      return { state: el.dataset.countUpState, visual: el.querySelector("[data-count-up-visual]")?.textContent ?? "", target: el.dataset.countUp, width: Math.round(el.getBoundingClientRect().width * 10) / 10, fontsReady: document.fonts.status };
    }, selector);
    if (f) out.push({ t: Date.now() - t0, ...f });
    await sleep(25);
  }
  await page.close();
  return out;
}
evidence.motion.hero = await frames("/", ".folio-hero .count-up, .folio-proof .count-up");
evidence.motion.case = await frames("/", "#case-jestina .count-up", "#case-jestina");

// 4. 상호작용
async function interaction(name, fn) {
  try { const observed = await fn(); evidence.interactions.push({ name, passed: true, observed }); }
  catch (e) { evidence.interactions.push({ name, passed: false, observed: String(e.message || e) }); }
}
await interaction("menu", async () => {
  const { page } = await open("/", 390);
  const btn = await page.$('button[aria-controls="mobile-nav"]');
  await btn.click(); await sleep(500);
  const r = await page.evaluate(() => ({ expanded: document.querySelector('button[aria-controls="mobile-nav"]').getAttribute("aria-expanded"), links: [...document.querySelectorAll("#mobile-nav a")].filter((a) => a.getBoundingClientRect().height > 0).map((a) => a.textContent.trim()).slice(0, 8) }));
  await page.close();
  if (r.expanded !== "true" || r.links.length < 3) throw new Error(`menu did not open: ${JSON.stringify(r)}`);
  return `390px 메뉴 버튼 → aria-expanded=true, 보이는 링크 ${r.links.length}개: ${r.links.join(" / ")}`;
});
await interaction("case-index", async () => {
  const { page } = await open("/projects/newbalance/", 1440);
  const href = await page.$eval('nav[aria-label="프로젝트 사례 흐름"] a[href*="#case-results"]', (a) => a.getAttribute("href"));
  await page.click('nav[aria-label="프로젝트 사례 흐름"] a[href*="#case-results"]'); await sleep(2200);
  const r = await page.evaluate(() => ({ hash: location.hash, top: Math.round(document.getElementById("case-results").getBoundingClientRect().top), vh: innerHeight }));
  await page.close();
  if (r.hash !== "#case-results" || r.top > r.vh * 0.6 || r.top < -50) throw new Error(JSON.stringify(r));
  return `뉴발란스 사례 목차 '${href}' 클릭 → ${r.hash}, 절 머리가 화면 위에서 ${r.top}px`;
});
await interaction("detail", async () => {
  const { page } = await open("/", 1440);
  /* 대표 사례 구간은 화면 가까이 와야 그려진다(content-visibility: auto · 2026.10.24 B-04). 스크롤과 같은 프레임에
     누르면 아직 그려지지 않은 구간을 눌러 이동이 없다 — 사람처럼 카드를 화면에 띄우고 잠깐 뒤에 누른다.
     사이트는 scroll-behavior: smooth 라 즉시 스크롤로 띄운다(부드러운 스크롤 도중에 누르면 빗나간다) */
  const card = '#case-newbalance a[href$="/projects/newbalance/"]:not([aria-hidden="true"])';
  await page.$eval(card, (a) => a.scrollIntoView({ block: "center", behavior: "instant" })); await sleep(400);
  await Promise.all([page.waitForNavigation({ waitUntil: "networkidle0" }), page.click(card)]);
  const r = await page.evaluate(() => ({ path: location.pathname, h1: document.querySelector("h1")?.textContent.trim() }));
  await page.close();
  if (!r.path.endsWith("/projects/newbalance/") || !r.h1) throw new Error(JSON.stringify(r));
  return `홈 뉴발란스 카드 → ${r.path}, h1 "${r.h1.slice(0, 40)}"`;
});
await interaction("original", async () => {
  const { page } = await open("/", 1440);
  const href = await page.$eval('a[aria-label*="원본 크기로 열기"]', (a) => a.href);
  const res = await page.evaluate(async (u) => { const r = await fetch(u); const b = await r.blob(); return { status: r.status, type: b.type, size: b.size }; }, href);
  await page.close();
  if (res.status !== 200 || !/image\//.test(res.type) || res.size < 10000) throw new Error(JSON.stringify(res));
  return `'원본 크기로 열기' ${href.split("/").pop()} → ${res.status} ${res.type} ${Math.round(res.size / 1024)}KB`;
});
await interaction("email", async () => {
  const { page } = await open("/", 1440);
  const btn = await page.$('.folio-hero a[title="이메일 주소 복사"]');
  const label = await page.evaluate((b) => b.textContent.trim(), btn);
  await btn.click(); await sleep(700);
  const r = await page.evaluate(async () => ({ clip: await navigator.clipboard.readText().catch((e) => `ERR ${e.message}`), live: [...document.querySelectorAll('[aria-live]')].map((n) => n.textContent.trim()).filter(Boolean).join(" | ") }));
  await page.close();
  if (!/@naver\.com/.test(r.clip)) throw new Error(JSON.stringify(r));
  return `'${label.slice(0, 30)}' 클릭 → 클립보드 "${r.clip}", 알림 "${r.live.slice(0, 60)}"`;
});
for (const [name, sel] of [["resume-pdf", 'a[href*="kim-seonil-resume-public.pdf"]'], ["portfolio-pdf", 'a[href*="performance-marketing-portfolio.pdf"]']]) {
  await interaction(name, async () => {
    const { page } = await open("/", 1440);
    const href = await page.$eval(sel, (a) => a.href);
    const res = await page.evaluate(async (u) => { const r = await fetch(u); const buf = new Uint8Array(await r.arrayBuffer()); const head = String.fromCharCode(...buf.slice(0, 5)); const text = new TextDecoder("latin1").decode(buf); return { status: r.status, type: r.headers.get("content-type"), size: buf.length, head, pages: (text.match(/\/Type\s*\/Page[^s]/g) || []).length }; }, href);
    await page.close();
    if (res.status !== 200 || res.head !== "%PDF-" || res.size < 40000) throw new Error(JSON.stringify(res));
    return `${href.split("/").pop()} → ${res.status} ${res.type} ${Math.round(res.size / 1024)}KB, %PDF 머리, 쪽 객체 ${res.pages}개`;
  });
}
await interaction("demo", async () => {
  const { page } = await open("/", 1440);
  await page.$eval("#inventory-demo", (el) => el.scrollIntoView({ block: "center" })); await sleep(1500);
  /* 진행 상태 = 회차 제목 | 지금 단계 번호 | 조회 수. 버튼 문구는 넣지 않는다(자비스 3200ec9 P2 — 버튼만 바뀌고 타이머가
     안 멈춰도 통과하던 것). 단계 하나는 최대 2.6초라, 3초 동안 같으면 멈춘 것, 다르면 움직인 것이다. */
  const state = () => page.$eval("#inventory-demo", (el) => {
    const lis = [...el.querySelectorAll(".automation-demo-steps li")];
    const now = lis.findIndex((li) => li.querySelector(":scope > span:nth-of-type(2) > span:first-child")?.classList.contains("text-on-ink"));
    const fig = el.querySelector(".figure");
    return { title: fig?.nextElementSibling?.textContent.trim() ?? "", now, count: fig?.firstChild?.textContent.trim() ?? "", steps: lis.length };
  });
  const key = (st) => `${st.title}|${st.now}|${st.count}`;
  const WINDOW = 3000;
  const btn = await page.$('#inventory-demo button[aria-pressed]');
  const label = () => page.evaluate((b) => `${b.textContent.trim()} pressed=${b.getAttribute("aria-pressed")}`, btn);
  const r0 = await state(); await sleep(WINDOW); const r1 = await state();
  const b1 = await label();
  await btn.click(); await sleep(300);
  const b2 = await label();
  const p0 = await state(); await sleep(WINDOW); const p1 = await state();
  await btn.click(); await sleep(300);
  const b3 = await label();
  const q0 = await state(); await sleep(WINDOW); const q1 = await state();
  await page.screenshot({ path: join(OUT, "demo-1440.png") });
  evidence.visualReview.screenshots.push("demo-1440.png");
  await page.close();
  const seen = `실행 중 ${key(r0)} → ${key(r1)}; 정지 '${b2}' ${key(p0)} → ${key(p1)}; 재개 '${b3}' ${key(q0)} → ${key(q1)}`;
  if (!r0.steps || r0.now < 0 || !r0.count) throw new Error(`진행 상태를 읽지 못함: ${JSON.stringify(r0)}`);
  if (b1 === b2 || b2 === b3) throw new Error(`버튼이 바뀌지 않음: ${b1} / ${b2} / ${b3}`);
  if (key(r0) === key(r1)) throw new Error(`누르기 전에도 멈춰 있음 — ${seen}`);
  if (key(p0) !== key(p1)) throw new Error(`정지 중에도 진행함 — ${seen}`);
  if (key(q0) === key(q1)) throw new Error(`재개 뒤에도 멈춰 있음 — ${seen}`);
  return `재고 시연 '${b1}' → '${b2}' → '${b3}': ${seen}`;
});

writeFileSync(join(OUT, "runtime.json"), JSON.stringify(evidence, null, 2));
await browser.close();
const bad = [...evidence.viewports.filter((v) => v.scrollWidth > v.clientWidth + 1 || v.clipped.length || !(v.heroHeight < v.height)), ...evidence.pages.filter((p) => p.scrollWidth > p.clientWidth + 1 || p.brokenImages.length || p.loadingErrors.length || p.missingTitle), ...evidence.interactions.filter((i) => !i.passed)];
console.log(JSON.stringify({ viewports: evidence.viewports.map((v) => [v.width, v.clientWidth, v.scrollWidth, v.heroHeight, v.height, v.clipped.length]), problems: bad, heroFrames: evidence.motion.hero.length, caseFrames: evidence.motion.case.length }, null, 1));
