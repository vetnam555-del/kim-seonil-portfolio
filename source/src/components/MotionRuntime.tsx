"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * 문서 전체의 등장 연출을 옵저버 하나로 처리한다.
 *
 * 안전 장치가 세 겹이다 — 과거에 등장 애니메이션이 콘텐츠를 통째로 감춰
 * 섹션이 빈 화면으로 렌더된 사고가 있었기 때문이다.
 *
 *  1) 초기 숨김 상태는 CSS 의 `html.js` 하위에만 있다. JS 가 꺼져 있으면 적용되지 않는다.
 *  2) IntersectionObserver 가 없거나 감속 선호면 즉시 전부 드러낸다.
 *  3) 옵저버 자체가 1.2초 동안 한 번도 응답하지 않을 때만 failsafe 가 전부 드러낸다.
 *     정상 옵저버가 작동 중인데 모든 요소를 미리 완료 처리하면, 사용자가 아래로 내릴 때는
 *     연출이 이미 끝나 있다. 안전장치는 고장만 흡수하고 정상 스크롤은 건드리지 않는다.
 */
export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    const nodes = Array.from(document.querySelectorAll<HTMLElement>("[data-enter]"));
    const revealAll = () => nodes.forEach((n) => n.classList.add("is-in"));

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      root.classList.add("js");
      revealAll();
      return;
    }

    // 숨김 상태를 켜는 것과 동시에 관찰을 시작해야 한다. 순서가 뒤바뀌면
    // 숨겨진 채로 한 프레임 이상 남을 수 있다.
    root.classList.add("js");

    /*
     * clip-path: inset(100%) 인 wipe 요소를 자기 자신으로 관찰하면 교차 면적이 0으로
     * 계산돼 영원히 열리지 않는 브라우저가 있다. 바깥 요소를 관찰 대상으로 쓰고,
     * 그 대상에 묶인 실제 연출 노드를 함께 연다. 중첩 Reveal 도 같은 카드에서 동기화된다.
     */
    const revealTargets = new Map<Element, HTMLElement[]>();
    for (const node of nodes) {
      const target = node.dataset.enter === "wipe" ? (node.parentElement ?? node) : node;
      const bucket = revealTargets.get(target) ?? [];
      bucket.push(node);
      revealTargets.set(target, bucket);
    }

    let observerResponded = false;
    const io = new IntersectionObserver(
      (entries) => {
        observerResponded = true;
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          for (const node of revealTargets.get(e.target) ?? []) node.classList.add("is-in");
          io.unobserve(e.target);
        }
      },
      { threshold: 0.08, rootMargin: "0px 0px -4% 0px" },
    );

    // 첫 화면에 이미 들어와 있는 요소는 관찰을 기다리지 않고 바로 드러낸다.
    const vh = window.innerHeight;
    for (const [target, targetNodes] of revealTargets) {
      if (target.getBoundingClientRect().top < vh) targetNodes.forEach((n) => n.classList.add("is-in"));
      else io.observe(target);
    }

    const failsafe = window.setTimeout(() => {
      if (!observerResponded) revealAll();
    }, 1200);

    /*
     * 가변축 스크롤 반응 — 표지 대형 수치의 자폭(wdth)만 118% → 96% 로 좁아진다.
     * 값·색·크기는 건드리지 않는다. 대표 지표의 1회 카운트업과 별개로,
     * 스크롤 중에는 숫자를 다시 계산하지 않아 읽는 동안 값이 흔들리지 않는다.
     * Archivo 의 wdth 축(62–125%)이 있어서 장식 없이 서체만으로 만드는 움직임이다.
     */
    const live = document.querySelector<HTMLElement>(".figure-live");
    /*
     * 읽기 진행 바 — 문서 맨 위의 얇은 선이 스크롤만큼 채워진다.
     * 값이 아니라 위치만 움직이므로 위 원칙과 어긋나지 않는다.
     * 홈이 18화면을 넘어가서 "지금 어디쯤인지"가 안 보였다.
     */
    const bar = document.querySelector<HTMLElement>(".scroll-progress");

    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (live) {
          const p = Math.min(1, Math.max(0, window.scrollY / (window.innerHeight || 1)));
          live.style.setProperty("--wdth", String(Math.round(118 - p * 22)));
        }
        if (bar) {
          const doc = document.documentElement;
          const max = doc.scrollHeight - window.innerHeight;
          const r = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
          bar.style.setProperty("--read", r.toFixed(4));
        }
      });
    };
    if (live || bar) {
      onScroll();
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
    }

    return () => {
      window.clearTimeout(failsafe);
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      io.disconnect();
    };
  }, [pathname]);

  return null;
}
