import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { CTAButton } from "@/components/ui";
import { OG_VERSION } from "@/data/edition";
import { langAlternates } from "@/data/en/alternates";
import { otherBrands, otherResults, projects, solutionOrder } from "@/data/projects";
import {
  activities,
  awards,
  awardsArchive,
  career,
  careerLength,
  careerNarrative,
  careerSummary,
  certifications,
  education,
  educationCaption,
  publicWork,
  site,
  skills,
  skillLevels,
  verification,
} from "@/data/site";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 공개판 경력기술서.
 *
 * 국내 채용은 여전히 PDF 제출이 기본이고, 대기업 폐쇄망에서는 포트폴리오 URL 자체가
 * 열리지 않는 경우가 많다. 그래서 사이트 데이터를 단일 소스로 두고 이 페이지를 파생시킨다.
 * Ctrl+P(⌘+P)로 그대로 A4 PDF가 된다.
 *
 * 포함: 경력 · 프로젝트 · 기여 범위 · 성과 · 학력 · 스킬 · 자격 · 수상
 * 제외: 전화번호 · 주소 · 생년월일 · 연봉  ← 전화번호 포함 원본은 메일 요청으로만 전달한다
 */

const resumeDescription = `${site.role} ${site.name}의 이력서 및 경력기술서. 경력·담당 프로젝트·기여 범위·성과·학력·자격·수상.`;

/* 이 페이지는 흰 지면으로 시작하므로 루트의 어두운 theme-color 를 되돌린다 */
export const viewport: Viewport = { themeColor: "#ffffff" };

export const metadata: Metadata = {
  title: "이력서",
  description: resumeDescription,
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  alternates: langAlternates("resume/", "en/resume/"),
  openGraph: {
    title: `${site.name} 이력서 | ${site.role}`,
    description: resumeDescription,
    url: "resume/",
    images: [{ url: `og-image.png?v=${OG_VERSION}`, width: 1200, height: 630, alt: `${site.name} 공개 이력서` }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} 이력서 | ${site.role}`,
    description: resumeDescription,
    images: [`og-image.png?v=${OG_VERSION}`],
  },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-t border-line-2 py-3 sm:grid-cols-[112px_1fr] sm:gap-5">
      <dt className="text-caption font-semibold text-ink-3">{label}</dt>
      <dd className="text-caption sm:text-small">{children}</dd>
    </div>
  );
}

function H2({ children, breakBefore = false }: { children: React.ReactNode; breakBefore?: boolean }) {
  return (
    <h2
      className={`mt-10 border-b-2 border-ink pb-2 text-[1.0625rem] font-bold tracking-normal sm:text-[1.25rem]${
        breakBefore ? " print-break-before" : ""
      }`}
    >
      {children}
    </h2>
  );
}

const resumeMetricLabels: Record<string, string[]> = {
  // 대표값은 홈 카드와 같은 동영상 CTR(리포트 원문 있음). 107,600 뒤에는 맥락(유료 구독 전환 104,257건)이 따라온다
  dyson: ["동영상 광고 CTR", "YouTube 구독자", "구독 전환 (매체 집계)"],
  jestina: ["GA4 ROAS", "GA4 전환매출", "매체 ROAS"],
  daekyo: ["CVR", "CPA", "CTR"],
  // 검수본 이력서 PDF가 싣는 두 항목(점검 시간 · 데이터 이상 시)을 포함한다
  newbalance: ["재고·운영 점검 시간", "데이터 이상 시", "리포트 수기 작성"],
};

export default function ResumePage() {
  const bySolutionOrder = (a: (typeof projects)[number], b: (typeof projects)[number]) =>
    solutionOrder.indexOf(a.slug) - solutionOrder.indexOf(b.slug);
  const featuredProjects = projects.filter((p) => p.tier === "featured").sort(bySolutionOrder);
  const supportingProjects = projects.filter((p) => p.tier === "supporting").sort(bySolutionOrder);

  return (
    <article className="resume-page pt-[104px] pb-24 sm:pt-[128px]">
      {/*
        Container 를 쓰지 않는다. Container 는 자기 max-w-[1240px] 를 먼저 붙이는데,
        같은 속성의 Tailwind 클래스 둘이 한 요소에 있으면 class 속성의 순서가 아니라
        CSS 파일 안의 순서로 이긴다. 그래서 여기 적어 둔 max-w-[860px] 가 조용히 졌고,
        이력서 본문이 1240px 로 그려져 한 줄이 89자까지 늘어났다(한글은 35~45자가 읽기 좋다).
        폭을 여기서 직접 잡아 의도한 860px 로 되돌린다.
      */}
      <div className="mx-auto w-full max-w-[860px] px-5 sm:px-10">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="-ml-2 inline-flex min-h-[44px] items-center px-2 text-caption font-semibold text-accent hover:underline"
          >
            ← 포트폴리오로 돌아가기
          </Link>
          <CTAButton href={`${basePath}${site.resumePdfPath}`} download className="min-h-[44px] px-4 text-caption">
            PDF 다운로드
          </CTAButton>
        </div>

        {/* 표제부 */}
        <header className="mt-6 border-b-2 border-ink pb-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-caption font-semibold tracking-[0.02em] text-accent">
                이력서 · 경력기술서
              </p>
              <h1 className="mt-3 text-[1.75rem] font-bold tracking-normal sm:text-[2.25rem]">
                {site.name}
                <span className="ml-3 text-small font-normal text-ink-3">{site.nameEn}</span>
              </h1>
              <p className="mt-3 text-small text-ink-2 sm:text-body">
                {site.role} · {site.org} · 퍼포먼스 마케팅 경력 {careerLength()}
              </p>
              <p className="mt-2 text-caption text-ink-3">
                {/* 사외 지원판에서는 사내 메일을 싣지 않는다 */}
                {site.showWorkEmail ? `${site.emailWork} · ` : ""}
                {site.email} ·{" "}
                <a href={site.linkedin} target="_blank" rel="noopener" className="text-accent">
                  LinkedIn
                </a>{" "}
                ·{" "}
                <a href={site.url} className="text-accent">
                  {site.url.replace("https://", "")}
                </a>
              </p>
              <p className="mt-3 max-w-[38rem] text-caption font-normal text-ink-2 sm:text-small">
                {careerSummary.intro}
              </p>
            </div>
            <img
              src={`${basePath}${site.profileImagePath}`}
              alt="김선일 프로필 사진"
              width={88}
              height={104}
              className="h-[104px] w-[88px] shrink-0 rounded-card border border-line object-cover object-top"
            />
          </div>
          <p className="no-print mt-4 text-caption text-ink-3">
            상세 연락처와 경력 증빙은{" "}
            <a href={site.resumeMailto} className="font-normal text-accent underline underline-offset-2">
              메일로 요청
            </a>
            {" "}시 제공합니다.
          </p>
        </header>

        {/*
          자기소개.
          역량 요약 표부터 시작하면 "무엇을 할 줄 아는가"는 빨리 읽히지만
          "어떤 사람인가"가 남지 않는다. 근거는 아래 경력·프로젝트에 그대로 있고
          여기서 새로 주장하는 것은 없다.
        */}
        <H2>자기소개</H2>
        <div className="mt-4 flex max-w-[46rem] flex-col gap-2.5">
          {careerNarrative.map((para) => (
            <p key={para.slice(0, 18)} className="text-caption leading-[1.75] text-ink-2 sm:text-small">
              {para}
            </p>
          ))}
        </div>

        {/* 핵심 역량 요약 — 국내 경력기술서는 첫 장에 요약이 온다 */}
        <H2>핵심 역량 요약</H2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {careerSummary.columns.map((c) => (
            <div key={c.title}>
              <h3 className="text-small font-bold">{c.title}</h3>
              <ul className="mt-2 flex flex-col gap-1">
                {c.items.map((it) => (
                  <li key={it} className="relative pl-3 text-caption text-ink-2">
                    <span className="absolute left-0 top-[0.62em] h-1 w-1 rounded-full bg-accent" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <ul className="mt-5 flex flex-col gap-2">
          {careerSummary.highlights.map((h) => (
            <li key={h.slug} className="flex gap-3 text-caption sm:text-small">
              <span className="shrink-0 font-semibold text-accent">[{h.axis}]</span>
              <span className="text-ink-2">{h.body}</span>
            </li>
          ))}
        </ul>

        {/* 경력 */}
        <H2>경력</H2>
        {career.map((c) => (
          <section key={c.company} className="print-avoid mt-6">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-small font-bold sm:text-body">
                {c.company}
                {c.group ? <span className="ml-2 text-caption text-ink-3">{c.group}</span> : null}
              </h3>
              <p className="tnum text-caption text-ink-3">{c.period}</p>
            </div>
            <p className="mt-1 text-caption font-normal text-accent">{c.title}</p>
            <p className="mt-2 text-caption text-ink-2 sm:text-small">{c.summary}</p>
            <ul className="mt-3 flex flex-col gap-1.5">
              {c.work.map((w) => (
                <li key={w} className="relative pl-3 text-caption text-ink-2">
                  <span className="absolute left-0 top-[0.62em] h-1 w-1 rounded-full bg-ink-3" />
                  {w}
                </li>
              ))}
            </ul>
            <dl className="mt-3">
              <Row label="주요 광고주">{c.clients}</Row>
              <Row label="대표 성과">
                <span className="font-semibold text-up">{c.highlight}</span>
              </Row>
            </dl>
          </section>
        ))}

        {/* 대표 프로젝트 */}
        <H2>대표 프로젝트</H2>
        <p className="mt-3 text-caption text-ink-3">
          <span className="block">기여 범위와 검증 가능성 순으로 배치했습니다.</span>
          <span className="block">상세 근거는 포트폴리오 사이트의 각 케이스 페이지에 있습니다.</span>
        </p>
        {featuredProjects.map((p) => (
          <section key={p.slug} className="print-avoid mt-6 border-t border-line pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              {/* 리드 문장이 "상세 근거는 케이스 페이지에 있습니다"라고 안내하면서
                  정작 이력서에서 케이스로 가는 링크가 하나도 없었다 — 브랜드명을 링크로 만든다 */}
              <h3 className="text-small font-bold sm:text-body">
                <Link href={`/projects/${p.slug}/`} className="hover:text-accent">
                  {p.brand}
                </Link>
                <span className="ml-2 text-caption font-normal text-ink-3">{p.industry}</span>
              </h3>
              <p className="tnum text-caption text-ink-3">{p.period}</p>
            </div>
            {/* 네댓 줄짜리 요약이라 pretty 로는 마지막 줄이 안 잡힌다 —
                1024px 에서 다이슨 요약의 "…개선됐습니다."가 혼자 떨어졌다 */}
            <p className="mt-2 text-caption text-balance text-ink-2 sm:text-small">{p.tldr}</p>
            <dl className="mt-3">
              <Row label="역할">
                {p.role} · 기여 범위{" "}
                <strong className="font-semibold">
                  {p.contributionNote ?? `${p.contribution}%`}
                </strong>
              </Row>
              <Row label={p.contextLabel ?? "담당 채널"}>{p.channels.join(" · ")}</Row>
              <Row label="근거 형태">{p.evidenceLabel}</Row>
              <Row label="성과">
                <ul className="flex flex-col gap-1">
                  {p.detail.results
                    .filter((m) => resumeMetricLabels[p.slug]?.includes(m.label))
                    .slice(0, 3)
                    .map((m) => (
                      <li key={m.label}>
                        {m.label}{" "}
                        <strong className="tnum font-semibold text-up">
                          {m.before && m.before !== "기준" ? `${m.before} → ` : ""}
                          {m.after}
                        </strong>
                        {m.note ? <span className="ml-1 text-ink-3">· {m.note}</span> : null}
                      </li>
                    ))}
                </ul>
              </Row>
            </dl>
          </section>
        ))}

        <H2>확장 역량</H2>
        <p className="mt-3 text-caption text-ink-3">
          집계 기준을 정합시킨 단독 운영 사례와, 반복 가능한 운영 시스템 경험입니다.
        </p>
        <dl className="mt-4">
          {supportingProjects.map((p) => (
            <Row key={p.slug} label={p.brand}>
              <strong className="font-semibold">{p.role}</strong>
              <span className="ml-2 text-ink-3">
                · {p.contributionNote ?? `기여도 ${p.contribution}%`} · {p.evidenceLabel}
              </span>
              <span className="mt-1 block text-ink-2">{p.objective}</span>
            </Row>
          ))}
        </dl>

        {/*
         * "30여 개 브랜드"를 홈·이력서 세 곳에서 주장하는데 화면에서 확인되는 브랜드는
         * 8~9개뿐이었다. 검증된 대표 지표를 하나씩 붙여 목록과 숫자가 맞물리게 한다.
         * 새 수치는 없고 otherResults·brands에 이미 있던 값을 옮긴 것이다.
         */}
        <H2>그 외 운영 브랜드</H2>
        <p className="mt-3 text-caption text-ink-3">
          <span className="block">아래 실적은 각 브랜드 운영 리포트 기준이며, 집계 범위가 서로 다릅니다.</span>
          <span className="block">운영 기간은 담당 브랜드별 통합본 기준이고, 월 단위가 확인되지 않은 브랜드는 비워 뒀습니다.</span>
        </p>
        <dl className="mt-4">
          {otherResults.map((r) => (
            <Row key={r.brand} label={r.brand}>
              <span className="text-ink-3">
                {r.category}
                {r.period ? ` · ${r.period}` : ""}
              </span>
              <span className="mt-1 block text-ink-2">{r.summary}</span>
              <span className="mt-1 block">
                {r.metrics.map((m, i) => (
                  <span key={m.label}>
                    {i > 0 ? " · " : ""}
                    <span className="text-ink-3">{m.label}</span>{" "}
                    <strong className="font-semibold">{m.value}</strong>
                  </span>
                ))}
              </span>
            </Row>
          ))}
        </dl>
        <p className="mt-3 text-caption text-ink-3">
          그 밖에 {otherBrands.join(" · ")} 등 9개 산업군 30여 개 브랜드의 운영·분석 경험이 있습니다.
        </p>

        <H2>공개 작업물</H2>
        <div className="no-print mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {publicWork.map((work) => (
            <article key={work.href} className="rounded-card border border-line p-4">
              <p className="text-caption font-semibold text-accent">{work.label}</p>
              <h3 className="mt-1 text-small font-bold">{work.title}</h3>
              <p className="mt-2 text-caption text-ink-2">{work.desc}</p>
              <p className="mt-2 text-caption text-ink-3">{work.facts.join(" · ")}</p>
              <a
                href={work.href}
                target="_blank"
                rel="noopener"
                className="no-print mt-3 inline-flex text-caption font-semibold text-accent hover:underline"
              >
                공개 작업물 보기 ↗
              </a>
            </article>
          ))}
        </div>
        <ul className="print-only mt-3 flex flex-col gap-1">
          {publicWork.map((work) => (
            <li key={work.href} className="text-caption text-ink-2">
              <strong className="font-semibold">{work.title}</strong> · {work.facts.join(" · ")}
            </li>
          ))}
        </ul>

        {/*
          보유 역량
          인쇄에서 여기부터 새 장으로 넘긴다. 그대로 두면 마지막 장에 학력·자격·수상만
          남아 3/4이 백지로 나왔다 — 첨부 문서로는 미완성으로 보인다.
          globals.css 의 .print-break-before 가 정의만 돼 있고 쓰이는 곳이 없었다.
        */}
        <H2 breakBefore>보유 역량</H2>
        {/*
         * 등급 정의를 표 위에 먼저 쓴다. 상/중/하나 별점 대신 "직접 수행 범위"로 나눈 게
         * 이 이력서에서 가장 정직한 표기인데, 정의가 화면에 없으면 그냥 임의 분류로 읽힌다.
         * site.ts에 데이터는 있었지만 렌더되는 곳이 없었다.
         */}
        <p className="mt-2 text-caption leading-[1.7] text-ink-3">
          {skillLevels.map((l, i) => (
            <span key={l.level}>
              {i > 0 ? " · " : ""}
              <span className="font-semibold text-ink-2">{l.level}</span> — {l.desc}
            </span>
          ))}
        </p>
        <dl className="no-print mt-4">
          {skills.map((g) => (
            <div key={g.category} className="border-t border-line-2 py-3">
              <dt className="text-caption font-bold">{g.category}</dt>
              <dd className="mt-2 flex flex-col gap-2">
                {g.rows.map((r) => (
                  <div
                    key={`${r.level}-${r.items.join("|")}`}
                    className="grid grid-cols-[52px_1fr] gap-3"
                  >
                    <span className="text-caption font-semibold text-accent">{r.level}</span>
                    <span className="text-caption text-ink-2">
                      {r.items.join(" · ")}
                      {r.note ? <span data-prose className="mt-1 block text-ink-3">{r.note}</span> : null}
                    </span>
                  </div>
                ))}
              </dd>
            </div>
          ))}
        </dl>
        {/*
         * 인쇄본에서도 레벨을 나눠 찍는다. 이전엔 flatMap으로 한 줄에 합쳐서, 직접 설계한 것과
         * "코드 작성 보조"로 써본 것이 PDF에서 같은 급으로 나열됐다 — 자기평가 형용사를 쓰지
         * 않겠다는 이 이력서의 원칙이 인쇄본에서만 무너지고 있었다.
         */}
        <div className="print-only mt-3">
          {skills.map((g) => (
            <div key={g.category} className="mt-1.5">
              <p className="text-caption font-semibold text-ink">{g.category}</p>
              {g.rows.map((r) => (
                <p key={`${r.level}-${r.items.join("|")}`} className="text-caption text-ink-2">
                  <strong className="mr-1.5 font-semibold">{r.level}</strong>
                  {r.items.join(" · ")}
                  {r.note ? <span className="text-ink-3"> — <span data-prose>{r.note}</span></span> : null}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* 학력 */}
        <H2>학력</H2>
        <dl className="no-print mt-4">
          {education.map((e) => (
            <Row key={e.school + e.period} label={e.period}>
              <strong className="font-semibold">{e.school}</strong>
              <span className="ml-2 text-ink-3">{e.major}</span>
            </Row>
          ))}
        </dl>
        <p className="no-print mt-3 text-caption text-ink-3">{educationCaption}</p>
        <p className="print-only mt-3 text-caption text-ink-2">
          {education.map((e) => `${e.period} ${e.school} ${e.major}`).join(" / ")}
        </p>

        {/* 자격 */}
        <H2>자격</H2>
        <ul className="no-print mt-4 flex flex-col gap-1.5">
          {certifications.map((c) => (
            <li key={c.name} className="text-caption text-ink-2">
              {c.name}
              {c.when ? <span className="ml-2 text-ink-3">· {c.when}</span> : null}
            </li>
          ))}
        </ul>
        <p className="print-only mt-3 text-caption text-ink-2">
          {certifications.map((c) => `${c.name}${c.when ? ` (${c.when})` : ""}`).join(" · ")}
        </p>
        <p className="print-only mt-2 text-caption text-ink-2">
          <strong className="mr-2 font-semibold text-ink">수상 · 선정</strong>
          {awards.map((a) => `${a.year} ${a.name} (${a.detail})`).join(" / ")}
        </p>
        {/*
          인쇄본에도 전체 이력을 싣는다. 화면에서는 접혀 있었고 인쇄본에는 아예 빠져 있어서,
          지원 서류로 나가는 PDF 에만 30여 회 수상이 통째로 없는 상태였다.
          지면이 한정된 인쇄본이라 화면처럼 연도별 행으로 풀지 않고 한 문단으로 잇는다.
        */}
        <p className="print-only mt-2 text-caption text-ink-2">
          <strong className="mr-2 font-semibold text-ink">마케터 이전</strong>
          {awardsArchive.map((a) => `${a.year} ${a.items}`).join(" / ")}
        </p>
        <p className="print-only mt-2 text-caption text-ink-2">
          <strong className="mr-2 font-semibold text-ink">교육 · 활동</strong>
          {activities.map((a) => `${a.period} ${a.name} (${a.detail})`).join(" / ")}
        </p>

        {/* 수상 */}
        <div className="no-print">
          <H2>수상 · 선정</H2>
          <dl className="mt-4">
            {awards.map((a) => (
              <Row key={`${a.year}-${a.name}`} label={a.year}>
                <strong className="font-semibold">{a.name}</strong>
                <span className="ml-2 text-ink-3">{a.detail}</span>
              </Row>
            ))}
          </dl>
        </div>

        {/*
          접어 두지 않는다 — 클릭해야 보이는 이력은 없는 이력이나 마찬가지다.
          위의 대표 수상과 섞이지 않도록 제목으로 구간만 구분한다.
        */}
        <div className="no-print mt-6">
          <H2>마케터 이전 수상 · 선정</H2>
          <dl className="mt-4">
            {awardsArchive.map((a) => (
              <Row key={a.year} label={a.year}>
                {a.items}
              </Row>
            ))}
          </dl>
        </div>

        {/* 교육 수료 · 대외 활동 (2026.09.24) — 사이트 경력과 수상 칸과 같은 데이터 */}
        <div className="no-print mt-6">
          <H2>교육 · 활동</H2>
          <dl className="mt-4">
            {activities.map((a) => (
              <Row key={a.name} label={a.period}>
                <strong className="font-semibold">{a.name}</strong>
                <span className="ml-2 text-ink-3">{a.detail}</span>
              </Row>
            ))}
          </dl>
        </div>

        {/*
          외부에서 확인 가능한 근거.
          수상 이력은 적어 두기만 하면 확인할 길이 없다. 홈에는 검증 링크를 두고
          정작 서류로 나가는 PDF 에는 없었다 — 인쇄본에도 URL 을 글자로 남긴다.
        */}
        <div className="print-avoid mt-10 border-t border-line pt-5">
          <p className="text-caption font-semibold text-ink">외부 확인 자료</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {/* href 가 없는 항목은 인쇄본에서 확인할 길이 없으니 싣지 않는다 */}
            {verification
              .filter((v): v is typeof v & { href: string } => Boolean(v.href))
              .map((v) => (
                <li key={v.href} className="text-caption leading-[1.6] text-ink-2">
                  <span className="font-semibold text-ink">{v.title}</span>
                  <span className="mx-1.5 text-ink-3">·</span>
                  <a href={v.href} target="_blank" rel="noopener" className="break-all text-accent">
                    {v.href.replace(/^https?:\/\/(www\.)?/, "")}
                  </a>
                </li>
              ))}
          </ul>
        </div>

        <p className="mt-6 border-t border-line pt-5 text-caption text-ink-3">
          <span className="block">모든 수치는 GA4·매체 리포트·운영 로그 기준이며, 광고주 데이터 보안상 공개할 수 없는 값은 비율로 표기했습니다.</span>
          <span className="block">기여 범위는 내부 역할표·설계 문서·운영 로그를 기준으로 구분했습니다.</span>
        </p>
      </div>
    </article>
  );
}
