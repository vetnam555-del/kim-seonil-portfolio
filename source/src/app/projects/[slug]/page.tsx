import type { Metadata, Viewport } from "next";
import { CaseView } from "@/components/case/CaseView";
import { EDITION, edition, OG_VERSION } from "@/data/edition";
import { caseCards } from "@/data/caseCards";
import { caseAlternates } from "@/data/en/alternates";
import { getProject, projects } from "@/data/projects";

/* 본문은 components/case/CaseView.tsx — 영문판(/en/projects/…)과 같이 쓴다 (2026.09.25) */

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

/* 케이스 상세도 흰 지면으로 시작한다 — 루트의 어두운 theme-color 를 되돌린다 */
export const viewport: Viewport = { themeColor: "#ffffff" };

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = getProject(slug);
  if (!p) return { title: "프로젝트를 찾을 수 없습니다" };

  /*
   * 케이스 5종이 전부 같은 일반 문구를 description 으로 쓰고 있었다.
   * 검색 결과와 링크 미리보기에서 어느 사례인지 구분되지 않고, 무엇보다 이 사이트의
   * 가장 강한 자산인 "무엇을 어떻게 판단했는가"가 공유 단계에서 통째로 사라진다.
   * 케이스마다 실제 헤드라인 + 대표 지표 + 기여 범위로 조립한다(새 사실을 만들지 않는다).
   */
  /* 공용판은 홈 카드·첫 화면과 같은 수치로 소개한다(다이슨은 동영상 CTR) */
  const km = (EDITION === "general" ? caseCards[p.slug]?.metric : undefined) ?? p.keyMetric;
  const metric = km.before
    ? `${km.label} ${km.before} → ${km.after}`
    : `${km.label} ${km.after}`;
  const scope = p.contributionNote ?? `기여도 ${p.contribution}%`;
  /*
   * headline 뒤에 문장 끝이 없으면 마침표를 넣는다 (2026.09.20)
   * headline 은 마침표로 끝나는 것과 아닌 것이 섞여 있다. 그대로 이어 붙이면
   * 뉴발란스·EDIT H·한샘·KT알파 네 페이지에서 "…줄였습니다 재고·운영 점검 시간"
   * 처럼 두 문장이 한 문장으로 읽혔다. 검색 결과와 공유 카드에 그대로 나가는
   * 텍스트라 여기서만 구분자를 보완한다 — headline 원문은 건드리지 않는다.
   */
  const headline = /[.!?…]$/.test(p.headline.trim()) ? p.headline.trim() : `${p.headline.trim()}.`;
  const description = `${p.brand} · ${headline} ${metric}. ${scope}. ${edition.caseDescription}`
    .replace(/\s+/g, " ")
    .slice(0, 300);

  /*
   * 케이스마다 다른 OG 이미지를 쓴다. scripts/render_og_cases.mjs 가 표지와 같은 문법
   * (다크 지면 + 대형 수치 + 로어서드)으로 생성하고, 수치는 이 파일과 같은 값을 쓴다.
   * 전 페이지가 같은 이미지 한 장을 공유하면 링크 미리보기에서 사례가 구분되지 않는다.
   */
  const ogImage = {
    url: `og/${p.slug}.png?v=${OG_VERSION}`,
    width: 1200,
    height: 630,
    alt: `${p.brand} 사례 — ${metric}`,
  };

  return {
    title: `${p.brand} 사례`,
    description,
    robots: { index: false, follow: false, noarchive: true, nosnippet: true },
    alternates: caseAlternates(p.slug),
    openGraph: {
      title: `${p.brand} 사례 | 김선일 포트폴리오`,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.brand} 사례 | 김선일 포트폴리오`,
      description,
      images: [ogImage.url],
    },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <CaseView slug={slug} lang="ko" />;
}
