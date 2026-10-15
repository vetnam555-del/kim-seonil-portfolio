"use client";

import { useEffect } from "react";

/*
 * 인트로 건너뛰기와 끝난 뒤 정리 (IntroSplash.tsx 참고).
 * - 클릭·키·휠·터치 한 번이면 바로 걷힌다. 표지는 그때부터 올라온다(data-intro="reveal").
 * - 끝나면 window.__ksiIntroDone 을 세우고 "ksi:intro-done" 을 쏜다 — 표지 숫자(CountUpValue)가
 *   덮개 밑에서 미리 다 올라가 버리지 않게 이 신호를 기다린다.
 * - 마지막엔 data-intro="done" 이라 홈으로 돌아와도(클라이언트 이동) 다시 틀지 않는다.
 */
type IntroWindow = Window & { __ksiIntroDone?: boolean };

export default function IntroController() {
  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro !== "play") return;
    const el = document.querySelector<HTMLElement>(".intro");
    if (!el) return;

    let finished = false;
    let settle = 0;
    const events: [EventTarget, string][] = [
      [window, "keydown"],
      [window, "wheel"],
      [window, "touchstart"],
      [el, "click"],
    ];
    const finish = (skipped: boolean) => {
      if (finished) return;
      finished = true;
      events.forEach(([target, type]) => target.removeEventListener(type, skip));
      el.removeEventListener("animationend", onEnd);
      window.clearTimeout(fallback);
      (window as IntroWindow).__ksiIntroDone = true;
      if (skipped) {
        el.classList.add("is-skip");
        root.dataset.intro = "reveal";
      }
      window.dispatchEvent(new Event("ksi:intro-done"));
      /* 표지 올라오는 동작(0.8s)이 끝난 뒤 정리한다 — 도중에 규칙이 빠지면 글자가 튄다 */
      settle = window.setTimeout(() => {
        root.dataset.intro = "done";
      }, skipped ? 1100 : 800);
    };
    const skip = () => finish(true);
    const onEnd = (e: AnimationEvent) => {
      if (e.target === el && e.animationName === "intro-wipe") finish(false);
    };
    events.forEach(([target, type]) => target.addEventListener(type, skip, { passive: true }));
    el.addEventListener("animationend", onEnd);
    /* animationend 가 오지 않는 경우(탭이 뒤에 있었다 등)에도 반드시 끝낸다 */
    const fallback = window.setTimeout(() => finish(false), 3900);

    return () => {
      events.forEach(([target, type]) => target.removeEventListener(type, skip));
      el.removeEventListener("animationend", onEnd);
      window.clearTimeout(fallback);
      window.clearTimeout(settle);
    };
  }, []);
  return null;
}
