"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { edithReels } from "@/data/reels";

/**
 * 홈의 EDIT H 릴스 띠 (2026.11.17 주인 "메인에다가도 릴스영상 몇 개 깔아두면").
 *
 * 세 편을 소리 없이 되풀이한다. 지면을 무겁게 하지 않으려고 정한 것:
 *  · 처음에는 표지(webp)만 받는다. 영상은 preload="none" 이고, 띠가 화면에 40% 넘게 들어온 칸만 재생한다(그때 받는다).
 *    화면 밖으로 나가면 멈춘다. 휴대폰은 두 칸만 보이고 숨긴 셋째 칸은 받지 않는다.
 *  · 동작 줄이기 설정(prefers-reduced-motion)이나 데이터 절약 모드에서는 스스로 재생하지 않는다 — 버튼을 누르면 재생한다.
 *  · 5초 넘게 스스로 움직이는 것은 멈출 수 있어야 한다(WCAG 2.2.2) — 띠 아래 '영상 멈추기' 버튼.
 *  · 칸을 누르면 EDIT H 사례의 릴스 자리로 간다. 거기서는 소리와 함께 끝까지 볼 수 있다.
 * 영상 안의 글자(제목 · 출처)는 그림이라 읽어 주지 않으므로 링크 이름에 호와 제목을 적는다.
 */
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const TEXT = {
  ko: {
    pause: "영상 멈추기",
    play: "영상 재생",
    label: (date: string, title: string) => `EDIT H ${date}호 릴스 — ${title} (사례에서 소리와 함께 보기)`,
  },
  en: {
    pause: "Pause videos",
    play: "Play videos",
    label: (_date: string, title: string) => `EDIT H reel, ${title} — watch with sound on the case page (Korean)`,
  },
} as const;

export default function ReelLoops({ lang = "ko", href }: { lang?: "ko" | "en"; href: string }) {
  const t = TEXT[lang];
  const root = useRef<HTMLDivElement>(null);
  /* null = 아직 판단 전(서버가 그린 상태). 버튼 글자가 바뀌며 깜빡이지 않게 판단이 끝난 뒤에 보인다 */
  const [on, setOn] = useState<boolean | null>(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const save = Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData);
    setOn(!reduce && !save);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el || on === null) return;
    const videos = Array.from(el.querySelectorAll("video"));
    if (!on) {
      videos.forEach((v) => v.pause());
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const v = entry.target as HTMLVideoElement;
          if (entry.intersectionRatio >= 0.4) {
            v.muted = true;
            void v.play().catch(() => {});
          } else {
            v.pause();
          }
        }
      },
      { threshold: [0, 0.4, 1] },
    );
    videos.forEach((v) => io.observe(v));
    return () => {
      io.disconnect();
      videos.forEach((v) => v.pause());
    };
  }, [on]);

  return (
    <div ref={root}>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {edithReels.map((reel, i) => (
          <li key={reel.id} className={i === 2 ? "hidden sm:block" : undefined}>
            <Link
              href={href}
              prefetch={false}
              aria-label={t.label(reel.date, lang === "en" ? reel.titleEn : reel.title)}
              className="block overflow-hidden rounded-[18px] bg-[#e9e4da] outline-offset-4 transition-transform duration-300 hover:-translate-y-1 motion-reduce:transition-none motion-reduce:hover:translate-y-0"
            >
              <video
                src={`${BASE}/evidence/edith-reel-${reel.id}-loop.mp4`}
                poster={`${BASE}/evidence/edith-reel-${reel.id}-poster-360.webp`}
                width={360}
                height={640}
                muted
                loop
                playsInline
                preload="none"
                disablePictureInPicture
                disableRemotePlayback
                aria-hidden="true"
                tabIndex={-1}
                className="block aspect-[9/16] h-auto w-full object-cover"
              />
            </Link>
            <p className="tnum mt-2.5 text-[13px] font-semibold tracking-[0.01em] text-[#5f6870]">
              {reel.date}
              <span className="mx-1.5 text-[#b9bec4]" aria-hidden="true">·</span>
              VOL.{reel.vol}
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-1 min-h-[44px]">
        <button
          type="button"
          onClick={() => setOn((v) => !v)}
          className={`inline-flex min-h-[44px] items-center gap-2 text-[14px] font-semibold text-[#3d444c] underline decoration-[#d5d9dd] underline-offset-4 hover:decoration-[#0f1216] ${on === null ? "invisible" : ""}`}
        >
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true" focusable="false" fill="currentColor">
            {on ? (
              <>
                <rect x="1.5" y="1" width="3.2" height="10" rx="0.8" />
                <rect x="7.3" y="1" width="3.2" height="10" rx="0.8" />
              </>
            ) : (
              <path d="M2.5 1.2v9.6a.6.6 0 0 0 .92.5l7.3-4.8a.6.6 0 0 0 0-1L3.42.7a.6.6 0 0 0-.92.5z" />
            )}
          </svg>
          {on ? t.pause : t.play}
        </button>
      </p>
    </div>
  );
}
