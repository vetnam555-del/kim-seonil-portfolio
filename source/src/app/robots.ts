import type { MetadataRoute } from "next";
import { edition, indexable } from "@/data/edition";

/** output: "export" 에서는 force-static 선언이 필요하다. */
export const dynamic = "force-static";

/**
 * 일반판은 막지 않는다. 무엇을 검색에 낼지는 페이지마다 robots 메타(noindex)로 정한다 —
 * 여기서 막으면 검색 로봇이 noindex 를 읽지 못해 주소만 색인될 수 있고,
 * 링크드인 · 카카오톡 같은 미리보기 로봇도 페이지를 읽지 못한다(2026.10.31, edition.ts indexable).
 * 다른 판(hll · 지원처별 판)은 서류라 전면 차단한다.
 */
export default function robots(): MetadataRoute.Robots {
  if (!indexable) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return { rules: [{ userAgent: "*", allow: "/" }], sitemap: `${edition.url}sitemap.xml` };
}
