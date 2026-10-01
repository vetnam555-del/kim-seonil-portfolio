import Link from "next/link";
import AutomationDemo from "@/components/AutomationDemo";
import EmailCopyButton from "@/components/EmailCopyButton";
import { CARD_METRICS, HOME_EVIDENCE } from "@/components/ProjectsSection";
import { AnchorStub, Container, Eyebrow, Section } from "@/components/ui";
import { evidenceSize } from "@/lib/evidence-size";
import { edition } from "@/data/edition";
import {
  automationCases,
  builtGroups,
  generalProfile,
  hero,
  heroFacts,
  howIWork,
  publicWork,
  verification,
  whatsNext,
} from "@/data/site";
import { creativeHistory } from "@/data/creative-history";
import { projects, type Metric as ProjectMetric, type Project } from "@/data/projects";

/**
 * 개편판(nw)의 홈.
 *
 * 기존 홈은 21,994px 다. 층이 넷(히어로 10초 · 이력서 4쪽 · 덱 33쪽 · 사이트)이라
 * 가장 깊은 층이 긴 것 자체는 잘못이 아니다. 다만 홈이 그 깊은 층까지 겸하고 있었다 —
 * 방식·이야기·역량·자동화가 전부 첫 화면 아래 한 줄로 쌓여 있어서, 어디까지가 요약이고
 * 어디부터가 본문인지 구분이 없었다. 그래서 홈을 '입구' 로만 만든다.
 *
 * ── 1차에서 실제로 못했던 것 세 가지 (2026-09-10 2차에서 고침)
 *  1) 히어로가 1단이라 오른쪽이 비었다. 레퍼런스는 얼굴로 첫 화면을 채우는 게 아니라
 *     오른쪽 절반에 두어 본문을 밀어내지 않는다. 처음에 "평가 서류에 얼굴 크게" 를
 *     경계하다 사진 자체를 뺐는데, 판단을 좁게 한 것이었다. 경력 한 줄도 같이 넣는다 —
 *     경력직 서류에서 "어느 단계의 사람인가" 는 이력서를 열어야 알 일이 아니다.
 *  2) 케이스 도판이 스프레드시트뿐이라 화면이 헐거웠다. 레퍼런스가 정돈돼 보이는 건
 *     앱 목업이 있어서인데, 그건 실력 차가 아니라 자산 차다. 이쪽 자산은 마감보고·실행
 *     로그다. 그래서 `accent` 색면을 쓴다 — projects.ts 에 "썸네일 색면(브랜드 로고 대신
 *     추상 색면 — 저작권 회피)" 용도로 이미 정의돼 있는데 쓰지 않고 있었다.
 *     색면 위에 수치를 얹고 실제 증빙은 그 아래 둔다. 증거를 버리지 않고 무게만 준다.
 *  3) 타이포가 절제된 게 아니라 그냥 작았다.
 *
 * ── 3차 (2026-09-13) — 공용판이 정보량에서 앞선 지점을 옮겨 온다
 *   두 판을 같은 기준으로 재 보니 개편판은 홈 글자 수가 공용판의 23% 였고, 기여 범위가
 *   세 곳에만 있었고, 보조 사례는 수치가 하나씩뿐이었다. 짧은 것은 장점이지만 "읽을 게
 *   없다" 로 넘어가면 이 사이트가 앞서는 지점(수치 옆의 근거)이 옅어진다.
 *   · 사례 카드에 문제 → 판단과 행동 → 확인한 결과, 기여 범위·규모·기간 칸, 보조 수치
 *   · 자동화 구간에 실행 순서 네 단계와 시스템 6종 — 공용판은 이걸 목록과 흐름도로 보여 준다
 *   · 링크 문구를 "사례 열기" 에서 "브랜드 상세 보기" 로 — 스크린리더가 링크만 훑어도 구분된다
 *   · 소개문 긴 판(sm 이상) — 공용판 개정 때 "고객이 무엇을 선택하는지 관찰해 온 경험" 이
 *     사이트에서 사라졌는데, 문장은 site.ts 에 남아 있었다
 *   구조(입구로서의 홈, 색면, 한 화면 한 주제)는 그대로 둔다.
 *
 * ── 레퍼런스에서 가져오지 않은 것
 *   · "Growth is a structure, not a moment." 류 영문 대구 — 말투 검수 T3 가 잡는 문형이다.
 *   · 기여 범위를 적지 않는 것. 그 사이트는 케이스 본문에 "비공개 서약에 따라 일부 수치를
 *     변형하거나 생략했다" 고만 적는다. 여기서는 수치마다 기여 범위·비교 기준·기간을
 *     붙인다 — 이 포트폴리오가 앞서는 지점이라 예뻐지자고 버릴 것이 아니다.
 */

/*
 * 사례 목록은 tier 로 고르면 안 된다. tier === "featured" 에는 신세계판 전용인
 * 쌤소나이트가 들어오고, 정작 일반판 다섯 번째인 강원심층수(supporting)가 빠진다.
 * 판이 무엇을 싣는지는 edition.spreadOrder 하나가 정한다.
 */
const featured = edition.spreadOrder
  .map((slug) => projects.find((p) => p.slug === slug))
  .filter((p): p is Project => Boolean(p));
const LEAD = featured.slice(0, 2);
const REST = featured.slice(2);

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const pad = (n: number) => String(n).padStart(2, "0");

/*
 * 카드에 거는 도판은 그 카드의 주장을 받쳐야 한다. evidence[0] 을 그냥 쓰면 어긋난다.
 *
 * 뉴발란스 카드의 주장은 "재고·운영 점검 시간 약 2시간 → 5분 이내" 인데, 이 케이스의
 * 첫 증빙은 제품 원본 사진이고 캡션에도 "촬영·제품 디자인은 개인 기여 범위로 주장하지
 * 않습니다" 라고 적혀 있다 — 기여하지 않은 사진을 자동화 주장 옆에 건 셈이었다.
 *
 * 제이에스티나는 도판이 맞지만 숫자 기준이 다르다. 카드는 352%→583%(동일 마감보고
 * 5월→7월)인데 이미지 안에는 210%→583%(마감보고 기재 개선 전 기준)가 적혀 있다.
 * alt 를 352% 로 고치는 것은 답이 아니다 — alt 는 이미지에 적힌 것을 말하는 자리라
 * 그렇게 하면 이미지를 거짓으로 설명하게 된다. 설명을 옆에 붙인다.
 */
const CARD_SHOT: Record<string, { file: string; alt: string; caption: string; note?: string }> = {
  newbalance: {
    file: "automation-inventory-guard.webp",
    alt: "쇼핑검색 재고 점검과 광고 조치의 실제 운영 기록 — 품절 상품의 소재가 PAUSED로 표시된 목록",
    caption: "정해진 주기로 재고를 확인해 품절 상품의 소재를 자동으로 멈춘 기록입니다.",
    note: "붉은 행이 이번 주기에 중단된 소재입니다. 입찰가 열은 비공개 처리했습니다.",
  },
  jestina: {
    file: "jestina-performance.webp",
    alt: "제이에스티나 IMC 캠페인 전환 프로젝트 마감 보고 슬라이드. 월별 운영 성과와 GA 데이터 표, ROAS 210%에서 583% 개선 기록.",
    caption: "캠페인 마감 보고 — 월별·카테고리별 매체 지표와 GA4 데이터를 같은 표에서 비교했습니다.",
    note: "이미지의 210% → 583% 는 마감보고에 적힌 개선 전 기준과 최종값입니다. 위 352% → 583% 는 동일 마감보고 기준으로 5월과 7월을 다시 맞춰 비교한 값이라 시작점이 다릅니다.",
  },
};

/*
 * 보조 수치는 공용판과 같은 허용 목록(CARD_METRICS)에서 가져온다. 여기서 따로 고르면
 * 두 판이 같은 사례에 서로 다른 수치를 걸게 된다 — 공용판이 그 표를 만든 이유가
 * "기준이 다른 값을 나란히 세우지 않는다" 였으니, 판이 달라도 같은 표를 따라야 한다.
 * 라벨을 못 찾으면 공용판처럼 빌드를 세운다. 조용히 빠지면 원래 없던 것처럼 보인다.
 */
function cardExtras(p: Project): ProjectMetric[] {
  return (CARD_METRICS[p.slug] ?? []).map((label) => {
    const m = p.detail.results.find((r) => r.label === label);
    if (!m) {
      throw new Error(`CARD_METRICS["${p.slug}"] 의 "${label}" 이 results 에 없습니다.`);
    }
    return m;
  });
}

function channelLabel(channels: readonly string[]) {
  const head = channels.slice(0, 3).join(" · ");
  const rest = channels.length - 3;
  return rest > 0 ? `${head} 외 ${rest}` : head;
}

/* 수치와 그 산출 기준은 성격이 달라 줄을 나눈다 — 괄호 안이 좁은 폭에서 쪼개지지 않게 */
function splitBasis(effect: string) {
  const m = effect.match(/^(.*?)\s*\(([^)]*)\)\s*$/);
  return m ? { value: m[1], basis: m[2] } : { value: effect, basis: null };
}

/*
 * 브랜드 색면. accent 두 색을 대각선으로 깔고 검은 막을 한 겹 덮는다.
 * 막이 없으면 강원심층수(#0BA37F)처럼 밝은 색 위의 흰 글자가 3:1 을 못 넘긴다.
 */
function panelStyle(p: Project) {
  return {
    backgroundImage:
      `linear-gradient(0deg, rgba(0,0,0,0.34), rgba(0,0,0,0.34)),` +
      `linear-gradient(135deg, ${p.accent[1]}, ${p.accent[0]})`,
  };
}

function MetricLine({ p, size }: { p: Project; size: "lg" | "sm" }) {
  const m = p.keyMetric;
  return (
    <>
      {/* 화살표가 줄 끝에 혼자 남지 않게 묶는다 — 줄바꿈 검수가 보는 항목이다 */}
      <p className={`${size === "lg" ? "text-metric" : "text-metric-sm"} whitespace-nowrap text-on-ink`}>
        {m.before && m.before !== "기준" ? <span className="text-on-ink-2">{m.before} → </span> : null}
        {m.after}
      </p>
      <p className="mt-2 text-caption text-on-ink-2">{m.label}</p>
      {/* 대표 수치에도 산출 기준을 붙인다. 색면 위라고 단서를 생략하면 가장 큰 숫자만 맨몸이 된다 */}
      {m.note ? <p className="mt-1 max-w-[40rem] text-caption text-on-ink-2">{m.note}</p> : null}
    </>
  );
}

function ExtraMetrics({ items, compact = false }: { items: ProjectMetric[]; compact?: boolean }) {
  if (!items.length) return null;
  return (
    <dl
      className={
        compact
          ? "mt-5 flex flex-col gap-3.5 border-t border-line-2 pt-4"
          : "mt-10 grid gap-x-8 gap-y-6 border-y border-line-2 py-6 sm:grid-cols-2 lg:grid-cols-3"
      }
    >
      {items.map((m) => (
        <div key={m.label} className="min-w-0">
          <dt className="text-caption text-ink-3">{m.label}</dt>
          <dd
            className={`mt-1 whitespace-nowrap font-semibold text-ink ${compact ? "text-small" : "text-h3"}`}
          >
            {m.before && m.before !== "기준" ? <span className="font-normal text-ink-3">{m.before} → </span> : null}
            {m.after}
          </dd>
          {m.note ? <dd className="mt-1 text-caption text-ink-3">{m.note}</dd> : null}
        </div>
      ))}
    </dl>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] gap-3">
      <dt className="text-ink-3">{label}</dt>
      <dd className="text-ink-2 [overflow-wrap:anywhere]">{value}</dd>
    </div>
  );
}

function LeadCase({ p, no }: { p: Project; no: number }) {
  const shot = CARD_SHOT[p.slug] ?? p.detail.evidence?.[0];
  const steps = [
    { label: "문제", body: p.cardProblem ?? p.objective },
    { label: "판단과 행동", body: p.cardDecision ?? p.detail.strategy },
  ];
  return (
    <article id={`case-${p.slug}`} aria-labelledby={`case-title-${p.slug}`}>
      <div
        className="flex min-h-[15rem] flex-col justify-between rounded-card p-8 md:min-h-[17rem] md:p-10"
        style={panelStyle(p)}
      >
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="font-mono text-mono font-bold tracking-[0.08em] text-on-ink">{pad(no)}</span>
          {/* 문서가 "주력 두 건" 이라고 말하는 것을 카드에서도 보이게 한다 */}
          <span className="rounded-full border border-white/45 px-2.5 py-0.5 text-caption font-semibold text-on-ink">
            주력 사례
          </span>
          {p.categories.slice(0, 3).map((c) => (
            <span key={c} className="font-mono text-mono tracking-[0.06em] text-on-ink-2 uppercase">
              {c}
            </span>
          ))}
        </div>
        <div className="mt-10">
          <p className="text-h3 font-semibold text-on-ink">{p.brand}</p>
          <p className="mt-4 font-mono text-mono tracking-[0.06em] text-on-ink-2">확인한 결과</p>
          <div className="mt-1.5">
            <MetricLine p={p} size="lg" />
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
        <div className="min-w-0">
          <h3 id={`case-title-${p.slug}`} className="text-case-h text-ink">
            {p.headline}
          </h3>
          <p className="mt-3 text-caption text-ink-3">{p.role}</p>
          {/*
            단계 이름은 제목(h4)으로 둔다. 같은 li 안의 p 로 두었더니 말투 검수가
            "01 문제 매출은 …" 을 케이스 상세의 같은 문장과 다른 문장으로 세어 T11 에 걸렸다 —
            공용판 ReadingCase 도 같은 이유로 h4 를 쓴다.
          */}
          <ol className="mt-8 flex flex-col gap-6">
            {steps.map((s, i) => (
              <li key={s.label}>
                <h4 className="text-small font-semibold text-ink">
                  <span className="mr-3 font-mono text-mono text-accent">{pad(i + 1)}</span>
                  {s.label}
                </h4>
                <p className="mt-2 text-body text-ink-2">{s.body}</p>
              </li>
            ))}
          </ol>
          {/* 수치 옆에 늘 붙는 단서. 이게 빠지면 이 사이트가 스스로 내건 규율이 무너진다. */}
          <dl className="mt-8 flex flex-col gap-3 border-t border-line-2 pt-5 text-caption">
            <Fact label="기여 범위" value={p.contributionNote ?? `기여도 ${p.contribution}%`} />
            {p.scale ? <Fact label={p.scaleLabel ?? "규모"} value={p.scale} /> : null}
            <Fact label="기간 · 채널" value={`${p.period} · ${channelLabel(p.channels)}`} />
            <Fact label="근거" value={p.evidenceLabel} />
          </dl>
        </div>

        {shot ? (
          <figure className="min-w-0">
            <img
              {...evidenceSize(shot.file)}
              src={`${BASE}/evidence/${shot.file}`}
              alt={shot.alt}
              loading="lazy"
              decoding="async"
              className="w-full rounded-card border border-line-2 bg-bg-alt"
            />
            <figcaption className="mt-3 text-caption text-ink-3">{shot.caption}</figcaption>
            {"note" in shot && shot.note ? (
              <p className="mt-2 text-caption text-ink-3">{shot.note}</p>
            ) : null}
            {/*
              원본을 열 수 있다는 것이 이 포트폴리오의 신뢰 장치다. 홈을 가볍게 만든다고
              이걸 빼면 "성과만 큰 화면" 이 된다 — 레퍼런스가 정확히 그 상태였다.
            */}
            <a
              href={`${BASE}/evidence/${shot.file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-[44px] items-center text-caption font-semibold text-accent underline underline-offset-4"
              aria-label={`원본 크기로 열기 · ${shot.alt} (새 탭)`}
            >
              원본 크기로 열기 ↗
            </a>
          </figure>
        ) : null}
      </div>

      <ExtraMetrics items={cardExtras(p)} />

      <Link
        href={`/projects/${p.slug}/`}
        className="mt-6 inline-flex min-h-[44px] items-center font-semibold text-accent underline underline-offset-4"
      >
        {p.brand} 상세 보기 →
      </Link>
    </article>
  );
}

function RestCase({ p, no }: { p: Project; no: number }) {
  /*
   * 썸네일은 공용판이 432px 칸에서 읽히는지 보고 고른 파일(HOME_EVIDENCE)을 먼저 쓴다.
   * evidence[0] 은 상세 페이지 704px 기준으로 고른 것이라, 다이슨처럼 리포트 코멘트
   * 블록이면 이 크기에서 회색 덩어리로만 보인다.
   */
  const file = HOME_EVIDENCE[p.slug] ?? p.detail.evidence?.[0]?.file;
  const alt = p.detail.evidence?.find((e) => e.file === file)?.alt ?? `${p.brand} 실행 증빙`;
  return (
    <article id={`case-${p.slug}`} aria-labelledby={`case-title-${p.slug}`} className="flex min-w-0 flex-col">
      <div className="flex flex-col justify-between rounded-card p-6" style={panelStyle(p)}>
        <div className="flex items-center gap-3">
          <span className="font-mono text-mono font-bold tracking-[0.08em] text-on-ink">{pad(no)}</span>
          <span className="font-mono text-mono tracking-[0.06em] text-on-ink-2 uppercase">
            {p.categories[0]}
          </span>
        </div>
        <div className="mt-8">
          <p className="text-small font-semibold text-on-ink">{p.brand}</p>
          <div className="mt-2">
            <MetricLine p={p} size="sm" />
          </div>
        </div>
      </div>
      <h3 id={`case-title-${p.slug}`} className="mt-5 text-body font-semibold text-ink">
        {p.headline}
      </h3>
      <div className="mt-3">
        <h4 className="text-caption font-semibold text-ink">판단과 행동</h4>
        <p className="mt-1 text-caption text-ink-2">{p.cardDecision ?? p.detail.strategy}</p>
      </div>
      <ExtraMetrics items={cardExtras(p)} compact />
      {/*
        기여율만 남기면 "100%" 가 무엇의 100% 인지 사라진다. 대교는 측정 QA 설계 100% 이고
        강원심층수는 단독 계정 운영인데, 숫자만 보면 둘이 같은 말로 읽힌다.
      */}
      <p className="mt-4 text-caption text-ink-3">
        기여 범위 · {p.contributionNote ?? `기여도 ${p.contribution}%`} · {p.period}
      </p>
      {/*
        보조 사례에도 증빙을 붙인다. 1차 개편에서 주력 둘만 도판을 두었더니 홈의
        증빙 원본 링크가 5개에서 2개로 줄었다 — 이 사이트가 앞서는 지점이 "수치 옆에
        원본이 있다" 인데, 정리하다 그걸 절반 넘게 덜어낸 것이었다.
      */}
      {file ? (
        <figure className="mt-5">
          <img
            {...evidenceSize(file)}
            src={`${BASE}/evidence/${file}`}
            alt={alt}
            loading="lazy"
            decoding="async"
            className="h-36 w-full rounded-card border border-line-2 object-cover object-top"
          />
          <figcaption className="mt-2.5">
            <a
              href={`${BASE}/evidence/${file}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[36px] items-center text-caption font-semibold text-accent underline underline-offset-4"
              aria-label={`${p.brand} 증빙 원본 크기로 열기 (새 탭)`}
            >
              원본 크기로 열기 ↗
            </a>
          </figcaption>
        </figure>
      ) : null}
      <Link
        href={`/projects/${p.slug}/`}
        className="mt-4 inline-flex min-h-[44px] items-center text-small font-semibold text-accent underline underline-offset-4"
      >
        {p.brand} 상세 보기 →
      </Link>
    </article>
  );
}

/* 공용판 자동화 구간의 흐름도와 같은 네 단계 — 문구도 같게 둔다 */
const WORKFLOW = [
  { title: "수집", note: "매체·재고 데이터" },
  { title: "검수", note: "시점·범위·누락 확인" },
  { title: "실행", note: "품절 중단·복구 재개" },
  { title: "기록", note: "시트 기록·사후 QA" },
];

/* 번호가 아니라 묶음(없앤 위험) 순서로 싣는다 — 공용판 카드 순서와 같다 */
const SYSTEMS = builtGroups
  .flatMap((g) => [...g.members])
  .map((no) => automationCases.find((c) => c.no === no))
  .filter((c): c is (typeof automationCases)[number] => Boolean(c));

export default function HomeNew() {
  return (
    <>
      {/* ── 첫 화면 ─────────────────────────────────────────── */}
      <Section id="hero" tone="white" className="hero-aurora pt-24 md:pt-32 lg:pt-36">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr] lg:items-center lg:gap-20">
            <div className="min-w-0">
              <Eyebrow>{generalProfile.eyebrow}</Eyebrow>
              <h1 className="mt-6 text-cover text-ink">{generalProfile.title[0]}</h1>
              <p className="mt-3 text-deck text-ink-2">{edition.role}</p>
              {/* 경력직 서류에서 "어느 단계의 사람인가" 는 이력서를 열어야 알 일이 아니다 */}
              <p className="mt-2 text-small text-ink-3">{hero.identity} · 퍼포먼스 마케팅 경력 4년</p>
              <p className="mt-10 max-w-[32rem] text-h2 text-ink">{edition.deck}</p>
              {/* intro 와 introShort 는 나란히 놓이는 문단이 아니라 폭에 따라 서로를 대신하는 쌍이다 */}
              <p className="mt-6 max-w-[36rem] text-body text-ink-2">
                <span className="sm:hidden">{generalProfile.introShort}</span>
                <span className="hidden sm:inline">{generalProfile.intro}</span>
              </p>

              <div className="mt-12 grid max-w-[34rem] grid-cols-3 gap-6 border-t border-line pt-8">
                {heroFacts.map((f) => (
                  <div key={f.label}>
                    <p className="text-metric-sm text-ink">{f.value}</p>
                    <p className="mt-1 text-caption text-ink-3">{f.label}</p>
                  </div>
                ))}
              </div>

              {/*
                외부에서 확인할 수 있는 기록을 첫 화면에 둔다. 1차 개편에서 이력서로
                내려보냈더니 홈의 외부 링크가 20개에서 2개가 됐다 — "수상했다" 가 아니라
                "여기서 확인하세요" 가 이 포트폴리오의 강점인데 그게 첫 화면에서 빠졌다.
                heroScope 가 붙은 둘만 올린다. 나머지는 아래 CONTACT 에 모아 둔다.
              */}
              <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2 border-t border-line-2 pt-6">
                {verification
                  .filter((v) => v.heroScope)
                  .map((v) => (
                    <li key={v.title} className="min-w-0">
                      <p className="text-caption text-ink-2">{v.title}</p>
                      <a
                        href={v.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 inline-flex min-h-[32px] items-center text-caption font-semibold text-accent underline underline-offset-4"
                      >
                        {v.label} ↗
                      </a>
                    </li>
                  ))}
              </ul>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link
                  href="#work"
                  className="inline-flex min-h-[48px] items-center rounded-card bg-ink px-6 font-semibold text-on-ink"
                >
                  사례 보기 ↓
                </Link>
                <Link
                  href="/resume/"
                  className="inline-flex min-h-[48px] items-center rounded-card border border-line px-6 font-semibold text-ink"
                >
                  이력서
                </Link>
              </div>
            </div>

            {/*
              레퍼런스는 얼굴로 첫 화면을 채우는 게 아니라 오른쪽 절반에 둔다.
              본문을 밀어내지 않으므로 "무엇을 했나" 가 뒤로 가지 않는다.
              좁은 화면에서는 본문이 먼저라 감춘다.
            */}
            <div className="hidden lg:block">
              <img
                src={`${BASE}/profile-kim-seonil.jpeg`}
                alt=""
                width={354}
                height={472}
                /*
                  흑백으로 깐다. 원본이 증명사진이라 그대로 두면 여권 사진처럼 읽히는데,
                  이 사이트는 흑백 편집 체계라 색을 빼면 오히려 의도한 화면이 된다.
                */
                className="w-full rounded-card border border-line-2 object-cover grayscale"
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* ── 사례 ───────────────────────────────────────────── */}
      <Section id="work" tone="paper">
        <Container>
          {/* 케이스 상세·이력서·OG 링크가 옛 앵커로 들어와도 여기 닿게 한다 */}
          <AnchorStub id="projects" />
          <Eyebrow>01 · SELECTED WORK</Eyebrow>
          <h2 className="mt-5 max-w-[34rem] text-h2 text-ink">
            맡은 범위와 근거를 수치 옆에 함께 적었습니다
          </h2>
          {/*
            안내문이지 표제가 아니다. 본문 크기로 두었더니 360px 에서
            "제이에스티나(고객 단계별 예산 배분)" 의 괄호가 줄을 넘어 갈라졌다(줄바꿈 검수).
          */}
          <p className="mt-4 max-w-[38rem] text-small text-ink-3">{edition.projectScanGuide}</p>

          <div className="mt-16 flex flex-col gap-24">
            {LEAD.map((p, i) => (
              <LeadCase key={p.slug} p={p} no={i + 1} />
            ))}
          </div>

          <div className="mt-24 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {REST.map((p, i) => (
              <RestCase key={p.slug} p={p} no={LEAD.length + i + 1} />
            ))}
          </div>

          {/*
            편집 기준은 사례를 다 본 자리에 둔다. site.ts 가 적어 둔 대로, 수치를 하나도 안 본
            사람에게 먼저 말하면 방어적으로 읽히고, 각주·기여 범위를 보고 내려온 자리에서는
            앞에서 본 것의 설명이 된다.
          */}
          <ul className="mt-20 grid max-w-[48rem] gap-x-10 gap-y-2.5 border-t border-line pt-7 sm:grid-cols-2">
            {hero.dataPolicy.map((line) => (
              <li key={line} className="flex gap-2.5 text-caption text-ink-2">
                <span aria-hidden="true" className="text-accent">
                  ✓
                </span>
                {line}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* ── 일하는 방식 ─────────────────────────────────────── */}
      <Section id="method" tone="white">
        <Container>
          <AnchorStub id="skills" />
          <AnchorStub id="story" />
          <AnchorStub id="why-studio" />
          <Eyebrow>02 · HOW I WORK</Eyebrow>
          <h2 className="mt-5 text-h2 text-ink">{howIWork.title}</h2>
          <div className="mt-14 grid gap-12 md:grid-cols-3">
            {howIWork.items.map((it) => (
              <div key={it.no} className="border-t border-line pt-7">
                <span className="font-mono text-mono font-bold tracking-[0.08em] text-accent">{it.no}</span>
                <h3 className="mt-4 text-h3 text-ink">{it.title}</h3>
                <p className="mt-4 text-small text-ink-2">{it.desc}</p>
                <p className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-caption text-ink-3">
                  {it.related.map((r) => (
                    <Link key={r.slug} href={`/projects/${r.slug}/`} className="underline underline-offset-4">
                      {r.label}
                    </Link>
                  ))}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── 자동화 ─────────────────────────────────────────── */}
      <Section id="automation" tone="ink">
        <Container>
          <Eyebrow className="text-accent">03 · SYSTEMS</Eyebrow>
          <h2 className="mt-5 max-w-[34rem] text-h2 text-on-ink">
            사람이 기억해서 확인하던 업무를 시스템으로 옮겼습니다
          </h2>
          <p className="mt-6 max-w-[40rem] text-body text-on-ink-2">
            재고·소진·랜딩·리포트·정산을 정해진 주기로 확인하는 시스템 6종을 기획·구축해
            운영합니다. 6종 모두 데이터가 정상이라는 증거가 없으면 실행하지 않습니다.
          </p>

          {/*
            "증거가 없으면 실행하지 않는다" 를 글이 아니라 순서로 보여 준다.
            읽기 전에 구조가 먼저 보여야 자동화가 이 사람의 강점이라는 게 훑는 사이에 남는다.
          */}
          <figure className="mt-12" aria-labelledby="nw-workflow-title">
            <figcaption id="nw-workflow-title" className="text-small font-semibold text-on-ink">
              재고 자동화의 실행 순서
            </figcaption>
            <ol className="mt-5 grid grid-cols-2 gap-x-6 gap-y-6 md:grid-cols-4">
              {WORKFLOW.map((s, i) => (
                <li key={s.title} className="min-w-0 border-t-2 border-accent pt-4">
                  <p className="text-body font-semibold text-on-ink">
                    <span className="mr-3 font-mono text-mono text-accent">{pad(i + 1)}</span>
                    {s.title}
                  </p>
                  <p className="mt-2 text-caption text-on-ink-2">{s.note}</p>
                </li>
              ))}
            </ol>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-1">
              <p className="whitespace-nowrap text-caption font-semibold text-on-ink sm:text-small">
                검수 실패 → 광고 변경 0건으로 종료
              </p>
              <a
                href="#inventory-demo"
                className="inline-flex min-h-[44px] items-center text-caption font-semibold text-accent underline underline-offset-4"
              >
                재고 자동화 동작 보기 ↓
              </a>
            </div>
          </figure>

          {/*
            6종을 문장 하나로만 말하면 "만들었다" 는 주장만 남는다. 무엇을 자동으로
            처리하는지와 효과 한 줄을 붙인다. 운영 품질 문장(quality)은 상세에 둔다 —
            "수식 오류 0건" 처럼 범위를 한정해야 하는 표현이 많아 홈에서 줄이면 과장이 된다.
          */}
          <ul className="mt-14 grid gap-x-10 gap-y-10 border-t border-rule-ink pt-10 sm:grid-cols-2 lg:grid-cols-3">
            {SYSTEMS.map((c) => {
              const e = splitBasis(c.effect);
              return (
                <li key={c.no} className="min-w-0">
                  <span className="font-mono text-mono font-bold text-accent">{c.no}</span>
                  <h3 className="mt-2 text-body font-semibold text-on-ink">{c.name}</h3>
                  <p className="mt-2 text-caption leading-[1.7] text-on-ink-2">{c.automated}</p>
                  <p className="mt-3 text-small font-semibold text-on-ink">{e.value}</p>
                  {e.basis ? (
                    <p className="mt-0.5 whitespace-nowrap text-caption text-on-ink-2">{e.basis}</p>
                  ) : null}
                </li>
              );
            })}
          </ul>

          <Link
            href="/projects/automation/"
            className="mt-12 inline-flex min-h-[48px] items-center rounded-card bg-on-ink px-6 font-semibold text-ink"
          >
            실행 구조 보기 →
          </Link>

          {/*
            1차 개편에서 이 데모를 뺐다가 되살린다. 빼고 나니 '시스템 6종을 만들었다' 는
            주장만 남고 움직이는 증거가 사이트 어디에도 없었다 — 자동화가 이 사람의
            가장 희소한 강점인데 그걸 글로만 말하고 있었다는 뜻이다.
          */}
          <div id="inventory-demo" className="mt-14 scroll-mt-24">
            <AutomationDemo />
          </div>
        </Container>
      </Section>

      {/* ── 직접 만들어 공개한 것 ───────────────────────────── */}
      <Section id="made" tone="paper">
        <Container>
          <Eyebrow>04 · MADE &amp; PUBLISHED</Eyebrow>
          <h2 className="mt-5 max-w-[36rem] text-h2 text-ink">
            만든 것은 지금 열어서 확인할 수 있습니다
          </h2>
          <div className="mt-14 grid gap-10 md:grid-cols-2">
            {publicWork.map((w) => (
              <article key={w.title} className="flex flex-col border-t border-line pt-7">
                <span className="font-mono text-mono tracking-[0.06em] text-ink-3">{w.label}</span>
                <h3 className="mt-4 text-h3 text-ink">{w.title}</h3>
                <p className="mt-4 text-small leading-[1.75] text-ink-2">{w.desc}</p>
                <dl className="mt-6 flex flex-wrap gap-x-5 gap-y-1.5">
                  {w.facts.map((f) => (
                    <dd key={f} className="text-caption text-ink-3">
                      {f}
                    </dd>
                  ))}
                </dl>
                <a
                  href={w.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex min-h-[44px] items-center font-semibold text-accent underline underline-offset-4"
                >
                  {w.linkLabel} ↗
                </a>
              </article>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── 기획의 출발점 ──────────────────────────────────── */}
      <Section id="origin" tone="white">
        <Container>
          <AnchorStub id="creative-roots" />
          <Eyebrow>05 · ORIGIN</Eyebrow>
          <h2 className="mt-5 max-w-[36rem] text-h2 text-ink">
            광고를 맡기 전에 제품과 콘텐츠를 직접 만들었습니다
          </h2>
          {/*
            창업·초기 기획을 되살린다. 1차 개편에서 통째로 빠졌는데, 소개문에는
            "산업디자인과 창업에서 출발해" 가 남아 있었다 — 주장만 있고 근거가 없는 상태였다.
            홈에서는 넉 장을 한 줄로 훑기만 하고, 판단 과정은 덱과 케이스에 둔다.
          */}
          <ul className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {creativeHistory.map((c) => (
              <li key={c.id} className="border-t border-line pt-6">
                <img
                  {...evidenceSize(c.image)}
                  src={`${BASE}/evidence/${c.image}`}
                  alt={c.alt}
                  loading="lazy"
                  decoding="async"
                  className="mb-5 w-full rounded-card border border-line-2 object-cover"
                />
                <span className="font-mono text-mono tracking-[0.06em] text-ink-3">{c.stage}</span>
                <h3 className="mt-3 text-body font-semibold text-ink">{c.name}</h3>
                <p className="mt-2.5 text-caption leading-[1.7] text-ink-3">{c.role}</p>
                {/*
                  판단 근거는 접어 둔다. 카드만 넉 장 늘어놓으면 "참여했다" 로만 읽히는데,
                  이 시기의 값어치는 참여가 아니라 무엇을 보고 무엇을 골랐는지다.
                  접혀 있으므로 홈 높이는 거의 늘지 않고, 궁금한 사람만 편다.
                */}
                <details className="group mt-4">
                  <summary className="flex min-h-[36px] cursor-pointer list-none items-center gap-1.5 text-caption font-semibold text-ink-2 marker:hidden">
                    기획 판단과 근거
                    <span className="text-accent transition-transform group-open:rotate-45" aria-hidden="true">
                      ＋
                    </span>
                  </summary>
                  <dl className="mt-3 flex flex-col gap-2.5 border-t border-line-2 pt-3">
                    {c.decisions.map((d) => (
                      <div key={d.label}>
                        <dt className="text-caption font-semibold text-ink">{d.label}</dt>
                        <dd className="mt-1 text-caption leading-[1.7] text-ink-3">{d.text}</dd>
                      </div>
                    ))}
                  </dl>
                </details>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-[42rem] text-caption text-ink-3">
            <span className="block">학생·인턴 시기의 팀 프로젝트입니다.</span>
            <span className="block">수상명보다 맡은 역할과 산출물을 적었습니다.</span>
          </p>
        </Container>
      </Section>

      {/* ── 연락 ───────────────────────────────────────────── */}
      <Section id="contact" tone="white">
        <Container>
          <AnchorStub id="career" />
          <Eyebrow>06 · CONTACT</Eyebrow>
          <h2 className="mt-5 text-h2 text-ink">
            {generalProfile.title[0]} · {edition.role}
          </h2>
          <p className="mt-6 max-w-[34rem] text-body text-ink-2">
            캠페인 운영과 측정 기준을 맡고, 팀이 반복해서 사용할 업무 절차를 정리하겠습니다.
          </p>
          {/*
            다음 역할을 되살린다. 1차 개편에서 빠졌는데, 이건 지원자가 스스로 방향을
            밝히는 유일한 자리다. 없으면 사례만 있고 "그래서 무엇을 맡고 싶은가" 가 없다.
            제목 두 줄만 가져오고 본문 세 문단은 이력서에 둔다.
          */}
          <p className="mt-12 font-mono text-mono tracking-[0.06em] text-ink-3">{whatsNext.eyebrow}</p>
          <p className="mt-4 max-w-[36rem] text-h3 leading-[1.55] text-ink">
            {whatsNext.title.join(" ")}
          </p>

          {/*
            나머지 검증 기록을 접어서 모아 둔다. 언론 출처 셋(쿠키뉴스·베리타스알파·KPI뉴스)은
            secondaryHref 라 1차 개편에서 사이트 전체에서 사라져 있었다.
            접혀 있으므로 높이는 거의 안 늘고, 확인하려는 사람은 한 번에 다 본다.
          */}
          <details className="group mt-12 max-w-[42rem] rounded-card border border-line bg-bg-alt">
            <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 px-5 text-small font-semibold text-ink marker:hidden">
              외부에서 확인할 수 있는 기록 {verification.length}건
              <span className="text-accent transition-transform group-open:rotate-45" aria-hidden="true">
                ＋
              </span>
            </summary>
            <ul className="flex flex-col gap-4 border-t border-line px-5 py-5">
              {verification.map((v) => (
                <li key={v.title}>
                  <p className="text-caption font-semibold text-ink">{v.title}</p>
                  <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1">
                    <a
                      href={v.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-[32px] items-center text-caption text-accent underline underline-offset-4"
                    >
                      {v.label} ↗
                    </a>
                    {v.secondaryHref ? (
                      <a
                        href={v.secondaryHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-[32px] items-center text-caption text-accent underline underline-offset-4"
                      >
                        {v.secondaryLabel ?? "다른 출처"} ↗
                      </a>
                    ) : null}
                  </p>
                </li>
              ))}
            </ul>
          </details>

          <p className="mt-10 text-caption text-ink-3">{generalProfile.interestLabel}</p>
          <p className="mt-2 max-w-[34rem] text-small text-ink-2">
            {generalProfile.interests.join(" · ")}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <a
              href="mailto:makefair@naver.com"
              className="inline-flex min-h-[48px] items-center text-h3 font-semibold text-accent underline underline-offset-4"
            >
              makefair@naver.com
            </a>
            <EmailCopyButton
              email="makefair@naver.com"
              className="inline-flex min-h-[44px] items-center rounded-card border border-line px-5 text-small font-semibold text-ink"
            >
              이메일 주소 복사
            </EmailCopyButton>
          </div>
        </Container>
      </Section>
    </>
  );
}
