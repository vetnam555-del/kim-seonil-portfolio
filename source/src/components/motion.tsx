import type { ReactNode } from "react";

/**
 * 등장 연출 래퍼 — 클라이언트 컴포넌트가 아니다.
 *
 * 이전에는 Reveal 하나하나가 "use client" 컴포넌트라 인스턴스마다 useEffect 와
 * IntersectionObserver 가 붙었다. 지금은 마크업에 data-enter 속성만 남기고,
 * 실제 관찰은 MotionRuntime 이 문서 전체에 단 하나의 옵저버로 처리한다.
 *
 * 초기 상태(숨김)는 globals.css 의 `html.js [data-enter]` 에만 정의돼 있다.
 * 따라서 JS 가 꺼져 있으면 규칙 자체가 적용되지 않아 콘텐츠는 처음부터 보인다.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = "div",
  variant,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section" | "article" | "figure";
  /** "wipe" 는 아래에서 위로 드러난다 — 수치가 칠해지는 인상을 만든다 */
  variant?: "rise" | "wipe";
}) {
  const Tag = as;
  return (
    <Tag
      className={className}
      data-enter={variant === "wipe" ? "wipe" : ""}
      style={delay ? ({ "--enter-delay": `${Math.round(delay * 1000)}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </Tag>
  );
}
