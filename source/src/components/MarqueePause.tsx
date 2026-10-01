"use client";

import { useState } from "react";

/**
 * 자동으로 흐르는 브랜드 띠를 멈추는 버튼.
 *
 * 기존에는 호버와 포커스에서만 멈췄다. 마우스가 없는 환경 — 휴대폰과 태블릿 — 에서는
 * 멈출 방법이 없었고, 브랜드 이름을 읽으려는 사람이 흐르는 글자를 눈으로 쫓아야 했다.
 * WCAG 2.2.2 도 5초 넘게 자동으로 움직이는 정보에는 멈추거나 숨기는 수단을 요구한다.
 *
 * 띠 자체를 없애지는 않는다. 운영한 브랜드 수가 한눈에 보이는 것은 이 지면의 값어치다.
 * 움직임을 없애는 대신 제어를 준다.
 */
export default function MarqueePause({ targetId }: { targetId: string }) {
  const [paused, setPaused] = useState(false);

  const toggle = () => {
    const next = !paused;
    setPaused(next);
    const el = document.getElementById(targetId);
    if (el) el.dataset.paused = next ? "true" : "false";
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={paused}
      className="inline-flex min-h-[32px] shrink-0 items-center border border-rule-ink px-2 font-mono text-[0.6875rem] font-bold tracking-normal text-on-ink-2 transition-colors hover:border-signal-ink hover:text-signal-ink"
    >
      {/*
        기호 아이콘을 쓰지 않는다. 처음에 ❙❙(U+2759)를 넣었다가 폰트 서브셋 검사에서
        막혔다 — Pretendard 에 없는 글자라 시스템 폰트로 대체 렌더된다.
        글자만으로도 뜻이 분명하고, 서브셋에 이미 있는 글자라 안전하다.
      */}
      {paused ? "재생" : "정지"}
    </button>
  );
}
