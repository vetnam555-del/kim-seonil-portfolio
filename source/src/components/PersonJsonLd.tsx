import { edition, indexable } from "@/data/edition";
import { site } from "@/data/site";

/**
 * 검색 결과에 붙는 사람 정보(schema.org Person) — 검색에 여는 일반판 홈(국 · 영)에만 단다(2026.10.31).
 * 사이트에 이미 공개된 사실만 쓴다: 이름 · 직무 · 지금 회사 · 사이트 · 사진 · 메일 · 링크드인.
 */
export function PersonJsonLd({ lang }: { lang: "ko" | "en" }) {
  if (!indexable) return null;
  const ko = lang === "ko";
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: ko ? site.name : "Kim Seonill",
    alternateName: ko ? "Kim Seonill" : site.name,
    jobTitle: ko ? "퍼포먼스 마케터" : "Performance Marketer",
    worksFor: { "@type": "Organization", name: ko ? "리멤버앤컴퍼니" : "Remember & Company" },
    url: ko ? edition.url : `${edition.url}en/`,
    image: `${edition.url}${site.profileImagePath.replace(/^\//, "")}`,
    email: `mailto:${site.email}`,
    sameAs: [site.linkedin],
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
