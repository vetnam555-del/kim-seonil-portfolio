import type { NextConfig } from "next";

/**
 * GitHub Pages 프로젝트 페이지는 https://<user>.github.io/<repo>/ 하위 경로로 서비스된다.
 * basePath 없이 빌드하면 /_next/... 절대경로가 도메인 루트를 가리켜 CSS·JS가 전부 404가 된다.
 *
 * 커스텀 도메인(루트 배포)으로 옮길 때는 BASE_PATH를 빈 문자열로 두고 빌드한다.
 *   PowerShell:  $env:BASE_PATH=""; npm run build:full
 */
/**
 * 판(edition)에 따라 basePath 가 달라진다. 한 소스에서 두 사이트를 낸다.
 *   EDITION=hll      -> /kim-seonil-portfolio_HLL  (솔루션팀 지원용)
 *   EDITION=general  -> /kim-seonil-portfolio      (일반 공개용)
 * BASE_PATH 를 직접 주면 그 값이 우선한다(커스텀 도메인 배포용).
 */
/* 판이 넷이 되면서 삼항 사슬이 읽히지 않는다. 표로 바꾼다 —
   판을 하나 더 낼 때 고칠 곳이 두 줄로 끝난다. */
const BASE_PATHS = {
  general: "/kim-seonil-portfolio",
  hll: "/kim-seonil-portfolio_HLL",
  shinsegae: "/kim-seonil-portfolio_shinsegae",
  ably: "/kim-seonil-portfolio_ABLY",
  v260908: "/kim-seonil-portfolio_260908",
  nw: "/kim-seonil-portfolio_new",
} as const;
const requested = process.env.EDITION as keyof typeof BASE_PATHS | undefined;
const edition = requested && requested in BASE_PATHS ? requested : "hll";
const defaultBasePath = BASE_PATHS[edition];
const basePath = process.env.BASE_PATH ?? defaultBasePath;

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  env: { NEXT_PUBLIC_BASE_PATH: basePath, NEXT_PUBLIC_EDITION: edition },
};

export default nextConfig;
