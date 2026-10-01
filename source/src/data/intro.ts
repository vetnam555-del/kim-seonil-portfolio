/**
 * 첫 방문 인트로 (2026.09.25) — 공용판 홈(HomeFolio)에서만 쓴다.
 *
 * 사용자 요청: "들어오자마자 '이 포트폴리오는 뭔가 다르다'는 첫인상".
 * 레퍼런스(jongwon.ai 의 숫자 롤러 · 리포트 슬라이드 몽타주 · Nova 스플래시)에서 형식만 가져오고,
 * 네 단계는 본인이 말하는 일하는 순서(2026.09.26 — 문제 발견 → 가설 검증 → 구조 개선 → 판매 확장)이고,
 * 단계마다 사이트에 이미 실린 검증 수치를 하나씩 붙였다. 새 숫자는 없다 — 값과 기준은 아래 출처와 같아야 한다.
 * (처음엔 강점 네 가지에 붙였는데 마지막이 '업무 자동화 5분'이라 자동화하는 사람으로 읽혔다.)
 *   2.24%    projects daekyo keyMetric (같은 표본 재산출, 측정 QA 100%)
 *   7.55%    projects daekyo results '광고 DB 전환율 · 폼 재도입'(2026.05 → 06, 본인 설계·운영 — 2026.09.26 사용자 확인).
 *            처음엔 다이슨 CTR 3.14% 였는데 공동 기획(40%)이라 가설 검증의 증거로 약했다.
 *   583%     generalCover.proof[0] (제이에스티나 GA4 ROAS)
 *   +397.3%  caseCards.gangwon.metric · 스마트스토어센터 판매 리포트
 * 2026.09.26 네 단계 → 세 단계(FIND · TEST · IMPROVE). 표지·홈 스크롤 구간이 세 단계인데 인트로만 네 단계
 * (…→ 판매 확장)라 첫 몇 초 안에 순서가 두 번 다르게 나왔다. 판매 확장(+397.3%)은 표지 성과 칸에 있다.
 * 인트로는 화면에서 3초 남짓 지나가므로, 기준은 짧게 붙이고 원문 기준은 카드·사례에 둔다.
 */
export type IntroStep = { stage: string; key: string; before?: string; value: string; basis: string };

export const introCopy: Record<"ko" | "en", {
  metaLeft: string;
  metaRight: string;
  skip: string;
  name: string;
  role: string;
  steps: IntroStep[];
}> = {
  ko: {
    metaLeft: "KIM SEONILL — PERFORMANCE MARKETER",
    metaRight: "PORTFOLIO 2026",
    skip: "누르면 바로 넘어갑니다",
    name: "김선일",
    role: "퍼포먼스 마케터",
    steps: [
      { stage: "FIND", key: "문제 진단", before: "0.66% →", value: "2.24%", basis: "대교에듀캠프 CVR · 같은 표본으로 다시 계산" },
      { stage: "TEST", key: "가설 검증", before: "2.84% →", value: "7.55%", basis: "대교 마이페이스 광고 DB 전환율 · 상담 폼 재설계" },
      { stage: "IMPROVE", key: "구조 개선", before: "352% →", value: "583%", basis: "제이에스티나 GA4 ROAS · 고객 단계별 예산 재설계" },
    ],
  },
  en: {
    metaLeft: "KIM SEONILL — PERFORMANCE MARKETER",
    metaRight: "PORTFOLIO 2026",
    skip: "Tap or click to skip",
    name: "Kim Seonill",
    role: "Performance Marketer",
    steps: [
      { stage: "FIND", key: "the problem", before: "0.66% →", value: "2.24%", basis: "Daekyo CVR · re-measured on the same sample" },
      { stage: "TEST", key: "the hypothesis", before: "2.84% →", value: "7.55%", basis: "Daekyo lead conversion rate · consultation form rebuilt" },
      { stage: "IMPROVE", key: "the structure", before: "352% →", value: "583%", basis: "J.ESTINA GA4 ROAS · budget rebuilt by customer stage" },
    ],
  },
};

/** 표지 제목 아래 강점 네 줄 — 사용자가 꼽은 순서 그대로 */
export const heroStrengths: Record<"ko" | "en", string[]> = {
  ko: ["퍼포먼스 마케팅", "데이터 분석", "예산 효율화", "업무 자동화"],
  en: ["Performance marketing", "Data analysis", "Budget efficiency", "Automation"],
};
