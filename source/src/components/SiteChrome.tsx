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
  linkedin,
}: {
  name: string;
  nameEn: string;
  emailPrimary: string;
  linkedin: string;
}) {
  const en = useEn();
  return (
    <footer className="site-footer border-t border-line py-10" lang={en ? "en" : undefined}>
      <div className="mx-auto w-full max-w-[1240px] px-5 sm:px-10">
        {/* 케이스 상세로 바로 들어온 사람도 연락처를 보게 둔다. */}
        <p className="text-caption text-ink-3">
          {en ? <>{nameEn} · {name}</> : <>{name} · {nameEn}</>} —{" "}
          <EmailCopyButton email={emailPrimary} className="text-accent underline underline-offset-2" />{" "}
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
              <span className="block">Contribution is measured against the scope stated in each case: 100% means I handled that scope alone, 35–75% means I led strategy and analysis within a team, and 20% means I owned specific media and analysis within a team. Team sizes are left out because they are client and organization information.</span>
            </>
          ) : (
            <>
              <span className="block">모든 수치는 GA4·매체 리포트·운영 로그 기준입니다. 공개 화면은 비식별 처리했습니다.</span>
              <span className="block">광고주 데이터 보안상 공개할 수 없는 수치는 비율로 표기했습니다.</span>
              {/* 기여도 범례 (2026.10.10) — 2026.08 판 앞쪽에 있던 범례와 인원 원칙을 되살렸다. 그때 구간은
                  100 / 40–75 / 20 이었는데 지금 값에 동원몰 35%(키워드·소재 재구성 + 자동입찰 결합, 전략 쪽 일)가 있어 35 부터 잡는다.
                  100% 를 "단독 담당 계정"으로 적었다가 범위 기준으로 고쳤다(자비스 검토) — 자동화 100% 는 시스템 6종 범위,
                  대교 100% 는 측정 QA 설계 범위라 계정 전체 단독 운영으로 읽히면 사례에서 나눠 둔 범위를 다시 넓힌다 */}
              <span className="block">기여도는 사례마다 적은 업무 범위를 기준으로 합니다. 100%는 그 범위를 혼자 맡은 경우, 35–75%는 팀 안에서 전략·분석을 주도한 경우, 20%는 팀 안에서 담당 매체·분석을 맡은 경우입니다. 팀 구성 인원은 광고주·조직 정보라 표기하지 않았습니다.</span>
            </>
          )}
        </p>
        <p className="mt-2 text-caption text-ink-3">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
