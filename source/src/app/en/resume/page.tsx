import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { CTAButton } from "@/components/ui";
import { OG_VERSION } from "@/data/edition";
import { langAlternates } from "@/data/en/alternates";
import { getProjectEn, projectsEn } from "@/data/en/projects.en";
import { NAME_EN_DISPLAY, ORG_EN, ROLE_EN } from "@/data/en/home.en";
import {
  activitiesEn,
  awardsArchiveEn,
  awardsEn,
  careerEn,
  careerLengthEn,
  certificationsEn,
  educationCaptionEn,
  educationEn,
  narrativeEn,
  otherBrandsEn,
  otherResultsEn,
  publicWorkEn,
  recordsLinksEn,
  resumeMetricIndexKo,
  skillLevelsEn,
  skillsEn,
  summaryEn,
  supportingEn,
} from "@/data/en/resume.en";
import { getProject, projects, solutionOrder } from "@/data/projects";
import { site } from "@/data/site";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 영문 이력서 (2026.09.25) — 한국어 /resume/ 과 같은 순서·같은 마크업, 문장만 영문.
 * 내려받는 PDF 는 한국어 공개판 하나뿐이라 버튼에 그렇게 적는다.
 * 제외 항목도 한국어판과 같다: 전화번호 · 주소 · 생년월일 · 연봉.
 */
const title = "Résumé | Kim Seonill";
const description = `Résumé and career description of ${NAME_EN_DISPLAY}, ${ROLE_EN}: experience, projects, scope, results, education, certifications and awards.`;

export const viewport: Viewport = { themeColor: "#ffffff" };

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  robots: { index: false, follow: false, noarchive: true, nosnippet: true },
  alternates: langAlternates("resume/", "en/resume/"),
  openGraph: {
    title,
    description,
    locale: "en_US",
    url: "en/resume/",
    images: [{ url: `og-image.png?v=${OG_VERSION}`, width: 1200, height: 630, alt: `${NAME_EN_DISPLAY} résumé` }],
  },
  twitter: { card: "summary_large_image", title, description, images: [`og-image.png?v=${OG_VERSION}`] },
};

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-t border-line-2 py-3 sm:grid-cols-[112px_1fr] sm:gap-5">
      <dt className="text-caption font-semibold text-ink-3">{label}</dt>
      <dd className="text-caption sm:text-small">{children}</dd>
    </div>
  );
}

function H2({ children, id, breakBefore = false }: { children: React.ReactNode; id?: string; breakBefore?: boolean }) {
  return (
    <h2
      id={id}
      className={`mt-10 border-b-2 border-ink pb-2 text-[1.0625rem] font-bold tracking-normal sm:text-[1.25rem]${
        breakBefore ? " print-break-before" : ""
      }`}
    >
      {children}
    </h2>
  );
}

/* 한국어 이력서와 같은 칸을 같은 순서로 — 영문 라벨은 같은 자리(results 순번)에서 가져온다 */
function resumeMetrics(slug: string) {
  const ko = getProject(slug);
  const en = getProjectEn(slug);
  if (!ko || !en) return [];
  const wanted = resumeMetricIndexKo[slug] ?? [];
  return ko.detail.results
    .map((m, i) => ({ ko: m, en: en.detail.results[i] }))
    .filter(({ ko: m }) => wanted.includes(m.label))
    .slice(0, 3)
    .map(({ en: m }) => m);
}

export default function ResumePageEn() {
  const bySolutionOrder = (a: { slug: string }, b: { slug: string }) => solutionOrder.indexOf(a.slug) - solutionOrder.indexOf(b.slug);
  const featured = projectsEn.filter((p) => p.tier === "featured").sort(bySolutionOrder);
  const supporting = projects.filter((p) => p.tier === "supporting").sort(bySolutionOrder);
  const mailto = `mailto:${site.email}?subject=${encodeURIComponent("Résumé request")}`;

  return (
    <article lang="en" className="resume-page pt-[104px] pb-24 sm:pt-[128px]">
      <div className="mx-auto w-full max-w-[860px] px-5 sm:px-10">
        <div className="no-print flex flex-wrap items-center justify-between gap-3">
          <Link href="/en/" className="-ml-2 inline-flex min-h-[44px] items-center px-2 text-caption font-semibold text-accent hover:underline">
            ← Back to portfolio
          </Link>
          <CTAButton href={`${basePath}${site.resumePdfPath}`} download className="min-h-[44px] px-4 text-caption">
            PDF download (Korean)
          </CTAButton>
        </div>

        <header className="mt-6 border-b-2 border-ink pb-6">
          <div className="flex items-start justify-between gap-6">
            <div>
              <p className="text-caption font-semibold tracking-[0.02em] text-accent">Résumé · Career description</p>
              <h1 className="mt-3 text-[1.75rem] font-bold tracking-normal sm:text-[2.25rem]">
                {NAME_EN_DISPLAY}
                <span className="ml-3 text-small font-normal text-ink-3" lang="ko">{site.name}</span>
              </h1>
              <p className="mt-3 text-small text-ink-2 sm:text-body">
                {ROLE_EN} · {ORG_EN} · {careerLengthEn()} in performance marketing
              </p>
              <p className="mt-2 text-caption text-ink-3">
                {site.email} ·{" "}
                <a href={site.linkedin} target="_blank" rel="noopener" className="text-accent">
                  LinkedIn
                </a>{" "}
                ·{" "}
                {/* 주소는 인쇄본에서 읽히게 글자로 적고, 링크는 사이트 안 경로로 건다 */}
                <Link href="/en/" className="text-accent">
                  {`${site.url.replace("https://", "")}en/`}
                </Link>
              </p>
              <p className="mt-3 max-w-[38rem] text-caption font-normal text-ink-2 sm:text-small">{summaryEn.intro}</p>
            </div>
            <img
              src={`${basePath}${site.profileImagePath}`}
              alt="Profile photo of Kim Seonill"
              width={88}
              height={104}
              className="h-[104px] w-[88px] shrink-0 rounded-card border border-line object-cover object-top"
            />
          </div>
          <p className="no-print mt-4 text-caption text-ink-3">
            Detailed contact information and supporting documents are available{" "}
            <a href={mailto} className="font-normal text-accent underline underline-offset-2">
              on request by email
            </a>
            .
          </p>
        </header>

        <H2>About me</H2>
        <div className="mt-4 flex max-w-[46rem] flex-col gap-2.5">
          {narrativeEn.map((para) => (
            <p key={para.slice(0, 24)} className="text-caption leading-[1.75] text-ink-2 sm:text-small">
              {para}
            </p>
          ))}
        </div>

        <H2>Core capabilities</H2>
        <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {summaryEn.columns.map((c) => (
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
          {summaryEn.highlights.map((h) => (
            <li key={h.axis} className="flex gap-3 text-caption sm:text-small">
              <span className="shrink-0 font-semibold text-accent">[{h.axis}]</span>
              <span className="text-ink-2">{h.body}</span>
            </li>
          ))}
        </ul>

        <H2>Experience</H2>
        {careerEn.map((c) => (
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
              <Row label="Key clients">{c.clients}</Row>
              <Row label="Key results">
                <span className="font-semibold text-up">{c.highlight}</span>
              </Row>
            </dl>
          </section>
        ))}

        <H2>Selected projects</H2>
        <p className="mt-3 text-caption text-ink-3">
          <span className="block">Ordered by scope of contribution and how verifiable the result is.</span>
          <span className="block">Detailed evidence is on each case page of the portfolio site.</span>
        </p>
        {featured.map((p) => (
          <section key={p.slug} className="print-avoid mt-6 border-t border-line pt-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-small font-bold sm:text-body">
                <Link href={`/en/projects/${p.slug}/`} className="hover:text-accent">
                  {p.brand}
                </Link>
                <span className="ml-2 text-caption font-normal text-ink-3">{p.industry}</span>
              </h3>
              <p className="tnum text-caption text-ink-3">{p.period}</p>
            </div>
            <p className="mt-2 text-caption text-balance text-ink-2 sm:text-small">{p.tldr}</p>
            <dl className="mt-3">
              <Row label="Role">
                {p.role} · Contribution <strong className="font-semibold">{p.contributionNote ?? `${p.contribution}%`}</strong>
              </Row>
              <Row label={p.contextLabel ?? "Channels"}>{p.channels.join(" · ")}</Row>
              <Row label="Evidence">{p.evidenceLabel}</Row>
              <Row label="Results">
                <ul className="flex flex-col gap-1">
                  {resumeMetrics(p.slug).map((m) => (
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

        <H2>Extended capabilities</H2>
        <p className="mt-3 text-caption text-ink-3">
          A case run alone with its measurement scope aligned, and experience building repeatable operating systems.
        </p>
        <dl className="mt-4">
          {supporting.map((ko) => {
            const p = getProjectEn(ko.slug);
            const alt = supportingEn[ko.slug];
            if (!p && !alt) return null;
            return (
              <Row key={ko.slug} label={p?.brand ?? alt.brand}>
                <strong className="font-semibold">{p?.role ?? alt.role}</strong>
                <span className="ml-2 text-ink-3">
                  · {p ? p.contributionNote ?? `Contribution ${p.contribution}%` : alt.scope} · {p?.evidenceLabel ?? alt.evidence}
                </span>
                <span className="mt-1 block text-ink-2">{p?.objective ?? alt.objective}</span>
              </Row>
            );
          })}
        </dl>

        <H2>Other brands managed</H2>
        <p className="mt-3 text-caption text-ink-3">
          <span className="block">Results below are from each brand&apos;s operating reports, and their measurement scopes differ.</span>
          <span className="block">Periods follow the consolidated per-brand record; brands without a confirmed month range are left blank.</span>
        </p>
        <dl className="mt-4">
          {otherResultsEn.map((r) => (
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
                    <span className="text-ink-3">{m.label}</span> <strong className="font-semibold">{m.value}</strong>
                  </span>
                ))}
              </span>
            </Row>
          ))}
        </dl>
        <p className="mt-3 text-caption text-ink-3">
          Also {otherBrandsEn.join(" · ")} and more — 30+ brands across 9 industries.
        </p>

        <H2>Public work</H2>
        <div className="no-print mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {publicWorkEn.map((work) => (
            <article key={work.href} className="rounded-card border border-line p-4">
              <p className="text-caption font-semibold text-accent">{work.label}</p>
              <h3 className="mt-1 text-small font-bold">{work.title}</h3>
              <p className="mt-2 text-caption text-ink-2">{work.desc}</p>
              <p className="mt-2 text-caption text-ink-3">{work.facts.join(" · ")}</p>
              <a href={work.href} target="_blank" rel="noopener" className="no-print mt-3 inline-flex text-caption font-semibold text-accent hover:underline">
                View the work (Korean) ↗
              </a>
            </article>
          ))}
        </div>
        <ul className="print-only mt-3 flex flex-col gap-1">
          {publicWorkEn.map((work) => (
            <li key={work.href} className="text-caption text-ink-2">
              <strong className="font-semibold">{work.title}</strong> · {work.facts.join(" · ")}
            </li>
          ))}
        </ul>

        <H2 id="skills" breakBefore>Skills</H2>
        <p className="mt-2 text-caption leading-[1.7] text-ink-3">
          {skillLevelsEn.map((l, i) => (
            <span key={l.level}>
              {i > 0 ? " · " : ""}
              <span className="font-semibold text-ink-2">{l.level}</span> — {l.desc}
            </span>
          ))}
        </p>
        <dl className="no-print mt-4">
          {skillsEn.map((g) => (
            <div key={g.category} className="border-t border-line-2 py-3">
              <dt className="text-caption font-bold">{g.category}</dt>
              <dd className="mt-2 flex flex-col gap-2">
                {g.rows.map((r) => (
                  <div key={`${r.level}-${r.items.join("|")}`} className="grid grid-cols-[64px_1fr] gap-3">
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
        <div className="print-only mt-3">
          {skillsEn.map((g) => (
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

        <H2>Education</H2>
        <dl className="no-print mt-4">
          {educationEn.map((e) => (
            <Row key={e.school + e.period} label={e.period}>
              <strong className="font-semibold">{e.school}</strong>
              <span className="ml-2 text-ink-3">{e.major}</span>
            </Row>
          ))}
        </dl>
        <p className="no-print mt-3 text-caption text-ink-3">{educationCaptionEn}</p>
        <p className="print-only mt-3 text-caption text-ink-2">
          {educationEn.map((e) => `${e.period} ${e.school}, ${e.major}`).join(" / ")}
        </p>

        <H2>Certifications</H2>
        <ul className="no-print mt-4 flex flex-col gap-1.5">
          {certificationsEn.map((c) => (
            <li key={c.name} className="text-caption text-ink-2">
              {c.name}
              {c.when ? <span className="ml-2 text-ink-3">· {c.when}</span> : null}
            </li>
          ))}
        </ul>
        <p className="print-only mt-3 text-caption text-ink-2">
          {certificationsEn.map((c) => `${c.name}${c.when ? ` (${c.when})` : ""}`).join(" · ")}
        </p>
        <p className="print-only mt-2 text-caption text-ink-2">
          <strong className="mr-2 font-semibold text-ink">Awards · Selections</strong>
          {awardsEn.map((a) => `${a.year} ${a.name} (${a.detail})`).join(" / ")}
        </p>
        <p className="print-only mt-2 text-caption text-ink-2">
          <strong className="mr-2 font-semibold text-ink">Before marketing</strong>
          {awardsArchiveEn.map((a) => `${a.year} ${a.items}`).join(" / ")}
        </p>
        <p className="print-only mt-2 text-caption text-ink-2">
          <strong className="mr-2 font-semibold text-ink">Education · Activities</strong>
          {activitiesEn.map((a) => `${a.period} ${a.name} (${a.detail})`).join(" / ")}
        </p>

        <div className="no-print">
          <H2>Awards · Selections</H2>
          <dl className="mt-4">
            {awardsEn.map((a) => (
              <Row key={`${a.year}-${a.detail}`} label={a.year}>
                <strong className="font-semibold">{a.name}</strong>
                <span className="ml-2 text-ink-3">{a.detail}</span>
              </Row>
            ))}
          </dl>
        </div>

        <div className="no-print mt-6">
          <H2>Awards · Selections before marketing</H2>
          <dl className="mt-4">
            {awardsArchiveEn.map((a) => (
              <Row key={a.year} label={a.year}>
                {a.items}
              </Row>
            ))}
          </dl>
        </div>

        <div className="no-print mt-6">
          <H2>Education · Activities</H2>
          <dl className="mt-4">
            {activitiesEn.map((a) => (
              <Row key={a.name} label={a.period}>
                <strong className="font-semibold">{a.name}</strong>
                <span className="ml-2 text-ink-3">{a.detail}</span>
              </Row>
            ))}
          </dl>
        </div>

        <div className="print-avoid mt-10 border-t border-line pt-5">
          <p className="text-caption font-semibold text-ink">Public records (Korean sources)</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {recordsLinksEn.map((v) => (
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
          <span className="block">All figures are based on GA4, media reports and operating logs; values that can&apos;t be disclosed for advertiser data security are shown as ratios.</span>
          <span className="block">Contribution scope is separated based on internal role charts, design documents and operating logs.</span>
        </p>
      </div>
    </article>
  );
}
