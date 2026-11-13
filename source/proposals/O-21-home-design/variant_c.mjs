// 보완안 C — 지금 홈의 마크업을 그대로 두고(문장을 다시 치지 않는다) 그 위에 새 스타일을 입힌다.
// 달라지는 것은 (1) 구간 바탕 (2) 경력 · 일하는 순서 · 사례 · 그 외 기록 · 자동화의 배치 (3) 결과 숫자 아래 막대(첫 화면 결과 칸과 같은 표기) (4) 사례 표지.
// augment() 는 쪽 안에서 한 번 돈다: 있는 요소를 옮기고 감싸기만 하고, 글자는 만들지 않는다(구간 이름표 'Career' 하나만 새로 넣는다).

export function augment() {
  const d = document;
  d.documentElement.classList.add("c");
  const el = (tag, cls) => { const e = d.createElement(tag); if (cls) e.className = cls; return e; };

  /* ── 막대: 값 글자에서 두 수를 읽어 0 기준 같은 척도로 그린다. 증감률만 있으면 기준 100 대비 */
  const toNum = (t) => {
    const s = String(t).replace(/[⁠,]/g, "");
    let m = s.match(/([\d.]+)\s*시간/); if (m) return parseFloat(m[1]) * 60;
    m = s.match(/([\d.]+)\s*분/); if (m) return parseFloat(m[1]);
    m = s.match(/[\d.]+/); return m ? parseFloat(m[0]) : NaN;
  };
  const bars = (beforeText, afterText) => {
    let a; let b;
    if (beforeText) { a = toNum(beforeText); b = toNum(afterText); }
    else { const n = toNum(afterText); if (!/^\s*[+＋]/.test(afterText) || !Number.isFinite(n)) return null; a = 100; b = 100 + n; }
    if (!Number.isFinite(a) || !Number.isFinite(b) || a <= 0 || b <= 0) return null;
    const max = Math.max(a, b);
    const wrap = el("span", "c-bars"); wrap.setAttribute("aria-hidden", "true");
    const i1 = el("i"); i1.style.setProperty("--w", `${Math.max(2.5, (a / max) * 100).toFixed(1)}%`);
    const i2 = el("i"); i2.style.setProperty("--w", `${Math.max(2.5, (b / max) * 100).toFixed(1)}%`);
    wrap.append(i1, i2);
    return wrap;
  };
  const afterOf = (root) => { const m = root.querySelector(".count-up-measure"); return m ? m.textContent : root.textContent; };

  /* ── 1) 경력: 첫 화면 구간에서 꺼내 제 구간으로 */
  const hero = d.querySelector("#hero");
  const wraps = hero.querySelectorAll(":scope > .folio-wrap");
  const wrap = wraps[1];
  const sec = el("section", "folio-section c-career"); sec.id = "career";
  hero.after(sec); sec.append(wrap);
  const career = wrap.querySelector(".folio-career");
  const label = career.querySelector(".folio-story-label");
  const head = el("header", "c-head");
  const headL = el("div");
  const kick = el("p", "folio-kicker"); kick.textContent = "Career"; kick.lang = "en";
  const h2 = el("h2", "folio-h2"); h2.textContent = label.textContent; label.remove();
  headL.append(kick, h2); head.append(headL);
  const more = career.querySelector(".folio-stack-more");
  if (more) head.append(more);
  career.before(head);
  const kit = el("div", "c-kit");
  const clients = el("div", "c-clients");
  clients.append(career.querySelector(".folio-brands"), career.querySelector(".folio-stack"));
  kit.append(clients, wrap.querySelector(".folio-records"));
  career.append(kit);
  // 문장 안의 핵심 사실을 굵게(글자는 그대로)
  const hl = ["B2B 리드 생성 캠페인", "월 10억+ 규모의 뉴발란스 10개 채널", "자동화 6종은 단독으로 구축", "브랜드 30여 곳", "대한민국 디지털 광고 대상 우수상"];
  const walker = d.createTreeWalker(career.querySelector("ol"), NodeFilter.SHOW_TEXT);
  const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
  for (const n of nodes) for (const p of hl) {
    const i = n.nodeValue.indexOf(p); if (i < 0) continue;
    const mid = n.splitText(i); mid.splitText(p.length);
    const b = el("b", "c-hl"); mid.before(b); b.append(mid); break;
  }

  /* ── 2) 일하는 순서: 단계 이름표를 둘로 나누고, 결과 숫자 아래에 막대 */
  for (const p of d.querySelectorAll(".loop-panel-stage")) {
    const word = p.querySelector("span"); const ko = p.textContent.replace(word.textContent, "").replace(/^[\s·]+/, "");
    p.textContent = ""; word.className = "c-stage-word"; const k = el("span", "c-stage-ko"); k.textContent = ko; p.append(word, k);
  }
  for (const v of d.querySelectorAll(".loop-metric-value")) {
    const before = v.querySelector(".loop-metric-before");
    const b = bars(before ? before.textContent : "", afterOf(v));
    if (b) { const dd = el("dd", "c-bars-row"); dd.append(b); v.after(dd); }
  }

  /* ── 3) 대표 사례: 표지(색면 + 번호 · 태그 · 기간 + 브랜드 이름 + 소재 이미지) → 결과 → 수상 → 제목 → 설명 → 기여 범위 → 링크 */
  for (const art of d.querySelectorAll(".folio-case")) {
    const media = art.querySelector(".folio-case-media");
    const tags = art.querySelector(".folio-case-tags");
    const cover = el("div", "c-cover"); cover.dataset.case = art.id.replace("case-", "");
    const top = el("p", "c-cover-top");
    top.append(tags.querySelector(".folio-case-no"), tags.querySelector(".folio-tag"), tags.querySelector(".folio-case-period"));
    const brand = tags.querySelector(".folio-case-brand"); brand.classList.add("c-cover-brand");
    const brandP = el("p", "c-cover-brandline"); brandP.append(brand);
    media.before(cover); cover.append(top, brandP, media); tags.remove();
    const result = art.querySelector(".folio-case-result");
    cover.after(result);
    const metric = result.querySelector(".folio-case-metric");
    const before = metric.querySelector(".folio-case-before");
    const beforeText = before ? before.textContent.replace(/에서\s*$/, "") : "";
    const b = bars(beforeText, afterOf(metric));
    if (b) metric.after(b);
  }
}

export const css = `
/* ══ 보완안 C ══ */
.c { --c-ink:#0b0d10; --c-ink2:#3d4552; --c-ink3:#5a626c; --c-bone:#f2efe8; --c-line:#e4dfd2; --c-red:#c7301b; --c-red-on:#ff5a3d;
     --c-panel:#121821; --c-bd:#232b36; --c-on:#f5f3ef; --c-on2:#c3cad2; --c-on3:#8f98a3; }
.c .folio-kicker { font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 13px; letter-spacing: .14em; }
.c .c-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; margin-bottom: 44px; }

/* ── 막대: 첫 화면 결과 칸과 같은 표기(회색 = 전 · 빨강 = 후, 0부터 같은 척도) */
.c .c-bars { display: grid; gap: 4px; width: 100%; }
.c .c-bars i { display: block; width: var(--w, 100%); height: 8px; border-radius: 4px; background: var(--c-red); }
.c .c-bars i:first-child { background: #c5cad0; }

/* ── 경력: 종이색 띠 */
.c .c-career { padding: 104px 0 112px; background: var(--c-bone); }
.c .folio-career { margin-top: 0; padding-top: 0; border-top: 0; }
.c .folio-career ol { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 20px; margin-top: 0; }
.c .folio-career ol > li { display: grid; grid-template-columns: minmax(0,1fr) auto; align-content: start; gap: 0 12px; padding: 30px 30px 32px; border: 0; border-radius: 20px; background: #fff; box-shadow: 0 1px 0 rgba(11,13,16,.04), 0 24px 48px -38px rgba(11,13,16,.3); }
.c .folio-career ol > li::before { display: none; }
.c .folio-career ol > li:first-child::before { display: block; top: 0; left: 30px; width: 44px; height: 4px; border-radius: 0 0 4px 4px; background: var(--c-red); box-shadow: none; }
.c .folio-career-logo { grid-column: 1; align-self: center; height: 18px; margin: 0; opacity: .9; }
.c .folio-career-period { grid-column: 2; align-self: center; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12.5px; letter-spacing: .02em; color: var(--c-ink3); }
.c .folio-career ol > li:first-child .folio-career-period { color: var(--c-red); }
.c .folio-career ol > li strong { grid-column: 1 / -1; margin-top: 24px; font-size: 20px; line-height: 1.35; font-weight: 800; letter-spacing: -0.02em; color: var(--c-ink); }
.c .folio-career ol > li strong + span { grid-column: 1 / -1; margin-top: 12px; font-size: 15px; line-height: 1.8; color: var(--c-ink2); }
.c .c-hl { font-weight: 700; color: var(--c-ink); background: linear-gradient(transparent 64%, #f6dcd6 64%); }
.c .c-kit { display: grid; grid-template-columns: minmax(0,1.35fr) minmax(0,1fr); gap: 20px; margin-top: 20px; }
.c .c-clients { padding: 30px 32px 28px; border-radius: 20px; background: #fff; }
.c .folio-brands { margin-top: 0; font-size: 22px; line-height: 1.62; font-weight: 800; letter-spacing: -0.02em; color: var(--c-ink); }
.c .folio-brands > span { display: block; margin: 0 0 10px; font-size: 12.5px; letter-spacing: .04em; }
.c .folio-stack { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 20px; margin: 24px 0 0; padding-top: 22px; border-top: 1px solid #ece8de; font-size: 14.5px; line-height: 1.65; color: var(--c-ink2); }
.c .folio-stack dt { display: block; margin: 0 0 6px; font-size: 12.5px; }
.c .folio-stack dd { display: block; }
.c .folio-stack-more { margin: 0; font-size: 15px; }
.c .folio-stack-more a { display: inline-flex; align-items: center; gap: 6px; min-height: 44px; font-weight: 700; color: var(--c-ink); text-underline-offset: 5px; }
.c .folio-records { grid-template-columns: minmax(0,1fr); align-content: center; gap: 0; margin-top: 0; padding: 12px 28px; border-radius: 20px; background: var(--c-ink); }
.c .folio-career .folio-records li { display: grid; grid-template-columns: 40px minmax(0,1fr); align-items: center; gap: 0 16px; padding: 8px 0; border: 0; border-top: 1px solid var(--c-bd); border-radius: 0; background: none; box-shadow: none; position: static; }
.c .folio-career .folio-records li:first-child { border-top: 0; }
.c .folio-career .folio-records li::before { content: ""; display: block; position: static; grid-row: span 2; box-shadow: none; width: 40px; height: 40px; border-radius: 50%; background: rgba(232,174,69,.14) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23e8ae45' stroke-width='1.6' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='9' r='5.2'/%3E%3Cpath d='M8.6 13.2 7 21l5-2.6 5 2.6-1.6-7.8'/%3E%3C/svg%3E") center / 20px no-repeat; }
.c .folio-records a { margin-block: 0; min-height: 44px; font-size: 15.5px; font-weight: 800; color: #fff; text-decoration-color: #57626f; }
.c .folio-records span { font-size: 13px; color: #a8b0ba; }
.c .folio-records li > span { margin-top: -8px; padding-bottom: 6px; }

/* ── 일하는 순서: 먹색 띠, 세 단계를 한 줄에 */
.c .loop { border-top: 0; background: var(--c-ink); color: var(--c-on); }
.c .loop .folio-kicker { color: var(--c-red-on); }
.c .loop .folio-h2 { color: #fff; }
.c .loop-grid { display: block; }
.c .loop-rail { position: static; display: grid; grid-template-columns: minmax(0,1fr) auto; align-items: end; column-gap: 32px; margin-bottom: 44px; }
.c .loop-rail > .folio-kicker, .c .loop-rail > .loop-title { grid-column: 1; }
.c .loop-stages, .c .loop-meter { display: none; }
.c .folio-link-quiet { gap: 5px; }
.c .loop-more { grid-column: 2; grid-row: 2; margin: 0; font-size: 15px; font-weight: 700; color: var(--c-on); text-decoration-color: #57626f; }
.c .loop-panels { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 20px; }
.c .loop-panel { position: relative; justify-content: flex-start; min-height: 0; padding: 32px 30px 26px; border: 1px solid var(--c-bd); border-radius: 20px; background: var(--c-panel); }
.c .loop-panel:first-child { padding-top: 32px; border-top: 1px solid var(--c-bd); }
.c .loop-panel:not(:last-child)::after { content: ""; position: absolute; z-index: 1; top: 44px; right: -16px; width: 10px; height: 10px; border-top: 2px solid #57626f; border-right: 2px solid #57626f; transform: rotate(45deg); }
.c .loop-panel-stage { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; order: 1; color: var(--c-on3); font-size: 13.5px; font-weight: 700; letter-spacing: 0; }
.c .c-stage-word { font-family: "Archivo", "Pretendard", sans-serif; font-stretch: 125%; font-size: 36px; line-height: 1; font-weight: 900; letter-spacing: -0.01em; color: #fff; }
.c #loop-improve .c-stage-word { color: var(--c-red-on); }
.c .loop-panel-line { order: 2; min-height: 2.7em; margin-top: 20px; font-size: 21px; line-height: 1.35; color: #fff; }
.c .loop-metrics { order: 3; max-width: none; margin-top: 22px; padding: 22px 22px 20px; border: 1px solid var(--c-bd); border-radius: 16px; background: var(--c-ink); }
.c .loop-metrics > div { gap: 0; }
.c .loop-metric-value { order: 1; font-size: 50px; color: #fff; }
.c .loop-metric-before { font-size: .4em; color: #a8b0ba; }
.c .c-bars-row { order: 2; margin-top: 16px; }
.c .loop .c-bars i { height: 10px; border-radius: 5px; background: var(--c-red-on); }
.c .loop .c-bars i:first-child { background: #6b7684; }
.c .loop-metrics dt { order: 3; margin-top: 16px; font-size: 14.5px; color: var(--c-on); }
.c .loop-metric-basis { order: 4; min-height: 3em; margin-top: 4px; font-size: 12.5px; color: var(--c-on3); }
.c .loop-panel-story { order: 4; max-width: none; margin-top: 22px; font-size: 15px; line-height: 1.8; color: var(--c-on2); }
.c .loop-panel-points { order: 5; max-width: none; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--c-bd); font-size: 13px; line-height: 1.7; color: var(--c-on3); }
.c .loop-panel-proof { order: 6; margin-top: auto; padding-top: 8px; }
.c .loop-panel-proof span { color: var(--c-red-on); }
.c .loop-panel-proof a { color: var(--c-on); text-decoration-color: #57626f; }

/* ── 대표 사례: 색면 표지 + 결과 */
.c .folio-grid-lg { gap: 24px; margin-top: 44px; }
.c .folio-grid-sm { gap: 24px; margin-top: 56px; }
.c .c-cover { position: relative; display: flex; flex-direction: column; overflow: hidden; aspect-ratio: 16 / 10.6; padding: 28px 32px 0; border-radius: 22px; background: var(--stage, var(--c-ink)); color: #fff; }
.c .folio-case-sm .c-cover { aspect-ratio: 4 / 3.3; padding: 22px 22px 0; }
.c .c-cover[data-case="jestina"] { --stage: #c7301b; }
.c .c-cover[data-case="newbalance"] { --stage: #0b0d10; }
.c .c-cover[data-case="daekyo"] { --stage: #f2efe8; color: var(--c-ink); }
.c .c-cover[data-case="gangwon"] { --stage: #1a6f6b; }
.c .c-cover[data-case="dyson"] { --stage: #3d4552; }
.c .c-cover-top { display: flex; align-items: center; gap: 10px; font-size: 13px; }
.c .c-cover .folio-case-no { font-family: "Archivo", sans-serif; font-stretch: 125%; font-weight: 800; letter-spacing: .04em; color: inherit; }
.c .c-cover .folio-tag { padding: 4px 10px; background: rgba(255,255,255,.17); color: inherit; }
.c .c-cover[data-case="daekyo"] .folio-tag { background: rgba(11,13,16,.07); }
.c .c-cover .folio-case-period { margin-left: auto; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; color: inherit; }
.c .c-cover-brandline { margin-top: 12px; }
.c .c-cover-brand { font-size: 40px; line-height: 1.12; font-weight: 900; letter-spacing: -0.03em; color: inherit; }
.c .folio-case-sm .c-cover-brand { font-size: 26px; }
.c .c-cover .folio-case-media { flex: 1; min-height: 0; aspect-ratio: auto; margin-top: 22px; padding: 0; border-radius: 14px 14px 0 0; background: #fff; box-shadow: 0 0 0 1px rgba(255,255,255,.16), 0 -18px 44px -18px rgba(0,0,0,.5); }
.c .folio-case-sm .c-cover .folio-case-media { margin-top: 16px; border-radius: 12px 12px 0 0; }
.c .c-cover[data-case="daekyo"] .folio-case-media { box-shadow: 0 0 0 1px rgba(11,13,16,.06), 0 -18px 40px -22px rgba(11,13,16,.34); }
.c .c-cover .folio-case-media img, .c .c-cover .folio-case-media.is-contain img { width: 100%; height: 100%; object-fit: cover; object-position: top center; border-radius: 0; box-shadow: none; }
.c .folio-case-result { display: flex; flex-direction: column; margin-top: 22px; padding-top: 0; border-top: 0; }
.c .folio-case-metric { order: 1; margin-top: 0; font-family: "Archivo", "Pretendard", sans-serif; font-stretch: 118%; font-size: 40px; line-height: 1.05; }
.c .folio-case-sm .folio-case-metric { font-size: 32px; }
.c .folio-case-before { font-size: .5em; }
.c .folio-case-result .c-bars { order: 2; max-width: 260px; margin-top: 12px; }
.c .folio-case-sm .folio-case-result .c-bars { max-width: 200px; }
.c .folio-case-label { order: 3; margin-top: 12px; font-size: 14.5px; font-weight: 700; color: #1d2227; }
.c .folio-case-basis { order: 4; margin-top: 3px; font-size: 12.5px; }
.c .folio-case-award { margin-top: 18px; padding: 4px 10px; border-radius: 999px; background: #f7ece9; align-self: flex-start; }
.c .folio-case-award::before { display: none; }
.c .folio-case-title { margin-top: 14px; }
.c .folio-case-sm .folio-case-title { margin-top: 16px; }

/* ── 그 외 기록: 카드 네 장 */
.c .folio-more { margin-top: 80px; }
.c .folio-more-label { font-size: 16px; font-weight: 800; color: var(--c-ink); }
.c .folio-more ul { display: grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap: 12px; margin-top: 16px; border-top: 0; }
.c .folio-more li { border: 1px solid #e5e7ea; border-radius: 16px; }
.c .folio-more a { grid-template-columns: minmax(0,1fr) auto; align-items: start; gap: 6px 16px; min-height: 0; padding: 20px 22px; border-radius: 16px; }
.c .folio-more strong { font-size: 17px; font-weight: 800; }
.c .folio-more a > span:first-of-type { grid-column: 1; }
.c .folio-more a > span:last-child { grid-area: 1 / 2 / span 2; align-self: center; }

/* ── 자동화: 종이색 띠, 시스템 여섯 개는 카드 */
.c #automation { background: var(--c-bone); }
.c .folio-systems { gap: 12px; margin-top: 28px; border-top: 0; }
.c .folio-systems li { grid-template-columns: minmax(0,1fr); grid-template-rows: auto auto auto 1fr; gap: 0; padding: 22px 22px 20px; border: 0; border-radius: 16px; background: #fff; }
.c .folio-system-no { grid-row: auto; justify-self: start; margin-bottom: 12px; padding: 3px 8px; border-radius: 6px; background: #e3f1f0; font-family: "JetBrains Mono", ui-monospace, monospace; font-size: 12px; color: #1a6f6b; }
.c .folio-systems strong { font-size: 17px; font-weight: 800; letter-spacing: -0.01em; }
.c .folio-system-built { margin-top: 8px; font-size: 14.5px; line-height: 1.7; }
.c .folio-system-effect { margin-top: 14px; padding-top: 12px; border-top: 1px solid #ece8de; font-size: 13.5px; }

/* ── 연락: 인트로와 같은 점 무늬와 불빛 */
.c .folio-contact { position: relative; overflow: hidden; background: var(--c-ink); }
.c .folio-contact::before { content: ""; position: absolute; top: -30%; right: -12%; width: 62%; height: 160%; border-radius: 50%; background: radial-gradient(circle at 40% 40%, rgba(199,48,27,.42), transparent 58%), radial-gradient(circle at 70% 64%, rgba(255,134,54,.14), transparent 52%); filter: blur(80px); pointer-events: none; }
.c .folio-contact::after { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(244,241,234,.13) 1px, transparent 1.6px); background-size: 20px 20px; -webkit-mask-image: radial-gradient(60% 80% at 80% 50%, #000 10%, transparent 76%); mask-image: radial-gradient(60% 80% at 80% 50%, #000 10%, transparent 76%); pointer-events: none; }
.c .folio-contact > .folio-wrap { position: relative; z-index: 1; }

/* ── 태블릿 */
@media (max-width: 1023px) {
  .c .folio-career ol, .c .loop-panels { grid-template-columns: minmax(0,1fr); }
  .c .c-kit { grid-template-columns: minmax(0,1fr); }
  .c .loop-panel:not(:last-child)::after { display: none; }
  .c .loop-panel-line { min-height: 0; }
  .c .loop-metric-basis { min-height: 0; }
  .c .loop-rail { grid-template-columns: minmax(0,1fr); }
  .c .loop-more { grid-column: 1; grid-row: auto; order: 0; margin-top: 8px; }
}
/* ── 휴대폰 */
@media (max-width: 767px) {
  .c .c-head { flex-direction: column; align-items: flex-start; gap: 4px; margin-bottom: 26px; }
  .c .c-career { padding: 56px 0 60px; }
  .c .folio-career ol { gap: 12px; }
  .c .folio-career ol > li { padding: 22px 20px 22px; border-left: 0; }
  .c .folio-career ol > li strong + span { margin-top: 10px; line-height: 1.75; }
  .c .folio-career ol > li:first-child::before { left: 20px; }
  .c .folio-career ol > li strong { margin-top: 16px; font-size: 18px; }
  .c .c-kit { gap: 12px; margin-top: 12px; }
  .c .c-clients { padding: 22px 20px 20px; }
  .c .folio-brands { font-size: 17px; line-height: 1.6; }
  .c .folio-stack { grid-template-columns: minmax(0,1fr); gap: 10px; margin-top: 16px; padding-top: 16px; }
  .c .folio-stack dt { margin-bottom: 2px; }
  .c .folio-records { padding: 6px 20px; }
  .c .loop-rail { margin-bottom: 26px; }
  .c .loop-panels { gap: 12px; }
  .c .loop-panel, .c .loop-panel:first-child { padding: 24px 20px 16px; }
  .c .c-stage-word { font-size: 30px; }
  .c .loop-panel-line { margin-top: 16px; font-size: 19px; }
  .c .loop-metrics { margin-top: 18px; padding: 18px 18px 16px; }
  .c .loop-panel-story { margin-top: 18px; }
  .c .loop-metric-value { font-size: 42px; }
  .c .loop-panel-story { font-size: 15px; }
  .c .c-cover, .c .folio-case-sm .c-cover { aspect-ratio: 4 / 3.3; padding: 22px 22px 0; border-radius: 20px; }
  .c .c-cover-brand, .c .folio-case-sm .c-cover-brand { font-size: 28px; }
  .c .c-cover .folio-case-media { margin-top: 16px; border-radius: 12px 12px 0 0; }
  .c .folio-case-metric, .c .folio-case-sm .folio-case-metric { font-size: 34px; }
  .c .folio-more ul { grid-template-columns: minmax(0,1fr); }
  .c .folio-more a > span:last-child { grid-area: 1 / 2 / span 2; }
  .c .folio-systems { gap: 8px; }
  .c .folio-systems li { padding: 18px 18px 16px; }
  .c .folio-system-no { margin-bottom: 10px; }
  .c .folio-system-effect { margin-top: 12px; padding-top: 10px; }
  .c .folio-more { margin-top: 56px; }
  .c .folio-more a { padding: 16px 18px; }
}
`;
