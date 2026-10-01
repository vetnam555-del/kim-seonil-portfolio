"use client";

import { useEffect, useRef, useState } from "react";

/**
 * S1(쇼핑검색 재고 자동 운영)의 동작 재현.
 *
 * 이 섹션은 자동화 8건을 카드로 "설명"만 하고 있었다. 페이지 전체에 움직이는 것이
 * 하나도 없어서(canvas 0 · video 0 · 이미지 12장 전부 정적) 읽는 쪽은 끝까지
 * 문장만 따라가야 했다. 하나는 실제로 돌아가는 편이 낫다 — 다만 돌아가는 것이
 * 근거를 넘어서면 안 된다.
 *
 * 그래서 여기 나오는 값은 전부 site.ts 의 S1 에 이미 적힌 것뿐이다.
 *   - "회당 최대 900개 상품을 처리합니다"          -> 카운터 상한
 *   - "수량 기준에 따라 자동으로 끄거나 다시 시작"  -> 중지/재개 단계
 *   - "약 2시간 -> 5분 이내 (내부 실측 기준)"      -> 마감 표기
 *   - "이상이 감지되면 광고를 건드리지 않고 멈춘 뒤 담당자를 호출. 변경 0건으로 종료"
 *                                                  -> 두 번째 사이클
 * 건수(품절 몇 건 · 복구 몇 건)는 원자료가 없으므로 만들지 않는다. 화면에도 넣지 않는다.
 * 라벨에 "동작 재현"을 붙여 실제 운영 로그가 아님을 먼저 밝힌다.
 */

type Step = { label: string; note: string; ms: number; tone?: "signal" | "warn" };

/* 정상 실행 */
const RUN: Step[] = [
  { label: "재고 조회", note: "회당 최대 900개 상품", ms: 2600 },
  { label: "수량 기준 대조", note: "정해진 주기로 실행", ms: 1500 },
  { label: "기준 미달 · 광고 중지", note: "쇼핑검색 자동 OFF", ms: 1500 },
  { label: "재고 복구 · 광고 재개", note: "쇼핑검색 자동 ON", ms: 1500 },
  { label: "완료", note: "약 2시간 → 5분 이내 (내부 실측 기준)", ms: 2600, tone: "signal" },
];

/* 이상이 감지된 실행 — 이 분기가 이 시스템의 핵심이다 */
const GUARD: Step[] = [
  { label: "재고 조회", note: "회당 최대 900개 상품", ms: 2000 },
  { label: "수집 이상 감지", note: "기준 데이터가 온전하지 않음", ms: 1800, tone: "warn" },
  { label: "광고 변경 0건", note: "확실하지 않으면 건드리지 않는다", ms: 1800, tone: "warn" },
  { label: "담당자 호출 후 종료", note: "사람이 볼 일이 생겼다는 뜻", ms: 2600, tone: "signal" },
];

/* 영문판 (2026.09.25) — 단계 수와 시간은 한국어와 같고 문장만 옮긴다 */
const RUN_EN: Step[] = [
  { label: "Read inventory", note: "Up to 900 products per run", ms: 2600 },
  { label: "Check against stock rules", note: "Runs on a fixed schedule", ms: 1500 },
  { label: "Below threshold · pause ads", note: "Shopping search auto OFF", ms: 1500 },
  { label: "Back in stock · resume ads", note: "Shopping search auto ON", ms: 1500 },
  { label: "Done", note: "~2 hours → under 5 min (internal measurement)", ms: 2600, tone: "signal" },
];

const GUARD_EN: Step[] = [
  { label: "Read inventory", note: "Up to 900 products per run", ms: 2000 },
  { label: "Collection problem detected", note: "Reference data is incomplete", ms: 1800, tone: "warn" },
  { label: "0 ad changes", note: "If it isn't certain, don't touch it", ms: 1800, tone: "warn" },
  { label: "Alert owner and stop", note: "Something needs a human look", ms: 2600, tone: "signal" },
];

const TXT = {
  ko: {
    cycles: [
      { title: "정상 실행", steps: RUN },
      { title: "이상 감지", steps: GUARD },
    ],
    name: "쇼핑검색 재고 자동 운영",
    disclaimer: "작동 방식 예시",
    play: "재생",
    pause: "정지",
    countLabel: "이번 회차 조회",
    unit: "/ 900개 상품",
    locale: "ko-KR",
    sr: "쇼핑검색 재고 자동 운영의 동작을 재현한 화면입니다. 재고를 정해진 주기로 조회해 회당 최대 900개 상품을 처리하고, 수량 기준에 따라 쇼핑검색 광고를 자동으로 끄거나 다시 시작합니다. 수기로 약 2시간이 걸리던 점검이 5분 이내로 줄었습니다(내부 실측 기준). 수집에 이상이 감지되면 광고를 건드리지 않고 멈춘 뒤 담당자를 호출하며, 변경 0건으로 종료합니다.",
  },
  en: {
    cycles: [
      { title: "Normal run", steps: RUN_EN },
      { title: "Problem detected", steps: GUARD_EN },
    ],
    name: "Shopping-search inventory automation",
    disclaimer: "How it works · example",
    play: "Play",
    pause: "Pause",
    countLabel: "Checked this run",
    unit: "/ 900 products",
    locale: "en-US",
    sr: "A simulation of the shopping-search inventory automation. It reads inventory on a fixed schedule, handles up to 900 products per run, and automatically pauses or restarts shopping-search ads by stock level. A check that took about 2 hours by hand now takes under 5 minutes (internal measurement). If a collection problem is detected, it stops without touching ads, alerts the owner, and ends with 0 changes.",
  },
} as const;

export default function AutomationDemo({ lang = "ko" }: { lang?: "ko" | "en" }) {
  const T = TXT[lang];
  const CYCLES = T.cycles;
  const [cycle, setCycle] = useState(0);
  const [step, setStep] = useState(0);
  const [count, setCount] = useState(0);
  const [paused, setPaused] = useState(false);
  /* 감속 선호 환경에서는 처음부터 마지막 상태로 둔다 — 아래 effect 에서 확정한다 */
  const [still, setStill] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setStill(mq.matches);
      if (mq.matches) {
        setStep(CYCLES[0].steps.length - 1);
        setCount(900);
      }
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, [CYCLES]);

  const steps = CYCLES[cycle].steps;

  /* 단계 진행 */
  useEffect(() => {
    if (still || paused) return;
    const wait = steps[step]?.ms ?? 1500;
    timer.current = window.setTimeout(() => {
      if (step + 1 < steps.length) {
        setStep(step + 1);
      } else {
        setCycle((c) => (c + 1) % CYCLES.length);
        setStep(0);
        setCount(0);
      }
    }, wait);
    return () => {
      if (timer.current) window.clearTimeout(timer.current);
    };
  }, [step, cycle, paused, still, steps]);

  /*
   * 조회 단계에서만 상품 수가 올라간다. 900 은 site.ts 에 적힌 상한이다.
   *
   * requestAnimationFrame 을 쓰지 않는다. 페이지가 그려지지 않는 창(백그라운드 탭,
   * 내장 브라우저 패널)에서는 RAF 가 아예 돌지 않는데 setTimeout 은 계속 돌아서,
   * 단계는 흘러가는데 숫자만 0 에 멈춘 채로 남는다 — 실제로 이 상태를 확인했다.
   * 표지 수치(CountUpValue)에서 "월 0억+" 로 한 번 나갔던 것과 같은 결함이다.
   * setInterval 은 그런 창에서 1초 단위로 느려질 뿐 멈추지는 않으므로 끝값에 반드시 닿는다.
   */
  useEffect(() => {
    if (still || paused || step !== 0) return;
    const total = steps[0].ms;
    const start = Date.now();
    const startCount = count;
    const id = window.setInterval(() => {
      const t = Math.min(1, (Date.now() - start) / total);
      /* 끝에서 감속 — 마지막 몇 개가 훑고 지나가지 않게 한다 */
      setCount(Math.round(startCount + (900 - startCount) * (1 - Math.pow(1 - t, 3))));
      if (t >= 1) window.clearInterval(id);
    }, 60);
    return () => window.clearInterval(id);
  }, [step, cycle, paused, still, steps]);

  /*
   * 이상 감지 회차에서 조회를 지나간 뒤에는 숫자를 세지 않는다.
   * "수집이 온전하지 않다" 고 말하면서 900/900 을 띄우면 두 말이 어긋난다.
   * 대신 몇 개까지 받았는지를 지어내지도 않는다 — 원자료가 없다.
   */
  const countBroken = cycle === 1 && step >= 1;

  return (
    <div className="mt-10 border border-rule-ink bg-ink text-on-ink">
      {/* 머리말 — 무엇을 보고 있는지가 먼저다 */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-rule-ink-2 px-5 py-3 sm:px-6">
        <p className="flex flex-wrap items-baseline gap-x-3 font-mono text-mono font-bold tracking-[0.03em]">
          <span className="text-system-ink">S1</span>
          <span className="text-on-ink">{T.name}</span>
          <span className="font-normal text-on-ink-2">{T.disclaimer}</span>
        </p>
        {still ? null : (
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-pressed={paused}
            className="inline-flex min-h-[44px] items-center border border-rule-ink-2 px-3 font-mono text-mono font-bold text-on-ink transition-colors hover:border-signal-ink hover:text-signal-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
          >
            {paused ? T.play : T.pause}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-y-6 px-5 py-7 sm:px-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-x-10">
        {/* 왼쪽 — 조회한 상품 수 */}
        <div>
          <p className="font-mono text-mono text-on-ink-2">{T.countLabel}</p>
          <p
            className="figure mt-2 text-metric tabular-nums text-on-ink"
            style={{ fontStretch: "116%", fontWeight: 800 }}
          >
            {countBroken ? "—" : count.toLocaleString(T.locale)}
            <span className="ml-2 font-mono text-mono font-bold text-on-ink-2">{T.unit}</span>
          </p>
          <p className="mt-4 border-t border-rule-ink-2 pt-3 font-mono text-mono leading-[1.6] text-on-ink-2">
            {CYCLES[cycle].title}
          </p>
        </div>

        {/*
          오른쪽 — 단계. 스크린리더에는 매 초 바뀌는 목록 대신 아래 sr-only 요약을 준다.
          빠르게 갱신되는 라이브 영역은 읽는 흐름을 끊는다.
        */}
        <ol className="automation-demo-steps flex flex-col" aria-hidden="true">
          {steps.map((s, i) => {
            const state = i < step ? "done" : i === step ? "now" : "next";
            return (
              <li
                key={s.label}
                className={`flex items-baseline gap-3 border-b border-rule-ink-2 py-2.5 last:border-b-0 ${
                  /* 35% 는 대비 2.04:1 이라 읽히지 않았다 — 75% 로 흐림은 남기고 대비는 약 5:1 로 (2026.09.24) */
                  state === "next" ? "opacity-75" : "opacity-100"
                } transition-opacity duration-300`}
              >
                <span
                  className={`font-mono text-mono font-bold ${
                    s.tone === "warn"
                      ? "text-mark"
                      : state === "next"
                        ? "text-on-ink-2"
                        : "text-system-ink"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex flex-wrap items-baseline gap-x-3">
                  <span
                    className={`font-mono text-mono font-bold ${
                      state === "now" ? "text-on-ink" : "text-on-ink-2"
                    }`}
                  >
                    {s.label}
                  </span>
                  <span className="font-mono text-mono text-on-ink-2">{s.note}</span>
                </span>
              </li>
            );
          })}
        </ol>

        <p className="sr-only">{T.sr}</p>
      </div>
    </div>
  );
}
