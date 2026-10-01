import Link from "next/link";
import { Container, SectionHead } from "@/components/ui";
import {
  shinsegaeCrmLoop,
  shinsegaeExperienceBoundary,
  shinsegaeFirst90Days,
  shinsegaeRoleFit,
} from "@/data/site";

const JOB_POSTING =
  "https://career.rememberapp.co.kr/job/posting/334484";

/** 신세계 디지털 CRM 공고와 기존 실무 근거를 직접 연결한 지원 전용 지면. */
export default function ShinsegaeFit() {
  return (
    <section id="why-shinsegae" className="scroll-mt-[80px] border-b border-rule bg-paper">
      <Container>
        <div className="py-14 md:py-[72px]">
          <SectionHead
            kicker="JOB FIT · SHINSEGAE DIGITAL CRM"
            title="퍼포먼스 운영 경험을 고객 관계 설계로 확장합니다."
            /*
              "직접 연결 근거 5개"였다. 5건 중 '개인화 캠페인'과 'CRM 자동화 운영 환경'은
              세그먼트 기반 운영·광고 운영 자동화라 인접 경험이지 같은 일이 아니다.
              Experience Boundary 가 그 간극을 이미 밝히고 있으므로 여기서도 "관련"으로 낮춘다.
            */
            count="주요 업무 6개 · 관련 근거 5개"
          />

          <p className="mt-7 max-w-[54rem] text-body leading-[1.85] text-ink-2">
신세계가 찾는 역할은 고객 데이터를 모으는 데서 끝나지 않고, 세그먼트를 정의해
            개인화 캠페인을 실행하고 LTV와 CRM KPI로 다시 학습하는 일입니다. 저는 커머스
            현장에서 이 가운데 고객 세분화, 세그먼트별 메시지·채널 운영, 데이터 측정,
            운영 자동화를 수행해 왔습니다. 아래에는 공고 문장과 실제 프로젝트 근거가
            어디에서 만나는지, 그리고 어디까지가 인접 경험인지 비교할 수 있도록 정리했습니다.
          </p>

          <div className="mt-10 border-y border-rule py-6">
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
              <p className="font-mono text-mono font-bold tracking-[0.06em] text-ink-3">
                CRM OPERATING LOOP · 제가 해 온 일을 CRM 언어로 연결하면
              </p>
              <p className="font-mono text-mono text-ink-3">5단계 순환</p>
            </div>
            <ol className="mt-5 grid grid-cols-1 border-t border-rule sm:grid-cols-5">
              {shinsegaeCrmLoop.map((step, index) => (
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
              ↺ KPI에서 얻은 학습이 다음 세그먼트와 메시지의 기준으로 돌아갑니다.
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
              {shinsegaeRoleFit.map((item, index) => (
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
              {shinsegaeExperienceBoundary.title}
            </h3>
            <p className="mt-4 max-w-[58rem] text-small leading-[1.8] text-on-ink-2 sm:text-body">
              {shinsegaeExperienceBoundary.body}
            </p>
          </aside>

          <div className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-x-8 gap-y-3">
              <div>
                <p className="font-mono text-mono font-bold tracking-[0.06em] text-ink-3">
                  {shinsegaeFirst90Days.eyebrow}
                </p>
                <h3 className="mt-3 max-w-[42rem] text-[1.75rem] leading-[1.25] font-black tracking-normal text-ink sm:text-[2.25rem]">
                  {shinsegaeFirst90Days.title}
                </h3>
              </div>
              <p className="max-w-[31rem] text-caption leading-[1.7] text-ink-3">
                {shinsegaeFirst90Days.caveat}
              </p>
            </div>

            <ol className="mt-7 grid grid-cols-1 border-t border-rule md:grid-cols-3">
              {shinsegaeFirst90Days.phases.map((phase, index) => (
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
