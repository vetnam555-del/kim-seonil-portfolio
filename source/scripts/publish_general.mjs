/**
 * 일반판을 빌드해 이 저장소 루트(GitHub Pages 배포 위치)에 반영한다 (2026.10.01, 클라우드 이전).
 *
 *   node scripts/publish_general.mjs           빌드 → 루트와 비교 → 루트 갈아 끼우기
 *   node scripts/publish_general.mjs --check   빌드 없이 지금 out/ 과 루트의 차이만 본다
 *
 * 로컬 PC 시절에는 out/ 을 별도 폴더(portfolio-github-sync)로 복사했다(sync_general_site.py).
 * 이제 소스는 배포 저장소 안 source/ 에 함께 있으므로 저장소 루트가 곧 배포 위치다.
 * 루트에서 지키는 것은 KEEP 뿐이고, 나머지 루트 파일은 모두 빌드 산출물로 보고 out/ 으로 바꾼다.
 * commit · push 는 하지 않는다 — 차이를 보고 사람이(또는 Claude 가) 한다.
 * 그 밖의 인자(--reprint-resume 등)는 build_edition.mjs 로 그대로 넘긴다.
 */
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { cpSync, existsSync, readdirSync, readFileSync, rmSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const source = resolve(fileURLToPath(new URL("..", import.meta.url)));
const site = dirname(source);
const out = join(source, "out");
const KEEP = new Set([".git", ".github", ".claude", ".gitignore", "CLAUDE.md", "README.md", "source"]);
const args = process.argv.slice(2);
const checkOnly = args.includes("--check");

if (!existsSync(join(site, ".git")) || !existsSync(join(site, "source", "package.json"))) {
  console.error(`[publish] 배포 저장소 루트를 찾지 못했다: ${site}`);
  process.exit(1);
}

if (!checkOnly) {
  const build = spawnSync(process.execPath, ["scripts/build_edition.mjs", "general", ...args], {
    cwd: source,
    stdio: "inherit",
  });
  if (build.status !== 0) process.exit(build.status ?? 1);
}
if (!existsSync(join(out, "index.html"))) {
  console.error("[publish] out/index.html 이 없다 — 먼저 빌드한다");
  process.exit(1);
}
/* out/ 에 다른 판(hll 등)이 남아 있으면 루트를 그 판으로 덮게 된다 — 일반판 주소인지 먼저 본다 */
if (!readFileSync(join(out, "index.html"), "utf8").includes("/kim-seonil-portfolio/_next/")) {
  console.error("[publish] out/ 이 일반판 빌드가 아니다 — npm run publish:general 로 다시 빌드한다");
  process.exit(1);
}

/** 루트 기준 상대경로 → 절대경로. 맨 위 단계에서 KEEP 은 건너뛴다 */
function listFiles(base, skipTop = new Set()) {
  const found = new Map();
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (dir === base && skipTop.has(entry.name)) continue;
      const path = join(dir, entry.name);
      if (entry.isDirectory()) walk(path);
      else found.set(relative(base, path).split(sep).join("/"), path);
    }
  };
  walk(base);
  return found;
}

const sha = (path) => createHash("sha1").update(readFileSync(path)).digest("hex");

/** 화면에 보이는 글자만 줄 단위로 — 빌드 해시처럼 보이지 않는 차이는 무시한다 */
function visibleLines(path) {
  return readFileSync(path, "utf8")
    .replace(/<(script|style|noscript)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>|<\/(p|div|li|span|h\d|dt|dd|section|article|figcaption|td|th)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .split("\n")
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

/*
 * 순서를 지키는 줄 단위 비교(LCS). 줄이 있는지만 보면 'A 100 / B 200' 이 'A 200 / B 100' 으로
 * 바뀌거나 같은 문단 하나가 빠져도 변경 0 으로 보인다 (2026.10.01 자비스 검토 P3).
 */
function lineDiff(a, b) {
  const n = a.length;
  const m = b.length;
  const width = m + 1;
  const lcs = new Uint32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i -= 1) {
    for (let j = m - 1; j >= 0; j -= 1) {
      lcs[i * width + j] = a[i] === b[j] ? lcs[(i + 1) * width + j + 1] + 1 : Math.max(lcs[(i + 1) * width + j], lcs[i * width + j + 1]);
    }
  }
  const edits = [];
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      i += 1;
      j += 1;
    } else if (j < m && (i === n || lcs[i * width + j + 1] >= lcs[(i + 1) * width + j])) {
      edits.push(`+ ${b[j]}`);
      j += 1;
    } else {
      edits.push(`- ${a[i]}`);
      i += 1;
    }
  }
  return edits;
}

const current = listFiles(site, KEEP);
const next = listFiles(out);
const added = [...next.keys()].filter((k) => !current.has(k));
const removed = [...current.keys()].filter((k) => !next.has(k));
const changed = [...next.keys()].filter((k) => current.has(k) && sha(current.get(k)) !== sha(next.get(k)));

console.log(`\n[publish] 루트 대비 — 추가 ${added.length} · 삭제 ${removed.length} · 변경 ${changed.length}`);
let pagesChanged = 0;
for (const rel of [...changed, ...added].filter((k) => k.endsWith(".html")).sort()) {
  const before = current.has(rel) ? visibleLines(current.get(rel)) : [];
  const edits = lineDiff(before, visibleLines(next.get(rel)));
  if (!edits.length) continue;
  pagesChanged += 1;
  console.log(`\n  [글자 바뀜] ${rel} · ${edits.length}줄`);
  for (const edit of edits.slice(0, 16)) console.log(`    ${edit.slice(0, 152)}`);
}
console.log(`\n[publish] 보이는 글자가 바뀐 페이지 ${pagesChanged}개`);
for (const rel of removed.slice(0, 20)) console.log(`  삭제될 파일: ${rel}`);

if (checkOnly) process.exit(0);

for (const name of readdirSync(out)) {
  if (KEEP.has(name)) {
    console.error(`[publish] out/ 에 지켜야 할 이름이 있다: ${name} — 중단`);
    process.exit(1);
  }
}
/*
 * 지우는 것은 git 에 커밋된 배포물뿐이어야 한다 (2026.10.01 자비스 검토 P2).
 * 배포 폴더가 따로 있던 때와 달리 여기는 작업 저장소라, 루트에 메모·임시 파일이 생길 수 있다.
 * KEEP 밖에 커밋 안 된 변경·새 파일·무시된 파일이 하나라도 있으면 지우기 전에 멈춘다 —
 * 그러면 아래에서 지우는 것은 전부 git 에서 되살릴 수 있다.
 */
const status = spawnSync(
  "git",
  ["status", "--porcelain", "--untracked-files=all", "--ignored", "--", ".", ...[...KEEP].map((name) => `:(exclude)${name}`)],
  { cwd: site, encoding: "utf8" },
);
if (status.status !== 0) {
  console.error(`[publish] git status 를 읽지 못했다 — 중단\n${status.stderr ?? ""}`);
  process.exit(1);
}
const dirty = status.stdout.split("\n").filter(Boolean);
if (dirty.length) {
  console.error("[publish] 루트에 커밋되지 않은 파일이 있다 — 배포물이 아닐 수 있어 지우지 않고 멈춘다:");
  for (const line of dirty.slice(0, 20)) console.error(`  ${line}`);
  console.error("  옮기거나 커밋(또는 git restore)한 뒤 다시 실행한다.");
  process.exit(1);
}
for (const name of readdirSync(site)) {
  if (!KEEP.has(name)) rmSync(join(site, name), { recursive: true, force: true });
}
for (const name of readdirSync(out)) {
  cpSync(join(out, name), join(site, name), { recursive: true });
}
const top = readdirSync(site).filter((name) => !KEEP.has(name)).length;
console.log(`\n[publish] 루트 갱신 완료 — 최상위 항목 ${top}개. git status 로 확인한 뒤 commit · push 한다.`);
