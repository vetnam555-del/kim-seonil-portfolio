/**
 * 이력서 PDF(ReportLab)용 데이터를 지금 사이트 원본에서 뽑는다 (2026.10.09, 클라우드 이전).
 *
 *   node scripts/export_resume_data.mjs <출력.json>
 *
 * Drive 의 portfolio-resume-20260924/export-data.mjs 를 옮겼다. 그쪽은 윈도우 경로(C:/Users/…)를
 * 읽었고, 여기서는 이 저장소의 src/data 를 읽는다 — 사이트 문구를 고치면 PDF 도 같은 문장을 쓴다.
 * 일반판 기준으로 뽑는다(EDITION=general).
 */
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const out = process.argv[2];
if (!out) {
  console.error("사용: node scripts/export_resume_data.mjs <출력.json>");
  process.exit(1);
}
const source = resolve(fileURLToPath(new URL("..", import.meta.url)));
const dest = mkdtempSync(join(tmpdir(), "resume-data-"));
try {
  for (const name of ["edition", "site", "projects"]) {
    const input = readFileSync(join(source, "src/data", `${name}.ts`), "utf8");
    const js = ts
      .transpileModule(input, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } })
      .outputText.replaceAll('"./edition"', '"./edition.mjs"')
      .replaceAll('"@/data/edition"', '"./edition.mjs"')
      .replaceAll('"./projects"', '"./projects.mjs"');
    writeFileSync(join(dest, `${name}.mjs`), js);
  }
  process.env.EDITION = "general";
  process.env.NEXT_PUBLIC_EDITION = "general";
  const s = await import(pathToFileURL(join(dest, "site.mjs")).href);
  const p = await import(pathToFileURL(join(dest, "projects.mjs")).href);
  const keys = [
    "generalProfile", "generalCover", "careerNarrative", "careerSummary", "career", "education", "educationCaption",
    "awards", "awardsArchive", "activities", "skills", "skillLevels", "certifications", "verification", "publicWork",
  ];
  const result = Object.fromEntries(keys.map((k) => [k, s[k]]));
  const { name, nameEn, role, org, email, linkedin, url } = s.site;
  result.site = { name, nameEn, role, org, email, linkedin, url };
  result.careerYear = s.careerYear();
  result.projects = p.projects;
  result.otherResults = p.otherResults;
  result.otherBrands = p.otherBrands;
  writeFileSync(out, JSON.stringify(result, null, 2));
  console.log(`[export_resume_data] ${Object.keys(result).length}개 항목 → ${out} (career[0].period = ${result.career[0].period})`);
} finally {
  rmSync(dest, { recursive: true, force: true });
}
