import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, extname, join, relative, resolve } from "node:path";

const requestedEdition = process.argv[2];
const edition = ["general", "hll", "shinsegae", "ably", "v260908", "nw"].includes(requestedEdition)
  ? requestedEdition
  : "hll";
const root = resolve(process.env.QA_EXPORT_ROOT || "out");
/* 판이 넷이라 삼항 사슬 대신 표로 둔다 — next.config.ts 와 같은 값이어야 한다 */
const BASE_PATHS = {
  general: "/kim-seonil-portfolio",
  hll: "/kim-seonil-portfolio_HLL",
  shinsegae: "/kim-seonil-portfolio_shinsegae",
  ably: "/kim-seonil-portfolio_ABLY",
  v260908: "/kim-seonil-portfolio_260908",
  nw: "/kim-seonil-portfolio_new",
};
const basePath = BASE_PATHS[edition];
const htmlFiles = [];
const failures = [];
let referenceCount = 0;
let anchorCount = 0;

function walk(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.endsWith(".html")) htmlFiles.push(full);
  }
}

function cleanReference(value) {
  return value.replaceAll("&amp;", "&").trim();
}

function isExternal(value) {
  return /^(?:https?:)?\/\//.test(value) || /^(?:mailto|tel|data|blob|javascript):/.test(value);
}

function targetForPath(pathname, sourceFile) {
  if (!pathname) return sourceFile;
  let target;
  if (pathname.startsWith(basePath)) {
    const relativePath = decodeURIComponent(pathname.slice(basePath.length)).replace(/^\/+/, "");
    target = join(root, relativePath);
  } else if (pathname.startsWith("/")) {
    failures.push(`basePath 밖의 절대 경로: ${pathname} (${relative(root, sourceFile)})`);
    return null;
  } else {
    target = resolve(dirname(sourceFile), decodeURIComponent(pathname));
  }

  if (pathname.endsWith("/") || !extname(target)) return join(target, "index.html");
  return target;
}

function anchorsOf(htmlFile) {
  const html = readFileSync(htmlFile, "utf8");
  return new Set([...html.matchAll(/\sid=["']([^"']+)["']/g)].map((match) => match[1]));
}

function validateReference(rawValue, sourceFile) {
  const value = cleanReference(rawValue);
  if (!value || isExternal(value)) return;
  referenceCount += 1;

  if (value.includes(basePath + basePath)) {
    failures.push(`basePath 중복: ${value} (${relative(root, sourceFile)})`);
    return;
  }

  const hashIndex = value.indexOf("#");
  const hash = hashIndex >= 0 ? value.slice(hashIndex + 1) : "";
  const withoutHash = hashIndex >= 0 ? value.slice(0, hashIndex) : value;
  const pathname = withoutHash.split("?")[0];
  const target = targetForPath(pathname, sourceFile);
  if (!target) return;

  if (!existsSync(target)) {
    failures.push(`대상 파일 없음: ${value} (${relative(root, sourceFile)})`);
    return;
  }

  if (hash && target.endsWith(".html")) {
    anchorCount += 1;
    if (!anchorsOf(target).has(decodeURIComponent(hash))) {
      failures.push(`앵커 없음: ${value} (${relative(root, sourceFile)})`);
    }
  }
}

walk(root);
if (!htmlFiles.length) failures.push("out/에 HTML 파일이 없습니다.");

for (const htmlFile of htmlFiles) {
  const html = readFileSync(htmlFile, "utf8");
  for (const match of html.matchAll(/(?:href|src)=["']([^"']+)["']/g)) {
    validateReference(match[1], htmlFile);
  }
  for (const match of html.matchAll(/srcset=["']([^"']+)["']/g)) {
    for (const candidate of match[1].split(",")) {
      validateReference(candidate.trim().split(/\s+/)[0], htmlFile);
    }
  }
}

const allHtml = htmlFiles.map((htmlFile) => readFileSync(htmlFile, "utf8")).join("\n");

/*
 * 판마다 내려주는 덱이 다르다. 에이블리판은 전용 덱(34쪽)을, 나머지는 공용 덱(33쪽)을
 * 쓴다. 여기서 판별로 갈라 두지 않으면 전용 덱이 빠진 채 나가도 검사를 통과한다.
 */
const deckPdf =
  edition === "ably"
    ? "kim-seonil-ably-growth-portfolio.pdf"
    : "kim-seonil-performance-marketing-portfolio.pdf";

const requiredAssets = [
  "og-image.png",
  "kim-seonil-resume-public.pdf",
  deckPdf,
  "favicon.svg",
  "favicon-32.png",
  "apple-touch-icon.png",
  "fonts/Archivo-Var.woff2",
  "fonts/JetBrainsMono-Var.woff2",
  "fonts/Pretendard-Regular.woff2",
  "fonts/Pretendard-SemiBold.woff2",
  "fonts/Pretendard-Bold.woff2",
  "fonts/Pretendard-Black.woff2",
  ...[
    "automation",
    "daekyo",
    "dyson",
    "edith",
    "gangwon",
    "hanssem",
    "jestina",
    "ktalpha",
    "newbalance",
    ...(edition === "shinsegae" ? ["samsonite"] : []),
  ].map((slug) => `og/${slug}.png`),
];

for (const pdfName of ["kim-seonil-resume-public.pdf", deckPdf]) {
  const pdfPath = join(root, pdfName);
  if (existsSync(pdfPath)) {
    const bytes = readFileSync(pdfPath);
    if (bytes.length < 40 * 1024 || bytes.subarray(0, 4).toString("ascii") !== "%PDF") {
      failures.push(`PDF 파일 손상 또는 크기 이상: ${pdfName}`);
    }
  }
}
for (const asset of requiredAssets) {
  if (!existsSync(join(root, asset))) failures.push(`필수 자산 없음: ${asset}`);
}

const homeOnly = existsSync(join(root, "index.html")) ? readFileSync(join(root, "index.html"), "utf8") : "";
/*
 * 공용판은 2026.09.24 부터 홈이 입구이고, 옛 홈의 깊은 층(일하는 방식 · 자동화 전체 · 광고주 ·
 * 이야기 · 창업 기록 · 다음 역할 · 경력과 수상)은 /about/ 에 있다. 지운 것이 아니므로 두 페이지를
 * 한 묶음으로 보고 문구 검사를 한다. 사례 읽기 순서와 증빙 링크 수는 홈만 본다.
 */
const aboutPath = join(root, "about", "index.html");
const home = edition === "general" && existsSync(aboutPath) ? `${homeOnly}\n${readFileSync(aboutPath, "utf8")}` : homeOnly;
if (edition === "general") {
  if (home.includes("경영학 학점은행제 과정 이수")) {
    failures.push("숭실대학교 학력 표기에 삭제 요청한 문구가 남아 있습니다.");
  }
  if (!home.includes("경영학전공 · 학사")) {
    failures.push("별도 학점은행제 학위 정보가 누락되었습니다.");
  }
  for (const work of ["금융 인플루언서 협업 콘텐츠 기획", "지원사업 신청 프로세스 관리"]) {
    if (!home.includes(work)) failures.push(`인턴 담당 업무 누락: ${work}`);
  }
  if (home.includes("플레이디에서 캠페인 검증으로 넓혔습니다")) {
    failures.push("인턴 경력 아래에 전체 경력 요약 문구가 다시 노출되었습니다.");
  }
}
/* 새 홈을 쓰는 판은 개편판뿐이다. 공용판은 옛 홈을 그대로 쓴다. */
const NEW_HOME = edition === "nw";
const editionRules =
  /* v260908 은 일반판의 사본이므로 같은 규칙으로 검사한다 (edition.ts 참고) */
  edition === "general" || edition === "v260908"
    ? {
      /*
       * 공용판 표지는 2026.09.24 에 "한 문장 정의 → 지나온 길 → 역량별 대표 사례"로 바뀌었다
       * (GeneralCover · site.ts generalCover). v260908 은 PersonFirstCover 라 옛 문구를 그대로 검사한다.
       */
      required: [
        ...(edition === "general"
          ? [
              /* 2026.09.25 경력직 개편 — 직함 하나 · 결과형 첫 문장 · 결과 세 칸 · 경력 두 줄 */
              "퍼포먼스 마케터",
              "문제를 구조화해 가설을 세우고, 테스트로 개선합니다.",
              "FIND. TEST.",
              "folio-proof",
              "folio-career",
              "숫자마다 기간과 제 몫을 함께 적었습니다.",
              /* 두 역량은 2026.09.25 부터 대표 사례 머리의 색인이다 */
              "loop-panel",
              "도구와 역량 전체 보기",
              "직접 기획·구축한 업무 자동화 6종",
              "일하는 방식과 경력",
              "대표 사례 보기",
              "folio-grid-lg",
            ]
          : [
              "KIM SEONILL · ABOUT",
              "매체별 예산과 성과 측정을 맡고, 반복 업무는 자동화합니다.",
              "대표 사례 보기 →",
              "주력 두 건은 제이에스티나(고객 단계별 예산 배분)와 뉴발란스(재고 연동 자동화)입니다.",
            ]),
        "다음 역할",
        "100년태극기",
        "기획 판단과 근거",
      ],
      forbidden: ["PERFORMANCE TO CONTENT GROWTH", "WHY STUDIO LULULALA", "지원 이유와 90일 계획"],
      }
    : NEW_HOME
      ? {
          /*
           * 개편판은 홈이 '입구' 라 일반판의 필수 문구 대부분이 케이스 상세로 내려갔다.
           * 그래도 이 여섯은 홈에 있어야 한다 — 특히 "기여 범위" 는 이 사이트가
           * 스스로 내건 규율이라, 홈을 다시 짜다 이게 빠지면 성과만 큰 화면이 된다.
           */
          /*
           * "주력 두 건은 …입니다." 문장은 공용판 안내문이 바뀌면서(2026.09.13) 사라졌다.
           * 개편판은 그 문장 대신 카드 자체에 「주력 사례」 표시와 문제 → 판단과 행동 →
           * 확인한 결과 순서를 둔다 — 문장이 아니라 구조가 읽는 순서를 말하게 한다.
           */
          required: [
            "KIM SEONILL · ABOUT",
            "맡은 범위와 근거를 수치 옆에 함께 적었습니다",
            "기여 범위",
            "주력 사례",
            "판단과 행동",
            "확인한 결과",
            "제가 문제를 해결하는 세 가지 방식",
            "사람이 기억해서 확인하던 업무를 시스템으로 옮겼습니다",
            "재고 자동화의 실행 순서",
          ],
          forbidden: ["PERFORMANCE TO CONTENT GROWTH", "WHY STUDIO LULULALA", "지원 이유와 90일 계획"],
        }
    : edition === "ably"
      ? {
          /*
           * 에이블리 판이 반드시 지켜야 하는 문장.
           * 특히 EXPERIENCE BOUNDARY 는 이 판의 성립 근거다 — 어필리에이트·LTV·BM
           * 경험이 없다고 먼저 적어 두었기 때문에 나머지 주장이 읽힌다. 카피를 손보다
           * 이 문단이 빠지면 공고 요건을 다 갖춘 척하는 서류가 된다.
           */
          required: [
            "KIM SEONILL — GROWTH FOR NEW BUSINESS",
            "각 사례를 무엇을 다시 정의했는지 / 어떻게 검증했는지 / 무엇으로 남겼는지 순으로 볼 수 있습니다.",
            "PROFILE · 지원자 소개",
            "상황에 맞는 방식 정의",
            "실험으로 결론 검증",
            "AI · 업무 자동화",
          ],
          /*
           * 공고를 그대로 옮긴 문장이 다시 들어오면 막는다. 이 판에서 걷어낸 이유는
           * edition.ts 의 showWhyAbly 주석에 있다 — 문서의 주어가 공고가 되어 버린다.
           */
          forbidden: [
            "PERFORMANCE TO CONTENT GROWTH",
            "WHY STUDIO LULULALA",
            "JOB FIT · SHINSEGAE DIGITAL CRM",
            "JOB FIT · ABLY",
            "공고 요건",
            "공고 문장과 그 근거",
            "(우대)",
            "어디까지 해 봤고 어디부터 아닌지",
          ],
        }
    : edition === "shinsegae"
      ? {
          required: [
            "KIM SEONILL — DIGITAL CRM &amp; COMMERCE GROWTH",
            "JOB FIT · SHINSEGAE DIGITAL CRM",
            "직무 적합성과 90일 계획 보기 →",
            "경험의 경계도 먼저 밝힙니다.",
            "각 사례를 고객 정의 / 실행 방식 / 성과 / 기여 범위 순으로 확인할 수 있습니다.",
            "PROFILE · 지원자 소개",
            "주요 업무 6개 · 관련 근거 5개",
            "CRM 채널 운영",
            "운영 자동화 기반",
            "쌤소나이트",
          ],
          forbidden: [
            "PERFORMANCE TO CONTENT GROWTH",
            "WHY STUDIO LULULALA",
            "다음 역할",
          ],
        }
      : {
      required: [
        "PERFORMANCE TO CONTENT GROWTH",
        "WHY STUDIO LULULALA",
        "콘텐츠를 빠르게 만들고, 반응을 데이터로 검증해 채널 성장으로 연결합니다.",
        "지원 이유와 90일 계획 보기 →",
        "케이스마다 기여 범위와 집계 기준을 수치 옆에 함께 적었습니다.",
        "보조 사례 · 판단 방식과 채널 설계",
      ],
      forbidden: ["KIM SEONILL · ABOUT", "오가닉 조회"],
      };

/*
 * 판과 무관하게 다시 들어오면 안 되는 표현 (2026.08.23).
 * 전부 "사이트의 다른 곳에 적힌 근거와 어긋나서" 걷어낸 문장이라,
 * 카피를 손보다 실수로 되살리면 사실관계가 다시 깨진다.
 *   신규 클릭            → 어느 콘솔에도 없는 지표명 (케이스는 '제품 클릭'으로 정의)
 *   YouTube 채널 지표    → 근거는 매체 리포트 지표다. Studio 애널리틱스를 주장하게 된다
 *   A/B 테스트 설계      → 실제 기록은 10일 단위 3개 조합 순환 테스트
 *   판매 채널 … 재편     → 케이스 notDone·scope 세 곳과 정면으로 충돌
 */
/*
 * 판과 무관하게 반드시 있어야 하는 문장.
 * forbidden 만 두면 "옛 문구가 사라졌다"는 알 수 있어도 "새 문구가 제대로 들어갔다"는
 * 알 수 없다 — 실제로 교체 중 오타(캠페인 → 캐페인)가 세 판 빌드를 전부 통과했다.
 */
const globallyRequired = [
  "YouTube 캠페인 성과 지표 정의 (노출 · 제품 클릭 · 10초 이상 시청)",
  "썸네일·재생목록·커뮤니티 10일 단위 순환 테스트 설계",
];

const globallyForbidden = [
  "신규 클릭",
  "YouTube 채널 지표 정의",
  "썸네일·재생목록·커뮤니티 A/B 테스트 설계",
  "판매 채널을 네이버 스마트스토어 중심으로 재편",
  "직접 만든 자동화",
  "직접 만든 콘텐츠와 검증 가능한 성장",
  "검증된 운영 방식을 다음 캠페인에서도",
  "언제 멈출지’부터 설계했습니다",
  "고객 행동을 숫자로 검증하고 팀이 다시 쓰는 운영 구조로 남겨",
  /*
   * 아래 3건은 신세계판에서 걷어낸 표현이다 (2026.08.24).
   * 전부 같은 페이지의 EXPERIENCE BOUNDARY("Braze·SFMC 같은 CRM 솔루션이나 CDP 구축 …
   * 경험은 없습니다")와 부딪혔다. 공고 인용문(shinsegaeRoleFit.requirement)은 그대로 두고,
   * 본인 목소리로 말하는 자리에서만 낮췄다 — 인용을 고치면 공고를 왜곡하게 된다.
   *   CRM 운영 자동화   → 뉴발란스는 광고 운영 자동화다
   *   CRM 채널 성장     → 5,482명은 시작값 없는 누적값이라 성장량이 아니다
   *   데이터 기반 개인화 → 근거는 세그먼트 단위 차별 운영이다
   */
  /*
   * 성과 절대값은 싣지 않는다 (2026.08.25).
   * 매출·광고비·전환 건수는 % 로만 적고, 집행 규모는 "월 10억+" 처럼 범위로 흐린다.
   * 예외는 다이슨 유튜브 구독전환 캠페인(104,257건 · 약 1,132원 · 구독자 2,000→107,600)과
   * 쌤소나이트 카카오톡채널 친구 5,482명 — 둘 다 % 로 바꿀 시작값이 없어 수치 자체가 사라진다.
   */
  "11.9억",
  "85.3억",
  "5,756만원",
  "4,806건",
  "15,480건",
  "9,400건",
  "18.3만 건",
  "68,869원",
  "1억 3,697만원",
  "월 최대 15억",
  /*
   * "월 최대 15억"만 막았더니 각주에 남아 있던 "월 15억"을 놓쳤다.
   * 접두사가 다른 같은 수치를 따로 등록한다.
   */
  "월 15억",
  "연간 약 10억",
  "CRM 운영 자동화",
  "CRM 채널 성장",
  "데이터 기반 개인화와 자동화 경험",
  "직접 연결 근거",
  "KIM SEONILL · DIGITAL CRM & COMMERCE GROWTH",
];

for (const term of editionRules.required) {
  if (!home.includes(term)) failures.push(`필수 ${edition} 문구 없음: ${term}`);
}
/*
 * 오타 감시용 문자열이다. 개편판은 홈이 입구라 이 문장들이 케이스 상세·이력서로
 * 내려갔다 — 사라진 게 아니므로 산출물 전체에서 찾는다. 문구가 실제로 깨지면 여전히 걸린다.
 */
const globalHaystack = NEW_HOME || edition === "general" ? allHtml : home;
for (const term of globallyRequired) {
  if (!globalHaystack.includes(term)) failures.push(`공통 필수 문구 없음(오타 가능): ${term}`);
}
for (const term of globallyForbidden) {
  if (home.includes(term)) failures.push(`근거와 어긋나 폐기된 표현 재등장: ${term}`);
}
for (const term of editionRules.forbidden) {
  if (home.includes(term)) failures.push(`다른 판 또는 금지 문구 혼입: ${term}`);
}

/*
 * 메인 사례 증빙은 판마다 노출 편수가 다르지만, 보이는 증빙에는 모두 같은 원본 링크가 있어야 한다.
 * 대교만 별도 레이아웃을 쓰면서 링크가 빠졌던 회귀를 이 개수 검사가 막는다.
 */
/*
 * 홈 증빙 도판을 가진 대표 사례의 수다. **사례 수와 다르다** —
 * HOME_EVIDENCE 에 항목이 있는 슬러그만 도판이 붙는다(dyson·edith·jestina·daekyo·
 * newbalance·gangwon). samsonite 와 automation 은 없어서 그 사례는 세지 않는다.
 *
 * 한 번 "사례 수와 같다" 고 보고 spreadOrder 길이로 바꿨다가 신세계·에이블리에서
 * 3건인데 4를 기대해 검증이 막혔다. 사례를 늘리면 이 표도 같이 고친다.
 */
const expectedEvidenceLinks = {
  general: 5,   // jestina · newbalance · daekyo · gangwon · dyson
  hll: 3,       // dyson · edith · newbalance
  shinsegae: 3, // jestina · newbalance · gangwon (samsonite 는 도판 없음)
  ably: 3,      // daekyo · jestina · gangwon (automation 은 도판 없음)
  /*
   * 개선판은 일반판과 같은 5편이다. 홈에서 증빙을 details 로 접었지만 마크업은 그대로
   * 나가므로 링크 수는 변하지 않는다 — 접기가 증빙을 없애지 않는다는 확인도 된다.
   */
  v260908: 5,
  /*
   * 개편판도 다섯 사례 전부에 도판을 싣는다. 한때 주력 둘만 두었다가 홈의 증빙 링크가
   * 5개에서 2개로 줄었는데, "수치 옆에 원본이 있다" 는 것이 이 사이트가 앞서는 지점이라
   * 정리하다 그걸 덜어낸 셈이었다. 보조 셋은 작게 얹는다.
   */
  nw: 5,
};
const evidenceLinkLabel = "원본 크기로 열기 ↗";
/* Next 정적 HTML의 RSC 직렬화 script 에 같은 문구가 한 번 더 들어가므로 화면 노드만 센다. */
const visibleHome = homeOnly.replace(/<script[\s\S]*?<\/script>/g, " ");
if (edition === "general") {
  const readingOrder = ["jestina", "newbalance", "daekyo", "gangwon", "dyson"];
  const renderedOrder = [...visibleHome.matchAll(/<article\b[^>]*\bid="case-([^"]+)"/g)].map((match) => match[1]);
  if (JSON.stringify(renderedOrder) !== JSON.stringify(readingOrder)) {
    failures.push(`대표 사례 읽기 순서 불일치: ${renderedOrder.join(", ")}`);
  }
  for (const slug of readingOrder) {
    const article = visibleHome.match(new RegExp(`<article\\b[^>]*id="case-${slug}"[\\s\\S]*?<\\/article>`))?.[0] ?? "";
    const heading = article.indexOf(`<h3 id="case-title-${slug}"`);
    /* 2026.09.24 카드형 홈 — 제목 → 결과(기준 포함) → 기여 범위 → 원본 링크 순서는 그대로 지킨다 */
    const outcome = article.indexOf("folio-case-result");
    const evidence = article.indexOf("folio-case-evidence");
    if (heading < 0 || outcome <= heading || evidence <= outcome || !article.includes("기여 범위") || !article.includes("folio-case-basis")) {
      failures.push(`읽기 구조 또는 성과 기준 누락: ${slug}`);
    }
  }
}
const evidenceLinkCount = (visibleHome.match(new RegExp(evidenceLinkLabel, "g")) ?? []).length;
if (evidenceLinkCount !== expectedEvidenceLinks[edition]) {
  failures.push(
    `메인 증빙 원본 링크 수 불일치: ${evidenceLinkCount}건 (기대 ${expectedEvidenceLinks[edition]}건)`,
  );
}
if (visibleHome.includes(">크게 보기<")) {
  failures.push("옛 증빙 링크 문구 잔존: 크게 보기");
}

/*
 * 사외 지원판에 사내 메일·HLL 판 주소가 새는지 out/ 안의 모든 파일에서 검사한다.
 *
 * HTML 만 보면 이력서 PDF 가 빠진다. 그 PDF 는 public/ 의 한 파일을 두 판이 공유하던 것이라,
 * 사외 지원용인 일반판이 사내 메일과 HLL 판 주소(/kim-seonil-portfolio_HLL/)가 박힌 PDF 를
 * 내려주고 있었다. PDF 본문은 압축돼 있지만 링크 주석의 URL 은 평문으로 남아 잡힌다.
 * 그래서 확장자를 가리지 않고 latin1 로 읽는다 — 한글은 깨지지만 찾는 값은 둘 다 ASCII 다.
 * hll 판은 사내 메일이 재직 확인 수단이므로 검사에서 제외한다.
 */
if (edition !== "hll") {
  const 금지 = ["kim.seonill@hll.kr", "kim-seonil-portfolio_HLL"];
  const 걸린것 = new Map();
  const 전체훑기 = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) 전체훑기(full);
      else if (entry.isFile()) {
        const buf = readFileSync(full, "latin1");
        for (const 값 of 금지) {
          if (buf.includes(값)) {
            if (!걸린것.has(값)) 걸린것.set(값, []);
            걸린것.get(값).push(relative(root, full));
          }
        }
      }
    }
  };
  전체훑기(root);
  for (const [값, 파일들] of 걸린것) {
    failures.push(
      `사외 지원판에 ${값} 노출 — ${파일들.length}개 파일 (${파일들.slice(0, 4).join(", ")}` +
        `${파일들.length > 4 ? " 외" : ""})`,
    );
  }
}

for (const file of ["portfolio-polish.js", "portfolio-polish.css", "motion.js", "motion.css"]) {
  if (existsSync(join(root, file))) failures.push(`후처리 파일 잔존: ${file}`);
  if (allHtml.includes(file)) failures.push(`후처리 파일 참조 잔존: ${file}`);
}

/*
 * EDIT H 호수는 아카이브가 늘어날 때마다 어긋난다. 이 페이지는 아카이브 링크를 걸고
 * "직접 세어 보라"고 권하므로, 링크 너머의 수와 다르면 그 자리가 그대로 약점이 된다.
 * 공개 문서 수와 확인일을 함께 검사한다. 과거 제작 이미지의 날짜는 보존한다.
 */
const EDITH_PUBLIC = "공개 문서 89편";
if (!allHtml.includes(EDITH_PUBLIC)) {
  failures.push(`EDIT H ${EDITH_PUBLIC} 문구 없음`);
}
const edithHtml = readFileSync(join(root, "projects", "edith", "index.html"), "utf8");
for (const expected of ["89편", "2026.09.13", "VOL.089"]) {
  if (!edithHtml.includes(expected)) failures.push(`EDIT H 최신 공개 기준 누락: ${expected}`);
}
for (const stale of ["공개 아카이브 69호", "제작·발행 70호", "VOL.001–070", "공개 아카이브 75호", "VOL.033 게시 대기"]) {
  if (allHtml.includes(stale)) failures.push(`EDIT H 옛 호수 잔존: ${stale}`);
}

const summary = {
  edition,
  htmlFiles: htmlFiles.length,
  references: referenceCount,
  anchors: anchorCount,
  requiredAssets: requiredAssets.length,
  failures: failures.length,
};
console.log(`정적 배포 검증 — ${JSON.stringify(summary)}`);
if (failures.length) {
  for (const failure of failures.slice(0, 30)) console.error(`  FAIL ${failure}`);
  if (failures.length > 30) console.error(`  ... 외 ${failures.length - 30}건`);
  process.exit(1);
}
console.log("정적 배포 검증 통과.");
