/**
 * 영문판 검사 (2026.09.25) — out/en/ 아래 HTML 에 한국어가 남았는지 본다.
 *
 * 본문 글자와 사람이 읽는 속성(alt · aria-label · title · placeholder)을 모두 본다.
 * 허용하는 한국어는 둘뿐이다 — 이름 "김선일"(영문 이름 옆 병기)과
 * 전환 스위치의 "한국어로 보기"(한국어 화면으로 가는 링크라 한국어로 적는다).
 * 숫자 대조는 번역 단계(scratchpad merge_check)에서 경로별로 했고, 여기서는 화면 결과만 본다.
 *
 *   node scripts/check_en.mjs            (빌드 뒤 out/ 기준)
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = join(process.cwd(), "out", "en");
const ALLOW = ["김선일", "한국어로 보기"];
const HANGUL = /[가-힣ㄱ-ㆎ]+/g;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : name === "index.html" ? [path] : [];
  });
}

function stripAllowed(text) {
  return ALLOW.reduce((acc, word) => acc.split(word).join(""), text);
}

let failures = 0;
const files = walk(ROOT);
for (const file of files) {
  const html = readFileSync(file, "utf8");
  const body = html.slice(html.indexOf("<body"));
  const visible = body
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");
  const text = visible.replace(/<[^>]+>/g, " ");
  const attrs = [...visible.matchAll(/\s(?:alt|aria-label|title|placeholder)="([^"]*)"/g)].map((m) => m[1]);
  const head = html.slice(0, html.indexOf("<body"));
  const headText = [...head.matchAll(/<title>([^<]*)<\/title>|<meta[^>]+(?:name|property)="(?:description|og:title|og:description|twitter:title|twitter:description|og:image:alt)"[^>]+content="([^"]*)"/g)]
    .map((m) => m[1] ?? m[2] ?? "");
  const hits = [
    ...(stripAllowed(text).match(HANGUL) ?? []).map((h) => `본문: ${h}`),
    ...attrs.flatMap((a) => (stripAllowed(a).match(HANGUL) ?? []).map((h) => `속성: ${h} ← "${a.slice(0, 60)}"`)),
    ...headText.flatMap((a) => (stripAllowed(a).match(HANGUL) ?? []).map((h) => `head: ${h} ← "${a.slice(0, 60)}"`)),
  ];
  const rel = relative(process.cwd(), file);
  if (hits.length) {
    failures += hits.length;
    console.log(`FAIL ${rel}`);
    [...new Set(hits)].slice(0, 25).forEach((h) => console.log(`     ${h}`));
  } else {
    console.log(`OK   ${rel}`);
  }
}
console.log(`\n영문판 검사 — 페이지 ${files.length}개 · 한국어 잔존 ${failures}건`);
process.exit(failures ? 1 : 0);
