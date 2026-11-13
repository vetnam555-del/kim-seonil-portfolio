// 보완안 C 를 지금 화면과 기계로 견준다: (1) 보이는 글이 빠지지 않았나 (2) 가로 넘침 (3) 글자 대비 (4) 누르는 곳 크기.
// 먼저 render_c.mjs 로 mock-now.html · mock-c.html 을 만들어 둔다.
// Usage: node check_c.mjs <base url>
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const [, , baseUrl] = process.argv;
const browser = await chromium.launch();

const collect = async (page) => page.evaluate(() => {
  const norm = (s) => s.replace(/[⁠​]/g, "").replace(/\s+/g, " ").trim();
  const visible = (el) => {
    for (let e = el; e && e !== document.body; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === "none" || cs.visibility === "hidden") return false;
      if (e.classList.contains("sr-only") || e.hasAttribute("hidden")) return false;
    }
    const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0;
  };
  const texts = [];
  const w = document.createTreeWalker(document.querySelector("main"), NodeFilter.SHOW_TEXT);
  while (w.nextNode()) { const n = w.currentNode; const t = norm(n.nodeValue); if (!t) continue; if (!visible(n.parentElement)) continue; texts.push(t); }
  return texts;
});

const open = async (name, width, height) => {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, reducedMotion: "reduce", isMobile: width < 600, hasTouch: width < 600 });
  const p = await ctx.newPage();
  await p.goto(`${baseUrl}/${name}`, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(250);
  return { ctx, p };
};

let fail = 0;
// ── 1) 글이 빠지지 않았나 — 보이는 글자를 이어 붙여 견준다(요소를 옮기면 조각 경계가 달라지므로 낱말 묶음으로 본다)
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const a = await open("mock-now.html", w, h); const b = await open("mock-c.html", w, h);
  const now = await collect(a.p); const c = await collect(b.p);
  const bag = (list) => { const m = new Map(); for (const ch of list.join("").replace(/\s/g, "")) m.set(ch, (m.get(ch) || 0) + 1); return m; };
  const bn = bag(now); const bc = bag(c);
  let missing = ""; for (const [ch, n] of bn) { const have = bc.get(ch) || 0; if (have < n) missing += ch.repeat(n - have); }
  let added = ""; for (const [ch, n] of bc) { const had = bn.get(ch) || 0; if (n > had) added += ch.repeat(n - had); }
  // 조각 단위로도 본다: 지금 화면의 글 조각 가운데 C 의 이어 붙인 글에 없는 것
  const joined = c.join("").replace(/\s/g, "");
  const gone = now.filter((t) => t.replace(/\s/g, "").length > 1 && !joined.includes(t.replace(/\s/g, "")));
  console.log(`[글 ${w}px] 지금 ${now.join("").replace(/\s/g, "").length}자 · C ${joined.length}자 · 빠진 글자 "${missing}" · 더해진 글자 "${added}" · 통째로 없는 조각 ${gone.length}${gone.length ? " → " + gone.map((t) => t.slice(0, 30)).join(" | ") : ""}`);
  await a.ctx.close(); await b.ctx.close();
}

// ── 2) 가로 넘침 · 3) 대비 · 4) 누르는 곳
for (const [w, h] of [[360, 640], [390, 844], [768, 1024], [1024, 768], [1280, 585], [1440, 900]]) {
  const { ctx, p } = await open("mock-c.html", w, h);
  const r = await p.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const over = [...document.querySelectorAll("main *, footer *")].filter((el) => { const b = el.getBoundingClientRect(); return b.width > 0 && b.height > 0 && (b.right > vw + 1 || b.left < -1) && getComputedStyle(el).position !== "absolute"; })
      .slice(0, 6).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} ${Math.round(el.getBoundingClientRect().left)}–${Math.round(el.getBoundingClientRect().right)}`);
    // 대비: 글자색과, 위로 올라가며 처음 만나는 불투명 바탕색
    const lum = (r, g, b) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
    const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(",").map((x) => parseFloat(x)); return { r: v[0], g: v[1], b: v[2], a: v.length > 3 ? v[3] : 1 }; };
    const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e); const c = parse(cs.backgroundColor); if (c && c.a > 0.95) return c; if (cs.backgroundImage !== "none" && e !== el) return null; } return { r: 255, g: 255, b: 255, a: 1 }; };
    const low = []; let checked = 0;
    const roots = document.querySelectorAll("#career, #capabilities, #projects, #automation, #contact");
    for (const root of roots) {
      const w2 = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      while (w2.nextNode()) {
        const n = w2.currentNode; if (!n.nodeValue.trim()) continue; const el = n.parentElement; const cs = getComputedStyle(el);
        const rect = el.getBoundingClientRect(); if (!rect.width || cs.visibility === "hidden" || el.closest(".sr-only,[aria-hidden=true],.folio-demo")) continue;
        const fg = parse(cs.color); const bg = bgOf(el); if (!fg || !bg) continue;
        // 반투명 글자색은 바탕과 섞는다
        const mix = (f, b2) => f.a >= 1 ? f : { r: f.r * f.a + b2.r * (1 - f.a), g: f.g * f.a + b2.g * (1 - f.a), b: f.b * f.a + b2.b * (1 - f.a) };
        const op = parseFloat(cs.opacity); const f2 = mix({ ...fg, a: fg.a * (Number.isFinite(op) ? op : 1) }, bg);
        const L1 = lum(f2.r, f2.g, f2.b); const L2 = lum(bg.r, bg.g, bg.b); const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const size = parseFloat(cs.fontSize); const bold = parseInt(cs.fontWeight, 10) >= 700; const large = size >= 24 || (size >= 18.66 && bold);
        checked += 1;
        if (ratio < (large ? 3 : 4.5)) low.push(`${ratio.toFixed(2)} ${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} "${n.nodeValue.trim().slice(0, 18)}" ${Math.round(size)}px`);
      }
    }
    // 누르는 곳: 링크 · 버튼의 높이(휴대폰 기준 44px). 문장 안 링크는 뺀다
    const small = [...document.querySelectorAll("#career a, #capabilities a, #projects a, #automation a, #automation button, #contact a")]
      .filter((a) => { const b = a.getBoundingClientRect(); return b.width > 0 && b.height > 0 && b.height < 43.5 && !a.closest("[aria-hidden=true]"); })
      .map((a) => `${Math.round(a.getBoundingClientRect().height)}px "${a.textContent.trim().slice(0, 14)}"`);
    return { docW: document.documentElement.scrollWidth, vw, total: document.documentElement.scrollHeight, over, low: [...new Set(low)].slice(0, 14), checked, small: [...new Set(small)].slice(0, 12) };
  });
  const bad = r.docW > r.vw || r.over.length;
  if (bad) fail += 1;
  console.log(`[${w}×${h}] 쪽 너비 ${r.docW}/${r.vw} · 길이 ${r.total} · 넘침 ${r.over.length ? r.over.join(" ; ") : "0"} · 대비 미달 ${r.low.length}/${r.checked}${r.low.length ? " → " + r.low.join(" | ") : ""}${w < 600 ? ` · 44px 미만 ${r.small.length}${r.small.length ? " → " + r.small.join(" | ") : ""}` : ""}`);
  await ctx.close();
}
await browser.close();
process.exit(fail ? 1 : 0);
