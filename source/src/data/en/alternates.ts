/**
 * 한·영 짝 주소 (hreflang, 2026.09.25) — 레퍼런스(dainahys)처럼 두 언어 화면이 서로를 가리키게 한다.
 * 공용판에서, 영문판이 있는 화면에만 단다. 주소는 판의 절대 주소(edition.url, 끝에 / 포함)에 붙인다.
 */
import type { Metadata } from "next";
import { EDITION, edition } from "@/data/edition";
import { EN_SLUGS } from "./meta";

export function langAlternates(koPath: string, enPath: string): Metadata["alternates"] {
  if (EDITION !== "general") return undefined;
  return {
    languages: {
      ko: `${edition.url}${koPath}`,
      en: `${edition.url}${enPath}`,
      "x-default": `${edition.url}${koPath}`,
    },
  };
}

export function caseAlternates(slug: string): Metadata["alternates"] {
  return (EN_SLUGS as readonly string[]).includes(slug)
    ? langAlternates(`projects/${slug}/`, `en/projects/${slug}/`)
    : undefined;
}
