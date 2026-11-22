import { projects } from "@/data/projects";
import { EDITION } from "@/data/edition";

/*
 * 테스트 기록 (R-11 · 2026.11.22) — 사례 안에 흩어져 있던 테스트를 한곳에 모은다.
 *
 * 규칙
 * - projects.ts 에 이미 적힌 사실만 옮긴다. 새 숫자·새 판정을 만들지 않는다.
 * - '판정'이 사례에 적혀 있는 것만 줄로 올린다. 설계만 했거나 결과를 싣지 않은 테스트는 아래 notes 로 따로 적는다.
 * - 좋은 값만 고르지 않는다 — 대교 폼 재도입처럼 품질 지표가 떨어진 회차도 그대로 둔다.
 * - 최근 것이 위. 기간을 모르는 것은 사례 기간을 '중'으로 적는다(지어내지 않는다).
 * - 숫자는 아래 검사가 그 사례 데이터에 같은 글자로 있는지 빌드 때 확인한다. 사례 숫자를 고치면 여기서 빌드가 멈춘다.
 */
export interface TestLogRow {
  slug: string;
  brand: string;
  period: string;
  compared: string;
  result: string;
  verdict: string;
  next: string;
}

export const testLog: TestLogRow[] = [
  {
    slug: "newbalance",
    brand: "뉴발란스",
    period: "2026.08\u00a0· 5일",
    compared: "슈즈위크 카카오 비즈보드 소재를 공통\u00a0· 상품별 데이\u00a0· 첫구매 세 갈래로 나눠 따로 읽음",
    result: "데이 소재 ROAS 681% / 첫구매 소재 85%",
    verdict: "첫구매 제외 제언",
    next: "다음 집행은 매출 볼륨 상위 매체로 한정하자고 제언",
  },
  {
    slug: "daekyo",
    brand: "대교에듀캠프",
    period: "2026.07 이후",
    compared: "상담 폼 2·3차 — 자격 질문 1개를 되돌리고 문항 순서를 바꿈",
    result: "정규 서비스 전환율 11.28%",
    verdict: "유지",
    next: "아래 회차(폼 재도입)에서 떨어진 품질 지표가 돌아옴",
  },
  {
    slug: "daekyo",
    brand: "대교에듀캠프",
    period: "2026.05 → 06",
    compared: "마이페이스 Meta 인스턴트폼 재도입(상담 시간 문항 추가)",
    result: "광고 DB 전환율 2.84% → 7.55%\u00a0· CPA −47.6%\u00a0· 정규 서비스 전환율 13.7% → 9.9%",
    verdict: "문항 다시 조정",
    next: "CVR을 최대로 올리는 폼과 DB 품질을 지키는 폼은 같은 폼이 아니었음",
  },
  {
    slug: "gangwon",
    brand: "강원심층수",
    period: "2025.11 – 2026.09 중",
    compared: "같은 소재로 자사몰 랜딩과 네이버 스토어 랜딩을 나눠 돌림",
    result: "전환이 확인된 쪽은 네이버 스토어 랜딩",
    verdict: "스토어 랜딩 중심",
    next: "캠페인 구조를 단순화",
  },
  {
    slug: "jestina",
    brand: "제이에스티나",
    period: "2024.08",
    compared: "같은 파워링크 T&D 문안을 키워드 그룹별로 비교",
    result: "주얼리 팔찌 그룹 클릭률 1.88% / 자사명 그룹 0.29%",
    verdict: "문안 유지\u00a0· 그룹 이동",
    next: "문안이 아니라 키워드 그룹과의 조합 문제라 붙일 그룹을 옮김",
  },
  {
    slug: "dyson",
    brand: "다이슨",
    period: "2024.02",
    compared: "유튜브 DP와 동영상을 같은 기간\u00a0· 같은 지표로 비교",
    result: "DP CTR 0.73%\u00a0· CPC 637원 / 동영상 CTR 2.16%\u00a0· CPC 160원",
    verdict: "동영상 비중 확대",
    next: "2월 23일부터 동영상 비중 확대\u00a0· 그 뒤 동영상 광고 CTR 3.14%",
  },
];

/* 줄로 올리지 않은 테스트 — 판정이 사례에 없거나 실행 전 계획이다. 숨기지 않고 이유와 함께 적는다. */
export const testLogNotes: { slug: string; text: string }[] = [
  {
    slug: "daekyo",
    text: "대교 마이페이스 메시지 앵글(A·B·C안)과 플래뮤 영상 A·B안은 오퍼를 고정하고 여는 문만 갈라 집행했지만, 앵글별 결과는 이 사이트에 싣지 않았습니다.",
  },
  {
    slug: "dyson",
    text: "다이슨 H2 개선안의 10일 단위 순환 테스트(썸네일\u00a0· 재생목록\u00a0· 커뮤니티 세 변수를 SET A\u00a0· B\u00a0· C로)는 실행 전 계획이라 판정이 없습니다.",
  },
];

/* ── 빌드 때 검사: 줄에 적은 숫자가 그 사례 데이터에 같은 글자로 있어야 한다 ──
   이 구역은 일반판 /about/ 에만 나온다. 다른 판은 사례 구성이 달라 검사하지 않는다. */
const NUM = /[−+-]?\d[\d,.]*\s?(?:%p|%|원|일)?/g;
for (const row of EDITION === "general" ? testLog : []) {
  const p = projects.find((x) => x.slug === row.slug);
  if (!p) throw new Error(`testLog: 사례 ${row.slug} 가 없습니다`);
  const hay = JSON.stringify(p).replace(/\\u00a0/g, "\u00a0");
  for (const field of [row.result, row.next]) {
    for (const n of field.match(NUM) ?? []) {
      if (!hay.includes(n.trim())) throw new Error(`testLog: ${row.slug} 의 "${n.trim()}" 가 사례 데이터에 없습니다`);
    }
  }
}
for (const note of EDITION === "general" ? testLogNotes : []) {
  if (!projects.some((x) => x.slug === note.slug)) throw new Error(`testLog: 사례 ${note.slug} 가 없습니다`);
}

/*
 * 같은 숫자는 한 쪽에 한 번만(BACKLOG 정해 둔 것 · 2026-11-22). /about/ 아래 '경력과 수상'의 대표 성과 줄에도
 * 슈즈위크 · 대교 상담 폼 숫자가 괄호로 붙어 있다. 무엇을 비교했고 어떻게 판정했는지까지 있는 테스트 기록 쪽에
 * 숫자를 남기고, 경력 줄에서는 숫자가 모두 테스트 기록에 있는 괄호만 걷어 내고 '테스트 기록 ↑' 링크를 붙인다.
 * 괄호 안 숫자가 하나라도 테스트 기록에 없으면 그 괄호는 그대로 둔다(숫자를 잃지 않는다).
 */
const LOG_FIGURES = new Set(
  testLog.flatMap((t) => [t.result, t.next]).flatMap((s) => (s.match(NUM) ?? []).map((n) => n.trim())).filter((n) => /[%원]$/.test(n)),
);
export function moveFiguresToTestLog(item: string): { text: string; moved: boolean } {
  let moved = false;
  const text = item.replace(/\s?\(([^()]*)\)/g, (group, inner: string) => {
    const figs = (inner.match(NUM) ?? []).map((n) => n.trim()).filter((n) => /[%원]$/.test(n));
    if (figs.length && figs.every((f) => LOG_FIGURES.has(f))) {
      moved = true;
      return "";
    }
    return group;
  });
  return { text, moved };
}
