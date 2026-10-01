"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  EDITION,
  isGeneralLike,
  isNew,
  NAME_KO,
  roleForClient,
  portfolioPdfPathForClient,
  showsWhyAbly,
  showsWhyShinsegae,
  showsWhyStudio,
} from "@/data/edition";
import { counterpartPath, NAME_EN_DISPLAY, ROLE_EN } from "@/data/en/meta";

/*
 * 페이지에 실재하는 섹션과 1:1로 맞춘다.
 * 이전엔 Skills & Stack(#skills)이 화면에는 있는데 목차에 없어 스크롤로만 닿을 수 있었고,
 * Story(#story)는 아예 렌더되지 않았다. 두 항목을 채우면서 라벨을 줄여 폭을 맞춘다
 * ("경력·연락처" → "경력") — 항목이 늘어난 만큼 각 라벨은 짧아져야 한 줄이 유지된다.
 */
/*
 * 목차 순서는 화면에 실제로 나오는 순서와 같아야 한다 — 목차가 페이지를 앞뒤로
 * 건너뛰면 "어디까지 읽었는지"를 목차로 가늠할 수 없다.
 * hll 은 지원 이유가 특집 바로 뒤, 일반판은 다음 역할이 맨 뒤다(page.tsx 주석 참고).
 */
const IS_TARGETED =
  showsWhyStudio || showsWhyShinsegae || showsWhyAbly;
const WHY = showsWhyAbly
  ? { href: "/#why-ably", anchor: "#why-ably", label: "직무 적합성" }
  : showsWhyShinsegae
  ? { href: "/#why-shinsegae", anchor: "#why-shinsegae", label: "직무 적합성" }
  : {
      href: "/#why-studio",
      anchor: "#why-studio",
      label: showsWhyStudio ? "지원 이유" : "다음 역할",
    };

/*
 * 일하는 방식(HOW I WORK)과 이야기(MY STORY)를 목차에 넣는다.
 *
 * 둘 다 "왜 이 사람인가"에 답하는 자리인데 목차에 없어서, 읽는 쪽이 채용 공고와
 * 맞춰볼 때 건너뛸 방법이 없었다. 화면상 위치는 문서 72%·83% 지점이라 스크롤로만
 * 닿는다. 순서를 바꾸지 않고 진입만 열어 준다.
 *
 * 공용판에만 넣는다 — hll·신세계·에이블리판은 이미 지원처에 나가 있고, 그 판들은
 * 직무 적합성 지면이 따로 있어 목차 칸이 이미 차 있다.
 */
/*
 * 개편판은 홈이 다섯 칸(첫 화면·사례·방식·자동화·연락)뿐이라 목차도 그만큼만 둔다.
 * 없는 칸을 목차에 남겨 두면 눌렀을 때 아무 데도 가지 않는다 — 검증기가 그걸 잡았다.
 */
const NAV_NEW = [
  { href: "/#work", anchor: "#work", label: "사례" },
  { href: "/#method", anchor: "#method", label: "업무 방식" },
  { href: "/#automation", anchor: "#automation", label: "자동화" },
  { href: "/#contact", anchor: "#contact", label: "연락" },
] as const;

const NAV_DEFAULT = [
  { href: "/#projects", anchor: "#projects", label: "프로젝트" },
  ...(IS_TARGETED ? [WHY] : []),
  { href: "/#skills", anchor: "#skills", label: "역량" },
  { href: "/#automation", anchor: "#automation", label: "만든 것" },
  ...(isGeneralLike
    ? ([
        /*
         * "방식"·"이야기" 는 짧지만 어디로 가는지 예상이 안 된다.
         * story 는 산업디자인 → 제품·펀딩 → 퍼포먼스 → 자동화 4단계와 각 단계의
         * "지금의 강점" 이다. 성과가 아니라 무엇을 거쳐 지금이 됐는지이므로
         * "성장 과정" 이 맞는 이름이다 — "성과 과정" 은 수치를 기대하게 만든다.
         */
        { href: "/#method", anchor: "#method", label: "업무 방식" },
        { href: "/#story", anchor: "#story", label: "성장 과정" },
      ] as const)
    : ([] as const)),
  ...(IS_TARGETED ? [] : [WHY]),
  { href: "/#career", anchor: "#career", label: "경력" },
] as const;

/*
 * 공용판 메뉴 (2026.09.24 입구형 홈). 홈은 사례 · 역량 · 자동화 · 연락 네 구간이고,
 * 일하는 방식 · 광고주 · 이야기 · 경력은 /about/ 한 페이지로 옮겼다.
 * AI·자동화 — 자동화 S2(Claude·GPT)·S6(Claude RAG)가 AI 도구를 쓴다.
 */
/*
 * "역량"을 뺐다 (2026.09.25). 두 역량이 대표 사례 구간 머리의 색인으로 들어가면서
 * "대표 사례"와 같은 자리로 가는 메뉴가 둘이 됐다. 레퍼런스(메뉴 5개 + 언어 전환)보다
 * 메뉴 5개 + 버튼 2개로 복잡했던 머리글도 함께 줄어든다.
 */
/*
 * 2026.09.26 방식·경력을 두 번째로 — 그 페이지가 표지의 FIND · TEST · IMPROVE("제가 문제를 푸는 순서")로
 * 열린다. AI·자동화는 이름은 두고(AI 활용은 가점) 뒤로 보냈다: 두 번째 메뉴라 자동화가 앞서 보였다(사용자).
 */
const NAV_GENERAL = [
  { href: "/#projects", anchor: "#projects", label: "대표 사례" },
  { href: "/about/", anchor: "#about-page", label: "방식·경력" },
  { href: "/#automation", anchor: "#automation", label: "AI·자동화" },
  { href: "/#contact", anchor: "#contact", label: "연락" },
] as const;
/*
 * 영문판 메뉴 (2026.09.25) — 영문 홈의 세 구간과 같다. 이야기·경력(/about/)은 영문판이 없어
 * 메뉴에 두지 않고, 이력서 버튼이 영문 이력서로 간다. 포트폴리오 PDF 는 한국어라 영문 머리글에서는 뺀다.
 */
const NAV_GENERAL_EN = [
  { href: "/en/#projects", anchor: "#projects", label: "Case studies" },
  { href: "/en/#automation", anchor: "#automation", label: "AI & automation" },
  { href: "/en/#contact", anchor: "#contact", label: "Contact" },
] as const;
/* 언어 전환은 공용판에만 둔다 — 다른 판은 지원처에 나간 화면 그대로다 */
const SHOW_LANG = EDITION === "general";
/*
 * 공용판은 1024px 부터 메뉴를 펼친다 (2026.09.24). 전에는 xl(1280) 기준이라 1024~1279px
 * — 125% 배율 노트북에서 흔한 폭 — 에서 메뉴·이력서·PDF 버튼이 모두 "메뉴" 뒤로 숨었다.
 * 그 폭에서는 이름 옆 직함을 숨겨 자리를 만든다(표지 눈썹줄이 같은 직함을 싣는다).
 * v260908·nw 는 기존 xl 기준 그대로다.
 */
const WIDE_NAV = isGeneralLike && EDITION !== "general" ? "xl" : "lg";
const NAV = isNew ? NAV_NEW : EDITION === "general" ? NAV_GENERAL : NAV_DEFAULT;
const MOBILE_NAV = EDITION === "general"
  ? NAV_GENERAL
  : NAV;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/*
 * KO / EN 전환 (2026.09.25). 레퍼런스(dainahys)처럼 같은 화면의 다른 언어 주소로 보낸다 —
 * 영문판이 없는 한국어 화면(/about/, 일부 사례)에서는 영문 홈으로 간다.
 */
function LangSwitch({ isEn, koHref, enHref, className = "" }: { isEn: boolean; koHref: string; enHref: string; className?: string }) {
  const item = "inline-flex min-h-[44px] min-w-[32px] items-center justify-center font-mono text-caption font-bold";
  return (
    <div role="group" aria-label={isEn ? "Language" : "언어"} className={`lang-switch items-center ${className}`}>
      {isEn ? (
        <Link href={koHref} hrefLang="ko" lang="ko" aria-label="한국어로 보기" className={`${item} text-on-ink-2 hover:text-on-ink`}>KO</Link>
      ) : (
        <span aria-current="true" className={`${item} text-on-ink`}>KO</span>
      )}
      <span aria-hidden="true" className="text-caption text-on-ink-2">/</span>
      {isEn ? (
        <span aria-current="true" className={`${item} text-on-ink`}>EN</span>
      ) : (
        <Link href={enHref} hrefLang="en" lang="en" aria-label="View in English" className={`${item} text-on-ink-2 hover:text-on-ink`}>EN</Link>
      )}
    </div>
  );
}

export default function Header() {
  const pathname = usePathname();
  const lang = counterpartPath(pathname ?? "/");
  const en = SHOW_LANG && lang.isEn;
  const nav = en ? NAV_GENERAL_EN : NAV;
  const mobileNav = en ? NAV_GENERAL_EN : MOBILE_NAV;
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setActive("");
    const targets = mobileNav.map((item) => document.querySelector(item.anchor)).filter(
      (element): element is Element => element !== null,
    );
    if (!targets.length || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(`#${entry.target.id}`);
        });
      },
      { rootMargin: "-42% 0px -52% 0px" },
    );
    targets.forEach((target) => observer.observe(target));
    return () => observer.disconnect();
  }, [pathname, mobileNav]);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScrolled(window.scrollY > 8);
      setProgress(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [pathname]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        menuButtonRef.current?.focus({ preventScroll: true });
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  /* 공용판은 전환 스위치와 한 묶음으로 감싸고, 다른 판은 예전 자리에 그대로 둔다 */
  const menuButton = () => (
    <button
      ref={menuButtonRef}
      type="button"
      className={`inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center border border-rule-ink px-3 font-mono text-caption font-bold text-on-ink transition-colors ${WIDE_NAV === "xl" ? "xl:hidden" : "lg:hidden"}`}
      aria-expanded={open}
      aria-controls="mobile-nav"
      aria-label={en ? (open ? "Close main menu" : "Open main menu") : open ? "주요 메뉴 닫기" : "주요 메뉴 열기"}
      onClick={() => setOpen((value) => !value)}
    >
      {en ? (open ? "Close" : "Menu") : open ? "닫기" : "메뉴"}
    </button>
  );

  return (
    <header
      className={`site-header ${EDITION === "general" ? "site-header-light " : ""}fixed inset-x-0 top-0 z-50 bg-ink/92 backdrop-blur-md transition-colors ${
        scrolled ? "border-b border-line" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-[72px] w-full max-w-[1240px] items-center justify-between px-5 sm:px-10">
        <Link
          href={en ? "/en/" : "/"}
          /* 자간 0.14em 은 라틴 대문자용이다. "김선일"에 걸면 글자가 뜯어져 보인다 */
          className="-ml-2 inline-flex min-h-[44px] items-center px-2 font-mono text-mono font-bold tracking-[0.02em] text-on-ink"
          aria-label={en ? `${NAME_EN_DISPLAY} portfolio home` : `${NAME_KO} 포트폴리오 처음으로`}
        >
          {en ? NAME_EN_DISPLAY : NAME_KO}
          <span className={`ml-2 hidden text-caption font-normal text-on-ink-2 sm:inline ${EDITION === "general" ? "lg:hidden xl:inline" : ""}`}>
            {en ? ROLE_EN : roleForClient}
          </span>
        </Link>

        <nav className={`hidden shrink-0 items-center gap-4 whitespace-nowrap ${WIDE_NAV === "xl" ? "xl:flex" : "lg:flex"}`} aria-label={en ? "Main menu" : "주요 메뉴"}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active === item.anchor ? "true" : undefined}
              className={`inline-flex min-h-[44px] items-center text-small font-normal transition-colors ${
                active === item.anchor ? "text-on-ink" : "text-on-ink-2 hover:text-on-ink"
              }`}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href={en ? "/en/resume/" : "/resume/"}
            className="inline-flex min-h-[44px] items-center border border-rule-ink px-4 font-mono text-caption font-bold text-on-ink transition-colors hover:border-signal-ink hover:text-signal-ink"
          >
            {en ? "Résumé" : "이력서"}
          </Link>
          {!IS_TARGETED && !en ? (
            <a
              href={`${basePath}${portfolioPdfPathForClient}`}
              download
              className="inline-flex min-h-[44px] items-center border border-signal-ink px-4 font-mono text-caption font-bold text-signal-ink transition-colors hover:bg-signal-ink hover:text-ink"
              aria-label="김선일 퍼포먼스 마케팅 포트폴리오 PDF 다운로드"
            >
              포트폴리오 PDF
            </a>
          ) : null}
          {SHOW_LANG ? <LangSwitch isEn={lang.isEn} koHref={lang.ko} enHref={lang.en} className="flex" /> : null}
        </nav>

        {SHOW_LANG ? (
          <div className={`flex items-center gap-2 ${WIDE_NAV === "xl" ? "xl:hidden" : "lg:hidden"}`}>
            <LangSwitch isEn={lang.isEn} koHref={lang.ko} enHref={lang.en} className="flex" />
            {menuButton()}
          </div>
        ) : (
          menuButton()
        )}
      </div>

      {/*
        메뉴가 닫혀 있을 때도 이 nav 를 DOM 에 남긴다.
        예전에는 {open ? <nav id="mobile-nav"> : null} 이었는데, 그러면 닫힌 기본 상태에서
        위 버튼의 aria-controls="mobile-nav" 가 **존재하지 않는 요소**를 가리킨다.
        스크린리더는 "무언가를 여닫는 버튼"이라고 알리면서 그 무언가를 찾지 못한다.
        hidden 속성을 쓰면 접근성 트리에서도 빠지고 포커스도 안 가므로,
        닫힘 상태의 의미는 그대로이면서 aria-expanded / aria-controls 가 앞뒤가 맞는다.
      */}
      <nav
        id="mobile-nav"
        hidden={!open}
        className={`mobile-nav border-t border-rule-ink bg-ink px-5 pb-5 sm:px-10 ${WIDE_NAV === "xl" ? "xl:hidden" : "lg:hidden"}`}
        aria-label={en ? "Main menu" : "주요 메뉴"}
      >
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex min-h-[52px] items-center border-b border-rule-ink-2 text-body font-normal text-on-ink"
            >
              {item.label}
            </Link>
          ))}
          <div className={`mt-4 grid gap-2 ${!IS_TARGETED && !en ? "grid-cols-2" : "grid-cols-1"}`}>
            <Link
              href={en ? "/en/resume/" : "/resume/"}
              onClick={() => setOpen(false)}
              className="flex min-h-[52px] items-center justify-center bg-on-ink px-3 text-body font-bold text-ink"
            >
              {en ? "Résumé" : "이력서"}
            </Link>
            {!IS_TARGETED && !en ? (
              <a
                href={`${basePath}${portfolioPdfPathForClient}`}
                download
                onClick={() => setOpen(false)}
                className="flex min-h-[52px] items-center justify-center border border-signal-ink px-3 text-body font-bold text-signal-ink"
                aria-label="김선일 퍼포먼스 마케팅 포트폴리오 PDF 다운로드"
              >
                포트폴리오 PDF
              </a>
            ) : null}
          </div>
      </nav>

      <div
        data-testid="scroll-progress"
        className="absolute inset-x-0 bottom-0 h-[2px] origin-left bg-signal-ink motion-reduce:hidden"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
    </header>
  );
}
