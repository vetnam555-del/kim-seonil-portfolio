// 실제로 쓰는 상태(스스로 도는 움직임) · 움직임 줄이기 · 스크립트 꺼짐에서 제안 D 가 제대로 보이는지 본다.
// Usage: node live_d.mjs <base url>/mock-d.html
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
const url = process.argv[2];
const browser = await chromium.launch();
const probe = async (label, opts) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, ...opts });
  const p = await ctx.newPage(); const errors = []; p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await p.goto(url, { waitUntil: "load" }); await p.waitForTimeout(3200);
  const r = await p.evaluate(() => {
    const op = (s) => { const e = document.querySelector(s); return e ? +getComputedStyle(e).opacity : null; };
    const cls = document.documentElement.className;
    const m = document.getElementById("marq"); const t1 = m ? getComputedStyle(m).transform : "";
    const hidden = [...document.querySelectorAll("main *")].filter((e) => { const cs = getComputedStyle(e); const b = e.getBoundingClientRect(); return b.top < innerHeight && b.height > 0 && +cs.opacity < 0.99 && !e.closest("[aria-hidden=true]") && e.children.length === 0; }).length;
    return { cls, heroTitle: op(".hero-line"), heroBottom: op(".hero-bottom"), count: document.querySelector(".proof-val b").textContent, marq: t1, hiddenInFirstScreen: hidden };
  });
  await p.waitForTimeout(600);
  const t2 = await p.evaluate(() => { const m = document.getElementById("marq"); return m ? getComputedStyle(m).transform : ""; });
  console.log(label, JSON.stringify({ ...r, marqMoves: r.marq !== t2, errors }));
  await ctx.close();
};
await probe("움직임 켬   ", {});
await probe("움직임 줄이기", { reducedMotion: "reduce" });
await probe("스크립트 끔 ", { javaScriptEnabled: false });
await browser.close();
