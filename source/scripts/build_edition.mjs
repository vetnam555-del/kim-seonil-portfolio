/**
 * 판(edition)별 정적 빌드.
 *   node scripts/build_edition.mjs hll      -> out/  (basePath /kim-seonil-portfolio_HLL)
 *   node scripts/build_edition.mjs general  -> out/  (basePath /kim-seonil-portfolio)
 *
 * 윈도우에서 `EDITION=x npm run ...` 문법이 통하지 않아 env 주입을 여기서 한다.
 * .next 캐시를 판마다 분리한다 — basePath 가 다른데 같은 캐시를 쓰면 이전 판의
 * 자산 경로가 섞여 들어가 /_next/... 가 404 나는 일이 실제로 있었다.
 *
 * 결과물은 항상 out/ 하나다. 두 판을 연달아 빌드할 때는 각 빌드 직후 out/ 을
 * 해당 배포 저장소로 복사해야 한다(build:both 는 그래서 out/ 을 덮어쓴다).
 */
import { spawnSync } from "node:child_process";
import { accessSync, constants, copyFileSync, cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { delimiter, dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const requestedEdition = process.argv[2];
const edition = ["general", "hll", "shinsegae", "ably", "v260908", "nw"].includes(requestedEdition)
  ? requestedEdition
  : "hll";
const env = { ...process.env, EDITION: edition, NEXT_PUBLIC_EDITION: edition };
const resumeSourceArg = process.argv.find((arg) => arg.startsWith("--resume-from="));
const reprintResume = process.argv.includes("--reprint-resume");
const workspace = resolve(fileURLToPath(new URL("..", import.meta.url)));
if (resolve(process.cwd()) !== workspace) {
  throw new Error("Run this script from its source workspace.");
}
if (resumeSourceArg && reprintResume) {
  throw new Error("Choose --resume-from or --reprint-resume, not both.");
}
const resumeSource = resumeSourceArg
  ? resolve(resumeSourceArg.slice("--resume-from=".length))
  : edition === "general" && !reprintResume
    ? resolve("public/kim-seonil-resume-public.pdf")
    : null;
// Validate the reviewed PDF before clearing build output.
if (resumeSource && (!existsSync(resumeSource) || statSync(resumeSource).size < 40 * 1024)) {
  throw new Error(`Reviewed resume PDF is missing or too small: ${resumeSource}`);
}
const pythonPackageCandidates = [
  process.env.PORTFOLIO_PYTHON_PACKAGES,
  join(process.cwd(), "python_build_packages"),
  join(process.cwd(), ".python-packages"),
  join(process.cwd(), ".python-build-packages"),
].filter(Boolean);
const localPythonPackages = pythonPackageCandidates.find((candidate) => {
  try {
    accessSync(join(candidate, "fontTools", "__init__.py"), constants.R_OK);
    return true;
  } catch {
    return false;
  }
});
const bundledPython = join(
  homedir(),
  ".cache",
  "codex-runtimes",
  "codex-primary-runtime",
  "dependencies",
  "python",
  "python.exe",
);
/* 윈도우 밖(클라우드 리눅스 등)에는 py 런처가 없다 — python3 으로 대신한다 */
const python =
  process.env.PYTHON ||
  (existsSync(bundledPython) ? bundledPython : process.platform === "win32" ? "py" : "python3");

if (localPythonPackages) {
  env.PYTHONPATH = [localPythonPackages, process.env.PYTHONPATH].filter(Boolean).join(delimiter);
  console.log(`Python 빌드 패키지: ${localPythonPackages}`);
}

console.log(`\n=== edition: ${edition} ===`);
for (const name of ["out", ".next"]) {
  const target = resolve(workspace, name);
  if (dirname(target) !== workspace) throw new Error(`Unsafe build target: ${target}`);
  rmSync(target, { recursive: true, force: true });
}

const steps = [
  [python, ["scripts/measure_evidence.py"]],
  ["npx", ["next", "build"]],
  ["node", ["scripts/fix_rsc_prefetch.mjs"]],
  ["node", ["scripts/fix_en_lang.mjs"]],
  [python, ["scripts/subset_fonts.py"]],
];

for (const [cmd, args] of steps) {
  const r = spawnSync(cmd, args, { stdio: "inherit", env, shell: true });
  if (r.status !== 0) {
    console.error(`\n[build_edition] 실패: ${cmd} ${args.join(" ")} (exit ${r.status})`);
    process.exit(r.status ?? 1);
  }
}

const ogSource = join(process.cwd(), "assets", "og", edition);
if (!existsSync(join(ogSource, "og-image.png")) || !existsSync(join(ogSource, "og"))) {
  console.error(`\n[build_edition] OG 자산 누락: ${ogSource}`);
  process.exit(1);
}
mkdirSync(join(process.cwd(), "out", "og"), { recursive: true });
cpSync(join(ogSource, "og-image.png"), join(process.cwd(), "out", "og-image.png"));
const projectOgFiles = readdirSync(join(ogSource, "og"), { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name);
for (const fileName of projectOgFiles) {
  cpSync(
    join(ogSource, "og", fileName),
    join(process.cwd(), "out", "og", fileName),
  );
}
console.log(`OG 자산 복원 완료 — ${edition} ${projectOgFiles.length + 1}개`);

/*
 * 일반판은 별도 편집·검수한 PDF를 기본으로 보존한다.
 * 웹 이력서를 새로 인쇄할 때만 --reprint-resume을 명시한다.
 * 나머지 판은 판별 내용이 섞이지 않도록 기존 인쇄 절차를 유지한다.
 * public/ 의 한 파일을 두 판이 공유하던 동안, 사외 지원용인 일반판이 사내 메일과
 * HLL 판 주소가 박힌 PDF 를 내려주고 있었다. OG 자산과 같은 이유로 빌드에 묶는다.
 */
if (resumeSource) {
  if (!existsSync(resumeSource) || statSync(resumeSource).size < 40 * 1024) {
    console.error(`\n[build_edition] 재사용할 이력서 PDF가 없거나 너무 작습니다: ${resumeSource}`);
    process.exit(1);
  }
  copyFileSync(resumeSource, join(process.cwd(), "out", "kim-seonil-resume-public.pdf"));
  console.log(`기존 검증 이력서 PDF 유지 — ${edition} (${resumeSource})`);
} else {
  const resumePdf = spawnSync(process.execPath, ["scripts/print_resume_edition.mjs", edition], {
    stdio: "inherit",
    env,
  });
  if (resumePdf.status !== 0) {
    console.error(`\n[build_edition] 이력서 PDF 인쇄 실패 — ${edition}`);
    process.exit(resumePdf.status ?? 1);
  }
}

/*
 * public/ 에 덱이 둘(공용 33쪽·에이블리 34쪽) 있어 어느 판을 빌드해도 둘 다 실린다.
 * 쓰지 않는 쪽은 6MB 넘는 죽은 파일로 배포 저장소에 남는다. 링크되지 않으니 사람 눈에는
 * 안 보이지만, 판마다 다른 덱을 쓰기로 한 이상 안 쓰는 것은 빼는 게 맞다.
 * 지우기 전에 이 판이 실제로 쓰는 덱이 있는지부터 확인한다 — 없으면 멈춘다.
 */
const decks = {
  ably: "kim-seonil-ably-growth-portfolio.pdf",
  other: "kim-seonil-performance-marketing-portfolio.pdf",
};
const keepDeck = edition === "ably" ? decks.ably : decks.other;
if (!existsSync(join(process.cwd(), "out", keepDeck))) {
  console.error(`
[build_edition] 이 판이 쓸 덱 PDF가 out/ 에 없습니다: ${keepDeck}`);
  process.exit(1);
}
for (const name of Object.values(decks)) {
  if (name === keepDeck) continue;
  const dead = join(process.cwd(), "out", name);
  if (existsSync(dead)) {
    rmSync(dead);
    console.log(`이 판이 쓰지 않는 덱 제거 — ${name}`);
  }
}

const validation = spawnSync(process.execPath, ["scripts/validate_export.mjs", edition], {
  stdio: "inherit",
  env,
});
if (validation.status !== 0) {
  console.error(`\n[build_edition] 정적 배포 검증 실패 — ${edition}`);
  process.exit(validation.status ?? 1);
}
console.log(`\n=== edition ${edition} 빌드 완료 — out/ 확인 ===`);
