/**
 * 배치 검수 — 빌드된 모든 페이지를 폭 세 가지로 열어 화면이 깨지는 곳을 찾는다.
 *
 * qa_final 은 사실과 구조를, qa_tone 은 문장을 본다. 이쪽은 렌더 결과만 본다.
 * 정적 검사로는 안 잡히는 것들이다 — 가로 넘침, 깨진 이미지, 비율이 뭉개진 도판,
 * 컨테이너를 삐져나온 요소, 서로 겹친 글자.
 *
 * capture_section_cdp.mjs 와 같은 방식으로 헤드리스 Edge 를 CDP 로 붙인다
 * (이 저장소에는 puppeteer 가 없다).
 *
 * 실행: npm run qa:layout  ·  node scripts/qa_layout.mjs [general|hll|shinsegae|ably]
 */
import { spawn } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createBrowserProfile } from "./browser_profile_runtime.mjs";

const BROWSER = process.env.QA_BROWSER || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = "out";
const PORT = 8500 + Math.floor(Math.random() * 400);
/*
 * 360 을 넣은 이유: 히어로 규모 수치를 375·768·1440 만 보고 배포했더니 360px 에서
 * 라벨이 두 줄로 접히고 320px 에서는 값이 갈라졌다. 실사용 최저폭은 375 가 아니라
 * 360(갤럭시 A 계열)이다. 320 은 넣지 않는다 — 지금 지면이 그 폭까지는 보장하지 않고,
 * 넣으면 매번 "알고 있는 degrade" 를 다시 판정해야 한다.
 */
const WIDTHS = [360, 375, 768, 1440];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const BASE = {
  "/kim-seonil-portfolio_HLL": "hll",
  "/kim-seonil-portfolio_shinsegae": "shinsegae",
  "/kim-seonil-portfolio_ABLY": "ably",
  /* 접두사가 겹치므로 일반판보다 먼저 놓는다 */
  "/kim-seonil-portfolio_260908": "v260908",
  "/kim-seonil-portfolio_new": "nw",
  "/kim-seonil-portfolio": "general",
};
const basePath = Object.keys(BASE).find((b) => readFileSync(join(OUT, "index.html"), "utf8").includes(`${b}/_next/`));
if (!basePath) {
  console.error("out/ 이 어느 판인지 못 읽었다 — 먼저 빌드해라");
  process.exit(1);
}
const edition = BASE[basePath];

/* 내보낸 html 을 그대로 페이지 목록으로 쓴다 — 새 페이지가 늘어도 검사에서 빠지지 않는다 */
function pages(dir = OUT, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) pages(p, acc);
    else if (n === "index.html") acc.push(p.replace(/\\/g, "/").replace(`${OUT}/`, "").replace(/index\.html$/, ""));
  }
  return acc;
}
const routes = pages().filter((r) => !r.startsWith("_") && !r.startsWith("404"));

/* ── 정적 서버 ────────────────────────────────────────── */
const server = spawn(process.execPath, ["scripts/serve_export.mjs", edition, OUT, String(PORT)], { stdio: "ignore" });
await sleep(900);

/* ── 헤드리스 브라우저 ────────────────────────────────── */
const dbg = 9700 + Math.floor(Math.random() * 300);
const browser = spawn(
  BROWSER,
  ["--headless=new", "--disable-gpu", "--disable-extensions", "--disable-background-networking",
   "--hide-scrollbars", "--no-first-run",
   `--remote-debugging-port=${dbg}`, `--user-data-dir=${createBrowserProfile("layout")}`, "about:blank"],
  { stdio: "ignore" },
);
let targets;
for (let i = 0; i < 80 && !targets; i += 1) {
  try { targets = await (await fetch(`http://127.0.0.1:${dbg}/json/list`)).json(); } catch { await sleep(250); }
}
if (!targets) { browser.kill(); server.kill(); throw new Error("브라우저가 붙지 않았다"); }

const pageTarget =
  targets.find((t) => t.type === "page" && t.url === "about:blank") ??
  targets.find((t) => t.type === "page");
if (!pageTarget) { browser.kill(); server.kill(); throw new Error("검수용 빈 탭을 찾지 못했다"); }

const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
let reqId = 0;
const pending = new Map();
socket.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    const request = pending.get(m.id);
    clearTimeout(request.timer);
    request.resolve(m.result);
    pending.delete(m.id);
  }
});
await new Promise((r) => socket.addEventListener("open", r));
const send = (method, params = {}) => new Promise((resolveRequest, rejectRequest) => {
  const id = ++reqId;
  const timer = setTimeout(() => {
    pending.delete(id);
    rejectRequest(new Error(`CDP 응답 시간 초과: ${method}`));
  }, 120_000);
  pending.set(id, { resolve: resolveRequest, reject: rejectRequest, timer });
  socket.send(JSON.stringify({ id, method, params }));
});
socket.addEventListener("close", () => {
  for (const request of pending.values()) {
    clearTimeout(request.timer);
    request.reject(new Error("검수용 브라우저 탭 연결이 종료됐다"));
  }
  pending.clear();
});

/*
 * 페이지 안에서 도는 검사.
 *  - 가로 넘침은 문서 전체 기준으로만 센다. 마퀴·섹션 내비처럼 스스로 스크롤하는
 *    칸 안에서 요소가 밖으로 나가는 것은 정상이라, 조상에 overflow 가 걸려 있으면 넘긴다.
 *  - 비율 검사는 object-fit 이 걸린 이미지를 뺀다 (잘라 쓰는 것이지 뭉개는 것이 아니다).
 */
const PROBE = `(async()=>{
  document.querySelectorAll('img').forEach(i=>{i.loading='eager'});
  await document.fonts.ready;
  const root=document.documentElement;
  for(let y=0;y<root.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}
  window.scrollTo(0,0); await new Promise(r=>setTimeout(r,400));
  const W=innerWidth, out={w:W,h:document.body.scrollHeight,overflow:root.scrollWidth-root.clientWidth,broken:[],ratio:[],spill:[],overlap:[],cramped:[]};
  for(const i of document.images){
    if(!i.complete||i.naturalWidth===0){out.broken.push((i.currentSrc||i.src||'(empty)').split('/').pop());continue;}
    const r=i.getBoundingClientRect(); if(r.width<4) continue;
    if(getComputedStyle(i).objectFit!=='fill') continue;
    const n=i.naturalWidth/i.naturalHeight, d=r.width/r.height;
    const expected=r.width/n; if(Math.abs(n-d)/n>0.02 && Math.abs(expected-r.height)>3) out.ratio.push(i.currentSrc.split('/').pop()+' '+n.toFixed(2)+'->'+d.toFixed(2));
  }
  const clipped=e=>{for(let p=e.parentElement;p;p=p.parentElement){const o=getComputedStyle(p);if(/(auto|scroll|hidden|clip)/.test(o.overflowX)||/(auto|scroll|hidden|clip)/.test(o.overflow))return true;}return false;};
  for(const e of document.querySelectorAll('main *')){
    const r=e.getBoundingClientRect();
    if(r.width===0||r.height===0) continue;
    if((r.right>W+1||r.left<-1)&&!clipped(e)) out.spill.push(e.tagName+'.'+(e.className||'').toString().trim().split(/\\s+/)[0]);
  }
  const shown=e=>e.checkVisibility?e.checkVisibility({checkOpacity:true,checkVisibilityCSS:true,contentVisibilityAuto:true}):!!e.offsetParent;
  const leaves=[...document.querySelectorAll('main p, main li, main h1, main h2, main h3, main figcaption')]
    .filter(e=>e.getBoundingClientRect().height>0&&shown(e)&&!e.closest('details:not([open])'));
  for(let a=0;a<leaves.length;a++){
    const ra=leaves[a].getBoundingClientRect();
    for(let b=a+1;b<leaves.length;b++){
      const rb=leaves[b].getBoundingClientRect();
      if(leaves[a].contains(leaves[b])||leaves[b].contains(leaves[a])) continue;
      const ox=Math.min(ra.right,rb.right)-Math.max(ra.left,rb.left);
      const oy=Math.min(ra.bottom,rb.bottom)-Math.max(ra.top,rb.top);
      if(ox>8&&oy>8) out.overlap.push(leaves[a].tagName+'×'+leaves[b].tagName+' '+Math.round(ox)+'x'+Math.round(oy));
    }
  }
  /*
   * 칸 넘침 (2026.09.25) — 줄바꿈이 막힌 글자가 자기 칸을 넘어 옆 칸 위에 그려지는 것.
   * 영문판에서 "under 5 min" 이 3단 결과 칸을 56px, 강원 표지 라벨이 68px 넘어 옆 글자와 겹쳤는데
   * 위 검사들은 요소 상자 기준이라 못 잡았다(상자는 칸 폭 그대로이고 글자만 밖으로 나간다).
   */
  for(const e of document.querySelectorAll('main *, header *')){
    if(e.closest('[aria-hidden="true"], .sr-only, svg, .count-up-visual, details:not([open])')||clipped(e)) continue;
    const cs=getComputedStyle(e); if(cs.whiteSpace!=='nowrap'||cs.textOverflow==='ellipsis'||!shown(e)) continue;
    const r=e.getBoundingClientRect(); if(r.width===0) continue;
    let cell=e.parentElement; while(cell&&getComputedStyle(cell).display.startsWith('inline')) cell=cell.parentElement;
    const over=Math.max(e.scrollWidth-e.clientWidth, cell?r.right-cell.getBoundingClientRect().right:0);
    if(over>2) out.cramped.push(Math.round(over)+'px '+(e.innerText||'').trim().replace(/\\s+/g,' ').slice(0,30));
  }
  out.spill=[...new Set(out.spill)].slice(0,5); out.overlap=[...new Set(out.overlap)].slice(0,4); out.cramped=[...new Set(out.cramped)].slice(0,4);
  return out;
})()`;

await send("Page.enable");
await send("Runtime.enable");

let fail = 0;
const rows = [];
console.log(`\n=== 배치 검수 · ${edition} · ${routes.length}쪽 × ${WIDTHS.length}폭 ===\n`);
for (const w of WIDTHS) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 });
  for (const r of routes) {
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${basePath}/${r}` });
    await sleep(1400);
    const res = await send("Runtime.evaluate", { expression: PROBE, awaitPromise: true, returnByValue: true });
    const v = res?.result?.value;
    if (!v) { console.log(`  ✗ ${w}px ${r || "/"} — 검사 실패`); fail += 1; continue; }
    const bad = [];
    if (v.overflow > 1) bad.push(`가로 넘침 ${v.overflow}px`);
    if (v.broken.length) bad.push(`깨진 이미지 ${v.broken.length}건 (${v.broken.slice(0, 2).join(", ")})`);
    if (v.ratio.length) bad.push(`비율 왜곡 ${v.ratio.join(", ")}`);
    if (v.spill.length) bad.push(`컨테이너 이탈 ${v.spill.join(", ")}`);
    if (v.overlap.length) bad.push(`겹침 ${v.overlap.join(", ")}`);
    if (v.cramped.length) bad.push(`칸 넘침 ${v.cramped.join(", ")}`);
    rows.push({ w, r: r || "/", h: v.h, bad });
    if (bad.length) { fail += 1; console.log(`  ✗ ${w}px ${r || "/"}\n      ${bad.join("\n      ")}`); }
  }
}

/* 페이지 길이는 실패가 아니라 눈금이다 — 케이스끼리 편차가 크면 읽는 부담이 갈린다 */
const tall = rows.filter((x) => x.w === 1440 && x.r.startsWith("projects/")).sort((a, b) => b.h - a.h);
if (tall.length) {
  console.log("\n  케이스 페이지 길이 (1440px)");
  for (const t of tall) console.log(`    ${String(t.h).padStart(6)}px  ${t.r}`);
  const ratio = tall[0].h / tall[tall.length - 1].h;
  console.log(`    가장 긴 쪽이 가장 짧은 쪽의 ${ratio.toFixed(1)}배`);
}

console.log(fail === 0 ? `\n통과 — 위반 0건\n` : `\n실패 ${fail}건\n`);
socket.close(); browser.kill(); server.kill();
process.exit(fail === 0 ? 0 : 1);
