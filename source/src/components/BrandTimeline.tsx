import Link from "next/link";
import type { CSSProperties } from "react";
import { otherResults, projects } from "@/data/projects";
import { generalCover } from "@/data/site";

/*
 * 연도별 담당 브랜드 (2026.11.12 R-10 · REFERENCES 골드넥스 — 연혁을 기간으로 묶어 보여 주는 형식).
 * 담당 기간이 사례와 추가 성과 카드마다 흩어져 있어 "언제 무엇을 함께 맡았나"가 한눈에 보이지 않았다.
 *
 * 사실은 새로 적지 않는다. projects.ts 의 period 와 otherResults 의 period(담당브랜드별 운영기간 통합본 기준)만 읽고,
 * 기간이 없거나 읽히지 않는 브랜드는 올리지 않는다. 광고주가 아닌 자체 작업(업무 자동화 · EDIT H)과
 * 쌤소나이트 안의 과제(카카오톡채널)는 뺀다. 소속 줄은 홈 경력 칸(generalCover.career)과 같은 값이다.
 */
const AXIS_START = 2022;
const AXIS_END = 2026;
const YEARS = Array.from({ length: AXIS_END - AXIS_START + 1 }, (_, i) => AXIS_START + i);
const MONTHS = YEARS.length * 12;

const NOT_CLIENT = new Set(["automation", "edith"]);
const SUB_TASK = new Set(["쌤소나이트 카카오톡채널"]);

type Range = { start: number; end: number; label: string };
type Row = { name: string; slug?: string; range: Range };

/** "2024.05 – 2025.10 · …" 의 첫 기간만 읽는다. 끝이 '현재'면 축 끝까지 그린다. */
function parseRange(period?: string): Range | null {
  const m = period?.match(/(\d{4})\.(\d{2})\s*–\s*(?:(\d{4})\.(\d{2})|현재)/);
  if (!m) return null;
  const start = (Number(m[1]) - AXIS_START) * 12 + Number(m[2]) - 1;
  const end = m[3] ? (Number(m[3]) - AXIS_START) * 12 + Number(m[4]) : MONTHS;
  if (start < 0 || end > MONTHS || end <= start) return null;
  return { start, end, label: m[3] ? `${m[1]}.${m[2]} – ${m[3]}.${m[4]}` : `${m[1]}.${m[2]} – 현재` };
}

const pct = (months: number) => `${Math.round((months / MONTHS) * 10000) / 100}%`;
const bar = (r: Range) => ({ "--s": pct(r.start), "--w": pct(r.end - r.start) }) as CSSProperties;

function collect(): { org: Row; brands: Row[] }[] {
  const candidates = [
    ...projects.filter((p) => !NOT_CLIENT.has(p.slug)).map((p) => ({ name: p.brand, slug: p.slug as string | undefined, range: parseRange(p.period) })),
    ...otherResults.filter((o) => !SUB_TASK.has(o.brand)).map((o) => ({ name: o.brand, slug: undefined as string | undefined, range: parseRange(o.period) })),
  ];
  const brands: Row[] = [];
  for (const c of candidates) {
    if (c.range && !brands.some((b) => b.name === c.name)) brands.push({ name: c.name, slug: c.slug, range: c.range });
  }
  brands.sort((a, b) => a.range.start - b.range.start || a.range.end - b.range.end);

  const orgs: Row[] = [];
  for (const c of generalCover.career) {
    const range = parseRange(c.period);
    if (range) orgs.push({ name: c.where.split(" ·")[0].trim(), range });
  }
  orgs.sort((a, b) => a.range.start - b.range.start);

  /* 브랜드는 맡기 시작한 때의 소속 아래에 둔다 */
  return orgs.map((org) => ({ org, brands: brands.filter((b) => b.range.start >= org.range.start && b.range.start < org.range.end) }));
}

export default function BrandTimeline() {
  const groups = collect();
  const count = groups.reduce((n, g) => n + g.brands.length, 0);
  if (!count) return null;

  return (
    <div className="tl" data-enter>
      <div className="tl-head">
        <h3 className="tl-title">연도별 담당 브랜드</h3>
        <p className="tl-note">담당 기간을 확인한 브랜드 {count}곳만 올렸습니다.</p>
      </div>
      <div className="tl-axis font-mono" aria-hidden="true">
        {YEARS.map((y) => <span key={y}>{y}</span>)}
      </div>
      <ol className="tl-list">
        {groups.map(({ org, brands }) => (
          <li key={org.name} className="tl-group">
            <div className="tl-row tl-row-org">
              <p className="tl-label">
                <span className="tl-name">{org.name}</span>
                <span className="tl-period">{org.range.label}</span>
              </p>
              <span className="tl-track" aria-hidden="true"><i style={bar(org.range)} /></span>
            </div>
            {brands.length ? (
              <ol className="tl-brands">
                {brands.map((b) => (
                  <li key={b.name} className="tl-row">
                    <p className="tl-label">
                      <span className="tl-name">
                        {b.slug ? <Link href={`/projects/${b.slug}/`} prefetch={false}>{b.name}</Link> : b.name}
                      </span>
                      <span className="tl-period">{b.range.label}</span>
                    </p>
                    <span className="tl-track" aria-hidden="true"><i style={bar(b.range)} /></span>
                  </li>
                ))}
              </ol>
            ) : null}
          </li>
        ))}
      </ol>
    </div>
  );
}
