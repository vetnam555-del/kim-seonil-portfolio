// 제안 D — 검정 바탕 · 큰 글자 · 움직임. 홈 전체(첫 화면 포함)를 새로 짠다.
// 글 · 링크 · 이미지 주소는 extract.mjs 가 지금 홈에서 읽어 온 content.json 것만 쓴다(문장을 다시 치지 않는다 · 빼지도 않는다).
// 상자(카드)를 쓰지 않는다: 가는 줄과 여백, 큰 제목과 작은 본문의 대비로 나눈다. 색은 검정 · 흰색 · 빨강 하나.
// 움직임은 engine() 하나가 시간 t 와 스크롤 위치로 계산한다 — 스크롤을 가로채지 않고, 움직임 줄이기 설정이면 멈춘 화면을 그대로 보여 준다.

const E = (s) => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const toNum = (t) => {
  const s = String(t).replace(/[⁠,]/g, "");
  let m = s.match(/([\d.]+)\s*시간/); if (m) return parseFloat(m[1]) * 60;
  m = s.match(/([\d.]+)\s*분/); if (m) return parseFloat(m[1]);
  m = s.match(/[\d.]+/); return m ? parseFloat(m[0]) : NaN;
};
/** 막대 둘(회색 = 전 · 빨강 = 후, 0부터 같은 척도). 증감률만 있으면 기준 100 대비(지금 첫 화면의 강원심층수 칸과 같은 방식).
 *  사이트의 막대 규칙(src/components/Bars.tsx canChart)을 따른다 — 값이 줄어드는 지표(약 2시간 → 5분 이내)와 배율이 6배를 넘는 쌍은 그리지 않는다.
 *  작은 막대가 점으로 찌그러져 깨진 그림으로 보인다. 그때는 큰 숫자만 둔다. */
const bars = (before, value) => {
  let a; let b;
  if (before) { a = toNum(before); b = toNum(value); } else { const n = toNum(value); if (!/^\s*\+/.test(value) || !Number.isFinite(n)) return ""; a = 100; b = 100 + n; }
  if (!(a > 0) || !(b > a) || b / a > 6) return "";
  const w = (v) => ((v / b) * 100).toFixed(1);
  return `<span class="bars" aria-hidden="true"><i style="--w:${w(a)}%"></i><i style="--w:${w(b)}%"></i></span>`;
};
/** 올라가는 숫자: 한글이 섞이지 않은 값만. 전 값이 같은 단위면 거기서부터 센다 */
const count = (before, value) => {
  const m = String(value).match(/^([+\-−]?)(\d+(?:\.\d+)?)(%?)$/); if (!m) return "";
  const dec = (m[2].split(".")[1] || "").length;
  const bm = before ? String(before).match(/(\d+(?:\.\d+)?)(%?)/) : null;
  const from = bm && bm[2] === m[3] ? bm[1] : "0";
  return ` data-count data-from="${from}" data-to="${m[2]}" data-dec="${dec}" data-pre="${E(m[1])}" data-suf="${E(m[3])}"`;
};
const arrow = (ext) => `<span aria-hidden="true">${ext ? "↗" : "→"}</span>`;

export function build(d, opt = {}) {
  const A = opt.asset || ((p) => p);
  const brands = d.career.brands.split(/\s+·\s+/);
  const noteHtml = d.hero.note.map((x) => `<span class="say-sent">${x.replace("9개 업종 30여 개 브랜드", "<b>9개 업종 30여 개 브랜드</b>")}</span>`).join(" ");
  const autoTitle = E(d.auto.title).replace(/(\d+종)$/, '<span class="n">$1</span>');
  const face = (cls) => `<span class="hero-face ${cls}"><img src="${A(d.hero.photo.src)}" alt="${cls === "is-d" ? E(d.hero.photo.alt) : ""}" width="354" height="472"></span>`;
  const [w1, w2] = d.hero.display[0].split(" ");

  const body = `
<a class="skip" href="#main">본문 바로가기</a>
<header class="hd" id="hd"><div class="wrap hd-in">
  <a class="hd-name" href="#hero">${E(d.header.name.split(" ")[0])}<span>${E(d.header.name.split(" ").slice(1).join(" "))}</span></a>
  <nav class="hd-nav" aria-label="주요 메뉴">
    ${d.header.nav.slice(0, 4).map((n) => `<a class="t" href="${E(n.href)}">${E(n.text)}</a>`).join("")}
    <a class="box" href="${E(d.header.nav[4].href)}">${E(d.header.nav[4].text)}</a>
    <a class="box red t2" href="${E(d.header.nav[5].href)}">${E(d.header.nav[5].text)}</a>
    <span class="hd-lang"><b>KO</b> / EN</span>
  </nav>
</div></header>

<main id="main">
<section class="hero" id="hero">
  <div class="wrap">
    <div class="hero-top" data-rv>
      <p class="hero-who">${E(d.hero.eyebrow)}</p>
      <p class="hero-org"><i></i>${E(d.hero.org)}</p>
    </div>
    <h1 class="hero-title">
      <span class="hero-line" lang="en" data-rv data-d="80"><span class="hw">${E(w1)}</span>${face("is-m")}<span class="hw">${E(w2)}</span></span>
      <span class="hero-line red" lang="en" data-rv data-d="200"><span class="hw">${E(d.hero.display[1])}</span>${face("is-d")}</span>
      <span class="hero-sub" data-rv data-d="340">${d.hero.sub.map((s) => `<span>${E(s)}</span>`).join(" ")}</span>
    </h1>
    <div class="hero-mid" data-rv data-d="420">
      <ul class="hero-strengths">${d.hero.strengths.map((s) => `<li><span aria-hidden="true">${E(s.no)}</span>${E(s.text)}</li>`).join("")}</ul>
      <div class="hero-actions">
        <a class="pill solid" href="${E(d.hero.actions[0].href)}">${E(d.hero.actions[0].text)} <span aria-hidden="true">↓</span></a>
        <a class="pill" href="${E(d.hero.actions[1].href)}">${E(d.hero.actions[1].text)}</a>
        <a class="link u" href="${E(d.hero.actions[2].href)}">${E(d.hero.actions[2].text)} ${arrow()}</a>
      </div>
    </div>
    <div class="hero-bottom" data-rv data-d="500">
      <ul class="proofs" aria-label="대표 결과 세 가지">
        ${d.hero.proofs.map((p) => `<li class="proof"><a href="${E(p.href)}">
          <span class="proof-val en">${p.before ? `<span class="b">${E(p.before)}</span>` : ""}<b${count(p.before, p.value)}>${E(p.value)}</b></span>
          ${p.marks.length ? `<span class="marks" aria-hidden="true">${p.marks.map((m) => `<i>${E(m)}</i>`).join("")}</span>` : bars(p.before, p.value)}
          <span class="proof-label">${E(p.label)}</span><span class="proof-basis">${E(p.basis)}</span>
        </a></li>`).join("")}
      </ul>
    </div>
  </div>
</section>

<section class="say" aria-label="소개"><div class="wrap">
  <p class="say-text" data-fill>${noteHtml}</p>
</div></section>

<section class="brands" aria-label="${E(d.career.brandsLabel)}">
  <div class="wrap brands-head"><p class="label">${E(d.career.brandsLabel)}</p><button type="button" class="marq-btn" id="marq-btn" aria-pressed="false">${E(d.auto.demo.button)}</button></div>
  <div class="marquee"><div class="marquee-track" id="marq">
    <p class="marq-set">${brands.map((b) => `<span>${E(b)}</span>`).join('<i aria-hidden="true"></i>')}<i aria-hidden="true"></i></p>
    <p class="marq-set" aria-hidden="true">${brands.map((b) => `<span>${E(b)}</span>`).join("<i></i>")}<i></i></p>
  </div></div>
</section>

<section class="sec career" id="career"><div class="wrap">
  <header class="sec-head"><div><p class="kicker" lang="en">Career</p><h2 class="sec-title" data-rv>${E(d.career.label)}</h2></div>
    <a class="link u" href="${E(d.career.more.href)}">${E(d.career.more.text)} ${arrow()}</a></header>
  <ol class="jobs">
    ${d.career.jobs.map((j, i) => `<li class="job${i === 0 ? " is-now" : ""}" data-rv>
      <p class="job-when">${E(j.period)}</p>
      <div class="job-main"><h3>${E(j.title)}</h3><p>${j.sents.map((s) => `<span class="sent">${s}</span>`).join(" ")}</p></div>
      <p class="job-logo"><img src="${A(j.logo)}" alt="" height="20"></p>
    </li>`).join("")}
  </ol>
  <dl class="stack" data-rv>${d.career.stack.map((s) => `<div><dt>${E(s.label)}</dt><dd>${E(s.text)}</dd></div>`).join("")}</dl>
  <p class="label rec-label">${E(d.career.recordsLabel)}</p>
  <ul class="records" id="records">
    ${d.career.records.map((r) => `<li data-rv><a href="${E(r.href)}"${r.ext ? ' target="_blank" rel="noopener"' : ""}><b>${E(r.text)} ${arrow(r.ext)}</b><span>${E(r.sub)}</span></a></li>`).join("")}
  </ul>
</div></section>

<section class="loop" id="capabilities">
  <div class="sec loop-head"><div class="wrap"><header class="sec-head"><div><p class="kicker" lang="en">${E(d.loop.kicker)}</p><h2 class="sec-title" data-rv>${E(d.loop.title)}</h2></div>
    <a class="link u" href="${E(d.loop.more.href)}">${E(d.loop.more.text)} ${arrow()}</a></header></div></div>
  ${d.loop.steps.map((s) => `<article class="step" id="${E(s.id)}">
    <p class="step-ghost" lang="en" aria-hidden="true">${E(s.word)}</p>
    <div class="wrap step-grid">
      <div class="step-l">
        <p class="step-tag"><span class="en" lang="en">${E(s.word)}</span> · ${E(s.ko)}</p>
        <h3 class="step-line" data-fill>${E(s.line)}</h3>
        <p class="step-story">${s.sents.map((x) => `<span class="sent">${x}</span>`).join(" ")}</p>
        <p class="step-points">${E(s.points)}</p>
        <p class="step-proof"><span>${E(s.proofLabel)}</span>${s.proof.map((a) => `<a href="${E(a.href)}">${E(a.text)}</a>`).join("")}</p>
      </div>
      <div class="step-r" data-rv>
        <p class="step-num en">${s.before ? `<span class="b">${E(s.before)}</span>` : ""}<b${count(s.before, s.value)}>${E(s.value)}</b></p>
        ${bars(s.before, s.value)}
        <p class="step-name">${E(s.name)}</p>
        <p class="step-basis">${E(s.basis)}</p>
      </div>
    </div>
  </article>`).join("")}
</section>

<section class="work" id="projects">
  <div class="sec work-head"><div class="wrap"><header class="sec-head"><div><p class="kicker" lang="en">${E(d.work.kicker)}</p><h2 class="sec-title" data-rv>${E(d.work.title)}</h2><p class="lead">${E(d.work.lead)}</p></div></header></div></div>
  ${d.work.cases.map((c, ci) => `${ci === 2 ? '<div class="case-band"><div class="wrap case-row">' : ""}<article class="case${c.lg ? " is-lg" : " is-sm"}" id="${E(c.id)}"><div class="${c.lg ? "wrap " : ""}case-grid">
    <div class="case-info" data-rv>
      <p class="case-meta"><span class="no en">${E(c.no)}</span><span class="tag">${E(c.tag)}</span><span class="mono">${E(c.period)}</span></p>
      <h3 class="case-brand">${E(c.brand)}</h3>
      ${c.award ? `<p class="case-award">${E(c.award)}</p>` : ""}
      <p class="case-title"><a href="${E(c.href)}">${E(c.title)}</a></p>
      ${c.story ? `<p class="case-story">${E(c.story)}</p>` : ""}
      <p class="case-scope"><span>${E(c.scopeLabel)}</span>${E(c.scope)}</p>
      <p class="case-links"><a class="link u" href="${E(c.links[0].href)}">${E(c.links[0].text)} ${arrow()}</a><a class="link q" href="${E(c.links[1].href)}" target="_blank" rel="noopener">${E(c.links[1].text)} ${arrow(true)}</a></p>
    </div>
    <div class="case-visual">
      <a class="case-img" href="${E(c.href)}" tabindex="-1" aria-hidden="true"><img src="${A(c.img)}" alt="" loading="eager"></a>
      <div class="case-stat">
        <p class="case-num en">${c.before ? `<span class="b">${E(c.before)} →</span>` : ""}<b${count(c.before, c.value)}>${E(c.value)}</b></p>
        ${bars(c.before, c.value)}
        <p class="case-label">${E(c.label)}</p>
        <p class="case-basis">${E(c.basis)}</p>
      </div>
    </div>
  </div></article>${ci === d.work.cases.length - 1 ? "</div></div>" : ""}`).join("")}
  <div class="more"><div class="wrap">
    <p class="label">${E(d.work.moreLabel)}</p>
    <ul>${d.work.more.map((m) => `<li data-rv><a href="${E(m.href)}"><strong>${E(m.name)}</strong><span class="t">${E(m.text)}</span>${arrow()}</a></li>`).join("")}</ul>
  </div></div>
</section>

<section class="sec auto" id="automation"><div class="wrap">
  <header class="sec-head"><div><p class="kicker" lang="en">${E(d.auto.kicker)}</p><h2 class="sec-title auto-title" data-rv>${autoTitle}</h2><p class="lead" data-rv data-d="120">${E(d.auto.lead)}</p></div></header>
  <div class="demo" id="inventory-demo" data-rv>
    <div class="demo-head"><p><span class="s">${E(d.auto.demo.head[0])}</span><b>${E(d.auto.demo.head[1])}</b><span>${E(d.auto.demo.head[2])}</span></p><button type="button" id="demo-btn" aria-pressed="false">${E(d.auto.demo.button)}</button></div>
    <div class="demo-body">
      <div><p class="demo-k">${E(d.auto.demo.countLabel)}</p><p class="demo-count"><b class="en" id="demo-n">${E(d.auto.demo.count.split("/")[0].trim())}</b><span>/ ${E(d.auto.demo.count.split("/")[1].trim())}</span></p><p class="demo-status">${E(d.auto.demo.status)}</p></div>
      <ol class="demo-steps" id="demo-steps">${d.auto.demo.steps.map((s, i) => `<li${i === 0 ? ' class="on"' : ""}><span class="no">${E(s.no)}</span><b>${E(s.name)}</b><span>${E(s.text)}</span></li>`).join("")}</ol>
    </div>
  </div>
  <ol class="systems">${d.auto.systems.map((s) => `<li data-rv><span class="sys-no">${E(s.no)}</span><strong>${E(s.name)}</strong><span class="sys-built">${E(s.built)}</span><span class="sys-effect">${E(s.effect)}</span></li>`).join("")}</ol>
  <p class="auto-links"><a class="link u" href="${E(d.auto.links[0].href)}">${E(d.auto.links[0].text)} ${arrow()}</a><a class="link q" href="${E(d.auto.links[1].href)}">${E(d.auto.links[1].text)} ${arrow()}</a></p>
</div></section>

<section class="contact" id="contact"><div class="wrap">
  <p class="kicker" lang="en">${E(d.contact.kicker)}</p>
  <h2 class="contact-title" data-fill>${d.contact.title.map((t) => `<span>${E(t)}</span>`).join(" ")}</h2>
  <p class="contact-note">${E(d.contact.note)}</p>
  <a class="contact-email en" href="${E(d.contact.email.href)}" data-rv>${E(d.contact.email.text)}</a>
  <div class="contact-actions" data-rv>
    ${d.contact.actions.map((a, i) => `<a class="pill${i === 0 ? " solid" : ""}" href="${E(a.href)}"${a.ext ? ' target="_blank" rel="noopener"' : ""}>${E(a.text)}</a>`).join("")}
  </div>
  <p class="contact-about"><a class="link u" href="${E(d.contact.about.href)}">${E(d.contact.about.text)} ${arrow()}</a></p>
</div></section>
</main>

<footer class="ft"><div class="wrap">${d.footer.lines.reduce((acc, l) => { if (/^·/.test(l) && acc.length) acc[acc.length - 1] += " " + l; else acc.push(l); return acc; }, []).map((l) => `<p>${E(l)}</p>`).join("")}</div></footer>`;

  return `<!doctype html>
<html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>김선일 포트폴리오 — 제안 D (시안)</title><meta name="robots" content="noindex">
<style>${fontCss(A)}${css}</style></head>
<body>${body}
<script>(${engine.toString()})();</script>
</body></html>`;
}

const fontCss = (A) => `
@font-face{font-family:"Pretendard";src:url("${A("/kim-seonil-portfolio/fonts/Pretendard-Regular.woff2")}") format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:"Pretendard";src:url("${A("/kim-seonil-portfolio/fonts/Pretendard-SemiBold.woff2")}") format("woff2");font-weight:600;font-display:swap}
@font-face{font-family:"Pretendard";src:url("${A("/kim-seonil-portfolio/fonts/Pretendard-Bold.woff2")}") format("woff2");font-weight:700;font-display:swap}
@font-face{font-family:"Pretendard";src:url("${A("/kim-seonil-portfolio/fonts/Pretendard-Black.woff2")}") format("woff2");font-weight:900;font-display:swap}
@font-face{font-family:"Archivo";src:url("${A("/kim-seonil-portfolio/fonts/Archivo-Var.woff2")}") format("woff2-variations");font-weight:600 900;font-stretch:100% 125%;font-display:swap}
@font-face{font-family:"JetBrains Mono";src:url("${A("/kim-seonil-portfolio/fonts/JetBrainsMono-Var.woff2")}") format("woff2-variations");font-weight:100 800;font-display:swap}
`;

export const css = `
:root{--bg:#0b0d10;--fg:#f5f3ef;--mut:#a8b0ba;--dim:#7f8994;--line:#232b36;--line2:#3a4450;--red:#ff5a3d;--pad:40px;--ko:"Pretendard",system-ui,-apple-system,"Apple SD Gothic Neo","Malgun Gothic",sans-serif;--en:"Archivo","Pretendard",sans-serif;--mono:"JetBrains Mono",ui-monospace,monospace}
*,*::before,*::after{box-sizing:border-box}
html{background:var(--bg);-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--fg);font-family:var(--ko);font-size:16px;line-height:1.65;word-break:keep-all;overflow-wrap:break-word;-webkit-font-smoothing:antialiased;overflow-x:clip}
h1,h2,h3,p,ul,ol,dl,dd,dt,figure{margin:0;padding:0;font-weight:inherit;font-size:inherit}
ul,ol{list-style:none}
a{color:inherit;text-decoration:none}
img{display:block;max-width:100%}
button{font:inherit;color:inherit;background:none;border:0;cursor:pointer}
:focus-visible{outline:2px solid var(--red);outline-offset:4px;border-radius:4px}
.wrap{max-width:1240px;margin:0 auto;padding:0 var(--pad)}
.en{font-family:var(--en);font-stretch:125%}
.mono{font-family:var(--mono)}
.nw{white-space:nowrap}
.sent{display:inline-block;max-width:100%}
.skip{position:absolute;left:-999px;top:0}
.skip:focus{left:12px;top:12px;z-index:99;padding:10px 14px;background:var(--fg);color:var(--bg)}
.kicker{font-family:var(--mono);font-size:13px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:var(--red)}
.label{font-size:13px;font-weight:800;letter-spacing:.04em;color:var(--red)}
.sec{padding:clamp(72px,8.6vw,128px) 0;border-top:1px solid var(--line)}
.sec-head{display:flex;align-items:flex-end;justify-content:space-between;gap:32px;margin-bottom:clamp(36px,4.6vw,68px)}
.sec-title{margin-top:16px;font-size:clamp(42px,7.2vw,104px);line-height:1.06;font-weight:900;letter-spacing:-.045em}
.lead{margin-top:20px;max-width:40em;font-size:clamp(16px,1.3vw,19px);line-height:1.7;color:var(--mut)}
.link{display:inline-flex;align-items:center;gap:8px;min-height:44px;font-size:15px;font-weight:700;white-space:nowrap}
.link.u{text-decoration:underline;text-underline-offset:6px;text-decoration-thickness:1px;text-decoration-color:#57626f}
.link.q{font-weight:400;color:var(--mut);text-decoration:underline;text-underline-offset:5px;text-decoration-color:#3a4450}
.link span{display:inline-block;transition:transform .25s}
.link:hover span{transform:translateX(4px)}
.pill{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:50px;padding:0 24px;border:1px solid var(--line2);border-radius:999px;font-size:15px;font-weight:700;white-space:nowrap;transition:border-color .2s,background-color .2s,color .2s}
.pill:hover{border-color:var(--fg)}
.pill.solid{border-color:var(--fg);background:var(--fg);color:var(--bg)}
.pill.solid:hover{border-color:var(--red);background:var(--red)}
.bars{display:grid;gap:4px;width:100%;max-width:200px;margin-top:12px}
.bars i{display:block;width:var(--w,100%);height:6px;border-radius:3px;background:var(--red);transform-origin:0 50%}
.bars i:first-child{background:#57626f}

/* 머리띠 */
.hd{position:fixed;inset:0 0 auto 0;z-index:50;border-bottom:1px solid transparent;transition:background-color .3s,border-color .3s}
.hd.is-solid{border-color:var(--line);background:rgba(11,13,16,.84);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.hd-in{display:flex;align-items:center;justify-content:space-between;gap:16px;height:72px}
.hd-name{font-family:var(--mono);font-size:14px;font-weight:700}
.hd-name span{margin-left:8px;font-family:var(--ko);font-weight:400;color:var(--mut)}
.hd-nav{display:flex;align-items:center;gap:18px;font-size:14.5px;color:var(--mut);white-space:nowrap}
.hd-nav a{display:inline-flex;align-items:center;min-height:44px}
.hd-nav a.t:hover{color:var(--fg)}
.hd-nav .box{padding:0 16px;border:1px solid #57626f;font-family:var(--mono);font-size:13px;font-weight:700;color:var(--fg)}
.hd-nav .box.red{border-color:var(--red);color:var(--red)}
.hd-lang{font-family:var(--mono);font-size:13px}
.hd-lang b{color:var(--fg)}

/* 첫 화면 */
.hero{position:relative;display:flex;flex-direction:column;justify-content:center;min-height:100vh;min-height:100svh;padding:calc(72px + clamp(12px,3vh,34px)) 0 clamp(18px,4vh,42px);overflow:hidden}
.hero::before{content:"";position:absolute;inset:0;background:radial-gradient(52% 60% at 86% 30%,rgba(199,48,27,.3),transparent 70%),radial-gradient(40% 46% at 12% 96%,rgba(255,134,54,.1),transparent 70%);pointer-events:none}
.hero::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(244,241,234,.13) 1px,transparent 1.6px);background-size:22px 22px;-webkit-mask-image:radial-gradient(64% 70% at 80% 34%,#000 8%,transparent 74%);mask-image:radial-gradient(64% 70% at 80% 34%,#000 8%,transparent 74%);pointer-events:none}
.hero>.wrap{position:relative;z-index:1;width:100%}
.hero-top{display:flex;align-items:center;justify-content:space-between;gap:16px;font-size:15px;font-weight:700}
.hero-org{display:inline-flex;align-items:center;gap:10px;min-height:38px;padding:0 16px;border:1px solid var(--line2);border-radius:999px;font-size:14px}
.hero-org i{width:8px;height:8px;border-radius:50%;background:var(--red);box-shadow:0 0 0 4px rgba(255,90,61,.2)}
.hero-title{container-type:inline-size;margin-top:clamp(8px,2.4vh,26px)}
.hero-line{display:flex;align-items:center;gap:.2em;font-family:var(--en);font-stretch:125%;font-weight:900;font-size:min(calc(100cqw / 7.46),17.8vh);line-height:.9;letter-spacing:-.02em;white-space:nowrap}
.hero-line.red{color:var(--red)}
.hero-face{flex:none;width:.8em;height:.8em;margin-left:-.02em;border-radius:999px;overflow:hidden;background:#8f9e3c}
.hero-face img{width:100%;height:100%;object-fit:cover;object-position:50% 14%}
.hero-face.is-m{display:none}
.hero-sub{display:block;margin-top:clamp(10px,2.4vh,26px);font-size:clamp(21px,2.5vw,36px);line-height:1.25;font-weight:900;letter-spacing:-.035em}
.hero-sub span{display:inline-block}
.hero-mid{display:flex;align-items:center;justify-content:space-between;gap:16px 32px;margin-top:clamp(10px,2.2vh,22px)}
.hero-strengths{display:flex;flex-wrap:wrap;gap:8px}
.hero-strengths li{display:inline-flex;align-items:center;gap:8px;min-height:36px;padding:0 14px 0 12px;border:1px solid #2c343f;border-radius:999px;font-size:14px;font-weight:700}
.hero-strengths li span{font-family:var(--en);font-stretch:125%;font-size:12px;font-weight:800;color:var(--red)}
.hero-bottom{margin-top:clamp(12px,3vh,36px);padding-top:clamp(12px,2.6vh,26px);border-top:1px solid var(--line)}
.proofs{display:grid;grid-template-columns:minmax(0,1.15fr) minmax(0,1fr) minmax(0,1fr);gap:40px}
.proof a{display:flex;flex-direction:column;align-items:flex-start;height:100%}
.proof-val{display:flex;align-items:baseline;gap:8px;font-stretch:118%;font-size:clamp(28px,min(3.7vw,6.4vh),54px);line-height:1.05;font-weight:800;letter-spacing:-.02em;white-space:nowrap}
.proof-val .b{font-size:.48em;font-weight:700;letter-spacing:0;color:var(--mut)}
.proof-val b{font-weight:inherit}
.marks{display:flex;gap:6px;height:18px;margin-top:10px}
.marks i{display:inline-flex;align-items:center;gap:6px;height:18px;padding:0 8px 0 7px;border-radius:999px;background:#1f2731;font-size:11px;font-style:normal;font-weight:800;letter-spacing:.02em}
.marks i::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--red)}
.proof-label{margin-top:12px;font-size:14.5px;line-height:1.4;font-weight:700}
.proof-basis{margin-top:3px;font-size:12.5px;line-height:1.45;color:var(--mut)}
.proof a:hover .proof-label{text-decoration:underline;text-underline-offset:4px}
.hero-actions{display:flex;flex:none;flex-wrap:wrap;align-items:center;justify-content:flex-end;gap:10px 18px}

/* 한 문장 — 스크롤에 따라 채워진다 */
.say{padding:clamp(72px,8.6vw,128px) 0 clamp(56px,6.4vw,96px);border-top:1px solid var(--line)}
.say-text{max-width:18.5em;font-size:clamp(27px,4.5vw,66px);line-height:1.34;font-weight:900;letter-spacing:-.04em}
.say-text b{font-weight:900;color:var(--red)}
.say-sent{display:block}
.say-sent+.say-sent{margin-top:.5em}

/* 운영 브랜드 — 흐르는 큰 글자 */
.brands{padding:0 0 clamp(48px,5.6vw,84px);overflow:hidden}
.brands-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.marq-btn{min-height:44px;padding:0 14px;border:1px solid var(--line2);font-family:var(--mono);font-size:12.5px;font-weight:700;color:var(--mut)}
.marquee{overflow:hidden}
.marquee-track{display:flex;width:max-content;will-change:transform}
.marq-set{display:flex;align-items:center;flex:none}
.marq-set span{font-size:clamp(46px,8.6vw,132px);line-height:1.16;font-weight:900;letter-spacing:-.05em;white-space:nowrap}
.marq-set span:nth-of-type(even){color:transparent;-webkit-text-stroke:1.5px #7f8994}
.marq-set i{flex:none;width:.2em;height:.2em;margin:0 .42em;border-radius:50%;background:var(--red);font-size:clamp(46px,8.6vw,132px)}

/* 경력 */
.jobs{border-top:1px solid var(--line)}
.job{display:grid;grid-template-columns:210px minmax(0,1fr) 150px;gap:32px;align-items:start;padding:clamp(28px,3.4vw,46px) 0;border-bottom:1px solid var(--line)}
.job-when{display:flex;align-items:center;gap:10px;padding-top:.9em;font-family:var(--mono);font-size:13.5px;font-weight:700;color:var(--mut)}
.job.is-now .job-when{color:var(--red)}
.job.is-now .job-when::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--red);box-shadow:0 0 0 4px rgba(255,90,61,.2)}
.job h3{font-size:clamp(25px,3.3vw,46px);line-height:1.18;font-weight:900;letter-spacing:-.04em}
.job-main p{margin-top:14px;max-width:45em;font-size:16px;line-height:1.85;color:var(--mut)}
.job-logo{justify-self:end;padding-top:1em}
.job-logo img{width:auto;height:20px;filter:invert(1);opacity:.9}
.stack{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;margin-top:clamp(28px,3.4vw,44px)}
.stack dt{font-size:13px;font-weight:800;letter-spacing:.04em;color:var(--red)}
.stack dd{margin-top:6px;font-size:15px;line-height:1.7;color:var(--mut)}
.rec-label{margin-top:clamp(56px,7vw,96px)}
.records{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:28px;margin-top:16px}
.records a{display:block;height:100%;padding-top:20px;border-top:1px solid #57626f;transition:border-color .2s}
.records a:hover{border-color:var(--red)}
.records b{display:inline-flex;align-items:baseline;gap:8px;min-height:30px;font-size:clamp(17px,1.6vw,21px);font-weight:800;letter-spacing:-.02em}
.records a>span{display:block;margin-top:6px;font-size:14px;line-height:1.6;color:var(--mut)}

/* 일하는 순서 — 한 단계가 한 장면 */
.loop-head{padding-bottom:clamp(8px,1vw,16px)}
.loop-head .sec-head{margin-bottom:clamp(36px,4.6vw,68px)}
.step{position:relative;padding:clamp(56px,6.2vw,90px) 0;border-top:1px solid var(--line);overflow:hidden}
.step-ghost{position:absolute;left:0;top:50%;margin-top:-.5em;font-family:var(--en);font-stretch:125%;font-size:clamp(150px,29vw,440px);line-height:1;font-weight:900;letter-spacing:-.03em;white-space:nowrap;color:transparent;-webkit-text-stroke:1px #252e39;pointer-events:none;-webkit-user-select:none;user-select:none}
.step-grid{position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.14fr);gap:clamp(32px,5vw,80px);align-items:center}
.step-tag{font-size:15px;font-weight:800;color:var(--mut)}
.step-tag .en{margin-right:2px;font-size:17px;font-weight:900;color:var(--red)}
.step-line{margin-top:16px;font-size:clamp(27px,3.5vw,50px);line-height:1.22;font-weight:900;letter-spacing:-.04em}
.step-story{margin-top:22px;max-width:34em;font-size:16.5px;line-height:1.85;color:var(--mut)}
.step-points{margin-top:16px;max-width:38em;font-size:13.5px;line-height:1.7;color:var(--dim)}
.step-proof{display:flex;flex-wrap:wrap;align-items:center;gap:0 16px;margin-top:10px;font-size:14.5px}
.step-proof span{font-weight:800;color:var(--red)}
.step-proof a{display:inline-flex;align-items:center;min-height:44px;font-weight:700;text-decoration:underline;text-underline-offset:5px;text-decoration-color:#57626f}
.step-num{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 .12em;font-stretch:118%;font-size:clamp(56px,8.4vw,122px);line-height:.95;font-weight:900;letter-spacing:-.03em;white-space:nowrap}
.step-num .b{font-size:.3em;font-weight:700;letter-spacing:0;color:var(--mut)}
.step-num b{font-weight:inherit}
.step .bars{max-width:none;gap:6px;margin-top:clamp(18px,2.2vw,28px)}
.step .bars i{height:12px;border-radius:6px}
.step-name{margin-top:clamp(16px,2vw,24px);font-size:clamp(16px,1.4vw,19px);font-weight:800}
.step-basis{margin-top:4px;font-size:13.5px;line-height:1.6;color:var(--mut)}

/* 대표 사례 */
.work-head{padding-bottom:clamp(8px,1vw,16px)}
.case.is-lg{padding:clamp(48px,5.2vw,76px) 0;border-top:1px solid var(--line)}
.case-grid{display:grid;grid-template-columns:minmax(0,5fr) minmax(0,7fr);gap:clamp(32px,5.4vw,88px);align-items:center}
.case.is-lg:nth-of-type(even) .case-grid{grid-template-columns:minmax(0,7fr) minmax(0,5fr)}
.case.is-lg:nth-of-type(even) .case-info{order:2}
.case-band{padding:clamp(48px,5.2vw,76px) 0;border-top:1px solid var(--line)}
.case-row{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:clamp(24px,3vw,44px)}
.case.is-sm .case-basis{min-height:3.1em}
.case.is-sm .case-grid{display:flex;flex-direction:column;height:100%}
.case.is-sm .case-visual{order:-1}
.case.is-sm .case-info{display:flex;flex:1;flex-direction:column;margin-top:26px}
.case.is-sm .case-brand{margin-top:14px;font-size:clamp(28px,3vw,42px)}
.case.is-sm .case-title{font-size:clamp(17px,1.4vw,19.5px)}
.case.is-sm .case-links{margin-top:auto;padding-top:6px}
.case.is-sm .case-img{aspect-ratio:4/3.1;border-radius:14px}
.case.is-sm .case-stat{margin-top:-34px;padding:14px 22px 0 0;border-top-right-radius:16px}
.case.is-sm .case-num{font-size:clamp(34px,3.7vw,52px)}
.case.is-sm .case-stat .bars{max-width:200px;margin-top:12px}
.case.is-sm .case-stat .bars i{height:6px}
.case.is-sm .case-label{margin-top:10px;font-size:15px}
.case-meta{display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;font-size:13px;color:var(--mut)}
.case-meta .no{font-size:15px;font-weight:800;color:var(--red)}
.case-meta .tag{padding:5px 12px;border:1px solid var(--line2);border-radius:999px;font-weight:700;color:var(--fg)}
.case-brand{margin-top:18px;font-size:clamp(38px,6vw,88px);line-height:1.04;font-weight:900;letter-spacing:-.05em}
.case-award{display:inline-flex;align-items:center;gap:8px;margin-top:18px;font-size:13.5px;font-weight:800;color:var(--red)}
.case-award::before{content:"";width:6px;height:6px;border-radius:50%;background:currentColor}
.case-title{margin-top:14px;font-size:clamp(19px,1.8vw,25px);line-height:1.42;font-weight:800;letter-spacing:-.02em}
.case-title a:hover{text-decoration:underline;text-underline-offset:5px}
.case-story{margin-top:12px;font-size:15.5px;line-height:1.8;color:var(--mut)}
.case-scope{margin-top:16px;font-size:14px;line-height:1.6;color:var(--mut)}
.case-scope span{margin-right:8px;font-weight:800;color:var(--fg)}
.case-links{display:flex;flex-wrap:wrap;align-items:center;gap:0 22px;margin-top:10px}
.case-visual{position:relative;min-width:0}
.case-img{display:block;aspect-ratio:16/10.6;overflow:hidden;border-radius:18px;background:#12161b}
.case-img img{width:100%;height:100%;object-fit:cover;object-position:top center;transition:transform .7s cubic-bezier(.2,.8,.2,1)}
.case:hover .case-img img{transform:scale(1.035)}
.case-stat{position:relative;width:fit-content;max-width:94%;margin:-58px 0 0 -1px;padding:22px 34px 0 0;border-top-right-radius:22px;background:var(--bg)}
.case-num{display:flex;align-items:baseline;gap:.14em;font-stretch:118%;font-size:clamp(42px,6.2vw,92px);line-height:1;font-weight:900;letter-spacing:-.03em;white-space:nowrap}
.case-num .b{font-size:.36em;font-weight:700;letter-spacing:0;color:var(--mut)}
.case-num b{font-weight:inherit}
.case-stat .bars{max-width:300px;margin-top:16px}
.case-stat .bars i{height:8px;border-radius:4px}
.case-label{margin-top:14px;font-size:16px;font-weight:800}
.case-basis{margin-top:3px;font-size:13px;line-height:1.55;color:var(--mut)}
.more{padding-top:clamp(40px,4.4vw,64px);padding-bottom:clamp(72px,8.6vw,128px);border-top:1px solid var(--line)}
.more ul{margin-top:8px}
.more a{display:grid;grid-template-columns:minmax(150px,300px) minmax(0,1fr) auto;align-items:center;gap:24px;min-height:44px;padding:clamp(18px,2.2vw,28px) 0;border-bottom:1px solid var(--line);transition:padding .3s cubic-bezier(.2,.8,.2,1),color .2s}
.more a:hover{padding-left:14px;color:var(--red)}
.more strong{font-size:clamp(21px,2.5vw,34px);line-height:1.2;font-weight:900;letter-spacing:-.035em}
.more .t{font-size:15.5px;line-height:1.6;color:var(--mut)}

/* 자동화 */
.auto-title .n{color:var(--red)}
.demo{margin-top:8px;border:1px solid #2c343f;border-radius:20px;overflow:hidden;background:#07090b}
.demo-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 14px 12px 24px;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:13px}
.demo-head p{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 12px}
.demo-head .s{font-weight:700;color:var(--red)}
.demo-head p>span:last-child{color:var(--mut)}
.demo-head button{min-height:44px;padding:0 14px;border:1px solid var(--line2);font-family:var(--mono);font-size:12.5px;font-weight:700}
.demo-body{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2.3fr);gap:40px;padding:clamp(22px,3vw,36px) 24px clamp(26px,3.4vw,40px)}
.demo-k,.demo-status{font-family:var(--mono);font-size:13px;color:var(--mut)}
.demo-count{display:flex;align-items:baseline;gap:10px;margin-top:8px;font-family:var(--mono);font-size:13px;color:var(--mut)}
.demo-count b{font-size:clamp(48px,5.6vw,76px);line-height:1;font-weight:900;color:var(--fg);font-variant-numeric:tabular-nums}
.demo-status{margin-top:18px;padding-top:16px;border-top:1px solid var(--line)}
.demo-steps li{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 14px;padding:12px 0;border-bottom:1px solid var(--line);font-family:var(--mono);font-size:13.5px;color:var(--dim);transition:color .3s}
.demo-steps li:last-child{border-bottom:0}
.demo-steps li b{font-weight:700}
.demo-steps li.on{color:var(--fg)}
.demo-steps li.on .no{color:var(--red)}
.demo-steps li.on span:last-child{color:var(--mut)}
.systems{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 clamp(32px,4.6vw,72px);margin-top:clamp(28px,3.4vw,44px);border-top:1px solid var(--line)}
.systems li{display:grid;grid-template-columns:44px minmax(0,1fr);gap:4px 12px;padding:clamp(20px,2.4vw,30px) 0;border-bottom:1px solid var(--line)}
.sys-no{grid-row:span 3;padding-top:.5em;font-family:var(--mono);font-size:13px;font-weight:700;color:var(--dim)}
.systems strong{font-size:clamp(19px,1.9vw,25px);line-height:1.3;font-weight:900;letter-spacing:-.03em}
.sys-built{font-size:15px;line-height:1.7;color:var(--mut)}
.sys-effect{margin-top:4px;font-size:14px;line-height:1.5;font-weight:700;color:var(--red)}
.auto-links{display:flex;flex-wrap:wrap;gap:0 28px;margin-top:22px}

/* 연락 */
.contact{position:relative;padding:clamp(80px,9.6vw,144px) 0 clamp(64px,7.4vw,108px);border-top:1px solid var(--line);overflow:hidden}
.contact::before{content:"";position:absolute;top:-20%;right:-14%;width:64%;height:150%;border-radius:50%;background:radial-gradient(circle at 42% 42%,rgba(199,48,27,.4),transparent 60%),radial-gradient(circle at 70% 66%,rgba(255,134,54,.14),transparent 54%);filter:blur(80px);pointer-events:none}
.contact>.wrap{position:relative}
.contact-title{margin-top:18px;font-size:clamp(32px,5.6vw,84px);line-height:1.14;font-weight:900;letter-spacing:-.045em}
.contact-title>span{display:block}
.contact-note{margin-top:22px;font-size:clamp(16px,1.3vw,18px);color:var(--mut)}
.contact-email{display:inline-flex;align-items:center;min-height:44px;margin-top:clamp(28px,4vw,56px);padding-bottom:6px;border-bottom:3px solid var(--red);font-stretch:112%;font-size:clamp(24px,4.6vw,68px);line-height:1.1;font-weight:800;letter-spacing:-.02em}
.contact-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:clamp(28px,3.4vw,44px)}
.contact-about{margin-top:20px}
.ft{padding:32px 0 44px;border-top:1px solid var(--line);font-size:13px;line-height:1.8;color:var(--dim)}

/* 움직임 — 스크립트가 켜졌을 때만 처음 상태를 숨긴다 */
.js [data-rv]{opacity:0}
.js .w{opacity:.34}
.js .case-img{clip-path:inset(100% 0 0 0)}
.rm .marquee-track{flex-wrap:wrap;width:auto}
.rm .marq-set{flex-wrap:wrap;row-gap:0}
.rm .marq-set[aria-hidden]{display:none}
.rm .marq-btn{display:none}

/* 낮은 창(노트북 150% 배율 등) — 결과 세 칸과 첫 버튼이 한 화면에 들어오게 */
@media (min-width:1024px) and (max-height:700px){
  .hero-strengths{visibility:hidden;height:0;overflow:hidden}
  .hero-mid{justify-content:flex-end;margin-top:-50px;pointer-events:none}
  .hero-mid .hero-actions{pointer-events:auto}
  .hero-line{font-size:min(calc(100cqw / 7.46),17vh)}
  .hero{padding-bottom:12px}
  .proof-label{margin-top:8px}
  .hero-org{min-height:32px}
}
@media (max-width:1023px){
  .hd-nav a.t,.hd-nav .t2{display:none}
  .job{grid-template-columns:170px minmax(0,1fr) 110px;gap:24px}
  .step-grid,.case.is-lg .case-grid,.case.is-lg:nth-of-type(even) .case-grid{grid-template-columns:minmax(0,1fr)}
  .case-row{grid-template-columns:minmax(0,1fr);gap:56px}
  .step-grid{display:flex;flex-direction:column;align-items:stretch;gap:0}
  .step-l{display:contents}
  .step-tag{order:1}
  .step-r{order:2;margin-top:18px}
  .step-line{order:3;margin-top:30px}
  .step-story{order:4}
  .step-points{order:5}
  .step-proof{order:6}
  .case.is-sm .case-basis{min-height:0}
  .case-visual{order:-1}
  .case.is-lg:nth-of-type(even) .case-info{order:0}
  .hero-mid{flex-direction:column;align-items:flex-start}
  .hero-actions{justify-content:flex-start}
}
@media (max-width:767px){
  :root{--pad:20px}
  .sec-head{flex-direction:column;align-items:flex-start;gap:6px}
  /* 첫 화면 — 사람 · 주장 · 결과 세 칸 · 첫 버튼이 360×640 에도 한 화면에 들어온다(창 높이로 배치를 바꾸지 않는다: 주소창이 접힐 때 화면이 튀지 않게) */
  .hero{justify-content:flex-start;min-height:0;padding:calc(72px + 6px) 0 30px}
  .hero-top{flex-wrap:wrap;gap:6px 10px;font-size:13px}
  .hero-org{min-height:26px;gap:7px;padding:0 10px;font-size:12px}
  .hero-org i{width:6px;height:6px;box-shadow:0 0 0 3px rgba(255,90,61,.2)}
  .hero-title{margin-top:12px}
  .hero-line{flex-wrap:wrap;gap:0 .2em;font-size:calc(100cqw / 6.5);line-height:.92}
  .hero-line .hw{flex:none}
  .hero-line .hw+.hero-face+.hw{flex-basis:100%}
  .hero-face.is-m{display:block}
  .hero-face.is-d{display:none}
  .hero-sub{margin-top:12px;font-size:clamp(19px,5.4vw,21px)}
  .hero{display:block}
  .hero>.wrap{display:flex;flex-direction:column}
  .hero-mid{display:contents}
  .hero-strengths{order:9;margin-top:22px}
  .hero-strengths li{min-height:34px;font-size:13px}
  .hero-actions{order:8;margin-top:14px}
  .hero-bottom{margin-top:14px;padding-top:0;border-top:0}
  .proofs{grid-template-columns:minmax(0,1fr);gap:0}
  .proof a{display:grid;grid-template-columns:9.2rem minmax(0,1fr);column-gap:12px;padding:10px 0;border-top:1px solid var(--line)}
  .proof-val{grid-column:1;font-size:25px}
  .proof .bars,.proof .marks{grid-column:1;max-width:124px;margin-top:5px}
  .proof-label{grid-column:2;grid-row:1;margin-top:2px;font-size:13.5px;text-wrap:balance}
  .proof-basis{grid-column:2;grid-row:2;margin-top:1px;font-size:12.5px;text-wrap:balance}
  .say-text{line-height:1.38}
  .say{padding:72px 0 56px}
  .sec{padding:72px 0}
  .step{padding:56px 0}
  .case.is-lg,.case-band{padding:48px 0}
  .more{padding-top:40px;padding-bottom:72px}
  .contact{padding:80px 0 64px}
  .job{grid-template-columns:minmax(0,1fr) auto;gap:10px 16px;padding:26px 0}
  .job-when{padding-top:0}
  .job-logo{grid-row:1;grid-column:2;padding-top:0}
  .job-logo img{height:16px}
  .job-main{grid-column:1 / -1}
  .job-main p{font-size:15.5px}
  .stack,.records{grid-template-columns:minmax(0,1fr);gap:18px}
  .records{gap:0}
  .records a{padding:16px 0 18px}
  .step-points{display:none}
  .step-story{font-size:16px}
  .case-stat,.case.is-sm .case-stat{margin-top:-36px;padding:14px 20px 0 0;border-top-right-radius:16px}
  .case.is-sm .case-num{font-size:42px}
  .case.is-sm .case-brand{font-size:38px}
  .case.is-sm .case-info{margin-top:22px}
  .case-img{border-radius:14px}
  .more a{grid-template-columns:minmax(0,1fr) auto;gap:4px 12px}
  .more .t{grid-column:1}
  .more a>span:last-child{grid-area:1 / 2 / span 2;align-self:center}
  .demo-body{grid-template-columns:minmax(0,1fr);gap:22px;padding:22px 18px 22px}
  .demo-head{padding-left:18px}
  .systems{grid-template-columns:minmax(0,1fr)}
  .contact-email{border-bottom-width:2px}
  .pill{min-height:48px;padding:0 20px}
}
@media (prefers-reduced-motion:reduce){.link span,.case-img img,.more a{transition:none}}
`;

/** 움직임 엔진 — 쪽 안에서 한 번 돈다. window.__capture 가 있으면 스스로 돌지 않고 __d.tick(t) 를 밖에서 부른다(영상 굽기) */
export function engine() {
  var doc = document; var root = doc.documentElement;
  var hd = doc.getElementById("hd");
  var onHd = function () { if (hd) hd.classList.toggle("is-solid", (window.scrollY || 0) > 24); };
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && !window.__capture) { root.classList.add("rm"); onHd(); window.addEventListener("scroll", onHd, { passive: true }); return; }
  root.classList.add("js");
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  var ease = function (x) { return 1 - Math.pow(1 - x, 3); };
  var all = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var vh = window.innerHeight;
  // 쪽 끝까지 남은 거리. 끝에 가까워지면 '나타나는 선'을 창 아래 끝까지 내린다 — 창이 아주 높으면(4K · 세로 모니터) 끝의 글이 그 선까지 올라오지 못한다
  var endGap = 1e9;
  var seen = function (el, frac) { var r = el.getBoundingClientRect(); return r.top < Math.max(vh * (1 - (frac == null ? 0.1 : frac)), vh - endGap) && r.bottom > 0; };

  // 1) 나타나기
  var rv = all("[data-rv]").map(function (el) { return { el: el, t0: null, d: +(el.getAttribute("data-d") || 0), done: false }; });
  // 2) 스크롤에 따라 채워지는 문장: 낱말 단위로 감싼다
  var fills = all("[data-fill]").map(function (el) {
    var words = [];
    var walk = function (node) {
      Array.prototype.slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var parts = n.nodeValue.split(/(\s+)/); var frag = doc.createDocumentFragment();
          parts.forEach(function (p) { if (!p) return; if (/^\s+$/.test(p)) { frag.appendChild(doc.createTextNode(p)); return; } var s = doc.createElement("span"); s.className = "w"; s.textContent = p; frag.appendChild(s); words.push(s); });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return { el: el, words: words };
  });
  // 3) 올라가는 숫자
  var counts = all("[data-count]").map(function (el) {
    return { el: el, from: parseFloat(el.getAttribute("data-from")), to: parseFloat(el.getAttribute("data-to")), dec: +el.getAttribute("data-dec"), pre: el.getAttribute("data-pre") || "", suf: el.getAttribute("data-suf") || "", t0: null, done: false, fin: el.textContent };
  });
  // 4) 막대 · 5) 사례 이미지 · 6) 배경 큰 글자 · 7) 흐르는 브랜드 · 8) 자동화 예시
  var bars = all(".bars").map(function (el) { return { el: el, is: all("i", el), t0: null, done: false }; });
  var imgs = all(".case-img").map(function (el) { return { el: el, img: el.querySelector("img"), t0: null, done: false }; });
  var ghosts = all(".step-ghost").map(function (el) { return { el: el, host: el.parentElement }; });
  var marq = doc.getElementById("marq"); var marqSet = marq ? marq.querySelector(".marq-set") : null; var marqW = 0; var marqOn = true; var marqX = 0; var lastT = null;
  var marqBtn = doc.getElementById("marq-btn");
  if (marqBtn) marqBtn.addEventListener("click", function () { marqOn = !marqOn; marqBtn.setAttribute("aria-pressed", String(!marqOn)); });
  var demoN = doc.getElementById("demo-n"); var demoSteps = all("#demo-steps li"); var demoT0 = null; var demoOn = true; var demoHold = 0;
  var demoBtn = doc.getElementById("demo-btn");
  if (demoBtn) demoBtn.addEventListener("click", function () { demoOn = !demoOn; demoBtn.setAttribute("aria-pressed", String(!demoOn)); });
  var lastY = window.scrollY || 0;

  function tick(t) {
    vh = window.innerHeight; var y = window.scrollY || 0; var dt = lastT == null ? 0 : Math.min(80, t - lastT); lastT = t;
    endGap = Math.max(0, root.scrollHeight - vh - y); var endFill = clamp(1 - endGap / (vh * 0.5), 0, 1);
    onHd();
    rv.forEach(function (o) {
      if (o.done) return;
      if (o.t0 === null && seen(o.el, 0.06)) o.t0 = t + o.d;
      var p = o.t0 === null ? 0 : clamp((t - o.t0) / 760, 0, 1); var e = ease(p);
      o.el.style.opacity = e; o.el.style.transform = p >= 1 ? "" : "translate3d(0," + ((1 - e) * 30).toFixed(2) + "px,0)";
      if (p >= 1) o.done = true;
    });
    fills.forEach(function (f) {
      var r = f.el.getBoundingClientRect(); if (!window.__still && (r.bottom < -200 || r.top > vh + 200)) return;
      var p = window.__still ? 1 : clamp((vh * 0.92 - r.top) / (vh * 0.4 + r.height * 0.6), 0, 1);
      if (r.top < vh) p = Math.max(p, endFill);                      // 쪽 끝에서는 화면 안의 문장을 다 채운다
      var n = p * (f.words.length + 1.5);
      f.words.forEach(function (w, i) { w.style.opacity = (0.34 + 0.66 * clamp(n - i, 0, 1)).toFixed(3); });
    });
    counts.forEach(function (c) {
      if (c.done) return;
      if (c.t0 === null && seen(c.el, 0.12)) c.t0 = t + 120;
      if (c.t0 === null) { c.el.textContent = c.pre + c.from.toFixed(c.dec) + c.suf; return; }
      var p = clamp((t - c.t0) / 1300, 0, 1);
      if (p >= 1) { c.el.textContent = c.fin; c.done = true; return; }
      c.el.textContent = c.pre + (c.from + (c.to - c.from) * ease(p)).toFixed(c.dec) + c.suf;
    });
    bars.forEach(function (b) {
      if (b.done) return;
      if (b.t0 === null && seen(b.el, 0.1)) b.t0 = t + 200;
      b.is.forEach(function (i, k) { var p = b.t0 === null ? 0 : clamp((t - b.t0 - k * 220) / 900, 0, 1); i.style.transform = p >= 1 ? "" : "scaleX(" + ease(p).toFixed(4) + ")"; if (k === b.is.length - 1 && p >= 1) b.done = true; });
    });
    imgs.forEach(function (m) {
      if (m.done) return;
      if (m.t0 === null && seen(m.el, 0.16)) m.t0 = t;
      var p = m.t0 === null ? 0 : clamp((t - m.t0) / 1000, 0, 1); var e = ease(p); var g = m.t0 === null ? 0 : clamp((t - m.t0 - 380) / 1100, 0, 1);
      m.el.style.clipPath = p >= 1 ? "none" : "inset(" + ((1 - e) * 100).toFixed(2) + "% 0 0 0)";
      m.img.style.filter = g >= 1 ? "" : "grayscale(" + (1 - g).toFixed(3) + ") brightness(" + (0.8 + 0.2 * g).toFixed(3) + ")";
      if (p >= 1 && g >= 1) m.done = true;
    });
    ghosts.forEach(function (g) {
      var r = g.host.getBoundingClientRect(); if (r.bottom < 0 || r.top > vh) return;
      var p = (vh - r.top) / (vh + r.height);
      g.el.style.transform = "translate3d(" + ((0.62 - p) * 46).toFixed(3) + "%,0,0)";
    });
    if (marq) {
      if (!marqW && marqSet) marqW = marqSet.getBoundingClientRect().width;
      if (marqOn) marqX += dt * 0.07 + Math.abs(y - lastY) * 0.45;
      if (marqW) marq.style.transform = "translate3d(" + (-(marqX % marqW)).toFixed(2) + "px,0,0)";
    }
    if (demoN && demoSteps.length) {
      if (demoT0 === null && seen(demoN, 0.1)) demoT0 = t;
      if (demoT0 !== null) {
        if (!demoOn) demoHold += dt;
        var k = (t - demoT0 - demoHold) / 1500; var step = Math.floor(k) % demoSteps.length; var f = k - Math.floor(k);
        demoSteps.forEach(function (li, i) { li.classList.toggle("on", i === step); });
        demoN.textContent = step === 0 ? String(Math.round(900 * ease(clamp(f * 1.25, 0, 1)))) : "900";
      }
    }
    lastY = y;
  }
  window.__d = { tick: tick };
  if (!window.__capture) { var loop = function (ts) { tick(ts); window.requestAnimationFrame(loop); }; window.requestAnimationFrame(loop); }
}
