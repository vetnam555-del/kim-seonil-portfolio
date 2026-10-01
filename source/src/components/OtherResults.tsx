import { Container, Section, SectionHead } from "@/components/ui";
import { otherBrands, otherResults } from "@/data/projects";
import { edition } from "@/data/edition";

/*
 * 추가 운영 성과 — 카드로 다루지 않는 6건 (공용판 /about/, 2026.09.24 복원).
 *
 * 옛 홈(ProjectsSection)에 있던 목록이다. 9/24 입구형 개편 때 홈에서 빠지고 /about/ 으로 옮겨지지
 * 않아 /resume/ 에만 남아 있었다 — "30여 개 브랜드"의 근거가 다시 다른 문서로 밀려난 상태였다.
 * 마크업과 문구는 옛 홈과 같다. 대표 사례와 같은 무게로 보이지 않게 얇은 리스트 행으로 둔다.
 */
export default function OtherResults() {
  const rows = edition.showWhyShinsegae
    ? otherResults.filter((result) => !result.brand.startsWith("쌤소나이트"))
    : otherResults;
  return (
    <Section id="more-results" tone="white">
      <Container>
        <SectionHead kicker="More results" title="추가 운영 성과" count={`${rows.length}건`} />
        <p className="mt-4 text-caption text-ink-3">
          <span className="block">각 브랜드 운영 리포트 기준이며, 집계 범위가 서로 다릅니다.</span>
          <span className="block">운영 기간은 담당 브랜드별 통합본 기준이며, 월 단위가 확인되지 않은 브랜드는 표에 올리지 않았습니다.</span>
        </p>
        <ul className="mt-5">
          {rows.map((r) => (
            <li
              key={r.brand}
              className="grid grid-cols-1 gap-x-6 gap-y-2.5 border-b border-line py-4 sm:grid-cols-[170px_minmax(0,1fr)_minmax(0,230px)]"
            >
              <div>
                <p className="text-small font-bold text-ink">{r.brand}</p>
                <p className="mt-0.5 font-mono text-mono text-ink-3">{r.category}</p>
                {r.period ? <p className="mt-0.5 font-mono text-mono text-ink-3">{r.period}</p> : null}
              </div>
              <p className="text-caption leading-[1.7] text-ink-2 sm:text-small sm:leading-[1.7]">{r.summary}</p>
              <dl className="flex flex-col gap-2">
                {r.metrics.map((m) => (
                  <div key={m.label}>
                    <dt className="font-mono text-mono text-ink-3">{m.label}</dt>
                    <dd className="tnum mt-0.5 text-caption font-bold text-ink sm:text-small">{m.value}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-caption leading-[1.7] text-ink-3">
          <span className="block">
            <span className="font-semibold text-ink-2">그 밖에 </span>
            {otherBrands.join(" · ")} 등 9개 산업군 30여 개 브랜드의 운영·분석 경험이 있습니다.
          </span>
          <span className="block">월 단위 기간을 확인하지 못한 브랜드는 위 표에 올리지 않았고, 세부 수치는 출처와 집계 범위를 함께 확인할 수 있을 때만 공유합니다.</span>
        </p>
      </Container>
    </Section>
  );
}
