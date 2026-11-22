import Link from "next/link";
import { Container, Section, SectionHead } from "@/components/ui";
import { testLog, testLogNotes } from "@/data/testLog";

/*
 * 테스트 기록 (R-11 · 2026.11.22) — 공용판 /about/ '일하는 방식' 바로 뒤.
 *
 * 일하는 방식이 '가설을 세우고 테스트로 고친다'고 말한 직후에, 실제로 돌린 테스트를 한 줄씩 보여 준다.
 * 사례를 하나씩 열지 않아도 무엇을 비교했고 어떻게 판정했는지가 한 화면에 보이게 한다.
 * 모양은 바로 아래 '추가 운영 성과'와 같은 얇은 리스트 행 — 대표 사례와 같은 무게로 보이지 않게.
 * 각 줄은 그 사례로 이어진다. 숫자는 사례와 같은 글자다(src/data/testLog.ts 가 빌드 때 대조).
 */
export default function TestLog() {
  return (
    <Section id="tests" tone="white">
      <Container>
        <SectionHead kicker="Test log" title="테스트 기록" count={`${testLog.length}건`} />
        <p className="mt-4 text-caption text-ink-3">
          <span className="block">사례 안에 흩어져 있던 테스트를 한곳에 모았습니다. 무엇을 비교했고, 어떻게 판정했고, 그 뒤에 무엇을 바꿨는지입니다.</span>
          <span className="block">품질 지표가 떨어진 회차도 함께 적었습니다. 숫자는 각 사례와 같은 출처입니다.</span>
        </p>
        <ol className="mt-5">
          {testLog.map((t) => (
            <li
              key={`${t.slug}-${t.period}`}
              className="grid grid-cols-1 gap-x-6 gap-y-2.5 border-b border-line py-4 sm:grid-cols-[170px_minmax(0,1fr)_minmax(0,230px)]"
            >
              <div>
                <p className="font-mono text-mono text-ink-3">{t.period}</p>
                <Link
                  href={`/projects/${t.slug}/`}
                  className="mt-0.5 inline-flex min-h-[44px] items-center text-small font-bold text-ink underline underline-offset-4 hover:text-signal sm:min-h-0"
                >
                  {t.brand} 사례 →
                </Link>
              </div>
              <div>
                <p className="text-caption leading-[1.7] text-ink-2 sm:text-small sm:leading-[1.7]">{t.compared}</p>
                <p className="tnum mt-1 text-caption font-bold leading-[1.7] text-ink sm:text-small sm:leading-[1.7]">{t.result}</p>
              </div>
              <div>
                <p className="font-mono text-mono text-ink-3">판정</p>
                <p className="mt-0.5 text-caption font-bold text-ink sm:text-small">{t.verdict}</p>
                <p className="mt-1 text-caption leading-[1.7] text-ink-2">{t.next}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-5 text-caption leading-[1.7] text-ink-3">
          <p className="font-semibold text-ink-2">줄로 올리지 않은 테스트</p>
          <ul className="mt-1">
            {testLogNotes.map((n) => (
              <li key={n.slug}>{n.text}</li>
            ))}
          </ul>
        </div>
      </Container>
    </Section>
  );
}
