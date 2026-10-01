/**
 * OG 이미지 생성 — 대표 1장 + 케이스 9장.
 *
 * 이전엔 모든 페이지가 og-image.png 한 장을 공유했다 — 링크를 공유하면 어느 사례인지
 * 구분되지 않고, 이 사이트의 가장 강한 자산(수치와 기여 범위)이 미리보기 단계에서 사라졌다.
 *
 * 렌더는 표지와 같은 문법을 쓴다: 다크 지면 + 대형 수치 + 로어서드(기여 범위·기준).
 *
 * ── 이 스크립트가 실제로 사고를 냈던 지점 세 가지 (2026.08.17 수정)
 * 1) 대표 og-image.png 를 아예 만들지 않았다. public/ 에 2026.08.14 자 옛 디자인
 *    파일이 남아 있었고, 거기에 **210% → 583%** 가 대형으로 박혀 있었다.
 *    210% 는 기준이 다른 값이라 사이트가 큰 글자로 쓰지 않기로 정한 수치인데,
 *    링크를 공유하면 가장 먼저 보이는 자리에 그게 있었다.
 * 2) 마스트헤드가 "PERFORMANCE MARKETER" 로 하드코딩돼 있었다. hll 판은
 *    BRAND SOLUTION MARKETER 인데 두 판이 같은 이미지를 썼다.
 * 3) CASES 를 손으로 관리해서 본문과 어긋났다 — 본문을 69호로 고친 뒤에도
 *    OG 만 "70호 · 평일 매일" 로 남아 있었다.
 *
 * 그래서 판별로 out/ 에 쓴다(이력서 PDF 와 같은 이유 — 두 판의 내용이 다르다).
 * 값을 바꿀 때는 반드시 src/data 의 같은 값과 함께 고친다.
 *
 * playwright 를 쓰지 않는다(미설치). Chrome 을 --remote-debugging-port 로 띄워
 * CDP Page.captureScreenshot 으로 찍는다.
 *
 * 실행: EDITION=hll node scripts/render_og_cases.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createBrowserProfile } from "./browser_profile_runtime.mjs";

const CHROME =
  process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const PORT = 9455;
const ROOT = process.cwd();
const PROFILE = createBrowserProfile("og-profile");
/* public/ 이 아니라 out/ 에 쓴다 — 판마다 마스트헤드와 대표 수치가 다르다 */
const OUT = path.join(ROOT, "out", "og");
const FONT_DIR = path.join(ROOT, "public", "fonts", "original");

const EDITION = ["general", "hll", "shinsegae", "ably", "v260908", "nw"].includes(process.env.EDITION)
  ? process.env.EDITION
  : "hll";
/* src/data/edition.ts 의 mastheadLeft 와 같은 값이어야 한다 */
const MASTHEAD = {
  general: "KIM SEONILL — PERFORMANCE MARKETER",
  shinsegae: "KIM SEONILL — DIGITAL CRM & COMMERCE GROWTH",
  ably: "KIM SEONILL — GROWTH FOR NEW BUSINESS",
  hll: "KIM SEONILL — PERFORMANCE TO CONTENT GROWTH",
}[EDITION];

/** projects.ts 를 파싱하지 않고, 빌드된 데이터와 같은 값을 여기 한 벌만 둔다. */
const CASES = [
  ...(EDITION === "shinsegae"
    ? [
        {
          slug: "samsonite",
          brand: "쌤소나이트",
          before: "",
          after: "5,482명",
          label: "카카오톡채널 친구",
          note: "카카오톡채널 친구 수 · 캠페인 설계·운영 기여 100%",
        },
      ]
    : []),
  { slug: "jestina", brand: "제이에스티나", before: "352%", after: "583%", label: "GA4 ROAS", note: "2025.05 → 07 동일 마감보고 기준 · 전략·측정 75%" },
  { slug: "newbalance", brand: "뉴발란스", before: "약 2시간", after: "5분 이내", label: "재고·운영 점검 시간", note: "내부 일평균 실측 · 계정 운영 40% · 자동화 100%" },
  { slug: "daekyo", brand: "대교에듀캠프", before: "0.66%", after: "2.24%", label: "같은 표본으로 다시 잰 CVR", note: "서브 브랜드 5개 · 측정 QA 설계 100%" },
  /* 2026.09.24 — 홈 카드와 같이 리포트 원문이 있는 동영상 CTR 로 소개한다(채널 구독자는 원본 캡처 없음) */
  { slug: "dyson", brand: "다이슨", before: "2.16%", after: "3.14%", label: "동영상 광고 CTR", note: "2024.02 → 03 · Google Ads · 공동 기획 40%" },
  { slug: "gangwon", brand: "강원심층수 천년동안", before: "", after: "+397.3%", label: "스토어 판매금액", note: "2026.07 vs 전년 같은 기간 · 공동구매 포함 · 단독 계정 운영" },
  { slug: "automation", brand: "AI · 리포트 자동화", before: "", after: "6종", label: "직접 구축·운영 시스템", note: "기획 · 구축 · 운영 100%" },
  /* 본문과 함께 고칠 것 — 70호(VOL.001–070). 발행 주기 단서는 본문(projects.ts keyMetric)이
     자세히 적으므로 여기서는 기간과 호수만 둔다. OG 는 공유 카드라 검산까지 실을 자리가 없다 */
  /* 2026.09.24 — 본문(projects.ts keyMetric "공개 문서 89편")과 다시 어긋나 있어 맞췄다(76호로 남아 있었다) */
  { slug: "edith", brand: "EDIT H 뉴스레터 · 카드뉴스", before: "", after: "89편", label: "공개 문서", note: "2026.09.13 아카이브 확인 · 최신 공개 VOL.089 (2026.09.11) · 기획·편집·구축·발행 100% 단독" },
  { slug: "hanssem", brand: "한샘", before: "", after: "구매 기여 통합", label: "웹·앱 데이터", note: "2023.09 – 2024.02 · 역할 분리 문서 미보유" },
  { slug: "ktalpha", brand: "KT알파쇼핑", before: "", after: "채널 역할 분리", label: "합산 ROAS 재해석", note: "2025.04 – 2025.10 · 역할 분리 문서 미보유" },
];

/*
 * 대표 OG. 표지와 같은 것을 말해야 한다 — 판별 대표 수치 2개와 역할 정의 한 줄.
 * heroHeadlines 순서(edition.ts)와 맞춘다.
 */
const COVER = {
  hll: {
    deck: "제작 조직의 기획력을 대체하지 않고, 그 콘텐츠를 시청 유지·구독·재방문으로 잇습니다",
    figures: [
      { after: "107,600", label: "다이슨 YouTube 구독자", note: "2,000 → · 팀 성과 · 여정 설계 40%" },
      { after: "583%", label: "제이에스티나 GA4 ROAS", note: "352% → · 전략·측정 75%" },
    ],
  },
  general: {
    /* 사이트 첫 문장과 같아야 한다. 링크 미리보기와 실제 첫 화면이 다른 말을 하면
       공유받은 사람이 두 번 읽는다. generalProfile.title 을 바꾸면 여기도 바꾼다. */
    /* 2026.09.25 메인 카피 K+A 로 같이 바꿨다 (site.ts generalCover.display · statement) */
    display: 'FIND. TEST. <em>IMPROVE.</em>',
    deck: "문제를 구조화해 가설을 세우고, 테스트로 개선합니다.",
    /* 2026.09.26 첫 화면 성과 칸과 같은 두 값 — 구조 개선(제이에스티나) · 판매 확장(강원) */
    figures: [
      { after: "583%", label: "제이에스티나 GA4 ROAS", note: "352% → · 고객 단계별 예산 재설계 · 전략·측정 75%" },
      { after: "+397.3%", label: "강원심층수 스토어 판매금액", note: "2026.07 · 전년 같은 기간 대비 · 단독 계정 운영" },
    ],
  },
  ably: {
    deck: "무엇을 성과로 볼지 먼저 정하고, 작게 실험해 확인한 뒤, 구조로 남깁니다",
    figures: [
      { after: "2.24%", label: "대교에듀캠프 재산출 CVR", note: "0.66% → · 측정 QA 설계 100%" },
      { after: "583%", label: "제이에스티나 GA4 ROAS", note: "352% → · 전략·측정 75%" },
    ],
  },
  shinsegae: {
    deck: "고객을 나누어 이해하고, 행동에 맞게 제안하며, 다음 관계까지 설계합니다",
    figures: [
      { after: "5,482명", label: "쌤소나이트 카카오톡채널 친구", note: "카카오톡채널 친구 수" },
      { after: "583%", label: "제이에스티나 GA4 ROAS", note: "352% → · 고객 단계별 채널·예산 재설계" },
    ],
  },
}[EDITION];

const b64 = (f) => fs.readFileSync(path.join(FONT_DIR, f)).toString("base64");

function html(c) {
  const arrow = c.before
    ? `<span class="before">${c.before}</span><span class="arrow">→</span>`
    : "";
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(data:font/woff2;base64,${b64("Pretendard-Bold.woff2")}) format("woff2");font-weight:700}
@font-face{font-family:P;src:url(data:font/woff2;base64,${b64("Pretendard-Regular.woff2")}) format("woff2");font-weight:400}
@font-face{font-family:A;src:url(data:font/woff2;base64,${b64("Archivo-Var.woff2")}) format("woff2-variations");font-weight:100 900;font-stretch:62% 125%}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0b0d10;color:#f4f1ea;font-family:P,sans-serif;
     padding:64px 72px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;justify-content:space-between;font-size:17px;letter-spacing:.12em;color:#8b93a0}
.brand{font-size:26px;font-weight:700;color:#f4f1ea;letter-spacing:-.01em}
.label{font-size:22px;color:#a8b0ba;margin-top:6px}
.row{display:flex;align-items:baseline;gap:18px;margin-top:10px}
.before{font-family:A;font-size:44px;font-weight:600;color:#8b93a0;font-stretch:100%}
.arrow{font-size:38px;color:#8b93a0}
.after{font-family:A;font-size:${c.after.length > 8 ? 92 : 132}px;font-weight:800;font-stretch:118%;
       letter-spacing:-.035em;line-height:.9;color:#f4f1ea}
.note{font-size:19px;color:#8b93a0;border-top:1px solid #2b3038;padding-top:16px;line-height:1.5}
.who{font-size:19px;color:#e8ae45;letter-spacing:.06em}
</style><body>
<div class="top"><span>${MASTHEAD}</span><span class="who">${c.slug.toUpperCase()}</span></div>
<div>
  <div class="brand">${c.brand}</div>
  <div class="label">${c.label}</div>
  <div class="row">${arrow}<span class="after">${c.after}</span></div>
</div>
<div class="note">${c.note}</div>
</body>`;
}

/** 대표 OG — 케이스 OG 와 같은 지면 문법을 쓰되 수치를 둘 나란히 둔다 */
function coverHtml() {
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:P;src:url(data:font/woff2;base64,${b64("Pretendard-Bold.woff2")}) format("woff2");font-weight:700}
@font-face{font-family:P;src:url(data:font/woff2;base64,${b64("Pretendard-Regular.woff2")}) format("woff2");font-weight:400}
@font-face{font-family:A;src:url(data:font/woff2;base64,${b64("Archivo-Var.woff2")}) format("woff2-variations");font-weight:100 900;font-stretch:62% 125%}
*{margin:0;box-sizing:border-box}
body{width:1200px;height:630px;background:#0b0d10;color:#f4f1ea;font-family:P,sans-serif;
     padding:60px 72px;display:flex;flex-direction:column;justify-content:space-between}
.top{display:flex;justify-content:space-between;font-size:17px;letter-spacing:.12em;color:#8b93a0}
/* 두 줄이 될 때 "…합니 / 다" 처럼 끝 음절만 떨어지지 않게 한다 — 본문 조판과 같은 처리 */
.deck{font-size:31px;font-weight:700;line-height:1.42;letter-spacing:-.02em;max-width:1000px;
      text-wrap:balance;word-break:keep-all}
.disp{font-family:A;font-size:64px;font-weight:800;font-stretch:125%;letter-spacing:-.02em;line-height:1;white-space:nowrap;margin-bottom:14px}
.disp em{font-style:normal;color:#ff5a3d}
.figs{display:flex;gap:64px}
.fig{flex:1}
.after{font-family:A;font-size:84px;font-weight:800;font-stretch:118%;letter-spacing:-.035em;
       line-height:.92;color:#f4f1ea}
.flabel{font-size:20px;font-weight:700;margin-top:12px}
.fnote{font-size:16px;color:#8b93a0;margin-top:5px;line-height:1.5}
.foot{display:flex;justify-content:space-between;align-items:baseline;
      border-top:1px solid #2b3038;padding-top:16px;font-size:18px;color:#8b93a0}
.nm{font-size:21px;font-weight:700;color:#f4f1ea}
</style><body>
<div class="top"><span>${MASTHEAD}</span><span style="color:#ff5a3d">PORTFOLIO 2026</span></div>
<div>${COVER.display ? `<div class="disp">${COVER.display}</div>` : ""}<div class="deck">${COVER.deck}</div></div>
<div class="figs">
${COVER.figures
  .map(
    (f) =>
      `<div class="fig"><div class="after">${f.after}</div><div class="flabel">${f.label}</div><div class="fnote">${f.note}</div></div>`,
  )
  .join("")}
</div>
<div class="foot"><span class="nm">김선일 <span style="font-weight:400;font-size:17px;color:#8b93a0">KIM SEONILL</span></span><span>팀 성과와 개인 기여를 분리해 표기합니다</span></div>
</body>`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const proc = spawn(
  CHROME,
  [
    "--headless=new", "--disable-gpu", "--hide-scrollbars", "--no-first-run", "--no-sandbox",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    "--window-size=1200,630", "about:blank",
  ],
  { stdio: "ignore" },
);

fs.mkdirSync(OUT, { recursive: true });

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
  proc.kill();
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
  width: 1200, height: 630, deviceScaleFactor: 1, mobile: false,
});

/* 크롬은 최상위 프레임의 data: URL 이동을 차단한다(Chrome 60+). 임시 파일로 띄운다. */
const TMP = path.join(ROOT, "tmp", "og-src");
fs.mkdirSync(TMP, { recursive: true });

/** 한 장 찍어서 저장하고, 빈 화면이 저장되는 사고를 막는다 */
async function shoot(name, markup, dest) {
  const file = path.join(TMP, `${name}.html`);
  fs.writeFileSync(file, markup, "utf8");
  await send("Page.navigate", { url: "file:///" + file.replace(/\\/g, "/") });
  await sleep(1100);
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 },
  });
  fs.writeFileSync(dest, Buffer.from(shot.data, "base64"));
  const kb = Math.round(fs.statSync(dest).size / 1024);
  /* 다크 지면이라 정상 렌더는 30KB 를 넘는다 — 12KB 미만이면 흰 화면이 찍힌 것이다 */
  if (kb < 12) {
    console.error(`  FAIL ${path.basename(dest)} ${kb}KB — 렌더 실패로 보임(빈 화면)`);
    process.exitCode = 1;
    return false;
  }
  console.log("  wrote %s  (%d KB)", path.relative(path.join(ROOT, "out"), dest), kb);
  return true;
}

/* 대표 OG 를 먼저 찍는다 — 링크 미리보기에서 가장 먼저 보이는 자리다 */
await shoot("cover", coverHtml(), path.join(ROOT, "out", "og-image.png"));

for (const c of CASES) {
  await shoot(c.slug, html(c), path.join(OUT, `${c.slug}.png`));
}

ws.close();
proc.kill();
console.log("OG 이미지 %d장 생성 완료 (대표 1 + 케이스 %d · %s판)", CASES.length + 1, CASES.length, EDITION);
