import Link from "next/link";
import type { ReactNode } from "react";
import CountUpValue from "@/components/CountUpValue";
import type { Metric } from "@/data/projects";

/** 잡지 판형 — 기존 1120px에서 넓혔다. 12칼럼 그리드의 기준 폭이다. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1240px] px-5 sm:px-10 ${className}`}>{children}</div>;
}

/**
 * 섹션 배경. 흰색 / 종이색(paper) / 다크(ink) 셋뿐이고, 경계는 여백이 아니라
 * 1px 룰과 배경 교대로 만든다 — 토스식 120~160px 패딩을 흉내내면 개인 지원자
 * 페이지에서는 "보여줄 게 없어서 비운 것"으로 읽힌다.
 */
export function Section({
  id,
  children,
  tone = "white",
  className = "",
}: {
  id?: string;
  children: ReactNode;
  tone?: "white" | "paper" | "ink";
  className?: string;
}) {
  const tones = {
    white: "bg-bg text-ink",
    paper: "bg-paper text-ink",
    ink: "bg-ink text-on-ink",
  } as const;
  return (
    <section
      id={id}
      className={`scroll-mt-[80px] py-14 md:py-[72px] lg:py-[88px] ${tones[tone]} ${className}`}
    >
      {children}
    </section>
  );
}

/**
 * 사라진 섹션의 앵커를 흡수한 섹션 안에 남겨 둔다. 케이스 상세·이력서·OG 링크가
 * 예전 id로 들어와도 깨지지 않게 하는 용도다.
 */
export function AnchorStub({ id }: { id: string }) {
  return <span id={id} className="block h-0 scroll-mt-[80px]" aria-hidden="true" />;
}

/**
 * 한글에는 uppercase 가 무효인데 넓은 자간만 남아 글자가 벌어진다.
 * 그래서 한글이 섞이면 uppercase 와 넓은 자간을 쓰지 않는다.
 *
 * as="h3" — 바로 아래에 별도 heading이 없는 서브섹션(Education·Awards·Certifications 등)에서 쓴다.
 * 그런 자리에 <p>만 두면 스크린리더의 heading 탐색 목록에서 그 구간이 통째로 빠진다.
 */
export function Eyebrow({
  children,
  className = "",
  as = "p",
}: {
  children: ReactNode;
  className?: string;
  as?: "p" | "h3";
}) {
  const hasHangul = typeof children === "string" && /[가-힣]/.test(children);
  const typeCls = hasHangul
    ? "tracking-[0.01em]"
    : "tracking-[0.14em] uppercase";
  const Tag = as;
  return (
    <Tag className={`font-mono text-mono font-bold text-ink-3 ${typeCls} ${className}`}>{children}</Tag>
  );
}

/** 섹션당 메시지 하나 — kicker / 제목 / 짧은 설명 */
export function SectionHeading({
  eyebrow,
  title,
  desc,
  className = "",
}: {
  eyebrow?: string;
  title: ReactNode;
  desc?: string;
  className?: string;
}) {
  return (
    <div className={`max-w-[42rem] ${className}`}>
      {eyebrow ? <Eyebrow className="mb-4">{eyebrow}</Eyebrow> : null}
      <h2 className="text-[1.75rem] leading-[1.32] font-bold tracking-normal sm:text-h2">
        {title}
      </h2>
      {desc ? <p className="mt-4 text-small text-ink-3 sm:text-body">{desc}</p> : null}
    </div>
  );
}

export function CTAButton({
  href,
  children,
  variant = "primary",
  external = false,
  download = false,
  onDark = false,
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "ghost" | "text";
  external?: boolean;
  download?: boolean;
  /** 어두운 지면 위에 놓일 때. 기본 스타일은 잉크색이라 다크에서 사라진다 */
  onDark?: boolean;
  className?: string;
}) {
  const base =
    "inline-flex min-h-[48px] items-center justify-center px-6 font-mono text-[0.8125rem] font-bold tracking-[0.02em] transition-colors duration-150 ease-out motion-reduce:transition-none";
  const styles = onDark
    ? ({
        primary: "bg-on-ink text-ink hover:bg-signal-ink hover:text-ink",
        ghost: "border border-rule-ink bg-transparent text-on-ink hover:border-signal-ink hover:text-signal-ink",
        text: "min-h-[44px] px-1 text-on-ink underline decoration-1 underline-offset-4 hover:text-signal-ink",
      } as const)
    : ({
        primary: "bg-ink text-white hover:bg-signal",
        ghost: "border border-rule bg-transparent text-ink hover:border-signal hover:text-signal",
        text: "min-h-[44px] px-1 text-ink underline decoration-1 underline-offset-4 hover:text-signal",
      } as const);

  const cls = `${base} ${styles[variant]} ${className}`;

  if (download) {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
    const hasBasePath = basePath.length > 0 && (href === basePath || href.startsWith(`${basePath}/`));
    const downloadHref = href.startsWith("/") && !hasBasePath ? `${basePath}${href}` : href;
    return (
      <a href={downloadHref} download className={cls}>
        {children}
      </a>
    );
  }

  if (external || href.startsWith("mailto:") || href.startsWith("http")) {
    return (
      <a
        href={href}
        className={cls}
        {...(href.startsWith("http") ? { target: "_blank", rel: "noopener" } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls}>
      {children}
    </Link>
  );
}

/**
 * 개선 전을 100(=기준)으로 둔 지수 증감값인지 판정한다.
 * projects.ts 는 그런 지표에 before: "기준" 을 쓴다.
 */
export function isIndexDelta(metric: Metric): boolean {
  return metric.before === "기준" || /^[+−-]/.test(metric.after.trim());
}

/**
 * 수치 표기.
 *
 * 수준값(583%, 808%, 약 58.3억)과 지수 증감값(−21%, +7.3%)은 기준이 다르다.
 * 둘을 같은 색·같은 크기로 세우면 범주 오류이고, 퍼포먼스 담당자가 보는
 * 포트폴리오에서 그건 실력 문제로 읽힌다. 그래서 초록은 증감값에만 쓰고
 * 수준값은 잉크로 둔다 — 개선은 화살표가 이미 말한다.
 */
export function MetricDelta({ metric, size = "md" }: { metric: Metric; size?: "md" | "lg" }) {
  const valueCls =
    size === "lg"
      ? "text-[2rem] leading-[1.1] font-bold tracking-normal sm:text-[2.75rem]"
      : "text-h3 font-bold";
  const afterCls = isIndexDelta(metric) ? "text-up" : "text-ink";

  return (
    <div>
      <p className="text-caption text-ink-3">{metric.label}</p>
      <p className={`mt-2 ${valueCls}`}>
        {metric.before && metric.before !== "기준" ? (
          <>
            <span className="tnum text-ink-3">{metric.before}</span>
            <span className="mx-2 text-ink-3" aria-hidden="true">
              →
            </span>
          </>
        ) : null}
        <span className={`tnum ${afterCls}`}>
          <CountUpValue value={metric.after} />
        </span>
      </p>
      {/*
        집계 기준 각주는 두세 줄짜리 짧은 문장이라 pretty 로는 마지막 줄이 안 잡힌다 —
        제이에스티나에서 "…오프라인·홈쇼핑 / 미포함"처럼 끝 항목만 떨어졌다.
        기준을 밝히는 문장이 조판 때문에 흘려 읽히면 안 되므로 balance 로 고르게 나눈다.
      */}
      {metric.note ? (
        <p className="mt-2 text-caption text-balance text-ink-3">{metric.note}</p>
      ) : null}
    </div>
  );
}

export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-card border border-rule/28 px-2.5 py-1 font-mono text-mono font-bold tracking-[0.06em] text-ink-2 uppercase">
      {children}
    </span>
  );
}

/* ═══════════════ 에디토리얼 공통 부품 ═══════════════ */

/**
 * 사이트의 모든 수치는 이 컴포넌트 하나를 통과한다 — 표지 헤드라인, 다크 밴드,
 * 케이스 스프레드, 리스트 행이 전부 같은 규칙을 쓰게 만들어 표기가 어긋날 여지를 없앤다.
 *
 * mark: after 값에만 형광 라임 하이라이트 바를 깐다. 라임은 배경으로만 쓰고 글자는
 * 잉크색이라 대비가 15:1로 유지된다(라임을 글자색으로 쓰면 흰 배경에서 1.1:1로 무너진다).
 */
export function Metric({
  before,
  after,
  label,
  note,
  size = "md",
  mark = false,
  onDark = false,
  className = "",
}: {
  before?: string;
  after: string;
  label?: string;
  note?: string;
  size?: "lg" | "md" | "sm";
  mark?: boolean;
  onDark?: boolean;
  className?: string;
}) {
  /*
   * lg는 카드 폭 안에서도 한 줄로 유지돼야 한다. clamp 상한을 카드 기준으로 낮추고
   * 줄바꿈을 막는다 — "107,600"이 "100,60 / 0"으로 쪼개지면 수치가 깨져 보인다.
   */
  const sizes = {
    lg: "text-[clamp(1.75rem,3.4vw,2.75rem)] leading-none font-black tracking-[-0.02em] whitespace-nowrap",
    md: "text-metric-sm",
    sm: "text-[1rem] leading-[1.2] font-bold",
  } as const;
  const dim = onDark ? "text-white/60" : "text-ink-3";
  const strong = onDark ? "text-white" : "text-ink";

  /*
   * 개선을 색이 아니라 "형태"로도 인코딩한다 — before 는 저채도 경량, after 는 고채도 중량.
   * 색각이상·흑백 인쇄에서도 어느 쪽이 개선값인지 구분된다. 색만으로 구분하면
   * 이 사이트에서 가장 중요한 정보가 특정 사용자에게만 사라진다.
   */
  const upTone = onDark ? "text-signal-ink" : "text-signal";

  return (
    <div className={className}>
      <p className={`figure tnum ${sizes[size]} ${strong}`}>
        {before ? (
          <>
            <span className={`font-semibold ${dim}`} style={{ fontStretch: "100%" }}>
              {before}
            </span>
            <span className={`mx-[0.12em] font-mono ${dim}`} aria-hidden="true">
              →
            </span>
            <span className="sr-only">에서 </span>
          </>
        ) : null}
        <span
          /* 형광펜 바를 걷어냈다. 강조는 색면이 아니라 서체·폭(.figure)과 굵기가 담당한다 */
          className={mark ? upTone : undefined}
          style={mark ? { fontStretch: "115%" } : undefined}
        >
          <CountUpValue value={after} />
        </span>
      </p>
      {label ? (
        <p className={`mt-2 text-small font-semibold ${onDark ? "text-white" : "text-ink"}`}>{label}</p>
      ) : null}
      {note ? <p className={`mt-1 text-caption ${onDark ? "text-on-ink-2" : "text-ink-3"}`}>{note}</p> : null}
    </div>
  );
}

/** 영문 대문자 킥커 + 국문 h2 2단 헤더. SLL·플레이디의 섹션 헤더 문법과 같은 골격이다. */
export function SectionHead({
  kicker,
  title,
  count,
  onDark = false,
  tone = "market",
  className = "",
}: {
  kicker: string;
  title: ReactNode;
  count?: string;
  onDark?: boolean;
  /** "system" 은 조직에 남긴 자산(자동화·공개 도구) 섹션. 액센트가 시안으로 갈린다 */
  tone?: "market" | "system";
  className?: string;
}) {
  return (
    <div
      className={`section-head-motion border-t pt-5 ${onDark ? "border-rule-ink" : "border-rule"} ${className}`}
      data-enter
    >
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
        <p
          className={`flex items-center gap-2.5 text-kicker uppercase ${
            onDark ? "text-limit-ink" : "text-ink-3"
          }`}
        >
          <span
            className={`section-head-marker inline-block h-1.5 w-1.5 shrink-0 ${tone === "system" ? "bg-system" : "bg-signal"}`}
            aria-hidden="true"
          />
          {kicker}
        </p>
        {count ? (
          <p className={`font-mono text-mono ${onDark ? "text-on-ink-2" : "text-ink-3"}`}>{count}</p>
        ) : null}
      </div>
      <h2
        className={`mt-3 max-w-[30ch] text-[1.5rem] sm:text-h2 ${onDark ? "text-white" : "text-ink"}`}
      >
        {title}
      </h2>
    </div>
  );
}

export function Badge({
  children,
  tone = "line",
}: {
  children: ReactNode;
  tone?: "mark" | "line" | "dark";
}) {
  const tones = {
    mark: "border border-limit text-limit",
    line: "border border-line text-ink-2",
    dark: "border border-white/28 text-white/80",
  } as const;
  /* 긴 라벨(기여도 설명 등)은 두 줄로 흐르게 두되 높이는 최소 26px을 지킨다 */
  return (
    <span
      className={`inline-flex min-h-[26px] items-center  px-2.5 py-1 font-mono text-mono font-bold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

/**
 * 각주. 기준이 다른 수치를 분리해 두는 자리다 — 각주가 사라져도 페이지의 주장이
 * 성립해야 하므로, 핵심 수치 자체는 각주에 넣지 않는다.
 */
export function Footnotes({
  items,
  onDark = false,
  className = "",
}: {
  items: { id: string; text: string }[];
  onDark?: boolean;
  className?: string;
}) {
  return (
    <ol
      className={`border-t pt-4 ${onDark ? "border-rule-ink" : "border-line"} ${className}`}
    >
      {items.map((item) => (
        <li
          key={item.id}
          id={`fn-${item.id}`}
          className={`text-mono leading-[1.5] scroll-mt-[88px] ${onDark ? "text-on-ink-2" : "text-ink-2"}`}
        >
          <span className="font-mono">†{item.id}</span> {item.text}
        </li>
      ))}
    </ol>
  );
}

/** 각주 마커. 본문 수치 옆에 달아 해당 각주로 이동시킨다. */
/**
 * 각주 기호.
 *
 * 크기가 0.5em 뿐이라 12px 모노 안에서는 6px 로 찍혔다 — 화면에서 사실상 안 보이고,
 * 어두운 지면에서는 accent(#c7301b)가 대비 3.58:1 로 WCAG AA(4.5:1)에도 미달했다.
 * 사이트 전체에서 대비 미달은 이 두 곳뿐이었다.
 * 하한을 11px 로 두되 큰 수치 옆에서는 함께 커지도록 max() 를 쓰고,
 * 색은 지면에 따라 갈라 준다(globals.css 의 .footnote-ref 규칙).
 */
export function FootnoteRef({ id }: { id: string }) {
  return (
    <a
      href={`#fn-${id}`}
      className="footnote-ref align-super font-mono text-[max(0.6875rem,0.5em)] no-underline hover:underline"
      aria-label={`각주 ${id} 보기`}
    >
      †{id}
    </a>
  );
}

/** 케이스 사이를 잇는 한 줄. 다음 케이스가 답할 질문을 던져 스크롤에 방향을 준다. */
export function Bridge({ children }: { children: ReactNode }) {
  return (
    <p className="my-8 border-l-[3px] border-mark py-1 pl-5 font-mono text-caption text-ink-3">
      {children}
    </p>
  );
}

/** 썸네일 대신 쓰는 단색 표지 — 브랜드 로고 저작권 회피 */
export function BrandTile({
  accent,
  label,
  className = "",
}: {
  accent: [string, string];
  label: string;
  className?: string;
}) {
  return (
    <div
      className={`relative flex aspect-[16/9] flex-col justify-between overflow-hidden rounded-card p-5 ${className}`}
      style={{ backgroundColor: accent[0], borderBottom: `8px solid ${accent[1]}` }}
      aria-hidden="true"
    >
      <span className="text-caption font-semibold tracking-[0.12em] text-white/70">CASE STUDY</span>
      <span className="text-[1.25rem] font-bold tracking-normal text-white">
        {label}
      </span>
    </div>
  );
}
