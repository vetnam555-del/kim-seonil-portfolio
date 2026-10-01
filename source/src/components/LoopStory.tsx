"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import CountUpValue from "@/components/CountUpValue";
import Sentences from "@/components/Sentences";

/*
 * 홈 'FIND · TEST · IMPROVE' 스크롤 구간 (2026.09.26).
 *
 * 표지·인트로가 말한 일하는 순서를 본문에서 사례로 한 번 더 확인시킨다(레퍼런스: GSAP ScrollTrigger 의
 * 고정 연출). 라이브러리는 쓰지 않는다 — 왼쪽 단계 목록은 position: sticky, 지금 단계는 화면 가운데를
 * 지나는 패널을 IntersectionObserver 로 잡는다. JS 가 없으면 세 패널이 그대로 다 보인다(흐림은 html.js 에서만).
 * 이 자리에 있던 세 칸 목차(folio-capindex)를 대신한다. 문장·숫자는 site.ts generalCover.loop.
 */
type Metric = { before?: string; after: string; label: string; basis: string };
type Step = {
  stage: string;
  role: string;
  line: string;
  story: string;
  metrics: readonly Metric[];
  points: readonly string[];
  proof: readonly { label: string; href: string }[];
};

export default function LoopStory({
  steps,
  kicker,
  title,
  proofLabel,
  moreLabel,
  moreHref,
  aria,
}: {
  steps: readonly Step[];
  kicker: string;
  title: string;
  proofLabel: string;
  moreLabel: string;
  moreHref: string;
  aria: string;
}) {
  const [active, setActive] = useState(0);
  const panels = useRef<(HTMLElement | null)[]>([]);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    /* 화면 가운데 띠(위아래 45%를 뺀 10%)에 들어온 패널이 지금 단계다 */
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const i = panels.current.indexOf(e.target as HTMLElement);
          if (i >= 0) setActive(i);
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 },
    );
    panels.current.forEach((p) => p && io.observe(p));
    return () => io.disconnect();
  }, []);

  return (
    <section
      id="capabilities"
      className="folio-section loop"
      aria-label={aria}
      style={{ "--loop-progress": (active + 1) / steps.length } as CSSProperties}
    >
      <div className="folio-wrap loop-grid">
        <div className="loop-rail">
          <p className="folio-kicker">{kicker}</p>
          <h2 className="folio-h2 loop-title">{title}</h2>
          <ol className="loop-stages">
            {steps.map((s, i) => (
              <li key={s.stage} className={i === active ? "is-active" : undefined}>
                <a href={`#loop-${s.stage.toLowerCase()}`}>
                  <b lang="en">{s.stage}</b>
                  <span>{s.role}</span>
                </a>
              </li>
            ))}
          </ol>
          <span className="loop-meter" aria-hidden="true">
            <i />
          </span>
          {/* 다른 페이지로 가는 길은 Link — 배포 하위 경로(basePath)를 붙여 준다 */}
          <Link href={moreHref} className="folio-link-quiet loop-more">
            {moreLabel} <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="loop-panels">
          {steps.map((s, i) => (
            <article
              key={s.stage}
              id={`loop-${s.stage.toLowerCase()}`}
              ref={(el) => {
                panels.current[i] = el;
              }}
              className={`loop-panel${i === active ? " is-active" : ""}`}
              aria-labelledby={`loop-${s.stage.toLowerCase()}-title`}
            >
              <p className="loop-panel-stage">
                <span lang="en">{s.stage}</span> · {s.role}
              </p>
              <h3 id={`loop-${s.stage.toLowerCase()}-title`} className="loop-panel-line">
                {s.line}
              </h3>
              <p className="loop-panel-story"><Sentences text={s.story} /></p>
              <dl className={`loop-metrics${s.metrics.length > 1 ? " is-two" : ""}`}>
                {s.metrics.map((m) => (
                  <div key={m.label}>
                    <dt>{m.label}</dt>
                    <dd className="loop-metric-value">
                      {m.before ? <span className="loop-metric-before">{m.before} </span> : null}
                      <CountUpValue value={m.after} delay={120} duration={1100} />
                    </dd>
                    <dd className="loop-metric-basis">{m.basis}</dd>
                  </div>
                ))}
              </dl>
              <p className="loop-panel-points">{s.points.join(" · ")}</p>
              <p className="loop-panel-proof">
                <span>{proofLabel}</span>
                {s.proof.map((pr) => (
                  <a key={pr.href} href={pr.href}>
                    {pr.label}
                  </a>
                ))}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
