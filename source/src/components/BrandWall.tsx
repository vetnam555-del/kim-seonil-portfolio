import Link from "next/link";
import CountUpValue from "@/components/CountUpValue";
import { Container, SectionHead } from "@/components/ui";
import {
  clientAdvertiserCount,
  clientBrandGroups,
  clientCaseCount,
  type ClientBrand,
} from "@/data/client-brands";

/**
 * 업종별 광고주 — 공용판 홈, 첫 화면 기록 띠와 대표 사례 사이.
 *
 * ── 1차(2026.09.13)에서 버린 모양
 * 업종을 가로줄 9개로 나누고 브랜드마다 테두리 상자를 씌웠다. 상자 29개가 브랜드보다 먼저
 * 보여 포트폴리오보다 관리자 화면의 필터 태그처럼 읽혔고, 사례 브랜드 7곳의 빨간 테두리가
 * 이 사이트에서 핵심 수치에만 쓰는 색을 흐렸다. 1~2곳뿐인 업종 줄은 오른쪽이 텅 비었고,
 * 하위 브랜드가 있는 상자만 키가 커서 줄 높이도 제각각이었다.
 *
 * ── 지금 모양
 * 업종을 같은 크기의 카드(데스크톱 3열)로 나누고 브랜드는 상자 없이 이름만 목록으로 둔다.
 * 사례 페이지가 있는 브랜드는 밑줄과 작은 "사례 →" 표시만 붙인다. 숫자는 크게 둔다 —
 * 풀리오 제안서가 힘 있게 보이는 이유가 로고보다 큰 숫자였다.
 * 로고는 쓰지 않는다(client-brands.ts 참고).
 *
 * 움직임은 카드가 차례로 올라오는 등장 효과(data-enter)와 숫자 올라가기 두 가지뿐이다.
 * 계속 움직이는 효과는 두지 않는다. 동작 줄이기 설정과 JS 꺼진 환경에서는 처음부터 보인다.
 */
function BrandItem({ brand }: { brand: ClientBrand }) {
  const sub = brand.sub ? (
    <span className="block break-keep text-caption font-normal leading-[1.5] text-ink-3">
      {brand.sub.join(" · ")}
    </span>
  ) : null;

  if (brand.caseSlug) {
    return (
      <Link
        href={`/projects/${brand.caseSlug}/`}
        /*
          aria-label 을 뺐다 (2026.09.24). "다이슨 사례 보기" 로 읽히는데 화면에는 "다이슨 사례 →" 라
          보이는 글과 읽히는 이름이 달랐다(음성 조작에서 "다이슨 사례"를 말해도 못 찾는다).
          위아래 9px 여백은 누를 수 있는 높이를 26px → 44px 로 늘리되 배치는 그대로 둔다.
        */
        className="group -my-[9px] inline-block py-[9px]"
      >
        <span className="whitespace-nowrap">
          <span className="underline decoration-ink-3 decoration-1 underline-offset-[5px] group-hover:decoration-ink group-focus-visible:decoration-ink">
            {brand.name}
          </span>
          <span className="ml-2 text-caption font-semibold text-ink-3 group-hover:text-ink">
            사례 <span aria-hidden="true">→</span>
          </span>
        </span>
        {sub}
      </Link>
    );
  }
  return (
    <span className="inline-block">
      <span className="whitespace-nowrap">{brand.name}</span>
      {sub}
    </span>
  );
}

export default function BrandWall() {
  const stats = [
    { value: String(clientAdvertiserCount), label: "운영 광고주" },
    { value: String(clientBrandGroups.length), label: "담당 업종" },
    { value: String(clientCaseCount), label: "사례 페이지" },
  ];

  return (
    <section id="brands" aria-label="업종별 운영 광고주" className="scroll-mt-[80px] bg-bg pb-8 pt-12 md:pb-10 md:pt-16">
      <Container>
        <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <SectionHead kicker="Clients" title="업종별로 운영한 광고주" />
          <dl className="grid grid-cols-3 gap-6 md:gap-10">
            {stats.map((s, i) => (
              /* dl 안에서는 dt 가 dd 보다 먼저 와야 한다 — 숫자를 위로 올리는 것은 화면 순서만 뒤집는다 */
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-2 text-caption text-ink-3">{s.label}</dt>
                <dd className="whitespace-nowrap text-[2rem] font-bold leading-none tracking-normal text-ink md:text-[2.5rem]">
                  <CountUpValue value={s.value} delay={120 + i * 90} duration={1100} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <ul className="mt-8 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
          {clientBrandGroups.map((group, index) => (
            <li
              key={group.name}
              data-enter
              style={{ "--enter-delay": `${index * 60}ms` } as React.CSSProperties}
              /*
                2열(768–1023px)에서는 9번째 카드가 혼자 남아 옆 칸이 회색 선 색으로 비었다.
                마지막 카드만 두 칸을 채운다. 3열에서는 3×3 으로 맞아떨어져 원래대로 한 칸이다.
              */
              className="bg-bg px-5 py-4 md:px-6 md:py-5 md:last:col-span-2 lg:last:col-span-1"
            >
              <h3 className="text-caption font-semibold text-ink-3">{group.name}</h3>
              {group.note ? <p className="mt-0.5 text-caption text-ink-3">{group.note}</p> : null}
              {/* 좁은 화면에서는 한 줄에 이어 붙여 길이를 줄이고, 넓은 화면에서는 한 줄에 하나씩 세운다 */}
              <ul className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1.5 text-[1rem] font-semibold leading-[1.6] text-ink md:block md:space-y-1.5 md:text-[1.0625rem]">
                {group.brands.map((brand) => (
                  <li key={brand.name} className="md:block">
                    <BrandItem brand={brand} />
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
