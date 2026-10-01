/**
 * 줄바꿈 검수 — 의미 단위가 줄 끝에서 쪼개지는 곳을 찾는다.
 *
 * qa_layout 은 요소가 겹치거나 넘치는지를 보고, 이쪽은 **글이 어디서 끊기는지**를 본다.
 * 정적 검사로는 절대 안 잡힌다. 폭이 정해져야 비로소 생기는 결함이라
 * 실제로 그려 놓고 글자마다 줄 위치를 재는 수밖에 없다.
 *
 * 잡는 것 세 가지
 *   P 괄호 쪼개짐 — "(내부 / 실측 기준)" 처럼 여는 괄호와 닫는 괄호가 다른 줄에 있는 것
 *   U 단위 끊김   — "2 / 시간", "583 / %" 처럼 수와 단위가 갈라진 것
 *   A 화살표 고립 — "→" 만 줄 끝이나 줄 머리에 혼자 남은 것
 *
 * 실행: node scripts/qa_wrap.mjs
 */
import { spawn } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { createBrowserProfile } from "./browser_profile_runtime.mjs";

const BROWSER = process.env.QA_BROWSER || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const OUT = "out";
const PORT = 8900 + Math.floor(Math.random() * 400);
/* qa_layout 과 같은 폭을 쓴다 — 360 이 실사용 최저폭이고 거기서 가장 많이 깨진다 */
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
if (!basePath) { console.error("out/ 이 어느 판인지 못 읽었다 — 먼저 빌드해라"); process.exit(1); }
const edition = BASE[basePath];

function pages(dir = OUT, acc = []) {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) pages(p, acc);
    else if (n === "index.html") acc.push(p.replace(/\\/g, "/").replace(`${OUT}/`, "").replace(/index\.html$/, ""));
  }
  return acc;
}
const routes = pages().filter((r) => !r.startsWith("_") && !r.startsWith("404"));

const server = spawn(process.execPath, ["scripts/serve_export.mjs", edition, OUT, String(PORT)], { stdio: "ignore" });
await sleep(900);

const dbg = 9400 + Math.floor(Math.random() * 300);
const browser = spawn(
  BROWSER,
  ["--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run",
   `--remote-debugging-port=${dbg}`, `--user-data-dir=${createBrowserProfile("wrap")}`, "about:blank"],
  { stdio: "ignore" },
);
let targets;
for (let i = 0; i < 80 && !targets; i += 1) {
  try { targets = await (await fetch(`http://127.0.0.1:${dbg}/json/list`)).json(); } catch { await sleep(250); }
}
if (!targets) { browser.kill(); server.kill(); throw new Error("브라우저가 붙지 않았다"); }

const socket = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
let reqId = 0;
const pending = new Map();
socket.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { pending.get(m.id)(m.result); pending.delete(m.id); }
});
await new Promise((r) => socket.addEventListener("open", r));
const send = (method, params = {}) => new Promise((r) => { const id = ++reqId; pending.set(id, r); socket.send(JSON.stringify({ id, method, params })); });

/*
 * 페이지 안에서 도는 검사.
 * 글자마다 Range 로 줄 위치를 재는 것은 비싸므로, 문제가 생길 수 있는 글(괄호·수치·화살표)이
 * 든 텍스트 노드만 고른 뒤 그 안에서만 잰다.
 */
const PROBE = `(async()=>{
  await document.fonts.ready;
  await new Promise(r=>setTimeout(r,250));
  const UNIT='%|시간|분|초|개|건|종|명|원|배|회|호|쪽|억|만|천|px|pt';
  const RE_TARGET=new RegExp('[()]|→|[0-9](\\\\s|&nbsp;)*('+UNIT+')');
  const hits=[];
  const walker=document.createTreeWalker(document.querySelector('main')||document.body,NodeFilter.SHOW_TEXT);
  const nodes=[];
  while(walker.nextNode()){
    const n=walker.currentNode, t=n.nodeValue;
    if(!t||t.trim().length<3||t.length>500) continue;
    const el=n.parentElement;
    if(!el||el.closest('details:not([open])')) continue;
    if(el.checkVisibility&&!el.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})) continue;
    if(!RE_TARGET.test(t)) continue;
    /*
     * 본문에서 괄호가 줄을 넘어가는 것은 정상 조판이다 — 그것까지 잡으면 검사기가
     * 매번 늑대를 부른다. 문제가 되는 자리는 **수치를 크게 보여 주는 칸**이다.
     * 거기서는 줄이 짧아 조각이 남고, 큰 활자라 그 조각이 그대로 눈에 띈다.
     * 그래서 글자 크기 17px 이상인 곳만 본다.
     */
    const fs=parseFloat(getComputedStyle(el).fontSize)||0;
    if(fs<17) continue;
    nodes.push(n);
  }
  const lineOf=(n,i)=>{const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+1);
    const b=r.getClientRects()[0]; return b?Math.round(b.top):null;};
  for(const n of nodes){
    const t=n.nodeValue;
    const tops=new Array(t.length).fill(null);
    for(let i=0;i<t.length;i++){ if(t[i]===' '||t[i]==='\\n') continue; tops[i]=lineOf(n,i); }
    const seen=[...new Set(tops.filter(v=>v!==null))];
    if(seen.length<2) continue;                       // 한 줄이면 볼 것 없다
    const ctx=s=>t.slice(Math.max(0,s-26),s+30).replace(/\\s+/g,' ').trim();
    // ① 괄호 쪼개짐
    const stack=[];
    for(let i=0;i<t.length;i++){
      if(t[i]==='('){stack.push(i);}
      else if(t[i]===')'&&stack.length){
        const o=stack.pop();
        /* 긴 괄호가 본문에서 줄을 넘어가는 것은 정상 조판이다. 문제는 수치에 붙은
           짧은 기준 문구가 갈라지는 것 — "(내부 / 실측 기준)" 처럼 조각이 남는다.
           그래서 괄호 안이 18자 이하일 때만 결함으로 본다. */
        if(i-o-1<=18&&tops[o]!==null&&tops[i]!==null&&tops[o]!==tops[i]) hits.push('P|'+ctx(o));
      }
    }
    // ② 수와 단위가 갈라짐
    const ru=new RegExp('([0-9])(\\\\s*)('+UNIT+')','g'); let m;
    while((m=ru.exec(t))){
      const a=m.index, b=m.index+m[1].length+m[2].length;
      if(tops[a]!==null&&tops[b]!==null&&tops[a]!==tops[b]) hits.push('U|'+ctx(a));
    }
    // ③ 화살표가 줄 끝·줄 머리에 혼자
    for(let i=0;i<t.length;i++){
      if(t[i]!=='→'||tops[i]===null) continue;
      const same=[];
      for(let j=0;j<t.length;j++) if(tops[j]===tops[i]) same.push(t[j]);
      if(same.join('').trim()==='→') hits.push('A|'+ctx(i));
    }
  }
  return [...new Set(hits)];
})()`;

const findings = [];
await send("Page.enable");
for (const w of WIDTHS) {
  await send("Emulation.setDeviceMetricsOverride", { width: w, height: 900, deviceScaleFactor: 1, mobile: w < 768 });
  for (const r of routes) {
    await send("Page.navigate", { url: `http://127.0.0.1:${PORT}${basePath}/${r}` });
    await sleep(w < 768 ? 700 : 550);
    const res = await send("Runtime.evaluate", { expression: PROBE, awaitPromise: true, returnByValue: true });
    for (const h of res?.result?.value || []) findings.push({ w, r: r || "/", h });
  }
}

socket.close(); browser.kill(); server.kill();

const KIND = { P: "괄호 쪼개짐", U: "단위 끊김", A: "화살표 고립" };
console.log(`\n=== 줄바꿈 검수 · ${edition} · 폭 ${WIDTHS.join("·")} · ${routes.length}쪽 ===\n`);
if (!findings.length) {
  console.log("통과 — 위반 0건 (괄호·단위·화살표가 줄에서 갈라진 곳 없음)\n");
  process.exit(0);
}
const seen = new Set();
for (const f of findings) {
  const [k, ...rest] = f.h.split("|");
  const key = `${k}|${rest.join("|")}`;
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(`  ✗ ${KIND[k]} · ${f.w}px · ${f.r}\n      "${rest.join("|")}"`);
}
console.log(`\n위반 ${seen.size}건\n`);
process.exit(1);
