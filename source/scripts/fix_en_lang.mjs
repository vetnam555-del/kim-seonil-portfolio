/**
 * 영문판 문서 언어 (2026.09.25).
 *
 * 레이아웃이 한 벌이라 정적 HTML 은 모두 <html lang="ko"> 로 나간다. 영문 화면은 스크립트가 돈 뒤에야
 * lang="en" 으로 바뀌어서, 그 전까지 브라우저가 한국어 문서로 읽고 번역 제안을 띄울 수 있었다.
 * 레퍼런스(dainahys)는 영문 화면을 처음부터 lang="en" 으로 낸다 — 빌드 산출물에서 같게 맞춘다.
 * 프로덕션 React 는 html 속성 차이로 수화를 깨지 않고, SiteChrome 의 HtmlLang 도 같은 값을 넣는다.
 */
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = join(process.cwd(), "out", "en");
if (!existsSync(ROOT)) {
  console.log("영문판 없음 — 건너뜀");
  process.exit(0);
}

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : name.endsWith(".html") ? [path] : [];
  });
}

let changed = 0;
for (const file of walk(ROOT)) {
  const html = readFileSync(file, "utf8");
  const next = html.replace(/<html lang="ko"/, '<html lang="en"');
  if (next !== html) {
    writeFileSync(file, next);
    changed += 1;
  }
}
console.log(`영문판 문서 언어 — lang="en" ${changed}개 파일`);
