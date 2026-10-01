import { Fragment, type CSSProperties } from "react";
import Link from "next/link";
import AutomationDemo from "@/components/AutomationDemo";
import CountUpValue from "@/components/CountUpValue";
import EmailCopyButton from "@/components/EmailCopyButton";
import IntroSplash from "@/components/IntroSplash";
import LoopStory from "@/components/LoopStory";
import Sentences from "@/components/Sentences";
import { heroStrengths } from "@/data/intro";
import { edition } from "@/data/edition";
import { projects, type Project } from "@/data/projects";
import { caseCards, type CaseCard } from "@/data/caseCards";
import { automationCases, builtGroups, careerYear, contact, generalCover, site, verification } from "@/data/site";
import { getProjectEn } from "@/data/en/projects.en";
import { caseCardsEn } from "@/data/en/caseCards.en";
import { contactEn, coverEn, NAME_EN_DISPLAY, ORG_EN, otherEn, recordsEn, ROLE_EN, systemsEn } from "@/data/en/home.en";
import type { Lang } from "@/data/i18n/caseLabels";

/*
 * 공용판 홈 (2026.09.24 개편).
 *
 * 레퍼런스(dainahys · toss · everuns · playd)와 나란히 재어 보니 옛 홈은 글이 5~15배 많고
 * (13,458자 · 23화면), 가장 많이 쓴 글자가 13px 모노였다. 채용 담당자가 읽는 지면이 아니라
 * 검수 보고서였다. 홈은 입구로 줄이고 깊은 내용은 /about/ 과 사례 상세로 옮긴다 — 지운 것이 아니다.
 *
 * 문장은 새로 짓지 않는다. 표지·이야기는 site.ts generalCover(PDF 1·2쪽에서 옮긴 문장),
 * 카드의 제목·문제는 projects.ts, 기준·기여 표기는 사례 본문·OG 카드에 이미 있는 값이다.
 * 이 사이트가 앞서는 지점 — 수치 옆에 기준과 기여 범위, 원본 — 은 카드마다 그대로 둔다.
 */

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/* 카드 정보는 사례 상세 첫 화면과 같이 쓴다 — src/data/caseCards.ts */
type CardMeta = CaseCard;
const CARD = caseCards;

const bySlug = new Map(projects.map((p) => [p.slug, p]));
const spreads = edition.spreadOrder
  .map((slug) => bySlug.get(slug))
  .filter((p): p is Project => Boolean(p && CARD[p.slug]));
const LEAD = spreads.slice(0, 2);
const REST = spreads.slice(2);
/* 자동화는 뺐다 (2026.09.25) — 바로 아래 자동화 구간이 같은 사례로 이어지고, 문장도 거의 같았다 */
const OTHER = ["edith", "hanssem", "ktalpha"]
  .map((slug) => bySlug.get(slug))
  .filter((p): p is Project => Boolean(p));

/*
 * 표지 숫자는 결과 세 칸이다 (2026.09.25) — 전에는 4년 · 30여 개 · 6종으로 결과가 하나도 없었다.
 * 값은 site.ts generalCover.proof. 연차는 눈썹줄이, 브랜드 수는 표지 설명 문장이 말한다.
 */

const SYSTEMS = builtGroups
  .flatMap((g) => g.members as readonly string[])
  .map((no) => automationCases.find((c) => c.no === no))
  .filter((c): c is (typeof automationCases)[number] => Boolean(c));

/* 화면 문구 — 한국어는 기존 문장 그대로, 영문판은 같은 자리 문장을 옮긴 것 (2026.09.25) */
const UI = {
  ko: {
    srFrom: "에서 ",
    scope: "기여 범위",
    readCase: "사례 보기",
    openFull: "원본 크기로 열기 ↗",
    openFullAria: " — 원본 크기로 열기 (새 탭)",
    casePrefix: "/projects/",
    seeWork: "대표 사례 보기",
    copyEmail: "이메일 주소 복사",
    resume: "이력서",
    resumeHref: "/resume/",
    photoAlt: "김선일 프로필 사진",
    recordsAria: "수상과 공개 우수사례",
    newTab: " (새 탭)",
    workTitle: "대표 사례",
    yearsRole: (y: number) => `${y}년 차 ${edition.role}`,
    workLead: "숫자마다 기간과 제 몫을 함께 적었습니다.",
    capAria: "문제 진단 · 가설 검증 · 구조 개선과 해당 사례",
    loopKicker: "How I work",
    loopTitle: "제가 문제를 푸는 순서",
    capProof: "사례",
    capMore: "도구와 역량 전체 보기",
    capMoreHref: "/about/#skills",
    moreLabel: "그 외 기록",
    moreResults: "추가 운영 성과 6건",
    moreResultsLine: "쌤소나이트·카카오톡채널 · 동원몰 · 생활백서 · 후지필름BI · 오토벨의 기간과 대표값",
    autoTitle: "직접 기획·구축한 업무 자동화 6종",
    autoLead: "사람이 반복하던 재고 확인·리포트·정산을 시스템으로 옮겼습니다. 구현은 AI 도구와 함께 했고, 언제 멈출지는 직접 정했습니다.",
    autoCase: "자동화 사례 상세",
    autoCaseHref: "/projects/automation/",
    autoAbout: "시스템별 효과와 검수 기준",
    resumeWeb: "이력서 웹으로 보기",
    resumePdf: "이력서 PDF",
    portfolioPdf: "포트폴리오 PDF",
    aboutAll: "일하는 방식·경력·이야기 전체 보기",
  },
  en: {
    srFrom: " to ",
    scope: "Contribution",
    readCase: "Read the case",
    openFull: "Open full size ↗",
    openFullAria: " — open full size (new tab)",
    casePrefix: "/en/projects/",
    seeWork: "See case studies",
    copyEmail: "Copy email address",
    resume: "Résumé",
    resumeHref: "/en/resume/",
    photoAlt: "Profile photo of Kim Seonill",
    recordsAria: "Awards and published best practice",
    newTab: " (new tab)",
    workTitle: "Case studies",
    yearsRole: (y: number) => `${ROLE_EN} · ${y} years`,
    workLead: "Every number comes with its period and my share of the work.",
    capAria: "Find, test, improve — and the cases",
    loopKicker: "How I work",
    loopTitle: "How I solve problems",
    capProof: "Cases",
    capMore: "All tools and skills",
    capMoreHref: "/en/resume/#skills",
    moreLabel: "More records",
    moreResults: "6 more operating results",
    moreResultsLine: "Periods and headline figures for Samsonite, KakaoTalk Channel, Dongwon Mall, Saenghwal Baekseo, FUJIFILM BI and Autobell (Korean)",
    autoTitle: "Six automations I planned and built",
    autoLead: "I moved the inventory checks, reports and settlement people used to repeat into systems. I built them with AI tools, and decided myself when they must stop.",
    autoCase: "Automation case study",
    autoCaseHref: "/en/projects/automation/",
    autoAbout: "Effects and checks by system (Korean)",
    resumeWeb: "View résumé",
    resumePdf: "Résumé PDF (Korean)",
    portfolioPdf: "Portfolio PDF (Korean)",
    aboutAll: "Ways of working, full career and story (Korean)",
  },
} as const;
type UIText = (typeof UI)[Lang];

function Metric({ p, meta, ui }: { p: Project; meta: CardMeta; ui: UIText }) {
  const m = meta.metric ?? p.keyMetric;
  return (
    <div className="folio-case-result">
      <p className="folio-case-label">{meta.label ?? m.label}</p>
      <p className="folio-case-metric" data-enter="wipe">
        {m.before && m.before !== "기준" ? (
          <span className="folio-case-before">
            {m.before}
            <span aria-hidden="true"> → </span>
            <span className="sr-only">{ui.srFrom}</span>
          </span>
        ) : null}
        <CountUpValue value={m.after} delay={120} duration={1300} />
      </p>
      <p className="folio-case-basis">{meta.basis}</p>
    </div>
  );
}

function CaseCard({ p, no, size, lang }: { p: Project; no: number; size: "lg" | "sm"; lang: Lang }) {
  const ui = UI[lang];
  const meta = (lang === "en" ? caseCardsEn : CARD)[p.slug];
  return (
    <article id={`case-${p.slug}`} aria-labelledby={`case-title-${p.slug}`} className={`folio-case folio-case-${size}`} data-enter>
      <Link
        href={`${ui.casePrefix}${p.slug}/`}
        className={`folio-case-media${meta.contain ? " is-contain" : ""}`}
        style={{ "--tint": meta.tint } as CSSProperties}
        tabIndex={-1}
        aria-hidden="true"
      >
        <img
          src={`${BASE}/evidence/${meta.image}-960.webp`}
          alt=""
          width={960}
          height={640}
          loading={no <= 2 ? "eager" : "lazy"}
        />
      </Link>
      <p className="folio-case-tags">
        <span className="folio-case-no">{String(no).padStart(2, "0")}</span>
        <span className="folio-tag">{meta.capability}</span>
        <span className="folio-case-brand">{p.brand}</span>
      </p>
      {meta.award ? <p className="folio-case-award">{meta.award}</p> : null}
      <h3 id={`case-title-${p.slug}`} className="folio-case-title">
        <Link href={`${ui.casePrefix}${p.slug}/`}>{p.headline}</Link>
      </h3>
      {size === "lg" ? <p className="folio-case-story">{p.cardProblem ?? p.objective}</p> : null}
      <Metric p={p} meta={meta} ui={ui} />
      <p className="folio-case-scope"><span>{ui.scope}</span>{meta.scope}</p>
      <div className="folio-case-evidence">
        <Link href={`${ui.casePrefix}${p.slug}/`} className="folio-link-strong">{ui.readCase} <span aria-hidden="true">→</span></Link>
        <a
          href={`${BASE}/evidence/${meta.image}.webp`}
          target="_blank"
          rel="noopener"
          className="folio-link-quiet"
          aria-label={`${meta.alt}${ui.openFullAria}`}
        >
          {ui.openFull}
        </a>
      </div>
    </article>
  );
}

export default function HomeFolio({ lang = "ko" }: { lang?: Lang }) {
  const ui = UI[lang];
  const en = lang === "en";
  const records = en
    ? recordsEn.map((r) => ({ title: r.title, heroScope: r.scope, href: r.href }))
    : verification.filter((r) => r.heroScope);
  const lead = en ? LEAD.map((p) => getProjectEn(p.slug) ?? p) : LEAD;
  const rest = en ? REST.map((p) => getProjectEn(p.slug) ?? p) : REST;
  const proof = en ? coverEn.proof : generalCover.proof;
  const career = en ? coverEn.career : generalCover.career;
  const display = en ? coverEn.display : generalCover.display;
  const statement = en ? coverEn.statement : generalCover.statement;
  /* 대표 사례 머리 — 표지의 FIND · TEST · IMPROVE 를 사례로 잇는다 (site.ts generalCover.loop) */
  const loop = en ? coverEn.loop : generalCover.loop;
  return (
    <div className="folio">
      {/* 첫 방문 인트로 — 같은 탭에서 한 번만, 클릭·스크롤로 건너뜀 (IntroSplash.tsx) */}
      <IntroSplash lang={lang} />
      {/* ── 표지 ─────────────────────────────────────────── */}
      <section id="hero" className="folio-hero">
        <div className="folio-wrap folio-hero-grid">
          <div className="folio-hero-copy">
            <p className="folio-eyebrow">{`${en ? NAME_EN_DISPLAY : site.name} · ${ui.yearsRole(careerYear())}`}</p>
            {/* 영문 세 단어로 첫인상, 바로 밑 한국어 한 줄로 뜻 (2026.09.25 K+A) — 스크린리더는 한 제목으로 읽는다 */}
            <h1 className="folio-hero-title">
              {display.map((line, i) => (
                <span key={line} lang="en" className="folio-hero-display" style={{ "--l": i } as CSSProperties}>{line}</span>
              ))}
              <span className="folio-hero-sub" style={{ "--l": display.length } as CSSProperties}>
                {/* 띄어쓰기는 토막 사이에 둔다 — 인라인 블록 안 맨 앞 공백은 화면에서 사라진다 */}
                {statement.map((part, i) => (
                  <Fragment key={part}>{i ? " " : null}<span>{part}</span></Fragment>
                ))}
              </span>
            </h1>
            {/* 본인이 꼽은 강점 네 가지 (2026.09.25) — 첫 화면에서 한눈에 */}
            <ul className="folio-hero-strengths" style={{ "--l": display.length + 1 } as CSSProperties}>
              {heroStrengths[lang].map((s, i) => (
                <li key={s}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
                  {s}
                </li>
              ))}
            </ul>
            <p className="folio-hero-note"><Sentences text={en ? coverEn.note : generalCover.note} /></p>
            <div className="folio-hero-actions">
              <a href="#projects" className="folio-btn folio-btn-dark">{ui.seeWork} <span aria-hidden="true">↓</span></a>
              <EmailCopyButton email={site.emailPrimary} className="folio-btn folio-btn-line">{ui.copyEmail}</EmailCopyButton>
              <Link href={ui.resumeHref} className="folio-link-strong">{ui.resume} <span aria-hidden="true">→</span></Link>
            </div>
            {/* 결과 세 칸 — 값 아래 작은 줄이 기준이다 (2026.09.25) */}
            <dl className="folio-facts folio-proof">
              {proof.map((f, i) => (
                <div key={f.label}>
                  <dt>{f.label}</dt>
                  <dd className="folio-proof-value">
                    {"before" in f && f.before ? <span className="folio-proof-before">{f.before} </span> : null}
                    <CountUpValue value={f.after} delay={150 + i * 100} duration={1300} />
                  </dd>
                  <dd className="folio-proof-basis">{f.basis}</dd>
                </div>
              ))}
            </dl>
          </div>
          <figure className="folio-hero-photo">
            <img src={`${BASE}${site.profileImagePath}`} alt={ui.photoAlt} width={354} height={472} />
            <figcaption>{en ? ORG_EN : site.org}</figcaption>
          </figure>
        </div>

        <div className="folio-wrap">
          {/*
            지나온 길(발명·창업 동아리 → 전공 → 회사)을 경력 두 줄로 바꿨다 (2026.09.25).
            경력직 서류를 여는 사람이 첫 화면 다음에 찾는 것은 지금 어디서 무엇을 어느 규모로 맡았는가다.
            이야기는 /about/ 의 이야기 구간에 그대로 있다.
          */}
          <div className="folio-career">
            <p className="folio-story-label">{en ? coverEn.careerLabel : generalCover.careerLabel}</p>
            <ol>
              {career.map((c) => (
                <li key={c.where}>
                  <span className="folio-career-period">{c.period}</span>
                  <strong>{c.where}</strong>
                  <span><Sentences text={c.text} /></span>
                </li>
              ))}
            </ol>
            <p className="folio-brands">
              <span>{en ? coverEn.brandsLabel : generalCover.brandsLabel}</span>
              {en ? coverEn.brands : generalCover.brands}
            </p>
          </div>
          <ul id="records" className="folio-records" aria-label={ui.recordsAria}>
            {records.map((r) => (
              <li key={r.title}>
                <a href={r.href} target="_blank" rel="noopener">
                  {r.title} <span aria-hidden="true">↗</span><span className="sr-only">{ui.newTab}</span>
                </a>
                <span>{r.heroScope}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── 일하는 순서: FIND · TEST · IMPROVE (2026.09.26) — 스크롤하면 단계가 켜지고 사례 숫자가 바뀐다 ── */}
      <LoopStory
        steps={loop}
        kicker={ui.loopKicker}
        title={ui.loopTitle}
        proofLabel={ui.capProof}
        moreLabel={ui.capMore}
        moreHref={ui.capMoreHref}
        aria={ui.capAria}
      />

      {/* ── 대표 사례 ─────────────────────────────────────── */}
      <section id="projects" className="folio-section" aria-labelledby="work-title">
        <div className="folio-wrap">
          <p className="folio-kicker">Selected work</p>
          <h2 id="work-title" className="folio-h2">{ui.workTitle}</h2>
          <p className="folio-lead">{ui.workLead}</p>
          {/* 세 칸 목차(folio-capindex)는 위 LoopStory 구간이 대신한다 (2026.09.26) */}
          <div className="folio-grid-lg">
            {lead.map((p, i) => <CaseCard key={p.slug} p={p} no={i + 1} size="lg" lang={lang} />)}
          </div>
          <div className="folio-grid-sm">
            {rest.map((p, i) => <CaseCard key={p.slug} p={p} no={i + 3} size="sm" lang={lang} />)}
          </div>

          <div className="folio-more">
            <p className="folio-more-label">{ui.moreLabel}</p>
            <ul>
              {OTHER.map((p) => {
                /* 영문판 — 영문 상세가 있는 사례(자동화)는 영문으로, 나머지는 한국어 상세로 보내고 그렇다고 적는다 */
                const pe = en ? getProjectEn(p.slug) : undefined;
                const href = pe ? `/en/projects/${p.slug}/` : `/projects/${p.slug}/`;
                const brand = en ? pe?.brand ?? otherEn[p.slug]?.brand ?? p.brand : p.brand;
                const line = en
                  ? pe?.headline ?? `${otherEn[p.slug]?.line ?? p.headline} (Korean)`
                  : p.tier === "archive" ? p.objective : p.headline;
                return (
                  <li key={p.slug}>
                    <Link href={href}>
                      <strong>{brand}</strong>
                      <span>{line}</span>
                      <span aria-hidden="true">→</span>
                    </Link>
                  </li>
                );
              })}
              {/* 카드로 다루지 않는 추가 운영 성과 6건 — 기간·대표값과 함께 /about/ 에 있다 */}
              <li>
                <Link href="/about/#more-results">
                  <strong>{ui.moreResults}</strong>
                  <span>{ui.moreResultsLine}</span>
                  <span aria-hidden="true">→</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 업무 자동화 ─────────────────────────────────── */}
      <section id="automation" className="folio-section" aria-labelledby="automation-title">
        <div className="folio-wrap">
          <p className="folio-kicker">Marketing operations</p>
          <h2 id="automation-title" className="folio-h2">{ui.autoTitle}</h2>
          <p className="folio-lead">{ui.autoLead}</p>
          <div id="inventory-demo" className="folio-demo">
            <AutomationDemo lang={lang} />
          </div>
          <ol className="folio-systems">
            {SYSTEMS.map((c) => (
              <li key={c.no}>
                <span className="folio-system-no">{c.no}</span>
                <strong>{en ? systemsEn[c.no]?.name ?? c.name : c.name}</strong>
                {/* 옛 문제 대신 무엇을 만들었고 무엇이 달라졌는지 (2026.09.25) — 문제는 사례 상세에 있다 */}
                <span className="folio-system-built">{en ? systemsEn[c.no]?.built : c.builtShort ?? c.automated}</span>
                <span className="folio-system-effect">{en ? systemsEn[c.no]?.effect : c.homeEffect ?? c.effect}</span>
              </li>
            ))}
          </ol>
          <p className="folio-links">
            <Link href={ui.autoCaseHref} className="folio-link-strong">{ui.autoCase} <span aria-hidden="true">→</span></Link>
            <Link href="/about/#automation" className="folio-link-quiet">{ui.autoAbout} <span aria-hidden="true">→</span></Link>
          </p>
        </div>
      </section>

      {/* ── 연락 ─────────────────────────────────────────── */}
      <section id="contact" className="folio-section folio-contact" aria-labelledby="contact-title">
        <div className="folio-wrap">
          <p className="folio-kicker">Contact</p>
          <h2 id="contact-title" className="folio-contact-title">
            {(en ? contactEn.title : contact.title).map((line) => <span key={line}>{line}</span>)}
          </h2>
          <p className="folio-contact-note">{en ? contactEn.note : contact.interviewNote}</p>
          <EmailCopyButton email={site.emailPrimary} className="folio-email" />
          <div className="folio-contact-actions">
            <Link href={ui.resumeHref} className="folio-btn folio-btn-dark">{ui.resumeWeb}</Link>
            <a href={`${BASE}${site.resumePdfPath}`} download className="folio-btn folio-btn-line">{ui.resumePdf}</a>
            <a href={`${BASE}${edition.portfolioPdfPath}`} download className="folio-btn folio-btn-line">{ui.portfolioPdf}</a>
            <a href={site.linkedin} target="_blank" rel="noopener" className="folio-btn folio-btn-line">LinkedIn</a>
          </div>
          <Link href="/about/" className="folio-link-strong folio-about-link">{ui.aboutAll} <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </div>
  );
}
