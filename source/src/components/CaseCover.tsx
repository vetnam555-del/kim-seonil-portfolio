import type { CaseCard } from "@/data/caseCards";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 사례 표지의 속 — 브랜드 이름과 소재 낱장 세 장 (2026.11.14 O-21).
 * 홈 카드와 사례 상세 첫 화면이 같이 쓴다(2026.11.15 주인 "맞춰줘") — 홈에서 누르고 들어가도 같은 그림이 먼저 보이게.
 * 바깥 틀(사례 색 바탕 · 링크)은 쓰는 쪽이 정한다. 이름은 장식이다 — 두 자리 모두 브랜드 이름을 글줄로 따로 읽힌다.
 */
export function CaseCoverStack({
  slug,
  brand,
  cover,
  eager = false,
}: {
  slug: string;
  brand: string;
  cover: NonNullable<CaseCard["cover"]>;
  /** 사례 상세에서는 첫 화면 그림이라 바로 받는다. 홈 카드는 어느 폭에서도 첫 화면 밖이라 lazy(2026.10.24 B-04) */
  eager?: boolean;
}) {
  return (
    <>
      <span className="folio-cover-name" aria-hidden="true">{brand}</span>
      <span className={`folio-cover-stack is-${cover.kind}`}>
        {cover.sizes.map(([w, h], i) => (
          <i key={i}>
            <img
              src={`${BASE}/evidence/cover-${slug}-${i + 1}.webp`}
              alt=""
              width={w}
              height={h}
              loading={eager ? "eager" : "lazy"}
            />
          </i>
        ))}
      </span>
    </>
  );
}
