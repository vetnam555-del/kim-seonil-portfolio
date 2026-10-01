/**
 * 공개용 이력서 PDF 생성 (playwright 없이 CDP 로).
 *
 * 이 PDF 는 채용 담당자가 실제로 내려받는 파일이라, 화면과 내용이 어긋나면 안 된다.
 * 그런데 화면은 코드에서 매번 새로 렌더되는 반면 PDF 는 public/ 에 박제된 정적 파일이라,
 * 이름·직함·수치를 고쳐도 PDF 만 옛 내용으로 남는 사고가 실제로 있었다(영문 표기).
 * 그래서 내용이 바뀌면 이 스크립트를 다시 돌리고, 마지막에 본문을 검증한다.
 *
 * 사용:
 *   1) 빌드된 out/ 을 로컬에서 서빙 (기본 http://127.0.0.1:8123)
 *   2) node scripts/print_resume_cdp.mjs [origin]
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createBrowserProfile, removeOwnedBrowserProfile } from "./browser_profile_runtime.mjs";

const CHROME =
  process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const ORIGIN = process.argv[2] || "http://127.0.0.1:8123";
const BASE = process.env.BASE_PATH ?? "/kim-seonil-portfolio_HLL";
/*
 * public/ 이 아니라 out/ 에 직접 쓴다.
 * public/ 은 빌드 시작 시점에 out/ 으로 복사되므로, 빌드 뒤에 public/ 에 써 봐야
 * 이번 배포물에는 반영되지 않는다. 게다가 이력서 본문은 판마다 다르므로(직함·사내 이동 문장)
 * 한 파일을 두 판이 공유하면 일반판에 HLL 전용 문장이 실린 PDF 가 나간다.
 * 판을 빌드한 직후 그 out/ 안에서 인쇄해 덮어쓴다.
 */
const OUT = path.resolve("out", "kim-seonil-resume-public.pdf");
/*
 * 포트와 프로필은 실행마다 새로 잡는다. 예전에는 9570 과 tmp/print-profile 로 고정돼
 * 있었는데, 인쇄 도중 크롬이 비정상 종료하면 그 프로필의 잠금 파일과 포트가 남아
 * 이후 모든 판의 빌드가 "chrome 기동 실패"로 죽었다. 실제로 그렇게 네 판이 연달아
 * 막혔고, 원인이 빌드 내용이 아니라 남은 잠금이라는 것을 알아채는 데 시간이 걸렸다.
 * qa_layout.mjs 가 이미 같은 이유로 랜덤 포트와 PID 별 프로필을 쓴다 — 그 방식에 맞춘다.
 */
const PORT = 9570 + (process.pid % 300);
const PROFILE = createBrowserProfile("print-profile");
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn(
  CHROME,
  [
    "--headless=new", "--disable-gpu", "--no-first-run",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    "--window-size=1440,1000", "about:blank",
  ],
  { stdio: "ignore" },
);

/* 크롬을 끄고, 공통 helper가 이번 실행에서 만든 것으로 확인한 프로필만 지운다. */
function shutdown() {
  try { proc.kill(); } catch {}
  try { removeOwnedBrowserProfile(PROFILE); } catch {}
}

let targets = null;
for (let i = 0; i < 60; i++) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json();
    break;
  } catch {
    await sleep(500);
  }
}
if (!targets) {
  console.error("chrome 기동 실패");
  shutdown();
  process.exit(1);
}

const ws = new WebSocket(targets.find((t) => t.type === "page").webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
ws.addEventListener("message", (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
  }
});
await new Promise((r) => ws.addEventListener("open", r));
const send = (method, params = {}) =>
  new Promise((res) => {
    const i = ++id;
    pending.set(i, res);
    ws.send(JSON.stringify({ id: i, method, params }));
  });

await send("Page.enable");
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false,
});
await send("Page.navigate", { url: `${ORIGIN}${BASE}/resume/` });
await sleep(6000);
/* 지연 로딩 이미지와 등장 연출을 모두 확정시킨 뒤 인쇄한다 */
await send("Runtime.evaluate", {
  expression: `(async()=>{document.querySelectorAll('img').forEach(i=>i.loading='eager');
    const d=document.documentElement;
    for(let y=0;y<d.scrollHeight;y+=700){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,20));}
    window.scrollTo(0,0);await document.fonts.ready;})()`,
  awaitPromise: true,
});
await sleep(1500);
/*
 * 인쇄 직전에 '지금 화면이 어느 판인가'를 확인한다.
 * PDF 파일만 보고는 어느 판에서 나왔는지 알 수 없다. 실제로 두 판이 public/ 의 한 파일을
 * 공유해, 사외 지원용인 일반판이 사내 메일과 HLL 판 주소가 박힌 PDF 를 내려주고 있었다.
 */
const 판 = process.env.RESUME_EDITION ?? "hll";
const 검사 = await send("Runtime.evaluate", {
  expression:
    "(()=>{const t=document.body.innerText;return{" +
    "work:(t.match(/kim\\.seonill@hll\\.kr/g)||[]).length," +
    "hllUrl:t.includes('kim-seonil-portfolio_HLL')," +
    "anyUrl:t.includes('kim-seonil-portfolio')};})()",
  returnByValue: true,
});
const v = 검사?.result?.value ?? {};
const 문제 = [];
if (판 !== "hll" && v.work > 0) 문제.push(`사외 지원판에 사내 메일 ${v.work}회`);
if (판 !== "hll" && v.hllUrl) 문제.push("사외 지원판에 HLL 판 주소");
if (판 === "hll" && !v.hllUrl) 문제.push("hll 판인데 HLL 주소가 없다 — 다른 판을 인쇄했다");
if (!v.anyUrl) 문제.push("포트폴리오 주소가 없다 — 렌더 실패로 보인다");
if (문제.length) {
  console.error(`FAIL — 인쇄 대상 화면이 ${판} 판과 맞지 않습니다: ${문제.join(", ")}`);
  ws.close();
  shutdown();
  process.exit(1);
}
console.log(`인쇄 대상 확인 — ${판} 판 (사내 메일 ${v.work}회)`);

/*
 * 사진 없는 판.
 * 쿠팡 같은 곳은 지원서에 "동의서에 명시된 항목 이외의 개인정보는 제출하지 말라"고
 * 못 박아 두는데, 그 목록(성명·연락처·이메일·국적·학력·경력·자격)에 사진은 없다.
 * 기본 출력은 그대로 두고, 필요할 때만 RESUME_NO_PHOTO=1 로 사진을 빼서 인쇄한다.
 */
if (process.env.RESUME_NO_PHOTO === "1") {
  await send("Runtime.evaluate", {
    expression:
      /* 조상까지 숨기면 이름·연락처가 든 머리글 블록이 통째로 사라진다.
         (처음에 closest('div') 를 껐다가 1쪽 머리글을 통째로 날렸다.) 이미지만 끈다. */
      "(()=>{const i=document.querySelector('img[alt*=\"프로필 사진\"]');" +
      "if(!i)return 'none';i.style.setProperty('display','none','important');return 'hidden';})()",
    returnByValue: true,
  }).then((r) => console.log(`사진 제외 — ${r?.result?.value}`));
  await sleep(300);
}

/*
 * 로컬 서버 주소를 공개 주소로 바꾼다.
 * 이 페이지는 http://127.0.0.1:8123 에서 인쇄되는데, 케이스로 가는 링크가 basePath
 * 기준 절대경로라 인쇄된 PDF 안에 그대로 127.0.0.1 이 박힌다. 화면에는 안 보이고
 * 본문 검증도 글자만 보기 때문에 세 판 모두 한참을 그렇게 나갔다 — 받는 사람이
 * 케이스 링크를 누르면 아무 데도 가지 않는다. 인쇄 직전에 갈아 끼우고, 남아 있으면
 * 인쇄를 중단한다.
 */
const PUBLIC_ORIGIN = "https://vetnam555-del.github.io";
const 링크 = await send("Runtime.evaluate", {
  expression:
    "(()=>{const o=" + JSON.stringify(ORIGIN) + ",p=" + JSON.stringify(PUBLIC_ORIGIN) + ";" +
    "let n=0;document.querySelectorAll('a[href]').forEach(a=>{" +
    "if(a.href.startsWith(o)){a.href=p+a.href.slice(o.length);n++;}});" +
    /* 정규식을 문자열 안에 넣으면 역슬래시가 한 겹 벗겨져 점이 와일드카드가 된다.
       여기서는 그냥 문자열 검색으로 둔다. */
    "const bad=h=>h.indexOf('127.0.0.1')>=0||h.indexOf('localhost')>=0;" +
    "const left=[...document.querySelectorAll('a[href]')].map(a=>a.href).filter(bad);" +
    "return{n,left};})()",
  returnByValue: true,
});
const L = 링크?.result?.value ?? {};
if ((L.left ?? []).length) {
  console.error("FAIL — 인쇄본에 로컬 주소가 남았습니다: " + L.left.join(", "));
  ws.close();
  shutdown();
  process.exit(1);
}
console.log("링크 공개 주소로 교체 — " + (L.n ?? 0) + "개");

await send("Emulation.setEmulatedMedia", { media: "print" });
await sleep(600);

const pdf = await send("Page.printToPDF", {
  printBackground: true,
  preferCSSPageSize: true,
  scale: 0.8,
  marginTop: 0, marginBottom: 0, marginLeft: 0, marginRight: 0,
});
fs.writeFileSync(OUT, Buffer.from(pdf.data, "base64"));
ws.close();
shutdown();

const kb = Math.round(fs.statSync(OUT).size / 1024);
console.log(`이력서 PDF 생성: ${OUT} (${kb} KB)`);
if (kb < 40) {
  console.error("FAIL — 파일이 너무 작습니다. 렌더 실패로 보입니다.");
  process.exit(1);
}
