import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve, join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { checkHome, checkRuntime } from "./release_contract.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = resolve(root, process.env.QA_EXPORT_ROOT || "out");
const args = process.argv.slice(2);
const runtimePath = args.find(a => a.startsWith("--runtime="))?.slice(10);
const reportPath = resolve(root, args.find(a => a.startsWith("--report="))?.slice(9) || "artifacts/release/static.json");
const sha = bytes => createHash("sha256").update(bytes).digest("hex");
const files = dir => readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? files(join(dir, e.name)) : [join(dir, e.name)]).sort();
const fingerprint = sha(files(out).map(f => `${relative(out, f).replaceAll("\\", "/")}\t${sha(readFileSync(f))}`).join("\n"));
if (args.includes("--fingerprint")) { console.log(fingerprint); process.exit(0); }

const failures = checkHome(readFileSync(join(out, "index.html"), "utf8"));
const checks = [];
for (const [script, scriptArgs] of [
  ["validate_export.mjs", ["general"]],
  ["qa_final.mjs", ["general"]],
  ["qa_tone.mjs", ["general"]],
  ["test_tone_headings.mjs", []],
  ["test_release_contract.mjs", []],
  ["test_count_up_fallback.mjs", []],
  /* 머리글 · 메뉴 · 이메일 복사 · 수치 애니메이션 동작 시험(B-14 · 2026-11-04) — 출시 검수에 없어서 9건이 실패한 채 지나갔다 */
  ["qa_interactions.mjs", []],
  /* 사이트 밖 프로필 원문(리멤버 · 사람인 · 잡코리아 · 원티드 · 링크드인)의 숫자 · 표기가 이 빌드와 맞는지(2026-11-13) —
     문서는 빌드에 들어가지 않아 사이트가 바뀌어도 아무 검수에 걸리지 않았다. 붙여넣기 페이지가 낡은 것은 경고로만 남긴다 */
  ["check_platform_copy.mjs", ["--release", "--quiet"]],
  /* 그 검사와 붙여넣기 페이지를 만드는 도구의 회귀 시험 — 숫자 토큰(여 · 부호) · 문서 경계 · 올린 페이지 대조 */
  ["test_platform_copy.mjs", []],
]) {
  const result = spawnSync(process.execPath, [join(root, "scripts", script), ...scriptArgs], { cwd: root, encoding: "utf8", windowsHide: true, env: { ...process.env, QA_EXPORT_ROOT: out } });
  checks.push({ script, exitCode: result.status, output: `${result.stdout || ""}${result.stderr || ""}` });
  if (result.status !== 0) failures.push(`${script} failed`);
}
const pdfs = {};
/* 덱은 일반판에 싣지 않는다(2026-10-31) — 저장소에 있을 때만 대조한다 */
for (const file of ["kim-seonil-resume-public.pdf", "kim-seonil-performance-marketing-portfolio.pdf"].filter((f) => existsSync(join(root, "public", f)))) {
  const sourceHash = sha(readFileSync(join(root, "public", file)));
  const outputHash = sha(readFileSync(join(out, file)));
  pdfs[file] = { sourceHash, outputHash };
  if (sourceHash !== outputHash) failures.push(`${file}: reviewed PDF was replaced during build`);
}
const countUp = readFileSync(join(root, "src/components/CountUpValue.tsx"), "utf8");
for (const token of ["useState(value)", "prefers-reduced-motion: reduce", "document.hidden", "requestAnimationFrame", 'className="count-up-measure"']) {
  if (!countUp.includes(token)) failures.push(`Count-up safety missing: ${token}`);
}
if (runtimePath) {
  const evidence = JSON.parse(readFileSync(resolve(root, runtimePath), "utf8"));
  failures.push(...checkRuntime(evidence, fingerprint));
  for (const screenshot of evidence.visualReview?.screenshots || []) {
    const file = resolve(dirname(resolve(root, runtimePath)), screenshot);
    const bytes = existsSync(file) ? readFileSync(file) : Buffer.alloc(0);
    const png = bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
    const jpeg = bytes.subarray(0, 3).equals(Buffer.from([255,216,255])) && bytes.subarray(-2).equals(Buffer.from([255,217]));
    if (bytes.length < 1000 || !(png && /\.png$/i.test(file) || jpeg && /\.jpe?g$/i.test(file))) failures.push(`Screenshot missing or invalid: ${screenshot}`);
  }
}
if (args.includes("--approve") && !runtimePath) failures.push("Release approval requires fresh browser evidence; static tests alone are insufficient");
const report = { generatedAt: new Date().toISOString(), fingerprint, status: failures.length ? "FAIL" : runtimePath ? "RELEASE_PASS" : "STATIC_PASS_RUNTIME_PENDING", checks, pdfs, failures };
mkdirSync(dirname(reportPath), { recursive: true });
writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(JSON.stringify({ status: report.status, fingerprint, failures, reportPath }, null, 2));
process.exit(failures.length ? 1 : 0);
