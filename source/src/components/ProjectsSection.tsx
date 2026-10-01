import { Fragment } from "react";
import Link from "next/link";
import AutomationDemo from "@/components/AutomationDemo";
import CountUpValue from "@/components/CountUpValue";
import { Reveal } from "@/components/motion";
import {
  Badge,
  Bridge,
  Container,
  CTAButton,
  Metric,
  SectionHead,
} from "@/components/ui";
import { EDITION, edition, isV260908 } from "@/data/edition";
import { otherBrands, otherResults, projects, solutionOrder } from "@/data/projects";
import type { Project, Metric as ProjectMetric } from "@/data/projects";
import { generalCover } from "@/data/site";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/**
 * 케이스별 과제 유형 라벨. 브랜드 순서가 아니라 "서로 다른 역량"으로 읽히게 만든다 —
 * 콘텐츠 스튜디오 조직이 자기 언어로 훑을 수 있는 분류다.
 */
const CASE_TYPE: Record<string, string> = {
  samsonite: "고객 세분화 · CRM 채널 운영",
  dyson: "콘텐츠 기획 · 채널 성장",
  jestina: "IMC 재설계 · 측정 체계",
  daekyo: "측정 QA · 전환 개선",
  newbalance: "멀티채널 대형 운영",
  gangwon: "단독 계정 운영",
  automation: "사내 시스템화",
  edith: "콘텐츠 기획 · 직접 발행",
};

/** 케이스 사이에 놓는 한 줄. 다음 케이스가 답할 질문을 던져 스크롤에 방향을 준다. */
/*
 * 케이스와 케이스 사이를 잇는 질문.
 *
 * 예전에는 "이 케이스 뒤에 붙는 문장"으로 슬러그 하나에만 걸어 뒀다. 대표 사례 순서가
 * 판마다 달라지고 EDIT H 가 2번으로 들어오면서 그 방식이 곧바로 어긋났다 —
 * 다이슨 뒤의 "예산은 어디에 걸어야 하는가"가 예산 이야기가 아닌 EDIT H 를 소개하고,
 * 일반판에서는 "10개 채널·월 10억에서도 유지할 수 있는가"가 다이슨을 가리켰다.
 * 다리는 한 케이스의 속성이 아니라 **두 케이스 사이의 관계**라서, 전이(from→to)로 건다.
 * 정의되지 않은 전이는 아무 문장도 내보내지 않는다 — 틀린 다리보다 없는 편이 낫다.
 *
 * ⚠ 이 문장은 </article> **안쪽**, 앞 케이스 카드 맨 끝에 렌더된다.
 * 자리가 앞 케이스이므로 **앞 케이스 이야기만 쓴다.** 다음 케이스의 이름도 수치도
 * 꺼내지 않는다 — 꺼내면 그 내용이 앞 케이스 것으로 읽힌다.
 * 같은 실수를 두 번 했다. 제이에스티나 카드 끝에 뉴발란스의 "월 10억+ 규모 10개 채널"을
 * 적었고, 그것을 고치면서 다시 "채널이 열 개로 늘면"을 적었다.
 * 그 케이스가 어디까지였는지만 적으면, 다음 카드가 바로 아래에서 스스로 소개한다.
 * 물음형도 쓰지 않는다 — 다음에 무엇이 오는지를 말해 주지 않는다.
 */
/**
 * 카드에 담당 채널을 적을 때, 앞의 두 개만 잘라 내면 "그 두 개만 했다"로 읽힌다.
 * 제이에스티나는 채널이 열 개인데 "네이버 SA · 브랜드검색" 만 보였다.
 * 세 개까지 적고 나머지는 개수로 밝힌다.
 */
function channelLabel(channels: readonly string[]) {
  const head = channels.slice(0, 3).join(" · ");
  const rest = channels.length - 3;
  return rest > 0 ? `${head} 외 ${rest}` : head;
}

const BRIDGES: Record<string, string> = {
  /* hll: 다이슨 → EDIT H → 뉴발란스 */
  /* "남이 만든 콘텐츠"는 사실이지만 CH.01 직후에 놓이면 그 케이스를 스스로 깎는다.
     소유가 아니라 역할의 이동으로 쓴다 */
  "dyson→edith": "여기서 한 일은 이미 만들어진 콘텐츠를 광고로 키운 것까지였습니다.",
  "edith→newbalance": "매일 내려면 사람의 성실함보다 빠뜨리지 않는 장치가 먼저였습니다.",

  /* 일반: 제이에스티나 → 뉴발란스 → 대교 → 다이슨 */
  /* 다리에는 수치를 넣지 않는다. 이 문장이 "월 10억+ 규모 10개 채널" 이었을 때,
     제이에스티나 카드 바로 밑에 붙어 나와서 그 계정이 월 10억인 것처럼 읽혔다.
     가리키는 대상은 다음 케이스인데 놓인 자리는 앞 케이스라, 수치를 담으면 반드시 오해가 난다.
     규모는 뉴발란스 카드가 바로 아래에서 제 이름과 함께 말한다. */
  "jestina→newbalance": "채널을 통합한 뒤에도 역할별 KPI는 따로 비교했습니다.",
  "newbalance→daekyo": "재고 상태와 광고 중단 이력을 함께 남겨 자동화 결과를 다시 확인할 수 있게 했습니다.",
  "daekyo→gangwon": "소재 성과를 판단하기 전에 비교 표본과 상담 폼의 이탈 구간부터 확인했습니다.",
  "gangwon→dyson": "광고 성과와 공동구매 매출을 구분하고, 인플루언서 섭외부터 정산까지 맡았습니다.",
  /* 강원심층수를 대표 사례에 넣기 전의 다리. 판마다 순서가 달라 남겨 둔다. */
  "daekyo→dyson": "여기까지는 광고 안에서 판단을 바로잡은 일이었습니다.",

  /* 신세계 CRM: 고객 정의 → 단계별 예산 → 자동화 → D2C 확장 */
  "samsonite→jestina": "여기서는 고객을 나눠 메시지를 가르는 데까지 했습니다.",
  "newbalance→gangwon": "자동화로 확인하는 시간을 줄이자 판단할 시간이 남았습니다.",

  /* 다이슨이 마지막인 판에서는 다음 케이스가 없으므로 다리도 없다 */
};

/*
 * 홈에 노출할 증빙 파일 화이트리스트.
 * 콘텐츠 조직이 포트폴리오에서 가장 먼저 의심하는 것은 "진짜 한 거 맞나"이고,
 * 그 의심을 끊는 물증은 실제 운영 화면·발행물·집행 소재다. 제작물은 개인 디자인
 * 기여로 오독되지 않도록 캡션에서 역할을 분리한다.
 *
 * jestina-performance.webp 는 홈에서 의도적으로 제외했다 — 432px 썸네일로는 표가 읽히지 않는다.
 * (예전 주석은 '절대 매출액이 그대로 보인다'며 상세도 재검토 대상으로 뒀는데, 그 뒤 원본에서
 *  집행비·매출 열이 비공개 처리되고 각주까지 붙었다. 상세에 그대로 두는 것이 맞다.)
 */
/*
 * 사례 바로가기 라벨. 브랜드가 아니라 그 사례가 증명하는 역량으로 적는다 —
 * 채용담당자가 찾는 것은 브랜드 이름이 아니라 자기 과제와 가까운 능력이다.
 * 표에 없는 slug 는 브랜드명으로 떨어지므로, 판마다 사례가 달라져도 깨지지 않는다.
 */
const CASE_JUMP_LABEL: Record<string, string> = {
  jestina: "예산 설계",
  newbalance: "운영 자동화",
  daekyo: "측정 검증",
  gangwon: "단독 계정 운영",
  dyson: "콘텐츠·구독",
  edith: "콘텐츠 발행",
  samsonite: "고객군 분리",
  automation: "업무 자동화",
};

/*
 * 공용판 사례 목차를 역량 두 묶음으로 나눈다. 표지 제목의 두 절과 같은 말을 쓴다.
 * 묶음에 없는 사례는 첫 묶음 끝에 붙어, 판의 spreadOrder 가 바뀌어도 사례가 빠지지 않는다.
 * extra 는 사례 카드가 아닌 입구(자동화 섹션)라 번호 대신 S1–S6 을 적는다.
 */
const CAPABILITY_GROUPS: {
  role: string;
  line: string;
  slugs: string[];
  extra?: { no: string; title: string; label: string; metric: string; href: string };
}[] = [
  {
    ...generalCover.capabilities[0],
    slugs: ["jestina", "daekyo", "gangwon", "dyson"],
  },
  {
    ...generalCover.capabilities[1],
    slugs: ["newbalance"],
    extra: {
      no: "S1–S6",
      title: "업무 자동화 6종",
      label: "직접 기획·구축",
      metric: "재고 · 리포트 · 정산 · 모니터링 · 지식봇",
      href: "#automation",
    },
  },
];

function capabilityGroups(spreads: Project[]) {
  const numbered = spreads.map((p, i) => ({ p, no: String(i + 1).padStart(2, "0") }));
  const grouped = new Set(CAPABILITY_GROUPS.flatMap((g) => g.slugs));
  return CAPABILITY_GROUPS.map((g, gi) => ({
    ...g,
    items: [
      ...numbered.filter(({ p }) => g.slugs.includes(p.slug)),
      ...(gi === 0 ? numbered.filter(({ p }) => !grouped.has(p.slug)) : []),
    ],
  })).filter((g) => g.items.length > 0 || g.extra);
}

/* 목차에는 대표 수치의 전후만 싣는다 — 기간·기준·기여 범위는 바로 아래 카드에 있다 */
function indexMetric(p: Project) {
  const m = p.keyMetric;
  const before = m.before && m.before !== "기준" ? `${m.before} → ` : "";
  return `${m.label} ${before}${m.after}`;
}

export const HOME_EVIDENCE: Record<string, string> = {
  /*
   * 홈 썸네일은 432px 로 들어간다. 이전에 걸었던 dyson-media-optimization 은
   * 월간 리포트의 코멘트 블록이라 그 크기에서는 회색 텍스트 덩어리로만 보였다 —
   * 읽히지도 않고 무엇을 한 화면인지도 전달되지 않는다.
   * 운영 콘솔 화면은 축소해도 "목적별로 나뉜 캠페인이 실제로 돌았다"가 형태로 읽히고,
   * 제목·기간·기여도·전략 한 줄이 이미지 안에 들어 있다. 집행비·예산은 원본에서
   * 이미 비공개 처리돼 있다. CTR 개선 근거(리포트 코멘트)는 상세에 그대로 남는다.
   */
  dyson: "youtube-performance.webp",
  /*
   * EDIT H 는 "직접 콘텐츠를 만든다"를 증명하는 유일한 케이스인데, 정작 만든 콘텐츠가
   * 한 장도 안 보이는 상태였다. 광고주 증빙이 부족한 것과 본인 저작물이 없는 것은 다른
   * 문제다 — 이건 전부 본인이 만든 것이라 공개에 제약이 없다.
   *
   * 2026.08.14호 8장 전체를 4열 2행으로 싣는다. 본문이 "회당 카드 8장"이라고 적고
   * 있으므로 증빙도 8장이어야 본문과 어긋나지 않고, 커버(01)와 구독 전환 카드(08)가
   * 있어야 한 호가 어떻게 열리고 닫히는지가 남는다.
   *
   * 커버의 보도사진은 재게시 가능함을 발행자 본인이 확인했다(2026.08.16). 카드 안에
   * '사진 · 뉴시스' 크레딧이 그대로 박혀 있어 출처가 이미지와 함께 따라간다.
   */
  edith: "edith-cards.webp",
  jestina: "utm-builder.webp",
  /*
   * 일반판 spreadOrder 4편 중 대교만 홈 썸네일이 없었다 — 광고주 보안 때문이었는데
   * 2026.08.24 에 동의를 받았다.
   *
   * 이 케이스는 다른 스프레드와 달리 SPLIT_SLUG 전용 레이아웃을 써서, 증빙이 432px
   * 썸네일 칸이 아니라 오른쪽 본문 폭(1440px 뷰포트에서 913px)에 들어간다.
   * 그 크기면 지표와 효율 판정이 그대로 읽히므로 축소를 전제로 고를 필요가 없다.
   * (상세 페이지는 704px 라 오히려 여기보다 작다.)
   */
  daekyo: "daekyo-creative-report.webp",
  /*
   * 제품 원본(바람막이 컷)에서 슈즈위크 비즈보드 세트로 바꿨다 (2026.08.26).
   * 432px 로 줄여 나란히 놓고 본 결과 — 제품컷은 "뉴발란스 옷"까지만 읽히고 이 사람이
   * 무엇을 했는지는 전달되지 않는다. 비즈보드 세트는 같은 크기에서 8종의 헤드라인이
   * 전부 읽히고, 한 행사를 소재 여러 벌로 나눠 돌렸다는 것이 형태로 먼저 보인다.
   * 촬영·디자인 기여로 오독되지 않도록 캡션에서 역할을 분리하는 원칙은 그대로 둔다.
   * 자동화 근거는 상세의 MOP 공개 사례에 남는다.
   */
  newbalance: "newbalance-bizboard-set.webp",
  /*
   * 1+1 프로모션 한 장에서 메타 원본 3종으로 바꿨다 (2026.09.07).
   * 한 장짜리 제품 소재는 "광고를 돌렸다"까지만 읽히고, 이 계정에서 무엇을 어떻게
   * 나눠 돌렸는지가 안 보인다. 여름김치 소재 2종은 스토어와 자사몰 랜딩을 구분하고,
   * 천년동안 검색 이벤트 소재 1종은 검색을 유도한다. 서로 다른 상품·목적을
   * 같은 오퍼의 변형으로 설명하지 않는다.
   * 뉴발란스 비즈보드 세트를 고른 것과 같은 기준이다.
   * 1+1 소재는 상세 첫 장에 그대로 남는다.
   */
  gangwon: "gangwon-meta-originals.webp",
};

/*
 * 홈 슬롯은 데스크톱 432px, 모바일 약 350px 다. 원본은 상세 페이지에서 704px 로
 * 렌더돼야 카드 본문이 읽히기 때문에 1920px 로 두고 있는데, 그걸 홈에도 그대로
 * 내려보내면 필요한 폭의 4배를 받는다. 같은 이미지의 960px 변형을 만들어
 * srcset 으로 고르게 한다 — 2배 화면(432×2=864)까지 960 으로 덮인다.
 * 여기 없는 파일(hll-mop-case.jpg, 37KB)은 이미 작아서 변형을 만들지 않았다.
 */
/*
 * -960 변형이 실제로 있는 파일과 그 원본의 **실제 가로 픽셀**.
 *
 * 전에는 이름만 담은 Set 이었고 srcset 은 원본을 전부 "1920w" 로 적었다. 그런데
 * youtube-performance 와 utm-builder 는 1728px 이라, 브라우저가 실제보다 큰 이미지로
 * 알고 고르고 있었다(2x 화면에서 필요한 해상도를 못 채운다).
 * 폭을 파일마다 적어 선언과 실물이 어긋나지 않게 한다.
 * 파일을 바꾸면 여기 숫자도 같이 바꿔야 한다 — 없는 이름을 넣으면 404 srcset 이 나간다.
 */
const EVIDENCE_SIZE: Record<string, { width: number; height: number }> = {
  "edith-cards.webp": { width: 1920, height: 1202 },
  "edith-newsletter.webp": { width: 1920, height: 2429 },
  "youtube-performance.webp": { width: 1728, height: 972 },
  "utm-builder.webp": { width: 1728, height: 972 },
  "daekyo-creative-report.webp": { width: 1920, height: 1451 },
  "daekyo-creative-brief.webp": { width: 1920, height: 1382 },
  "jestina-creatives.webp": { width: 1920, height: 1284 },
  "newbalance-creative-guide.webp": { width: 1920, height: 2172 },
  "newbalance-bizboard-set.webp": { width: 1884, height: 1016 },
  "automation-inventory-guard.webp": { width: 1440, height: 504 },
  "automation-creative-pipeline.webp": { width: 1920, height: 569 },
  "gangwon-smartstore-promo.webp": { width: 1200, height: 1200 },
  "gangwon-meta-originals.webp": { width: 1896, height: 700 },
};

/*
 * 증빙 캡션은 케이스 성격을 따라간다. 운영 화면, 직접 발행물, 캠페인 사용 원본,
 * 실제 집행 소재를 같은 말로 뭉개지 않는다.
 *
 * 공개 이미지가 있는 슬러그는 모두 명시한다.
 * 예전에는 여기 없는 슬러그가 `${brand} 실제 운영 화면` 이라는 기본값으로 떨어졌다.
 * 그 기본값이 뉴발란스에서 **거짓**이 됐다 — 그 이미지는 본인의 운영 화면이 아니라
 * LG CNS MOP 가 공개한 HLL 도입 사례 페이지다. 상세 페이지는 정확히 그렇게 적고 있는데
 * 홈의 alt 만 "뉴발란스 실제 운영 화면"이라고 말하고 있었다.
 * 화면으로 보는 사람은 그림을 보고 알지만, 스크린리더로 듣는 사람은 alt 가 전부다 —
 * 즉 이 사이트가 출처를 흐리지 않는다고 적어 놓은 원칙이 그 한 사람에게만 깨져 있었다.
 * 제이에스티나도 같은 기본값을 쓰고 있어서 "실제 운영 화면"이라는 말만 들렸다(무엇의 화면인지 없음).
 * 그래서 기본값에 의존하지 않고 네 개를 다 적는다. 슬러그가 늘면 여기도 늘려야 한다.
 */
const EVIDENCE_CAPTION: Record<string, { alt: string; caption: string }> = {
  edith: {
    alt: "EDIT H 2026년 8월 14일자 인스타그램 카드뉴스 8장 전체",
    caption: "2026.08.14 카드뉴스 8장. 2026.08.25 기준 제작·발행 76호, 공개 아카이브 75호(VOL.033 게시 대기).",
  },
  daekyo: {
    alt: "대교 드림멘토 광고 소재 리포트 — 소재별 지표와 효율 판정, 판정 근거가 함께 표시된 화면",
    caption: "소재별 CTR·CPC·CPA와 효율 판정 근거를 정리한 운영 화면. 총 집행비·전환 건수·운영 기간은 비공개입니다.",
  },
  automation: {
    alt: "뉴발란스 쇼핑검색 재고 자동 점검 화면 — 품절 상품의 소재가 PAUSED로 표시된 목록",
    caption: "실제 운영 화면 · 품절 감지 시 소재 자동 중단 기록 · 입찰가 열 비공개 처리",
  },
  /*
   * 캡션이 "이 화면이 무엇을 증명하는가"까지 말해야 한다.
   * 큰 수치(ROAS 352%→583%) 옆에 측정 도구 화면이 놓이면, 짧게 읽는 사람은 이 화면을
   * 그 수치의 근거로 받아들인다. 실제로 이 시트가 증명하는 것은 "같은 기준으로 비교할
   * 수 있게 만들었다"이고, 수치 자체는 마감보고에서 나온다. 강원심층수 캡션이 이미
   * 같은 방식으로 둘을 갈라 두고 있어 그 문법에 맞춘다.
   *
   * 결과표(jestina-performance.webp)를 홈으로 올리는 방법도 있지만, 432px 썸네일에서는
   * 표가 읽히지 않아 의도적으로 뺀 자산이다. 이미지를 바꾸는 대신 캡션으로 관계를 밝힌다.
   */
  jestina: {
    alt: "채널·소재·랜딩 파라미터 규칙을 정리한 제이에스티나 UTM Builder 시트 화면.",
    caption:
      "채널·소재를 같은 기준으로 비교하기 위한 UTM 규칙 시트입니다. ROAS 수치는 상세 페이지의 동일 마감보고 기준입니다.",
  },
  /*
   * 같은 이유다. 이 사례의 큰 수치는 재고 점검 시간(약 2시간 → 5분 이내)인데 화면은
   * 광고 소재다. 자동화 실행 기록(automation 항목)이 그 수치의 근거이고, 이 소재는
   * 같은 계정에서 무엇을 돌렸는지를 보여 준다. 둘을 캡션에서 갈라 둔다.
   */
  newbalance: {
    alt: "뉴발란스 슈즈위크 카카오 비즈보드 소재 8종 — 캠페인 공통 · 상품별 데이 · 첫구매 혜택으로 나뉜 배너",
    caption:
      "슈즈위크 비즈보드 8종(2026.08). 소재를 기획하고 지면·규격·문구를 지정해 제작팀과 맞췄습니다. 재고 점검 시간 단축 근거는 상세의 자동화 기록입니다.",
  },
  gangwon: {
    alt: "여름김치 스토어·자사몰 랜딩 소재 2종과 천년동안 검색 이벤트 소재 1종",
    caption:
      "여름김치 랜딩별 소재 2종과 천년동안 검색 이벤트 1종. 랜딩별로 메시지를 나눠 기획하고 규격을 지정해 제작팀과 맞췄습니다. 성과는 별도 리포트 기준입니다.",
  },
  /*
   * 화면 안의 계정 총계(노출·전환·조회)는 위에 적은 케이스 지표(유료 구독 전환 104,257건)와
   * 집계 범위가 다르다. 캡션에서 "목적별 캠페인 구분"이 이 화면의 논점임을 못 박아,
   * 두 수치가 같은 것으로 읽히지 않게 한다.
   */
  dyson: {
    alt: "다이슨 유튜브 라이브커머스 캠페인 운영 콘솔. 목적별로 나뉜 캠페인 목록과 성과 지표.",
    caption: "사전예약·VAC·구독자 증대 캠페인을 구분한 운영 콘솔. 집행비·예산은 비공개이며, 채널 구독자 수와 매체 전환 수는 집계 기준이 다릅니다.",
  },
};

/**
 * 캡션을 문장 단위로 쪼갠다.
 *
 * 한 단락으로 흘리면 문장 경계가 줄 가운데에 놓여 서로 다른 내용이 한 문장처럼
 * 읽히고, "재고 점검 시간 단축" 같은 명사구가 줄 끝에서 갈라진다(1440px 실측).
 *
 * 괄호 안 날짜의 마침표로는 쪼개지 않는다 — "8종(2026.08). 소재를" 에서 앞의
 * 마침표는 연도 표기의 일부다. 닫는 괄호나 한글·숫자 뒤의 마침표만 문장 끝으로 본다.
 */
export function splitCaptionSentences(caption: string): string[] {
  const parts = caption
    .split(/(?<=[가-힣A-Za-z0-9)][.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  return parts.length ? parts : [caption];
}

/**
 * 작은 홈 카드 위에 좌표 박스를 겹치면 원본보다 주석이 먼저 보인다.
 * 이미지는 전체 맥락을 보존하고, 읽을 지점은 아래의 짧은 목록으로 분리한다.
 */
const EVIDENCE_POINTS: Record<string, string[]> = {
  jestina: ["채널 코드", "캠페인·키워드", "소재 코드"],
  newbalance: ["행사 공통 메시지", "상품별 데이", "혜택 메시지"],
  daekyo: ["CTR·CPC·CPA", "효율 판정", "판정 근거"],
  dyson: ["목적별 캠페인", "전환 지표", "목표 CPA"],
  edith: ["주제 분류", "핵심 수치", "판단 한 줄"],
  gangwon: ["스토어 랜딩", "자사몰 랜딩", "검색 유도"],
};

function EvidencePreview({
  slug,
  brand,
  evidenceLabel,
  sizes,
  className = "",
}: {
  slug: string;
  brand: string;
  evidenceLabel: string;
  sizes: string;
  className?: string;
}) {
  const evidenceFile = HOME_EVIDENCE[slug];
  if (!evidenceFile) return null;

  const copy = EVIDENCE_CAPTION[slug] ?? {
    alt: `${brand} 케이스 증빙 화면 — ${evidenceLabel}`,
    caption: `케이스 증빙 · ${evidenceLabel}`,
  };
  const points = EVIDENCE_POINTS[slug] ?? [];
  const size = EVIDENCE_SIZE[evidenceFile];
  const previewFile = size ? evidenceFile.replace(".webp", "-960.webp") : evidenceFile;
  const fullSrc = `${basePath}/evidence/${evidenceFile}`;
  const imageHeightClass = ["jestina", "newbalance", "dyson"].includes(slug)
    ? "max-h-[34rem]"
    : slug === "daekyo"
      ? "max-h-[36rem]"
      : "max-h-[26rem]";

  return (
    <Reveal as="figure" className={`evidence-preview ${className}`.trim()}>
      <a
        href={fullSrc}
        target="_blank"
        rel="noopener"
        aria-label={`${brand} 증빙 원본 크기로 열기 (새 탭)`}
        className="evidence-frame flex w-full items-center justify-center overflow-hidden border border-line bg-bone focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
      >
        <img
          src={`${basePath}/evidence/${previewFile}`}
          srcSet={
            size
              ? `${basePath}/evidence/${previewFile} 960w, ${fullSrc} ${size.width}w`
              : undefined
          }
          sizes={size ? sizes : undefined}
          width={size?.width}
          height={size?.height}
          alt={copy.alt}
          loading="lazy"
          className={`evidence-image block h-auto w-full max-w-full object-contain ${imageHeightClass}`}
        />
      </a>
      {points.length ? (
        <ol className="mt-3 grid grid-cols-1 border-y border-line sm:grid-cols-3">
          {points.map((point, index) => (
            <li
              key={point}
              className="evidence-point flex min-h-[44px] items-center gap-2 border-b border-line py-2.5 last:border-b-0 sm:border-r sm:border-b-0 sm:px-3 sm:last:border-r-0"
              style={{ "--point-delay": `${180 + index * 70}ms` } as React.CSSProperties}
            >
              <span className="font-mono text-mono font-bold text-signal">
                {String(index + 1).padStart(2, "0")}
              </span>
              <span className="text-caption font-semibold text-ink">{point}</span>
            </li>
          ))}
        </ol>
      ) : null}
      {/*
        캡션을 문장 단위로 줄을 나눈다 (2026.09.20)
        한 단락으로 흘리면 "…제작팀과 맞췄습니다. 재고 점검 시간 / 단축 근거는…" 처럼
        문장 경계가 줄 가운데에 놓이고, "재고 점검 시간 단축" 같은 한 명사구가
        두 줄로 갈라졌다(1440px 실측). 문구는 그대로 두고 배치만 나눈다.
        괄호 안 날짜(2026.08.)의 마침표로는 쪼개지 않는다.
      */}
      <figcaption className="mt-3 text-small leading-[1.7] text-ink-2">
        {splitCaptionSentences(copy.caption).map((sentence, i) => (
          <span key={i} className={i === 0 ? "block" : "mt-1 block"}>
            {sentence}
          </span>
        ))}
      </figcaption>
      <a
        href={fullSrc}
        target="_blank"
        rel="noopener"
        aria-label={`${brand} 증빙 원본 크기로 열기 (새 탭)`}
        className="mt-3 inline-flex min-h-[44px] items-center border border-rule px-3 py-2 font-mono text-mono font-bold text-ink transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
      >
        원본 크기로 열기 ↗
      </a>
    </Reveal>
  );
}

/**
 * 홈 카드의 증빙 접기.
 *
 * 증빙 자체는 이 포트폴리오의 근거이므로 없애지 않는다. 다만 홈은 훑는 지면이고
 * 상세 페이지가 파고드는 지면이다 — 731px 짜리 화면을 다섯 번 연속으로 세워 두면
 * 훑는 쪽은 끝까지 내려가지 못하고, 파고드는 쪽은 어차피 상세로 들어간다.
 * 여기서는 무엇이 들어 있는지 한 줄로 밝히고 접어 둔다.
 *
 * 닫힌 details 안의 노드는 getBoundingClientRect() 가 0 이라 MotionRuntime 이
 * 마운트 시점에 곧바로 is-in 을 붙인다. 펼쳤을 때 빈 칸이 남지 않는다.
 */
function EvidenceFold({
  slug,
  brand,
  evidenceLabel,
  sizes,
  className = "",
  plainClassName = "",
}: {
  slug: string;
  brand: string;
  evidenceLabel: string;
  sizes: string;
  className?: string;
  /** 접지 않는 판에서 쓰는 여백 — 접기 전 지면과 같은 간격을 유지한다 */
  plainClassName?: string;
}) {
  if (!HOME_EVIDENCE[slug]) return null;
  /*
   * 접기는 260908 개선판에서만 켠다.
   *
   * 이 사이트는 층이 넷이다 — 히어로(10초) · 이력서 4쪽 · 포트폴리오 PDF 33쪽 · 웹사이트.
   * 짧게 보고 싶은 사람에게는 이미 4쪽짜리가 있고, 웹사이트까지 온 사람은 깊이 보러 온
   * 쪽이다. 그런 독자에게 증빙을 클릭 뒤로 숨기면 스크롤(싼 비용)을 클릭(비싼 비용)으로
   * 바꾸는 셈이라 손해일 수 있다. 공용판은 지금까지대로 펼쳐 둔다.
   */
  if (!isV260908) {
    return (
      <EvidencePreview
        slug={slug}
        brand={brand}
        evidenceLabel={evidenceLabel}
        sizes={sizes}
        className={plainClassName}
      />
    );
  }
  return (
    <details className={`evidence-fold ${className}`.trim()}>
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center gap-3 border border-rule px-3 py-2 font-mono text-mono font-bold text-ink transition-colors hover:border-signal hover:text-signal focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal">
        <span className="evidence-fold-mark text-signal" aria-hidden="true">
          +
        </span>
        <span>근거 화면 · {evidenceLabel}</span>
      </summary>
      <EvidencePreview
        slug={slug}
        brand={brand}
        evidenceLabel={evidenceLabel}
        sizes={sizes}
        className="mt-5"
      />
    </details>
  );
}

/* 대표 4편의 순서는 읽는 쪽이 다르므로 판마다 다르다 — 근거는 edition.ts 주석 참고 */
const SPREAD_SLUGS = edition.spreadOrder;

/*
 * 주력 두 건.
 *
 * 사례 다섯 건이 같은 크기·같은 밀도로 나란히 서 있으면 "많다"로는 읽혀도
 * "이 사람의 대표작이 무엇인가"에는 답하지 못한다. 읽는 쪽이 면접에서 파고들 지점을
 * 스스로 골라야 하는 상태다. 사례를 줄이지 않고 위계만 만든다.
 *
 * 별도 목록을 두지 않고 spreadOrder 의 앞 두 건을 쓴다 — 그 순서가 이미
 * "무엇을 먼저 읽혀야 하는가"로 정해져 있다(edition.ts 주석). 목록을 하나 더 두면
 * 순서와 주력이 갈라질 자리가 생긴다.
 */
const FEATURED_SLUGS = SPREAD_SLUGS.slice(0, 2);

/**
 * 4편 중 딱 한 편만 다른 지면 구조로 낸다.
 *
 * 밀도 교차(다크=수치 / 라이트=서술)는 이 사이트의 유일한 구조 규칙이라 지켜야 하지만,
 * 그게 네 번 연속되면 세 번째부터 화면 구성이 예측된다. 그렇다고 2편 이상 바꾸면
 * 규칙 자체가 사라지고 그냥 레이아웃이 제각각인 사이트가 된다.
 *
 * 대교를 고른 이유: 이 케이스의 자산은 수치가 아니라 "받은 결론을 뒤집은 순서"다.
 * 수치를 왼쪽에 고정해 두고 판단 과정만 흐르게 하면, 읽는 내내 그 수치가 무엇에 대한
 * 것인지가 시야에서 사라지지 않는다. 아래 4단계는 전부 기존 필드에서 가져온다 —
 * 이 레이아웃을 위해 새로 쓴 문장은 없다.
 */
const SPLIT_SLUG = "daekyo";

/**
 * 카드에 띄울 보조 지표를 케이스별로 못 박는다.
 *
 * 이전엔 results 상위 3개를 자동으로 뽑았는데, 그 결과 두 곳에서 이 사이트가 스스로
 * 내건 원칙을 어겼다:
 *  - 제이에스티나 카드에 기준이 다른 "210% → 583%"가 대표 지표(352%→583%) 옆에 나란히 섰다.
 *  - 뉴발란스 카드에 "참고 · MOP 공개 사례 3시간"이 출처 단서 없이 떠서,
 *    첫 화면 Data Policy("출처가 다른 수치를 한 범위로 묶지 않습니다")와 정면으로 부딪혔다.
 * 두 값 모두 케이스 상세에는 단서와 함께 그대로 남아 있다.
 */
export const CARD_METRICS: Record<string, string[]> = {
  samsonite: ["TUMI ROAS", "그레고리 CVR YoY"],
  dyson: ["구독 전환 (매체 집계)", "구독 CPA (매체 집계)", "동영상 광고 CTR"],
  /*
   * 라벨은 results 에 적힌 그대로여야 한다.
   * 예전에는 "매체 ROAS"·"GA4 전환매출"을 요청했는데 데이터 쪽에서 각각 이름이 바뀌고
   * 삭제되면서(매출 절대값 비공개 원칙) 둘 다 못 찾았고, 카드에는 브랜드검색 쿼리수
   * 하나만 남아 대표 사례가 가장 빈약해 보였다. 아래 throw 가 그때 빌드를 세운다.
   *
   * 매체 보고 기준 ROAS(808%)는 일부러 넣지 않는다 — 대표 수치 583%가 GA4 기준이라
   * 기준이 다른 두 ROAS 가 나란히 서면 읽는 쪽이 어느 쪽을 봐야 할지 모른다.
   * 같은 마감보고에서 나온, 기준이 겹치지 않는 셋만 올린다.
   */
  jestina: ["전환매출 증감", "브랜드검색 쿼리수", "검색 CPC"],
  daekyo: ["CPA 개선", "CTR"],
  /*
   * 홈 스프레드에서는 한 가지만 말한다 — 월 10억 계정을 안전하게 자동화했다.
   * 이전에는 키워드 원본 검수(18,396행)·확장 검토 범위(639→15)가 올라와 있었는데,
   * 제목("언제 멈출지부터 설계했습니다")과 다른 이야기라 핵심이 흩어졌다.
   * 키워드 확장은 삭제하지 않고 케이스 상세의 results 에 그대로 남는다.
   */
  newbalance: ["데이터 이상 시", "리포트 수기 작성"],
  /* 대표 수치(ROAS 201→238%)와 기준이 겹치지 않는 둘만 올린다. 둘 다 증감률이라
     절대값 비공개 원칙에도 걸리지 않는다. */
  gangwon: ["쇼핑검색 ROAS", "전환매출 증감"],
};

function ReadingCase({ project: p, index, extras }: { project: Project; index: number; extras: ProjectMetric[] }) {
  const featured = index < 2;
  const steps = p.slug === "daekyo"
    ? [
        { label: "받은 결론", body: p.cardProblem ?? p.objective },
        { label: "의심한 지점", body: p.detail.challenge },
        { label: "재산출", body: p.detail.dataAnalysis },
        { label: "병목 재정의", body: p.detail.strategy },
      ]
    : [
        { label: "문제", body: p.cardProblem ?? p.objective },
        /*
         * 라벨은 경력기술서에서 쓰는 말로 짧게 둔다. "판단과 행동 / 확인한 결과" 는 세 칸이
         * 수식어 붙은 명사형으로 대칭을 이뤄 틀에 찍은 글처럼 읽혔다(2026.09.13 사용자 지적).
         */
        { label: "한 일", body: p.cardDecision ?? p.detail.strategy },
      ];

  return (
    <article id={`case-${p.slug}`} aria-labelledby={`case-title-${p.slug}`} className={`reading-case final-case ${featured ? "reading-case-featured" : "final-case-support"} ${p.slug === "newbalance" ? "final-case-dark on-ink" : ""}`}>
      <Container>
        <header className="reading-case-header" data-enter>
          <p className="reading-case-meta">
            <span className="reading-case-number">{String(index + 1).padStart(2, "0")}</span>
            <strong>{p.brand}</strong>
            <span>{p.industry}</span>
            {featured ? <span className="reading-case-feature">주력 사례</span> : null}
          </p>
          <h3 id={`case-title-${p.slug}`} className="reading-case-title">{p.headline}</h3>
          <p className="reading-case-role">{p.role}</p>
        </header>

        <div className="final-case-grid">
          <div className="final-case-reasoning">
            <ol className="reading-case-steps">
              {steps.map((step, stepIndex) => (
              <li key={step.label} data-enter style={{ "--enter-delay": `${stepIndex * 70}ms` } as React.CSSProperties}>
                <h4><span aria-hidden="true">{String(stepIndex + 1).padStart(2, "0")}</span>{step.label}</h4>
                <p>{step.body}</p>
              </li>
              ))}
            </ol>
            <dl className="reading-case-facts">
              <div><dt>기여 범위</dt><dd>{p.contributionNote ?? `기여도 ${p.contribution}%`}</dd></div>
              {p.scale ? <div><dt>{p.scaleLabel ?? "규모"}</dt><dd>{p.scale}</dd></div> : null}
              <div><dt>기간 · 채널</dt><dd>{p.period} · {channelLabel(p.channels)}</dd></div>
            </dl>
          </div>
          <div className="final-case-proof">
          <div className="reading-case-result" data-enter>
            <h4>성과</h4>
            <p className="reading-case-metric-label">{p.keyMetric.label}</p>
            <p className="reading-case-metric figure" data-enter="wipe" style={{ "--enter-delay": "100ms" } as React.CSSProperties}>
              {p.keyMetric.before && p.keyMetric.before !== "기준" ? (
                <span className="reading-case-before">{p.keyMetric.before}<span aria-hidden="true"> → </span><span className="sr-only">에서 </span></span>
              ) : null}
              <CountUpValue value={p.keyMetric.after} delay={180} duration={1450} />
            </p>
            {p.keyMetric.note ? <p className="reading-case-basis">{p.keyMetric.note}</p> : null}
          </div>
          {HOME_EVIDENCE[p.slug] ? (
            <div className="reading-case-evidence">
              <h4>실행 증빙</h4>
              <EvidencePreview slug={p.slug} brand={p.brand} evidenceLabel={p.evidenceLabel} sizes="(min-width: 1280px) 620px, (min-width: 1024px) 52vw, calc(100vw - 2.5rem)" />
            </div>
          ) : null}
          {(p.slug === "daekyo" || !HOME_EVIDENCE[p.slug]) && p.detail.evidenceNote ? (
            <p className="reading-case-basis mt-5">{p.detail.evidenceNote}</p>
          ) : null}
          </div>
        {extras.length ? (
          <dl className="reading-case-extras" data-count={extras.length}>
            {extras.map((m) => (
              <div key={m.label}>
                <dt>{m.label}</dt>
                <dd><Metric size="sm" onDark={p.slug === "newbalance"} before={m.before === "기준" ? undefined : m.before} after={m.after} /></dd>
                {m.note ? <dd className="reading-case-basis">{m.note}</dd> : null}
              </div>
            ))}
          </dl>
        ) : null}
        </div>

        {p.slug === "newbalance" ? (
          <div id="inventory-demo" className="reading-case-demo">
            <h4>재고 조회부터 광고 변경까지</h4>
            <AutomationDemo />
          </div>
        ) : null}
        <div className="reading-case-footer">
          <CTAButton href={`/projects/${p.slug}/`} variant="ghost" onDark={p.slug === "newbalance"}>{p.brand} 상세 보기 <span className="ml-2" aria-hidden="true">→</span></CTAButton>
          <a href="#projects" className="reading-index-return">사례 목록 <span aria-hidden="true">↑</span></a>
        </div>
      </Container>
    </article>
  );
}

export default function ProjectsSection() {
  const bySlug = new Map(projects.map((p) => [p.slug, p]));
  const spreads = SPREAD_SLUGS.map((s) => bySlug.get(s)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p),
  );
  const rest = solutionOrder
    .filter((s) => !SPREAD_SLUGS.includes(s))
    .map((s) => bySlug.get(s))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));
  const support = edition.showWhyStudio
    ? rest.filter((p) => ["jestina", "daekyo"].includes(p.slug))
    : [];
  const records = edition.showWhyStudio
    ? rest.filter((p) => !["jestina", "daekyo"].includes(p.slug))
    : rest;
  const archived = projects.filter((p) => p.tier === "archive");
  const visibleOtherResults = edition.showWhyShinsegae
    ? otherResults.filter((result) => !result.brand.startsWith("쌤소나이트"))
    : otherResults;

  return (
    <section id="projects" className="scroll-mt-[80px]">
      <Container>
        <div className={EDITION === "general" ? "reading-project-intro" : "py-14 md:py-[72px]"}>
          {EDITION === "general" ? <>
            <span id="impact" className="block scroll-mt-[96px]" />
            <SectionHead kicker="01 · Selected work" title="대표 사례" count="30여 개 브랜드 경험 · 주력 사례 2건" />
            {/*
              역량별 대표 사례 (2026.09.24). 표지의 한 문장(앞 절 = 퍼포먼스 마케팅, 뒤 절 = 마케팅
              오퍼레이션)을 두 묶음으로 받아, 묶음마다 그 역량을 증명하는 사례와 대표 수치를 둔다.
              정체성 → 역량 → 증명이 첫 두 화면 안에서 이어진다. 번호는 아래 사례 카드의 순서 그대로다.
              수치의 기간·기준·기여 범위는 바로 아래 카드가 싣는다 — 목차는 입구다.
            */}
            <nav aria-label="역량별 대표 사례" className="reading-case-index reading-capability-index">
              {capabilityGroups(spreads).map((group) => (
                <div key={group.role} role="group" aria-label={group.role} className="reading-capability">
                  <div className="reading-capability-head">
                    <p className="reading-capability-role">{group.role}</p>
                    <p className="reading-capability-line">{group.line}</p>
                  </div>
                  <ol>
                    {group.items.map(({ p, no }) => <li key={p.slug}>
                      <a href={`#case-${p.slug}`}>
                        <span className="reading-index-no">{no}</span>
                        <span>
                          <strong>{p.brand}</strong>
                          <span>{CASE_JUMP_LABEL[p.slug] ?? p.industry}</span>
                          <span className="reading-index-metric">{indexMetric(p)}</span>
                        </span>
                        <span aria-hidden="true">↓</span>
                      </a>
                    </li>)}
                    {group.extra ? <li>
                      <a href={group.extra.href}>
                        <span className="reading-index-no">{group.extra.no}</span>
                        <span>
                          <strong>{group.extra.title}</strong>
                          <span>{group.extra.label}</span>
                          <span className="reading-index-metric">{group.extra.metric}</span>
                        </span>
                        <span aria-hidden="true">↓</span>
                      </a>
                    </li> : null}
                  </ol>
                </div>
              ))}
            </nav>
          </> : <>
          {/* 편수는 판마다 다르다(hll 핵심 3편 / 일반 4편). 하드코딩하면 곧바로 어긋난다 */}
          <SectionHead
            kicker="Selected work"
            /*
             * "숫자로 남은"이 아니다. EDIT H 가 대표 사례로 올라오면서 이 제목이
             * 어긋났다 — 70호는 성과 수치가 아니라 생산량이고, 이 케이스의 값어치는
             * 무엇을 싣지 않을지 정한 편집 기준이다. 숫자만 앞세우면 그게 발행량
             * 자랑으로 축소된다. 대교 역시 CTR 하락을 뒤집은 판단이 본론이다.
             */
            title={`문제와 결과로 보는 대표 사례 ${spreads.length}건`}
            /* 건수는 위 h2 가 말한다 — 여기서는 모집단만 */
            count={"30여 개 브랜드 경험"}
          />
          <p className="mt-5 max-w-[48rem] border-l-2 border-signal pl-3 text-small leading-[1.7] text-ink-3">
            {edition.projectScanGuide}
          </p>
          {/*
            사례가 화면 단위로 이어져 원하는 것까지 내려가야 했다. 채용 과제와 가까운
            사례부터 읽을 수 있게 바로가기를 둔다. 내용을 줄이지 않고 긴 지면의 부담만
            던다. 라벨은 브랜드가 아니라 그 사례가 증명하는 역량으로 적는다 — 읽는 쪽이
            찾는 것은 브랜드 이름이 아니라 "이 사람이 무엇을 할 수 있는가"다.
          */}
          <nav aria-label="대표 사례 바로가기" className="mt-4 flex flex-wrap gap-2">
            {spreads.map((p) => (
              <a
                key={p.slug}
                href={`#case-${p.slug}`}
                className={`inline-flex min-h-[36px] items-center border px-3 font-mono text-[0.75rem] transition-colors hover:border-signal hover:text-signal ${
                  FEATURED_SLUGS.includes(p.slug)
                    ? "border-signal font-bold text-ink"
                    : "border-rule text-ink-2"
                }`}
              >
                {/* 글리프를 새로 들이지 않는다 — 테두리와 굵기로만 가른다(폰트 서브셋 게이트) */}
                {CASE_JUMP_LABEL[p.slug] ?? p.brand}
              </a>
            ))}
          </nav>
          </>}
        </div>
      </Container>

      {/* 다크 밴드가 전체 폭으로 나가야 하므로 스프레드는 Container 밖에 둔다 */}
      <div>
          {spreads.map((p, i) => {
            /* 다음 케이스가 있을 때만, 그 조합에 맞는 다리를 찾는다 */
            const next = spreads[i + 1];
            /* HLL판은 EDIT H 뒤에 Creative Roots가 직접 전환 문장을 갖는다. */
            const bridge =
              next && !(edition.showWhyStudio && p.slug === "edith")
                ? BRIDGES[`${p.slug}→${next.slug}`]
                : undefined;
            /* 화이트리스트 순서를 그대로 따른다 — 자동 추출은 기준이 다른 값을 끌어올린다 */
            const allow = CARD_METRICS[p.slug] ?? [];
            const evidenceFile = HOME_EVIDENCE[p.slug];
            /*
             * 못 찾은 라벨을 조용히 버리지 않는다.
             * filter(Boolean) 로 흘려보내던 동안 세 케이스에서 보조 수치가 사라져 있었고,
             * 화면에는 "원래 하나였던 것"처럼 보여서 아무도 눈치채지 못했다.
             * 데이터 라벨을 바꾸면 여기서 빌드가 선다.
             */
            const extras = allow.map((label) => {
              const m = p.detail.results.find((r) => r.label === label);
              if (!m) {
                throw new Error(
                  `CARD_METRICS["${p.slug}"] 의 "${label}" 이 results 에 없습니다. ` +
                    `라벨을 바꿨다면 이 표도 함께 고쳐야 합니다.`,
                );
              }
              return m;
            });

            const folio = `CH.${String(i + 1).padStart(2, "0")}`;

            if (EDITION === "general") {
              return <ReadingCase key={p.slug} project={p} index={i} extras={extras} />;
            }

            if (p.slug === SPLIT_SLUG) {
              /* 판단 4단계 — 전부 기존 필드다(새 문장 없음) */
              const steps = [
                { k: "받은 결론", v: p.cardProblem ?? p.objective },
                { k: "의심한 지점", v: p.detail.challenge },
                { k: "재산출", v: p.detail.dataAnalysis },
                { k: "병목 재정의", v: p.detail.strategy },
              ].filter((s): s is { k: string; v: string } => Boolean(s.v));

              return (
                <article key={p.slug} id={`case-${p.slug}`} className="scroll-mt-[80px]">
                  <div className="grid grid-cols-1 border-t border-rule-ink lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
                    {/* 왼쪽 — 수치와 기여 범위가 스크롤 내내 고정된다 */}
                    <div className="case-heading-band bg-ink px-5 py-12 text-on-ink sm:px-10 lg:py-16">
                      <div className="lg:sticky lg:top-[104px]">
                        <p className="flex flex-wrap items-baseline gap-x-3 font-mono text-mono font-bold tracking-[0.03em] text-limit-ink">
                          <span>{folio}</span>
                          <span className="text-on-ink">{p.brand}</span>
                          <span className="font-normal text-on-ink-2">{p.industry}</span>
                        </p>
                        <Reveal variant="wipe" className="mt-5">
                          {p.keyMetric.before && p.keyMetric.before !== "기준" ? (
                            <p className="flex items-center gap-3">
                              <span className="figure text-[clamp(1.125rem,1.9vw,1.5rem)] leading-none font-semibold text-on-ink-2">
                                {p.keyMetric.before}
                              </span>
                              <span className="font-mono text-on-ink-2" aria-hidden="true">
                                →
                              </span>
                              <span className="sr-only">에서 </span>
                            </p>
                          ) : null}
                          <p
                            className={`case-lead-metric figure mt-1.5 whitespace-nowrap text-on-ink ${isV260908 ? "text-mega-case" : "text-[clamp(2.75rem,6vw,4.5rem)] leading-[0.9]"}`}
                            style={{ fontStretch: "116%", fontWeight: 800 }}
                          >
                            <CountUpValue value={p.keyMetric.after} delay={140} />
                          </p>
                        </Reveal>
                        <p className="mt-4 text-h3 text-on-ink">{p.keyMetric.label}</p>

                        <dl className="mt-8 flex flex-col gap-4 border-t border-rule-ink-2 pt-6 font-mono text-mono">
                          <div>
                            <dt className="text-on-ink-2">기여 범위</dt>
                            <dd className="mt-1 font-bold text-limit-ink">
                              {p.contributionNote ?? `기여도 ${p.contribution}%`}
                            </dd>
                          </div>
                          {p.scale ? (
                            <div>
                              <dt className="text-on-ink-2">{p.scaleLabel ?? "규모"}</dt>
                              <dd className="mt-1 text-on-ink">{p.scale}</dd>
                            </div>
                          ) : null}
                          <div>
                            <dt className="text-on-ink-2">기간 · 채널</dt>
                            <dd className="mt-1 text-on-ink">
                              {p.period} · {channelLabel(p.channels)}
                            </dd>
                          </div>
                          {p.keyMetric.note ? (
                            <div>
                              <dt className="text-on-ink-2">집계 기준</dt>
                              <dd className="mt-1 leading-[1.55] text-on-ink-2">{p.keyMetric.note}</dd>
                            </div>
                          ) : null}
                        </dl>
                      </div>
                    </div>

                    {/* 오른쪽 — 판단의 순서만 흐른다 */}
                    <div className="case-reading-band bg-paper px-5 py-12 sm:px-10 lg:py-16 lg:pl-14">
                      <h3 className="case-title max-w-[34ch] text-case-h">{p.headline}</h3>
                      <ol className="mt-8 border-l border-line pl-7">
                        {steps.map((s, si) => (
                          <Reveal
                            as="li"
                            key={s.k}
                            delay={si * 0.05}
                            className="relative list-none pb-7 last:pb-0"
                          >
                            <span
                              className="absolute top-[0.5em] -left-[1.97rem] h-1.5 w-1.5 bg-signal"
                              aria-hidden="true"
                            />
                            <p className="font-mono text-mono font-bold tracking-[0.02em] text-signal">
                              {String(si + 1).padStart(2, "0")} {s.k}
                            </p>
                            <p className="mt-1.5 max-w-[62ch] text-body text-ink-2">{s.v}</p>
                          </Reveal>
                        ))}
                      </ol>

                      {extras.length ? (
                        <dl className="mt-9 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-line pt-6 sm:grid-cols-2">
                          {extras.map((m) => (
                            <div key={m.label}>
                              <dt className="font-mono text-mono text-ink-3">{m.label}</dt>
                              <dd className="mt-1.5">
                                <Metric
                                  size="sm"
                                  before={m.before === "기준" ? undefined : m.before}
                                  after={m.after}
                                />
                              </dd>
                            </div>
                          ))}
                        </dl>
                      ) : null}

                      {/*
                        이 레이아웃은 "판단 4단계"가 주인공이라 오래 증빙 자리가 없었다.
                        광고주 동의를 받은 뒤에도 HOME_EVIDENCE 만 채우면 이 분기에서는
                        렌더되지 않아 대교만 홈에서 그림이 없는 채로 남는다.
                        4단계를 읽고 난 자리, 역할 표기 바로 앞에 둔다 — 판단을 먼저 읽고
                        그 판단이 실제로 도구가 된 화면을 보는 순서가 된다.
                      */}
                      {evidenceFile ? (
                        <EvidenceFold
                          slug={p.slug}
                          brand={p.brand}
                          evidenceLabel={p.evidenceLabel}
                          sizes="(min-width: 1024px) 58rem, 100vw"
                          className="mt-6"
                          plainClassName="mt-8"
                        />
                      ) : null}

                      <p className="mt-6 font-mono text-mono text-ink-3">역할 · {p.role}</p>
                      {p.detail.evidenceNote ? (
                        <p className="mt-3 max-w-[62ch] font-mono text-mono leading-[1.6] text-ink-3">
                          {p.detail.evidenceNote}
                        </p>
                      ) : null}
                      {/*
                          밑줄 텍스트 링크였다. 이 카드에서 상세 페이지로 넘어가는 것이
                          이 섹션의 유일한 목적인데, 링크가 본문과 같은 무게라 눈에 걸리지
                          않았다. 사이트의 버튼 체계(CTAButton ghost)를 그대로 써서
                          누를 것처럼 보이게 한다 — 새 스타일을 만들면 체계가 갈라진다.
                        */}
                        <CTAButton href={`/projects/${p.slug}/`} variant="ghost" className="group mt-4 w-full sm:w-auto">
                          케이스 전문 보기
                          <span className="nudge ml-2" aria-hidden="true">→</span>
                        </CTAButton>

                      {bridge ? <Bridge>{bridge}</Bridge> : null}
                    </div>
                  </div>
                </article>
              );
            }

            return (
              <Fragment key={p.slug}>
              <article id={`case-${p.slug}`} className="scroll-mt-[80px]">
                {/*
                  밀도 교차 — 이 사이트의 유일한 구조 규칙.
                  ① 다크 = 보는 구간. 저밀도로 두고 대표 수치 하나가 지면을 점거한다.
                  ② 라이트 = 읽는 구간. 서술·보조 지표·역할이 고밀도로 들어온다.
                  이전 디자인이 심심했던 이유는 케이스 4편이 전부 같은 밀도의 흰 지면이라
                  스크롤해도 화면 구성이 변하지 않았기 때문이다.
                */}
                <div className="case-heading-band border-t border-rule-ink bg-ink py-12 text-on-ink lg:py-16">
                  <Container>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-7 lg:grid-cols-12">
                      <div className="lg:col-span-8">
                        <p className="flex flex-wrap items-baseline gap-x-3 font-mono text-mono font-bold tracking-[0.08em] text-limit-ink uppercase">
                          <span>CH.{String(i + 1).padStart(2, "0")}</span>
                          {FEATURED_SLUGS.includes(p.slug) ? (
                            <span className="border border-limit-ink px-1.5 py-0.5 text-limit-ink">
                              주력
                            </span>
                          ) : null}
                          <span className="text-on-ink">{p.brand}</span>
                          <span className="font-normal text-on-ink-2">{p.industry}</span>
                          <span className="font-normal text-on-ink-2">
                            {CASE_TYPE[p.slug] ?? p.categories[0]}
                          </span>
                        </p>

                        <Reveal variant="wipe" className="mt-5">
                          {p.keyMetric.before && p.keyMetric.before !== "기준" ? (
                            <p className="flex items-center gap-3">
                              <span className="figure text-[clamp(1.125rem,1.9vw,1.5rem)] leading-none font-semibold text-on-ink-2">
                                {p.keyMetric.before}
                              </span>
                              <span className="font-mono text-on-ink-2" aria-hidden="true">
                                →
                              </span>
                              <span className="sr-only">에서 </span>
                            </p>
                          ) : null}
                          {/* whitespace-nowrap 은 안전장치다 — 값이 길어져도 숫자가 중간에서
                              끊기지 않게 한다. 크기는 text-mega-case 가 칼럼 폭에 맞춰 잡는다. */}
                          <p
                            className="case-lead-metric figure mt-1.5 text-mega-case whitespace-nowrap text-on-ink"
                            style={{ fontStretch: "116%", fontWeight: 800 }}
                          >
                            <CountUpValue value={p.keyMetric.after} delay={140} />
                          </p>
                        </Reveal>

                        <p className="mt-4 text-h3 text-on-ink">{p.keyMetric.label}</p>
                      </div>

                      {/*
                        로어서드 계약 — 수치 옆에는 반드시 출처·기간·기여 범위가 붙는다.
                        기여도를 진행바나 게이지로 그리지 않는다: 40%를 막대로 그리면
                        "40%밖에 안 했다"로 읽혀 신뢰를 올리려던 장치가 감점으로 작동한다.
                      */}
                      <dl className="flex flex-col gap-4 self-end font-mono text-mono lg:col-span-4 lg:border-l lg:border-rule-ink-2 lg:pl-8">
                        <div>
                          <dt className="text-on-ink-2">기여 범위</dt>
                          <dd className="mt-1 font-bold text-limit-ink">
                            {p.contributionNote ?? `기여도 ${p.contribution}%`}
                          </dd>
                        </div>
                        {p.scale ? (
                          <div>
                            <dt className="text-on-ink-2">{p.scaleLabel ?? "규모"}</dt>
                            <dd className="mt-1 text-on-ink">{p.scale}</dd>
                          </div>
                        ) : null}
                        <div>
                          <dt className="text-on-ink-2">기간 · 채널</dt>
                          <dd className="mt-1 text-on-ink">
                            {p.period} · {channelLabel(p.channels)}
                          </dd>
                        </div>
                        {p.keyMetric.note ? (
                          <div>
                            <dt className="text-on-ink-2">집계 기준</dt>
                            <dd className="mt-1 leading-[1.55] text-on-ink-2">{p.keyMetric.note}</dd>
                          </div>
                        ) : null}
                      </dl>
                    </div>
                  </Container>
                </div>

                {/* 읽는 구간 — 고밀도 */}
                <div className="case-reading-band bg-paper py-11 lg:py-14">
                  <Container>
                    <div className="grid grid-cols-1 gap-x-8 gap-y-7 lg:grid-cols-12">
                      <div className="lg:col-span-7">
                        <h3 className="case-title text-case-h">{p.headline}</h3>
                        <p className="mt-5 text-body text-ink-2">{p.cardProblem ?? p.objective}</p>
                        {p.cardDecision ? (
                          <p className="mt-3 text-body text-ink-2">{p.cardDecision}</p>
                        ) : null}
                        <p className="mt-6 font-mono text-mono text-ink-3">역할 · {p.role}</p>
                        {/*
                          밑줄 텍스트 링크였다. 이 카드에서 상세 페이지로 넘어가는 것이
                          이 섹션의 유일한 목적인데, 링크가 본문과 같은 무게라 눈에 걸리지
                          않았다. 사이트의 버튼 체계(CTAButton ghost)를 그대로 써서
                          누를 것처럼 보이게 한다 — 새 스타일을 만들면 체계가 갈라진다.
                        */}
                        <CTAButton href={`/projects/${p.slug}/`} variant="ghost" className="group mt-3 w-full sm:w-auto">
                          케이스 전문 보기
                          <span className="nudge ml-2" aria-hidden="true">→</span>
                        </CTAButton>
                      </div>

                      <div className="self-start border-t border-line pt-5 lg:col-span-5 lg:border-t-0 lg:border-l lg:border-line lg:pt-0 lg:pl-8">
                        {extras.length ? (
                          <dl className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
                            {extras.map((m) => (
                              <div key={m.label}>
                                <dt className="font-mono text-mono text-ink-3">{m.label}</dt>
                                <dd className="mt-1.5">
                                  <Metric
                                    size="sm"
                                    before={m.before === "기준" ? undefined : m.before}
                                    after={m.after}
                                  />
                                </dd>
                                {/*
                                  집계 기준을 홈에서도 수치 바로 아래 붙인다.
                                  results 에는 기준이 다 적혀 있는데 홈 카드가 그걸 버리고 있었다 —
                                  강원심층수는 대표 수치가 "2026 상반기 vs 전년 동기" 인데 보조 지표
                                  쇼핑검색 ROAS 는 "2026년 5월 → 6월" 이라, 기준 없이 나란히 서면
                                  같은 기간의 결과로 읽힌다.
                                */}
                                {m.note ? (
                                  <dd className="mt-1 font-mono text-mono leading-[1.5] text-ink-3">
                                    {m.note}
                                  </dd>
                                ) : null}
                              </div>
                            ))}
                          </dl>
                        ) : null}

                        {!evidenceFile && p.detail.evidenceNote ? (
                          <p className="mt-6 border-t border-line pt-4 font-mono text-mono leading-[1.6] text-ink-3">
                            {p.detail.evidenceNote}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/*
                      뉴발란스의 대표 수치는 "약 2시간 → 5분 이내" 인데, 카드의 대표 도판은
                      비즈보드 소재 8종이라 그 수치를 증명하지 않았다. 그 수치를 만든 자동화가
                      바로 S1 이고, 같은 화면이 페이지 앞쪽에 따로 서 있었다 —
                      같은 사실을 2,400px 간격으로 두 번 말하는 셈이었다.
                      주장 바로 아래에 그 동작을 둔다. 소재 도판은 지우지 않는다.
                      그쪽은 다른 역할(소재 기획)을 증명하므로 순서만 뒤로 보낸다.
                    */}
                    {p.slug === "newbalance" ? (
                      <div id="inventory-demo" className="mt-8 scroll-mt-[96px] border-t border-line pt-8">
                        <p className="font-mono text-mono font-bold tracking-[0.02em] text-system">
                          이 수치를 만든 자동화
                        </p>
                        <AutomationDemo />
                      </div>
                    ) : null}

                    {evidenceFile ? (
                      <EvidenceFold
                        slug={p.slug}
                        brand={p.brand}
                        evidenceLabel={p.evidenceLabel}
                        sizes="(min-width: 1280px) 72rem, calc(100vw - 2.5rem)"
                        className="mt-6 border-t border-line pt-6"
                        plainClassName="mt-8 border-t border-line pt-8"
                      />
                    ) : null}

                    {bridge ? <Bridge>{bridge}</Bridge> : null}
                  </Container>
                </div>
              </article>
              </Fragment>
            );
          })}
      </div>

      <Container>
        <div className="pb-14 md:pb-[72px]">
        {support.length ? (
          <div className="mt-12 border-t border-rule pt-6">
            <p className="font-mono text-[0.6875rem] font-bold tracking-[0.02em] text-ink-3">
              보조 사례 · 판단 방식과 채널 설계
            </p>
            <ul className="mt-4">
              {support.map((p) => (
                <li key={p.slug} className="border-b border-line">
                  <Link
                    href={`/projects/${p.slug}/`}
                    className="group grid grid-cols-1 gap-4 py-6 transition-colors hover:bg-paper lg:grid-cols-[150px_minmax(0,1fr)_auto] lg:items-start lg:gap-6"
                  >
                    <span>
                      <span className="block text-small font-bold text-ink">{p.brand}</span>
                      <span className="mt-1 block font-mono text-mono text-ink-3">{p.industry}</span>
                    </span>
                    <span className="grid grid-cols-1 gap-4 md:grid-cols-3">
                      <span>
                        <span className="block font-mono text-mono font-bold text-ink-3">문제</span>
                        <span className="mt-1.5 block text-caption leading-[1.65] text-ink-2">
                          {p.cardProblem ?? p.objective}
                        </span>
                      </span>
                      <span>
                        <span className="block font-mono text-mono font-bold text-ink-3">바꾼 것</span>
                        <span className="mt-1.5 block text-caption leading-[1.65] text-ink-2">
                          {p.cardDecision ?? p.detail.strategy}
                        </span>
                      </span>
                      <span>
                        <span className="block font-mono text-mono font-bold text-ink-3">결과</span>
                        <span className="mt-1.5 block text-caption font-bold leading-[1.65] text-ink">
                          {p.keyMetric.before && p.keyMetric.before !== "기준"
                            ? `${p.keyMetric.before} → ${p.keyMetric.after}`
                            : p.keyMetric.after}
                          {` · ${p.keyMetric.label}`}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-2 lg:justify-end">
                      <Badge tone="mark">전문 보기</Badge>
                      <span className="nudge text-caption font-bold text-ink" aria-hidden="true">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {/* 그 외 기록 — 얇은 리스트 행. 접기 토글을 쓰지 않는다(클릭 뒤로 숨기면 읽히지 않는다) */}
        {records.length || archived.length ? (
          <div className="mt-12 border-t border-rule pt-6">
            {/* 한글 라벨에는 라틴 대문자용 넓은 자간을 쓰지 않는다 — "그 외 기 록"으로 뜯어진다 */}
            <p className="font-mono text-[0.6875rem] font-bold tracking-[0.02em] text-ink-3">
              그 외 기록
            </p>
            <ul className="mt-4">
              {records.map((p) => (
                <li key={p.slug} className="border-b border-line">
                  <Link
                    href={`/projects/${p.slug}/`}
                    className="group grid min-h-[72px] grid-cols-1 items-center gap-2 py-4 transition-colors hover:bg-paper sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:gap-5"
                  >
                    <span className="text-small font-bold text-ink">{p.brand}</span>
                    <span className="text-caption text-ink-2">{p.headline}</span>
                    <span className="flex items-center gap-2">
                      <Badge tone="mark">
                        {p.contributionNote ?? `기여도 ${p.contribution}%`}
                      </Badge>
                      <span className="nudge text-caption font-bold text-ink" aria-hidden="true">
                        →
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
              {archived.map((p) => (
                <li key={p.slug} className="border-b border-line last:border-b-0">
                  <Link
                    href={`/projects/${p.slug}/`}
                    className="grid min-h-[64px] grid-cols-1 items-center gap-2 py-3.5 transition-colors hover:bg-paper sm:grid-cols-[150px_minmax(0,1fr)_auto] sm:gap-5"
                  >
                    <span className="text-small font-semibold text-ink-2">{p.brand}</span>
                    <span className="text-caption text-ink-3">{p.objective}</span>
                    <span className="font-mono text-mono text-ink-3">{p.period}</span>
                  </Link>
                </li>
              ))}
            </ul>

          </div>
        ) : null}

        {/*
          추가 운영 성과 — 카드로 다루지 않는 6건.
          직전까지 이 여섯 브랜드는 홈에서 이름 한 줄로만 나열되고, 실제로 무엇을 했고
          어떤 숫자가 남았는지는 /resume/ 안에서만 볼 수 있었다. "30여 개 브랜드"라는
          주장이 이 페이지에서 네 번 반복되는데 그 근거가 다른 문서에 있던 셈이다.

          카드가 아니라 얇은 리스트 행으로 둔다 — 대표 4편과 같은 무게로 보이면 안 되고,
          이 구간의 목적은 감상이 아니라 "업종·과제 폭이 실제로 넓다"의 확인이다.
        */}
        {!edition.showWhyStudio ? (
        <div className="mt-10 border-t border-rule pt-6">
          <p className="font-mono text-[0.6875rem] font-bold tracking-[0.02em] text-ink-3">
            추가 운영 성과
          </p>
          <p className="mt-2 text-caption text-ink-3">
            <span className="block">각 브랜드 운영 리포트 기준이며, 집계 범위가 서로 다릅니다.</span>
            <span className="block">운영 기간은 담당 브랜드별 통합본 기준이며, 월 단위가 확인되지 않은 브랜드는 표에 올리지 않았습니다.</span>
          </p>
          <ul className="mt-4">
            {visibleOtherResults.map((r) => (
              <li
                key={r.brand}
                className="grid grid-cols-1 gap-x-6 gap-y-2.5 border-b border-line py-4 sm:grid-cols-[150px_minmax(0,1fr)_minmax(0,210px)]"
              >
                <div>
                  <p className="text-small font-bold text-ink">{r.brand}</p>
                  <p className="mt-0.5 font-mono text-mono text-ink-3">{r.category}</p>
                  {r.period ? (
                    <p className="mt-0.5 font-mono text-mono text-ink-3">{r.period}</p>
                  ) : null}
                </div>
                <p className="text-caption leading-[1.7] text-ink-2">{r.summary}</p>
                <dl className="flex flex-col gap-2">
                  {r.metrics.map((m) => (
                    <div key={m.label}>
                      <dt className="font-mono text-mono text-ink-3">{m.label}</dt>
                      <dd className="tnum mt-0.5 text-caption font-bold text-ink">{m.value}</dd>
                    </div>
                  ))}
                </dl>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-caption leading-[1.7] text-ink-3">
            <span className="block">
              <span className="font-semibold text-ink-2">그 밖에 </span>
              {otherBrands.join(" · ")} 등 9개 산업군 30여 개 브랜드의 운영·분석 경험이 있습니다.
            </span>
            <span className="block">월 단위 기간을 확인하지 못한 브랜드는 위 표에 올리지 않았고, 세부 수치는 출처와 집계 범위를 함께 확인할 수 있을 때만 공유합니다.</span>
          </p>
        </div>
        ) : null}
        </div>
      </Container>
    </section>
  );
}
