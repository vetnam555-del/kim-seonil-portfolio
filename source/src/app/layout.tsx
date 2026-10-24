import type { Metadata, Viewport } from "next";
import { MotionRuntime } from "@/components/MotionRuntime";
import ContentProtection from "@/components/ContentProtection";
import Header from "@/components/Header";
import { HtmlLang, SiteFooter, SkipLink } from "@/components/SiteChrome";
import { edition, isGeneralLike, roleForClient, EDITION, OG_VERSION } from "@/data/edition";
import { INSIGHT_URL, insightScript } from "@/lib/insight";

/*
 * Header 는 클라이언트라 판별 카피 표를 읽을 수 없어 직함을 따로 갖고 있다.
 * 두 값이 갈라지면 화면에 다른 직함이 두 개 나오는데, 눈으로는 잘 안 잡힌다.
 * 이 파일은 서버에서만 도므로 여기서 대조한다 — 어긋나면 빌드가 선다.
 */
if (edition.role !== roleForClient) {
  throw new Error(
    `직함이 갈라졌습니다 — edition.role "${edition.role}" 과 roleForClient "${roleForClient}". ` +
      "src/data/edition.ts 의 두 곳을 함께 고치세요.",
  );
}
import { site } from "@/data/site";
import "./globals.css";

const description = edition.seoDescription;

const seoTitle = edition.seoTitle;

/** GitHub Pages 하위경로 배포용. next.config.ts 의 basePath 와 같은 값이 주입된다. */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const contentProtectionEnabled = isGeneralLike;

/**
 * metadataBase(site.url)에 이미 basePath가 포함되어 있다.
 * 선행 슬래시를 붙이면 도메인 루트로 해석돼 경로가 어긋나므로 상대경로로 둔다.
 */
const ogImage = {
  url: `og-image.png?v=${OG_VERSION}`,
  width: 1200,
  height: 630,
  alt: edition.ogAlt,
};

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: seoTitle,
    template: `%s | ${site.name}`,
  },
  description,
  authors: [{ name: site.name }],
  other: contentProtectionEnabled
    ? {
        copyright: `© ${new Date().getFullYear()} ${site.nameEn}`,
        "content-owner": site.nameEn,
        "usage-rights": "All rights reserved. Unauthorized reproduction prohibited.",
      }
    : undefined,
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: site.url,
    siteName: `${site.nameEn} Portfolio`,
    title: seoTitle,
    description,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: seoTitle,
    description,
    images: [ogImage],
  },
  /*
   * 색인 정책 — 기본은 두 판 모두 차단이다.
   *
   * ── 잠금 이유가 바뀌었다 (2026.08.17)
   * 원래 이유는 광고주 절대 금액이었다. 제이에스티나 GA4 전환매출 약 11.9억, 뉴발란스
   * 월 매체 예산 10억이 브랜드 실명과 함께 홈에 있어서, 브랜드명으로 검색해 닿는 것은
   * 광고주 동의 없이 넘어갈 선이 아니라고 봤다.
   * 그 두 값은 본인이 공개 허용을 확인했다. 그래서 이 이유는 해소됐다.
   *
   * 그런데도 계속 차단한다. 남은 이유는 성격이 다르다 —
   * 일반판은 사외 지원용이다. 검색에 열면 현 직장 동료·상급자가 이름 검색으로
   * 바로 찾을 수 있고, 사내 이동을 진행하는 지금 그건 수치 공개와 별개의 위험이다.
   * URL 을 직접 전달하는 것은 그대로 가능하다 — 막는 것은 '검색으로 발견되는 것'뿐이다.
   *
   * 열어야 할 때: 이직이 확정되거나 사외 공개가 문제되지 않는 시점.
   *   PowerShell:  $env:ALLOW_INDEX="1"; npm run build:general
   */
  robots:
    process.env.ALLOW_INDEX === "1" && !edition.showWhyStudio
      ? {
          index: true,
          follow: true,
          noarchive: true,
          googleBot: { index: true, follow: true, noarchive: true, "max-snippet": 160 },
        }
      : {
          index: false,
          follow: false,
          noarchive: true,
          nosnippet: true,
          googleBot: { index: false, follow: false, noarchive: true, nosnippet: true },
        },
  /**
   * icons 는 og:image 와 달리 metadataBase 로 절대화되지 않고 그대로 출력된다.
   * 상대경로로 두면 /projects/<slug>/ 에서 그 하위를 찾아 404가 되므로 basePath 를 붙인다.
   */
  icons: {
    icon: [
      { url: `${basePath}/favicon.svg`, type: "image/svg+xml" },
      { url: `${basePath}/favicon-32.png`, sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: `${basePath}/apple-touch-icon.png`, sizes: "180x180" }],
  },
};

/*
 * theme-color 는 모바일 브라우저 주소창 색이다. 흰색으로 두면 홈 첫 화면(표지)이
 * ink(#0b0d10)인데 그 위 주소창만 흰 띠로 떠서 지면이 잘려 보인다.
 * 기본값을 표지 색으로 두고, 흰 지면으로 시작하는 페이지(이력서·케이스 상세)는
 * 각 page.tsx 에서 viewport 를 덮어쓴다.
 */
export const viewport: Viewport = {
  /* 공용판 홈은 2026.09.24 부터 흰 지면이다 — 주소창 색도 맞춘다 */
  themeColor: EDITION === "general" ? "#ffffff" : "#0b0d10",
  width: "device-width",
  initialScale: 1,
};

/*
 * 글꼴 preload 를 두지 않는다 (2026.10.24 B-04). 전에는 Pretendard 4종과 JetBrains Mono 를 preload 했는데,
 * Chromium 은 preload 한 글꼴이 오기를 잠깐 기다리느라 첫 그림을 미룬다 — 글꼴을 1.5초 늦춘 재현에서
 * 첫 그림이 128ms → 540ms 로 밀렸고, 라이브 모바일 Lighthouse 는 FCP 2.2s · LCP 5.9s(성능 70–72)였다.
 * 2026-09-12 의 preload 순서 메모(Archivo 는 첫 화면 밖 · Black 은 "김선일")는 그때 판단이고, 첫 그림을
 * 막는 비용이 더 커서 preload 자체를 뺐다.
 *
 * 글꼴은 첫 그림 뒤에 붙인다 (2026.10.24 B-04 둘째 판). preload 만 뺐더니 라이브 모바일이 56–72 로 오히려 내려갔다.
 * - 헤드리스 Chrome 의 모바일 흉내(Lighthouse·PageSpeed)는 첫 프레임을 1초 간격으로만 내보내 첫 그림이 1.3–2.5초에 찍힌다.
 *   그 전에 끝난 요청은 모두 FCP·LCP 계산에 들어가는데, CSS 에서 찾은 글꼴은 '렌더 차단' 우선순위라 6개(약 330KB)가
 *   통째로 들어갔다(FCP 3.5–4.1s). 글꼴을 1.5초 늦게 받게 한 재현에서는 같은 쪽이 FCP 2.4s · LCP 3.1s 였다.
 * - 그래서 @font-face 를 CSS 에 두지 않고, 아래 스크립트가 첫 그림(first-contentful-paint)을 본 뒤 FontFace 로 붙인다.
 *   첫 그림은 원래도 대체 서체로 그려졌다(font-display: swap) — 사람에게 달라지는 것은 글꼴 요청이 한두 프레임 늦게
 *   시작한다는 것뿐이고, 그동안 글꼴이 첫 화면 CSS·스크립트·사진과 대역폭을 다투지 않는다.
 * - 한 번 받은 브라우저(localStorage ksi-fonts)는 기다리지 않고 바로 붙인다 — 디스크 캐시에서 오므로 다시 올 때
 *   대체 서체가 비치지 않게. Lighthouse 는 매번 저장소를 비우므로 늘 첫 방문으로 잰다.
 * - html.fonts-pending(데스크톱 홈 CLS 방지, globals.css B-01)도 여기서 붙이고 뗀다. 홈(.folio-hero)이면 제목 줄의 Black(900)과
 *   수치 단서의 Regular(400)를 먼저 받고, 오거나 실패하거나 붙인 뒤 6초가 지나면 뗀다.
 * - 검수 스크립트는 document.fonts.ready 만으로는 글꼴이 붙기 전에 지나갈 수 있어 window.__ksiFontsReady 를 먼저 기다린다.
 * - JS 가 없으면 아래 noscript 의 @font-face 가 그대로 쓰인다.
 */
const FONT_FILES: [family: string, file: string, format: string, descriptors: FontFaceDescriptors][] = [
  /* 한글 본문 + 디스플레이(900). 디스플레이 웨이트가 없어서 위계가 굵기로만
     만들어지던 것이 이전 디자인이 밋밋했던 원인 중 하나였다. */
  ["Pretendard", "Pretendard-Regular.woff2", "woff2", { weight: "400" }],
  ["Pretendard", "Pretendard-SemiBold.woff2", "woff2", { weight: "600" }],
  ["Pretendard", "Pretendard-Bold.woff2", "woff2", { weight: "700" }],
  ["Pretendard", "Pretendard-Black.woff2", "woff2", { weight: "900" }],
  /* 수치 전용 가변 서체. wdth 축이 살아 있어 큰 수치를 Expanded 로 뽑을 수 있다. 라틴·숫자만 쓰므로 한글 서브셋과 달리 파일이 작다.
     2026.10.24 B-04 — 파일을 쓰는 범위(굵기 600–900 · 폭 100–125%)만 남겨 90KB → 26KB(scripts/subset_fonts.py ARCHIVO_AXES). 선언 범위도 같이 */
  ["Archivo", "Archivo-Var.woff2", "woff2-variations", { weight: "600 900", stretch: "100% 125%" }],
  /* 라벨·기간·출처·각주. 시스템 모노는 플랫폼마다 폭이 달라 표가 흔들렸다. */
  ["JetBrains Mono", "JetBrainsMono-Var.woff2", "woff2-variations", { weight: "100 800" }],
];
const fontFaces = FONT_FILES.map(
  ([family, file, format, d]) =>
    [family, `${basePath}/fonts/${file}`, format, { ...d, display: "swap" }] as const,
);
/* JS 가 없을 때(noscript) 쓰는 같은 선언. FontFace 를 모르는 브라우저(IE)는 대체 서체로 둔다 */
const fontFaceCss = fontFaces
  .map(
    ([family, url, format, d]) =>
      `@font-face{font-family:"${family}";src:url("${url}") format("${format}");font-weight:${d.weight};${
        d.stretch ? `font-stretch:${d.stretch};` : ""
      }font-display:swap}`,
  )
  .join("");
const FONT_LOADER = `(function(){var d=document.documentElement,f=document.fonts,K="ksi-fonts",A=${JSON.stringify(
  fontFaces,
)},res,added=0;window.__ksiFontsReady=new Promise(function(r){res=r});d.classList.add("fonts-pending");var release=function(){d.classList.remove("fonts-pending")};function add(){if(added)return;added=1;setTimeout(release,6000);var list=[];try{A.forEach(function(a){var x=new FontFace(a[0],'url("'+a[1]+'") format("'+a[2]+'")',a[3]);f.add(x);list.push(x)})}catch(e){release();res();return}var track=function(){var want=document.querySelector(".folio-hero")?list.filter(function(x){return x.family==="Pretendard"&&(x.weight==="400"||x.weight==="900")}):[];var settle=function(){release();requestAnimationFrame(function(){requestAnimationFrame(function(){f.ready.then(function(){try{if(list.some(function(x){return x.status==="loaded"}))localStorage.setItem(K,"1")}catch(e){}res()})})})};Promise.all(want.map(function(x){return x.load()})).then(settle,settle)};document.readyState==="loading"?addEventListener("DOMContentLoaded",track):track()}var cached=0;try{cached=localStorage.getItem(K)==="1"}catch(e){}if(cached){add();return}var go=function(){setTimeout(add,0)};try{if(PerformanceObserver.supportedEntryTypes.indexOf("paint")>-1){var o=new PerformanceObserver(function(l){l.getEntries().forEach(function(e){if(e.name==="first-contentful-paint"){o.disconnect();go()}})});o.observe({type:"paint",buffered:true})}else addEventListener("DOMContentLoaded",function(){requestAnimationFrame(go)})}catch(e){go()}setTimeout(add,5000)})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    /* data-intro 는 홈의 인트로 판정 스크립트가 하이드레이션 전에 붙인다(IntroSplash.tsx) — 그 차이만 넘긴다 */
    <html lang="ko" data-edition={EDITION} suppressHydrationWarning>
      <head>
        {/* 글꼴은 첫 그림 뒤에 붙인다 — 위 FONT_LOADER 주석. 경로는 basePath 를 넣어 여기서 만든다
            (CSS 파일 안의 url() 은 webpack 이 빌드 시점에 해석해 basePath 가 반영되지 않는다). */}
        <script dangerouslySetInnerHTML={{ __html: FONT_LOADER }} />
        {/* JS가 없거나 실행되지 않은 환경에서 등장 애니메이션 대기 블록이
            백지로 남는 것을 막는다. Framer Motion 이 정적 HTML에 심는
            style="opacity:0" 을 무력화한다. 글꼴 선언도 여기 둔다 — JS 가 없으면 FONT_LOADER 가 돌지 않는다. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              `<style>${fontFaceCss}[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}.count-up-visual{display:none!important}.count-up-measure{visibility:visible!important}</style>`,
          }}
        />
      </head>
      <body className={contentProtectionEnabled ? "content-protected" : undefined}>
        <MotionRuntime />
        {contentProtectionEnabled ? <ContentProtection /> : null}
        {/*
          읽기 진행 바. JS 가 --read 를 채우기 전에는 폭 0 이라 아무것도 보이지 않고,
          장식이 아니라 위치 표시라서 스크린리더에서는 뺀다.
        */}
        <div className="scroll-progress" aria-hidden="true" />
        <HtmlLang />
        <SkipLink />
        <Header />
        <main id="main">{children}</main>
        {/*
          머리글처럼 /en/ 아래에서는 영문으로 나온다 — SiteChrome.tsx (2026.09.25).
          보조 메일은 싣는 판에서만 넘긴다. 클라이언트 컴포넌트의 속성값은 화면에 안 그려도
          페이지 데이터(RSC)에 그대로 실려서, 사외 지원판에 사내 메일이 106개 파일로 새어 나갔다.
        */}
        <SiteFooter
          name={site.name}
          nameEn={site.nameEn}
          emailPrimary={site.emailPrimary}
          linkedin={site.linkedin}
        />

        {/*
          방문 계측. NEXT_PUBLIC_INSIGHT_URL 이 비어 있으면 아무것도 나가지 않는다 —
          붙이기 전 배포본과 산출물이 바이트 단위로 같아야 하므로 기본은 '없음' 이다.
          쿠키를 쓰지 않고, Apps Script 는 요청자 IP 를 스크립트에 넘기지 않는다.
          자세한 이유와 끄는 방법은 src/lib/insight.ts 주석에 있다.
        */}
        {INSIGHT_URL ? (
          <script
            id="insight"
            dangerouslySetInnerHTML={{ __html: insightScript(INSIGHT_URL, EDITION) }}
          />
        ) : null}
      </body>
    </html>
  );
}
