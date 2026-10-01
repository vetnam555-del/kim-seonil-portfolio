import { Container, SectionHead } from "@/components/ui";
import { Reveal } from "@/components/motion";
import { creativeHistory } from "@/data/creative-history";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export default function CreativeHistory() {
  return (
    <section id="creative-roots" className="scroll-mt-[80px] border-t border-rule bg-white">
      <Container>
        <div className="py-14 md:py-[72px]">
          <SectionHead kicker="CREATIVE ROOTS" title="제품과 콘텐츠를 만들며 배운 고객의 선택" count={`${creativeHistory.length}개 프로젝트`} />
          <p className="mt-6 max-w-[46rem] text-body text-ink-2">
            보행 안전 기획, 제품·펀딩, 예비창업의 첫 마케팅과 펀딩 캠페인, 정책상품 영상 협업을 거쳤습니다.
            이때 익힌 관찰과 제작 경험은 광고 메시지와 고객의 다음 행동을 함께 보는 기준이 됐습니다.
          </p>
          <div className="mt-9 grid grid-cols-1 gap-x-10 gap-y-12 md:grid-cols-2">
            {creativeHistory.map((item, index) => (
              <article key={item.id} id={`origin-${item.id}`} className="min-w-0 border-t border-rule pt-5">
                <p className="font-mono text-mono text-ink-3">{String(index + 1).padStart(2, "0")} · {item.stage}</p>
                <h3 className="mt-3 text-[1.5rem] leading-[1.35] font-bold text-ink">{item.name}</h3>
                <p className="mt-2 text-small font-bold text-ink-2">{item.title}</p>
                <Reveal as="figure" className="mt-5">
                  <a href={`${basePath}/evidence/${item.image}`} target="_blank" rel="noopener noreferrer" aria-label={`${item.name} 증빙 이미지 원본 크기로 열기 (새 탭)`} className="block border border-line bg-paper">
                    <img src={`${basePath}/evidence/${item.image}`} alt={item.alt} width={1200} height={675} loading="lazy" decoding="async" className="aspect-video w-full object-contain" />
                  </a>
                  <figcaption className="mt-3 flex flex-wrap items-start justify-between gap-x-4 gap-y-2 text-caption leading-[1.6] text-ink-3">
                    <span className="min-w-0 flex-1">{item.caption}</span>
                    <a href={`${basePath}/evidence/${item.image}`} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-[44px] shrink-0 items-center font-bold text-ink underline underline-offset-4" aria-label={`${item.name} 원본 보기 (새 탭)`}>원본 보기 ↗</a>
                  </figcaption>
                </Reveal>
                <p className="mt-4 text-body text-ink-2">{item.body}</p>
                <p className="mt-4 text-caption leading-[1.7] text-ink-3"><span className="font-bold text-ink">참여 범위</span> · {item.role}</p>
                <details className="origin-detail mt-5 border-y border-line">
                  <summary className="flex cursor-pointer list-none items-center gap-2.5 py-4 text-small font-bold text-ink">
                    <span className="origin-detail-mark text-signal" aria-hidden="true">+</span>
                    <span>기획 판단과 근거<span className="sr-only"> · {item.name}</span></span>
                  </summary>
                  <dl className="space-y-4 pb-5">
                    {item.decisions.map((decision) => (
                      <div key={decision.label} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-3">
                        <dt className="text-caption font-bold text-ink">{decision.label}</dt>
                        <dd className="text-small leading-[1.75] text-ink-2">{decision.text}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="border-t border-line py-4 text-caption leading-[1.7] text-ink-3">확인 자료 · {item.evidence}</p>
                </details>
              </article>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
