// 실제로 쓰는 상태(스스로 도는 움직임)로 쪽을 끝까지 내려 본 뒤, 화면 안에 아직 흐리거나 숨은 글이 남는지 본다.
// 창이 아주 높으면(4K · 세로 모니터) 쪽 끝의 글이 '나타나는 선'까지 올라오지 못할 수 있다 — 그때도 다 보여야 한다.
// Usage: node end_d.mjs <base url>/mock-d.html
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const url = process.argv[2];
const sizes = [[390, 844], [430, 932], [1024, 1366], [1440, 900], [1920, 1080], [2560, 1440], [1080, 1920], [3840, 2160]];
const browser = await chromium.launch();
let bad = 0;
for (const [w, h] of sizes) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 600, hasTouch: w < 600 });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "load" });
  await p.evaluate(() => document.fonts.ready);
  const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
  for (let y = 0; y < total; y += Math.round(h * 0.6)) { await p.evaluate((v) => window.scrollTo(0, v), y); await p.waitForTimeout(260); }
  await p.evaluate((v) => window.scrollTo(0, v), total);
  await p.waitForTimeout(2600);
  const left = await p.evaluate(() => {
    const vh = innerHeight; const out = [];
    for (const el of document.querySelectorAll("main *, footer *")) {
      if (el.closest("[aria-hidden=true]")) continue;
      const own = [...el.childNodes].some((n) => n.nodeType === 3 && n.nodeValue.trim());
      if (!own && el.tagName !== "IMG") continue;
      const b = el.getBoundingClientRect(); if (b.height === 0 || b.bottom <= 0 || b.top >= vh) continue;
      let op = 1; for (let e = el; e && e !== document.documentElement; e = e.parentElement) op *= +getComputedStyle(e).opacity;
      if (op < 0.99) out.push(`${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} "${(el.textContent || el.alt || "").trim().slice(0, 14)}" ${op.toFixed(2)}`);
    }
    return out;
  });
  if (left.length) bad += 1;
  console.log(`[${w}×${h}] 쪽 끝에서 아직 흐린 글 ${left.length}${left.length ? " → " + left.slice(0, 6).join(" | ") : ""}`);
  await ctx.close();
}
await browser.close();
process.exitCode = bad ? 1 : 0;
