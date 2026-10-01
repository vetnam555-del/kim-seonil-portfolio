/**
 * 판(edition) 정의.
 *
 * 같은 소스에서 두 사이트를 낸다.
 *  - hll     : 그룹 내 스튜디오 룰루랄라 솔루션팀 지원용 (/kim-seonil-portfolio_HLL)
 *  - general : 일반 공개·외부 지원용 (/kim-seonil-portfolio)
 *
 * 두 사이트를 따로 관리하다가 실제로 어긋났던 적이 있다 — 한쪽에서만 바꾼 영문 표기,
 * 기준이 다른 수치(제이에스티나 210%→583%), 수상 표기가 다른 쪽에 몇 주 동안 남아 있었다.
 * 그래서 사실·수치·디자인은 전부 공유하고, **지원 대상 때문에 달라져야 하는 문장만**
 * 이 파일 한 곳에 모은다. 여기 없는 것은 두 판이 같아야 한다는 뜻이다.
 *
 * 빌드: `npm run build:hll` / `npm run build:general`
 */
/*
 * v260908 — 2026.09.08 개선판. 내용은 일반판과 같고 주소만 다르다.
 * 기존 4판은 이미 지원처에 나가 있어 손대지 않는다. 구조·타입 스케일 개편은
 * 이 판에서만 확인하고, 자리를 잡으면 나머지 판이 따라온다.
 */
export type Edition = "hll" | "general" | "shinsegae" | "ably" | "v260908" | "nw";

const REQUESTED = process.env.NEXT_PUBLIC_EDITION;
export const EDITION: Edition =
  REQUESTED === "general" || REQUESTED === "shinsegae" || REQUESTED === "ably" ||
  REQUESTED === "v260908" || REQUESTED === "nw"
    ? REQUESTED
    : "hll";

/*
 * 카피 표만 파생시키는 것으로는 부족했다.
 * 사이트 아홉 곳이 edition 객체가 아니라 EDITION === "general" 로 직접 분기한다.
 * v260908 판이 그 분기를 전부 통과하지 못하면서, 카피는 일반판인데 구조는 hll 판인
 * 물건이 배포됐다 — 히어로 버튼 두 개가 사라지고, CreativeHistory 대신 옛 CreativeRoots 가
 * 실리고, 판권면이 2026.08 로 나갔다. 화면을 열어 보고서야 잡혔다.
 * 판별 분기는 전부 이 플래그를 거친다.
 */
export const isGeneralLike = EDITION === "general" || EDITION === "v260908" || EDITION === "nw";

/*
 * 개선판에서만 켜는 것들. 기존 4판은 이미 지원처에 나가 있으므로 표지 구성이 바뀌면 안 된다.
 */
export const isV260908 = EDITION === "v260908";

/*
 * 개편판(nw). 카피는 일반판과 같고 홈 화면의 구성만 다르다 — 케이스 상세 9단 구조는
 * 이 사이트의 강점이라 손대지 않는다. 홈만 갈아 끼우는 판이라는 뜻이다.
 */
export const isNew = EDITION === "nw";

/*
 * ── 클라이언트 전용 파생값 ──
 *
 * Header 는 "use client" 다. 거기서 edition 객체를 읽으면 판별 카피 표(COPY)가 통째로
 * 브라우저 번들에 실린다. 그러면 사외 지원판 산출물 안에 사내 메일(kim.seonill@hll.kr)과
 * HLL 판 주소가 그대로 들어간다 — validate_export 의 유출 검사가 실제로 이걸 잡았다.
 *
 * 그래서 클라이언트가 필요한 값은 표를 건드리지 않고 EDITION 에서 직접 만든다.
 * 판 이름은 빌드 시 상수로 접히므로 쓰지 않는 판의 문자열은 남지 않는다.
 * 값이 COPY 의 해당 항목과 어긋나면 안 되니, 표를 고칠 때 여기도 같이 본다.
 */
export const showsWhyStudio = EDITION === "hll";
export const showsWhyShinsegae = EDITION === "shinsegae";
export const showsWhyAbly = EDITION === "ably";
/** 판과 무관한 상수. site.ts 가 이 값을 쓴다 — 두 곳에 적지 않는다. */
export const NAME_KO = "김선일";

/*
 * OG 이미지 주소 뒤에 붙이는 판 표시. 카카오톡·슬랙 등은 미리보기 이미지를 주소 단위로 오래 캐시해서,
 * 같은 파일명으로 이미지를 다시 구워도 이미 공유된 링크에는 옛 이미지가 뜬다.
 * OG 이미지를 다시 구우면 이 값을 바꾼다 (2026.09.25 — 경력직 개편: 직함 · 첫 문장).
 */
export const OG_VERSION = "20260926a";

/*
 * 판별 직함. COPY[…].role 과 반드시 같아야 하는데 표를 참조할 수 없으므로 값을 다시 적는다.
 * 어긋나면 layout.tsx 의 빌드 시 대조가 빌드를 세운다 — 조용히 갈라지지 않게 한 장치다.
 */
export const roleForClient =
  EDITION === "hll"
    ? "퍼포먼스 기반 콘텐츠 그로스"
    : EDITION === "shinsegae"
      ? "디지털 CRM · 커머스 그로스"
      : EDITION === "ably"
        ? "신사업 그로스 · 실험 설계"
        : "퍼포먼스 마케터";

export const portfolioPdfPathForClient =
  EDITION === "ably"
    ? "/kim-seonil-ably-growth-portfolio.pdf"
    : isGeneralLike
      ? "/kim-seonil-performance-marketing-portfolio.pdf?v=20260926f"
      : "/kim-seonil-performance-marketing-portfolio.pdf";

export const isHLL = EDITION === "hll";
export const isShinsegae = EDITION === "shinsegae";
export const isAbly = EDITION === "ably";

interface EditionCopy {
  /** 판권면·케이스 폴리오 앞에 붙는 발행 표기 */
  issueLabel: string;
  /**
   * 마스트헤드 왼쪽 직함. 두 판이 증명하는 범위가 다르다 —
   * hll 판은 콘텐츠 기획·채널 인벤토리 설계까지 보여주는데 첫 줄에
   * "PERFORMANCE MARKETER"만 걸면 지원 직무와 어긋난 상태로 시작한다.
   */
  mastheadLeft: string;
  /**
   * 마스트헤드 둘째 단. 지원 직무와 기반 역량을 한 줄에 · 로 이어 붙이면
   * BRAND SOLUTION MARKETER 와 PERFORMANCE·DATA·AUTOMATION 이 같은 위계로 읽혀
   * 키워드 나열처럼 보인다. 첫 줄은 "무슨 자리에 가려는가", 둘째 줄은
   * "그 자리를 무엇으로 하는가"로 갈라 둔다.
   */
  mastheadBase: string;
  mastheadRight: string;
  /** 헤더 로고 옆 직함 */
  role: string;
  /** 표지 데크 — 첫 화면에서 "이 사람이 오면 무엇이 풀리는가"에 답하는 문단 */
  deck: string;
  /** 표지 제목을 채용 직무 언어로 바로 번역하는 한 줄 */
  heroRoleLine: string;
  /** 표지의 가장 중요한 행동. 판마다 읽는 사람의 다음 질문이 다르다. */
  primaryCtaLabel: string;
  /** 긴 사례 지면을 어떤 순서로 읽을지 알려 주는 서버 렌더링 안내 */
  projectScanGuide: string;
  seoTitle: string;
  seoDescription: string;
  ogAlt: string;
  caseDescription: string;
  /*
   * 판마다 내려주는 덱이 다르다. 에이블리판 사이트가 일반 덱을 내려주고 있었다 —
   * 전용 덱을 만들어 두고 링크는 공용 것을 걸어 두면, 받는 쪽은 전용판을 못 본다.
   */
  portfolioPdfPath: string;
  url: string;
  /** 지원 이유(WhyLululala) 섹션과 목차 항목의 노출 여부 */
  showWhyStudio: boolean;
  /** 신세계 디지털 CRM 직무 적합성 섹션 노출 여부 */
  showWhyShinsegae: boolean;
  /** 에이블리 신사업 그로스 직무 적합성 섹션 노출 여부 */
  showWhyAbly: boolean;
  /**
   * 표지에 대형으로 올릴 수치 2개. spreadOrder 의 앞 두 건과 일치시켜야 한다 —
   * 대형 수치와 챕터 밴드가 서로 다른 사례를 1번으로 지목하면 첫 화면이 자기모순이 된다.
   */
  heroHeadlines: ("dyson" | "jestina" | "daekyo" | "samsonite")[];
  /**
   * 대표 연락처. hll 은 사내 이동 지원이라 사내 메일 자체가 재직 확인 수단이지만,
   * 외부 공개판에서 현 직장 메일을 대표로 걸면 (1) 이직 활동이 사내 주소로 읽히고
   * (2) 퇴사하는 순간 이력서에 적힌 연락처가 죽는다. 일반판은 개인 메일을 대표로 쓴다.
   */
  primaryEmail: "work" | "personal";
  /**
   * 홈 대표 사례 순서.
   * hll 은 콘텐츠 조직에 내는 서류라 콘텐츠 자산화(다이슨)를 1번에 둔다.
   * general 은 읽는 쪽이 업종을 모르는 채용 시장이라, 기여도와 검증 가능성이 가장 높은
   * 제이에스티나(전략·측정 75%)를 1번에 두고 다이슨을 뒤로 보낸다 — 기여 40%·팀 성과인
   * 사례가 첫 화면을 차지하면 이 사이트가 스스로 내건 기여도 투명성과 부딪힌다.
   */
  spreadOrder: string[];
}

const COPY: Record<Exclude<Edition, "v260908" | "nw">, EditionCopy> = {
  hll: {
    issueLabel: "ISSUE 01",
    /*
     * ── 축을 '브랜드 솔루션'에서 '콘텐츠 그로스'로 옮긴다 (2026.08.17)
     * 조직도상 스튜디오 룰루랄라사업국 안에 솔루션팀과 IP사업팀이 따로 있다.
     * PPL·브랜디드 콘텐츠 세일즈, 광고주 제안·PT·수주는 IP사업팀 쪽이고,
     * 솔루션팀은 워크맨·워크돌·와썹맨 채널의 전략·운영·확산·데이터 분석에 가깝다.
     * 이전 마스트헤드(BRAND SOLUTION MARKETER)는 세일즈 조직을 겨냥한 이름이라
     * 실제 지원 직무와 어긋났다.
     *
     * 다만 퍼포먼스를 빼지는 않는다 — 공개 직무 기술에 '유튜브 광고 집행 및 효율
     * 관리'가 들어 있고, 유료 매체를 직접 돌려 본 이력이 이 팀에서 오히려 희소한
     * 차별점이다. 두 축을 함께 건다.
     */
    mastheadLeft: "KIM SEONILL — PERFORMANCE TO CONTENT GROWTH",
    mastheadBase: "IDEA · CONTENT · DATA · SYSTEM",
    mastheadRight: "ISSUE 01 · 2026.08 · STUDIO LULULALA 솔루션팀 지원",
    role: "퍼포먼스 기반 콘텐츠 그로스",
    /*
     * 뒤에 "다이슨 40%, 제이에스티나 75%를 맡았습니다"가 붙어 있었다. 바로 위 두 대형
     * 수치의 subnote 가 이미 같은 말을 하고 있어서, 첫 화면에서 같은 사실을 두 번 읽었다.
     * 한 문장만 남긴다. 기여 범위는 숫자 옆에서 이미 말하고 있다.
     *
     * '고객 행동'이 아니라 '시청자'다 — 이 팀이 움직이는 퍼널은
     * 노출 → 클릭 → 시청 유지 → 구독 → 재방문이지 구매 전환이 아니다.
     */
    deck:
      "유튜브·SNS 콘텐츠의 기획과 확산, 성과 분석을 데이터와 자동화로 연결합니다.",
    heroRoleLine: "콘텐츠를 빠르게 만들고, 반응을 데이터로 검증해 채널 성장으로 연결합니다.",
    primaryCtaLabel: "지원 이유와 90일 계획 보기 →",
    /* "3건" 은 h2 가, 세 갈래는 SELECTED IMPACT 가 이미 말한다 — 여기서는 읽는 방법만 */
    projectScanGuide: "케이스마다 기여 범위와 집계 기준을 수치 옆에 함께 적었습니다.",
    seoTitle: "김선일 | 퍼포먼스 기반 콘텐츠 그로스 포트폴리오",
    /* 링크 미리보기 한 줄에서 "무엇을 하는 사람인가"가 바로 읽혀야 한다 — 이력 나열이 아니라 포지셔닝 */
    seoDescription:
      "유튜브·SNS 콘텐츠의 기획·확산·성과 분석을 퍼포먼스 데이터와 자동화로 연결해 온 김선일의 스튜디오 룰루랄라 솔루션팀 지원 포트폴리오입니다.",
    ogAlt: "김선일 퍼포먼스 기반 콘텐츠 그로스 포트폴리오",
    caseDescription:
      "채널 전략, 콘텐츠 이후 행동 설계, 성과 측정과 운영 시스템 경험을 담은 콘텐츠 그로스 사례입니다.",
    portfolioPdfPath: "/kim-seonil-performance-marketing-portfolio.pdf",
    url: "https://vetnam555-del.github.io/kim-seonil-portfolio_HLL/",
    showWhyStudio: true,
    showWhyShinsegae: false,
    showWhyAbly: false,
    heroHeadlines: ["dyson", "jestina"],
    primaryEmail: "work",
    /*
     * EDIT H 를 2번으로 올린다.
     * 콘텐츠 조직에 내는 서류에서 "직접 콘텐츠를 기획·편집·발행한다"를 증명하는 사례는
     * 이것 하나뿐인데, 그동안 '그 외 기록' 목록에 묻혀 있었다. 나머지 8개 케이스는 전부
     * 남이 만든 콘텐츠에 매체를 붙인 일이라, 이 순서가 지원 직무와 실제로 맞는 배열이다.
     * 일반판은 광고주 성과가 먼저라 이 승격을 적용하지 않는다.
     */
    spreadOrder: ["dyson", "edith", "newbalance"],
  },
  general: {
    issueLabel: "PORTFOLIO",
    /* 한국어 직함 "퍼포먼스 마케터"의 영문. OG 이미지(render_og_cases.mjs)와 같은 값 */
    mastheadLeft: "KIM SEONILL — PERFORMANCE MARKETER",
    mastheadBase: "PERFORMANCE · DATA · AUTOMATION",
    mastheadRight: "PORTFOLIO · 2026.09 · PROBLEM · PROOF · SYSTEM",
    /*
     * 직함을 하나로 좁혔다 (2026.09.25). "퍼포먼스 마케팅 · 마케팅 오퍼레이션" 두 직무를 나란히 두니
     * 마케터인지 운영·자동화 담당인지 첫 줄에서 갈렸고, 국내 공고 대부분이 쓰는 "퍼포먼스 마케터"와도
     * 어긋났다. 자동화는 직함이 아니라 이 퍼포먼스 마케터의 차별점으로 본문이 말한다.
     * 포트폴리오·이력서 PDF 표기도 같은 날 같이 바꿨다.
     */
    role: "퍼포먼스 마케터",
    /*
     * 일반판 데크에는 지원 대상이 없다. 그래서 "무엇을 해 왔는가"가 아니라
     * "무엇을 책임질 수 있는가"로 닫는다 — 규모·검증·재사용 세 축을 한 문단에 둔다.
     */
    /* hll 판과 같은 이유로 마지막 기여 범위 문장을 뺀다 — 두 subnote 가 이미 말하고 있다 */
    deck:
      "사람의 행동을 관찰하고, 성과를 숫자로 확인한 뒤 판단 기준을 팀이 다시 쓸 수 있는 운영 구조로 만듭니다.",
    heroRoleLine: "매체별 예산과 성과 측정을 맡고, 반복 업무는 자동화합니다.",
    primaryCtaLabel: "대표 사례 보기 →",
    /*
     * 다섯 건을 한 줄에 나열하면 읽는 쪽이 어디부터 볼지 스스로 정해야 한다.
     * 주력 두 건을 먼저 말하고 나머지를 그 뒤에 둔다 — 사례를 줄이지 않고 순서만 준다.
     * 두 건은 기여도가 가장 높고(전략·측정 75% / 자동화 설계·구축 100%)
     * 증명하는 축이 서로 다르다.
     */
    projectScanGuide:
      "제이에스티나에서는 고객 단계별 예산 배분을, 뉴발란스에서는 재고 연동 자동화를 다룹니다. 이어지는 세 사례는 측정 기준 점검, 구매 경로 분석, 유튜브 채널 성장 경험입니다.",
    seoTitle: "김선일 | 퍼포먼스 마케터 포트폴리오",
    seoDescription:
      "FIND. TEST. IMPROVE. 문제를 구조화해 가설을 세우고, 테스트로 개선합니다. 30여 개 브랜드를 운영한 4년 차 퍼포먼스 마케터 김선일의 포트폴리오입니다.",
    ogAlt: "김선일 퍼포먼스 마케터 포트폴리오",
    caseDescription:
      "문제 정의부터 측정 기준, 운영 시스템까지의 판단 과정을 근거와 함께 담은 퍼포먼스 마케팅 사례입니다.",
    portfolioPdfPath: "/kim-seonil-performance-marketing-portfolio.pdf?v=20260926f",
    url: "https://vetnam555-del.github.io/kim-seonil-portfolio/",
    showWhyStudio: false,
    showWhyShinsegae: false,
    showWhyAbly: false,
    /*
     * 다이슨(구독자 2,000→107,600)은 시각적으로 가장 센 수치지만 채널 전체·팀 성과이고
     * 개인 기여는 40%다. 지원 직무가 콘텐츠 조직이 아닌 판에서 이걸 첫 대형 수치로 걸면,
     * 읽는 쪽의 첫 질문이 성과가 아니라 "이 중 얼마가 본인 몫인가"가 된다.
     * 그래서 전략(75%)과 단독 책임(100%)을 앞세우고 다이슨은 CH.04 맥락 수치로 둔다.
     */
    heroHeadlines: ["jestina", "daekyo"],
    primaryEmail: "personal",
    /*
     * 강원심층수를 대표 사례에 넣는다 (2026.09.03).
     * 이 판은 대부분 퍼포먼스 직무에 내는데, 기존 네 건의 기여 표기가 전부 부분이었다 —
     * 제이에스티나는 "일 단위 집행은 팀 분담", 뉴발란스는 "계정 운영 40%",
     * 대교는 측정 QA 만, 다이슨은 40% 공동. "계정을 혼자 굴려 봤나" 라는 첫 질문에
     * 대표 사례 어디에서도 답이 안 나왔다. 강원심층수는 단독 계정 운영 100% 이고
     * 기여 문장에 "예산·입찰 조정" 이 들어 있는데 '그 외 기록'에 한 줄로 묻혀 있었다.
     * 다이슨은 빼지 않는다 — 콘텐츠 자산화는 다른 축을 증명한다.
     */
    spreadOrder: ["jestina", "newbalance", "daekyo", "gangwon", "dyson"],
  },
  shinsegae: {
    issueLabel: "CRM EDITION",
    mastheadLeft: "KIM SEONILL — DIGITAL CRM & COMMERCE GROWTH",
    mastheadBase: "CUSTOMER DATA · SEGMENTATION · AUTOMATION",
    mastheadRight: "SHINSEGAE · DIGITAL CRM MARKETER · 2026.08",
    role: "디지털 CRM · 커머스 그로스",
    deck:
      "고객 행동을 세분화하고, 각 단계에 맞는 메시지와 채널을 설계하며, 반복 가능한 운영 체계로 남깁니다.",
    heroRoleLine:
      "퍼포먼스와 커머스 운영에서 쌓은 고객 데이터·세그먼트·자동화 경험을 CRM 성장 구조로 연결합니다.",
    primaryCtaLabel: "직무 적합성과 90일 계획 보기 →",
    projectScanGuide:
      "각 사례를 고객 정의 / 실행 방식 / 성과 / 기여 범위 순으로 확인할 수 있습니다.",
    seoTitle: "김선일 | 신세계 디지털 CRM 마케터 포트폴리오",
    seoDescription:
      "고객 세분화, 세그먼트 기반 캠페인, CRM 채널 운영, 데이터 분석과 운영 자동화 경험을 신세계 디지털 CRM 직무에 맞춰 정리한 김선일의 포트폴리오입니다.",
    ogAlt: "김선일 신세계 디지털 CRM 마케터 지원 포트폴리오",
    caseDescription:
      "고객 데이터와 행동을 기준으로 세그먼트·메시지·채널·KPI를 연결한 CRM·커머스 사례입니다.",
    portfolioPdfPath: "/kim-seonil-performance-marketing-portfolio.pdf",
    url: "https://vetnam555-del.github.io/kim-seonil-portfolio_shinsegae/",
    showWhyStudio: false,
    showWhyShinsegae: true,
    showWhyAbly: false,
    heroHeadlines: ["samsonite", "jestina"],
    primaryEmail: "personal",
    spreadOrder: ["samsonite", "jestina", "newbalance", "gangwon"],
  },
  /*
   * 에이블리 그로스 마케터(신사업).
   * 공고가 요구하는 순서 그대로 판을 짠다 — 방식을 정의하고, 실험으로 검증하고,
   * 제품·운영 전반에 넣는다. 그래서 대형 수치도 "성과가 컸던 사례"가 아니라
   * "무엇을 성과로 볼지 다시 정한 사례" 둘을 건다.
   *
   * 다이슨을 첫 화면에서 뺀 이유는 general 판과 같다 — 기여 40%·팀 성과라
   * 초기 조직에서 혼자 굴릴 수 있는가라는 이 공고의 질문에 답하지 못한다.
   * 대신 사례 순서 3번에 두어 "실험 설계" 근거로 쓴다.
   */
  ably: {
    issueLabel: "NEW BUSINESS",
    mastheadLeft: "KIM SEONILL — GROWTH FOR NEW BUSINESS",
    mastheadBase: "DEFINE · EXPERIMENT · AUTOMATE",
    mastheadRight: "ABLY · 그로스 마케터(신사업) · 2026.08",
    role: "신사업 그로스 · 실험 설계",
    deck:
      "무엇을 성과로 볼지 먼저 정하고, 작게 실험해 확인한 뒤, 통한 방식을 팀이 다시 쓸 수 있는 구조로 남깁니다.",
    heroRoleLine:
      "정해진 방식이 없는 자리에서 채널·소재·측정을 직접 정의하고 실험으로 좁혀 왔습니다.",
    primaryCtaLabel: "직무 적합성과 90일 계획 보기 →",
    projectScanGuide:
      "각 사례를 무엇을 다시 정의했는지 / 어떻게 검증했는지 / 무엇으로 남겼는지 순으로 볼 수 있습니다.",
    seoTitle: "김선일 | 에이블리 그로스 마케터(신사업) 지원 포트폴리오",
    seoDescription:
      "무엇을 성과로 볼지 정의하고 실험으로 검증한 뒤 자동화와 문서로 남겨 온 김선일의 신사업 그로스 포트폴리오입니다.",
    ogAlt: "김선일 에이블리 그로스 마케터(신사업) 지원 포트폴리오",
    caseDescription:
      "판단 기준을 다시 정의하고, 실험으로 검증하고, 운영 구조로 남긴 과정을 근거와 함께 담은 그로스 사례입니다.",
    portfolioPdfPath: "/kim-seonil-ably-growth-portfolio.pdf",
    url: "https://vetnam555-del.github.io/kim-seonil-portfolio_ABLY/",
    showWhyStudio: false,
    showWhyShinsegae: false,
    /*
     * 공고 매칭 지면을 끈다 (2026.08.30).
     *
     * ROLE REQUIREMENT ↔ WORK EVIDENCE 표는 공고 문장을 왼쪽에 그대로 옮겨 놓았다.
     * "(우대)" 라벨까지 따라와서, 읽는 사람이 자기가 쓴 문장을 되돌려 받는 지면이 됐다.
     * 포트폴리오의 통화는 근거인데, 근거를 공고 문장 옆에 놓으면 근거가 주석이 된다.
     * 문서의 주어가 지원자가 아니라 공고가 되는 것이다.
     *
     * EXPERIENCE BOUNDARY 는 더 나빴다. 일반적인 한계 고백이 아니라 **공고가 요구한
     * 항목을 골라** 없다고 적은 목록이라, 서류 단계에서 상대의 체크리스트를 미리
     * 실패하는 글이 됐다. 한계를 밝히는 규율 자체는 유지한다 — 사이트에는 이미
     * "아직 못 한 것" 지면이 있고, 그쪽은 공고와 무관하게 스스로 그은 선이라 다르다.
     *
     * 그래서 이 판은 표지 문구·대표 수치·사례 순서만 이 자리에 맞춘 가벼운 판으로 둔다.
     * 매칭은 읽는 사람이 한다. 데이터(ablyRoleFit 등)는 판단 근거와 함께 site.ts 에
     * 남겨 둔다 — 되살릴 일이 생기면 왜 껐는지부터 읽어야 한다.
     */
    showWhyAbly: false,
    heroHeadlines: ["daekyo", "jestina"],
    primaryEmail: "personal",
    /*
     * 다이슨을 빼고 자동화를 넣는다.
     * 이 공고는 "정형화되지 않은 초기 조직에서 혼자 굴릴 수 있는가"를 묻는다.
     * 다이슨은 기여 40%·팀 성과라 그 질문에 답하지 못하고, 자동화 6종은 기획·구축·
     * 운영 100% 단독이라 정확히 답한다. 우대사항 첫 줄(AI·업무 자동화)이기도 하다.
     * 다이슨은 실험 설계 근거로 ablyRoleFit 에서 케이스 페이지로 계속 연결된다.
     */
    spreadOrder: ["daekyo", "jestina", "automation", "gangwon"],
  },
};

/*
 * 개선판은 일반판의 사본이다 — 카피를 한 벌 더 두면 두 곳이 곧 갈라진다.
 * 주소만 덮어쓴다(canonical·OG 가 이 값을 쓴다).
 *
 * COPY 안에 다섯 번째 항목으로 넣지 않는다. 판 이름은 빌드 시 상수로 접히고
 * 번들러가 쓰지 않는 판의 문자열을 지우는데, 표에 스프레드를 끼우면 그 제거가 풀린다.
 * 실제로 그렇게 넣었다가 사외 지원판 산출물에 사내 메일(kim.seonill@hll.kr)과
 * HLL 판 주소가 그대로 실렸고, validate_export 의 유출 검사가 그걸 잡았다.
 */
/*
 * COPY 를 한 번만 참조한다.
 *
 * `EDITION === "v260908" ? {...COPY.general} : COPY[EDITION]` 로 썼더니 참조가 둘이 되면서
 * 번들러가 이 표를 단일 사용처에 접어 넣지 못했고, 쓰지 않는 판의 문자열이 통째로 살아남아
 * 공용판 산출물에 사내 메일과 HLL 판 주소가 실렸다(validate_export 유출 검사가 잡음).
 * 키를 먼저 고르고 표는 한 번만 읽으면 다시 접힌다.
 */
const picked = COPY[EDITION === "v260908" || EDITION === "nw" ? "general" : EDITION];

export const edition: EditionCopy =
  EDITION === "v260908"
    ? { ...picked, url: "https://vetnam555-del.github.io/kim-seonil-portfolio_260908/" }
    : EDITION === "nw"
      ? { ...picked, url: "https://vetnam555-del.github.io/kim-seonil-portfolio_new/" }
      : picked;
