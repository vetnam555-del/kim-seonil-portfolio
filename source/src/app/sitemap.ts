import type { MetadataRoute } from "next";
import { edition, indexable } from "@/data/edition";

/** output: "export" 에서는 force-static 선언이 필요하다. */
export const dynamic = "force-static";

/**
 * 검색에 여는 페이지만 싣는다 — 홈 · 이력서, 국 · 영(2026.10.31, edition.ts indexable).
 * 날짜(lastModified)는 넣지 않는다. 빌드마다 바뀌면 글자가 그대로인 배포에서도 파일이 바뀐다.
 * 다른 판은 비운다.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  if (!indexable) return [];
  const at = (path: string) => `${edition.url}${path}`;
  const pair = (ko: string, en: string) => ({ languages: { ko: at(ko), en: at(en) } });
  return [
    { url: at(""), alternates: pair("", "en/") },
    { url: at("en/"), alternates: pair("", "en/") },
    { url: at("resume/"), alternates: pair("resume/", "en/resume/") },
    { url: at("en/resume/"), alternates: pair("resume/", "en/resume/") },
  ];
}
