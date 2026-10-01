import { Fragment } from "react";
import CountUpValue from "@/components/CountUpValue";
import EmailCopyButton from "@/components/EmailCopyButton";
import { Container } from "@/components/ui";
import { careerYear, generalCover, heroFacts, site, verification } from "@/data/site";
import { edition } from "@/data/edition";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/*
 * 표지 수치 중 뒤쪽 섹션으로 이어지는 것. 숫자 모양은 그대로 두고 밑줄로만 알린다.
 * 운영 브랜드는 업종별 광고주 표로, 운영 자동화는 직접 구축한 자동화 섹션으로 간다.
 */
const HERO_FACT_LINKS: Partial<Record<string, { href: string; aria: string }>> = {
  "운영 브랜드": { href: "#brands", aria: "업종별 광고주 보기" },
  "운영 자동화": { href: "#automation", aria: "직접 구축한 자동화 보기" },
};

/*
 * 범위 줄은 " · " 로 나뉜 구절 단위로만 줄을 바꾼다.
 * 칸이 좁으면 "출품서 단독 작성·제출" 이 "작성 / ·제출" 로 갈라져 끝 두 글자만 다음 줄에
 * 남았다. 구절 안에서는 줄을 바꾸지 않고, 가운뎃점은 앞 구절 끝에 붙여 새 줄이 점으로
 * 시작하지 않게 한다. 화면에 보이는 글자와 스크린리더가 읽는 글자는 그대로다.
 */
function ScopeLine({ text }: { text: string }) {
  const parts = text.split(" · ");
  return (
    <>
      {parts.map((part, index) => (
        <Fragment key={part}>
          {index > 0 ? " " : null}
          <span className="whitespace-nowrap">{index < parts.length - 1 ? `${part} ·` : part}</span>
        </Fragment>
      ))}
    </>
  );
}

export default function GeneralCover() {
  return (
    <>
    <section id="hero" className="final-hero on-ink">
      <Container>
        <p className="final-hero-eyebrow">{`KIM SEONILL · ${edition.role}`}</p>
        <div className="final-hero-grid">
          <div className="final-hero-copy">
            {/* 직무 이름이 아니라 무엇을 하는 사람인지로 연다 — 앞 절은 퍼포먼스 마케팅, 뒤 절은 마케팅 오퍼레이션 */}
            <h1 className="final-hero-statement">{generalCover.statement.map((line, index) => (
              <span key={line} style={{ "--hero-delay": `${100 + index * 110}ms` } as React.CSSProperties}>{line}</span>
            ))}</h1>
            <p className="final-hero-role">{generalCover.note}</p>
            <div className="final-hero-actions">
              <a href="#projects" className="final-primary-action">대표 사례 보기 →</a>
              <EmailCopyButton email={site.emailPrimary} className="final-contact-action">이메일 주소 복사</EmailCopyButton>
            </div>
          </div>
          <div className="final-hero-profile">
            <div className="final-identity">
              <img src={`${basePath}${site.profileImagePath}`} alt="김선일 프로필 사진" width={72} height={92} />
              <div>
                <p className="final-identity-name">{site.name} · {site.nameEn}</p>
                <p>HLL중앙 퍼포먼스전략국 과장</p>
                <p>퍼포먼스 마케팅 경력 {careerYear()}년</p>
              </div>
            </div>
            <dl className="final-hero-metrics">
              {heroFacts.map((fact, index) => {
                const link = HERO_FACT_LINKS[fact.label];
                return (
                  <div key={fact.value}>
                    <dt>{fact.label}</dt>
                    <dd>
                      {link ? (
                        <a href={link.href} className="final-hero-metric-link" aria-label={`${fact.label} ${fact.value} · ${link.aria}`}>
                          <CountUpValue value={fact.value} delay={150 + index * 100} duration={1450} />
                        </a>
                      ) : (
                        <CountUpValue value={fact.value} delay={150 + index * 100} duration={1450} />
                      )}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
        {/*
          지원 역할 다섯 개가 있던 자리를 비우고, 경력이 어떻게 이어져 지금의 두 역량이 됐는지를
          세 박자로 보여 준다. 역할을 늘어놓으면 무엇을 잘하는지가 흐려졌다. 첫 화면에 회사·기간이
          처음으로 들어온다(전에는 경력 섹션까지 20화면을 내려가야 했다).
          오른쪽 칸에 세로로 두면 그 칸만 길어져 표지가 689px 로 늘었다 — 가로 한 줄로 편다.
        */}
        <div className="final-hero-story">
          <div className="final-hero-story-head">
            <p>{generalCover.storyLabel}</p>
            <div className="final-hero-story-links">
              <a href="#story">이야기 전체 보기 <span aria-hidden="true">↓</span></a>
              <a href="#career">경력 보기 <span aria-hidden="true">↓</span></a>
            </div>
          </div>
          <ol>
            {generalCover.story.map((step, index) => (
              <li key={step.tag}>
                <span className="final-hero-story-tag">{`${String(index + 1).padStart(2, "0")} ${step.tag}`}</span>
                <strong>{step.where}</strong>
                <span>{step.text}</span>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
    <section className="final-records-band" aria-label="수상과 공개 우수사례">
      <Container>
        <ul className="final-hero-records">
          {/* 첫 화면에 싣는 기록은 범위 줄(heroScope)이 있는 것만 — 개수를 여기서 고정하지 않는다 */}
          {verification.filter((record) => record.heroScope).map((record) => (
            <li key={record.title}>
              <a href={record.href} target="_blank" rel="noopener">{record.title} <span aria-hidden="true">↗</span><span className="sr-only"> (새 탭)</span></a>
              <p>{record.heroScope ? <ScopeLine text={record.heroScope} /> : null}</p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
    </>
  );
}
