// 시안 A — 밝은 종이 톤의 매거진형. 구간마다 바탕이 바뀌고(흰색 → 종이색 → 먹색 → 흰색), 성과는 막대 그래프로, 사례는 색면 표지로.
import { career, stack, records, loop, cases, chart, E } from "./content.mjs";

const arrow = `<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const medal = `<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true"><circle cx="12" cy="9" r="5.2" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.6 13.2 7 21l5-2.6 5 2.6-1.6-7.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/></svg>`;

const covers = { "01": "c-red", "02": "c-ink", "03": "c-bone", "04": "c-teal", "05": "c-slate" };

export const html = {
  career: `
<section class="mk a-career" id="mk-career">
  <div class="mk-wrap">
    <header class="mk-head">
      <div>
        <p class="mk-eyebrow">Career</p>
        <h2 class="mk-h2">9개 업종 30여 개 브랜드의<br>광고를 운영했습니다</h2>
      </div>
      <a class="mk-more" href="#">수준별 역량 표 ${arrow}</a>
    </header>

    <ol class="a-jobs">
      ${career.map((c) => `
      <li class="a-job${c.now ? " is-now" : ""}">
        <div class="a-job-top">
          <img src="${c.logo}" alt="${E(c.name)}" style="height:${c.logoH}px">
          ${c.now ? `<span class="a-now">현재</span>` : ""}
        </div>
        <p class="a-job-period">${E(c.period)}</p>
        <h3>${E(c.name)} · ${E(c.role)}</h3>
        <p class="a-job-text">${E(c.text)}</p>
        <ul class="a-facts">${c.facts.map((f) => `<li>${E(f)}</li>`).join("")}</ul>
      </li>`).join("")}
    </ol>

    <div class="a-kit">
      <dl class="a-stack">
        ${stack.map((s) => `<div><dt>${E(s.label)}</dt><dd>${s.items.map((i) => `<span>${E(i)}</span>`).join("")}</dd></div>`).join("")}
      </dl>
      <ul class="a-records">
        ${records.map((r) => `<li><span class="a-rec-ico">${medal}</span><div><b>${E(r.title)}${/^\d/.test(r.year) ? ` <i>${E(r.year)}</i>` : ""}</b><span>${E(r.sub)}</span></div></li>`).join("")}
      </ul>
    </div>
  </div>
</section>`,

  loop: `
<div class="mk a-loop">
  <div class="mk-wrap">
    <header class="mk-head">
      <div>
        <p class="mk-eyebrow">How I work</p>
        <h2 class="mk-h2">제가 문제를 푸는 순서</h2>
      </div>
      <a class="mk-more" href="#">도구와 역량 전체 보기 ${arrow}</a>
    </header>
    <ol class="a-steps">
      ${loop.map((s, i) => `
      <li class="a-step${i === 2 ? " is-last" : ""}">
        <p class="a-step-no">${s.no} <span>${E(s.ko)}</span></p>
        <p class="a-step-word">${s.word}</p>
        <h3>${E(s.title)}</h3>
        <figure class="a-fig">
          <figcaption>${E(s.chart.name)}</figcaption>
          ${chart(s.chart, 96)}
          <p class="a-fig-basis">${E(s.chart.basis)}</p>
        </figure>
        <p class="a-step-text">${E(s.text)}</p>
        <p class="a-step-cases"><span>사례</span>${s.cases.map((c) => `<a href="#">${E(c)}</a>`).join("")}</p>
      </li>`).join("")}
    </ol>
  </div>
</div>`,

  work: `
<div class="mk a-work">
  <div class="mk-wrap">
    <header class="mk-head">
      <div>
        <p class="mk-eyebrow">Selected work</p>
        <h2 class="mk-h2">대표 사례</h2>
        <p class="mk-sub">숫자마다 기간과 제 몫을 함께 적었습니다.</p>
      </div>
    </header>
    <ol class="a-cases">
      ${cases.map((c, i) => `
      <li class="a-case${i < 2 ? " is-lg" : ""}">
        <a class="a-cover ${covers[c.no]}" href="#">
          <div class="a-cover-copy">
            <p class="a-cover-meta"><b>${c.no}</b><span>${E(c.tag)}</span></p>
            <p class="a-cover-brand">${E(c.brand)}</p>
            <div class="a-cover-fig">
              <p>${E(c.chart.name)}</p>
              ${chart(c.chart, i < 2 ? 84 : 58, 62)}
            </div>
          </div>
          <div class="a-cover-shot"><img src="${c.img}" alt=""></div>
        </a>
        <div class="a-case-body">
          <p class="a-case-meta">${E(c.period)}${c.badge ? `<span>${E(c.badge)}</span>` : ""}</p>
          <h3>${E(c.title)}</h3>
          ${c.text ? `<p class="a-case-text">${E(c.text)}</p>` : ""}
          <p class="a-case-scope"><b>기여 범위</b>${E(c.scope)}</p>
          <p class="a-case-basis">${E(c.chart.basis)}</p>
          <a class="mk-more" href="#">사례 보기 ${arrow}</a>
        </div>
      </li>`).join("")}
    </ol>
  </div>
</div>`,
};

export const css = `
/* ── 공통 */
.mk { --ink:#0b0d10; --ink2:#3d4552; --ink3:#5a626c; --bone:#f2efe8; --bone2:#e9e4d9; --line:#ddd8ca; --red:#c7301b; --red-on:#ff5a3d; --teal:#1a6f6b; --slate:#3d4552;
      --before:#9c9585; --after:#c7301b; --val:#0b0d10; --axis:#5a626c; --base:#cfc9bb;
      word-break: keep-all; color: var(--ink); font-family: "Pretendard", system-ui, sans-serif; }
.mk-wrap { max-width: 1240px; margin: 0 auto; padding: 0 40px; }
.mk-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 32px; margin-bottom: 48px; }
.mk-eyebrow { font-family: "JetBrains Mono", monospace; font-size: 13px; font-weight: 700; letter-spacing: .14em; text-transform: uppercase; color: var(--red); }
.mk-h2 { margin-top: 14px; font-size: 44px; line-height: 1.22; font-weight: 900; letter-spacing: -0.03em; }
.mk-sub { margin-top: 14px; font-size: 18px; line-height: 1.6; color: var(--ink3); }
.mk-more { display: inline-flex; align-items: center; gap: 8px; min-height: 44px; font-size: 15px; font-weight: 700; color: inherit; text-decoration: underline; text-underline-offset: 5px; text-decoration-color: currentColor; text-decoration-thickness: 1px; white-space: nowrap; }

/* ── 그래프: 막대 둘(전 = 회색, 후 = 강조색). 값은 글자색으로 적는다 */
.ch { font-variant-numeric: tabular-nums; }
.ch-plot { display: flex; align-items: flex-end; gap: 14px; height: calc(var(--h) + 30px); border-bottom: 1px solid var(--base); }
.ch-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; width: var(--cw, 64px); }
.ch-bar { display: block; flex: none; width: 24px; border-radius: 4px 4px 0 0; background: var(--before); }
.ch-bar.is-after { background: var(--after); }
.ch-val { margin-bottom: 6px; font-size: 14px; font-weight: 700; color: var(--axis); white-space: nowrap; }
.ch-val.is-after { font-size: 17px; font-weight: 800; color: var(--val); }
.ch-axis { display: flex; gap: 14px; margin-top: 8px; }
.ch-axis span { display: flex; justify-content: center; width: var(--cw, 64px); font-size: 12px; line-height: 1.3; color: var(--axis); white-space: nowrap; }
.ch-h { display: grid; gap: 12px; }
.ch-h .ch-row { display: grid; grid-template-columns: 48px minmax(0,1fr); align-items: center; gap: 10px; }
.ch-h .ch-lab { font-size: 12px; color: var(--axis); white-space: nowrap; }
.ch-h .ch-track { display: flex; align-items: center; gap: 10px; min-width: 0; }
.ch-h .ch-bar { width: auto; height: 16px; border-radius: 0 4px 4px 0; }
.ch-h .ch-val { margin: 0; }

/* ── 경력: 종이색 띠 */
.a-career { padding: 104px 0 112px; background: var(--bone); }
.a-jobs { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 20px; }
.a-job { display: flex; flex-direction: column; padding: 30px 30px 28px; border-radius: 22px; background: #fff; box-shadow: 0 1px 0 rgba(11,13,16,.04), 0 24px 48px -36px rgba(11,13,16,.28); }
.a-job.is-now { box-shadow: inset 0 4px 0 var(--red), 0 24px 48px -36px rgba(11,13,16,.28); }
.a-job-top { display: flex; align-items: center; justify-content: space-between; min-height: 26px; }
.a-job-top img { width: auto; opacity: .9; }
.a-now { padding: 4px 10px; border-radius: 999px; background: #f7ece9; font-size: 12px; font-weight: 800; color: var(--red); }
.a-job-period { margin-top: 22px; font-family: "JetBrains Mono", monospace; font-size: 12.5px; font-weight: 700; letter-spacing: .02em; color: var(--ink3); }
.a-job h3 { margin-top: 8px; font-size: 21px; line-height: 1.35; font-weight: 800; letter-spacing: -0.02em; }
.a-job-text { margin-top: 12px; font-size: 15.5px; line-height: 1.75; color: var(--ink2); }
.a-facts { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; padding-top: 22px; }
.a-facts li { padding: 7px 12px; border-radius: 10px; background: var(--bone); font-size: 13.5px; font-weight: 700; color: var(--ink); }
.a-kit { display: grid; grid-template-columns: minmax(0,1.25fr) minmax(0,1fr); gap: 20px; margin-top: 20px; }
.a-stack { display: grid; gap: 0; padding: 12px 30px; border-radius: 22px; background: #fff; }
.a-stack > div { display: grid; grid-template-columns: 96px minmax(0,1fr); gap: 16px; padding: 16px 0; border-top: 1px solid #ece8de; }
.a-stack > div:first-child { border-top: 0; }
.a-stack dt { padding-top: 5px; font-size: 13px; font-weight: 800; color: var(--red); }
.a-stack dd { display: flex; flex-wrap: wrap; gap: 6px 6px; }
.a-stack dd span { padding: 5px 11px; border: 1px solid var(--line); border-radius: 999px; font-size: 13.5px; font-weight: 600; color: var(--ink2); }
.a-records { display: grid; gap: 12px; }
.a-records li { display: flex; align-items: center; gap: 16px; padding: 20px 24px; border-radius: 22px; background: var(--ink); color: #f5f3ef; }
.a-rec-ico { display: grid; place-items: center; flex: none; width: 44px; height: 44px; border-radius: 50%; background: rgba(255,255,255,.08); color: #e8ae45; }
.a-records b { display: block; font-size: 16px; font-weight: 800; }
.a-records b i { margin-left: 6px; font-family: "Archivo", sans-serif; font-style: normal; font-stretch: 125%; font-size: 14px; color: #e8ae45; }
.a-records div > span { display: block; margin-top: 3px; font-size: 13.5px; line-height: 1.5; color: #a8b0ba; }

/* ── 일하는 순서: 먹색 띠 */
.a-loop { padding: 112px 0 120px; background: var(--ink); color: #f5f3ef; --before:#6b7684; --after:#ff5a3d; --val:#ffffff; --axis:#a8b0ba; --base:#2c343f; }
.a-loop .mk-eyebrow { color: var(--red-on); }
.a-steps { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 20px; counter-reset: s; }
.a-step { position: relative; display: flex; flex-direction: column; padding: 32px 30px 30px; border: 1px solid #232b36; border-radius: 22px; background: #121821; }
.a-step:not(.is-last)::after { content: ""; position: absolute; top: 58px; right: -15px; z-index: 1; width: 10px; height: 10px; border-top: 2px solid #57626f; border-right: 2px solid #57626f; transform: rotate(45deg); }
.a-step-no { font-family: "JetBrains Mono", monospace; font-size: 12.5px; font-weight: 700; letter-spacing: .08em; color: #a8b0ba; }
.a-step-no span { margin-left: 8px; font-family: "Pretendard", sans-serif; letter-spacing: 0; }
.a-step-word { margin-top: 10px; font-family: "Archivo", sans-serif; font-stretch: 125%; font-size: 40px; line-height: 1; font-weight: 900; letter-spacing: -0.01em; }
.a-step.is-last .a-step-word { color: var(--red-on); }
.a-step h3 { margin-top: 22px; min-height: 2.7em; font-size: 20px; line-height: 1.35; font-weight: 800; letter-spacing: -0.02em; }
.a-fig { margin-top: 22px; padding: 22px 22px 18px; border-radius: 16px; background: #0b0d10; }
.a-fig figcaption { margin-bottom: 2px; font-size: 13.5px; font-weight: 700; color: #dfe3e7; }
.a-fig .ch-plot, .a-fig .ch-axis { gap: 0; }
.a-fig .ch-col, .a-fig .ch-axis span { flex: 1; width: auto; }
.a-fig .ch-plot { height: calc(var(--h) + 40px); }
.a-fig .ch-val { font-size: 15px; }
.a-fig .ch-val.is-after { font-size: 24px; font-family: "Archivo", "Pretendard", sans-serif; font-stretch: 118%; letter-spacing: -0.02em; }
.a-fig .ch-axis span { font-size: 12.5px; }
.a-fig-basis { min-height: 3em; margin-top: 14px; font-size: 12.5px; line-height: 1.5; color: #8f98a3; }
.a-step-text { margin-top: 20px; font-size: 15px; line-height: 1.75; color: #c3cad2; }
.a-step-cases { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 14px; margin-top: auto; padding-top: 22px; font-size: 13.5px; }
.a-step-cases span { font-weight: 800; color: var(--red-on); }
.a-step-cases a { font-weight: 700; color: #f5f3ef; text-decoration: underline; text-underline-offset: 4px; text-decoration-color: #57626f; }

/* ── 대표 사례: 색면 표지 */
.a-work { padding: 112px 0 120px; background: #fff; }
.a-cases { display: grid; grid-template-columns: repeat(6, minmax(0,1fr)); gap: 56px 24px; }
.a-case { grid-column: span 2; display: flex; flex-direction: column; }
.a-case.is-lg { grid-column: span 3; }
.a-cover { position: relative; display: block; overflow: hidden; aspect-ratio: 5 / 4; border-radius: 24px; color: #fff; text-decoration: none;
           --before: rgba(255,255,255,.5); --after:#fff; --val:#fff; --axis: rgba(255,255,255,.86); --base: rgba(255,255,255,.34); }
.a-case.is-lg .a-cover { aspect-ratio: 16 / 10.4; }
.a-cover.c-red { background: #c7301b; }
.a-cover.c-ink { background: #0b0d10; --before:#6b7684; --after:#ff5a3d; --axis:#a8b0ba; --base:#2c343f; }
.a-cover.c-teal { background: #1a6f6b; }
.a-cover.c-slate { background: #3d4552; --before: rgba(255,255,255,.42); }
.a-cover.c-bone { background: #f2efe8; color: var(--ink); --before:#9c9585; --after:#c7301b; --val:#0b0d10; --axis:#5a626c; --base:#cfc9bb; }
.a-cover-copy { position: relative; z-index: 2; display: flex; flex-direction: column; height: 100%; width: 54%; padding: 26px 0 24px 28px; }
.a-case.is-lg .a-cover-copy { width: 50%; padding: 32px 0 30px 36px; }
.a-cover-meta { display: flex; align-items: center; gap: 10px; font-size: 13px; font-weight: 700; }
.a-cover-meta b { font-family: "Archivo", sans-serif; font-stretch: 125%; font-size: 13px; font-weight: 800; letter-spacing: .04em; opacity: .8; }
.a-cover-meta span { padding: 4px 10px; border-radius: 999px; background: rgba(255,255,255,.16); }
.a-cover.c-bone .a-cover-meta span { background: rgba(11,13,16,.07); }
.a-cover-brand { margin-top: 14px; font-size: 27px; line-height: 1.15; font-weight: 900; letter-spacing: -0.03em; }
.a-case.is-lg .a-cover-brand { font-size: 44px; }
.a-cover-fig { margin-top: auto; }
.a-cover-fig > p { margin-bottom: 4px; font-size: 13px; font-weight: 700; opacity: .9; }
.a-cover .ch-plot, .a-cover .ch-axis { gap: 10px; }
.a-cover .ch-h { width: 100%; max-width: 260px; }
.a-cover .ch-h .ch-val { font-size: 14px; }
.a-cover .ch-h .ch-val.is-after { font-size: 17px; }
.a-cover-shot { position: absolute; z-index: 1; top: 12%; right: -7%; width: 56%; transform: rotate(-5deg); border-radius: 14px; overflow: hidden; background: #fff; box-shadow: 0 30px 50px -22px rgba(0,0,0,.55), 0 0 0 1px rgba(255,255,255,.14); }
.a-case.is-lg .a-cover-shot { top: 13%; right: -5%; width: 55%; }
.a-cover-shot img { display: block; width: 100%; height: auto; }
.a-case-body { display: flex; flex-direction: column; flex: 1; padding: 22px 4px 0; }
.a-case-meta { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; font-family: "JetBrains Mono", monospace; font-size: 12.5px; font-weight: 700; color: var(--ink3); }
.a-case-meta span { padding: 3px 9px; border-radius: 999px; background: #f7ece9; font-family: "Pretendard", sans-serif; font-size: 12.5px; font-weight: 800; color: var(--red); }
.a-case h3 { margin-top: 12px; font-size: 20px; line-height: 1.45; font-weight: 800; letter-spacing: -0.02em; }
.a-case.is-lg h3 { font-size: 24px; }
.a-case-text { margin-top: 12px; font-size: 15.5px; line-height: 1.75; color: var(--ink2); }
.a-case-scope { margin-top: 16px; font-size: 13.5px; line-height: 1.6; color: var(--ink2); }
.a-case-scope b { margin-right: 8px; font-weight: 800; color: var(--red); }
.a-case-basis { margin-top: 4px; font-size: 12.5px; color: var(--ink3); }
.a-case .mk-more { margin-top: auto; padding-top: 10px; }
`;
