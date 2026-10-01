/**
 * 영문판 홈·이력서 문장 (2026.09.25).
 *
 * 규칙 — 한국어 화면(site.ts · HomeFolio)의 같은 자리 문장을 옮긴다. 새 사실·수치를 더하지 않는다.
 * 이름 표기는 site.nameEn(KIM SEONILL, 본인 확인)과 같은 철자·순서를 쓰고 대소문자만 바꾼다.
 * 영문으로 옮기지 않은 화면(/about/ · 영문판이 없는 사례 · PDF)은 링크 옆에 "(Korean)"을 붙여 알린다.
 */

export { NAME_EN_DISPLAY, ROLE_EN } from "./meta";
export const ORG_EN = "Former Manager, Performance Strategy Division, HLL JoongAng";

export const coverEn = {
  display: ["FIND. TEST.", "IMPROVE."],
  statement: ["I structure problems into hypotheses", "and improve them through testing."],
  note: "At PlayD and HLL JoongAng, I ran ads for 30+ brands, including New Balance, Dyson and J.ESTINA.",
  proof: [
    { before: "352% →", after: "583%", label: "J.ESTINA GA4 ROAS", basis: "May → Jul 2025 · same closing report", href: "#case-jestina" },
    { after: "+397.3%", label: "Gangwon store sales", basis: "Jul 2026 vs same period last year", href: "#case-gangwon" },
    { after: "2×", label: "Korea Digital Advertising Awards, Excellence", basis: "2 years running · 2024 Dongnimmun · 2025 J.ESTINA", href: "#records" },
  ],
  capabilities: [
    {
      role: "Budget & measurement",
      line: "I find where budget leaks and move it to what performs",
      points: [
        "Media operations on Naver, Meta, Kakao and Google",
        "GA4 conversion design and measurement QA",
        "Channel roles and budget by customer stage",
        "Lead generation and lead-quality control",
        "Sales channels beyond ads, such as group-buys",
      ],
      proof: [
        { label: "J.ESTINA", href: "#case-jestina" },
        { label: "Daekyo EduCamp", href: "#case-daekyo" },
        { label: "Gangwon Deep Sea Water", href: "#case-gangwon" },
        { label: "Dyson", href: "#case-dyson" },
      ],
    },
    {
      role: "Operations automation",
      line: "I cut repeat checks with automation",
      points: [
        "Built 6 automations alone for inventory, reporting, settlement and monitoring",
        "Stop conditions that leave ads untouched when data looks wrong",
        "Handover documents included",
      ],
      proof: [
        { label: "New Balance", href: "#case-newbalance" },
        { label: "6 automations", href: "#automation" },
      ],
    },
  ],
  loop: [
    {
      stage: "FIND",
      role: "the problem",
      line: "I find why performance stalls, in the numbers and the structure",
      story: "A 'performance dropped' call included a creative that had spent only about KRW 9,000. Re-measured on the same sample, the conclusion flipped.",
      metrics: [{ before: "0.66% →", after: "2.24%", label: "Daekyo EduCamp CVR", basis: "Re-measured on the same sample · measurement QA design 100%" }],
      points: ["Comparison bases aligned to the same sample and scope", "GA4 conversion design and measurement QA", "Bottlenecks beyond ads: inventory, landing pages, consultation forms"],
      proof: [
        { label: "Daekyo EduCamp", href: "#case-daekyo" },
        { label: "Gangwon Deep Sea Water", href: "#case-gangwon" },
        { label: "New Balance", href: "#case-newbalance" },
      ],
    },
    {
      stage: "TEST",
      role: "the hypothesis",
      line: "I pick one thing to change and test it small",
      story: "With own-site landing pages, conversion sat around 0.7%. I moved to a consultation form and reworked it three times, lifting the June lead conversion rate to 7.55%. Question changes from July brought the paid-service conversion rate back to 11.28%.",
      metrics: [{ before: "2.84% →", after: "7.55%", label: "Daekyo Mypace lead conversion rate", basis: "May → Jun 2026 · paid-service conversion 13.7% → 9.9% → 11.28% (from Jul)" }],
      points: ["Media operations on Naver, Meta, Kakao and Google", "Placement, format and landing-page tests", "Consultation form reworked three times, lead-quality control"],
      proof: [
        { label: "Daekyo EduCamp", href: "#case-daekyo" },
        { label: "Dyson", href: "#case-dyson" },
      ],
    },
    {
      stage: "IMPROVE",
      role: "the structure",
      line: "I rebuild budget and operations on what's confirmed",
      story: "I rebuilt a search-heavy budget around customer stages, opened group-buys where ads alone had stalled sales, and turned repetitive checks into six automations.",
      metrics: [
        { before: "352% →", after: "583%", label: "J.ESTINA GA4 ROAS", basis: "May → Jul 2025 · strategy & measurement 75%" },
        { after: "+397.3%", label: "Gangwon store sales", basis: "Jul 2026 vs same period last year" },
      ],
      points: ["Channel roles and budget rebuilt by customer stage", "Sales channels beyond ads, such as group-buys", "Six automations that turn repetitive checks into operations"],
      proof: [
        { label: "J.ESTINA", href: "#case-jestina" },
        { label: "Gangwon Deep Sea Water", href: "#case-gangwon" },
        { label: "Automation", href: "#automation" },
      ],
    },
  ],
  careerLabel: "Experience",
  career: [
    {
      period: "2025.11 – 2026.09",
      where: "HLL JoongAng · Manager, Performance Strategy",
      text: "Ran New Balance's KRW 1B+/month, 10-channel account as part of a team (account operations 40%) and built 6 inventory, reporting and settlement automations on my own. On Gangwon Deep Sea Water, I added Instagram group-buys as a sales channel and July store sales rose 397% year on year; I also ran Daekyo EduCamp.",
    },
    {
      period: "2022.09 – 2025.10",
      where: "PlayD · PM, Data Marketing Division",
      text: "Ran search, display and social ads for 30+ brands. The J.ESTINA (2025) and Dongnimmun (2024) campaigns won Excellence Awards at the Korea Digital Advertising Awards.",
    },
  ],
  brandsLabel: "Brands",
  brands: "New Balance · Dyson · J.ESTINA · Samsonite · Hanssem · Dongwon Mall · KT alpha Shopping · FUJIFILM BI · Daekyo EduCamp · Gangwon Deep Sea Water and more",
} as const;

/** 첫 화면의 공개 기록 셋 — verification 의 heroScope 가 있는 항목과 같은 순서·링크 */
export const recordsEn = [
  {
    title: "LG CNS MOP best practice",
    scope: "Shopping-search bidding & inventory automation · done alone",
    href: "https://blog.mop.co.kr/hll",
  },
  {
    title: "Korea Digital Advertising Awards (2025)",
    scope: "J.ESTINA · Excellence Award, Integrated Performance",
    href: "https://kodaa.or.kr/2025kodaf",
  },
  {
    title: "Korea Digital Advertising Awards (2024)",
    scope: "Dongnimmun PAT · Elle Golf · Excellence Award, Integrated Performance",
    href: "https://kodaa.or.kr/2024kodaf",
  },
] as const;

/** 홈 자동화 목록 — automationCases 의 name · builtShort · homeEffect 를 옮긴 것 (번호로 맞춘다) */
export const systemsEn: Record<string, { name: string; built: string; effect: string }> = {
  S1: {
    name: "Shopping-search inventory automation",
    built: "Pauses and restarts shopping-search ads automatically by stock level.",
    effect: "Check ~2 hours → under 5 min · internal measurement",
  },
  S3: {
    name: "Automated report generation",
    built: "Paste three raw media files to generate a dashboard, report and QC sheet.",
    effect: "38 media aliases · 82 audience groups mapped automatically",
  },
  S2: {
    name: "Three anomaly monitors",
    built: "Scheduled checks for dead landing pages and stalled spend, plus AI-written daily GA4 comments for 6 media.",
    effect: "Alerts only when something is wrong · silent when normal",
  },
  S4: {
    name: "Ad-spend settlement automation",
    built: "Matches invoices and vouchers and registers them in e-approval.",
    effect: "All cases processed, up to 84 a month · as of 2026.05",
  },
  S5: {
    name: "Automated monthly report delivery",
    built: "Aligns advertiser data to 12 common metrics and sends the monthly report.",
    effect: "Data errors checked automatically before sending",
  },
  S6: {
    name: "Two work-knowledge bots",
    built: "An in-house chatbot that searches 854 files of work records, and a Teams help bot (pilot).",
    effect: "Every answer cites its source files",
  },
};

/** 영문판이 없는 기록 — 한국어 상세로 보낸다 */
export const otherEn: Record<string, { brand: string; line: string }> = {
  edith: { brand: "EDIT H", line: "Before publishing speed, I decided what not to publish." },
  hanssem: { brand: "Hanssem", line: "Unify web and app data scattered across channels on a purchase-contribution basis" },
  ktalpha: { brand: "KT alpha Shopping", line: "Separate each channel's role hidden behind a blended ROAS" },
};

export const contactEn = {
  title: ["I want to look deep into one brand,", "test hypotheses and grow it with your team."],
  note: "I'll show the original reports and operating documents in an interview.",
} as const;
