import { Reveal } from "@/components/motion";
import { Container, SectionHead } from "@/components/ui";
import { creativeRoots } from "@/data/site";
import { isGeneralLike } from "@/data/edition";
import CreativeHistory from "@/components/CreativeHistory";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function DetailRows({
  role,
  evidence,
  onDark = false,
}: {
  role: string;
  evidence: string;
  onDark?: boolean;
}) {
  const labelClass = onDark ? "text-on-ink-2" : "text-ink-3";
  const valueClass = onDark ? "text-on-ink" : "text-ink-2";

  return (
    <dl className={`mt-6 border-t pt-4 font-mono text-mono leading-[1.6] ${onDark ? "border-rule-ink-2" : "border-line"}`}>
      <div className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3">
        <dt className={labelClass}>맡은 역할</dt>
        <dd className={valueClass}>{role}</dd>
      </div>
      <div className="mt-2 grid grid-cols-[4.5rem_minmax(0,1fr)] gap-3">
        <dt className={labelClass}>확인 자료</dt>
        <dd className={valueClass}>{evidence}</dd>
      </div>
    </dl>
  );
}

export default function CreativeRoots() {
  if (isGeneralLike) return <CreativeHistory />;
  const [planning, objemer, youtube] = creativeRoots.cases;

  return (
    <section id="creative-roots" className="scroll-mt-[80px] border-t border-rule bg-white">
      <Container>
        <div className="py-14 md:py-[72px]">
          <SectionHead
            kicker={creativeRoots.eyebrow}
            title={creativeRoots.title}
            count="3개의 시작점"
          />

          <div className="mt-7 grid grid-cols-1 gap-x-10 gap-y-4 border-t border-rule pt-6 lg:grid-cols-12">
            <p className="text-body text-ink-2 lg:col-span-8">{creativeRoots.desc}</p>
            <p className="font-mono text-mono leading-[1.65] text-ink-3 lg:col-span-4">
              {creativeRoots.note}
            </p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-px border border-rule bg-rule">
            <article className="grid bg-paper lg:grid-cols-12">
              <Reveal className="overflow-hidden border-b border-line bg-bone lg:col-span-5 lg:border-r lg:border-b-0">
                <img
                  src={`${basePath}/evidence/${planning.image}`}
                  alt={planning.alt}
                  width="1200"
                  height="675"
                  loading="lazy"
                  className="aspect-video h-full w-full object-contain lg:aspect-auto"
                />
              </Reveal>
              <div className="p-6 sm:p-8 lg:col-span-7 lg:p-10">
                <p className="font-mono text-mono font-bold tracking-[0.03em] text-ink-3">
                  01 · {planning.stage}
                </p>
                <h3 className="mt-4 max-w-[28ch] text-case-h text-ink">{planning.title}</h3>
                <p className="mt-4 max-w-[62ch] text-body text-ink-2">{planning.body}</p>
                <DetailRows role={planning.role} evidence={planning.evidence} />
                <p className="mt-4 font-mono text-mono leading-[1.55] text-ink-3">
                  {planning.caption}
                </p>
              </div>
            </article>

            <article className="grid bg-white lg:grid-cols-12">
              <Reveal className="order-1 overflow-hidden border-b border-line bg-bone lg:order-2 lg:col-span-7 lg:border-b-0 lg:border-l">
                <img
                  src={`${basePath}/evidence/${objemer.image}`}
                  alt={objemer.alt}
                  width="1200"
                  height="794"
                  loading="lazy"
                  /*
                   * object-cover 였다 (2026.08.26 정정). 이 자리의 셋은 사진이 아니라
                   * 기획안·시제품·영상 캡처라 글자가 잘리면 근거가 사라진다 —
                   * 실제로 "중소기업팩토링" 이 "출채권팩토링" 으로 잘려 나가고 있었다.
                   * 01 번 칸이 쓰던 object-contain 으로 셋을 통일한다. 여백은 감수한다.
                   */
                  className="aspect-video h-full w-full object-contain lg:aspect-auto"
                />
              </Reveal>
              <div className="order-2 p-6 sm:p-8 lg:order-1 lg:col-span-5 lg:p-10">
                <p className="font-mono text-mono font-bold tracking-[0.03em] text-ink-3">
                  02 · {objemer.stage}
                </p>
                <h3 className="mt-4 text-case-h text-ink">{objemer.title}</h3>
                <p className="mt-4 max-w-[62ch] text-body text-ink-2">{objemer.body}</p>
                <DetailRows role={objemer.role} evidence={objemer.evidence} />
                <p className="mt-4 font-mono text-mono leading-[1.55] text-ink-3">
                  {objemer.caption}
                </p>
              </div>
            </article>

            <article className="grid bg-ink text-on-ink lg:grid-cols-12">
              <Reveal className="overflow-hidden border-b border-rule-ink-2 lg:col-span-7 lg:border-r lg:border-b-0">
                <img
                  src={`${basePath}/evidence/${youtube.image}`}
                  alt={youtube.alt}
                  width="1200"
                  height="675"
                  loading="lazy"
                  className="aspect-video h-full w-full object-contain"
                />
              </Reveal>
              <div className="p-6 sm:p-8 lg:col-span-5 lg:p-10">
                <p className="font-mono text-mono font-bold tracking-[0.03em] text-limit-ink">
                  03 · {youtube.stage}
                </p>
                <h3 className="mt-4 text-case-h text-on-ink">{youtube.title}</h3>
                <p className="mt-4 text-body text-on-ink-2">{youtube.body}</p>
                <DetailRows role={youtube.role} evidence={youtube.evidence} onDark />
                <p className="mt-4 font-mono text-mono leading-[1.55] text-on-ink-2">
                  {youtube.caption}
                </p>
              </div>
            </article>
          </div>

          <p className="mt-9 max-w-[44rem] border-l-2 border-signal pl-5 text-h3 text-ink">
            {creativeRoots.closing}
          </p>
        </div>
      </Container>
    </section>
  );
}
