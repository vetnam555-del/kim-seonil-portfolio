"use client";

import { useEffect } from "react";

/*
 * 주소에 #이 붙어 새로 열린 쪽을 제자리에 세운다 (2026.11.12 B-16).
 *
 * 글꼴은 첫 그림 뒤에 붙는다(layout.tsx FONT_LOADER). 붙기 전 대체 서체 배치가 더 길어서(390px 소개 쪽 약 +1,500px)
 * 그때 정해진 도착점은 글꼴이 붙은 뒤의 구간 머리보다 아래다. 새로 연 /about/#career 가 390px 에서 988px,
 * 사례의 #case-results 가 641px, 홈의 #contact 가 146px 지나쳐 멈췄다 — 부드러운 스크롤은 떠난 뒤 도착점을 다시 잡지 않는다.
 *
 * - 스크립트가 붙기 전에는 부드러운 스크롤을 끈다(globals.css html:not(.js)). 첫 이동은 바로 가고, 그 뒤 위쪽 배치가
 *   줄어드는 것은 브라우저의 스크롤 고정이 따라간다.
 * - 스크롤 고정이 없는 브라우저에서도 맞도록, 글꼴이 붙은 뒤와 불러오기가 끝난 뒤에 한 번씩 제자리로 옮긴다.
 *   제자리는 브라우저가 계산한다(scrollIntoView — scroll-padding-top · scroll-margin-top 반영).
 * - 사람이 먼저 화면을 움직였으면 건드리지 않는다. 새로고침 · 뒤로 가기는 브라우저가 보던 자리를 되살리므로 손대지 않는다.
 * - 사이트 안에서 눌러 가는 이동은 Next 가 맡는다. 이 부품은 쪽을 새로 열 때 한 번만 돈다.
 */
const READER_MOVED = ["wheel", "touchstart", "keydown", "pointerdown"] as const;

export default function FragmentAnchor() {
  useEffect(() => {
    let id = "";
    try {
      id = decodeURIComponent((window.location.hash || "").slice(1));
    } catch {
      return;
    }
    if (!id) return;
    const entry = performance.getEntriesByType?.("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (entry && entry.type !== "navigate") return;

    let stopped = false;
    const stop = () => {
      stopped = true;
    };
    READER_MOVED.forEach((name) => window.addEventListener(name, stop, { passive: true }));

    const align = () => {
      if (stopped) return;
      document.getElementById(id)?.scrollIntoView({ behavior: "instant", block: "start" });
    };

    /* 글꼴이 붙으면 그 프레임에 배치가 바뀐다 — 두 프레임 뒤에 잰다 */
    const fonts = (window as Window & { __ksiFontsReady?: Promise<unknown> }).__ksiFontsReady;
    Promise.resolve(fonts).then(() => requestAnimationFrame(() => requestAnimationFrame(align)));

    let timer = 0;
    const onLoad = () => {
      timer = window.setTimeout(align, 300);
    };
    if (document.readyState === "complete") onLoad();
    else window.addEventListener("load", onLoad, { once: true });

    return () => {
      stopped = true;
      window.clearTimeout(timer);
      READER_MOVED.forEach((name) => window.removeEventListener(name, stop));
      window.removeEventListener("load", onLoad);
    };
  }, []);

  return null;
}
