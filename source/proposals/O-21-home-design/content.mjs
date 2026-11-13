// 시안에 쓰는 내용 — 지금 홈(index.html)에 있는 문장과 숫자만 옮겼다. 새 사실 · 새 숫자 없음.
// 막대 높이는 화면에 적힌 두 값의 비(0 기준)로만 그린다. '+397.3%' · '+32.4%'처럼 증감률만 있는 값은 기준 100 대비로 그리고 막대에는 숫자를 적지 않는다.

const BASE = "/kim-seonil-portfolio";

export const career = [
  {
    key: "remember", logo: `${BASE}/logos/remember.svg`, logoH: 20, name: "리멤버앤컴퍼니", now: true,
    period: "2026.10 – 현재", role: "광고운영팀 매니저",
    text: "리멤버의 직장인 명함 데이터로 산업·직무·직급·기업 규모별 타겟을 잡아 구글·메타 등 네트워크 매체에서 B2B 리드 생성 캠페인을 기획·운영합니다.",
    facts: ["B2B 리드 생성 캠페인", "명함 데이터 타겟팅"],
  },
  {
    key: "hll", logo: `${BASE}/logos/hll.svg`, logoH: 18, name: "HLL중앙",
    period: "2025.11 – 2026.09", role: "퍼포먼스전략국 과장",
    text: "매체 운영에 더해 성과를 측정하는 기준과 운영 자동화까지 맡았습니다. 월 10억+ 규모의 뉴발란스 10개 채널은 팀으로 운영했고 재고·리포트·정산 자동화 6종은 단독으로 구축했습니다.",
    facts: ["뉴발란스 10개 채널 · 월 10억+", "자동화 6종 단독 구축"],
  },
  {
    key: "playd", logo: `${BASE}/logos/playd.png`, logoH: 18, name: "플레이디",
    period: "2022.09 – 2025.10", role: "데이터마케팅본부 PM",
    text: "대형 광고주 PM으로 브랜드 30여 곳의 검색·DA·SNS 광고를 맡았습니다. 제이에스티나에서는 대행사마다 흩어진 DA를 모아 고객 단계별로 예산을 짰습니다.",
    facts: ["브랜드 30여 곳 PM", "디지털 광고 대상 우수상 2024 · 2025"],
  },
];

export const stack = [
  { label: "운영 브랜드", items: ["뉴발란스", "다이슨", "제이에스티나", "쌤소나이트", "한샘", "동원몰", "KT알파쇼핑", "후지필름BI", "대교에듀캠프", "강원심층수 외"] },
  { label: "주요 매체", items: ["네이버 SA·GFA", "Google Ads", "Meta", "Kakao", "Criteo 외"] },
  { label: "분석·측정", items: ["GA4", "GTM", "AppsFlyer", "Looker Studio"] },
  { label: "자동화", items: ["Python", "Google Apps Script", "매체·GA4 API"] },
];

export const records = [
  { year: "2025", title: "대한민국 디지털 광고 대상", sub: "제이에스티나 통합 퍼포먼스 부문 우수상" },
  { year: "2024", title: "대한민국 디지털 광고 대상", sub: "독립문 PAT · 엘르골프 통합 퍼포먼스 부문 우수상" },
  { year: "MOP", title: "LG CNS MOP 우수사례", sub: "쇼핑검색 입찰·재고 연동 자동화 사례 · 단독 수행" },
];

// 그래프: kind v = 세로 막대 둘, h = 가로 막대 둘, d = 증감률만(기준 100 대비)
export const loop = [
  {
    no: "01", word: "FIND", ko: "문제 진단", title: "성과가 막힌 원인을 숫자와 구조에서 찾습니다",
    text: "'성과가 떨어졌다'고 본 비교 데이터에 약 9천 원만 쓴 소재가 섞여 있었습니다. 같은 표본으로 다시 계산하자 전환율은 오히려 높았고 전환당 비용(CPA)은 14.1% 낮았습니다.",
    chart: { kind: "v", name: "대교에듀캠프 CVR", a: ["기존 계산", "0.66%", 0.66], b: ["같은 표본 재산출", "2.24%", 2.24], basis: "같은 표본으로 다시 계산 · 측정 QA 설계 100%" },
    cases: ["대교에듀캠프", "강원심층수", "뉴발란스"],
  },
  {
    no: "02", word: "TEST", ko: "가설 검증", title: "바꿀 것 하나를 정해 작게 테스트합니다",
    text: "상담 폼은 세 차례 개선하며 매번 한 가지씩만 바꿨습니다. 인스턴트폼을 다시 도입한 6월 광고 DB 전환율은 7.55%까지 올랐습니다.",
    chart: { kind: "v", name: "대교 마이페이스 광고 DB 전환율", a: ["2026.05", "2.84%", 2.84], b: ["2026.06", "7.55%", 7.55], basis: "정규 서비스 전환율 13.7% → 9.9% → 11.28%(7월 이후)" },
    cases: ["대교에듀캠프", "다이슨"],
  },
  {
    no: "03", word: "IMPROVE", ko: "구조 개선", title: "검증된 결과로 예산과 운영 방식을 다시 정합니다",
    text: "검색에 쏠린 예산을 고객 단계별로 다시 짜고 광고만으로 막힌 판매는 공동구매로 경로를 넓혔습니다. 반복 점검은 자동화 6종으로 옮겼습니다.",
    chart: { kind: "d", name: "제이에스티나 브랜드검색 쿼리수", delta: "+32.4%", ratio: 1.324, basis: "마감보고 기재 증감률 · ROAS와 비교 기준 별도 · 전략·측정 75%" },
    cases: ["제이에스티나", "강원심층수", "업무 자동화"],
  },
];

export const cases = [
  {
    no: "01", tag: "예산 재배분", brand: "제이에스티나", period: "2024.05 – 2025.10", badge: "2025 대한민국 디지털 광고 대상 우수상",
    title: "검색에 쏠린 예산을 고객 단계별로 다시 짜 ROAS를 끌어올렸습니다.",
    text: "매출은 이미 브랜드를 아는 고객이 들어오는 검색에 몰려 있었습니다. 흩어진 DA를 한곳으로 모으고 고객 단계마다 맡을 채널을 정했습니다.",
    img: `${BASE}/evidence/jestina-creatives-960.webp`, scope: "전략·측정 75% · 일 단위 집행은 팀 분담",
    chart: { kind: "v", name: "GA4 ROAS", a: ["2025.05", "352%", 352], b: ["2025.07", "583%", 583], basis: "동일 마감보고 기준" },
  },
  {
    no: "02", tag: "광고 밖 병목 해결", brand: "뉴발란스", period: "2025.11 – 2026.09", badge: "LG CNS MOP 우수사례 · 단독 수행",
    title: "품절 상품에 광고비가 새지 않게 재고와 광고를 자동으로 연결했습니다.",
    text: "10개 채널, 수백 개 상품의 재고를 사람이 하나씩 확인하다 보니 품절 대응이 늦고 오류가 잦았습니다. 회당 최대 900개 상품의 쇼핑검색 광고를 자동으로 끄고 켜게 했습니다.",
    img: `${BASE}/evidence/newbalance-bizboard-set-960.webp`, scope: "계정 운영 40% · 자동화 설계·구축 100%",
    chart: { kind: "h", name: "재고·운영 점검 시간", a: ["도입 전", "약 2시간", 120], b: ["도입 후", "5분 이내", 5], basis: "내부 일평균 실측" },
  },
  {
    no: "03", tag: "측정 재검증", brand: "대교에듀캠프", period: "2025.11 – 2026.09",
    title: "비교 표본부터 바로잡고 전환과 리드 품질을 함께 보며 상담 폼을 세 차례 개선했습니다.",
    img: `${BASE}/evidence/daekyo-flamu-set-960.webp`, scope: "측정 QA 설계 100%",
    chart: { kind: "v", name: "같은 표본으로 재산출한 CVR", a: ["기존", "0.66%", 0.66], b: ["재산출", "2.24%", 2.24], basis: "약 9천 원만 쓴 소재를 빼고 재계산" },
  },
  {
    no: "04", tag: "판매 경로 확장", brand: "강원심층수 천년동안", period: "2025.11 – 2026.09",
    title: "광고 밖 판매 경로로 인스타그램 공동구매를 더해 스토어 매출을 키웠습니다.",
    img: `${BASE}/evidence/gangwon-creative-set-960.webp`, scope: "단독 계정 운영",
    chart: { kind: "d", name: "스토어 판매금액", delta: "+397.3%", ratio: 4.973, labels: ["전년 같은 기간", "2026.07"], basis: "공동구매 포함 · 전년은 담당 이전" },
  },
  {
    no: "05", tag: "영상 광고 · 구독", brand: "다이슨", period: "2023.10 – 2024.06",
    title: "성과 낮은 디스플레이 대신 동영상에 예산을 실어 클릭률을 높였습니다.",
    img: `${BASE}/evidence/dyson-youtube-placements-960.webp`, scope: "KPI 재정의·테스트 설계 공동 기획 · 40%",
    chart: { kind: "v", name: "동영상 광고 CTR", a: ["2024.02", "2.16%", 2.16], b: ["2024.03", "3.14%", 3.14], basis: "Google Ads 리포트 기준" },
  },
];

// 줄 첫머리에 가운뎃점 · 조사만 남지 않게 붙여 둔다(사이트와 같은 규칙): 낱말 사이 가운뎃점, ')' · '%' 뒤 한글
const E = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/(?<=\S)·(?=\S)/g, "\u2060·\u2060").replace(/([)%])(?=[가-힣])/g, "$1\u2060");

/** 막대 그래프(HTML). H = 가장 큰 막대의 높이(px), cw = 막대 한 칸의 너비(px · 없으면 CSS 값) */
export function chart(c, H = 88, cw = 0) {
  const st = `--h:${H}px${cw ? `;--cw:${cw}px` : ""}`;
  if (c.kind === "v") {
    const max = Math.max(c.a[2], c.b[2]);
    const ha = Math.max(4, Math.round((c.a[2] / max) * H)); const hb = Math.round((c.b[2] / max) * H);
    return `<div class="ch ch-v" style="${st}" role="img" aria-label="${E(c.name)} ${E(c.a[1])}에서 ${E(c.b[1])}">
      <div class="ch-plot">
        <div class="ch-col"><span class="ch-val">${E(c.a[1])}</span><i class="ch-bar is-before" style="height:${ha}px"></i></div>
        <div class="ch-col"><span class="ch-val is-after">${E(c.b[1])}</span><i class="ch-bar is-after" style="height:${hb}px"></i></div>
      </div>
      <div class="ch-axis"><span>${E(c.a[0])}</span><span>${E(c.b[0])}</span></div>
    </div>`;
  }
  if (c.kind === "h") {
    // 가장 긴 막대가 줄의 68% — 나머지는 값 글자 자리. 값은 막대 끝 바로 옆에 적는다
    const max = Math.max(c.a[2], c.b[2]);
    const w = (v) => Math.max(1.2, (v / max) * 68).toFixed(1);
    return `<div class="ch ch-h" style="${st}" role="img" aria-label="${E(c.name)} ${E(c.a[1])}에서 ${E(c.b[1])}">
      <div class="ch-row"><span class="ch-lab">${E(c.a[0])}</span><span class="ch-track"><i class="ch-bar is-before" style="width:${w(c.a[2])}%"></i><span class="ch-val">${E(c.a[1])}</span></span></div>
      <div class="ch-row"><span class="ch-lab">${E(c.b[0])}</span><span class="ch-track"><i class="ch-bar is-after" style="width:${w(c.b[2])}%"></i><span class="ch-val is-after">${E(c.b[1])}</span></span></div>
    </div>`;
  }
  // 증감률만 있는 값: 기준 100 대비. 막대에는 숫자를 적지 않는다
  const hb = H; const ha = Math.max(6, Math.round(H / c.ratio));
  const labels = c.labels || ["기준", "결과"];
  return `<div class="ch ch-v ch-d" style="${st}" role="img" aria-label="${E(c.name)} ${E(c.delta)}">
    <div class="ch-plot">
      <div class="ch-col"><i class="ch-bar is-before" style="height:${ha}px"></i></div>
      <div class="ch-col"><span class="ch-val is-after">${E(c.delta)}</span><i class="ch-bar is-after" style="height:${hb}px"></i></div>
    </div>
    <div class="ch-axis"><span>${E(labels[0])}</span><span>${E(labels[1])}</span></div>
  </div>`;
}

export { E, BASE };
