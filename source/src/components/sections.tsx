import Link from "next/link";
import GeneralCover from "@/components/GeneralCover";
import {
  Reveal,
} from "@/components/motion";
import { splitCaptionSentences } from "@/components/ProjectsSection";
import CountUpValue from "@/components/CountUpValue";
import EmailCopyButton from "@/components/EmailCopyButton";
import MarqueePause from "@/components/MarqueePause";
import { evidenceSize } from "@/lib/evidence-size";
import {
  AnchorStub,
  Badge,
  CTAButton,
  Container,
  FootnoteRef,
  Footnotes,
  Section,
  SectionHead,
} from "@/components/ui";
import {
  ablyProfile,
  ablySelectedImpact,
  activities,
  archiveLead,
  automationCases,
  awards,
  awardsArchive,
  brands,
  builtGroups,
  career,
  careerBridge,
  careerYear,
  certifications,
  contact,
  generalCover,
  education,
  first90Days,
  generalProfile,
  hero,
  heroFacts,
  hllCareerBridge,
  hllProfile,
  hllRoleFit,
  hllSelectedImpact,
  hllStory,
  howIWork,
  keyNumbers,
  publicWork as publicWorkItems,
  selectedImpact,
  shinsegaeProfile,
  shinsegaeSelectedImpact,
  site,
  skillLevels,
  skills,
  story,
  verification,
  whatsNext,
  whyStudioLululala,
} from "@/data/site";
/*
 * 판별 카피 선택은 isAbly 로 한다. showWhyAbly 는 "공고 매칭 지면을 띄우는가" 만
 * 뜻하는데, 그 둘을 한 플래그로 묶었더니 지면을 끄자 프로필·대표 수치까지 기본판으로
 * 돌아갔다. 노출 여부와 카피 선택은 다른 질문이다.
 */
import { EDITION, edition, isAbly, isGeneralLike, isV260908 } from "@/data/edition";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const isGeneralEdition =
  !edition.showWhyStudio && !edition.showWhyShinsegae && !edition.showWhyAbly;
/* ═══════════════════════ S1. COVER — 표지 ═══════════════════════ */
/**
 * 장식 이미지를 쓰지 않는다. 첫 화면의 시각 앵커는 검증된 수치 자체이고,
 * 남는 유일한 사진은 바이라인 포트레이트 하나다.
 * 높이는 콘텐츠가 정한다 — 100svh를 쓰지 않는다.
 */
export function Cover() {
  return EDITION === "general" ? <GeneralCover /> : <PersonFirstCover />;
}

function PersonFirstCover() {
  const profile = isAbly
    ? ablyProfile
    : edition.showWhyShinsegae
    ? shinsegaeProfile
    : edition.showWhyStudio
      ? hllProfile
      : generalProfile;
  const impact = isAbly
    ? ablySelectedImpact
    : edition.showWhyShinsegae
    ? shinsegaeSelectedImpact
    : edition.showWhyStudio
      ? hllSelectedImpact
      : selectedImpact;
  const isTargetedEdition =
    edition.showWhyStudio || edition.showWhyShinsegae || edition.showWhyAbly;
  const primaryAnchor = edition.showWhyAbly
    ? "#why-ably"
    : edition.showWhyShinsegae
    ? "#why-shinsegae"
    : edition.showWhyStudio
      ? "#why-studio"
      : "#projects";
  const primaryShortLabel = edition.showWhyShinsegae
    ? "직무 적합성"
    : edition.showWhyStudio
      ? "지원 이유"
      : "프로젝트";

  return (
    <>
      <section id="hero" className={`on-ink bg-ink text-on-ink${isGeneralLike ? " general-hero" : ""}`}>
        <Container>
          <div
            className="hero-enter hero-masthead flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t-2 border-rule-ink pt-[72px] font-mono text-[0.6875rem] font-bold sm:pt-[88px]"
            style={{ "--hero-delay": "30ms" } as React.CSSProperties}
          >
            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 tracking-[0.12em] text-on-ink uppercase">
              <span>{hero.mastheadLeft}</span>
            <span className="hidden font-normal tracking-[0.08em] text-on-ink-2 sm:inline">{hero.mastheadBase}</span>
            </p>
            <p className="hidden tracking-normal text-on-ink-2 sm:block">{hero.mastheadRight}</p>
          </div>

          <div className="hero-layout grid grid-cols-1 gap-x-12 gap-y-10 pb-8 pt-6 sm:pb-10 sm:pt-10 lg:grid-cols-12 lg:pb-12 lg:pt-12">
            <div className="lg:col-span-8">
              <p
                className="hero-enter hero-eyebrow font-mono text-mono font-bold tracking-[0.08em] text-limit-ink"
                style={{ "--hero-delay": "100ms" } as React.CSSProperties}
              >
                {profile.eyebrow}
              </p>
              <div
                className="hero-enter hero-profile mt-5 flex items-center gap-3 border-y border-rule-ink-2 py-3 lg:hidden"
                style={{ "--hero-delay": "150ms" } as React.CSSProperties}
              >
                <img
                  src={`${basePath}${site.profileImagePath}`}
                  alt="김선일 프로필 사진"
                  width={52}
                  height={66}
                  className="h-[66px] w-[52px] shrink-0 border border-rule-ink object-cover object-top"
                />
                <div>
                  <p className="text-small font-bold text-on-ink">{site.name} · {site.nameEn}</p>
                  <p className="mt-1 text-caption leading-[1.55] text-on-ink-2">
                    HLL중앙 퍼포먼스전략국 과장 · 퍼포먼스 마케팅 경력 {careerYear()}년
                  </p>
                </div>
              </div>
              <h1 className={`mt-6 ${isGeneralLike ? "max-w-full" : "max-w-[15ch]"} text-[2.25rem] leading-[1.08] font-black tracking-normal text-on-ink sm:text-[3.5rem] lg:mt-5 lg:text-[3.75rem]`}>
                {profile.title.map((line, index) => (
                  <span
                    key={line}
                    className="hero-title-line block"
                    style={{ "--hero-delay": `${170 + index * 90}ms` } as React.CSSProperties}
                  >
                    {line}
                  </span>
                ))}
              </h1>
              <p
                className="hero-enter mt-6 max-w-[45rem] border-l-2 border-limit-ink pl-4 text-small leading-[1.65] font-bold text-on-ink sm:text-[1.0625rem]"
                style={{ "--hero-delay": "390ms" } as React.CSSProperties}
              >
                {edition.heroRoleLine}
              </p>
              <p
                className="hero-enter hero-intro mt-5 max-w-[44rem] text-small leading-[1.8] text-on-ink-2 sm:text-body sm:leading-[1.7]"
                style={{ "--hero-delay": "460ms" } as React.CSSProperties}
              >
                <span className="sm:hidden">{EDITION === "general" ? "산업디자인·창업에서 출발해 30여 개 브랜드의 캠페인을 운영했습니다." : profile.introShort}</span>
                <span className="hidden sm:inline">{EDITION === "general" ? "산업디자인과 창업·크라우드펀딩, 공공기관 콘텐츠 협업을 거쳐 30여 개 브랜드의 캠페인을 운영했습니다." : profile.intro}</span>
              </p>
              <p
                className="hero-enter hero-interests mt-4 font-mono text-mono leading-[1.7] text-on-ink-2 lg:hidden"
                style={{ "--hero-delay": "510ms" } as React.CSSProperties}
              >
                <span className="font-bold text-limit-ink">{profile.interestLabel}</span>
                {profile.interests.map((interest) => (
                  <span key={interest} className="inline-block whitespace-nowrap">
                    <span aria-hidden="true"> · </span>{interest}
                  </span>
                ))}
              </p>

              {/*
               * 규모 수치를 첫 화면 안에 둔다 — 이 줄이 생기기 전에는 첫 큰 숫자가 926px 에서야
               * 나왔다. 성과(ROAS·CVR)가 아니라 다뤄 온 범위라 위쪽 원칙과 부딪히지 않는다.
               */}
              <dl className="hero-facts mt-7 grid max-w-[34rem] grid-cols-2 gap-x-5 gap-y-5 border-t border-rule-ink-2 pt-5 sm:grid-cols-3 sm:gap-y-0">
                {heroFacts.map((f, index) => (
                  <div
                    key={f.value}
                    className={`hero-fact min-w-0 ${index === heroFacts.length - 1 ? "col-span-2 sm:col-span-1" : ""}`}
                    style={{ "--hero-delay": `${540 + index * 70}ms` } as React.CSSProperties}
                  >
                    <dt className="sr-only">{f.label}</dt>
                    <dd className="text-[1.375rem] leading-[1.1] font-bold tabular-nums whitespace-nowrap text-on-ink sm:text-metric-sm">
                      <CountUpValue value={f.value} delay={500 + index * 90} duration={1050} />
                    </dd>
                    <p aria-hidden className="mt-1.5 text-caption leading-[1.45] text-on-ink-2">
                      {f.label}
                    </p>
                  </div>
                ))}
              </dl>

              <div
                className="hero-enter mt-6 hidden flex-wrap gap-3 sm:flex"
                style={{ "--hero-delay": "760ms" } as React.CSSProperties}
              >
                <CTAButton href={primaryAnchor} onDark>
                  {edition.primaryCtaLabel}
                </CTAButton>
                {/*
                  운영 자동화를 기획·콘텐츠 경험으로 교체하지 않고 나란히 둔다.
                  둘은 이 사람의 다른 축이다 — 자동화는 지금의 차별점이고, 기획·콘텐츠는
                  그 판단이 어디서 왔는지다. 하나를 빼면 퍼포먼스 직무에는 앞의 것이,
                  콘텐츠 조직에는 뒤의 것이 안 보인다. 첫 화면에서 둘 다 닿게 한다.
                */}
                {isGeneralLike && EDITION !== "general" ? (
                  <>
                    <CTAButton href="#automation" variant="ghost" onDark>운영 자동화</CTAButton>
                    <CTAButton href="#creative-roots" variant="ghost" onDark>기획·콘텐츠 경험</CTAButton>
                  </>
                ) : null}
                {isTargetedEdition ? (
                  <CTAButton href="#projects" variant="ghost" onDark>
                    대표 프로젝트
                  </CTAButton>
                ) : null}
                {isTargetedEdition ? (
                  <a
                    href={`${basePath}${site.resumePdfPath}`}
                    download
                    className="inline-flex min-h-[44px] items-center font-mono text-small font-bold text-on-ink underline underline-offset-4 hover:text-signal-ink"
                  >
                    이력서 PDF
                  </a>
                ) : (
                  <EmailCopyButton
                    email={site.emailPrimary}
                    className="inline-flex min-h-[44px] items-center font-mono text-small font-bold text-on-ink underline underline-offset-4 hover:text-signal-ink"
                  >
                    이메일 주소 복사
                  </EmailCopyButton>
                )}
              </div>
              <nav className="mt-6 grid grid-cols-2 gap-2 sm:hidden" aria-label="포트폴리오 바로가기">
                <a
                  href={primaryAnchor}
                  className={`${EDITION === "general" ? "" : "col-span-2"} inline-flex min-h-[44px] items-center justify-center bg-on-ink px-3 font-mono text-mono font-bold text-ink`}
                >
                  {primaryShortLabel}
                </a>
                {isGeneralLike && EDITION !== "general" ? (
                  <>
                    <a href="#automation" className="inline-flex min-h-[44px] items-center justify-center border border-rule-ink px-3 font-mono text-mono font-bold text-on-ink">운영 자동화</a>
                    <a href="#creative-roots" className="inline-flex min-h-[44px] items-center justify-center border border-rule-ink px-3 font-mono text-mono font-bold text-on-ink">기획·콘텐츠 경험</a>
                  </>
                ) : null}
                {!isGeneralLike ? <a
                  href={isTargetedEdition ? "#projects" : `${basePath}${site.resumePdfPath}`}
                  download={isTargetedEdition ? undefined : true}
                  className="inline-flex min-h-[44px] min-w-0 items-center justify-center border border-rule-ink px-3 font-mono text-mono font-bold text-on-ink"
                >
                  {isTargetedEdition ? "프로젝트" : "이력서 PDF"}
                </a> : null}
                {isTargetedEdition ? (
                  <a
                    href={`${basePath}${site.resumePdfPath}`}
                    download
                    className="inline-flex min-h-[44px] min-w-0 items-center justify-center border border-rule-ink px-3 font-mono text-mono font-bold text-on-ink"
                  >
                    이력서 PDF
                  </a>
                ) : (
                  <EmailCopyButton
                    email={site.emailPrimary}
                    className={`${EDITION === "general" ? "" : "col-span-2"} inline-flex min-h-[44px] min-w-0 items-center justify-center border border-rule-ink px-3 font-mono text-mono font-bold text-on-ink`}
                  >
                    이메일 주소 복사
                  </EmailCopyButton>
                )}
              </nav>

              {/*
                모바일에도 같은 근거를 준다.
                외부 공개 기록을 첫 화면에 올린 것이 이번 개정의 핵심인데, 그 자리가
                lg 이상에서만 보이는 오른쪽 칼럼이라 1024px 미만에서는 통째로 빠졌다.
                휴대폰으로 여는 사람에게는 개선이 아예 닿지 않는다는 뜻이다.
                오른쪽 칼럼을 복제하지는 않는다 — 첫 화면만 길어진다. 제목과 출처만
                두 줄로 남기고 상세는 아래 경력 섹션이 그대로 갖는다.
              */}
              {isGeneralLike ? (
                <details className="evidence-fold mt-5 border-t border-rule-ink-2 lg:hidden">
                  <summary className="flex min-h-[44px] cursor-pointer items-center justify-between font-mono text-mono font-bold text-limit-ink">
                    수상·우수사례 출처 2건
                    <span className="evidence-fold-mark" aria-hidden="true">+</span>
                  </summary>
                  <ul className="mt-3 flex flex-col gap-3">
                    {verification.slice(0, 2).map((item) => (
                      <li key={item.title}>
                        <p className="text-caption leading-[1.5] font-bold text-on-ink">{item.title}</p>
                        {item.heroScope ? (
                          <p className="mt-0.5 font-mono text-mono leading-[1.5] text-on-ink-2">
                            {item.heroScope}
                          </p>
                        ) : null}
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener"
                            className="mt-1 inline-flex min-h-[36px] items-center gap-1.5 font-mono text-mono text-on-ink-2 underline underline-offset-4"
                          >
                            {item.label}
                            <span aria-hidden="true">↗</span>
                            <span className="sr-only">(새 탭)</span>
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </details>
              ) : null}
            </div>

            <aside
              className="hero-enter hero-enter-side hidden border-t border-rule-ink-2 pt-5 lg:col-span-4 lg:block lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0"
              style={{ "--hero-delay": "250ms" } as React.CSSProperties}
            >
              <div className="flex items-start gap-4">
                <img
                  src={`${basePath}${site.profileImagePath}`}
                  alt="김선일 프로필 사진"
                  width={88}
                  height={112}
                  className="h-[112px] w-[88px] shrink-0 border border-rule-ink object-cover object-top"
                />
                <div>
                  <p className="font-mono text-mono font-bold text-limit-ink">CURRENT</p>
                  <p className="mt-2 text-small font-bold text-on-ink">{site.name} · {site.nameEn}</p>
                  <p className="mt-1 text-caption leading-[1.6] text-on-ink-2">
                    HLL중앙 퍼포먼스전략국 과장<br />퍼포먼스 마케팅 경력 {careerYear()}년
                  </p>
                </div>
              </div>

              <div className="mt-7 border-t border-rule-ink-2 pt-5">
                <p className="font-mono text-mono font-bold text-limit-ink">{profile.interestLabel}</p>
                <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-2">
                  {profile.interests.map((interest) => (
                    <li key={interest} className="text-caption text-on-ink-2">
                      {interest}
                    </li>
                  ))}
                </ul>
              </div>

              {/*
                이 칼럼은 498px 인데 내용이 240px 에서 끝나 258px(52%)이 비어 있었다.
                첫 화면의 절반짜리 빈 땅이다.

                그 자리에 밖에서 확인되는 기록을 올린다. 이 사이트에서 유일하게 본인이
                주장하지 않는 정보이고, 지금까지는 문서 92% 지점(경력 섹션)에 있었다.
                신뢰가 먼저 서면 그 아래를 읽는다 — 순서를 바꾸지 않고 접근만 앞당긴다.

                site.ts 의 주석대로 "검증"이라는 말은 쓰지 않는다. 게재·보도된 사실이다.
                직무와 가까운 앞의 두 건만 싣고 나머지는 경력 섹션에 그대로 둔다.
              */}
              {isGeneralLike ? (
                <div className="mt-7 border-t border-rule-ink-2 pt-5">
                  <p className="font-mono text-mono font-bold tracking-[0.08em] text-limit-ink uppercase">
                    Public record
                  </p>
                  <ul className="mt-3 flex flex-col gap-3.5">
                    {verification.slice(0, 2).map((item) => (
                      <li key={item.title}>
                        <p className="text-caption leading-[1.5] font-bold text-on-ink">{item.title}</p>
                        {item.heroScope ? (
                          <p className="mt-0.5 font-mono text-mono leading-[1.5] text-on-ink-2">
                            {item.heroScope}
                          </p>
                        ) : null}
                        {item.href ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener"
                            className="group mt-1 inline-flex min-h-[36px] items-center gap-1.5 font-mono text-mono text-on-ink-2 underline underline-offset-4 hover:text-signal-ink"
                          >
                            {item.label}
                            <span className="nudge" aria-hidden="true">↗</span>
                            <span className="sr-only">(새 탭)</span>
                          </a>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </aside>
          </div>

          {/*
            표지 대형 수치 (개선판만).

            지금까지 표지에는 규모(월 10억+·30여 개·6종)만 두고 성과는 두지 않았다.
            이유가 있었다 — 큰 숫자를 표지에 세우면 "이 중 얼마가 본인 몫인가" 가
            먼저 떠오르고, 답이 아래에 있으면 오히려 방어적으로 읽힌다.
            그래서 수치를 세우되 귀속 단서를 같은 시선 높이에 붙인다. 숫자 옆의
            subnote 가 그 답이고, 바로 옆이 해당 케이스 입구다.

            크기는 text-mega(최대 200px)다. 케이스 대표 수치(text-mega-case, 141px)보다
            커야 표지가 표지로 읽힌다 — 같은 크기면 어느 쪽이 이 사람의 첫 성과인지 모른다.
            둘 이상 세우지 않는다. 다크 밴드에는 하나만 놓는 것이 이 지면의 규칙이다.
          */}
          {isV260908 && hero.headlines[0] ? (
            <Reveal variant="wipe" className="mt-1 border-t border-rule-ink-2 pt-8 lg:pt-9">
              <p className="font-mono text-mono font-bold tracking-[0.03em] text-limit-ink">
                {hero.headlines[0].overline}
              </p>
              {hero.headlines[0].before ? (
                <p className="mt-2.5 flex items-center gap-3">
                  <span className="figure text-[clamp(1.125rem,2vw,1.5rem)] leading-none font-semibold text-on-ink-2">
                    {hero.headlines[0].before}
                  </span>
                  <span className="font-mono text-on-ink-2" aria-hidden="true">
                    →
                  </span>
                  <span className="sr-only">에서 </span>
                </p>
              ) : null}
              <div className="mt-1.5 flex flex-col gap-x-10 gap-y-5 lg:flex-row lg:items-end">
                <p
                  className="figure text-mega whitespace-nowrap text-on-ink"
                  style={{ fontStretch: "118%", fontWeight: 800 }}
                >
                  <CountUpValue value={hero.headlines[0].after} delay={620} duration={1200} />
                </p>
                <div className="lg:pb-4">
                  <p className="max-w-[34ch] font-mono text-mono leading-[1.6] text-on-ink-2">
                    {hero.headlines[0].subnote}
                  </p>
                  <a
                    href={`#case-${hero.headlines[0].slug}`}
                    className="group mt-2.5 inline-flex min-h-[44px] items-center gap-2 font-mono text-mono font-bold tracking-[0.02em] text-limit-ink underline underline-offset-4 hover:text-signal-ink"
                  >
                    {hero.headlines[0].caseLabel} 케이스 보기
                    <span className="nudge" aria-hidden="true">
                      →
                    </span>
                  </a>
                </div>
              </div>
            </Reveal>
          ) : null}

        </Container>
      </section>

      {EDITION !== "general" ? <section id="impact" className="scroll-mt-[80px] border-y border-rule bg-panel text-on-ink">
        <Container>
          <div className="py-12 md:py-16">
            <div
              className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3"
              data-enter
            >
              <div>
                <p className="font-mono text-mono font-bold tracking-[0.08em] text-limit-ink">{profile.impactEyebrow}</p>
                <h2 className={`mt-3 text-on-ink ${isV260908 ? "text-h2" : "text-[2rem] leading-[1.15] font-black tracking-normal sm:text-[2.75rem]"}`}>
                  {profile.impactTitle}
                </h2>
              </div>
              <p className="max-w-[34rem] text-caption leading-[1.7] text-on-ink-2">
                {profile.impactDesc}
              </p>
            </div>

            <ol className="mt-10 grid grid-cols-1 gap-y-9 border-t border-rule-ink-2 pt-8 lg:grid-cols-3 lg:gap-x-9">
              {/*
                칸은 차례로 밀려 올라오고 수치 줄은 아래에서 드러난다. 최종 성과값은
                같은 시점에 0에서 올라가되, 비교 전 수치와 집계 기준은 고정해 읽기 기준을 남긴다.
              */}
              {impact.map((item, i) => (
                <Reveal
                  as="li"
                  key={item.brand}
                  delay={i * 0.09}
                  className={i > 0 ? "lg:border-l lg:border-rule-ink-2 lg:pl-9" : undefined}
                >
                  <p className="font-mono text-mono font-bold text-limit-ink">{item.axis} · {item.brand}</p>
                  {/*
                    before 가 빈 값이면 화살표도 내보내지 않는다.
                    쌤소나이트 카카오톡채널(5,482명)은 시작값이 없는 단일 누적값인데
                    화살표를 무조건 렌더해서 화면에 "→ 5,482명"으로 나갔다 —
                    앞의 숫자가 잘린 것처럼 보이고, 스크린리더에는 방향만 읽힌다.
                    같은 파일의 표지 대형 수치(HEADLINE_POOL)는 이미 조건부로 처리하고
                    있었다. 두 곳이 같은 규칙을 쓰게 맞춘다.
                  */}
                  {/* 수치 줄만 wipe. 래퍼를 두면 flex 배치가 깨져서 속성만 얹는다. */}
                  <p
                    className="mt-4 flex flex-wrap items-end gap-x-3 gap-y-1"
                    data-enter="wipe"
                    style={{ "--enter-delay": `${Math.round(i * 90 + 140)}ms` } as React.CSSProperties}
                  >
                    {item.before ? (
                      <>
                        <span className="figure text-[1.25rem] leading-none text-on-ink-2">
                          {item.before}
                        </span>
                        <span className="pb-0.5 font-mono text-on-ink-2" aria-hidden="true">→</span>
                        <span className="sr-only">에서 </span>
                      </>
                    ) : null}
                    <span className={`figure text-on-ink ${isV260908 ? "text-metric" : "text-[2.75rem] leading-none sm:text-[3.25rem]"}`}>
                      <CountUpValue value={item.after} delay={180 + i * 90} />
                    </span>
                  </p>
                  <h3 className="mt-3 text-h3 text-on-ink">{item.label}</h3>
                  <p className="mt-3 text-small leading-[1.7] text-on-ink-2">{item.desc}</p>
                  <p className="mt-3 font-mono text-mono leading-[1.6] text-on-ink-2">{item.note}</p>
                  <a
                    href={item.href.startsWith("#") ? item.href : `${basePath}${item.href}`}
                    className="group mt-4 inline-flex min-h-[44px] items-center gap-2 font-mono text-mono font-bold text-limit-ink underline underline-offset-4 hover:text-signal-ink"
                  >
                    사례 보기 <span className="nudge" aria-hidden="true">→</span>
                  </a>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>

        {/*
          브랜드 띠는 흐르게 둔다. 30여 개가 한 줄에 안 들어가 두 줄로 접히면서
          이 자리가 통째로 멈춰 보였다 — 표지 다음에 처음 만나는 띠라 인상이 크다.
          같은 목록을 두 벌 이어 붙여 이음매 없이 돌리고, 두 번째 벌은 화면에서만 보이게 한다.
          호버·포커스로 멈추고, 마우스가 없는 환경을 위해 정지 버튼도 함께 둔다.
        */}
        <div className="flex items-center gap-3 border-t border-rule-ink bg-ink py-4">
          <MarqueePause targetId="brand-marquee-1" />
          <div className="marquee" id="brand-marquee-1">
            <div className="marquee-track">
              {[0, 1].map((pass) => (
                <ul
                  key={pass}
                  className="flex shrink-0 items-center gap-x-5"
                  aria-label={pass === 0 ? "운영한 주요 브랜드" : undefined}
                  aria-hidden={pass === 1 ? true : undefined}
                >
                  {brands.map((brand) => (
                    <li
                      key={`${pass}-${brand}`}
                      className="flex items-center gap-x-5 font-mono text-mono tracking-normal whitespace-nowrap text-on-ink-2"
                    >
                      {brand}
                      <span className="text-limit-ink" aria-hidden="true">·</span>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section> : null}
    </>
  );
}

/** 이전 수치 중심 표지. 새 사람 중심 표지와의 회귀 비교용으로만 남긴다. */
export function EditorialCover() {
  return (
    <section id="hero" className="on-ink bg-ink text-on-ink">
      <Container>
        <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t-2 border-rule-ink pt-[72px] font-mono text-[0.6875rem] font-bold sm:pt-[88px]">
          {/* 지원 직무(굵게)와 기반 역량(연하게)을 같은 줄에서 무게로 가른다 */}
          <h1 className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 tracking-[0.18em] text-on-ink uppercase">
            <span>{hero.mastheadLeft}</span>
            <span className="font-normal tracking-[0.14em] text-on-ink-2">
              {hero.mastheadBase}
            </span>
            <span className="sr-only"> — 포트폴리오 {edition.issueLabel}</span>
          </h1>
          <p className="tracking-[0.02em] text-on-ink-2">{hero.mastheadRight}</p>
        </div>
      </Container>

      {/*
        표지는 "보는 구간"이다 — 저밀도로 두고 수치 하나가 지면을 점거한다.
        이 구형 표지는 현재 렌더 경로가 아니지만, 다시 쓸 때도 대표 결과만 카운트업하고
        비교 기준·기간·각주는 고정한다.
      */}
      <Container>
        {/*
          바이라인은 얇은 가로 띠로 마스트헤드 바로 아래 둔다.
          예전엔 오른쪽 4칼럼에 세로로 세워 뒀는데, Data Policy 를 판권면으로 내리면서
          그 칼럼 508px 중 398px(78%)이 빈 채로 남았고 세로 룰이 아무것도 없는 옆을 지났다.
          잡지에서 필자 정보가 표지 옆이 아니라 얇은 한 줄로 붙는 것과 같은 처리다.
        */}
        <div className="mt-9 flex items-center gap-4 border-t border-rule-ink-2 pt-5">
          <img
            src={`${basePath}${site.profileImagePath}`}
            alt="김선일 프로필 사진"
            width={64}
            height={80}
            className="h-[80px] w-[64px] shrink-0 border border-rule-ink object-cover object-top"
          />
          {/*
            현재 직무와 지원 직무를 한 줄에 섞지 않는다.
            마스트헤드는 CONTENT GROWTH & PERFORMANCE MARKETER 인데 여기는 퍼포먼스
            마케터라 모순처럼 보인다는 지적이 있었다 — 사실은 '지금'과 '지원하는 자리'라,
            그렇게 갈라 둔다.

            두 번째 줄을 "다음"이 아니라 "지원 역할"로 쓴다. 사내 이동은 아직 확정된 것이
            아닌데 "다음"은 이미 정해진 순서처럼 읽힌다 — 인사팀이 보는 서류에서
            확정되지 않은 것을 확정처럼 적으면 그 자체가 사실관계 오류가 된다.
          */}
          <div className="flex flex-wrap items-baseline gap-x-5 gap-y-1 text-mono leading-[1.55]">
            <p className="font-bold text-on-ink">{site.name}</p>
            <p className="text-on-ink-2">
              <span className="text-limit-ink">현재</span> 퍼포먼스 마케팅 경력 {careerYear()}년 ·{" "}
              {hero.identity}
            </p>
            {edition.showWhyStudio ? (
              <p className="text-on-ink-2">
                <span className="text-limit-ink">지원 역할</span> 유튜브·SNS 콘텐츠 마케팅 — 채널
                전략·확산·성과 분석
              </p>
            ) : null}
          </div>
        </div>

        {/* 수치는 이제 지면 전체를 쓴다 — 12칼럼 분할을 걷어냈다 */}
        <div className="mt-10 lg:mt-12">
          <div>
            {hero.headlines.map((h, i) => (
              <Reveal
                key={h.overline}
                variant="wipe"
                delay={0.06 + i * 0.09}
                className={i > 0 ? "mt-9 border-t border-rule-ink-2 pt-9" : undefined}
              >
                {/* "다이슨 YouTube"처럼 한글·라틴이 섞인 라벨이라 자간을 라틴 기준으로 벌리지 않는다 */}
                <p className="font-mono text-mono font-bold tracking-[0.03em] text-on-ink-2">
                  {h.overline}
                  <FootnoteRef id={h.footnote} />
                </p>
                {/* before 와 after 를 같은 줄에 두면 mega 의 line-height(0.86)가
                    작은 글자의 행상자를 덮어 겹친다. 명시적으로 쌓는다. */}
                {h.before ? (
                  <p className="mt-2.5 flex items-center gap-3">
                    <span className="figure text-[clamp(1.125rem,2vw,1.5rem)] leading-none font-semibold text-on-ink-2">
                      {h.before}
                    </span>
                    <span className="font-mono text-on-ink-2" aria-hidden="true">
                      →
                    </span>
                    <span className="sr-only">에서 </span>
                  </p>
                ) : null}
                {/*
                  수치 오른쪽의 여백을 기능으로 채운다.
                  수치는 길이가 제각각이라 오른쪽에 늘 빈 자리가 생기는데, 거기에 귀속 단서와
                  해당 케이스로 가는 입구를 바닥 정렬로 붙인다. 장식을 넣어 메우는 대신
                  "이 숫자가 어디서 왔고 어디로 가면 되는지"를 같은 시선 높이에 둔다.
                */}
                <div className="mt-1.5 flex flex-col gap-x-10 gap-y-4 lg:flex-row lg:items-end">
                  {/* 첫 수치만 스크롤에 반응해 자폭이 좁아진다(.figure-live).
                      둘 다 반응시키면 표지가 술렁여서 읽기가 방해된다. */}
                  <p
                    className={`figure text-mega whitespace-nowrap text-on-ink${i === 0 ? " figure-live" : ""}`}
                    style={{ fontStretch: "118%", fontWeight: 800 }}
                  >
                    {h.after}
                  </p>
                  <div className="lg:pb-3">
                    <p className="max-w-[34ch] font-mono text-mono leading-[1.6] text-on-ink-2">
                      {h.subnote}
                    </p>
                    <a
                      href={`#case-${h.slug}`}
                      className="group mt-2.5 inline-flex min-h-[44px] items-center gap-2 font-mono text-mono font-bold tracking-[0.02em] text-limit-ink underline underline-offset-4 hover:text-signal-ink"
                    >
                      {h.caseLabel} 케이스 보기
                      <span className="nudge" aria-hidden="true">
                        →
                      </span>
                    </a>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-x-10 gap-y-8 border-t border-rule-ink-2 pt-10 lg:grid-cols-12">
          <p className="text-deck text-on-ink lg:col-span-8">{hero.deck}</p>
          {/* 표지의 궤적은 이제 실제 도착지가 있다 — #story 로 연결해 "이게 왜 한 사람의
              이야기인가"를 스크롤 없이 확인할 수 있게 한다. */}
          <a
            href="#story"
            className="group flex flex-wrap items-center gap-x-2 gap-y-1 self-start font-mono text-mono text-on-ink-2 hover:text-on-ink lg:col-span-4"
          >
            {hero.trajectory.map((step, i) => (
              <span key={step} className="flex items-center gap-2">
                {i > 0 ? <span aria-hidden="true">→</span> : null}
                {step}
              </span>
            ))}
            <span className="text-limit-ink underline underline-offset-4 group-hover:text-signal-ink">
              스토리 보기
            </span>
          </a>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 pb-14">
          <CTAButton href="#projects" onDark>
            특집 {edition.spreadOrder.length}편 읽기 →
          </CTAButton>
          <CTAButton href={`${basePath}${site.resumePdfPath}`} variant="ghost" download onDark>
            이력서 PDF
          </CTAButton>
          <EmailCopyButton
            email={site.emailPrimary}
            className="inline-flex min-h-[44px] items-center font-mono text-small font-bold text-on-ink underline underline-offset-4 hover:text-signal-ink"
          />
        </div>
      </Container>

      {/* 챕터 인덱스 — 다크 위 다크라 구분은 면(1.1:1)이 아니라 룰(3.1:1)이 담당한다 */}
      <div className="border-t border-rule-ink bg-panel py-8">
        <Container>
          <AnchorStub id="impact" />
          {/* 셀이 6개가 되면서 5열은 마지막 줄이 한 칸만 남아 어색해진다 — 3열 2줄로 간다 */}
          <ol className="grid grid-cols-2 gap-x-8 gap-y-8 sm:grid-cols-3">
            {chapterIndex().map((n, i) => (
              <li
                key={n.label}
                className={i % 3 !== 0 ? "sm:border-l sm:border-rule-ink-2 sm:pl-8" : undefined}
              >
                <a
                  href={n.href}
                  className={`group flex min-h-[44px] flex-col border-l-2 border-transparent pl-3 transition-colors ${n.hoverClass}`}
                >
                  <span className={`font-mono text-[0.6875rem] font-bold tracking-[0.03em] ${n.folioClass}`}>
                    {n.folio} {n.axis}
                  </span>
                  <span
                    className={`figure mt-2.5 text-[clamp(1.5rem,2.7vw,2.25rem)] leading-none text-on-ink ${n.valueHover}`}
                  >
                    {n.value}
                  </span>
                  <span className="mt-2.5 text-caption font-semibold text-on-ink">{n.label}</span>
                  <span className="mt-1 font-mono text-mono leading-[1.5] text-on-ink-2">{n.note}</span>
                </a>
              </li>
            ))}
          </ol>
          <Footnotes items={[...hero.footnotes]} className="mt-8" onDark />
        </Container>
      </div>

      {/*
        브랜드 띠는 흐르게 둔다. 30여 개가 한 줄에 안 들어가 두 줄로 접히면서
        표지 직후가 통째로 멈춰 보였고, 접힌 목록은 근거로도 잘 읽히지 않았다.
        같은 목록을 두 벌 이어 붙여 이음매 없이 돌리고, 두 번째 벌은 화면에서만 보이게 한다.
        호버·포커스로 멈추고, 마우스가 없는 환경을 위해 정지 버튼도 함께 둔다.
      */}
      <div className="flex items-center gap-3 border-t border-rule-ink bg-ink py-4">
        <MarqueePause targetId="brand-marquee-2" />
        <div className="marquee" id="brand-marquee-2">
          <div className="marquee-track">
            {[0, 1].map((pass) => (
              <ul
                key={pass}
                className="flex shrink-0 items-center gap-x-5"
                aria-label={pass === 0 ? "운영한 주요 브랜드" : undefined}
                aria-hidden={pass === 1 ? true : undefined}
              >
                {brands.map((brand) => (
                  <li
                    key={`${pass}-${brand}`}
                    className="flex items-center gap-x-5 font-mono text-mono tracking-normal whitespace-nowrap text-on-ink-2"
                  >
                    {brand}
                    <span className="text-limit-ink" aria-hidden="true">·</span>
                  </li>
                ))}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * 챕터 인덱스 — 표지 밴드의 각 셀이 어디로 보내고 어떤 폴리오를 달지 계산한다.
 *
 * 폴리오는 셀의 순번이 아니라 **도착지 아티클이 실제로 달게 될 번호**여야 한다.
 * 하드코딩하면 판마다 대표 4편 순서가 다른 지금 구조에서 곧바로 어긋난다 —
 * 일반판은 제이에스티나가 CH.01인데 밴드는 다이슨을 CH.01이라고 말하게 된다.
 * 그래서 edition.spreadOrder 에서 매번 계산하고, 밴드의 배열 순서도 거기에 맞춘다.
 *
 * 자동화는 특집 4편에 속하지 않는 별도 섹션이라 CH 가 아니라 SYSTEM 으로 찍고 항상 맨 끝이다.
 */
function chapterIndex() {
  const order = edition.spreadOrder;
  return [...keyNumbers]
    .map((n) => {
      const i = order.indexOf(n.slug);
      const system = "tone" in n && n.tone === "system";
      /*
       * 스프레드가 아닌 케이스(판에 따라 EDIT H 등)는 홈에 앵커가 없다.
       * 그럴 땐 CH 번호 대신 CASE 로 찍고 상세 페이지로 보낸다 —
       * 없는 앵커로 보내면 클릭이 아무 데도 가지 않는다.
       */
      const folio = i >= 0 ? `CH.${String(i + 1).padStart(2, "0")}` : system ? "SYSTEM" : "CASE";
      const href = i >= 0 ? `#case-${n.slug}` : system ? "#automation" : `/projects/${n.slug}/`;
      /*
       * 표지 대형 수치로 이미 나온 사례는 밴드에서 같은 값을 되풀이하지 않는다.
       * 200px 로 본 107,600 을 36px 로 다시 읽는 건 정보가 아니라 반복이고,
       * 스프레드에서 세 번째로 또 만난다. 대체 표기가 있으면 그걸 쓴다 — 셀 수는 그대로라
       * "숫자로 남은 인덱스"라는 성격은 유지되고, 읽는 사람은 새 사실을 하나 더 얻는다.
       * 어느 사례가 표지에 오르는지는 판마다 다르므로 edition.heroHeadlines 로 판단한다.
       */
      const onCover = (edition.heroHeadlines as readonly string[]).includes(n.slug);
      const alt = onCover && "altValue" in n && n.altValue;
      return {
        ...n,
        value: alt ? n.altValue : n.value,
        label: alt && "altLabel" in n ? n.altLabel : n.label,
        note: alt && "altNote" in n ? n.altNote : n.note,
        rank: i >= 0 ? i : order.length,
        folio,
        href,
        /* 시장 성과 = 라임(한계·기준 색과 같은 계열) / 내부 시스템 = 시안 */
        folioClass: system ? "text-system-ink" : "text-limit-ink",
        hoverClass: system
          ? "hover:border-system-ink focus-visible:border-system-ink"
          : "hover:border-signal-ink focus-visible:border-signal-ink",
        valueHover: system ? "group-hover:text-system-ink" : "group-hover:text-signal-ink",
      };
    })
    .sort((a, b) => a.rank - b.rank);
}

/* ═══════════════════ S3. BUILT BY ME — 직접 만든 것 ═══════════════════ */
/**
 * 콘텐츠 스튜디오 지원자의 "제작물 증거"라 지원 이유(S5)보다 앞에 둔다.
 * publicWork 2건을 맨 앞으로 끌어올렸다 — 살아 있는 외부 링크 2개가 이 페이지에서
 * 가장 검증 가능한 증거이고, 마스킹도 권리 문제도 없다.
 */
export function BuiltByMe() {
  /*
   * EDIT H 가 대표 사례로 올라간 판에서는 이 섹션의 풀 카드에서 빼고 한 줄 연결만 남긴다.
   * 자산 개수(8개)는 줄지 않는다 — 노출 형태만 바뀌므로 카운트도 그대로 쓴다.
   */
  const demoted = edition.spreadOrder.includes("edith");
  const publicWork = demoted
    ? publicWorkItems.filter((w) => !w.href.includes("edit-h-archive"))
    : publicWorkItems;
  const demotedPublicWork = demoted
    ? publicWorkItems.filter((w) => w.href.includes("edit-h-archive"))
    : [];

  return (
    <Section id="automation" tone="paper">
      <Container>
        <AnchorStub id="results" />
        {/* 이 섹션만 액센트가 시안이다 — 시장 성과가 아니라 조직에 남긴 자산이라는 뜻 */}
        {/*
          제목을 "개인 프로젝트 8건"에서 바꿨다. 회사 업무에서 쓰는 재고·정산·리포트
          자동화까지 취미 작업으로 읽히게 하는 표현이었다. 혼자 만들었다는 것과
          개인 프로젝트라는 것은 다르다 — 단독 기여라는 강점은 "직접 기획·구축"이
          그대로 담는다. 이력서(site.ts)가 이미 같은 표기를 써서 두 문서도 맞춰진다.
        */}
        <SectionHead
          kicker="Built by me"
          title="직접 기획·구축한 프로젝트 8건"
          count={EDITION === "general" ? "마케팅 오퍼레이션 · 업무 자동화 6 · 공개 프로젝트 2" : "업무 자동화 6 · 공개 프로젝트 2"}
          tone="system"
        />

        {EDITION === "general" ? (
          <div className="mt-6 border-b border-line pb-5">
            <p className="text-small text-ink-2">재고 확인, 정산, 리포트 등 업무별로 독립된 자동화 6종을 운영했습니다.</p>
            <figure className="final-workflow" aria-label="재고 자동화의 실행 순서">
              <figcaption>재고 자동화의 실행 순서</figcaption>
              <ol>
                {[
                  { title: "수집", note: "매체·재고 데이터" },
                  { title: "검수", note: "시점·범위·누락 확인" },
                  { title: "실행", note: "품절 중단·복구 재개" },
                  { title: "기록", note: "시트 기록·사후 QA" },
                ].map((step, index) => (
                  <li key={step.title} data-enter style={{ "--enter-delay": `${index * 70}ms` } as React.CSSProperties}>
                    <span className="final-workflow-number">{String(index + 1).padStart(2, "0")}</span>
                    <strong>{step.title}</strong>
                    <p>{step.note}</p>
                  </li>
                ))}
              </ol>
              <div className="final-workflow-footer">
                <p>검수 실패 → 광고 변경 0건으로 종료</p>
                {/* 공용판은 이 섹션이 /about/ 에 있고 시연은 홈에 있다 */}
                <a href={EDITION === "general" ? `${basePath}/#inventory-demo` : "#inventory-demo"} className="inline-flex min-h-[44px] items-center font-mono text-mono font-bold text-system underline underline-offset-4">재고 자동화 동작 보기 <span className="ml-2" aria-hidden="true">→</span></a>
              </div>
            </figure>
          </div>
        ) : null}

        {/*
          8개를 한 줄로 늘어놓으면 뒤로 갈수록 기능 목록처럼 읽힌다.
          도구가 아니라 "없앤 위험"으로 묶어서, 각 묶음 제목만 읽어도 무엇을 해결했는지
          알 수 있게 한다. 카드 내용과 개수(8개)는 그대로다 — 배열만 바꿨다.
        */}
        <div className="mt-10 flex flex-col gap-11">
          {builtGroups.map((group, gi) => {
            const systems = group.members
              .map((no) => automationCases.find((c) => c.no === no))
              .filter((c): c is (typeof automationCases)[number] => Boolean(c));
            const hasPublic = "withPublicWork" in group && group.withPublicWork;

            return (
              <div key={group.title}>
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-t-2 border-rule pt-4">
                  <p className="font-mono text-mono font-bold tracking-[0.02em] text-system">
                    {String(gi + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-h3">{group.title}</h3>
                  <p className="text-caption text-ink-3">{group.desc}</p>
                </div>

                <ul className={`mt-5 grid grid-cols-1 gap-6 md:grid-cols-2 ${EDITION === "general" && systems.length === 2 && !hasPublic ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
                  {systems.map((c, i) => (
                    <Reveal as="li" key={c.no} delay={i * 0.05}>
                      <article className="card-lift flex h-full min-h-[208px] flex-col border border-line-p bg-white p-6">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-mono font-bold text-ink-3">{c.no}</span>
                          {c.tools.slice(0, 3).map((t) => (
                            <Badge key={t}>{t}</Badge>
                          ))}
                        </div>
                        <h3 className="mt-3 text-h3">{c.name}</h3>
                        {/*
                          효과 줄이 숫자가 아닌 카드(S2·S3·S5·S6)는 효과가 자동화 문장을 다시 말하는
                          모양이라, 무엇이 문제였는지가 어디에도 없었다. 공용판에서만 "기존"을 먼저 싣는다.
                        */}
                        {EDITION === "general" ? (
                          <p className="mt-2 text-caption text-ink-3">
                            <span className="mr-1.5 font-mono text-mono font-bold text-ink-2">기존</span>
                            {c.problemShort ?? c.problem}
                          </p>
                        ) : null}
                        <p className="mt-2 text-small text-ink-2">{c.automated}</p>
                        <div className="mt-auto pt-4">
                          {/*
                           * "약 2시간 → 5분 이내 (내부 실측 기준)" 을 한 줄로 흘려보냈더니
                           * 좁은 단에서 괄호 안이 "…(내부 / 실측 기준)" 으로 쪼개졌다.
                           * 수치와 그 산출 기준은 성격이 다르니 줄을 나누고, 기준은 한 덩어리로
                           * 묶어 어떤 폭에서도 안에서 끊기지 않게 한다.
                           */}
                          {(() => {
                            const m = c.effect.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
                            const value = m ? m[1] : c.effect;
                            const basis = m ? m[2] : null;
                            return (
                              <>
                                <p className="tnum text-metric-sm text-ink">
                                  <span className="figure text-system">
                                    {/\d/.test(value) ? <CountUpValue value={value} delay={i * 70} duration={1000} className="count-up-prose" /> : value}
                                  </span>
                                  {/* 이 페이지의 유일한 각주 — S1 효과의 산출 기준을 밝힌다 */}
                                  {c.no === "S1" ? <FootnoteRef id="1" /> : null}
                                </p>
                                {basis ? (
                                  <p className="mt-1.5 whitespace-nowrap text-caption text-ink-3">
                                    {basis}
                                  </p>
                                ) : null}
                              </>
                            );
                          })()}
                          <p className="mt-3 border-t border-line pt-2.5 font-mono text-mono text-ink-3">
                            {c.quality}
                          </p>
                        </div>
                      </article>
                    </Reveal>
                  ))}

                  {hasPublic
                    ? publicWork.map((work, i) => (
                        <Reveal as="li" key={work.href} delay={(systems.length + i) * 0.05}>
                          <article className="card-lift flex h-full min-h-[208px] flex-col border border-line-p bg-white p-6">
                            <span className="font-mono text-mono font-bold text-system">공개 웹</span>
                            <h3 className="mt-3 text-h3">{work.title}</h3>
                            <p className="mt-2 text-small text-ink-2">{work.desc}</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                              {work.facts.map((f) => (
                                <Badge key={f}>{f}</Badge>
                              ))}
                            </div>
                            <a
                              href={work.href}
                              target="_blank"
                              rel="noopener"
                              className="group mt-auto inline-flex min-h-[44px] items-center gap-1.5 pt-4 text-small font-bold text-ink underline underline-offset-4 hover:text-accent"
                            >
                              {work.linkLabel}
                              <span className="nudge" aria-hidden="true">
                                ↗
                              </span>
                            </a>
                          </article>
                        </Reveal>
                      ))
                    : null}
                </ul>

                {/*
                  공개 웹은 카드 안에 링크만 있어서 "만들었다"는 주장으로만 남았다.
                  링크를 눌러 보는 사람은 많지 않으므로 화면을 지면 안에서 보여 준다.
                  카드가 3열이라 안에 넣으면 좁아, 그룹 아래 전체 폭으로 건다.
                */}
                {hasPublic
                  ? publicWork
                      .filter((w) => w.thumb)
                      .map((w) => (
                        <figure key={`${w.href}-thumb`} className="mt-8">
                          <a
                            href={w.href}
                            target="_blank"
                            rel="noopener"
                            className="block transition-opacity hover:opacity-90"
                          >
                            <img
                              {...evidenceSize(w.thumb!)}
                              src={`${basePath}/evidence/${w.thumb}`}
                              srcSet={
                                w.thumb960
                                  ? `${basePath}/evidence/${w.thumb960} 1x, ${basePath}/evidence/${w.thumb} 2x`
                                  : undefined
                              }
                              alt={w.thumbAlt ?? w.title}
                              loading="lazy"
                              className="h-auto w-full rounded-card border border-line-p"
                            />
                          </a>
                          {w.thumbCaption ? (
                            <figcaption className="mt-3 text-caption text-ink-3 sm:text-small">
                              {/*
                                증빙 캡션과 같은 방식으로 문장마다 줄을 나눈다 (2026.09.20)
                                이 캡션만 다섯 문장이 한 덩어리로 흘러, 1440px 에서 세 줄 중
                                두 줄이 문장 가운데에서 끊겼다("…알맞은 도구로 / 안내합니다").
                                뒤따르는 링크는 마지막 문장 다음 줄에 선다.
                              */}
                              {splitCaptionSentences(w.thumbCaption).map((sentence, i) => (
                                <span key={i} className={i === 0 ? "block" : "mt-1 block"}>
                                  {sentence}
                                </span>
                              ))}
                              <a
                                href={w.href}
                                target="_blank"
                                rel="noopener"
                                className="mt-1 inline-block font-semibold text-accent hover:underline"
                              >
                                {w.linkLabel} ↗
                              </a>
                            </figcaption>
                          ) : null}
                        </figure>
                      ))
                  : null}

                {/*
                  hll 판에서는 EDIT H 가 이미 대표 사례 CH.02 로 크게 나온다.
                  같은 작업물을 자동화 섹션에서 또 풀 카드로 펴면 같은 지표를 두 번 읽게 되므로,
                  여기서는 "편집 기준을 발행 시스템으로 만든 사례"라는 연결만 한 줄로 남긴다.
                  일반판은 EDIT H 가 스프레드가 아니라서 이 카드가 유일한 노출이므로 그대로 둔다.
                */}
                {hasPublic && demotedPublicWork.length ? (
                  <ul className="mt-4 flex flex-col gap-2 border-t border-line pt-4">
                    {demotedPublicWork.map((work) => (
                      <li key={work.href}>
                        <Link
                          href="/projects/edith/"
                          className="group inline-flex min-h-[44px] items-center gap-2 text-small text-ink-2 hover:text-accent"
                        >
                          <span className="font-mono text-mono font-bold text-system">
                            {work.label}
                          </span>
                          <span className="font-semibold underline underline-offset-4">
                            편집 기준을 발행 시스템으로 만든 사례 · {work.title}
                          </span>
                          <span className="nudge" aria-hidden="true">
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </div>

        {/*
          이 섹션의 카드는 "무엇을 자동화했는가"만 말한다. 각 시스템이 풀기 전의 문제와
          기존 수작업 방식은 케이스 페이지에 있는데, 여기서 그리로 가는 길이 없었다 —
          한참 위 '그 외 기록' 줄에서만 닿을 수 있었다.
        */}
        <Link
          href="/projects/automation/"
          className="mt-8 inline-flex min-h-[44px] items-center font-mono text-small font-bold text-ink underline underline-offset-4 hover:text-signal"
        >
          문제와 기존 방식까지 상세 보기 →
        </Link>

        <Footnotes
          className="mt-6"
          items={[
            {
              /* 히어로가 사람 소개로 바뀌면서 †1·†2(대표 수치 각주)가 사라졌다.
                 남은 각주가 †3 이면 읽는 사람이 앞의 두 개를 찾는다 — 번호를 앞으로 당긴다 */
              id: "1",
              text: "S1 효과는 내부 실측 기준입니다. MOP 공개 사례의 수작업 평균(약 3시간)은 출처가 달라 같은 범위로 묶지 않습니다.",
            },
          ]}
        />
      </Container>
    </Section>
  );
}

/* ═══════════════════ S4. HOW I WORK — 판단 3원칙 ═══════════════════ */
/* ═══════════════════ SKILLS & STACK ═══════════════════ */
/**
 * 이 섹션은 초기 버전에 있다가 리디자인 과정에서 통째로 사라졌었다.
 * 이력서 안에만 남아 있었는데, 채용 판단에서 "이 사람이 실제로 무엇을 다룰 수 있는가"는
 * 홈에서 답해야 하는 질문이라 되살린다.
 *
 * 다만 초기 버전의 평면 태그 나열로 돌아가지 않는다 — 설계/운영/활용 3단계를 유지한다.
 * 이 사이트가 기여도를 %로 쪼개 적는 것과 같은 규율이고, 도구 이름을 늘어놓는 것보다
 * "어디까지 내가 만들었는가"를 말하는 편이 훨씬 강하다.
 */
/*
 * 이 길이를 넘으면 태그가 아니라 설명으로 본다 — 근거는 아래 rows 렌더링 주석.
 * 26자는 `Kakao (비즈보드 · 모먼트 · 카탈로그)`(25자)까지 태그로 남기려고 고른 값이다.
 * 20자로 자르면 같은 "플랫폼 + 괄호 안 하위 상품" 형태인데 `Meta (Advantage+)`만
 * 태그로 남고 카카오는 설명으로 내려가, 한 줄에 태그가 하나만 뜨는 자리가 생겼다.
 */
const TAG_MAX_CHARS = 26;
/* 범례에 정의된 수행 범위 등급. 여기 없는 라벨(`언어`)은 분류이지 등급이 아니다. */
const LEVEL_LABELS = new Set<string>(skillLevels.map((l) => l.level));

/*
 * 공용판 SKILLS 네 영역을 첫 화면의 두 역량 아래로 묶는다 (2026.09.24).
 * 2열 격자의 윗줄(매체 운영 · 분석·측정)이 퍼포먼스 마케팅, 아랫줄(자동화·AX · 문서·협업·언어)이
 * 마케팅 오퍼레이션이다. 영역·항목·증빙은 한 글자도 바꾸지 않고 묶음 제목만 얹는다.
 * 표에 없는 영역은 첫 묶음으로 간다.
 */
const SKILL_CAPABILITY: Record<string, number> = {
  "매체 운영": 0,
  "분석 · 측정": 0,
  "자동화 · AX": 1,
  "문서 · 협업 · 언어": 1,
};
/* HOW I WORK 세 원칙이 어느 역량에 속하는지 — 01·02 는 측정·예산, 03 은 시스템 */


export function SkillsStack() {
  const skillBlocks =
    EDITION === "general"
      ? generalCover.capabilities.map((cap, ci) => ({
          key: cap.role,
          cap: cap as { role: string; line: string } | null,
          list: skills.filter((s) => (SKILL_CAPABILITY[s.category] ?? 0) === ci),
        }))
      : [{ key: "all", cap: null as { role: string; line: string } | null, list: skills }];
  return (
    <Section id="skills" tone="white">
      <Container>
        <SectionHead
          kicker="Skills & Stack"
          title="기획·운영 범위"
          count={EDITION === "general" ? `역량 ${generalCover.capabilities.length}개 · ${skills.length}개 영역` : `${skills.length}개 영역`}
        />

        {/* 단계 범례를 먼저 세운다 — 이게 없으면 그냥 도구 나열로 읽힌다 */}
        <dl className="mt-8 grid grid-cols-1 gap-x-8 gap-y-3 border-y border-line py-5 sm:grid-cols-2 xl:grid-cols-4">
          {skillLevels.map((l) => (
            <div key={l.level} className="flex items-baseline gap-3">
              <dt className="shrink-0 font-mono text-mono font-bold text-signal">{l.level}</dt>
              <dd className="text-caption leading-[1.6] text-ink-2">{l.desc}</dd>
            </div>
          ))}
        </dl>

        {skillBlocks.map((block) => (
        <div key={block.key} className={block.cap ? "mt-12" : "mt-10"}>
          {block.cap ? (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="text-[1.125rem] font-bold text-ink">{block.cap.role}</p>
              <p className="text-caption text-ink-3">{block.cap.line}</p>
            </div>
          ) : null}
          <div className={`${block.cap ? "mt-4 " : ""}grid grid-cols-1 gap-x-8 gap-y-10 md:grid-cols-2`}>
          {block.list.map((g, i) => (
            <Reveal key={g.category} delay={(i % 2) * 0.06}>
              <div className="border-t-2 border-rule pt-5">
                <h3 className="text-h3">{g.category}</h3>
                <dl className="mt-4 flex flex-col gap-4">
                  {g.rows.map((row) => {
                    /*
                      태그로 읽히는 것과 문장으로 읽히는 것을 갈라 둔다 (2026.09.20)
                      한 줄에 같은 테두리 상자로 늘어놓으니 폭이 40px(`당근`)에서
                      463px(`Google Ads (Search · GDN · …)`)까지 벌어져 행이 매번
                      다르게 끊겼고, 390px 에서는 절반 가까운 항목이 두 줄 상자가 됐다.
                      두 줄짜리 테두리 상자는 더 이상 태그로 읽히지 않는다.

                      기준은 길이 하나다 — TAG_MAX_CHARS 를 넘으면 태그가 아니라 설명이다.
                      항목 문구는 한 글자도 바꾸지 않고, 순서도 각 묶음 안에서 그대로 둔다.
                    */
                    const tags = row.items.filter((it) => [...it].length <= TAG_MAX_CHARS);
                    const statements = row.items.filter((it) => [...it].length > TAG_MAX_CHARS);
                    return (
                      <div key={row.level} className="grid grid-cols-[52px_minmax(0,1fr)] gap-x-4">
                        {/*
                          `언어` 는 수행 범위 등급이 아니라 분류다. 범례(설계·운영·활용·기초)와
                          같은 강조색을 쓰면 네 번째 등급처럼 읽혀 축이 섞인다.
                        */}
                        <dt
                          className={`font-mono text-mono font-bold ${
                            LEVEL_LABELS.has(row.level) ? "text-signal" : "text-ink-3"
                          }`}
                        >
                          {row.level}
                        </dt>
                        <dd>
                          {tags.length ? (
                            <ul className="flex flex-wrap gap-x-2 gap-y-1.5">
                              {tags.map((it) => (
                                <li
                                  key={it}
                                  className="border border-line px-2 py-0.5 font-mono text-mono text-ink-2"
                                >
                                  {it}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          {statements.length ? (
                            <ul className={`flex flex-col gap-1 ${tags.length ? "mt-2" : ""}`}>
                              {statements.map((it) => (
                                <li
                                  key={it}
                                  className="relative pl-3 font-mono text-mono leading-[1.65] text-ink-2"
                                >
                                  <span
                                    className="absolute left-0 top-[0.62em] h-[3px] w-[3px] rounded-full bg-line"
                                    aria-hidden="true"
                                  />
                                  {it}
                                </li>
                              ))}
                            </ul>
                          ) : null}
                          {row.note ? (
                            <p className="mt-2 font-mono text-mono text-ink-3">{row.note}</p>
                          ) : null}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
                {/*
                  스택 이름만 나열하면 "쓸 줄 안다"까지만 읽히고, 그 도구로 무엇을
                  만들었는지가 끊긴다. 영역마다 실제로 어디서 썼는지를 붙여
                  역량표에서 사례로 건너갈 수 있게 한다 — 전부 케이스에 이미 있는 사실이다.
                */}
                {g.proof?.length ? (
                  <div className="mt-4 border-t border-line pt-3.5">
                    {/*
                      한글 라벨의 자간을 좁힌다 (2026.09.20)
                      11px mono 에 0.14em 은 영문 키커 기준이라, 한글에서는 글자가 낱자로
                      떨어져 보였다. "그 외 기록"·"추가 운영 성과"는 이미 0.02em 이므로
                      같은 값으로 맞추고 크기만 12px 로 올린다. uppercase 는 한글에 무효.
                    */}
                    <p className="font-mono text-[0.75rem] font-bold tracking-[0.02em] text-ink-3">
                      실무 증빙
                    </p>
                    <ul className="mt-2 flex flex-col gap-1.5">
                      {g.proof.map((x) => (
                        <li key={x} className="relative pl-3.5 text-caption leading-[1.6] text-ink-2">
                          <span
                            className="absolute left-0 top-[0.6em] h-1 w-1 rounded-full bg-signal"
                            aria-hidden="true"
                          />
                          {x}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </Reveal>
          ))}
          </div>
        </div>
        ))}

        <div className="mt-10 border-t border-line pt-5">
          <p className="font-mono text-[0.6875rem] font-bold tracking-[0.18em] text-ink-3 uppercase">
            Certificates
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {certifications.map((c) => (
              <li
                key={c.name}
                className="border border-line px-2.5 py-1 font-mono text-mono text-ink-2"
              >
                {c.name}
                {c.when ? <span className="ml-2">· {c.when}</span> : null}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}

export function HowIWork() {
  return (
    <Section id="method" tone="ink">
      <Container>
        <AnchorStub id="expertise" />
        <SectionHead kicker="How I work" title={howIWork.title} count={EDITION === "general" ? "3단계" : "3원칙"} onDark />

        <ol className="mt-11 grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-0">
          {howIWork.items.map((item, i) => (
            <Reveal
              as="li"
              key={item.no}
              delay={i * 0.07}
              /* 스토리 섹션과 같은 버그였다 — gap-0 에 룰을 세우면서 오른쪽 여백을
                 안 줘서 가운데 칼럼 글이 다음 룰에 붙었다. 양쪽을 다 준다. */
              className={
                i === 0
                  ? "md:pr-8"
                  : i === howIWork.items.length - 1
                    ? "md:border-l md:border-rule-ink-2 md:pl-8"
                    : "md:border-l md:border-rule-ink-2 md:px-8"
              }
            >
              <p className="figure text-metric text-limit-ink" style={{ fontStretch: "115%", fontWeight: 800 }}>
                {item.no}
              </p>
              {EDITION === "general" ? (
                <p className="mt-2 text-caption font-bold tracking-wide text-on-ink-2">{item.stage}</p>
              ) : null}
              <h3 className="mt-2 text-h3 text-on-ink">{item.title}</h3>
              <p className="mt-3 text-body text-on-ink-2">{item.desc}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {item.outputs.map((o) => (
                  <span
                    key={o}
                    className="inline-flex items-center border border-rule-ink-2 px-2.5 py-1 font-mono text-mono text-on-ink-2"
                  >
                    {o}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1">
                {item.related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/projects/${r.slug}/`}
                    className="inline-flex min-h-[44px] items-center font-mono text-caption font-bold text-on-ink underline underline-offset-4 hover:text-signal-ink"
                  >
                    {r.label} →
                  </Link>
                ))}
              </div>
            </Reveal>
          ))}
        </ol>
      </Container>
    </Section>
  );
}

/* ═══════════════════ S4.5 MY STORY — 한 사람의 궤적 ═══════════════════ */
/**
 * 표지의 궤적 한 줄(산업디자인 → 창업 → 퍼포먼스 마케팅 → 자동화·AX)이 왜 한 사람의
 * 이야기인지를 여기서 편다.
 *
 * 이 섹션은 데이터(site.ts 의 story·careerBridge)로는 계속 존재했는데 리디자인 과정에서
 * 화면에서만 사라져 있었다. 이전 3개 버전은 모두 이 서사를 갖고 있었고, 그게 수치표와
 * 사람을 구분하는 유일한 지면이다 — 특히 콘텐츠를 만드는 조직에 내는 서류에서
 * "이 사람이 누구인가"가 없으면 남는 건 광고 계정 실적표뿐이다.
 *
 * 다만 예전처럼 연도·회사·수상명을 다시 나열하지 않는다(판권면이 이미 한다).
 * 각 구간이 지금의 일하는 방식에 무엇을 남겼는지만 쓰고, 마지막에 경험 → 강점으로 닫는다.
 */
export function MyStory() {
  const activeStory = edition.showWhyStudio ? hllStory : story;
  const activeCareerBridge = edition.showWhyStudio ? hllCareerBridge : careerBridge;

  if (edition.showWhyStudio) {
    return (
      <Section id="story" tone="white">
        <Container>
          <SectionHead
            kicker={activeStory.eyebrow}
            title={`${activeStory.title[0]} ${activeStory.title[1]}`}
            count={`${activeStory.phases.length}개의 축`}
          />
          <p className="mt-5 max-w-[52rem] text-body text-ink-2">{activeStory.desc}</p>

          <ol className="mt-9 grid grid-cols-1 gap-px border border-rule bg-rule md:grid-cols-2 lg:grid-cols-4">
            {activeStory.phases.map((phase, i) => {
              const bridge = activeCareerBridge[i];

              return (
                <Reveal
                  as="li"
                  key={phase.label}
                  delay={i * 0.06}
                  className="flex h-full flex-col bg-white p-6 sm:p-7"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <p className="font-mono text-[0.6875rem] font-bold tracking-[0.14em] text-signal uppercase">
                      {String(i + 1).padStart(2, "0")} · {phase.label}
                    </p>
                    <p className="font-mono text-mono text-ink-3">{bridge?.experience}</p>
                  </div>
                  <h3 className="mt-4 text-h3">{phase.title}</h3>
                  <p className="mt-3 text-small leading-[1.75] text-ink-2">{phase.body}</p>
                  {/* mb-6 은 지우지 않는다. 아래 "지금의 강점" 블록은 mt-auto 로 바닥에 붙는데,
                  칸을 꽉 채운 열에서는 auto 가 0 으로 붕괴해 태그가 구분선에 닿는다.
                  실제로 02 칸만 태그가 두 줄이라 거기서만 붙어 보였다. 최소 간격을 여기서 준다. */}
              <ul className="mt-4 mb-6 flex flex-wrap gap-1.5">
                    {phase.keywords.map((keyword) => (
                      <li
                        key={keyword}
                        className="border border-line px-2 py-0.5 font-mono text-mono text-ink-3"
                      >
                        {keyword}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto border-t border-line pt-5">
                    <p className="font-mono text-mono font-bold tracking-[0.06em] text-ink-3">
                      지금의 강점
                    </p>
                    <p className="mt-2 text-caption leading-[1.7] text-ink-2">{bridge?.strength}</p>
                  </div>
                </Reveal>
              );
            })}
          </ol>

          <p className="mt-8 max-w-[52rem] border-l-[3px] border-mark py-1 pl-5 text-body font-semibold text-ink">
            {activeStory.closing}
          </p>
        </Container>
      </Section>
    );
  }

  return (
    <Section id="story" tone="white">
      <Container>
        {/*
          01 단계의 장면 사진 (2026.09.24). 네 단계가 모두 글이라 "발표하고 공감을 얻는 일"이
          주장으로만 남았다. 제목 옆 오른쪽 칸에 한 장만 두고, 출처를 사진 바로 아래에 밝힌다.
          도입 문단 옆(아래 정렬)에 두면 왼쪽에 빈 칸이 크게 남아, 제목과 같은 룰에 맞춘다.
        */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-10">
          <div className="min-w-0">
            <SectionHead
              kicker={activeStory.eyebrow}
              title={`${activeStory.title[0]} ${activeStory.title[1]}`}
              count={`${activeStory.phases.length}단계`}
            />
            <p className="mt-5 max-w-[46rem] text-body text-ink-2">{activeStory.desc}</p>
          </div>
          <figure className="story-photo min-w-0 max-w-[28rem] lg:max-w-none lg:border-t lg:border-rule lg:pt-5">
            <img
              {...evidenceSize(story.photo.src)}
              src={`${basePath}/evidence/${story.photo.src}`}
              alt={story.photo.alt}
              loading="lazy"
              decoding="async"
              className="w-full border border-line"
            />
            <figcaption className="mt-2 text-caption leading-[1.55] text-ink-3">
              {story.photo.caption}
              <span className="mt-0.5 block font-mono text-mono">{story.photo.credit}</span>
            </figcaption>
          </figure>
        </div>

        <ol className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 lg:gap-0">
          {activeStory.phases.map((phase, i) => {
            const bridge = activeCareerBridge[i];

            return (
            <Reveal
              as="li"
              key={phase.label}
              delay={i * 0.06}
              /*
                gap-0 에 세로 룰을 세우는 배치라 양쪽 여백을 직접 줘야 한다.
                예전엔 i>0 에 pl-6 만 줘서 오른쪽 여백이 없었다 — 그 결과 02·03 칼럼의
                글이 다음 룰에 그대로 붙고 뒤 칼럼만 25px 떨어져, 룰이 한쪽으로 밀려
                보였다(실측: 첫 룰 24/25, 나머지 0/25).
                첫 칼럼은 오른쪽만, 마지막은 왼쪽만, 가운데는 양쪽에 준다.
              */
              className={
                "flex h-full flex-col " +
                (i === 0
                  ? "lg:pr-6"
                  : i === activeStory.phases.length - 1
                    ? "lg:border-l lg:border-line lg:pl-6"
                    : "lg:border-l lg:border-line lg:px-6")
              }
            >
              <p className="font-mono text-[0.6875rem] font-bold tracking-[0.14em] text-signal uppercase">
                {String(i + 1).padStart(2, "0")} · {phase.label}
              </p>
              <h3 className="mt-3 text-h3">{phase.title}</h3>
              <p className="mt-3 text-small leading-[1.75] text-ink-2">{phase.body}</p>
              {/* mb-6 은 지우지 않는다. 아래 "지금의 강점" 블록은 mt-auto 로 바닥에 붙는데,
                  칸을 꽉 채운 열에서는 auto 가 0 으로 붕괴해 태그가 구분선에 닿는다.
                  실제로 02 칸만 태그가 두 줄이라 거기서만 붙어 보였다. 최소 간격을 여기서 준다. */}
              <ul className="mt-4 mb-6 flex flex-wrap gap-1.5">
                {phase.keywords.map((k) => (
                  <li
                    key={k}
                    className="border border-line px-2 py-0.5 font-mono text-mono text-ink-3"
                  >
                    {k}
                  </li>
                ))}
              </ul>
              {/*
                경험 → 지금의 강점으로 닫는 줄. hll 판에만 있었고 일반판은 데이터
                (careerBridge)를 계산해 놓고 렌더하지 않았다. 그래서 이 섹션이 바로 위
                CreativeRoots 를 되풀이만 하고 결론을 내지 않는 지면으로 읽혔다.

                경험 표기를 hll 판처럼 상단 라벨 옆에 두지 않는다 — 일반판은 4열이
                232px(1024px 뷰포트)까지 좁아지는데, 거기에 라벨과 경험을 나란히 걸면
                "03 · Performance Marketing" 이 3줄로 접히고 "창업·콘텐츠 협업" 도 3줄이 된다.
                헤더가 짧은("지금의 강점") 하단 행에 붙이면 폭이 남고,
                "지금의 강점 ← 산업디자인" 이라는 읽는 순서도 그대로 살아난다.
              */}
              <div className="mt-auto border-t border-line pt-5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="font-mono text-mono font-bold tracking-[0.06em] text-ink-3">
                    지금의 강점
                  </p>
                  <p className="font-mono text-mono text-ink-3">{bridge?.experience}</p>
                </div>
                {/* 두 줄 높이를 확보한다 — 한 줄짜리 칸만 구분선이 아래로 밀려 네 칸의 선이 어긋났다 */}
                <p className="mt-2 text-caption leading-[1.7] text-ink-2 lg:min-h-[3.4em]">{bridge?.strength}</p>
              </div>
            </Reveal>
            );
          })}
        </ol>

        <p className="mt-10 max-w-[46rem] border-l-[3px] border-mark py-1 pl-5 text-body font-semibold text-ink">
          {activeStory.closing}
        </p>
      </Container>
    </Section>
  );
}

/* ═══════════════ S1.5 WHY — 표지 직후 한 화면 요약 ═══════════════ */
/**
 * 지원 이유 섹션을 특집 뒤(7번째→3번째)로 올렸지만, 특집 자체가 5,961px(6.6화면)라
 * 자연 스크롤 기준으로는 여전히 페이지의 51% 지점에서야 닿는다. 중간에서 덮은 사람은
 * 성과·데이터·자동화만 보고 "왜 이 팀인가"는 못 본 채 닫는다.
 *
 * 그래서 논거를 둘로 나눈다.
 *   여기(표지 직후) : 오면 무엇을 하는가 — 4단계와 그것을 증명하는 케이스
 *   #why-studio     : 왜 이 팀인가 산문 + FIRST 90 DAYS
 *
 * 새 문장을 만들지 않는다. whyStudioLululala.process 는 이미 이 내용으로 적혀 있는데
 * 어느 화면에서도 렌더되지 않던 죽은 데이터였다(FIRST 90 DAYS 와 같은 경우다).
 * 각 항목에 근거 케이스를 링크해 요약이 주장이 아니라 색인이 되게 한다.
 */
export function WhyLead() {
  return (
    <section className="border-b border-rule bg-paper">
      <Container>
        <div className="py-12 md:py-14">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            {/* "오면 무엇을 하는가"는 합류가 정해진 것처럼 읽힌다 —
                바이라인에서 "다음"을 "지원 역할"로 바꾼 것과 같은 이유로 톤을 맞춘다 */}
            <p className="font-mono text-[0.6875rem] font-bold tracking-[0.03em] text-ink-3">
              {/* 아래 '지원 이유' 섹션이 같은 eyebrow 를 쓴다 — 같은 라벨이 두 번
                  나오면 어느 쪽이 지원 이유인지 흐려지므로 이 섹션은 이름을 따로 갖는다 */}
              GROWTH APPROACH · 솔루션팀에서 맡을 수 있는 역할
            </p>
            <Link
              href="/#why-studio"
              className="group inline-flex min-h-[44px] items-center gap-2 font-mono text-mono font-bold text-ink underline underline-offset-4 hover:text-accent"
            >
              지원 이유와 90일 계획 <span aria-hidden="true">↓</span>
            </Link>
          </div>

          <ol className="mt-6 grid grid-cols-1 gap-x-8 gap-y-6 border-t border-rule pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyStudioLululala.process.map((step, i) => (
              <li key={step.title}>
                <p className="font-mono text-mono font-bold tracking-[0.12em] text-ink-3">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-1.5 text-small font-bold text-ink">{step.title}</p>
                <p className="mt-1.5 text-caption leading-[1.6] text-ink-2">{step.desc}</p>
                {/* 문장 안에 섞인 링크가 아니라 단독 링크라 터치 타깃 44px 을 지켜야 한다.
                    -my 로 시각적 여백은 그대로 두고 히트 영역만 넓힌다. */}
                <p className="mt-1.5 -mb-2.5 flex flex-wrap items-center gap-x-3">
                  {step.related.map((r) => (
                    <Link
                      key={r.slug}
                      href={`/projects/${r.slug}/`}
                      className="inline-flex min-h-[44px] items-center font-mono text-mono text-ink-3 underline underline-offset-4 hover:text-accent"
                    >
                      {r.label}
                    </Link>
                  ))}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

/* ═══════════════ S5. WHY STUDIO LULULALA — 에디터스 레터 ═══════════════ */
/** Why + First90Days + WhatsNext 세 섹션을 하나로 합쳤다. 이 지원의 유일한 차별점이다. */
export function WhyLululala() {
  const whyGroups = [
    {
      eyebrow: "WHY THIS PATH",
      title: "아이디어가 실제 반응으로 돌아오는 일을 선택했습니다.",
      paragraphs: whyStudioLululala.body.slice(0, 2),
    },
    {
      eyebrow: "WHY THIS TEAM",
      title: "좋은 콘텐츠가 더 멀리 가도록 다음 단계를 붙이고 싶습니다.",
      paragraphs: whyStudioLululala.body.slice(2),
    },
  ] as const;

  return (
    <Section id="why-studio" tone="paper">
      <Container>
        <AnchorStub id="next" />
        <AnchorStub id="first-90-days" />
        <SectionHead
          kicker={whyStudioLululala.eyebrow}
          title={`${whyStudioLululala.title[0]} ${whyStudioLululala.title[1]}`}
        />

        <blockquote className={`mt-9 max-w-[52rem] font-bold text-ink ${isV260908 ? "text-case-h" : "text-[1.375rem] leading-[1.35] sm:text-[2rem]"}`}>
          좋은 아이디어가 빠르게 세상에 나오고, 오래 살아남게 만드는 일을 하고 싶습니다.
        </blockquote>

        <div className="mt-9 grid grid-cols-1 border-y border-rule md:grid-cols-2">
          {whyGroups.map((group, groupIndex) => (
            <article
              key={group.eyebrow}
              className={
                groupIndex === 0
                  ? "py-7 md:pr-10"
                  : "border-t border-rule py-7 md:border-t-0 md:border-l md:pl-10"
              }
            >
              <p className="font-mono text-mono font-bold tracking-[0.08em] text-signal">
                {group.eyebrow}
              </p>
              <h3 className="mt-3 max-w-[28rem] text-h3 text-ink">{group.title}</h3>
              <div className="mt-5 flex flex-col gap-4">
                {group.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 20)} className="text-small leading-[1.8] text-ink-2">
                    {paragraph}
                  </p>
                ))}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="font-mono text-mono font-bold tracking-[0.08em] text-ink-3">
            ROLE FIT · 지금 바로 연결할 수 있는 역량
          </p>
          <p className="font-mono text-mono text-ink-3">검증 · 확장 · 연결</p>
        </div>
        <dl className="mt-4 grid grid-cols-1 gap-6 border-y border-rule py-6 md:grid-cols-3 md:gap-0">
          {hllRoleFit.map((item, i) => (
            <div
              key={item.label}
              className={i > 0 ? "md:border-l md:border-line md:pl-7 md:pr-5" : "md:pr-7"}
            >
              <dt className="font-mono text-mono font-bold tracking-[0.08em] text-signal">
                {item.label}
              </dt>
              <dd>
                <p className="mt-2 text-small font-bold text-ink">{item.title}</p>
                <p className="mt-2 text-caption leading-[1.7] text-ink-2">{item.desc}</p>
              </dd>
            </div>
          ))}
        </dl>

        {/* 여정 체인 — 마지막 노드가 첫 노드로 되돌아가는 순환 구조 */}
        <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
          <p className="font-mono text-mono font-bold tracking-[0.08em] text-ink-3">
            CONTENT GROWTH LOOP · 콘텐츠를 한 번의 게시물로 끝내지 않는 방식
          </p>
          <p className="font-mono text-mono text-ink-3">5단계 순환</p>
        </div>
        <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {whyStudioLululala.journey.map((node) => (
            <li
              key={node}
              className="border border-rule bg-white px-4 py-3 text-small font-semibold text-ink last:col-span-2 sm:last:col-span-1"
            >
              {node}
            </li>
          ))}
        </ol>
        <p className="mt-2.5 font-mono text-mono text-ink-3">
          {/* 체인의 마지막 노드와 이어져야 한다 — 노드를 "다음 콘텐츠"로 바꿨는데
              이 캡션이 "광고주 과제"로 남아 고리가 끊겨 있었다 */}
          ↺ 확장에서 얻은 반응이 다음 트렌드와 콘텐츠 실험의 출발점이 됩니다
        </p>

        {/* FIRST 90 DAYS — 코드에만 있고 화면엔 안 나오던 섹션을 여기서 살렸다 */}
        <div className="mt-12">
          <p className="font-mono text-[0.6875rem] font-bold tracking-[0.03em] text-ink-3">
            {first90Days.eyebrow} · {first90Days.title}
          </p>
          {/* 전제를 계획 위로 올린다. 아래에 작은 글씨로 두면 "석 달 만에 제작 조직에
              체크리스트를 배포하겠다"는 훈수가 헤드라인이 되고 배려가 각주가 된다. */}
          <p className="mt-3 max-w-[54rem] text-small font-semibold text-ink">
            {first90Days.closing}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-6 border-t border-rule pt-5 md:grid-cols-3 md:gap-8">
            {first90Days.phases.map((phase) => (
              <div key={phase.period}>
                <p className="font-mono text-mono font-bold tracking-[0.14em] text-ink">
                  {phase.period}
                </p>
                <p className="mt-2 text-small font-semibold text-ink">{phase.goal}</p>
                <ul className="mt-3 flex flex-col gap-1.5">
                  {phase.outputs.map((o) => (
                    <li key={o} className="relative pl-3 text-caption text-ink-2">
                      <span
                        className="absolute left-0 top-[0.66em] h-1 w-1 rounded-full bg-ink-3"
                        aria-hidden="true"
                      />
                      {o}
                    </li>
                  ))}
                </ul>
                {/* 완료 기준이 없으면 계획이 아니라 할 일 목록으로 읽힌다 */}
                <p className="mt-3 border-t border-line pt-2.5 font-mono text-mono leading-[1.6] text-signal">
                  완료 기준 · {phase.done}
                </p>
              </div>
            ))}
          </div>
          {/* 완료 기준이 구체적일수록 '약속'으로 읽히므로, 가설이라는 전제를 다시 못 박는다 */}
          <p className="mt-5 border-t border-rule pt-4 font-mono text-mono leading-[1.6] text-ink-3">
            {first90Days.caveat}
          </p>
        </div>

        <a
          href={whyStudioLululala.sourceHref}
          target="_blank"
          rel="noopener"
          className="mt-8 inline-flex min-h-[44px] items-center text-small font-bold text-ink underline underline-offset-4 hover:text-accent"
        >
          {whyStudioLululala.sourceLabel} ↗
        </a>
      </Container>
    </Section>
  );
}

/* ═══════════ S5-general. WHAT'S NEXT — 일반판의 마지막 장 ═══════════ */
/**
 * hll 판의 WhyLululala 자리를 그대로 대신한다(같은 지면 색·같은 밀도).
 * 일반판에는 지원 대상이 없으므로 "왜 이 팀인가" 대신 "다음에 무엇을 맡고 싶은가"로 닫는다.
 *
 * 핵심 장치는 해본 것 / 다음 역할에서 확장할 범위를 같은 크기로 나란히 두는 것이다.
 * 채용 쪽이 가장 알고 싶은 건 "어디까지 믿고 맡길 수 있는가"인데, 보통 서류는 그 경계를
 * 감춘다. 먼저 그어 두면 면접에서 검증할 지점이 분명해진다.
 */
export function WhatsNext() {
  return (
    <Section id="why-studio" tone="paper">
      <Container>
        <AnchorStub id="next" />
        <SectionHead
          kicker={whatsNext.eyebrow}
          title={`${whatsNext.title[0]} ${whatsNext.title[1]}`}
        />

        {/* 제목이 같은 말을 이미 하고 있어 인용 한 줄을 뺐다 — site.ts 의 whatsNext 주석 참고 */}
        <div className="mt-9 grid grid-cols-1 gap-8 md:grid-cols-3">
          {whatsNext.body.map((paragraph) => (
            <p key={paragraph.slice(0, 20)} className="text-body text-ink-2">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-8 border-t border-rule pt-6 md:grid-cols-2 md:gap-12">
          {whatsNext.scope.map((group, i) => (
            <div key={group.title} className={i > 0 ? "md:border-l md:border-line md:pl-10" : undefined}>
              <h3 className="font-mono text-mono font-bold tracking-[0.06em] text-signal">
                {group.title}
              </h3>
              <ul className="mt-4 flex flex-col gap-2.5">
                {group.items.map((item) => (
                  <li key={item} className="relative pl-3.5 text-small leading-[1.7] text-ink-2">
                    <span
                      className="absolute left-0 top-[0.72em] h-1 w-1 rounded-full bg-ink-3"
                      aria-hidden="true"
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="mt-10 max-w-[46rem] border-l-[3px] border-mark py-1 pl-5 text-body font-semibold text-ink">
          {whatsNext.caption.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </Container>
    </Section>
  );
}

/* ═══════════════════ S6. CREDITS — 판권면 ═══════════════════ */
/** Career + Trust + Contact 세 섹션을 한 장으로 대체하되 정보는 줄이지 않는다. */
export function Credits() {
  return (
    <Section id="career" tone="ink">
      <Container>
        <AnchorStub id="verification" />
        <AnchorStub id="summary" />
        {/* #story 스텁은 여기서 뺐다 — MyStory 섹션이 실제로 그 id 를 갖는다.
            같은 id 가 문서에 둘 있으면 목차·헤더 하이라이트가 먼저 만난 쪽으로 붙는다. */}
        <SectionHead kicker={`Credits · ${edition.issueLabel}`} title="경력과 수상 내역" onDark />

        <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-8">
          {/* 경력 */}
          <div>
            <p className="font-mono text-[0.6875rem] font-bold tracking-[0.18em] text-mark uppercase">
              Career
            </p>
            <ul className="mt-4">
              {career.map((c) => (
                <li key={c.company} className="border-b border-white/14 py-3.5 last:border-b-0">
                  <p className="font-mono text-mono text-on-dark">{c.period}</p>
                  <p className="mt-1 text-small font-bold text-white">
                    {c.company} · {c.title}
                  </p>
                  <p className="mt-1 text-mono leading-[1.5] text-on-dark">{c.highlight}</p>
                  {/* 이동 맥락. 데이터에만 있고 화면엔 없던 필드다 — 재직 기간을 보고 생기는
                      "왜 옮기려 하는가"라는 질문에 서류가 먼저 답하게 한다. */}
                  {/*
                    한 회사 안에서 담당이 실제로 넓어진 구간은 요약 한 줄로 덮이지 않는다 —
                    연도별로 무엇이 늘었는지 보여야 "3년 동안 비슷한 일"과 구분된다.
                  */}
                  {c.timeline?.length ? (
                    <ul className="mt-2.5 flex flex-col gap-1">
                      {c.timeline.map((t) => (
                        <li
                          key={t}
                          className="relative pl-3 text-mono leading-[1.55] text-on-dark before:absolute before:left-0 before:top-[0.62em] before:h-1 before:w-1 before:rounded-full before:bg-mark"
                        >
                          {t}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {c.ladder ? (
                    <p className="mt-2 border-l border-white/20 pl-2.5 text-mono leading-[1.5] text-white/64">
                      {c.ladder}
                    </p>
                  ) : null}
                  {!c.timeline?.length && !c.ladder ? (
                    <ul className="mt-2.5 flex flex-col gap-1">
                      {c.work.map((work) => (
                        <li
                          key={work}
                          className="relative pl-3 text-mono leading-[1.55] text-on-dark before:absolute before:left-0 before:top-[0.62em] before:h-1 before:w-1 before:rounded-full before:bg-mark"
                        >
                          {work}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {/* 학력 · 수상 · 자격 */}
          <div>
            <p className="font-mono text-[0.6875rem] font-bold tracking-[0.18em] text-mark uppercase">
              Education · Awards
            </p>
            <ul className="mt-4 flex flex-col gap-2.5">
              {education.map((e) => (
                <li key={e.school} className="text-mono leading-[1.5] text-on-dark">
                  <span className="font-bold text-white">{e.school}</span> · {e.major}
                </li>
              ))}
            </ul>
            <ul className="mt-4 flex flex-col gap-2.5 border-t border-white/14 pt-4">
              {awards.map((a) => (
                <li key={`${a.year}-${a.name}`} className="text-mono leading-[1.5] text-on-dark">
                  <span className="font-bold text-white">
                    {a.year} {a.name}
                  </span>{" "}
                  · {a.detail}
                </li>
              ))}
            </ul>
            {/*
              전체 수상·선정 이력. 이력서 안에만 있고 홈에는 대표 3건만 있었다 —
              창업·발명 시기 30여 회는 이 사람의 출발점을 설명하는 근거라 홈에서도 닿아야 한다.

              한동안 <details> 로 접어 뒀는데, 접힌 이력은 없는 이력이나 마찬가지다.
              읽는 쪽이 클릭해야만 보이는 것을 실적으로 셀 수는 없다.
              대표 3건과 무게가 같아 보이는 문제는 접어서가 아니라 위계로 푼다 —
              제목을 달아 '마케터 이전' 구간임을 밝히고, 연도를 왼쪽 열로 빼서
              위의 대표 이력과 다른 층위임을 배치로 보여준다.
            */}
            <div className="mt-4 border-t border-white/14 pt-4">
              <p className="flex items-baseline justify-between gap-3 font-mono text-mono font-bold text-white">
                <span>마케터 이전 수상·선정 이력</span>
                <span className="font-normal text-on-dark">{awardsArchive.length}개 구간</span>
              </p>
              <p className="mt-3 text-mono leading-[1.55] text-on-dark">{archiveLead}</p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {awardsArchive.map((a) => (
                  <li
                    key={a.year}
                    className="grid grid-cols-[4.5rem_1fr] gap-x-3 text-mono leading-[1.55] text-on-dark"
                  >
                    <span className="font-bold text-white">{a.year}</span>
                    <span>{a.items}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/*
              교육 수료 · 대외 활동 (2026.09.24). 수상만 있으면 "상을 받은 사람"으로만 읽히고,
              마케팅을 어디서 따로 배웠는지가 빠진다. 수상 아카이브와 같은 2열 배치로 둔다.
            */}
            <div className="mt-4 border-t border-white/14 pt-4">
              <p className="flex items-baseline justify-between gap-3 font-mono text-mono font-bold text-white">
                <span>교육·활동</span>
                <span className="font-normal text-on-dark">{activities.length}건</span>
              </p>
              <ul className="mt-3 flex flex-col gap-2.5">
                {activities.map((a) => (
                  <li
                    key={a.name}
                    className="grid grid-cols-[4.5rem_1fr] gap-x-3 text-mono leading-[1.55] text-on-dark"
                  >
                    <span className="font-bold text-white">{a.period}</span>
                    <span>
                      <span className="text-white">{a.name}</span> · {a.detail}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* 자격증은 SKILLS & STACK 의 CERTIFICATES 가 맡는다 —
                여기 두면 한 페이지에 같은 4개가 두 번 나온다 */}
          </div>

          {/* 외부 공개 기록 */}
          <div>
            <p className="font-mono text-[0.6875rem] font-bold tracking-[0.18em] text-mark uppercase">
              Public record
            </p>
            <ul className="mt-4 flex flex-col gap-4">
              {verification.map((v) => (
                <li key={v.title}>
                  <p className="text-small font-bold text-white">{v.title}</p>
                  <p className="mt-1 text-mono leading-[1.5] text-on-dark">{v.desc}</p>
                  {v.href || v.secondaryHref ? (
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
                      {v.href ? (
                        <a
                          href={v.href}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex min-h-[44px] items-center text-mono text-white underline underline-offset-4"
                        >
                          {v.label} ↗
                        </a>
                      ) : null}
                      {v.secondaryHref ? (
                        <a
                          href={v.secondaryHref}
                          target="_blank"
                          rel="noopener"
                          className="inline-flex min-h-[44px] items-center text-mono text-white underline underline-offset-4"
                        >
                          {v.secondaryLabel} ↗
                        </a>
                      ) : null}
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 컨택트 바 */}
        <div className="mt-14 flex flex-col gap-6 border-t border-rule-ink pt-8 md:flex-row md:items-end md:justify-between">
          <div>
            <AnchorStub id="contact" />
            {/* 위 세 열은 모두 라벨을 달고 있는데 이 자리만 없어서, 큰 이메일 주소가
                맥락 없이 튀어나왔다. 같은 형식의 라벨을 붙여 열의 하나로 읽히게 한다. */}
            <p className="font-mono text-[0.6875rem] font-bold tracking-[0.18em] text-mark uppercase">
              Contact
            </p>
            {/*
              공용판은 여기서 이야기를 닫는다 (2026.09.24). 전에는 사이트의 마지막 문장이 보안 안내였다 —
              같은 안내가 바로 아래 편집 원칙에 이미 있다. 이 두 줄은 site.ts contact.title 에 써 두고
              어느 화면에도 싣지 않던 문장이다. 아이디어 → 행동 → 팀의 자산은 표지의
              Design → Performance → Operations 와 같은 흐름이다.
            */}
            {isGeneralEdition ? (
              <p className="mt-3 text-[1.125rem] leading-[1.55] font-bold text-white sm:text-[1.375rem]">
                {contact.title.map((line) => (
                  <span key={line} className="block">{line}</span>
                ))}
              </p>
            ) : null}
            <EmailCopyButton
              email={site.emailPrimary}
              className={`mt-3 inline-flex min-h-[44px] items-center font-bold text-white underline decoration-1 underline-offset-[6px] ${isV260908 ? "text-metric-sm" : "text-[1.5rem] sm:text-[2rem]"}`}
            />
            {/* 사외 지원판에서는 보조 메일이 곧 사내 메일이라 싣지 않는다 */}
            {site.showWorkEmail ? (
              <p className="mt-2 text-caption text-on-dark">
                {site.emailSecondaryLabel}{" "}
                <EmailCopyButton
                  email={site.emailSecondary}
                  className="underline underline-offset-2 hover:text-white"
                />
              </p>
            ) : null}
            {isGeneralEdition ? null : (
              <p className="mt-1 text-caption text-on-dark">
                공개하지 않은 원본 자료는 보안 범위 안에서 인터뷰 때 설명드리겠습니다.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-3">
            {/* 브라우저에서 바로 읽히는 웹 이력서를 함께 둔다 — 사내망·모바일에서 보는
                담당자는 PDF 다운로드를 잘 누르지 않는다. 이전엔 헤더 버튼 하나뿐이었다. */}
            <Link
              href="/resume/"
              className="inline-flex min-h-[48px] items-center justify-center bg-on-ink px-6 font-mono text-[0.8125rem] font-bold text-ink hover:bg-signal-ink"
            >
              이력서 웹으로 보기
            </Link>
            <a
              href={`${basePath}${site.resumePdfPath}`}
              download
              className="inline-flex min-h-[48px] items-center justify-center border border-rule-ink px-6 font-mono text-[0.8125rem] font-bold text-on-ink hover:border-signal-ink hover:text-signal-ink"
            >
              이력서 PDF
            </a>
            {isGeneralEdition ? (
              <a
                href={`${basePath}${edition.portfolioPdfPath}`}
                download
                className="inline-flex min-h-[48px] items-center justify-center border border-signal-ink px-6 font-mono text-[0.8125rem] font-bold text-signal-ink hover:bg-signal-ink hover:text-ink"
                aria-label="김선일 퍼포먼스 마케팅 포트폴리오 PDF 다운로드"
              >
                포트폴리오 PDF
              </a>
            ) : null}
            <a
              href={site.linkedin}
              target="_blank"
              rel="noopener"
              className="inline-flex min-h-[48px] items-center justify-center border border-rule-ink px-6 font-mono text-[0.8125rem] font-bold text-on-ink hover:border-signal-ink hover:text-signal-ink"
            >
              LinkedIn
            </a>
          </div>
        </div>

        {/*
          편집 기준(구 Data Policy). 표지에서 여기로 내렸다.
          첫 화면에서는 아직 아무 수치도 안 본 사람에게 "저는 이렇게 정직합니다"를 먼저 말하는
          꼴이라 방어적으로 읽혔다. 판권면은 각주·기여 범위·'미측정' 표기를 이미 다 보고 내려온
          자리라, 같은 문장이 주장이 아니라 앞에서 본 것의 설명으로 읽힌다.
          잡지에서 편집 기준이 판권면에 있는 이유와 같다.
        */}
        <div className="mt-14 border-t border-rule-ink pt-6">
          <p className="font-mono text-[0.6875rem] font-bold tracking-[0.18em] text-limit-ink uppercase">
            Editorial standard
          </p>
          <ul className="mt-3 grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
            {hero.dataPolicy.map((rule) => (
              <li key={rule} className="text-mono leading-[1.55] text-on-dark">
                {rule}
              </li>
            ))}
          </ul>
        </div>

        <p className="mt-10 font-mono text-[0.6875rem] text-white/50">
          {edition.issueLabel} · 김선일 개인 포트폴리오 · 광고주 비공개 데이터 미게재 · {isGeneralLike ? "2026.09" : "2026.08"}
        </p>
      </Container>
    </Section>
  );
}
