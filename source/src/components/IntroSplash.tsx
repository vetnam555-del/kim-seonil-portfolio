import type { CSSProperties } from "react";
import IntroController from "@/components/IntroController";
import { introCopy } from "@/data/intro";

/*
 * 첫 방문 인트로 (2026.09.25) — 공용판 홈 전용. 문구·출처는 src/data/intro.ts.
 *
 * 어떻게 도는가
 * - 아래 인라인 스크립트가 덮개보다 먼저 실행돼 <html data-intro> 를 정한다. 그래야 두 번째 방문에
 *   덮개가 한 프레임이라도 비치지 않는다. 기본값은 '안 보임' — 스크립트가 못 돌면 인트로도 없다.
 * - 재생은 전부 CSS 애니메이션이다. JS(IntroController)는 건너뛰기와 끝난 뒤 정리만 맡는다.
 *   JS 가 죽어도 덮개는 3초 뒤 스스로 걷히고(visibility:hidden 까지 keyframes 에 넣었다) 막지 않는다.
 * - 안 보여 주는 경우: 동작 줄이기 설정 · 주소에 #앵커나 ?intro=0 ·
 *   자동화 브라우저(검수 스크립트가 헤드리스로 돌 때 화면을 가리지 않도록).
 * - 2026.09.27 사용자 요청으로 '같은 탭에서 이미 봤으면 끔'(sessionStorage ksi-intro)을 뺐다 —
 *   새로고침·새로 열기마다 재생한다. 사이트 안에서 다른 쪽을 갔다가 홈으로 돌아오는 클라이언트 이동에서는
 *   이 인라인 스크립트가 다시 돌지 않아 data-intro 가 done 으로 남으므로 다시 틀지 않는다.
 * - 덮개는 장식이라 스크린리더에서 뺀다. 같은 숫자는 표지와 카드에 기준과 함께 있다.
 * - 건너뛰기는 이 스크립트가 먼저 받는다 (2026.09.26). IntroController 는 하이드레이션 뒤에야 붙어서,
 *   느린 기기에서 그 전에 누른 클릭·키·스크롤은 무시됐다(검수 중 한 번 재현). 여기서 받은 건너뛰기는
 *   controller 와 같은 일(덮개 걷기 · data-intro=reveal → done · ksi:intro-done 신호)을 한다.
 */
const DECIDE = `(function(){var d=document.documentElement;try{var u=navigator.userAgent;if(/[?&]intro=0/.test(location.search)||location.hash.length>1||navigator.webdriver||/Headless/.test(u)||window.matchMedia("(prefers-reduced-motion: reduce)").matches){d.setAttribute("data-intro","off");return}d.setAttribute("data-intro","play");var ev=["pointerdown","keydown","wheel","touchstart"],skip=function(){ev.forEach(function(t){removeEventListener(t,skip,true)});if(d.getAttribute("data-intro")!=="play")return;var el=document.querySelector(".intro");if(el)el.classList.add("is-skip");window.__ksiIntroDone=true;d.setAttribute("data-intro","reveal");dispatchEvent(new Event("ksi:intro-done"));setTimeout(function(){d.setAttribute("data-intro","done")},1100)};ev.forEach(function(t){addEventListener(t,skip,{capture:true,passive:true})})}catch(e){d.setAttribute("data-intro","off")}})();`;

export default function IntroSplash({ lang }: { lang: "ko" | "en" }) {
  const t = introCopy[lang];
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: DECIDE }} />
      <div className="intro" aria-hidden="true">
        <div className="intro-glow" />
        <div className="intro-meta">
          <span>{t.metaLeft}</span>
          <span>{t.metaRight}</span>
        </div>
        <div className="intro-stage">
          <ol className="intro-list">
            {t.steps.map((s, i) => (
              <li key={s.key} style={{ "--i": i } as CSSProperties}>
                <span>{s.stage}</span>
                {s.key}
              </li>
            ))}
          </ol>
          <div className="intro-nums">
            {t.steps.map((s, i) => (
              <div key={s.key} className="intro-num" style={{ "--i": i } as CSSProperties}>
                <em>{`${s.stage} · ${s.key}`}</em>
                <b>
                  {s.before ? <span className="intro-before">{s.before}</span> : null}
                  {s.value}
                </b>
                <small>{s.basis}</small>
              </div>
            ))}
          </div>
        </div>
        <div className="intro-name">
          <strong>{t.name}</strong>
          <span>{t.role}</span>
        </div>
        <div className="intro-foot">
          <i />
          <span>{t.skip}</span>
        </div>
      </div>
      <IntroController />
    </>
  );
}
