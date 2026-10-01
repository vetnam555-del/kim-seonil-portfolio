import type { CSSProperties } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import AutomationArchitecture from "@/components/AutomationArchitecture";
import { Bars, canChart } from "@/components/Bars";
import { Reveal } from "@/components/motion";
import { CTAButton, Container, Eyebrow, isIndexDelta, MetricDelta, Tag } from "@/components/ui";
import { EDITION, edition } from "@/data/edition";
import { hero } from "@/data/site";
import { caseLedes } from "@/data/caseLedes";
import { caseCards } from "@/data/caseCards";
import { caseCardsEn } from "@/data/en/caseCards.en";
import { caseLedesEn } from "@/data/en/caseLedes.en";
import { getNextProjectEn, getProjectEn } from "@/data/en/projects.en";
import { caseLabels, jestinaPrimaryLabels, preferredInlineLabels, type CaseLabels, type Lang } from "@/data/i18n/caseLabels";
import { evidenceSize } from "@/lib/evidence-size";
import {
  getNextProject,
  getProject,
  type Evidence,
  type Project,
  type SchematicTone,
} from "@/data/projects";

/** GitHub Pages 하위경로 배포용 — next.config.ts 의 basePath 와 같은 값. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function evidenceId(file: string) {
  return `evidence-${file.replace(/\.[^.]+$/, "")}`;
}

function EvidenceFigure({ evidence, eager = false, t }: { evidence: Evidence; eager?: boolean; t: CaseLabels }) {
  const img = (
    <img
      {...evidenceSize(evidence.file)}
      src={`${basePath}/evidence/${evidence.file}`}
      srcSet={
        evidence.file960
          ? `${basePath}/evidence/${evidence.file960} 1x, ${basePath}/evidence/${evidence.file} 2x`
          : undefined
      }
      alt={evidence.alt}
      loading={eager ? "eager" : "lazy"}
      className={
        eager
          ? "h-full w-full rounded-card object-contain"
          : "h-auto w-full rounded-card border border-line bg-bg-alt"
      }
    />
  );
  /*
   * 첫 화면(LCP 후보)인 eager 이미지만 aspect-ratio 박스로 감싼다 — 실제 픽셀 크기를
   * 몰라도 레이아웃 공간을 먼저 확보해 이미지 로드 시 CLS를 막는다. object-contain을
   * 써서 실제 비율이 16:10과 달라도 잘리지 않고 그대로 보인다(빈 여백은 감수한다).
   */
  /*
   * 영상 소재는 정지 컷으로 대신할 수 없다 — 무엇이 움직였는지가 이 소재의 내용이다.
   * 자동재생은 쓰지 않는다. 포스터가 깔린 채로 있다가 누르면 재생되므로
   * 페이지를 훑는 동안에는 지면이 조용하고, 동작 최소화 설정과도 부딪히지 않는다.
   * 세로 9:16 소재가 704px 폭을 다 쓰면 한 화면을 통째로 먹어서 높이로 묶어 둔다.
   */
  const video = evidence.video ? (
    <video
      src={`${basePath}/evidence/${evidence.video}`}
      poster={`${basePath}/evidence/${evidence.file}`}
      controls
      muted
      loop
      playsInline
      preload="metadata"
      aria-label={evidence.alt}
      className="mx-auto max-h-[32rem] w-auto max-w-full rounded-card border border-line bg-bg-alt"
    />
  ) : null;

  const media = video ?? (eager ? (
    <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-bg-alt">
      {img}
    </div>
  ) : (
    img
  ));

  /*
   * 증빙 중에는 소재별 성과표처럼 글자가 촘촘한 것이 있다. 이 자리는 넓어야 704px 이고
   * 모바일에서는 330px 남짓이라 표의 소재명과 지표가 읽히지 않는다.
   * 라이트박스를 새로 만드는 대신 원본 파일을 새 탭으로 연다 — 자바스크립트가 필요 없고,
   * 모바일에서는 브라우저 기본 이미지 뷰어가 확대까지 처리한다.
   * 이미지 확대와 외부 원문은 별도 링크로 제공한다.
   */
  const fullSrc = `${basePath}/evidence/${evidence.file}`;

  return (
    <figure id={evidenceId(evidence.file)} className={`${EDITION === "general" ? "evidence-inline scroll-mt-4" : "scroll-mt-28"} ${evidence.wide ? "" : "max-w-[52rem]"}`}>
      {evidence.title ? (
        <div className="mb-4">
          <h4 className="text-[1.125rem] font-bold leading-[1.5] text-ink">{evidence.title}</h4>
          {evidence.role ? <p className="mt-2 text-small text-ink-2">{t.roleScope}{evidence.role}</p> : null}
        </div>
      ) : null}
      {/* 영상은 감싸지 않는다 — 재생 버튼을 누르면 링크가 먼저 먹어 새 탭이 열린다 */}
      {video ? (
        media
      ) : (
        <a
          href={fullSrc}
          target="_blank"
          rel="noopener"
          aria-label={`${evidence.alt} — ${t.openFull}`}
          className="block transition-opacity hover:opacity-90"
        >
          {media}
        </a>
      )}
      <figcaption className="mt-3 text-small leading-[1.75] text-ink-2">
        <p>{evidence.caption}</p>
        <a
          href={video ? `${basePath}/evidence/${evidence.video}` : fullSrc}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2 inline-flex min-h-[44px] items-center font-semibold text-accent underline underline-offset-4"
          aria-label={`${video ? t.openVideo : t.openFull} · ${evidence.alt} ${t.newTab}`}
        >
          {video ? `${t.openVideo} ↗` : `${t.openFull} ↗`}
        </a>
        {evidence.href ? (
          <a href={evidence.href} target="_blank" rel="noopener noreferrer"
            className="ml-5 mt-2 inline-flex min-h-[44px] items-center font-semibold text-accent underline underline-offset-4"
            aria-label={`${t.openSource} · ${evidence.alt} ${t.newTab}`}>
            {t.openSource} ↗
          </a>
        ) : null}
      </figcaption>
      {evidence.callouts?.length ? (
        /*
         * 한 페이지에 증빙이 둘 이상이면 이 목록도 둘 이상이 된다(제이에스티나가 2개다).
         * 라벨이 전부 "이미지에서 확인할 항목"이면 목록끼리 구분이 안 된다 —
         * 어느 이미지의 항목인지 alt 를 붙여 이름을 갈라 준다.
         */
        <ul
          className="mt-3 flex flex-col gap-1.5 rounded-card border border-line bg-white px-4 py-3"
          aria-label={`${t.calloutsAria} — ${evidence.alt ?? evidence.caption}`}
        >
          {evidence.callouts.map((callout) => (
            <li key={callout} className="relative pl-4 text-caption text-ink-2 sm:text-small">
              <span className="absolute left-0 top-[0.62em] h-1 w-1 rounded-full bg-accent" />
              {callout}
            </li>
          ))}
        </ul>
      ) : null}
    </figure>
  );
}

/** 등급별 서술 밀도는 달라도 모든 블록의 시각 규칙은 같게 유지한다. */
function Block({
  id,
  no,
  label,
  lede,
  children,
}: {
  id?: string;
  no: string;
  label: string;
  /** 이 단의 요지 한 줄 — 이름표만으로는 흐름이 안 읽혀서 더한다(caseLedes.ts). */
  lede?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal>
      <section
        id={id}
        className="grid scroll-mt-[136px] grid-cols-1 gap-4 border-t border-line py-9 md:grid-cols-[160px_1fr] md:gap-10 md:py-11"
      >
        <div>
          <p className="font-mono text-mono font-bold tracking-[0.08em] text-ink-3">{no}</p>
          <h2 className="mt-1.5 text-[1.375rem] leading-[1.28] font-black tracking-[-0.015em] md:text-[1.625rem]">
            {label}
          </h2>
        </div>
        <div className="min-w-0 max-w-[44rem]">
          {lede ? <p className="case-lede">{lede}</p> : null}
          {children}
        </div>
      </section>
    </Reveal>
  );
}

function CaseFlowNav({ items, ariaLabel }: { items: { id: string; no: string; label: string }[]; ariaLabel: string }) {
  return (
    <nav
      aria-label={ariaLabel}
      className="relative sticky top-[72px] z-30 -mx-5 border-y border-line bg-white/95 px-5 backdrop-blur-md sm:-mx-8 sm:px-8"
    >
      <ol className="no-scrollbar mx-auto flex max-w-[1120px] gap-1 overflow-x-auto py-2">
        {items.map((item) => (
          <li key={item.id} className="shrink-0">
            <a
              href={`#${item.id}`}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-card px-3 text-caption font-semibold text-ink-3 transition-colors hover:bg-accent-soft hover:text-accent"
            >
              <span className="tnum text-accent">{item.no}</span>
              {item.label}
            </a>
          </li>
        ))}
      </ol>
      <span
        className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white via-white/90 to-transparent sm:hidden"
        aria-hidden="true"
      />
    </nav>
  );
}

function ExecutionList({ items }: { items: string[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => (
        <li key={item} className="relative pl-5 text-body text-ink-2">
          <span className="absolute left-0 top-[0.7em] h-1.5 w-1.5 rounded-full bg-accent" />
          {item}
        </li>
      ))}
    </ul>
  );
}

function RoleDetails({ project, detail, t }: { project: Project; detail: Project["detail"]; t: CaseLabels }) {
  return (
    <>
      <p className="text-body text-ink-2">{detail.contribution}</p>
      {detail.roleBreakdown ? (
        <div className="mt-7 grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line md:grid-cols-3">
          {[
            { k: t.roleDirect, v: detail.roleBreakdown.direct, accent: true },
            { k: t.roleShared, v: detail.roleBreakdown.shared },
            { k: t.roleNot, v: detail.roleBreakdown.notDone },
          ]
            /*
              항목이 없는 열은 그리지 않는다. EDIT H 는 단독 작업이라 '함께 수행'이 빈 배열인데,
              그대로 두면 제목만 있고 목록이 비어 있는 카드가 나와 데이터가 빠진 것처럼 보였다.
            */
            .filter((column) => column.v.length > 0)
            .map((column) => (
            <div key={column.k} className="h-full bg-white p-5">
              <p className={`text-caption font-semibold ${column.accent ? "text-accent" : "text-ink-3"}`}>
                {column.k}
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {column.v.map((item) => (
                  <li key={item} className="relative pl-3 text-caption text-ink-2">
                    <span className="absolute left-0 top-[0.62em] h-1 w-1 rounded-full bg-line" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
      <p className="mt-5 inline-flex flex-wrap items-baseline gap-2 rounded-card bg-accent-soft px-4 py-2">
        <span className="text-caption text-ink-3">{t.contribution}</span>
        <span className="text-small font-semibold text-accent">
          {project.contributionNote ?? `${project.contribution}%`}
        </span>
      </p>
    </>
  );
}

function LearningDetails({ detail, t }: { detail: Project["detail"]; t: CaseLabels }) {
  return detail.failure ? (
    <>
      <div>
        <p className="text-caption font-semibold text-ink-3">{t.failed}</p>
        <p className="mt-2 text-body text-ink-2">{detail.failure}</p>
      </div>
      <div className="mt-7 border-t border-line-2 pt-6">
        {/* "다음에 다르게 할 것"이었다 (2026.09.25). 아홉 사례 모두 이 칸에 과거형 교훈을 적어 라벨과 내용이 어긋났다 — 블록 이름(실패와 배운 것)에 맞춘다 */}
        <p className="text-caption font-semibold text-ink-3">{t.learned}</p>
        <p className="mt-2 text-body text-ink-2">{detail.learnings}</p>
      </div>
    </>
  ) : (
    <p className="text-body text-ink-2">{detail.learnings}</p>
  );
}

function EvidenceGallery({ evidence, className = "", t }: { evidence: Evidence[]; className?: string; t: CaseLabels }) {
  if (!evidence.length) return null;
  const groups = new Map<string, Evidence[]>();
  for (const item of evidence) {
    const group = item.group ?? "";
    groups.set(group, [...(groups.get(group) ?? []), item]);
  }
  return (
        <div className={`flex flex-col gap-12 ${className}`}>
          {[...groups].map(([group, items]) => (
            <section key={group} aria-label={group || t.evidenceGroupAria}>
              {group ? <h3 className="mb-6 border-t border-line pt-4 text-small font-bold text-accent">{group}</h3> : null}
              <div className="flex flex-col gap-10">
                {items.map((item) => <EvidenceFigure key={item.file} evidence={item} t={t} />)}
              </div>
            </section>
          ))}
        </div>
  );
}

function EvidenceDetails({
  detail,
  evidence,
  relocated = [],
  t,
}: {
  detail: Project["detail"];
  evidence: Evidence[];
  relocated?: Evidence[];
  t: CaseLabels;
}) {
  return (
    <>
      {relocated.length ? (
        <ul className="mb-8 grid grid-cols-1 border-t border-line sm:grid-cols-2" aria-label={t.relocatedAria}>
          {relocated.map((item, index) => (
            <li key={item.file} className="border-b border-line sm:pr-6">
              <a href={`#${evidenceId(item.file)}`} className="flex min-h-[44px] items-start gap-3 py-3 text-small text-accent hover:underline">
                <span className="font-mono text-mono">{String(index + 1).padStart(2, "0")}</span>
                <span>{item.title ?? item.alt.split(/—|\.(?=\s|$)/)[0].trim()}</span>
              </a>
            </li>
          ))}
        </ul>
      ) : null}
      <EvidenceGallery evidence={evidence} t={t} />
      {detail.evidenceLinks?.length ? (
        <ul className={`${evidence.length ? "mt-8" : ""} flex flex-col gap-3`}>
          {detail.evidenceLinks.map((item) => (
            <li key={item.href} className="rounded-card border border-line bg-bg-alt p-5">
              <a
                href={item.href}
                target="_blank"
                rel="noopener"
                className="inline-flex min-h-[32px] items-center font-semibold text-accent hover:underline"
              >
                {item.title} ↗
              </a>
              <p className="mt-2 text-caption text-ink-3 sm:text-small">{item.note}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {evidence.length || relocated.length ? (
        <p className="mt-6 text-caption text-ink-3">
          {t.evidenceFootnote}
        </p>
      ) : null}
      {detail.evidenceNote ? (
        <p className="mt-6 text-caption text-ink-3 sm:text-small">{detail.evidenceNote}</p>
      ) : null}
    </>
  );
}

/**
 * 도식 타일의 톤. 채도를 낮게 잡는다 — 이건 데이터가 아니라 배치 구조라서,
 * 실제 수치에 쓰는 액센트(시그널 레드·시스템 시안)와 같은 세기로 보이면 안 된다.
 */
const SCHEMATIC_TONE: Record<SchematicTone, string> = {
  dup: "bg-[repeating-linear-gradient(45deg,#e8e3d6,#e8e3d6_4px,#f4f1e9_4px,#f4f1e9_8px)]",
  plain: "bg-bone",
  air: "bg-[#cdd8e8]",
  hair: "bg-[#f0d9a8]",
  clean: "bg-[#cfe0d2]",
};

function ProjectFrameworks({ detail, skipKpi = false, t }: { detail: Project["detail"]; skipKpi?: boolean; t: CaseLabels }) {
  /* KPI 표를 KPI 설계 블록으로 올린 판에서는 실행 블록에서 같은 표를 다시 그리지 않는다 */
  const frameworks = (detail.frameworks ?? []).filter((f) => !(skipKpi && f.kpi) && !f.placement);
  if (!frameworks.length) return null;

  const open = frameworks.filter((f) => !f.collapsed);
  const folded = frameworks.filter((f) => f.collapsed);

  return (
    <div className="mt-9 flex flex-col gap-8 border-t border-line-2 pt-8">
      {open.map((framework) => (
        <FrameworkBlock key={framework.title} framework={framework} t={t} />
      ))}

      {/*
        실행 전 기획안은 접어 둔다. 다이슨 상세가 실측 성과와 기획안을 합쳐 10블록까지
        늘어나면서 정작 성과가 기획에 파묻혔다. 성격이 다른 것을 접는 것이지 숨기는 게 아니라서,
        요약에 몇 건인지와 무엇인지를 적어 둔다.
      */}
      {folded.length ? (
        <details className="overflow-hidden rounded-card border border-line">
          <summary className="flex min-h-[52px] cursor-pointer flex-wrap items-center justify-between gap-3 bg-bg-alt px-5 text-small font-semibold text-ink">
            {t.foldedSummary}
            <span className="font-mono text-mono font-normal text-ink-3">{t.count(folded.length)}</span>
          </summary>
          <div className="flex flex-col gap-8 border-t border-line px-5 py-6">
            {folded.map((framework) => (
              <FrameworkBlock key={framework.title} framework={framework} t={t} />
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

/** 판단·확인·결과를 그린 도식 — 해당 블록 본문 바로 아래에 둔다 (2026.09.25) */
function PlacedFrameworks({ detail, placement, t }: { detail: Project["detail"]; placement: "strategy" | "analysis" | "results"; t: CaseLabels }) {
  const frameworks = (detail.frameworks ?? []).filter((f) => f.placement === placement);
  if (!frameworks.length) return null;
  return (
    <div className="mt-8 flex flex-col gap-8">
      {frameworks.map((framework) => (
        <FrameworkBlock key={framework.title} framework={framework} t={t} />
      ))}
    </div>
  );
}

function FrameworkBlock({
  framework,
  t,
}: {
  framework: NonNullable<Project["detail"]["frameworks"]>[number];
  t: CaseLabels;
}) {
  return (
        <section aria-label={framework.title}>
          <h3 className="text-small font-semibold text-ink">{framework.title}</h3>
          {framework.description ? (
            <p className="mt-2 text-caption text-ink-3 sm:text-small">{framework.description}</p>
          ) : null}

          {framework.variant === "table" && framework.columns && framework.rows ? (
            <div className="mt-5">
              <p className="mb-2 text-caption text-ink-3 sm:hidden">
                {t.tableScrollHint}
              </p>
              {/*
                이 표는 min-width 620px 이라 좁은 화면에서 가로로 스크롤된다.
                스크롤되는 영역은 키보드로도 스크롤할 수 있어야 하므로 tabIndex 를 주고,
                탭이 멈추는 자리에 이름이 없으면 "그룹"으로만 읽히므로 role/aria-label 을 함께 준다.
                안내 문구는 sm:hidden 이라 데스크톱에서는 보이지 않는다.
              */}
              <div
                className="no-scrollbar overflow-x-auto rounded-card border border-line"
                role="region"
                aria-label={t.tableAria(framework.title)}
                tabIndex={0}
              >
                <table className="w-full min-w-[620px] border-collapse text-left">
                {/*
                  caption 이 없으면 이 표에 접근 가능한 이름이 아예 없다 —
                  표 단위로 훑는 사용자에게는 "행 5개인 표"로만 들린다.
                  화면에는 이미 h3 로 제목이 있으므로 sr-only 로 둔다.
                */}
                <caption className="sr-only">{framework.title}</caption>
                <thead className="bg-bg-alt">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-caption font-semibold text-ink-3">
                      {framework.rowHeader ?? t.defaultRowHeader}
                    </th>
                    {framework.columns.map((column) => (
                      <th scope="col" key={column} className="px-4 py-3 text-caption font-semibold text-ink-3">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {framework.rows.map((row) => (
                    <tr key={row.label} className="border-t border-line-2">
                      {/* 행 머리글에도 scope 를 준다 — 열·행 머리글이 함께 있는 표에서는 추측에 맡기면 안 된다 */}
                      <th scope="row" className="px-4 py-4 text-caption font-semibold text-ink sm:text-small">{row.label}</th>
                      {row.cells.map((cell, index) => (
                        <td key={`${row.label}-${index}`} className="px-4 py-4 text-caption text-ink-2 sm:text-small">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
                </table>
              </div>
              {framework.legend ? (
                <p className="mt-3 text-caption text-ink-3">{framework.legend}</p>
              ) : null}
            </div>
          ) : null}

          {framework.variant === "flow" && framework.items ? (
            <>
              <ol className={`mt-5 grid grid-cols-1 gap-3 ${framework.items.length > 3 ? "sm:grid-cols-2 lg:grid-cols-5" : "md:grid-cols-3"}`}>
                {framework.items.map((item, index) => (
                  <li
                    key={item.label}
                    className={`min-h-[112px] border-t-2 bg-bg-alt p-4 ${
                      item.state === "designed" ? "border-dashed border-ink-3" : "border-solid border-accent"
                    }`}
                  >
                    <p className="tnum text-caption font-semibold text-accent">{String(index + 1).padStart(2, "0")}</p>
                    <p className="mt-2 text-small font-semibold text-ink">{item.label}</p>
                    {item.body ? <p className="mt-2 text-caption text-ink-2">{item.body}</p> : null}
                  </li>
                ))}
              </ol>
              {framework.legend ? <p className="mt-3 text-caption text-ink-3">{framework.legend}</p> : null}
            </>
          ) : null}

          {framework.variant === "schematic" && framework.schematic ? (
            <>
              <div className="mt-5 grid grid-cols-1 gap-7 md:grid-cols-2">
                {framework.schematic.columns.map((col) => (
                  <div key={col.title}>
                    <h4 className="font-mono text-mono font-bold tracking-[0.02em] text-ink-3">
                      {col.title}
                    </h4>
                    <div className="mt-3 border border-line bg-white p-4">
                      {col.rows.map((row) => (
                        <div key={row.cap} className="mb-3.5 last:mb-0">
                          {/*
                            0.625rem(10px)이었다. 이 사이트에서 유일하게 이 값만 쓰이던
                            자리이고, 도식의 각 줄이 무엇인지 알려 주는 유일한 글자라
                            실제로 읽어야 하는 정보다. 바로 아래 col.note 가 이미 쓰는
                            text-mono(0.75rem)로 맞춘다 — 새 크기를 만들지 않는다.
                          */}
                          <p className="mb-1.5 font-mono text-mono text-ink-3">{row.cap}</p>
                          <div className="flex gap-1.5" aria-hidden="true">
                            {row.tiles.map((tone, ti) => (
                              <span
                                key={`${row.cap}-${ti}`}
                                className={`h-9 flex-1 border border-line ${SCHEMATIC_TONE[tone]}`}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="mt-2.5 font-mono text-mono leading-[1.6] text-ink-3">{col.note}</p>
                  </div>
                ))}
              </div>
              <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                {framework.schematic.legend.map((l) => (
                  <li
                    key={l.tone}
                    className="flex items-center gap-2 font-mono text-mono text-ink-3"
                  >
                    <span
                      className={`inline-block h-2.5 w-3.5 border border-line ${SCHEMATIC_TONE[l.tone]}`}
                      aria-hidden="true"
                    />
                    {l.label}
                  </li>
                ))}
              </ul>
              {framework.legend ? (
                <p className="mt-3 text-caption text-ink-3">{framework.legend}</p>
              ) : null}
            </>
          ) : null}

          {/*
            덱의 화살표 흐름을 옮긴 것 (2026.09.25). 순서가 곧 판단이라 번호 카드보다
            화살표가 맞다. 뒤로 갈수록 진해져 마지막 단계가 결론임을 보인다.
          */}
          {framework.variant === "steps" && framework.items ? (
            <>
              <ol className="case-steps mt-5" data-enter="steps">
                {framework.items.map((item, index) => (
                  <li key={item.label} className="case-step" data-step={index} style={{ "--i": index } as CSSProperties}>
                    <p className="case-step-head">
                      <span className="sr-only">{t.stepSr(index + 1)}</span>
                      {item.label}
                    </p>
                    {item.body ? <p className="case-step-body">{item.body}</p> : null}
                  </li>
                ))}
              </ol>
              {framework.legend ? <p className="mt-4 text-caption text-ink-3">{framework.legend}</p> : null}
            </>
          ) : null}

          {/* 한 합계를 두 갈래로 나눠 읽는 도식 (2026.09.25) — 판단에 쓰는 갈래만 강조한다 */}
          {framework.variant === "split" && framework.split ? (
            <>
              <div className="case-split mt-5" data-enter="split">
                <p className="case-split-total">
                  <strong>{framework.split.total.label}</strong>
                  <span>{framework.split.total.note}</span>
                </p>
                <ul className="case-split-parts">
                  {framework.split.parts.map((part, pi) => (
                    <li key={part.label} className={part.accent ? "is-accent" : undefined} style={{ "--i": pi } as CSSProperties}>
                      <strong>{part.label}</strong>
                      <span>{part.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {framework.legend ? <p className="mt-4 text-caption text-ink-3">{framework.legend}</p> : null}
            </>
          ) : null}

          {/* 두 대상의 같은 지표를 막대로 나란히 (2026.09.25). 좋은 쪽만 액센트로 칠한다 */}
          {framework.variant === "compare" && framework.compare ? (
            <>
              <div className="case-compare mt-5" data-enter="compare">
                {framework.compare.map((group) => {
                  const values = group.items.map((item) => item.value);
                  const max = Math.max(...values);
                  const best = group.better === "high" ? max : Math.min(...values);
                  return (
                    <div key={group.metric} className="case-compare-group">
                      <p className="case-compare-metric">
                        {group.metric}
                        <span>{group.better === "high" ? t.compareHigh : t.compareLow}</span>
                      </p>
                      <ul>
                        {group.items.map((item, ii) => (
                          <li key={item.name} className={item.value === best ? "is-best" : undefined} style={{ "--i": ii } as CSSProperties}>
                            <span className="case-compare-name">{item.name}</span>
                            <span className="case-compare-bar" aria-hidden="true">
                              <span style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }} />
                            </span>
                            <b className="tnum">{item.display}</b>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
              {framework.legend ? <p className="mt-4 text-caption text-ink-3">{framework.legend}</p> : null}
            </>
          ) : null}

          {framework.variant === "diagnostic" && framework.items ? (
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-3">
              {framework.items.map((item, index) => (
                <div key={item.label} className="border-t-2 border-ink pt-4">
                  <p className="tnum text-caption font-semibold text-accent">0{index + 1}</p>
                  <h4 className="mt-2 text-small font-semibold text-ink">{item.label}</h4>
                  {item.bullets ? (
                    <ul className="mt-3 flex flex-col gap-2">
                      {item.bullets.map((bullet) => (
                        <li key={bullet} className="relative pl-4 text-caption text-ink-2 sm:text-small">
                          <span className="absolute left-0 top-[0.62em] h-1 w-1 rounded-full bg-accent" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </section>
  );
}

/**
 * 공용판 KPI 설계 블록 (2026.09.14).
 * 운영 기간에 실제로 쓴 KPI 표(kpi: true)가 있으면 그 표를 그대로 올리고,
 * 없으면 결과를 읽는 단계(detail.kpi)를 같은 표 형식으로 편다. 새 수치는 만들지 않는다.
 */
function KpiDesign({ project, detail, t }: { project: Project; detail: Project["detail"]; t: CaseLabels }) {
  const tables = (detail.frameworks ?? []).filter((f) => f.kpi && !f.collapsed);
  if (tables.length) {
    return (
      <div className="flex flex-col gap-8">
        {tables.map((framework) => (
          <FrameworkBlock key={framework.title} framework={framework} t={t} />
        ))}
      </div>
    );
  }
  const kpi = detail.kpi;
  if (!kpi?.title || kpi.stages.some((stage) => !stage.check)) {
    throw new Error(`${project.slug} · KPI 표가 없으면 kpi.title 과 단계별 check 가 필요하다`);
  }
  return (
    <FrameworkBlock
      t={t}
      framework={{
        title: kpi.title,
        description: kpi.description,
        variant: "table",
        rowHeader: t.kpiRowHeader,
        columns: t.kpiColumns,
        rows: kpi.stages.map((stage) => ({ label: stage.stage, cells: [stage.check ?? "", stage.labels.join(" · ")] })),
      }}
    />
  );
}

/**
 * 결과 블록 첫머리의 단계별 성과. 아래 상세 수치와 같은 값을 반응 → 행동 → 비즈니스 순으로 다시 묶기만 한다.
 * 라벨이 results 에 없으면 빌드에서 멈춘다. 화면에 없는 값을 새로 적지 않기 위해서다.
 */
function ResultChain({ project, detail, t }: { project: Project; detail: Project["detail"]; t: CaseLabels }) {
  const kpi = detail.kpi;
  if (!kpi) return null;
  const metricOf = (label: string) => {
    const metric = detail.results.find((item) => item.label === label);
    if (!metric) throw new Error(`${project.slug} · kpi 라벨 "${label}" 이 results 에 없다`);
    return metric;
  };
  return (
    <div className="mb-8">
      <p className="mb-3 text-caption font-semibold text-ink-3">{t.chainTitle}</p>
      <ol className="grid grid-cols-1 gap-px overflow-hidden rounded-card border border-line bg-line lg:grid-cols-3">
        {kpi.stages.map((stage, index) => (
          <li key={stage.stage} className="relative bg-white p-5">
            <p className="text-caption font-bold text-accent">
              <span className="tnum">{String(index + 1).padStart(2, "0")}</span> {stage.stage}
            </p>
            {index < kpi.stages.length - 1 ? (
              <span className="absolute top-5 right-4 hidden text-ink-3 lg:block" aria-hidden="true">
                →
              </span>
            ) : null}
            <dl className="mt-3 flex flex-col gap-3">
              {stage.labels.map((label) => {
                const metric = metricOf(label);
                return (
                  <div key={label}>
                    <dt className="text-caption text-ink-3">{label}</dt>
                    <dd className="tnum mt-0.5 text-body font-semibold text-ink">
                      {metric.before && metric.before !== "기준" ? `${metric.before} → ` : ""}
                      {metric.after}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </li>
        ))}
      </ol>
      {kpi.note ? <p className="mt-3 text-caption text-ink-3">{kpi.note}</p> : null}
    </div>
  );
}

function ResultsDetails({
  project,
  detail,
  t,
  lang,
  primaryLabels,
}: {
  project: Project;
  detail: Project["detail"];
  t: CaseLabels;
  lang: Lang;
  primaryLabels: Set<string>;
}) {
  const levels = detail.results.filter((metric) => !isIndexDelta(metric));
  const deltas = detail.results.filter((metric) => isIndexDelta(metric));
  const hasChart = canChart(project.keyMetric);
  /*
   * 대표 자리에는 수준값만 둔다 — 전이(352→583%) · 절대값(11.9억) · 수준값(808%).
   * 예전에는 "전환매출 증감"(+30.68%)이 대표에 들어가 증감률이 절대값 옆에 섞여 있었고,
   * 데이터 구조가 똑같은 "브랜드검색 쿼리수"(+32.4%)는 구분선 아래에 있었다 —
   * 같은 모양의 값이 기준 없이 위아래로 갈렸다. 아래 TL;DR 스트립 주석이 스스로
   * "기준이 다른 수치가 경쟁하지 않게 한다"고 적어 놓고 그걸 어기고 있었다.
   *
   * 무엇을 대표로 둘지는 이 케이스가 이미 답을 갖고 있었다 — 09 근거 문단이 출처를
   * 짚는 값은 583% / 808% / 11.9억 / 210% 이고 +30.68% 는 거기 없다.
   * 근거로 세운 값을 그대로 대표로 쓴다.
   */
  const jestinaPrimary = primaryLabels;
  const primaryMetrics =
    project.slug === "jestina"
      ? detail.results.filter((metric) => jestinaPrimary.has(metric.label))
      : detail.results;
  const secondaryMetrics =
    project.slug === "jestina"
      ? detail.results.filter((metric) => !jestinaPrimary.has(metric.label))
      : [];
  const gridLevels =
    project.slug === "jestina"
      ? primaryMetrics.filter((metric) => metric.label !== project.keyMetric.label)
      : hasChart && levels[0]?.label === project.keyMetric.label
        ? levels.slice(1)
        : levels;
  /*
   * 제이에스티나만 증감률 블록을 비운다. 이 케이스는 아래에서 '보조 성과' 블록을 따로 그리고
   * 증감률 4개가 전부 그 블록에 들어가므로, 두 블록을 다 그리면 같은 값이 두 번 나온다.
   * 대신 보조 성과 구분선 문구가 증감률 주의까지 함께 말한다 —
   * 예전에는 그 문구가 "산정 기준이 달라 보조로 분리했다"만 말해서,
   * 제이에스티나만 증감률 경고를 받지 못하는 유일한 케이스가 돼 있었다.
   */
  const gridDeltas = project.slug === "jestina" ? [] : deltas;

  return (
    <div className="rounded-card border border-line p-6 sm:p-8">
      <Bars metric={project.keyMetric} note={project.keyMetric.note} labels={t.barsLabels[project.slug]} lang={lang} />
      {gridLevels.length > 0 ? <div
        className={`grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 ${
          hasChart ? "mt-9 border-t border-line pt-8" : ""
        }`}
      >
        {gridLevels.map((metric, index) => (
          <MetricDelta
            key={metric.label}
            metric={metric}
            size={!hasChart && index === 0 ? "lg" : "md"}
          />
        ))}
      </div> : null}

      {gridDeltas.length > 0 ? (
        <div className="mt-9 border-t border-line pt-7">
          <p className="text-caption font-semibold text-ink-3">
            {t.deltaNote}
          </p>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {gridDeltas.map((metric) => (
              <MetricDelta key={metric.label} metric={metric} />
            ))}
          </div>
        </div>
      ) : null}

      {project.slug === "jestina" ? (
        <div className="mt-9 border-t border-line pt-7">
          <p className="text-caption font-semibold text-ink-3">
            <span className="block">{t.jestinaSecondary[0]}</span>
            <span className="block">{t.jestinaSecondary[1]}</span>
          </p>
          <div className="mt-5 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {secondaryMetrics.map((metric) => (
              <MetricDelta key={metric.label} metric={metric} />
            ))}
          </div>
          <div className="mt-8 rounded-card border border-line bg-bg-alt p-6">
            <p className="text-small font-semibold">{t.jestinaBasisTitle}</p>
            <ul className="mt-3 flex flex-col gap-2">
            <li className="relative pl-4 text-caption text-ink-2 sm:text-small">
              <span className="absolute left-0 top-[0.62em] h-1 w-1 rounded-full bg-ink-3" />
              {t.jestinaBasis[0]}
            </li>
            <li className="relative pl-4 text-caption text-ink-2 sm:text-small">
              <span className="absolute left-0 top-[0.62em] h-1 w-1 rounded-full bg-ink-3" />
              {t.jestinaBasis[1]}
            </li>
            <li className="relative pl-4 text-caption text-ink-2 sm:text-small">
              <span className="absolute left-0 top-[0.62em] h-1 w-1 rounded-full bg-ink-3" />
              {t.jestinaBasis[2]}
            </li>
            </ul>
          </div>
        </div>
      ) : null}

      {project.slug === "daekyo" ? (
        <p className="mt-8 rounded-card border border-line bg-bg-alt px-5 py-4 text-caption text-ink-2 sm:text-small">
          {t.daekyoNote}
        </p>
      ) : null}
    </div>
  );
}

/**
 * 상세 페이지 마스트헤드에 찍히는 폴리오.
 * 홈의 챕터 인덱스·Selected Work 폴리오와 같은 번호를 써야 한 권으로 읽힌다 —
 * 특집 4편만 CH 번호를 갖고, 나머지는 보조 지면(SUPPORTING)·시스템(SYSTEM)으로 구분한다.
 *
 * 번호를 표로 박아 두면 판마다 순서가 다른 지금 구조에서 홈과 상세가 서로 다른 번호를 찍는다.
 * 홈이 쓰는 것과 같은 출처(edition.spreadOrder)에서 계산한다.
 */
function folioOf(slug: string): string {
  const i = edition.spreadOrder.indexOf(slug);
  if (i >= 0) return `CH.${String(i + 1).padStart(2, "0")}`;
  return slug === "automation" ? "SYSTEM" : "SUPPORTING";
}

/**
 * 사례 상세 본문 — 한국어(/projects/…)와 영문(/en/projects/…)이 같이 쓴다 (2026.09.25).
 * 영문은 같은 데이터 구조에 문장만 바꾼 projects.en 을 쓰고, 화면 라벨은 caseLabels 에서 가져온다.
 */
export function CaseView({ slug, lang = "ko" }: { slug: string; lang?: Lang }) {
  const t: CaseLabels = caseLabels[lang];
  const ko = getProject(slug);
  const p = lang === "en" ? getProjectEn(slug) : ko;
  if (!p || !ko) notFound();

  const d = p.detail;
  const ledes = (lang === "en" ? caseLedesEn : caseLedes)[p.slug] ?? {};
  const next = lang === "en" ? getNextProjectEn(p) : getNextProject(p);
  /* 한국어 라벨 목록을 같은 자리의 영문 라벨로 바꾼다 — 두 언어가 늘 같은 수치를 고르게 한다 */
  const toLang = (label: string) => {
    if (lang === "ko") return label;
    const i = ko.detail.results.findIndex((m) => m.label === label);
    return i >= 0 ? d.results[i]?.label ?? label : label;
  };
  const folio = folioOf(p.slug);

  /* TL;DR 스트립은 대표 지표 3개만 고정해 기준이 다른 수치가 경쟁하지 않게 한다(목록은 caseLabels.ts). */
  const preferredLabels = preferredInlineLabels[p.slug]?.map(toLang);
  /*
   * 공용판 사례 첫 화면 (2026.09.24) — 홈 카드와 같은 [대표 수치 · 기준 · 기여 범위]와 대표 소재.
   * 제목만 있고 숫자는 문단 속 글자, 큰 수치와 소재는 첫 화면 밖이었다. 새 숫자는 없다.
   */
  const card = EDITION === "general" ? (lang === "en" ? caseCardsEn : caseCards)[p.slug] : undefined;
  const heroMetric = card
    ? card.metric ?? { label: card.label ?? p.keyMetric.label, before: p.keyMetric.before, after: p.keyMetric.after }
    : undefined;
  /* 표지에 기간·역할이 올라간 공용판은 요약 층의 메타를 한 줄 묶음으로 줄인다 */
  const compactMeta = EDITION === "general" && Boolean(card && heroMetric);
  const inlineMetrics = (preferredLabels
    ? preferredLabels
        .map((label) => d.results.find((metric) => metric.label === label))
        .filter((metric): metric is NonNullable<typeof metric> => Boolean(metric))
    : d.results.filter((m) => m.after !== "데이터 확인 필요").slice(0, 3)
  ).filter((m) => !heroMetric || !(m.after === heroMetric.after && (m.before ?? "") === (heroMetric.before ?? "")));

  const evidence = d.evidence ?? [];
  const inlineEvidence = EDITION === "general" && p.tier !== "archive";
  const placedEvidence = (placement: Evidence["placement"]) =>
    inlineEvidence ? evidence.filter((item) => item.placement === placement) : [];
  const referenceEvidence = inlineEvidence ? evidence.filter((item) => !item.placement) : evidence;
  const relocatedEvidence = inlineEvidence ? evidence.filter((item) => item.placement) : [];
  const hasDecisionSummary = Boolean(p.decisionResult && p.cardProblem && p.cardDecision);
  const evidenceShortcuts = evidence.filter((item, index) => item.group && evidence.findIndex((other) => other.group === item.group) === index);
  const hasEvidenceDetails = !!(
    evidence.length ||
    d.evidenceLinks?.length ||
    d.evidenceNote
  );
  /*
   * 공용판만 KPI 설계를 실행 앞 블록으로 올리고, 결과 첫머리에 단계별 성과를 둔다(2026.09.14 사용자 결정).
   * 다른 판은 배포된 화면과 같게 두려고 기존 흐름을 유지한다. 번호는 목록 순서에서 계산한다.
   */
  const showKpi = EDITION === "general" && Boolean(d.kpi);
  const caseFlow = [
    { id: "case-problem", label: t.flow.problem },
    { id: "case-analysis", label: t.flow.analysis },
    { id: "case-strategy", label: t.flow.strategy },
    ...(showKpi ? [{ id: "case-kpi", label: t.flow.kpi }] : []),
    { id: "case-execution", label: t.flow.execution },
    { id: "case-results", label: t.flow.results },
    { id: "case-role", label: t.flow.role },
    { id: "case-learning", label: t.flow.learning },
    ...(hasEvidenceDetails ? [{ id: "case-evidence", label: t.flow.evidence }] : []),
    { id: "case-source", label: t.flow.source },
  ].map((item, index) => ({ ...item, no: String(index + 1).padStart(2, "0") }));
  const noOf = (id: string) => caseFlow.find((item) => item.id === id)?.no ?? "";

  return (
    <article className="pt-[112px] sm:pt-[144px]">
      <Container>
        <Reveal>
          {/* 단독 내비게이션 컨트롤이므로 모바일 터치 타깃 44px을 확보한다.
              좌측 정렬선을 지키려고 -ml 로 패딩만큼 되돌린다. */}
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-t-2 border-rule pt-3 font-mono text-[0.6875rem] font-bold">
            {/* 표지 마스트헤드와 같은 문자열을 쓴다 — 판마다 직함이 다르므로 하드코딩하지 않는다.
                케이스 상세는 이미 문맥이 잡힌 뒤라 기반 역량 줄은 싣지 않는다. */}
            <p className="tracking-[0.18em] text-ink uppercase">{hero.mastheadLeft}</p>
            <p className="tracking-[0.02em] text-ink-3">
              {edition.issueLabel} · {folio} · {p.brand}
            </p>
          </div>
          <Link
            href={t.homeHref}
            className="mt-3 -ml-2 inline-flex min-h-[44px] items-center px-2 font-mono text-mono font-bold text-ink-3 hover:text-ink hover:underline"
          >
            {EDITION === "general" ? t.back : t.backOther}
          </Link>
        </Reveal>

        {/* 표제부 */}
        <Reveal delay={0.05}>
          <div className="mt-7">
            <div className="flex flex-wrap gap-2">
              {p.categories.map((c) => (
                <Tag key={c}>{c}</Tag>
              ))}
            </div>
            <p className="mt-5 font-mono text-mono font-bold text-ink-3">{p.brand}</p>
            <h1 className="mt-2 max-w-[46rem] text-h2 sm:text-h1">{p.headline}</h1>
            {card && heroMetric ? (
              <div className="case-hero">
                <div className="case-hero-metric">
                  <p className="case-hero-label">{heroMetric.label}</p>
                  <p className="case-hero-value">
                    {heroMetric.before && heroMetric.before !== "기준" ? (
                      <span className="case-hero-before">
                        {heroMetric.before}
                        <span aria-hidden="true"> → </span>
                        <span className="sr-only">{t.srFrom}</span>
                      </span>
                    ) : null}
                    {heroMetric.after}
                  </p>
                  <p className="case-hero-basis">{card.basis}</p>
                  <p className="case-hero-scope"><span>{t.contribution}</span>{card.scope}</p>
                  {/*
                    기간·역할을 표지로 올렸다 (2026.09.25). 표지 뒤 요약 층에 기간·역할·기여 범위
                    네 칸이 따로 있어서 본문까지 1.3화면이 걸렸고, 기여 범위는 표지와 두 번 나왔다.
                  */}
                  <dl className="case-hero-meta">
                    <div><dt>{t.period}</dt><dd>{p.period}</dd></div>
                    <div><dt>{t.role}</dt><dd>{p.role}</dd></div>
                    {p.scale ? <div><dt>{p.scaleLabel ?? t.scale}</dt><dd>{p.scale}</dd></div> : null}
                  </dl>
                </div>
                <a
                  className={`case-hero-media${card.contain ? " is-contain" : ""}`}
                  style={{ "--tint": card.tint } as CSSProperties}
                  href={`${basePath}/evidence/${card.image}.webp`}
                  target="_blank"
                  rel="noopener"
                  aria-label={`${card.alt} — ${t.openFull} ${t.newTab}`}
                >
                  <img src={`${basePath}/evidence/${card.image}-960.webp`} alt={card.alt} width={960} height={640} loading="eager" />
                </a>
              </div>
            ) : null}
          </div>
        </Reveal>

        {/* TL;DR — 첫 화면에 숫자가 0개인 상태를 막는다 */}
        <Reveal delay={0.08}>
          <div className="mt-8 border-y border-line py-7 sm:py-8">
            {hasDecisionSummary && p.decisionResult ? (
              <>
                {/*
                  공용판 라벨은 홈 사례 카드와 같은 "문제 / 한 일 / 성과" 로 둔다(2026.09.13 사용자 결정).
                  "판단과 행동 / 확인한 결과" 는 수식어 붙은 명사형이 대칭을 이뤄 틀에 찍은 글처럼 읽혔다.
                  다른 판은 이미 배포된 화면과 같게 두려고 기존 라벨을 유지한다.
                */}
                {/*
                  공용판은 문제 앞에 목표를 한 줄 둔다(2026.09.14). 무엇을 이루려 했는지를 먼저 봐야
                  아래 한 일과 성과가 그 목표에 닿았는지로 읽힌다.
                */}
                {EDITION === "general" ? (
                  <p className="mb-6 max-w-[58rem] text-body leading-[1.75] text-ink">
                    <strong className="mr-3 text-small font-bold text-accent">{t.goal}</strong>
                    {p.objective}
                  </p>
                ) : null}
                <dl
                  className="grid gap-6 lg:grid-cols-3 lg:gap-8"
                  aria-label={EDITION === "general" ? t.summaryAria : t.summaryAriaOther}
                >
                  {[
                    { label: t.problem, value: p.cardProblem },
                    { label: EDITION === "general" ? t.did : t.didOther, value: p.cardDecision },
                    { label: EDITION === "general" ? t.result : t.resultOther, value: p.decisionResult.result },
                  ].map((item) => (
                    <div key={item.label}>
                      <dt className="mb-3 text-small font-bold text-accent">{item.label}</dt>
                      <dd className="text-body leading-[1.75] text-ink">{item.value}</dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-6 max-w-[58rem] text-small leading-[1.75] text-ink-2">
                  <strong className="font-semibold">{t.boundary}</strong>{p.decisionResult.boundary}
                </p>
              </>
            ) : (
              <>
                <Eyebrow className="mb-4">{t.caseSummary}</Eyebrow>
                <p className="max-w-[46rem] text-body text-ink sm:text-[1.1875rem] sm:leading-[1.68]">{p.tldr}</p>
              </>
            )}

            {compactMeta ? (
              /* 업종 · 채널 · 근거 형태를 한 줄 묶음으로 (2026.09.25) — 기간·역할·기여 범위는 표지에 있다 */
              <dl className="case-meta-strip">
                <div><dt>{t.industry}</dt><dd>{p.industry}</dd></div>
                <div><dt>{p.contextLabel ?? t.channels}</dt><dd>{p.channels.join(" · ")}</dd></div>
                <div><dt>{t.evidenceType}</dt><dd>{p.evidenceLabel}</dd></div>
              </dl>
            ) : (
            <>
            <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-6 sm:grid-cols-4">
              {[
                { k: t.period, v: p.period },
                { k: t.role, v: p.role },
                {
                  k: t.contribution,
                  v: p.contributionNote ?? `${p.contribution}%`,
                  accent: true,
                },
                ...(p.scale ? [{ k: p.scaleLabel ?? t.scale, v: p.scale }] : []),
              ].map((row) => (
                <div key={row.k}>
                  <dt className="text-caption text-ink-3">{row.k}</dt>
                  {/*
                    두세 줄짜리 짧은 메타값이라 pretty 로는 마지막 줄이 안 잡힌다 —
                    390px 에서 "…캠페인 구조·최적화 / 기준"처럼 한 토막만 떨어졌다.
                    줄 수가 적어 balance 비용이 작고, 여기선 줄 길이를 고르게 나누는 편이 맞다.
                  */}
                  <dd
                    className={`mt-1 text-caption font-semibold text-balance sm:text-small ${
                      row.accent ? "tnum text-accent" : ""
                    }`}
                  >
                    {row.v}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-2 text-caption text-ink-3">{t.evidenceType} — {p.evidenceLabel}</p>
            </>
            )}

            {/* 대표값이 첫 화면으로 올라가 남는 수치가 없으면 줄 자체를 그리지 않는다 — 빈 테두리 띠가 남았다 */}
            {inlineMetrics.length ? (
            <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-6">
              {inlineMetrics.map((m) => (
                <li key={m.label} className="text-caption sm:text-small">
                  <span className="text-ink-3">{m.label}</span>{" "}
                  <b className="tnum font-semibold">
                    {m.before && m.before !== "기준" ? `${m.before} → ` : ""}
                    {m.after}
                  </b>
                </li>
              ))}
            </ul>
            ) : null}
            {evidenceShortcuts.length ? (
              <nav className={`flex flex-wrap items-center gap-x-6 gap-y-1 ${compactMeta ? "mt-3" : "mt-5 border-t border-line pt-3"}`} aria-label={t.evidenceNavAria}>
                {compactMeta ? <span className="text-caption text-ink-3">{t.evidenceNavLabel}</span> : null}
                {evidenceShortcuts.map((item) => (
                  <a key={item.file} href={`#${evidenceId(item.file)}`}
                    className="inline-flex min-h-[44px] items-center text-small font-semibold text-accent underline underline-offset-4">
                    {t.evidenceJump(item.group ?? "")}
                  </a>
                ))}
              </nav>
            ) : null}
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          {!hasDecisionSummary ? <p className="mt-8 max-w-[46rem] text-body text-ink-2">{d.overview}</p> : null}

          {/*
            dt·dd 가 inline 이라 text-wrap 이 dd 에는 안 걸린다 — 줄바꿈은 이 div 가 정한다.
            채널 목록이 길어 390px 에서 "…YouTube 커뮤니티 · / 라이브커머스"로 끝 항목만 떨어졌다.
          */}
          {compactMeta ? null : (
          <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            <div className="text-balance">
              <dt className="inline text-caption text-ink-3">{t.industry} </dt>
              <dd className="inline text-caption font-normal">{p.industry}</dd>
            </div>
            <div className="text-balance">
              <dt className="inline text-caption text-ink-3">{p.contextLabel ?? t.channels} </dt>
              <dd className="inline text-caption font-normal">{p.channels.join(" · ")}</dd>
            </div>
          </dl>
          )}
        </Reveal>

        {/* 핵심·확장 사례 모두 같은 흐름으로 읽히게 해, 등급보다 판단 과정을 우선한다. */}
        {p.tier !== "archive" ? (
          <div className="mt-14">
            <CaseFlowNav items={caseFlow} ariaLabel={t.flowNavAria} />
          </div>
        ) : null}

        <div className={p.tier !== "archive" ? "mt-0" : "mt-14"}>
          {p.tier !== "archive" ? (
            <>
              <Block id="case-problem" no={noOf("case-problem")} label={t.block.problem} lede={ledes.problem}>
                <p className="text-body text-ink-2">{d.challenge}</p>
              </Block>
              <Block id="case-analysis" no={noOf("case-analysis")} label={t.block.analysis} lede={ledes.analysis}>
                <p className="text-body text-ink-2">{d.dataAnalysis}</p>
                <PlacedFrameworks detail={d} placement="analysis" t={t} />
                <EvidenceGallery evidence={placedEvidence("analysis")} className="mt-8" t={t} />
              </Block>
              <Block id="case-strategy" no={noOf("case-strategy")} label={t.block.strategy} lede={ledes.strategy}>
                <p className="text-body text-ink-2">{d.strategy}</p>
                <PlacedFrameworks detail={d} placement="strategy" t={t} />
              </Block>
              {showKpi ? (
                <Block id="case-kpi" no={noOf("case-kpi")} label={t.block.kpi}>
                  <KpiDesign project={p} detail={d} t={t} />
                </Block>
              ) : null}
              <Block id="case-execution" no={noOf("case-execution")} label={t.block.execution}>
                <ExecutionList items={d.execution} />
                {/* 자동화 케이스만 구조도를 붙인다. 증빙 두 장이 모두 결과 화면이라
                    "무엇을 만들었나"가 본문을 다 읽어야 나왔다. */}
                {p.slug === "automation" ? <AutomationArchitecture lang={lang} /> : null}
                <ProjectFrameworks detail={d} skipKpi={showKpi} t={t} />
                <EvidenceGallery evidence={placedEvidence("execution")} className="mt-8" t={t} />
              </Block>
              <Block id="case-results" no={noOf("case-results")} label={t.block.results} lede={ledes.results}>
                {showKpi ? <ResultChain project={p} detail={d} t={t} /> : null}
                <ResultsDetails project={p} detail={d} t={t} lang={lang} primaryLabels={new Set(jestinaPrimaryLabels.map(toLang))} />
                <PlacedFrameworks detail={d} placement="results" t={t} />
                <EvidenceGallery evidence={placedEvidence("results")} className="mt-8" t={t} />
              </Block>
              <Block id="case-role" no={noOf("case-role")} label={t.block.role}>
                <RoleDetails project={p} detail={d} t={t} />
              </Block>
              <Block id="case-learning" no={noOf("case-learning")} label={t.block.learning} lede={ledes.learning}>
                <LearningDetails detail={d} t={t} />
              </Block>
              {hasEvidenceDetails ? (
                <Block id="case-evidence" no={noOf("case-evidence")} label={relocatedEvidence.length ? t.block.evidenceIndex : t.block.evidence}>
                  <EvidenceDetails detail={d} evidence={referenceEvidence} relocated={relocatedEvidence} t={t} />
                </Block>
              ) : null}
              <Block id="case-source" no={noOf("case-source")} label={t.block.source}>
                <details className="group rounded-card border border-line bg-bg-alt">
                  <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 px-5 text-small font-semibold text-ink marker:hidden">
                    {t.sourceSummary}
                    <span className="text-accent transition-transform group-open:rotate-45" aria-hidden="true">＋</span>
                  </summary>
                  <p className="border-t border-line px-5 py-5 text-caption text-ink-3 sm:text-small">{d.source}</p>
                </details>
              </Block>
            </>
          ) : (
            <>
              {/*
                아카이브 등급도 '실행'을 렌더한다 (2026.08.25).
                이 분기에는 실행 블록이 없어서 detail.execution 이 데이터로만 존재했다 —
                한샘 3줄, KT알파 2줄이 화면 어디에도 나오지 않았고, 거기에 새 내용을
                적으면 또 사라진다. 등급은 분량으로 구분하되, 적어 둔 것이 안 보이는
                상태로 두지는 않는다.
                순서는 핵심 사례와 같게 실행 → 나의 역할로 둔다.
              */}
              <Block no="01" label={t.block.execution}>
                <ExecutionList items={d.execution} />
              </Block>
              <Block no="02" label={t.block.role}>
                <RoleDetails project={p} detail={d} t={t} />
              </Block>
              <Block no="03" label={t.block.archiveSource}>
                <p className="text-caption text-ink-3 sm:text-small">{d.source}</p>
              </Block>
              <Block no="04" label={t.block.archiveLearning}>
                <LearningDetails detail={d} t={t} />
              </Block>
              {/*
                아카이브 등급도 증빙을 렌더한다 (2026.08.26).
                실행 블록과 같은 문제가 evidence 에도 있었다 — 이 분기에 증빙 슬롯이
                없어서, 한샘·KT알파에 이미지를 붙여도 화면에 나오지 않았다.
                등급은 분량으로 구분하되, 근거가 있는데 안 보이는 상태로 두지 않는다.
              */}
              {evidence.length ? (
                <Block no="05" label={t.block.evidence}>
                  <EvidenceDetails detail={d} evidence={evidence} t={t} />
                </Block>
              ) : null}
            </>
          )}
        </div>

      </Container>

      {/*
        상세 페이지도 마지막은 다크로 닫는다 — 홈의 "밝기가 곧 읽는 방식" 규칙을
        상세에서도 지켜 한 권으로 읽히게 한다. 상단에 다크 밴드를 얹지 않은 이유는
        본문에 닿기까지 화면을 더 소비시키는 통행료가 되기 때문이다.
      */}
      <div className="mt-16 border-t border-rule-ink bg-ink py-12 text-on-ink">
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-mono font-bold tracking-[0.08em] text-limit-ink uppercase">
                {t.next}
              </p>
              <Link
                href={`${t.casePrefix}${next.slug}/`}
                className="mt-2 block max-w-[38rem] text-h3 text-on-ink hover:text-signal-ink"
              >
                {next.brand} — {next.headline} →
              </Link>
            </div>
            <div className="flex flex-wrap gap-3">
              <CTAButton href={t.homeHref} variant="ghost" onDark>
                {t.toc}
              </CTAButton>
              <CTAButton href={t.resumeHref} onDark>
                {t.resume}
              </CTAButton>
            </div>
          </div>
        </Container>
      </div>
    </article>
  );
}
