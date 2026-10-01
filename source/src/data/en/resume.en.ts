/**
 * 영문 이력서 문장 (2026.09.25) — site.ts · projects.ts 의 같은 항목을 옮긴 것이다.
 * 새 사실·수치를 더하지 않는다. 기관·대회 이름은 공식 영문명을 확인하지 못한 것이 많아 뜻을 옮겨 적는다.
 */
import { careerMonths } from "@/data/site";

export function careerLengthEn(now: Date = new Date()): string {
  const months = careerMonths(now);
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m ? `${y} yrs ${m} mos` : `${y} yrs`;
}

export const narrativeEn = [
  "Over four years at PlayD and HLL JoongAng, I've run ads for 30+ brands. When performance stalls, I structure the problem to find the cause, set a hypothesis and test it, then rebuild budget and operations on what's confirmed. I automate repetitive checks to leave time for decisions.",
  "At PlayD I ran search (SA), display (DA) and social campaigns for 30+ brands. For J.ESTINA I split a search-heavy budget by customer stage, and in the same closing report GA4 ROAS rose from 352% in May 2025 to 583% in July. That campaign won an Excellence Award at the Korea Digital Advertising Awards that year. For Dyson I took on co-planning and media-mix analysis, and moved budget from weaker display ads into video.",
  "At HLL JoongAng I ran New Balance's 10 channels at KRW 1B+ a month as part of a team. I connected the inventory checks people did site by site to ad operations, cutting internal check time from about 2 hours to under 5 minutes, and made the system stop without touching ads when data looks wrong. This work was featured as an LG CNS MOP best practice. At Daekyo EduCamp I re-measured a 'performance dropped' report on the same sample and found CVR had actually risen from 0.66% to 2.24%.",
  "I studied business and then industrial design, and surveying 300 car owners for a pre-startup taught me that answers lie in customer data more than in a good idea. To learn how to get the word out, I chose an ad agency, where marketing across the most industries happens. When a campaign ends, I leave reports, check procedures and handover documents so the next person can pick it up.",
] as const;

export const summaryEn = {
  intro:
    "A performance marketer who has run search, display and video ads for 30+ brands over four years. I find where budget leaks and move it to what performs, and automate the checks, reports and settlement people used to repeat, so the team has time for decisions.",
  columns: [
    { title: "Insight · Brief", items: ["Market, search and performance signal analysis", "Structuring client problems and bottlenecks", "Defining content purpose and KPIs"] },
    { title: "Content · Channels", items: ["Content–subscription–commerce journeys", "Role and budget design across 10 channels", "30+ brands managed"] },
    { title: "Performance · Systems", items: ["Measurement with GA4 · GTM · media data", "Funnel performance and attribution-path analysis", "Planned and ran 6 automations"] },
  ],
  highlights: [
    {
      axis: "Scale · Systems",
      body: "New Balance, KRW 1B+ a month across 10 channels — inventory rules process up to 900 products per run automatically, and a run stops with 0 changes when data looks wrong",
    },
    {
      axis: "Revenue",
      body: "Gangwon Deep Sea Water, run alone — added Instagram group-buys as a sales channel: July 2026 store sales +397.3% year on year (incl. group-buys); H1 ROAS on ad-attributed revenue alone 201% → 238% (last year's periods were before I took over)",
    },
    {
      axis: "Efficiency",
      body: "J.ESTINA IMC redesign — blended GA4 ROAS 352% → 583% (2025.05 → 07, same closing report), strategy & measurement contribution 75%",
    },
  ],
} as const;

export const careerEn = [
  {
    company: "HLL JoongAng",
    group: "JoongAng Group",
    period: "2025.11 – 2026.09",
    title: "Performance Strategy Division · Manager",
    summary:
      "Beyond running multiple media, I widened my role to own the decision rules that measure content and media performance together, and the automation behind them.",
    work: [
      "Integrated operation of New Balance's 10 channels at KRW 1B+ a month",
      "Planned and built 6 automations for inventory, reporting, monitoring and settlement",
      "Took part in the in-house AI transformation (AX) project",
    ],
    clients: "New Balance · Daekyo EduCamp (5 sub-brands) · Gangwon Deep Sea Water Cheonnyeon Dongan",
    highlight:
      "New Balance, KRW 1B+ a month across 10 channels (account operations 40%) · Daekyo EduCamp: re-verified the comparison sample (CVR 0.66% → 2.24% on the same basis, measurement QA design 100%) and reworked the consultation form three times (lead conversion rate 2.84% → 7.55% after the form relaunch; paid-service conversion 9.9% → 11.28% after question changes) · Designed and built 6 automations alone",
  },
  {
    company: "PlayD",
    group: "KT Group",
    period: "2022.09 – 2025.10",
    title: "Data Marketing Division · PM",
    summary:
      "Handling SA, DA and SNS for 30+ brands, I built PM experience turning client requests into campaign strategy verified with data.",
    work: [
      "GA4-based conversion analysis · A/B tests · media-mix design",
      "IMC campaign strategy and a performance-verification setup",
      "Proposals, operations and reporting for large advertisers",
    ],
    clients: "J.ESTINA · Dyson · Samsonite · Dongwon Mall · Hanssem · KT alpha Shopping",
    highlight:
      "J.ESTINA GA4 ROAS 352% → 583% (same closing report) · Took part in designing Dyson's content–subscription–commerce journey (channel-wide subscribers 2,000 → 107,600 · team result) · Excellence Award, Integrated Performance, Korea Digital Advertising Awards, two years running",
  },
  {
    company: "Korea SMEs and Startups Agency",
    group: "",
    period: "2022.04 – 2022.07",
    title: "Innovation Growth Division · Intern",
    summary:
      "Supporting government program operations, I first saw how promotional ideas turn into actual applications and participation.",
    work: ["Planned collaborative content with finance influencers", "Managed the program application process"],
    clients: "Government support programs",
    highlight: "Contributed to reaching 154% of the operating target",
  },
] as const;

/** 이력서 대표 프로젝트에 싣는 성과 — 한국어 이력서(resumeMetricLabels)와 같은 칸을 같은 순서로 */
export const resumeMetricIndexKo: Record<string, string[]> = {
  dyson: ["동영상 광고 CTR", "YouTube 구독자", "구독 전환 (매체 집계)"],
  jestina: ["GA4 ROAS", "GA4 전환매출", "매체 ROAS"],
  daekyo: ["CVR", "CPA", "CTR"],
  newbalance: ["재고·운영 점검 시간", "데이터 이상 시", "리포트 수기 작성"],
};

/** 영문 상세가 없는 확장 사례 */
export const supportingEn: Record<string, { brand: string; role: string; scope: string; evidence: string; objective: string }> = {
  edith: {
    brand: "EDIT H",
    role: "Planning · editorial standards · production pipeline · publishing",
    scope: "Planning, editing, building and publishing · 100%, alone",
    evidence: "Public archive (link available)",
    objective: "Build a publishing standard that keeps only what's verified, and automate it so the standard holds every day",
  },
};

export const otherResultsEn = [
  {
    brand: "Samsonite",
    category: "Commerce",
    period: "2023.10 – 2025.10",
    summary: "I split product exposure by new and repeat customer groups, and built separate campaigns for TUMI and Gregory because their purchase cycles differ.",
    metrics: [{ label: "TUMI ROAS", value: "747%" }, { label: "Gregory CVR YoY", value: "+647%" }],
  },
  {
    brand: "Samsonite KakaoTalk Channel",
    category: "Channel Growth",
    period: "2025.01 – 2025.10",
    summary: "I approached gaining friends as giving people a reason to stay in the channel rather than ad clicks, splitting entry placements and benefit messages around back-to-school and promotions. The figure is cumulative friends at the end of this period.",
    metrics: [{ label: "KakaoTalk Channel friends", value: "5,482" }],
  },
  {
    brand: "Dongwon Mall",
    category: "Search",
    period: "2024.05 – 2025.07",
    summary: "I restructured 5,000 keywords and creatives by product group and search intent, and combined them with MOP auto-bidding.",
    metrics: [{ label: "Monthly revenue target", value: "exceeded by 32%" }, { label: "Shopping-search sign-ups", value: "+28% · CPC −23%" }],
  },
  {
    brand: "Saenghwal Baekseo",
    category: "D2C",
    period: "2024.09 – 2025.03",
    summary: "I segmented high-intent retargeting with shopping-info ad extensions and GFA custom targeting.",
    metrics: [{ label: "Conversion revenue", value: "+775% (YoY)" }, { label: "Efficiency", value: "CTR 12% · CVR 8%" }],
  },
  {
    brand: "FUJIFILM BI",
    category: "B2B Content",
    period: "2024.09 – 2025.03",
    summary: "Instead of repeating product descriptions, I split message length and follow-up retargeting paths to fit how people use YouTube, Facebook and Instagram.",
    metrics: [{ label: "Avg. video views", value: "~100K" }, { label: "YouTube ad view rate", value: "28%" }, { label: "Subscribers YoY", value: "+16%" }],
  },
  {
    brand: "Hyundai Glovis Autobell",
    category: "App Acquisition",
    period: "2022.12 – 2023.06",
    summary: "I re-evaluated campaigns by sign-up conversion rate and CPA rather than installs, and moved budget to segments with higher real conversion quality.",
    metrics: [{ label: "Conversion rate", value: "4.19% → 7.89%" }, { label: "Cost per conversion", value: "about −31%" }],
  },
] as const;

export const otherBrandsEn = ["Breitling", "Busan Bank", "Simmons", "Humanworks", "Mettler-Toledo Korea"];

export const publicWorkEn = [
  {
    label: "Content planning · self-published",
    title: "EDIT H marketing newsletter · card news",
    desc: "I publish marketing news as a newsletter and 8-slide card news. Anything that isn't an official announcement is left out unless two different outlets confirm it.",
    facts: ["89 public issues", "Latest public VOL.089 · 2026.09.11", "Archive list checked 2026.09.13"],
    href: "https://vetnam555-del.github.io/edit-h-archive/",
  },
  {
    label: "Training tool · public web",
    title: "Performance Marketing Practice Hub",
    desc: "I gathered per-media operating guides and practice tools into one onboarding site, so individual know-how becomes something the team reuses.",
    facts: ["8 practical tools", "12-week curriculum", "9 media guides"],
    href: "https://vetnam555-del.github.io/pm-hub/",
  },
] as const;

export const skillLevelsEn = [
  { level: "Design", desc: "built the rules and structure, and documented them" },
  { level: "Operate", desc: "handled the accounts and data directly" },
  { level: "Use", desc: "used in my work, but not as the designer or operator" },
  { level: "Basic", desc: "learned the syntax, and use it with AI assistance" },
] as const;

export const skillsEn: { category: string; rows: { level: string; items: string[]; note?: string }[] }[] = [
  {
    category: "Media operations",
    rows: [
      {
        level: "Design",
        items: [
          "Naver SA · BSA · Shopping search · Catalog · GFA",
          "Google Ads (Search · GDN · YouTube VAC · Performance Max)",
          "Meta (Advantage+)",
          "Kakao (Bizboard · Moment · Catalog)",
          "Creative briefs (placements & specs · message-angle A/B design)",
        ],
      },
      { level: "Operate", items: ["Criteo", "RTB House", "ADVoost", "Payco", "Danggeun", "Toss", "X (formerly Twitter)"] },
    ],
  },
  {
    category: "Analysis · Measurement",
    rows: [
      {
        level: "Design",
        items: [
          "GA4 event & conversion design",
          "YouTube campaign metric definitions (impressions · product clicks · 10s+ views)",
          "10-day rotation tests for thumbnails, playlists and community",
          "UTM Builder parameter system",
          "Measurement QA checklist",
          "Media–GA4 cross-reporting",
          "Funnel design",
        ],
      },
      {
        level: "Operate",
        items: ["Google Tag Manager (Tag Assistant · DebugView)", "Looker Studio", "AppsFlyer (MMP)", "Attribution-path analysis", "Cohort analysis", "A/B testing"],
      },
      {
        level: "Basic",
        items: ["Basic SQL query syntax"],
        note: "I've learned basic query syntax; I write queries with AI help and check the results. Complex queries need more study and collaboration.",
      },
    ],
  },
  {
    category: "Automation · AX",
    rows: [
      {
        level: "Design",
        items: [
          "Python data pipelines",
          "Google Apps Script",
          "Media API integration",
          "A four-step safeguard that stops runs when data looks wrong",
          "Common basis for 12 core metrics",
          "Handover documentation system",
          "Creative draft & caption pipeline (brand identity & layout dictionary + Claude · Figma)",
        ],
      },
      { level: "Operate", items: ["PostgreSQL-based operating environment", "Docker", "PowerShell", "LG CNS MOP auto-bidding", "RAG knowledge bot"] },
      {
        level: "Use",
        items: ["Claude", "GPT", "Gemini", "Codex"],
        note: "I use AI tools for implementation. Requirements, decision and stop rules, result checks and operation are mine. Report comments are cross-checked against several models' output and the source data.",
      },
    ],
  },
  {
    category: "Documents · Collaboration · Language",
    rows: [
      { level: "Operate", items: ["Leading and presenting competitive pitches", "PowerPoint proposals", "Excel (pivot · VLOOKUP · conditional formatting · charts)"] },
      { level: "Use", items: ["Adobe Photoshop", "Illustrator"] },
      {
        level: "Language",
        items: ["English — writing reports for and communicating with global advertisers"],
        note: "Dyson · Samsonite · FUJIFILM BI · Air France · Cathay Pacific · Publicis Groupe",
      },
    ],
  },
];

export const educationEn = [
  { period: "2017.03 – 2022.02", school: "Yonsei University Mirae Campus", major: "Bachelor's, Industrial Design (Division of Design & Art)" },
  { period: "2014.03 – 2017.02", school: "Academic Credit Bank System", major: "Bachelor's, Business Administration" },
  { period: "2014.03 – 2017.02", school: "Soongsil University", major: "Business Administration" },
] as const;

export const educationCaptionEn =
  "I studied business first, then industrial design. I learned to judge with numbers and to read creative separately, and media operations was the work that needed both.";

export const certificationsEn = [
  { name: "GAIQ (Google Analytics), previously certified", when: "" },
  { name: "Google Ads certification, previously certified", when: "" },
  { name: "Kakao Moment Business (Basic)", when: "" },
  { name: "KakaoTalk Channel Business (Basic)", when: "" },
  { name: "Telemarketing Manager", when: "2016.08.15" },
  { name: "Administrative Manager, Level 3", when: "2014.06.30" },
] as const;

export const awardsEn = [
  { year: "2025", name: "Korea Digital Advertising Awards", detail: "J.ESTINA · Excellence Award, Integrated Performance" },
  { year: "2024", name: "Korea Digital Advertising Awards", detail: "Dongnimmun PAT · Elle Golf · Excellence Award, Integrated Performance" },
  { year: "2020", name: "Korea Talent Award", detail: "Selected and honored (Deputy Prime Minister and Minister of Education Award)" },
] as const;

export const awardsArchiveEn = [
  { year: "2021", items: "Top Excellence Award, Hyper-regional Metaverse Ideathon Startup Competition" },
  {
    year: "2020",
    items:
      "Korea Talent Award · Seoul International Invention Fair Silver, Bronze & Special Prize · Selected for Student Startup Promising Teams 300 · 55th Invention Day Excellence Award · Asia Design Prize Excellence Award · Selected for the Pre-Startup Package (as CEO)",
  },
  {
    year: "2019",
    items:
      "International Startup Idea Competition Grand Prize · Asia Social Venture Competition Excellence Award, Idea Category · Gwangju Design Biennale Crowdfunding Contest Grand Prize · International SMART Startup Competition Silver · Selected for the Social Entrepreneur Development Program, 9th cohort (team member)",
  },
  {
    year: "2017–2018",
    items:
      "Social Venture Competition Top Excellence Award & Minister of Employment and Labor Award · Seoul Citizen Award, Excellence · KT Social Change Maker Top Excellence Award · World Invention Creativity Contest Gold · University Creative Invention Contest Honorable Mention",
  },
  { year: "2015–2016", items: "Seoul Citizens' Traffic Safety Idea Contest Top Excellence Award · Samsung Tomorrow Solution Contest Excellence Award" },
] as const;

export const activitiesEn = [
  { period: "2022.07", name: "SME Training Institute, Marketing Expert Course", detail: "Completed — marketing analysis, STP strategy, 4P mix execution" },
  { period: "2020–2021", name: "Enactus Korea", detail: "Planning team lead · planned a candle-funding project for young people leaving care, and its SNS promotion" },
  { period: "2018", name: "Kyung Hee University Future Innovation Institute Open-Lab", detail: "Completed an online-marketing innovation startup program" },
  { period: "2018", name: "Creative Invention IP Summer School", detail: "Completed" },
  { period: "2017", name: "Yonsei University startup club Y-Media", detail: "Planning team lead" },
  { period: "2017", name: "Yonsei Start-up Academy", detail: "Completed practical courses" },
  { period: "2014–2015", name: "Content Korea Lab, 3rd cohort", detail: "Completed the Idea Furnace program" },
] as const;

/** 외부 확인 자료 — verification 의 링크가 있는 항목과 같은 순서·주소. 원문은 한국어 매체다 */
export const recordsLinksEn = [
  { title: "LG CNS MOP best practice", href: "https://blog.mop.co.kr/hll" },
  { title: "Korea Digital Advertising Awards (2025)", href: "https://kodaa.or.kr/2025kodaf" },
  { title: "Korea Digital Advertising Awards (2024)", href: "https://kodaa.or.kr/2024kodaf" },
  { title: "Hyper-regional Metaverse Ideathon (2021.07)", href: "https://news.unn.net/news/articleView.html?idxno=512386" },
  { title: "Yonsei Chunchu interview (2021.05)", href: "https://chunchu.yonsei.ac.kr/news/articleView.html?idxno=27940" },
  { title: "Korea Talent Award (2020.12)", href: "https://news.unn.net/news/articleView.html?idxno=503973" },
  { title: "Seoul International Invention Fair, three awards (2020.12)", href: "https://news.unn.net/news/articleView.html?idxno=503360" },
  { title: "Asia Social Venture Competition (2019.11)", href: "https://www.donga.com/news/It/article/all/20191105/98223637/2" },
] as const;
