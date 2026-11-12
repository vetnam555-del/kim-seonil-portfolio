"use client";

import { useId, useLayoutEffect, useRef, useState, type ReactNode } from "react";

/*
 * 휴대폰에서만 접는 묶음 (2026.11.12 R-09 · REFERENCES 골드넥스 — 연혁은 탭, 조직도는 '더 보기').
 * 소개 쪽이 390px 에서 31화면이었다. 제목과 결과는 그대로 두고 설명만 접어, 훑는 사람이 제목을 먼저 보게 한다.
 *
 * - 접는 규칙은 globals.css .pfold 에 있고 화면 · 768px 미만에만 걸린다.
 *   넓은 화면 · 인쇄 · 스크립트가 꺼진 화면에서는 버튼이 없고 내용이 늘 보인다.
 * - 처음 그릴 때부터 접혀 있다 — 그린 뒤에 접으면 쪽이 출렁이고 #주소 · 새로고침 자리가 밀린다.
 *   이 부품이 붙기 전에는 layout.tsx 의 FOLD_GUARD 가 붙인 html.folds 가 접힌 모양을 내고, 붙으면 data-ready 를 달아 넘겨받는다.
 *   끝내 붙지 않으면 FOLD_GUARD 가 html.folds 를 떼어 모두 펼친다(읽을 길이 막히지 않게).
 * - 접힌 동안 hidden="until-found" 를 붙인다. 쪽 안 찾기(Ctrl+F)나 #주소가 접힌 글에 닿으면 브라우저가 펼치고
 *   beforematch 를 알린다. React 19 는 이 값을 그냥 hidden 으로 내보내므로(그러면 preflight 가 넓은 화면에서도
 *   숨긴다) 속성은 여기서 직접 붙인다. 이 값을 모르는 브라우저는 평범한 숨김으로 읽는다.
 * - 표식은 origin-detail 과 같은 "+" 하나다(열리면 45도). 글리프를 새로 들이지 않는다.
 * - 실적(결과 숫자 · 경력 · 수상 · 역량)은 접지 않는다. 접힌 이력은 없는 이력처럼 읽힌다(sections.tsx Credits 주석).
 */
export default function PhoneFold({
  label,
  name,
  className,
  children,
}: {
  /** 버튼에 보이는 말 — 안에 든 것을 그대로 적는다 */
  label: string;
  /** 같은 버튼이 여러 개일 때 화면낭독기가 구분할 이름 */
  name?: string;
  className?: string;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const wrap = useRef<HTMLDivElement>(null);
  const body = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = body.current;
    if (!el) return;
    /* 여기부터는 이 부품이 접고 편다 — html.folds 가 떨어져도 버튼이 남는다 */
    wrap.current?.setAttribute("data-ready", "");
    if (open) {
      el.removeAttribute("hidden");
      return;
    }
    el.setAttribute("hidden", "until-found");
    /* 브라우저는 이 알림 바로 뒤에 hidden 을 떼고 그 자리로 간다 — 그 전에 열림 표시를 먼저 바꿔 둔다 */
    const onMatch = () => {
      wrap.current?.setAttribute("data-open", "true");
      setOpen(true);
    };
    el.addEventListener("beforematch", onMatch);
    return () => el.removeEventListener("beforematch", onMatch);
  }, [open]);

  return (
    <div ref={wrap} className={className ? `pfold ${className}` : "pfold"} data-open={open ? "true" : "false"}>
      <button type="button" className="pfold-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
        <span className="pfold-mark" aria-hidden="true">+</span>
        <span>
          {label}
          {name ? <span className="sr-only"> · {name}</span> : null}
        </span>
      </button>
      <div ref={body} id={id} className="pfold-body">
        {children}
      </div>
    </div>
  );
}
