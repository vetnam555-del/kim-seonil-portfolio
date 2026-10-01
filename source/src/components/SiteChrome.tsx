"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import EmailCopyButton from "@/components/EmailCopyButton";
import { EDITION } from "@/data/edition";
import { counterpartPath } from "@/data/en/meta";

/*
 * 레이아웃 공통 요소의 영문판 (2026.09.25).
 * 레이아웃은 한 벌이라 /en/ 아래에서만 문구를 바꾼다. 한국어 화면의 마크업은 옮기기 전과 같다.
 * 사이트 데이터(site.ts)는 클라이언트 묶음에 넣지 않으려고 레이아웃에서 값만 넘겨받는다.
 */
function useEn() {
  const pathname = usePathname();
  return EDITION === "general" && counterpartPath(pathname ?? "/").isEn;
}

/* 정적 HTML 은 lang="ko" 로 나가므로, 영문 화면에서는 문서 언어를 바로 고친다(본문은 lang="en" 으로도 감싼다) */
export function HtmlLang() {
  const en = useEn();
  useEffect(() => {
    document.documentElement.lang = en ? "en" : "ko";
  }, [en]);
  return null;
}

export function SkipLink() {
  const en = useEn();
  return (
    <a href="#main" className="skip-link">
      {en ? "Skip to content" : "본문 바로가기"}
    </a>
  );
}

export function SiteFooter({
  name,
  nameEn,
  emailPrimary,
  emailSecondary,
  showWorkEmail,
  linkedin,
}: {
  name: string;
  nameEn: string;
  emailPrimary: string;
  emailSecondary: string;
  showWorkEmail: boolean;
  linkedin: string;
}) {
  const en = useEn();
  return (
    <footer className="site-footer border-t border-line py-10" lang={en ? "en" : undefined}>
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-10">
        {/* 케이스 상세로 바로 들어온 사람도 연락처를 보게 둔다.
            대표 메일은 판마다 다르다 — hll 은 사내 메일(재직 확인 수단), 일반판은 개인 메일. */}
        <p className="text-caption text-ink-3">
          {en ? <>{nameEn} · {name}</> : <>{name} · {nameEn}</>} —{" "}
          <EmailCopyButton email={emailPrimary} className="text-accent underline underline-offset-2" />{" "}
          {/* 사외 지원판에서는 보조 메일이 곧 사내 메일이라 싣지 않는다 */}
          {showWorkEmail ? (
            <>
              ·{" "}
              <EmailCopyButton email={emailSecondary} className="text-accent underline underline-offset-2" />{" "}
            </>
          ) : null}
          ·{" "}
          <a href={linkedin} target="_blank" rel="noopener" className="text-accent underline underline-offset-2">
            LinkedIn
          </a>
        </p>
        <p className="mt-2 text-caption text-ink-3">
          {en ? (
            <>
              <span className="block">All figures are based on GA4, media reports and operating logs, and public screens are de-identified.</span>
              <span className="block">Figures that can&apos;t be disclosed for advertiser data security are shown as ratios.</span>
            </>
          ) : (
            <>
              <span className="block">모든 수치는 GA4·매체 리포트·운영 로그 기준이며, 공개 화면은 비식별 처리했습니다.</span>
              <span className="block">광고주 데이터 보안상 공개할 수 없는 수치는 비율로 표기했습니다.</span>
            </>
          )}
        </p>
        <p className="mt-2 text-caption text-ink-3">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
