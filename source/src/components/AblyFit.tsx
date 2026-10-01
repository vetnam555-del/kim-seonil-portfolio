import Link from "next/link";
import { Container, SectionHead } from "@/components/ui";
import {
  ablyExperienceBoundary,
  ablyFirst90Days,
  ablyGrowthLoop,
  ablyRoleFit,
} from "@/data/site";

const JOB_POSTING = "https://career.rememberapp.co.kr/job/posting/317300";

/**
 * 에이블리 그로스 마케터(신사업) 공고와 실제 근거를 직접 연결한 지원 전용 지면.
 *
 * 신세계 판(ShinsegaeFit)과 같은 골격을 쓴다. 지원 판마다 지면 문법이 달라지면
 * 같은 사람의 서류가 회사마다 다른 사람처럼 읽힌다. 다른 것은 무엇을 연결하느냐다 —
 * 저쪽은 고객 관계의 순환이고, 이쪽은 방식을 정하는 순환이다.
 */
export default function AblyFit() {
  return (
    <section id="why-ably" className="scroll-mt-[80px] border-b border-rule bg-paper">
      <Container>
        <div className="py-14 md:py-[72px]">
          <SectionHead
            kicker="JOB FIT · ABLY 그로스 마케터(신사업)"
            /*
              공고가 요구하는 것은 채널 운영 숙련이 아니라 "방식을 정의하는 사람"이다.
              제목도 성과가 아니라 그 앞의 판단을 가리킨다.
            */
            title="정해진 방식이 없는 자리에서, 무엇을 성과로 볼지부터 정해 왔습니다."
            count="공고 요건 6개 · 근거 6개"
          />

          <p className="mt-7 max-w-[54rem] text-body leading-[1.85] text-ink-2">
            신사업 마케터에게 먼저 필요한 것은 채널을 잘 돌리는 손이 아니라, 지금 이 단계에
            어떤 방식이 맞는지 고르는 판단이라고 봅니다. 저는 광고주 현장에서 채널별 ROAS
            순서를 버리고 고객 단계로 기준을 바꾼 적이 있고, 이미 내려진 결론을 표본부터 다시
            잡아 뒤집은 적이 있으며, 반복되는 판단은 자동화로 넘겨 왔습니다. 아래에는 공고
            문장과 그 근거가 어디에서 만나는지, 그리고 어디까지가 제 경험이 아닌지를 함께
            적었습니다.
          </p>

          <div className="mt-10 border-y border-rule py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <p className="font-mono text-mono font-bold tracking-[0.06em] text-ink-3">
                GROWTH LOOP · 방식을 고르는 순서
              </p>
              <p className="font-mono text-mono text-ink-3">5단계 순환</p>
            </div>
            <ol className="mt-5 grid grid-cols-1 border-t border-rule sm:grid-cols-5">
              {ablyGrowthLoop.map((step, index) => (
                <li
                  key={step}
                  className={`min-h-[112px] border-b border-rule px-4 py-4 sm:border-b-0 ${
                    index > 0 ? "sm:border-l" : ""
                  }`}
                >
                  <p className="font-mono text-mono font-bold text-signal">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <p className="mt-3 text-small font-bold leading-[1.5] text-ink">{step}</p>
                </li>
              ))}
            </ol>
            <p className="mt-3 font-mono text-mono leading-[1.6] text-ink-3">
              ↺ 판정 기준을 실험보다 먼저 정합니다. 나중에 정하면 결과에 맞춰 기준이 움직입니다.
            </p>
          </div>

          <div className="mt-12">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <p className="font-mono text-mono font-bold tracking-[0.06em] text-ink-3">
                ROLE REQUIREMENT ↔ WORK EVIDENCE
              </p>
              <a
                href={JOB_POSTING}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-[44px] items-center font-mono text-mono font-bold text-ink underline underline-offset-4 hover:text-accent"
              >
                채용 공고 원문 ↗
              </a>
            </div>

            <ol className="mt-4 border-t border-rule">
              {ablyRoleFit.map((item, index) => (
                <li
                  key={item.requirement}
                  className="grid grid-cols-1 gap-3 border-b border-line py-5 md:grid-cols-[48px_220px_minmax(0,1fr)_150px] md:items-start md:gap-5"
                >
                  <span className="font-mono text-mono font-bold text-ink-3">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <strong className="text-small text-ink">{item.requirement}</strong>
                  <p className="text-caption leading-[1.7] text-ink-2">{item.evidence}</p>
                  <Link
                    href={`/projects/${item.slug}/`}
                    className="inline-flex min-h-[44px] items-center font-mono text-mono font-bold text-signal underline underline-offset-4 hover:text-accent md:-mt-3"
                  >
                    {item.project} 보기 →
                  </Link>
                </li>
              ))}
            </ol>
          </div>

          <aside className="mt-12 bg-ink px-5 py-7 text-on-ink sm:px-8 sm:py-8">
            <p className="font-mono text-mono font-bold tracking-[0.08em] text-limit-ink">
              EXPERIENCE BOUNDARY
            </p>
            <h3 className="mt-3 text-[1.5rem] font-black tracking-normal text-on-ink sm:text-[2rem]">
              {ablyExperienceBoundary.title}
            </h3>
            <p className="mt-4 max-w-[58rem] text-small leading-[1.8] text-on-ink-2 sm:text-body">
              {ablyExperienceBoundary.body}
            </p>
          </aside>

          <div className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <div>
                <p className="font-mono text-mono font-bold tracking-[0.06em] text-ink-3">
                  {ablyFirst90Days.eyebrow}
                </p>
                <h3 className="mt-3 max-w-[42rem] text-[1.75rem] leading-[1.25] font-black tracking-normal text-ink sm:text-[2.25rem]">
                  {ablyFirst90Days.title}
                </h3>
              </div>
              <p className="max-w-[31rem] text-caption leading-[1.7] text-ink-3">
                {ablyFirst90Days.caveat}
              </p>
            </div>

            <ol className="mt-7 grid grid-cols-1 border-t border-rule md:grid-cols-3">
              {ablyFirst90Days.phases.map((phase, index) => (
                <li
                  key={phase.period}
                  className={`py-6 md:px-7 ${index > 0 ? "border-t border-rule md:border-t-0 md:border-l" : "md:pl-0"}`}
                >
                  <p className="font-mono text-mono font-bold tracking-[0.1em] text-signal">
                    {phase.period}
                  </p>
                  <p className="mt-3 text-small font-bold leading-[1.6] text-ink">{phase.goal}</p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {phase.outputs.map((output) => (
                      <li key={output} className="relative pl-3 text-caption leading-[1.65] text-ink-2">
                        <span
                          className="absolute left-0 top-[0.65em] h-1 w-1 rounded-full bg-ink-3"
                          aria-hidden="true"
                        />
                        {output}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 border-t border-line pt-3 font-mono text-mono leading-[1.6] text-signal">
                    완료 기준 · {phase.done}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Container>
    </section>
  );
}
