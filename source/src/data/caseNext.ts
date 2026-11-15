/**
 * 사례 끝 '다음 프로젝트' 아래 한 줄 (2026.11.15 B-08).
 * 다음 사례 이름 · 제목만 있으면 무엇을 다룬 사례인지는 제목(한 일)으로만 짐작해야 했다.
 * 그 사례가 **어떤 상황에서 시작했는지**를 한 줄로 붙인다 — 제목이 한 일을 말하니 여기서는 문제만 말한다.
 *
 * 규칙: 그 사례 본문(cardProblem · tldr · objective)에 있는 사실만 쓴다. 숫자는 넣지 않는다(이 줄은 앞 사례 쪽 끝에 놓여
 * 숫자가 앞 사례의 것으로 읽힌다 — ProjectsSection BRIDGES 의 같은 교훈). 본문 문장을 그대로 옮기지 않는다(qa_final G15 · 같은 문장 3쪽 반복).
 * 키는 '다음' 사례의 슬러그다 — 순서가 판마다 달라도 다음 사례가 정해지면 줄도 정해진다. 없는 슬러그는 줄 없이 둔다.
 */
export const caseNextLine: Record<string, string> = {
  jestina: "매출은 브랜드 검색에 몰려 있고, 새 고객을 데려올 광고는 대행사마다 흩어져 있던 계정입니다.",
  newbalance: "여러 채널, 수백 개 상품의 재고를 사람이 하나씩 확인하던 계정입니다.",
  daekyo: "'전년보다 성과가 나빠졌다'는 진단이 먼저 와 있던 계정입니다.",
  gangwon: "검색 · 쇼핑 광고만으로는 판매를 더 늘리기 어려웠던 계정입니다.",
  dyson: "구독 캠페인, 콘텐츠, 라이브커머스가 따로 움직이던 채널입니다.",
  automation: "반복 확인이 늘어 자료를 모으는 데 더 많은 시간이 들던 때의 일입니다.",
  edith: "확인된 사실과 확인되지 않은 보도가 섞여 도는 뉴스를 매일 골라야 하는 일입니다.",
  hanssem: "클릭부터 주문까지의 데이터가 웹과 앱으로 끊겨 있던 계정입니다.",
  ktalpha: "역할이 다른 채널들을 합산 ROAS 하나로 평가하던 계정입니다.",
};

export const caseNextLineEn: Record<string, string> = {
  jestina: "Revenue sat in brand search, and the ads meant to bring in new customers were split across agencies.",
  newbalance: "Stock for hundreds of products across many channels was checked by hand, one by one.",
  daekyo: "The account arrived with a diagnosis already made: results were worse than last year.",
  gangwon: "Search and shopping ads alone could no longer grow sales much further.",
  dyson: "Subscription campaigns, content and live commerce were each running on their own.",
  automation: "Repeat checks had grown until gathering data took more time than finding problems.",
};
