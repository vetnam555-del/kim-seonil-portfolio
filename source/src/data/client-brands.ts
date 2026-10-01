/**
 * 운영한 광고주를 업종별로 묶은 목록 — 공용판 홈의 브랜드 표(BrandWall)에서 쓴다.
 *
 * 목록과 분류는 본인이 준 것이다(2026.09.13). 공개해도 된다는 확인도 받았다.
 * 분류는 두 곳을 바꿨다.
 *  · KT알파쇼핑 — "광고·마케팅·대행" 에 있었는데 홈쇼핑·커머스 기업이라 식품·커머스·유통으로 옮겼다.
 *  · 메리어트·에어프랑스·캐세이퍼시픽 — 대행사(레오버넷)를 거쳐 운영했지만 광고주의 업종은
 *    여행·항공·호텔이다. 대행사 이름으로 묶으면 무슨 업종을 해 봤는지가 안 읽힌다.
 *    그 결과 광고·마케팅·대행 칸이 비어, 모스트코퍼레이션(영업대행)은 B2B 서비스로 옮겼다.
 *
 * 로고를 쓰지 않는다. 개인 포트폴리오에서 광고주 상표를 쓰려면 브랜드마다 허락이 필요하고,
 * 이 사이트는 처음부터 "로고 대신 글자·색면" 을 원칙으로 둔다(projects.ts accent 참고).
 *
 * caseSlug 가 있는 브랜드는 사례 페이지로 이어진다. 없는 slug 를 넣으면 404 링크가 나가니
 * 케이스를 지우거나 slug 를 바꾸면 여기도 함께 고친다.
 */
export interface ClientBrand {
  name: string;
  /** 같은 광고주 안의 하위 브랜드 — 괄호 대신 둘째 줄로 보여 준다 */
  sub?: string[];
  caseSlug?: string;
}

export interface ClientBrandGroup {
  name: string;
  note?: string;
  brands: ClientBrand[];
}

export const clientBrandGroups: ClientBrandGroup[] = [
  {
    name: "가전 · IT · 산업기기",
    brands: [
      { name: "다이슨", caseSlug: "dyson" },
      { name: "후지필름BI" },
      { name: "메틀러토레도코리아" },
      { name: "휴먼웍스" },
    ],
  },
  {
    name: "패션 · 잡화 · 스포츠",
    brands: [
      { name: "뉴발란스", caseSlug: "newbalance" },
      { name: "제이에스티나", caseSlug: "jestina" },
      { name: "쌤소나이트", sub: ["투미", "그레고리"] },
      { name: "브라이틀링" },
      /* 독립문 안의 두 브랜드. 흔히 PAT 로 불러 목록에는 PAT 로 적혀 있었다 */
      { name: "독립문", sub: ["PAT", "엘르골프"] },
    ],
  },
  {
    name: "가구 · 리빙 · 생활용품",
    brands: [
      { name: "한샘", caseSlug: "hanssem" },
      { name: "시몬스" },
      { name: "바나나코퍼레이션", sub: ["생활백서", "디베르노", "메디컴포트"] },
    ],
  },
  {
    name: "식품 · 커머스 · 유통",
    brands: [
      { name: "hy(한국야쿠르트)" },
      { name: "동원몰" },
      { name: "강원심층수", caseSlug: "gangwon" },
      { name: "KT알파쇼핑", caseSlug: "ktalpha" },
    ],
  },
  {
    name: "교육 · 에듀테크 · 학원",
    brands: [
      { name: "대교", sub: ["대교에듀캠프", "트니트니", "마이페이스", "플래뮤"], caseSlug: "daekyo" },
      { name: "든든영어" },
      { name: "종로학원" },
      { name: "스펙업" },
    ],
  },
  /*
   * 카드 격자(3열)에서는 브랜드가 적은 업종이 가운데 끼면 그 줄만 비어 보인다.
   * 3곳짜리를 앞에, 1~2곳짜리를 마지막 줄에 모은다.
   */
  {
    name: "여행 · 항공 · 호텔",
    brands: [{ name: "메리어트" }, { name: "에어프랑스" }, { name: "캐세이퍼시픽" }],
  },
  {
    name: "물류 · 모빌리티 · B2B 서비스",
    brands: [
      { name: "현대글로비스", sub: ["오토벨"] },
      { name: "페덱스코리아" },
      { name: "모스트코퍼레이션" },
    ],
  },
  {
    name: "제약 · 헬스케어 · 의료",
    brands: [{ name: "삼진제약" }, { name: "압구정앤성형외과" }],
  },
  {
    name: "금융 · 은행",
    brands: [{ name: "부산은행" }],
  },
];

export const clientAdvertiserCount = clientBrandGroups.reduce((n, g) => n + g.brands.length, 0);
export const clientCaseCount = clientBrandGroups.reduce(
  (n, g) => n + g.brands.filter((b) => b.caseSlug).length,
  0,
);
