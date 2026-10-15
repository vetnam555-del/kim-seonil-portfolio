import type { MetadataRoute } from "next";
import { edition } from "@/data/edition";

/** output: "export" 에서는 force-static 선언이 필요하다. */
export const dynamic = "force-static";

/**
 * hll 판은 사내 이동 지원 서류라 전면 차단한다.
 * 일반판은 공개 포트폴리오라 색인을 허용하되, 케이스 상세는 제외한다 —
 * 광고주별 상세 수치 페이지가 브랜드명으로 검색되는 것까지는 원하지 않는다.
 * (홈과 이력서만 색인되면 개인 브랜딩 목적은 충분히 달성된다.)
 */
export default function robots(): MetadataRoute.Robots {
  /* 기본 차단. 색인을 열려면 ALLOW_INDEX=1 — 근거는 layout.tsx 의 robots 주석 참고 */
  if (edition.showWhyStudio || process.env.ALLOW_INDEX !== "1") {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: "/projects/" }],
    host: edition.url,
  };
}
