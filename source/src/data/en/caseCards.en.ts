/**
 * 영문판 사례 카드 (2026.09.25) — caseCards.ts 와 같은 값, 문장만 영문.
 * 수치(before/after)·이미지·바탕색은 한국어 카드에서 그대로 가져온다.
 */
import { caseCards, type CaseCard } from "@/data/caseCards";

const text: Record<string, Pick<CaseCard, "capability" | "alt" | "basis" | "scope" | "award"> & { label?: string; metricLabel?: string }> = {
  jestina: {
    capability: "Budget reallocation",
    award: "2025 Korea Digital Advertising Awards, Excellence",
    alt: "Six J.ESTINA ad creatives that ran",
    basis: "May → Jul 2025 · same closing report",
    scope: "Strategy & measurement 75% · daily execution shared with the team",
  },
  newbalance: {
    capability: "Bottleneck beyond ads",
    award: "LG CNS MOP best practice · done alone",
    alt: "Eight New Balance Kakao Bizboard creatives that ran",
    basis: "Internal daily average, measured · before vs after automation",
    scope: "Account operations 40% · automation design & build 100%",
  },
  daekyo: {
    capability: "Measurement re-check",
    alt: "Daekyo Flamu franchise-seminar and startup-support creatives",
    label: "CVR, re-measured on the same sample",
    basis: "Recalculated without a creative that spent only ~KRW 9,000",
    scope: "Measurement QA design 100%",
  },
  gangwon: {
    capability: "New sales channels",
    alt: "Six Gangwon Deep Sea Water (Cheonnyeon Dongan) creatives that ran",
    metricLabel: "Store sales",
    basis: "July 2026 vs same period last year · incl. group-buys · last year was before I took over",
    scope: "Ran the account alone",
  },
  dyson: {
    capability: "Video ads · subscriptions",
    alt: "Dyson YouTube subscription campaign placements",
    metricLabel: "Video ad CTR",
    basis: "Feb → Mar 2024 · Google Ads report",
    scope: "KPI redefinition & test design, co-planned · 40%",
  },
};

export const caseCardsEn: Record<string, CaseCard> = Object.fromEntries(
  Object.entries(caseCards).map(([slug, card]) => {
    const en = text[slug];
    if (!en) return [slug, card];
    return [
      slug,
      {
        ...card,
        capability: en.capability,
        alt: en.alt,
        basis: en.basis,
        scope: en.scope,
        /* 수상 한 줄은 한국어 값이 새지 않게 영문이 없으면 뺀다 */
        award: en.award,
        ...(card.label ? { label: en.label ?? card.label } : {}),
        ...(card.metric ? { metric: { ...card.metric, label: en.metricLabel ?? card.metric.label } } : {}),
      },
    ];
  }),
);
