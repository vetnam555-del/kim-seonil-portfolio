import type { CSSProperties } from "react";
import type { Metric } from "@/data/projects";

/**
 * 개선 전/후 2막대 차트.
 *
 * 왜 조건부인가: 8개 케이스 중 이 차트가 정직하게 성립하는 건 둘뿐이다.
 * 뉴발란스·자동화는 값이 줄어드는 지표(약 2시간 → 5분 이내)라 '성장 막대'로 그리면
 * 거짓말이 되고, 다이슨(2,000 → 107,600)은 배율이 54배라 첫 막대가 전체
 * 높이의 2%로 찌그러져 깨진 차트로 보인다. 강원·한샘·KT알파는 before 값이
 * 아예 없다. 그래서 조건을 코드로 강제하고, 미달이면 조용히 렌더하지 않는다.
 * 빈칸을 채우려고 없는 값을 만들지 않는다 — 그게 이 포트폴리오의 전제다.
 *
 * 기하는 눈대중이 아니다. 막대 높이는 축 최댓값에 대한 실제 비율이고,
 * 축 최댓값과 눈금은 값에서 계산한다.
 */

/** "583%" → 583 · "약 58.3억" → null (단위가 숫자로 환산되지 않는 값은 제외) */
function parseValue(raw: string): { n: number; unit: string } | null {
  const m = raw.trim().match(/^([+-−]?[\d,]+(?:\.\d+)?)\s*(%|배|건|분|원)?$/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, "").replace("−", "-"));
  if (!Number.isFinite(n)) return null;
  return { n, unit: m[2] ?? "" };
}

/** 0 을 포함해 눈금 4개(0·1/3·2/3·max)가 깔끔하게 떨어지는 축 최댓값 */
function niceAxis(after: number): { max: number; step: number } {
  const raw = after / 3;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((c) => c >= raw) ?? 10 * mag;
  return { max: step * 3, step };
}

function fmt(n: number, unit: string) {
  const s = Number.isInteger(n) ? n.toLocaleString("ko-KR") : String(n);
  return s + unit;
}

/** 이 지표로 2막대 차트를 그려도 되는지 */
export function canChart(metric: Metric): boolean {
  if (!metric.before) return false;
  const b = parseValue(metric.before);
  const a = parseValue(metric.after);
  if (!b || !a) return false;
  if (b.unit !== a.unit) return false;
  if (b.n <= 0 || a.n <= b.n) return false;
  return a.n / b.n <= 6; // 배율이 6배를 넘으면 첫 막대가 읽히지 않는다
}

export function Bars({
  metric,
  note,
  labels,
  lang = "ko",
}: {
  metric: Metric;
  note?: string;
  labels?: [string, string];
  /* 영문판(2026.09.25) — 막대 설명 문장만 바꾼다 */
  lang?: "ko" | "en";
}) {
  const en = lang === "en";
  const [labelBefore, labelAfter] = labels ?? (en ? ["Baseline", "Result"] : ["비교 기준", "비교 결과"]);
  if (!canChart(metric)) return null;
  const b = parseValue(metric.before!)!;
  const a = parseValue(metric.after)!;
  const { max, step } = niceAxis(a.n);
  const ticks = [3, 2, 1, 0].map((i) => ({ v: step * i, pct: (step * i) / max }));

  const label = en
    ? `Bar chart. ${metric.label}: ${labelBefore} ${fmt(b.n, b.unit)}, ${labelAfter} ${fmt(a.n, a.unit)}. Axis maximum ${fmt(max, a.unit)}.${note ? ` ${note}` : ""}`
    : `막대 차트. ${metric.label} ${labelBefore} ${fmt(b.n, b.unit)}, ${labelAfter} ${fmt(
        a.n,
        a.unit,
      )}. 세로축 최댓값 ${fmt(max, a.unit)}.${note ? ` ${note}` : ""}`;

  return (
    <figure className="mb-2" role="img" aria-label={label} data-enter="bars">
      {/* 값 라벨이 막대 위로 올라가므로 위쪽 여백을 미리 확보한다 */}
      <div className="pt-11" aria-hidden="true">
        <div className="relative h-[168px] pl-12 sm:h-[210px]">
          {ticks.map((t) => (
            <div
              key={t.v}
              className="absolute right-0 left-12 border-t border-line-2"
              style={{ bottom: `${t.pct * 100}%` }}
            >
              <span className="tnum absolute -left-12 -top-[0.62em] w-10 text-right text-[0.6875rem] text-ink-3">
                {t.v === 0 ? "0" : fmt(t.v, a.unit)}
              </span>
            </div>
          ))}
          <div className="grid h-full grid-cols-2 items-end gap-6 sm:gap-12">
            {[
              { v: b, cls: "bg-[#8e8e93]", labelCls: "text-[1rem] sm:text-[1.125rem] text-ink-2" },
              { v: a, cls: "bg-accent", labelCls: "text-[1.75rem] sm:text-[2.5rem] text-ink" },
            ].map((col, i) => (
              <div key={i} className="relative flex h-full items-end justify-center">
                {/* 막대는 화면에 들어올 때 아래에서 자란다 (2026.09.26, globals.css "사례 차트가 그려지며") */}
                <span
                  className={`bars-value tnum absolute left-0 right-0 mb-4 text-center leading-none font-bold tracking-normal ${col.labelCls}`}
                  style={{ bottom: `${(col.v.n / max) * 100}%`, "--d": `${i * 180}ms` } as CSSProperties}
                >
                  {fmt(col.v.n, col.v.unit)}
                </span>
                <span
                  className={`bars-fill w-full max-w-[112px] rounded-t-[8px] ${col.cls}`}
                  style={{ height: `${(col.v.n / max) * 100}%`, "--d": `${i * 180}ms` } as CSSProperties}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-6 pl-12 text-center text-caption text-ink-3 sm:gap-12">
          <span>{labelBefore}</span>
          <span>{labelAfter}</span>
        </div>
      </div>
      <figcaption className="mt-3 pl-12 text-caption text-ink-3">
        {metric.label}
        {note ? ` · ${note}` : ""}
        {en
          ? ` · Bar heights are true proportions of the axis maximum, ${fmt(max, a.unit)}.`
          : ` · 막대 높이는 축 최댓값 ${fmt(max, a.unit)}에 대한 실제 비율입니다.`}
      </figcaption>
    </figure>
  );
}
