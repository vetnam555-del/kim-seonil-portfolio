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
]) {
  const result = spawnSync(process.execPath, [join(root, "scripts", script), ...scriptArgs], { cwd: root, encoding: "utf8", windowsHide: true, env: { ...process.env, QA_EXPORT_ROOT: out } });
  checks.push({ script, exitCode: result.status, output: `${result.stdout || ""}${result.stderr || ""}` });
  if (result.status !== 0) failures.push(`${script} failed`);
}
const pdfs = {};
for (const file of ["kim-seonil-resume-public.pdf", "kim-seonil-performance-marketing-portfolio.pdf"]) {
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
