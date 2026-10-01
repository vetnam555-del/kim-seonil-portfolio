/**
 * 대표 사례 5건의 카드 정보 — 홈 카드와 사례 상세 첫 화면이 같이 쓴다 (2026.09.24).
 *
 * 기준(basis)·기여(scope)는 사례 본문의 keyMetric.note · contributionNote 를 카드 길이로 줄인 것이다.
 * 대교는 실행의 결과가 아니라 같은 기준으로 다시 계산한 값이고, 다이슨은 채널 전체 팀 성과다 —
 * 목차에서 숫자만 떼어 보여 주면 부풀린 것처럼 읽혀서 라벨에 성격을 붙인다.
 *
 * 홈에서 수치를 누르면 사례 상세가 열리는데, 상세 첫 화면이 다른 숫자로 시작하면 같은 사례를
 * 두 번 소개하는 셈이 된다. 그래서 상세의 첫 화면도 이 표의 수치를 그대로 쓴다.
 */
export type CaseCardMetric = { label: string; before?: string; after: string };

export type CaseCard = {
  capability: string;
  image: string;
  alt: string;
  /** 수치 라벨을 사례 본문보다 좁혀 적어야 할 때만 (재산출 · 채널 전체 같은 성격 표시) */
  label?: string;
  /**
   * 사례 대표값(keyMetric) 대신 카드에 올릴 수치.
   * 다이슨 채널 구독자(2,000 → 107,600)는 원본 채널 캡처가 없다(2026.09.24 본인 확인).
   * 포트폴리오 PDF 요약 장(3쪽)도 다이슨을 리포트 원문이 있는 동영상 CTR 로 소개한다.
   * 구독자 수는 사례 상세의 결과 단에 '채널 전체 · 팀 성과' 단서와 함께 남는다.
   */
  metric?: CaseCardMetric;
  /** 소재 묶음이 틀보다 가로로 길면 자르지 않고 통째로 보인다 */
  contain?: boolean;
  /**
   * 소재 묶음 뒤에 까는 옅은 바탕색 (2026.09.25). 흰 바탕에 캡처를 그대로 올리면 스크린샷처럼 읽혀,
   * 레퍼런스(dainahys)처럼 결과물을 한 장의 타일로 보이게 한다. 소재에 쓰인 색에서 채도를 뺀 값이다.
   */
  tint: string;
  basis: string;
  scope: string;
  /** 카드에 붙는 외부 인정 한 줄 (2026.09.25) — verification 에 있는 사실만 */
  award?: string;
};

export const caseCards: Record<string, CaseCard> = {
  jestina: {
    capability: "예산 재배분",
    award: "2025 대한민국 디지털 광고 대상 우수상",
    image: "jestina-creatives",
    alt: "제이에스티나 집행 소재 6종",
    tint: "#f3e7e2",
    basis: "2025년 5월 → 7월 · 동일 마감보고 기준",
    scope: "전략·측정 75% · 일 단위 집행은 팀 분담",
  },
  newbalance: {
    /* 2026.09.26 '재고 연동 자동화' → 문제 쪽으로. 품절 상품에 광고비가 새는 원인을 광고 밖(재고)에서 찾은 FIND 사례다.
       자동화 결과(2시간 → 5분)와 MOP 수상 줄은 그대로 둔다 */
    capability: "광고 밖 병목 해결",
    award: "LG CNS MOP 우수사례 · 단독 수행",
    image: "newbalance-bizboard-set",
    alt: "뉴발란스 카카오 비즈보드 집행 소재 8종",
    tint: "#e9ebef",
    contain: true,
    basis: "내부 일평균 실측 · 자동화 도입 전후",
    scope: "계정 운영 40% · 자동화 설계·구축 100%",
  },
  daekyo: {
    capability: "측정 재검증",
    image: "daekyo-flamu-set",
    alt: "대교 플래뮤 창업설명회·창업 지원금 소재",
    tint: "#f6eed9",
    label: "같은 표본으로 다시 잰 CVR",
    basis: "약 9천 원만 쓴 소재를 빼고 재계산",
    scope: "측정 QA 설계 100%",
  },
  gangwon: {
    capability: "판매 경로 확장",
    image: "gangwon-creative-set",
    alt: "강원심층수 천년동안 집행 소재 6종",
    tint: "#e2ecf5",
    /* 스마트스토어센터 판매 리포트 (2026.09.25) — 광고 ROAS 201% → 238% 는 사례 본문 결과에 그대로 있다 */
    metric: { label: "스토어 판매금액", after: "+397.3%" },
    basis: "2026년 7월 vs 전년 같은 기간 · 공동구매 포함 · 전년은 담당 이전",
    scope: "단독 계정 운영",
  },
  dyson: {
    capability: "영상 광고 · 구독",
    image: "dyson-youtube-placements",
    alt: "다이슨 유튜브 구독 캠페인 지면 예시",
    tint: "#eceef1",
    metric: { label: "동영상 광고 CTR", before: "2.16%", after: "3.14%" },
    basis: "2024년 2월 → 3월 · Google Ads 리포트 기준",
    scope: "KPI 재정의·테스트 설계 공동 기획 · 40%",
  },
};
