/*
 * 대체 글꼴 폭 재기 (B-18 · 2026.11.13) — globals.css 의 "Pretendard Fallback KR · Num · Alpha · Space" 가 쓰는 size-adjust 의 근거.
 *
 * 웹 글꼴(Pretendard)은 첫 그림 뒤에 붙는다. 그 사이 Android · 리눅스가 쓰는 시스템 글꼴(Noto Sans CJK KR · Roboto)과 폭이 다르면
 * 줄 수가 달라져 글꼴이 붙는 순간 화면이 밀린다. 이 스크립트는 그 차이와, 차이가 만드는 밀림(CLS)을 잰다.
 *
 *   node scripts/measure_font_fallback.cjs ratio [사이트 주소]          글자 묶음 · 굵기마다 필요한 size-adjust 와 지금 어긋난 정도
 *   node scripts/measure_font_fallback.cjs swap  [사이트 주소] [--off]   글꼴을 1.2초 늦춰 쪽마다 CLS. --off 는 폭 맞춤을 끈 값(고치기 전)
 *   … --pages /,/about/ --widths 360,390,430,1440                       swap 의 쪽 · 폭(기본: 16쪽 × 4폭)
 *
 * 사이트 주소 기본값은 로컬 미리보기다: node scripts/serve_export.mjs general .. 8154
 *
 * 준비 — 그 두 글꼴이 있어야 Android 를 흉내 낸다(클라우드 컨테이너에는 없다. 없으면 이 스크립트가 멈추고 알려 준다):
 *   apt-get update && apt-get install -y --no-install-recommends fonts-noto-cjk fonts-roboto
 *   ~/.config/fontconfig/fonts.conf 에 system-ui · sans-serif 를 Roboto → Noto Sans CJK KR 로 잇는 alias 를 두고 fc-cache -f
 *     <alias binding="strong"><family>system-ui</family><prefer><family>Roboto</family><family>Noto Sans CJK KR</family></prefer></alias>
 *     (sans-serif 도 같게)
 * iOS · macOS(Apple SD Gothic Neo)와 Windows(맑은 고딕)는 여기서 잴 수 없다 — 그 글꼴이 없다(BACKLOG B-19).
 * 여기서 재는 것도 실제 Android 기기가 아니라 같은 글꼴을 깐 Chromium 이다. 기본 한글 글꼴이 다른 기기는 기기에서 봐야 한다(B-19).
 */
const { chromium } = require("playwright");

const args = process.argv.slice(2);
const mode = args[0] === "swap" ? "swap" : "ratio";
const base = (args.find((a) => /^https?:/.test(a)) || "http://127.0.0.1:8154/kim-seonil-portfolio").replace(/\/+$/, "");
const opt = (flag, fallback) => { const i = args.indexOf(flag); return i >= 0 && args[i + 1] ? args[i + 1] : fallback; };
const OFF = args.includes("--off");
const PAGES = opt("--pages", "/?intro=0,/about/,/resume/,/projects/jestina/,/projects/newbalance/,/projects/gangwon/,/projects/daekyo/,/projects/automation/,/projects/dyson/,/projects/edith/,/projects/hanssem/,/projects/ktalpha/,/en/?intro=0,/en/about/,/en/resume/,/en/projects/jestina/").split(",");
const WIDTHS = opt("--widths", "360,390,430,1440").split(",").map(Number);
/* 폭 맞춤을 끈 글꼴 순서 — 2026.11.13 전의 값 */
const OLD_STACKS = `:root{--font-sans:"Pretendard","Apple SD Gothic Neo","Malgun Gothic",system-ui,sans-serif !important;--font-display:"Archivo","Pretendard",system-ui,sans-serif !important;--font-mono:"JetBrains Mono","Pretendard","Apple SD Gothic Neo","Malgun Gothic",ui-monospace,"SFMono-Regular",Menlo,Consolas,monospace !important}`;

/* 글자 묶음마다 재는 표본 — globals.css 의 글꼴 넷(KR · Num · Alpha · Space)과 같은 묶음이다 */
const CLASSES = {
  "한글 (KR)": { text: "가나다라마바사아자차강원심층수스토어", system: '"Noto Sans CJK KR"', systemWeight: 400 },
  "숫자 (Num)": { text: "0123456789", system: "system-ui" },
  "영문 (Alpha)": { text: "IsplitJESTINAssearchheavybudgetbycustomerstageInthesameclosingreportGAROASrosefrominMaytoinJuly", system: "system-ui" },
};

async function ratio(browser) {
  const page = await (await browser.newContext({ viewport: { width: 1200, height: 800 } })).newPage();
  await page.goto(`${base}/?intro=0`, { waitUntil: "load" });
  await page.evaluate(() => window.__ksiFontsReady || document.fonts.ready);
  await page.waitForTimeout(500);
  const out = await page.evaluate((classes) => {
    const width = (family, weight, text) => {
      const s = document.createElement("span");
      s.style.cssText = `position:absolute;visibility:hidden;white-space:nowrap;font:${weight} 1000px ${family}`;
      s.textContent = text;
      document.body.appendChild(s);
      const w = s.getBoundingClientRect().width;
      s.remove();
      return w;
    };
    const has = (family) => width(`"${family}",monospace`, 400, "가나다 0123") !== width("monospace", 400, "가나다 0123");
    const sans = getComputedStyle(document.documentElement).getPropertyValue("--font-sans").trim();
    const now = sans.replace(/^"Pretendard",\s*/, "");
    const rows = [];
    for (const weight of [400, 600, 700, 900]) {
      for (const [name, c] of Object.entries(classes)) {
        const p = width("Pretendard", weight, c.text);
        rows.push({ weight, name, need: (100 * p) / width(c.system, c.systemWeight || weight, c.text), fitted: width(now, weight, c.text) / p });
      }
      /* 빈칸은 글자 사이에 넣어 잰다. Roboto 의 빈칸은 굵기가 달라도 같아서 Regular 를 기준으로 삼는다 */
      const gap = (family, w) => width(family, w, "가 가 가 가 가") - width(family, w, "가가가가가");
      rows.push({ weight, name: "빈칸 (Space)", need: (100 * gap("Pretendard", weight)) / gap("Roboto", 400), fitted: gap(now, weight) / gap("Pretendard", weight) });
    }
    return { rows, noto: has("Noto Sans CJK KR"), roboto: has("Roboto"), sans };
  }, CLASSES);
  if (!out.noto || !out.roboto) {
    console.error(`시스템에 ${[!out.noto && "Noto Sans CJK KR", !out.roboto && "Roboto"].filter(Boolean).join(" · ")} 이(가) 없다 — 파일 머리의 '준비'대로 깐 뒤 다시 잰다.`);
    process.exitCode = 2;
    return;
  }
  console.log(`--font-sans: ${out.sans}\n`);
  console.log("굵기  글자 묶음        필요한 size-adjust    지금 폭 ÷ Pretendard");
  let off = 0;
  for (const r of out.rows) {
    const bad = Math.abs(r.fitted - 1) > 0.01;
    if (bad) off += 1;
    console.log(`${String(r.weight).padEnd(5)} ${r.name.padEnd(14)}  ${r.need.toFixed(2).padStart(7)}%            ×${r.fitted.toFixed(3)}${bad ? "   ← 1% 넘게 어긋난다" : ""}`);
  }
  console.log(off ? `\n${off}곳이 1% 넘게 어긋난다 — globals.css 의 size-adjust 를 '필요한' 값으로, qa_interactions 의 기대값도 같이 고친다.` : "\n모든 묶음이 Pretendard 와 1% 안이다.");
  if (off) process.exitCode = 1;
}

async function swap(browser) {
  const rows = [];
  for (const path of PAGES) {
    for (const w of WIDTHS) {
      const mobile = w < 768;
      const ctx = await browser.newContext({ viewport: { width: w, height: mobile ? 800 : 900 }, isMobile: mobile, hasTouch: mobile });
      const page = await ctx.newPage();
      await page.route("**/*.woff2", async (route) => { await new Promise((r) => setTimeout(r, 1200)); await route.continue(); });
      await page.addInitScript((css) => {
        window.__cls = 0;
        window.__worst = { v: 0, n: "" };
        new PerformanceObserver((list) => {
          for (const e of list.getEntries()) {
            if (e.hadRecentInput) continue;
            window.__cls += e.value;
            if (e.value > window.__worst.v) {
              const node = (e.sources || [])[0] && e.sources[0].node;
              window.__worst = { v: e.value, n: node ? String(node.className || node.nodeName).split(" ")[0] : "" };
            }
          }
        }).observe({ type: "layout-shift", buffered: true });
        if (!css) return;
        const add = () => { const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st); };
        if (document.head) add();
        else new MutationObserver((_, o) => { if (document.head) { o.disconnect(); add(); } }).observe(document, { childList: true, subtree: true });
      }, OFF ? OLD_STACKS : "");
      await page.goto(base + path, { waitUntil: "load" });
      await page.waitForTimeout(3200);
      const r = await page.evaluate(() => ({ cls: window.__cls, worst: window.__worst, pending: document.documentElement.classList.contains("fonts-pending") }));
      rows.push({ path, w, cls: r.cls });
      console.log(`${path.padEnd(24)} ${String(w).padStart(4)}px  CLS ${r.cls.toFixed(4)}${r.pending ? "  (글꼴이 아직 안 붙었다 — 기다리는 시간을 늘린다)" : ""}${r.worst.v >= 0.002 ? `  가장 큰 밀림 ${r.worst.v.toFixed(4)} ${r.worst.n}` : ""}`);
      await ctx.close();
    }
  }
  const sum = rows.reduce((a, r) => a + r.cls, 0);
  const max = rows.reduce((a, r) => (r.cls > a.cls ? r : a), rows[0]);
  console.log(`\n${OFF ? "폭 맞춤 끔" : "폭 맞춤 켬"} — ${rows.length}번 불러옴 · CLS 합계 ${sum.toFixed(4)} · 최대 ${max.cls.toFixed(4)} (${max.path} ${max.w}px) · 0.1 넘는 곳 ${rows.filter((r) => r.cls > 0.1).length} · 0.01 넘는 곳 ${rows.filter((r) => r.cls > 0.01).length}`);
}

(async () => {
  const browser = await chromium.launch();
  try {
    if (mode === "swap") await swap(browser);
    else await ratio(browser);
  } finally {
    await browser.close();
  }
})();
