"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";
import { EDITION } from "@/data/edition";
import { counterpartPath } from "@/data/en/meta";

/* 영문 화면(/en/)에서는 안내 문구도 영문으로 (2026.09.25) — 호출부마다 언어를 넘기지 않고 주소로 판단한다 */
const TEXT = {
  ko: { action: "이메일 주소 복사", copied: "이메일 주소가 복사되었습니다.", failed: "복사하지 못해 메일 앱을 엽니다." },
  en: { action: "Copy email address", copied: "Email address copied.", failed: "Couldn't copy, so opening your mail app." },
} as const;

function fallbackCopy(email: string) {
  const previousFocus = document.activeElement;
  const textarea = document.createElement("textarea");
  textarea.value = email;
  textarea.setAttribute("readonly", "");
  textarea.setAttribute("aria-hidden", "true");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();

  try {
    return document.execCommand("copy");
  } finally {
    textarea.remove();
    if (previousFocus instanceof HTMLElement) previousFocus.focus({ preventScroll: true });
  }
}

export default function EmailCopyButton({
  email,
  className = "",
  children,
}: {
  email: string;
  className?: string;
  children?: ReactNode;
}) {
  const pathname = usePathname();
  const T = TEXT[EDITION === "general" && counterpartPath(pathname ?? "/").isEn ? "en" : "ko"];
  const [message, setMessage] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const showMessage = (nextMessage: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setMessage(nextMessage);
    timerRef.current = setTimeout(() => setMessage(""), 2400);
  };

  const copyEmail = async (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    let copied = false;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(email);
        copied = true;
      } catch {
        copied = false;
      }
    }

    if (!copied) {
      try {
        copied = fallbackCopy(email);
      } catch {
        copied = false;
      }
    }

    if (copied) {
      showMessage(T.copied);
      return;
    }

    showMessage(T.failed);
    window.location.href = `mailto:${email}`;
  };

  /*
   * children 이 이미 "이메일 주소 복사"면 앞에 덧붙이지 않는다 (2026.09.20)
   * 홈 Hero 버튼의 children 이 "이메일 주소 복사"라, 접근성 이름이
   * "이메일 주소 복사 · makefair@naver.com 이메일 주소 복사"로 두 번 읽혔다.
   * 주소나 다른 문구를 children 으로 넘기는 호출부(푸터 등)는 그대로 둔다.
   */
  const ACTION = T.action;
  const prefix = typeof children === "string" && !children.includes(ACTION) ? `${children} · ` : "";
  const ariaLabel = `${prefix}${email} ${ACTION}`;

  return (
    <>
      <a
        href={`mailto:${email}`}
        onClick={copyEmail}
        className={className}
        aria-label={ariaLabel}
        title={ACTION}
      >
        {children ?? email}
      </a>
      <span className="sr-only" role="status" aria-live="polite">
        {message}
      </span>
      {message ? (
        <div
          aria-hidden="true"
          className="fixed bottom-5 left-1/2 z-[130] max-w-[calc(100vw-2rem)] -translate-x-1/2 border border-rule-ink bg-ink px-4 py-3 text-center font-mono text-caption font-bold text-on-ink shadow-[0_8px_30px_rgba(0,0,0,0.28)]"
        >
          {message}
        </div>
      ) : null}
    </>
  );
}
