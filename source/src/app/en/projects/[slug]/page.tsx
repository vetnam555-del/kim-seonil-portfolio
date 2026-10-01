import type { Metadata, Viewport } from "next";
import { CaseView } from "@/components/case/CaseView";
import { EDITION, OG_VERSION } from "@/data/edition";
import { caseCardsEn } from "@/data/en/caseCards.en";
import { EN_SLUGS, getProjectEn } from "@/data/en/projects.en";
import { caseAlternates } from "@/data/en/alternates";

/*
 * 영문 사례 상세 (2026.09.25) — 본문은 한국어와 같은 CaseView 를 쓴다.
 * 문장은 data/en/projects.en.json, 화면 라벨은 data/i18n/caseLabels.ts 에 있다.
 */

export function generateStaticParams() {
  return EN_SLUGS.map((slug) => ({ slug }));
}

export const viewport: Viewport = { themeColor: "#ffffff" };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = getProjectEn(slug);
  if (!p) return { title: { absolute: "Case not found | Kim Seonill" } };

  /* 한국어 상세와 같은 조립 — 헤드라인 + 대표 지표 + 기여 범위. 새 사실을 만들지 않는다 */
  const km = (EDITION === "general" ? caseCardsEn[p.slug]?.metric : undefined) ?? p.keyMetric;
  const metric = km.before && km.before !== "기준" ? `${km.label} ${km.before} → ${km.after}` : `${km.label} ${km.after}`;
  const headline = /[.!?…]$/.test(p.headline.trim()) ? p.headline.trim() : `${p.headline.trim()}.`;
  const description = `${p.brand} · ${headline} ${metric}. ${p.contributionNote ?? `Contribution ${p.contribution}%`}.`
    .replace(/\s+/g, " ")
    .slice(0, 300);
  const title = `${p.brand} case | Kim Seonill portfolio`;
  const ogImage = { url: `og/${p.slug}.png?v=${OG_VERSION}`, width: 1200, height: 630, alt: `${p.brand} case — ${metric}` };

  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: false, noarchive: true, nosnippet: true },
    alternates: caseAlternates(p.slug),
    openGraph: { title, description, locale: "en_US", url: `en/projects/${p.slug}/`, images: [ogImage] },
    twitter: { card: "summary_large_image", title, description, images: [ogImage.url] },
  };
}

export default async function ProjectPageEn({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return (
    <div lang="en">
      <CaseView slug={slug} lang="en" />
    </div>
  );
}
