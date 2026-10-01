import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
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

/**
 * 첫 화면에서 실제로 쓰이는 것만 preload 한다. 나머지는 font-display: swap 에 맡긴다.
 * '실제로 쓰이는' 은 짐작이 아니라 측정이다 — 히어로 안에서 쓰이는 서체·굵기를 재서 고른다.
 *
 * <link rel="preload"> 를 JSX 로 직접 쓰면 태그가 두 벌 나간다 — React 19 는 그 엘리먼트를
 * head 로 hoist 하면서 자기 리소스 레지스트리에도 등록해, 같은 woff2 가 8개(4×2) 선언됐다.
 * (head 안에 쓰든 body 에 쓰든 같다.) react-dom 의 preload() 는 레지스트리에만 등록되므로
 * 정확히 한 벌만 출력된다.
 */
const PRELOAD_FONTS = [
  /*
   * Archivo 는 여기 없다. 2026-09-12 에 라이브를 재어 보니 이 목록이 첫 화면과 어긋나 있었다 —
   * Archivo 는 88KB 로 가장 큰데 첫 등장이 y=967px 이라 히어로(끝 703px) 안에 없다.
   * 89군데에서 쓰이지만 전부 수치 표시(352% · 583% · 0.66%)라 스크롤을 내려야 나온다.
   * 반대로 Pretendard-Black 은 y=225px 의 "김선일" 이 쓰는데 목록에 없어서 780ms 가 아니라
   * 1131ms 에 시작했다. 화면에 없는 것을 먼저 당기고, 가장 큰 글자를 가장 늦게 받고 있었다.
   * font-display:swap 이라 글자가 안 보이진 않지만 그 350ms 동안 대체 서체로 그려지다 바뀐다.
   * 총 전송량은 그대로다. 순서만 바꾼다.
   */
  "Pretendard-Regular",
  "Pretendard-SemiBold",
  "Pretendard-Bold",
  "Pretendard-Black",
  /*
   * 모노는 빠져 있었다. 그런데 이 사이트에서 가장 많이 쓰이는 서체다 —
   * 1440px 홈에서 12px 모노 텍스트가 402개로 전체의 절반을 넘고, 마스트헤드·바이라인·
   * 귀속 단서·챕터 밴드가 전부 첫 화면 안에 있다. 31KB 로 가장 가벼운데
   * swap 에 맡겨 두면 첫 화면에서 가장 많은 글자가 한 번 다시 그려진다.
   */
  "JetBrainsMono-Var",
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  PRELOAD_FONTS.forEach((font) =>
    preload(`${basePath}/fonts/${font}.woff2`, {
      as: "font",
      type: "font/woff2",
      crossOrigin: "anonymous",
    }),
  );

  return (
    /* data-intro 는 홈의 인트로 판정 스크립트가 하이드레이션 전에 붙인다(IntroSplash.tsx) — 그 차이만 넘긴다 */
    <html lang="ko" data-edition={EDITION} suppressHydrationWarning>
      <head>
        {/* @font-face 를 인라인으로 둔다 — CSS 파일 안의 url() 은 webpack 이
            빌드 시점에 해석해 basePath 가 반영되지 않기 때문이다. */}
        <style
          dangerouslySetInnerHTML={{
            __html: [
              /* 한글 본문 + 디스플레이(900). 디스플레이 웨이트가 없어서 위계가 굵기로만
                 만들어지던 것이 이전 디자인이 밋밋했던 원인 중 하나였다. */
              ...[400, 600, 700, 900].map(
                (w) =>
                  `@font-face{font-family:"Pretendard";src:url("${basePath}/fonts/Pretendard-${
                    { 400: "Regular", 600: "SemiBold", 700: "Bold", 900: "Black" }[w]
                  }.woff2") format("woff2");font-weight:${w};font-display:swap}`,
              ),
              /* 수치 전용 가변 서체. wdth 축이 살아 있어 큰 수치를 Expanded 로 뽑을 수 있다.
                 라틴·숫자만 쓰므로 한글 서브셋과 달리 파일이 작다. */
              `@font-face{font-family:"Archivo";src:url("${basePath}/fonts/Archivo-Var.woff2") format("woff2-variations");font-weight:100 900;font-stretch:62% 125%;font-display:swap}`,
              /* 라벨·기간·출처·각주. 시스템 모노는 플랫폼마다 폭이 달라 표가 흔들렸다. */
              `@font-face{font-family:"JetBrains Mono";src:url("${basePath}/fonts/JetBrainsMono-Var.woff2") format("woff2-variations");font-weight:100 800;font-display:swap}`,
            ].join(""),
          }}
        />
        {/* JS가 없거나 실행되지 않은 환경에서 등장 애니메이션 대기 블록이
            백지로 남는 것을 막는다. Framer Motion 이 정적 HTML에 심는
            style="opacity:0" 을 무력화한다. */}
        <noscript
          dangerouslySetInnerHTML={{
            __html:
              '<style>[style*="opacity:0"],[style*="opacity: 0"]{opacity:1!important;transform:none!important}.count-up-visual{display:none!important}.count-up-measure{visibility:visible!important}</style>',
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
          emailSecondary={site.showWorkEmail ? site.emailSecondary : ""}
          showWorkEmail={site.showWorkEmail}
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
