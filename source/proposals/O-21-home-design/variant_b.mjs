// 시안 B — 어두운 대시보드형. 쪽 전체가 먹색, 내용은 패널에 담고, 성과는 KPI 타일(큰 숫자 + 가로 막대)로, 사례는 지표가 붙은 카드로.
import { career, stack, records, loop, cases, chart, E } from "./content.mjs";

const arrow = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const medal = `<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><circle cx="12" cy="9" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.6 13.2 7 21l5-2.6 5 2.6-1.6-7.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

/** 가로 막대 둘 + 큰 숫자. 증감률만 있는 값은 막대에 숫자를 적지 않는다 */
function kpi(c) {
  if (c.kind === "d") {
    const labels = c.labels || ["기준", "결과"];
    return `<div class="kp" role="img" aria-label="${E(c.name)} ${E(c.delta)}">
      <p class="kp-num"><b>${E(c.delta)}</b></p>
      <div class="kp-rows">
        <div class="kp-row"><span class="kp-lab">${E(labels[0])}</span><span class="kp-track"><i class="kp-bar is-before" style="width:${(100 / c.ratio).toFixed(1)}%"></i></span></div>
        <div class="kp-row"><span class="kp-lab">${E(labels[1])}</span><span class="kp-track"><i class="kp-bar is-after" style="width:100%"></i></span></div>
      </div>
    </div>`;
  }
  const max = Math.max(c.a[2], c.b[2]);
  const w = (v) => Math.max(2, (v / max) * 100).toFixed(1);
  return `<div class="kp" role="img" aria-label="${E(c.name)} ${E(c.a[1])}에서 ${E(c.b[1])}">
    <p class="kp-num"><span>${E(c.a[1])} →</span><b>${E(c.b[1])}</b></p>
    <div class="kp-rows">
      <div class="kp-row"><span class="kp-lab">${E(c.a[0])}</span><span class="kp-track"><i class="kp-bar is-before" style="width:${w(c.a[2])}%"></i></span></div>
      <div class="kp-row"><span class="kp-lab">${E(c.b[0])}</span><span class="kp-track"><i class="kp-bar is-after" style="width:${w(c.b[2])}%"></i></span></div>
    </div>
  </div>`;
}

export const html = {
  career: `
<section class="mk b-career" id="mk-career">
  <div class="mk-wrap">
    <header class="mk-head">
      <div>
        <p class="mk-eyebrow"><i></i>Career</p>
        <h2 class="mk-h2">9개 업종 30여 개 브랜드의<br>광고를 운영했습니다</h2>
      </div>
      <a class="mk-more" href="#">수준별 역량 표 ${arrow}</a>
    </header>

    <div class="b-career-grid">
      <ol class="b-jobs">
        ${career.map((c) => `
        <li class="b-job${c.now ? " is-now" : ""}">
          <span class="b-node" aria-hidden="true"></span>
          <div class="b-panel">
            <div class="b-job-top">
              <img src="${c.logo}" alt="${E(c.name)}" style="height:${c.logoH}px">
              <p class="b-job-period">${E(c.period)}${c.now ? `<span class="b-live">NOW</span>` : ""}</p>
            </div>
            <h3>${E(c.name)} <span>· ${E(c.role)}</span></h3>
            <p class="b-job-text">${E(c.text)}</p>
            <ul class="b-facts">${c.facts.map((f) => `<li>${E(f)}</li>`).join("")}</ul>
          </div>
        </li>`).join("")}
      </ol>

      <aside class="b-side">
        <div class="b-panel b-stack">
          <p class="b-panel-label">Stack</p>
          <dl>
            ${stack.map((s) => `<div><dt>${E(s.label)}</dt><dd>${s.items.map((i) => `<span>${E(i)}</span>`).join("")}</dd></div>`).join("")}
          </dl>
        </div>
        <div class="b-panel b-awards">
          <p class="b-panel-label">Awards</p>
          <ul>
            ${records.map((r) => `<li><span class="b-medal">${medal}</span><div><b>${E(r.title)}${/^\d/.test(r.year) ? ` <i>${E(r.year)}</i>` : ""}</b><span>${E(r.sub)}</span></div></li>`).join("")}
          </ul>
        </div>
      </aside>
    </div>
  </div>
</section>`,

  loop: `
<div class="mk b-loop">
  <div class="mk-wrap">
    <header class="mk-head">
      <div>
        <p class="mk-eyebrow"><i></i>How I work</p>
        <h2 class="mk-h2">제가 문제를 푸는 순서</h2>
      </div>
      <a class="mk-more" href="#">도구와 역량 전체 보기 ${arrow}</a>
    </header>
    <ol class="b-pipe">
      ${loop.map((s, i) => `
      <li class="b-stage${i === 2 ? " is-last" : ""}">
        <div class="b-stage-head">
          <span class="b-stage-no">${s.no}</span>
          <span class="b-stage-word">${s.word}</span>
          <span class="b-stage-ko">${E(s.ko)}</span>
        </div>
        <h3>${E(s.title)}</h3>
        <div class="b-kpi">
          <p class="b-kpi-name">${E(s.chart.name)}</p>
          ${kpi(s.chart)}
          <p class="b-kpi-basis">${E(s.chart.basis)}</p>
        </div>
        <p class="b-stage-text">${E(s.text)}</p>
        <p class="b-stage-cases"><span>사례</span>${s.cases.map((c) => `<a href="#">${E(c)}</a>`).join("")}</p>
      </li>`).join("")}
    </ol>
  </div>
</div>`,

  work: `
<div class="mk b-work">
  <div class="mk-wrap">
    <header class="mk-head">
      <div>
        <p class="mk-eyebrow"><i></i>Selected work</p>
        <h2 class="mk-h2">대표 사례</h2>
        <p class="mk-sub">숫자마다 기간과 제 몫을 함께 적었습니다.</p>
      </div>
    </header>
    <ol class="b-cases">
      ${cases.map((c, i) => `
      <li class="b-case${i < 2 ? " is-lg" : ""}">
        <div class="b-case-head">
          <span class="b-case-no">${c.no}</span>
          <p class="b-case-brand">${E(c.brand)}</p>
          <span class="b-case-tag">${E(c.tag)}</span>
        </div>
        <a class="b-shot" href="#"><img src="${c.img}" alt=""></a>
        <div class="b-case-kpi">
          <div>
            <p class="b-kpi-name">${E(c.chart.name)}</p>
            ${c.chart.kind === "d"
              ? `<p class="kp-num"><b>${E(c.chart.delta)}</b></p>`
              : `<p class="kp-num"><span>${E(c.chart.a[1])} →</span><b>${E(c.chart.b[1])}</b></p>`}
            <p class="b-kpi-basis">${E(c.period)} · ${E(c.chart.basis)}</p>
          </div>
          ${chart(c.chart, i < 2 ? 64 : 52, c.chart.labels ? 58 : 0)}
        </div>
        <div class="b-case-body">
          ${c.badge ? `<p class="b-case-badge">${E(c.badge)}</p>` : ""}
          <h3>${E(c.title)}</h3>
          ${c.text ? `<p class="b-case-text">${E(c.text)}</p>` : ""}
          <p class="b-case-scope"><b>기여 범위</b>${E(c.scope)}</p>
          <a class="mk-more" href="#">사례 보기 ${arrow}</a>
        </div>
      </li>`).join("")}
    </ol>
  </div>
</div>`,
};

export const css = `
/* ── 공통(먹색 바탕) */
.mk { --bg:#0b0d10; --panel:#12171e; --panel2:#161c24; --bd:#232b36; --bd2:#2c343f; --tx:#f5f3ef; --tx2:#b3bbc5; --tx3:#8f98a3; --red:#ff5a3d; --teal:#4fd1cd; --amber:#e8ae45;
      --before:#6b7684; --after:#ff5a3d; --val:#ffffff; --axis:#a8b0ba; --base:#2c343f;
      word-break: keep-all; color: var(--tx); background: var(--bg); font-family: "Pretendard", system-ui, sans-serif; }
.mk-wrap { max-width: 1240px; margin: 0 auto; padding: 0 40px; }
.mk-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; margin-bottom: 44px; }
.mk-eyebrow { display: flex; align-items: center; gap: 10px; font-family: "JetBrains Mono", monospace; font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--teal); }
.mk-eyebrow i { width: 8px; height: 8px; border-radius: 2px; background: var(--teal); }
.mk-h2 { margin-top: 14px; font-size: 44px; line-height: 1.22; font-weight: 900; letter-spacing: -0.03em; color: #fff; }
.mk-sub { margin-top: 14px; font-size: 18px; line-height: 1.6; color: var(--tx2); }
.mk-more { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; font-size: 15px; font-weight: 700; color: var(--tx); text-decoration: underline; text-underline-offset: 5px; text-decoration-color: #57626f; text-decoration-thickness: 1px; white-space: nowrap; }
.b-panel { border: 1px solid var(--bd); border-radius: 18px; background: linear-gradient(180deg, #141a22 0%, #10151b 100%); }
.b-panel-label { font-family: "JetBrains Mono", monospace; font-size: 12px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--tx3); }

/* ── 세로 막대(사례 카드 오른쪽) — 값은 왼쪽의 큰 숫자가 말하므로 막대에는 적지 않는다 */
.ch { font-variant-numeric: tabular-nums; }
.ch-plot { display: flex; align-items: flex-end; gap: 8px; height: calc(var(--h) + 6px); border-bottom: 1px solid var(--base); }
.ch-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: var(--cw, 50px); }
.ch-bar { display: block; flex: none; width: 22px; border-radius: 4px 4px 0 0; background: var(--before); }
.ch-bar.is-after { background: var(--after); }
.ch-val { display: none; }
.ch-axis { display: flex; gap: 8px; margin-top: 7px; }
.ch-axis span { display: flex; justify-content: center; width: var(--cw, 50px); font-size: 11px; line-height: 1.25; color: var(--axis); white-space: nowrap; }
.ch-h { display: grid; gap: 9px; width: 168px; }
.ch-h .ch-row { display: grid; grid-template-columns: 42px minmax(0,1fr); align-items: center; gap: 8px; }
.ch-h .ch-lab { font-size: 11px; color: var(--axis); white-space: nowrap; }
.ch-h .ch-track { display: block; }
.ch-h .ch-bar { width: auto; height: 14px; border-radius: 0 4px 4px 0; }
.ch-h .ch-track .ch-bar { min-width: 3px; }

/* ── KPI: 큰 숫자 + 가로 막대 둘 */
.kp-num { display: flex; align-items: baseline; gap: 10px; font-family: "Archivo", "Pretendard", sans-serif; font-stretch: 118%; font-variant-numeric: tabular-nums; letter-spacing: -0.02em; white-space: nowrap; }
.kp-num span { font-size: 18px; font-weight: 700; color: var(--axis); }
.kp-num b { font-size: 44px; line-height: 1; font-weight: 800; color: #fff; }
.kp-rows { display: grid; gap: 9px; margin-top: 18px; }
.kp-row { display: grid; grid-template-columns: 104px minmax(0,1fr); align-items: center; gap: 12px; }
.kp-lab { font-size: 12.5px; color: var(--axis); white-space: nowrap; }
.kp-track { display: block; height: 14px; border-radius: 0 4px 4px 0; background: rgba(255,255,255,.04); }
.kp-bar { display: block; height: 14px; border-radius: 0 4px 4px 0; background: var(--before); }
.kp-bar.is-after { background: var(--after); }

/* ── 경력: 세로 타임라인 + 옆 패널 */
.b-career { padding: 96px 0 104px; border-top: 1px solid var(--bd); }
.b-career-grid { display: grid; grid-template-columns: minmax(0,1.55fr) minmax(0,1fr); gap: 24px; align-items: stretch; }
.b-jobs { position: relative; display: grid; grid-auto-rows: 1fr; gap: 16px; padding-left: 34px; }
.b-jobs::before { content: ""; position: absolute; top: 30px; bottom: 30px; left: 7px; width: 2px; background: linear-gradient(180deg, var(--red) 0, var(--red) 12%, var(--bd2) 34%, var(--bd2) 100%); }
.b-job { position: relative; }
.b-node { position: absolute; top: 28px; left: -34px; width: 16px; height: 16px; border: 2px solid var(--bd2); border-radius: 50%; background: var(--bg); }
.b-job.is-now .b-node { border-color: var(--red); background: var(--red); box-shadow: 0 0 0 5px rgba(255,90,61,.18); }
.b-job .b-panel { display: flex; flex-direction: column; height: 100%; padding: 26px 28px 26px; }
.b-job.is-now .b-panel { border-color: #3a2a27; background: linear-gradient(180deg, #1a1614 0%, #12151a 100%); }
.b-job-top { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 24px; }
.b-job-top img { width: auto; filter: invert(1); opacity: .92; }
.b-job-period { display: flex; align-items: center; gap: 10px; font-family: "JetBrains Mono", monospace; font-size: 12.5px; font-weight: 700; letter-spacing: .02em; color: var(--tx2); }
.b-live { display: inline-flex; align-items: center; gap: 6px; padding: 3px 9px; border-radius: 999px; background: rgba(255,90,61,.14); font-size: 11px; letter-spacing: .08em; color: #ff8a73; }
.b-live::before { content: ""; width: 6px; height: 6px; border-radius: 50%; background: var(--red); }
.b-job h3 { margin-top: 20px; font-size: 21px; line-height: 1.35; font-weight: 800; letter-spacing: -0.02em; color: #fff; }
.b-job h3 span { font-weight: 600; color: var(--tx2); }
.b-job-text { margin-top: 12px; font-size: 15.5px; line-height: 1.8; color: var(--tx2); }
.b-facts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 18px; }
.b-facts li { display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; border: 1px solid var(--bd2); border-radius: 8px; font-size: 13px; font-weight: 700; color: var(--tx); }
.b-facts li::before { content: ""; width: 6px; height: 6px; border-radius: 1px; background: var(--teal); }
.b-side { display: grid; gap: 16px; }
.b-stack, .b-awards { padding: 24px 26px; }
.b-stack dl { display: grid; margin-top: 8px; }
.b-stack dl > div { padding: 14px 0; border-top: 1px solid var(--bd); }
.b-stack dl > div:first-child { border-top: 0; }
.b-stack dt { font-size: 12.5px; font-weight: 800; color: var(--teal); }
.b-stack dd { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
.b-stack dd span { padding: 4px 10px; border-radius: 6px; background: #1b222c; font-size: 13px; font-weight: 600; color: #dfe3e7; }
.b-awards ul { display: grid; margin-top: 8px; }
.b-awards li { display: flex; align-items: center; gap: 14px; padding: 14px 0; border-top: 1px solid var(--bd); }
.b-awards li:first-child { border-top: 0; }
.b-medal { display: grid; place-items: center; flex: none; width: 38px; height: 38px; border-radius: 10px; background: rgba(232,174,69,.12); color: var(--amber); }
.b-awards b { display: block; font-size: 14.5px; font-weight: 800; color: #fff; }
.b-awards b i { margin-left: 6px; font-family: "Archivo", sans-serif; font-style: normal; font-stretch: 118%; font-size: 13px; color: var(--amber); }
.b-awards div > span { display: block; margin-top: 3px; font-size: 12.5px; line-height: 1.5; color: var(--tx2); }

/* ── 일하는 순서: 한 줄로 이어진 세 단계 */
.b-loop { padding: 104px 0 112px; border-top: 1px solid var(--bd); background: linear-gradient(180deg, #0e1217 0%, #0b0d10 100%); }
.b-pipe { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); border: 1px solid var(--bd); border-radius: 20px; background: linear-gradient(180deg, #141a22 0%, #10151b 100%); overflow: hidden; }
.b-stage { position: relative; display: flex; flex-direction: column; padding: 30px 30px 28px; border-left: 1px solid var(--bd); }
.b-stage:first-child { border-left: 0; }
.b-stage-head { display: flex; align-items: center; gap: 12px; padding-bottom: 20px; border-bottom: 1px solid var(--bd); }
.b-stage-no { display: grid; place-items: center; width: 30px; height: 30px; border: 1px solid var(--bd2); border-radius: 8px; font-family: "JetBrains Mono", monospace; font-size: 12px; font-weight: 700; color: var(--tx2); }
.b-stage-word { font-family: "Archivo", sans-serif; font-stretch: 125%; font-size: 26px; line-height: 1; font-weight: 900; letter-spacing: -0.01em; color: #fff; }
.b-stage.is-last .b-stage-word { color: var(--red); }
.b-stage.is-last .b-stage-no { border-color: var(--red); color: var(--red); }
.b-stage-ko { margin-left: auto; font-size: 13px; font-weight: 700; color: var(--tx3); }
.b-stage:not(.is-last)::after { content: ""; position: absolute; z-index: 2; top: 37px; right: -9px; width: 16px; height: 16px; border-top: 1px solid var(--bd2); border-right: 1px solid var(--bd2); background: #141a22; transform: rotate(45deg); }
.b-stage h3 { margin-top: 22px; min-height: 2.7em; font-size: 19px; line-height: 1.35; font-weight: 800; letter-spacing: -0.02em; color: #fff; }
.b-kpi { margin-top: 20px; padding: 20px 20px 16px; border: 1px solid var(--bd); border-radius: 14px; background: #0b0d10; }
.b-kpi-name { margin-bottom: 10px; font-size: 13px; font-weight: 700; color: var(--tx2); }
.b-kpi-basis { margin-top: 14px; font-size: 12px; line-height: 1.5; color: var(--tx3); }
.b-kpi > .b-kpi-basis { min-height: 3em; }
.b-stage-text { margin-top: 20px; font-size: 14.5px; line-height: 1.75; color: var(--tx2); }
.b-stage-cases { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; margin-top: auto; padding-top: 20px; font-size: 13px; }
.b-stage-cases span { font-family: "JetBrains Mono", monospace; font-size: 11.5px; font-weight: 700; letter-spacing: .08em; color: var(--teal); }
.b-stage-cases a { font-weight: 700; color: var(--tx); text-decoration: underline; text-underline-offset: 4px; text-decoration-color: #57626f; }

/* ── 대표 사례: 지표가 붙은 카드 */
.b-work { padding: 104px 0 120px; border-top: 1px solid var(--bd); }
.b-cases { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 20px; }
.b-case { grid-column: span 2; display: flex; flex-direction: column; overflow: hidden; border: 1px solid var(--bd); border-radius: 20px; background: linear-gradient(180deg, #141a22 0%, #10151b 100%); }
.b-case.is-lg { grid-column: span 3; }
.b-case-head { display: flex; align-items: center; gap: 12px; padding: 18px 22px 16px; }
.b-case.is-lg .b-case-head { padding: 22px 28px 18px; }
.b-case-no { display: grid; place-items: center; flex: none; width: 30px; height: 30px; border: 1px solid var(--bd2); border-radius: 8px; font-family: "JetBrains Mono", monospace; font-size: 12px; font-weight: 700; color: var(--tx2); }
.b-case-brand { font-size: 20px; line-height: 1.2; font-weight: 900; letter-spacing: -0.03em; color: #fff; }
.b-case.is-lg .b-case-brand { font-size: 26px; }
.b-case-tag { flex: none; margin-left: auto; padding: 5px 10px; border: 1px solid var(--bd2); border-radius: 999px; font-size: 12.5px; font-weight: 700; color: var(--tx2); white-space: nowrap; }
.b-shot { display: block; overflow: hidden; margin: 0 14px; aspect-ratio: 3 / 2; border: 1px solid var(--bd); border-radius: 12px; background: #0b0d10; }
.b-case.is-lg .b-shot { margin: 0 18px; aspect-ratio: 16 / 9; }
.b-shot img { display: block; width: 100%; height: 100%; object-fit: cover; object-position: center top; }
.b-case-kpi { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin: 0 22px; padding: 18px 0 18px; border-bottom: 1px solid var(--bd); }
.b-case.is-lg .b-case-kpi { margin: 0 28px; padding: 20px 0; }
.b-case-kpi .b-kpi-name { margin-bottom: 8px; }
.b-case-kpi .kp-num b { font-size: 34px; }
.b-case.is-lg .b-case-kpi .kp-num b { font-size: 44px; }
.b-case-kpi .kp-num span { font-size: 15px; }
.b-case.is-lg .b-case-kpi .kp-num span { font-size: 18px; }
.b-case-kpi .b-kpi-basis { margin-top: 10px; }
.b-case-kpi .ch { flex: none; }
.b-case-body { display: flex; flex-direction: column; flex: 1; padding: 20px 22px 18px; }
.b-case.is-lg .b-case-body { padding: 22px 28px 20px; }
.b-case-badge { display: inline-flex; align-self: flex-start; align-items: center; gap: 8px; margin-bottom: 12px; padding: 4px 10px; border-radius: 6px; background: rgba(232,174,69,.12); font-size: 12.5px; font-weight: 800; color: var(--amber); }
.b-case h3 { font-size: 18px; line-height: 1.5; font-weight: 800; letter-spacing: -0.02em; color: #fff; }
.b-case.is-lg h3 { font-size: 22px; line-height: 1.42; }
.b-case-text { margin-top: 10px; font-size: 15px; line-height: 1.75; color: var(--tx2); }
.b-case-scope { margin-top: 14px; font-size: 13px; line-height: 1.6; color: var(--tx2); }
.b-case-scope b { margin-right: 8px; font-weight: 800; color: var(--teal); }
.b-case .mk-more { margin-top: auto; padding-top: 8px; }

/* ── 첫 화면과 머리띠를 먹색으로(구조는 그대로, 색만) */
html, body, .folio { background: #0b0d10 !important; }
.folio { color: #f5f3ef; }
.folio-hero { position: relative; background: #0b0d10; }
.folio-hero::before { content: ""; position: absolute; inset: 0; background-image: radial-gradient(rgba(244,241,234,.11) 1px, transparent 1.6px); background-size: 22px 22px; -webkit-mask-image: radial-gradient(60% 70% at 78% 40%, #000 10%, transparent 75%); mask-image: radial-gradient(60% 70% at 78% 40%, #000 10%, transparent 75%); pointer-events: none; }
.folio-hero > .folio-wrap { position: relative; }
.folio-eyebrow { color: #b3bbc5; }
.folio-hero-title, .folio-hero-title .folio-hero-sub { color: #fff; }
.folio-hero-title .folio-hero-display + .folio-hero-display { color: #ff5a3d; }
.folio-hero-strengths li { border-color: #2c343f; background: #12171e; color: #f5f3ef; }
.folio-hero-strengths li span { color: #ff5a3d; }
.folio-hero .folio-proofs { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 10px; border-top: 0; max-width: none; }
.folio-proofs a { padding: 18px 16px 16px; border: 1px solid #232b36; border-radius: 16px; background: linear-gradient(180deg, #141a22 0%, #10151b 100%); }
.folio-proofs .folio-proof-value { color: #fff; font-size: 30px; }
.folio-proofs .folio-proof-before { color: #a8b0ba; }
.folio-proof-bars i { background: #ff5a3d; }
.folio-proof-bars i:first-child { background: #57626f; }
.folio-proof-marks i { background: #1f2731; color: #f5f3ef; }
.folio-proof-marks i::before { background: #ff5a3d; }
.folio-proof-label { color: #f5f3ef; }
.folio-proofs .folio-proof-basis { color: #a8b0ba; }
.folio-hero .folio-hero-note { color: #b3bbc5; }
.folio-btn-dark { background: #fff; color: #0b0d10; }
.folio-btn-line { border-color: #3a4450; background: transparent; color: #f5f3ef; }
.folio-link-strong { color: #f5f3ef; text-decoration-color: #57626f; }
.folio-hero-photo img { box-shadow: 0 0 0 1px rgba(255,255,255,.08), 0 40px 80px -30px rgba(0,0,0,.9); }
.folio-hero-photo figcaption { border-color: rgba(255,255,255,.2); background: rgba(11,13,16,.62); color: #fff; }
`;
