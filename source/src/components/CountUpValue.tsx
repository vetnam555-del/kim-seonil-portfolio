"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const NUMBER_PATTERN = /\d[\d,]*(?:\.\d+)?/g;

type NumberPart = {
  raw: string;
  target: number;
  decimals: number;
  grouped: boolean;
};

type ValuePart = string | NumberPart;

function splitValue(value: string): ValuePart[] {
  const parts: ValuePart[] = [];
  let cursor = 0;

  for (const match of value.matchAll(NUMBER_PATTERN)) {
    const raw = match[0];
    const index = match.index ?? 0;
    if (index > cursor) parts.push(value.slice(cursor, index));

    const decimalPoint = raw.indexOf(".");
    parts.push({
      raw,
      target: Number(raw.replaceAll(",", "")),
      decimals: decimalPoint >= 0 ? raw.length - decimalPoint - 1 : 0,
      grouped: raw.includes(","),
    });
    cursor = index + raw.length;
  }

  if (cursor < value.length) parts.push(value.slice(cursor));
  return parts.length ? parts : [value];
}

function formatPart(part: NumberPart, progress: number): string {
  const animated = part.target * progress;
  const fixed = part.decimals ? animated.toFixed(part.decimals) : String(Math.round(animated));
  if (!part.grouped) return fixed;

  const [integer, decimal] = fixed.split(".");
  const grouped = Number(integer).toLocaleString("ko-KR");
  return decimal === undefined ? grouped : `${grouped}.${decimal}`;
}

function formatValue(parts: ValuePart[], progress: number): string {
  return parts
    .map((part) => (typeof part === "string" ? part : formatPart(part, progress)))
    .join("");
}

/**
 * 검증된 최종값은 스크린리더와 정적 HTML에 그대로 남기고, 화면에 보이는 숫자만
 * 뷰포트 진입 시 0에서 최종값으로 한 번 올라간다. 숨겨 둔 최종값이 폭을 먼저 잡아
 * 자릿수가 늘어도 주변 레이아웃은 움직이지 않는다.
 */
export default function CountUpValue({
  value,
  delay = 0,
  duration = 1200,
  className,
}: {
  value: string;
  delay?: number;
  duration?: number;
  className?: string;
}) {
  const parts = useMemo(() => splitValue(value), [value]);
  const zeroValue = useMemo(() => formatValue(parts, 0), [parts]);
  const ref = useRef<HTMLSpanElement>(null);
  /*
   * 초기값은 0 이 아니라 참값이다. 정적 HTML 과 JS 가 꺼진 환경에서 그대로 읽히는 값이
   * 눈에 보이는 span 에 들어가야 한다 — 예전에는 여기가 0 이라, JS 가 붙기 전이나
   * 스크립트가 실패하면 지면의 숫자 29개가 전부 0 으로 보였다.
   * MotionRuntime 이 지키는 규칙("초기 숨김은 html.js 하위에만")과 같은 이유다.
   * 0 은 애니메이션을 실제로 시작하는 순간에만 넣는다.
   */
  const [displayValue, setDisplayValue] = useState(value);
  const [state, setState] = useState<"idle" | "running" | "done" | "reduced">("idle");

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setDisplayValue(value);
      setState("reduced");
      return;
    }

    let frame = 0;
    let delayTimer = 0;
    let started = false;

    const onVisible = () => {
      if (document.hidden) return;
      document.removeEventListener("visibilitychange", onVisible);
      animate();
    };

    /*
     * 숨은 탭에서는 시작하지 않는다.
     *
     * 브라우저는 배경 탭의 requestAnimationFrame 을 재운다. 그런데 IntersectionObserver
     * 와 setTimeout 은 그대로 돈다. 그래서 "새 탭으로 열기"로 연 페이지에서는 관찰자가
     * 먼저 불려 값이 0 으로 바뀌고, 올려 줄 RAF 는 오지 않아 숫자가 0 에 갇혔다.
     * 실제로 그 상태를 재현해 확인했다 — 히어로 세 수치가 월 0억+ / 0여 개 / 0종 이었다.
     *
     * 탭이 보이게 될 때까지 기다렸다가 시작한다. 그 사이에는 참값이 그대로 보인다.
     */
    /*
     * 첫 방문 인트로가 도는 동안에는 기다린다 (2026.09.25, IntroController).
     * 표지 숫자가 덮개 밑에서 먼저 다 올라가 버리면, 덮개가 걷혔을 때 멈춘 숫자만 보인다.
     */
    const onIntroDone = () => animate();
    const animate = () => {
      if (started) return;
      if (document.hidden) {
        document.addEventListener("visibilitychange", onVisible);
        return;
      }
      if (
        document.documentElement?.dataset?.intro === "play" &&
        !(window as Window & { __ksiIntroDone?: boolean }).__ksiIntroDone
      ) {
        window.addEventListener("ksi:intro-done", onIntroDone, { once: true });
        return;
      }
      started = true;
      setState("running");

      /*
       * 0 으로 떨어뜨리는 것은 delay 가 끝난 뒤, 올라가기 시작하는 그 순간에 한다.
       *
       * 이 줄이 setTimeout 밖에 있었다. 그래서 관찰자가 불리는 즉시 0 이 되고, delay 동안
       * 그대로 멈춰 있다가 그제서야 올라갔다 — 히어로 수치는 delay 가 500·590·680ms 라
       * 첫 화면 대표 수치 셋이 그 시간만큼 "월 0억+ / 0여 개 / 0종" 으로 보였다.
       * 서버는 참값을 그려 보냈는데 하이드레이션이 그걸 0 으로 되돌린 것이다.
       *
       * 실측(375px, 2026-09-12): 955ms 에 0 으로 떨어져 1776ms 까지 0, 2187ms 에 복귀.
       * 느린 기기일수록 하이드레이션이 늦어 0 이 보이는 시간이 길어진다.
       */
      delayTimer = window.setTimeout(() => {
        setDisplayValue(zeroValue);
        const startedAt = performance.now();
        const tick = (now: number) => {
          const elapsed = Math.min(1, (now - startedAt) / duration);
          const eased = 1 - Math.pow(1 - elapsed, 4);
          setDisplayValue(formatValue(parts, eased));

          if (elapsed < 1) {
            frame = requestAnimationFrame(tick);
          } else {
            setDisplayValue(value);
            setState("done");
          }
        };
        frame = requestAnimationFrame(tick);
      }, delay);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        animate();
      },
      { threshold: 0.3, rootMargin: "0px 0px -6% 0px" },
    );

    const maskedAncestor = node.closest<HTMLElement>("[data-enter='wipe']");
    observer.observe(maskedAncestor?.parentElement ?? node);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("ksi:intro-done", onIntroDone);
      window.clearTimeout(delayTimer);
      cancelAnimationFrame(frame);
    };
  }, [delay, duration, parts, value]);

  return (
    <span
      ref={ref}
      className={`count-up${className ? ` ${className}` : ""}`}
      data-count-up={value}
      data-count-up-state={state}
    >
      <span className="count-up-measure" aria-hidden="true">
        {value}
      </span>
      <span className="count-up-visual" data-count-up-visual aria-hidden="true">
        {displayValue}
      </span>
      <span className="sr-only">{value}</span>
    </span>
  );
}
