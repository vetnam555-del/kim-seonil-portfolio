/**
 * 영문판 공용 상수 (2026.09.25) — 머리글(클라이언트)도 읽으므로 사례 데이터를 끌어오지 않는 작은 파일로 둔다.
 */

/** 영문판이 있는 사례 — 홈 대표 5건 + AI·리포트 자동화. 순서가 곧 '다음 사례' 순서다. */
export const EN_SLUGS = ["jestina", "newbalance", "daekyo", "gangwon", "dyson", "automation"] as const;

/** 이름 — site.nameEn(KIM SEONILL, 본인 확인)과 같은 철자·순서, 대소문자만 바꿨다 */
export const NAME_EN_DISPLAY = "Kim Seonill";
export const ROLE_EN = "Performance Marketer";

/** 한국어 주소 ↔ 영문 주소. 영문판이 없는 한국어 화면은 영문 홈으로 보낸다 */
export function counterpartPath(pathname: string): { ko: string; en: string; isEn: boolean } {
  const path = pathname.endsWith("/") ? pathname : `${pathname}/`;
  const isEn = path === "/en/" || path.startsWith("/en/");
  const koPath = isEn ? path.slice(3) || "/" : path;
  const project = koPath.match(/^\/projects\/([^/]+)\/$/);
  let enPath = "/en/";
  if (project && (EN_SLUGS as readonly string[]).includes(project[1])) enPath = `/en/projects/${project[1]}/`;
  else if (koPath === "/resume/") enPath = "/en/resume/";
  return { ko: koPath, en: isEn ? path : enPath, isEn };
}
