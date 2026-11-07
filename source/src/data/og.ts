/*
 * 링크 미리보기 공통 칸 (2026.11.07).
 * 쪽에서 openGraph 를 따로 적으면 layout.tsx 의 openGraph 가 통째로 바뀌어(하위 칸을 합치지 않는다)
 * og:type · og:site_name · og:locale 이 빠졌다 — 국문 이력서 · 사례, 영문 홈 · 이력서 · 사례(국문 사례는 og:url 도).
 * 레퍼런스와 메타 태그를 대조하다 찾았다(REFERENCES.md 2026-11-07). openGraph 를 적는 쪽은 이것을 먼저 펼쳐 넣는다.
 */
import { site } from "@/data/site";

export function ogBase(lang: "ko" | "en") {
  return {
    type: "website" as const,
    siteName: `${site.nameEn} Portfolio`,
    locale: lang === "en" ? "en_US" : "ko_KR",
  };
}
