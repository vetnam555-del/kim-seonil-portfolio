/**
 * 포트폴리오의 공개 정보를 마크다운 지식 문서로 뽑는다 (2026.11.16 · 주인 "makefair 에도 내 포트폴리오 정보를 모두 저장해줘").
 *
 *   node scripts/export_knowledge.mjs <출력 폴더>      예: node scripts/export_knowledge.mjs ../../makefair/portfolio
 *
 * 원본은 이 저장소의 src/data 다(사이트 · 이력서 PDF 와 같은 문장). 사이트를 고친 뒤 다시 돌려 지식 허브를 맞춘다.
 * 일반판(EDITION=general) 기준이다 — 사이트에 실제로 공개된 것만 옮긴다.
 *
 * 옮기지 않는 것: 지원처별 판(사내 · 지원처 전용 문구 — site.ts 의 ably · hll · shinsegae … 값), 포트폴리오 PDF(헤드헌터에게만),
 * 붙여넣기 페이지의 주인 메모, 작업 기록(BACKLOG · HANDOFF). 전화번호 · 주소 · 생년월일은 원본에도 없다.
 * 채용 플랫폼 · 링크드인 프로필 원문(JOB_PLATFORMS.md · LINKEDIN.md)도 옮기지 않는다(2026-11-17 최종 검토) — 플랫폼별 진행 상태 · 구직 설정 같은
 * 작업 메모가 들어 있고, 이 저장소에서도 사이트로는 내보내지 않는 자료다(health 가 source/ 가 사이트에서 열리면 결함으로 본다).
 * 허브 저장소가 웹사이트로 열리면 검색에 걸리는 쪽이 된다. 처음 판(11-16)은 profiles/ 로 옮겼다가 뺐다.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import ts from "typescript";

const out = process.argv[2];
if (!out) {
  console.error("사용: node scripts/export_knowledge.mjs <출력 폴더>");
  process.exit(1);
}
const source = resolve(fileURLToPath(new URL("..", import.meta.url)));
const SITE = "https://vetnam555-del.github.io/kim-seonil-portfolio";

/* ── 원본 불러오기: TS 를 그대로 옮겨 읽는다(export_resume_data.mjs 와 같은 방식) ── */
const tmp = mkdtempSync(join(tmpdir(), "knowledge-"));
/* en/home.en — 2026.11.18 영문 이력서 머리 한 줄 · 세 칸이 표지 문장(coverEn)을 읽는다 */
const FILES = ["edition", "site", "projects", "caseLedes", "caseCards", "en/meta", "en/home.en", "en/resume.en", "en/caseLedes.en"];
function rewrite(js, from) {
  return js.replace(/from\s+"(@\/data\/|\.\.?\/)([^"]+)"/g, (m, pre, rest) => {
    const target = pre === "@/data/" ? rest : join(dirname(from), pre + rest).replace(/\\/g, "/");
    const rel = (from.includes("/") ? "../" : "./") + target;
    return `from "${rel.replace(/^\.\.\/en\//, "./")}.mjs"`;
  });
}
for (const f of FILES) {
  const input = readFileSync(join(source, "src/data", `${f}.ts`), "utf8");
  const js = ts.transpileModule(input, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } }).outputText;
  mkdirSync(dirname(join(tmp, `${f}.mjs`)), { recursive: true });
  writeFileSync(join(tmp, `${f}.mjs`), rewrite(js, f));
}
process.env.EDITION = "general";
process.env.NEXT_PUBLIC_EDITION = "general";
const load = (f) => import(pathToFileURL(join(tmp, `${f}.mjs`)).href);
const S = await load("site");
const { projects } = await load("projects");
const { caseLedes } = await load("caseLedes");
const { caseCards } = await load("caseCards");
const { EN_SLUGS } = await load("en/meta");
const R = await load("en/resume.en");
const { caseLedesEn } = await load("en/caseLedes.en");
const enTable = JSON.parse(readFileSync(join(source, "src/data/en/projects.en.json"), "utf8"));
rmSync(tmp, { recursive: true, force: true });

/* 영문 사례 — projects.en.ts 와 같은 규칙(한국어 원본 복제 + 경로별 문장 교체) */
function setPath(root, path, value) {
  const keys = path.match(/[^.[\]]+/g) ?? [];
  let node = root;
  keys.forEach((k, i) => {
    if (!(k in node)) throw new Error(`영문 경로 없음: ${path}`);
    if (i === keys.length - 1) node[k] = value;
    else node = node[k];
  });
}
const projectsEn = EN_SLUGS.map((slug) => {
  const copy = structuredClone(projects.find((p) => p.slug === slug));
  for (const [path, value] of Object.entries(enTable[slug] ?? {})) setPath(copy, path, value);
  return copy;
});

/* ── 마크다운 도우미 ── */
const t = (s) => String(s ?? "").replace(/⁠/g, "").replace(/ /g, " ").trim();
const bullets = (arr) => (arr ?? []).filter(Boolean).map((x) => `- ${t(x)}`).join("\n");
const cell = (s) => t(s).replace(/\|/g, "\\|").replace(/\n/g, " ");
const table = (head, rows) => [`| ${head.map(cell).join(" | ")} |`, `|${head.map(() => "---").join("|")}|`, ...rows.map((r) => `| ${r.map(cell).join(" | ")} |`)].join("\n");
const metric = (m) => `${m.before && m.before !== "기준" ? `${t(m.before)} → ` : ""}${t(m.after)}`;
const img = (file) => `${SITE}/evidence/${file}`;
const write = (rel, body) => {
  const p = join(out, rel);
  mkdirSync(dirname(p), { recursive: true });
  writeFileSync(p, body.replace(/\n{3,}/g, "\n\n").trimEnd() + "\n");
};

function framework(f, lang) {
  const L = [];
  L.push(`### ${t(f.title)}`);
  if (f.description) L.push(t(f.description));
  if (f.collapsed) L.push(lang === "en" ? "_(Plan written before execution — folded on the site)_" : "_(실행 전 기획안 — 사이트에서는 접혀 있다)_");
  if (f.variant === "table" && f.columns && f.rows) L.push(table([f.rowHeader ?? (lang === "en" ? "Item" : "구분"), ...f.columns], f.rows.map((r) => [r.label, ...r.cells])));
  else if ((f.variant === "flow" || f.variant === "steps") && f.items) L.push(f.items.map((it, i) => `${i + 1}. **${t(it.label)}**${it.body ? ` — ${t(it.body)}` : ""}${it.state === "designed" ? (lang === "en" ? " _(designed)_" : " _(설계만)_") : ""}`).join("\n"));
  else if (f.variant === "diagnostic" && f.items) L.push(f.items.map((it, i) => `${i + 1}. **${t(it.label)}**\n${(it.bullets ?? []).map((b) => `   - ${t(b)}`).join("\n")}`).join("\n"));
  else if (f.variant === "split" && f.split) L.push(`- **${t(f.split.total.label)}** — ${t(f.split.total.note)}\n${f.split.parts.map((p) => `  - **${t(p.label)}**${p.accent ? " ★" : ""} — ${t(p.note)}`).join("\n")}`);
  else if (f.variant === "compare" && f.compare) L.push(f.compare.map((g) => `- **${t(g.metric)}** (${g.better === "high" ? (lang === "en" ? "higher is better" : "높을수록 좋음") : (lang === "en" ? "lower is better" : "낮을수록 좋음")}): ${g.items.map((it) => `${t(it.name)} ${t(it.display)}`).join(" · ")}`).join("\n"));
  else if (f.variant === "schematic" && f.schematic) L.push(f.schematic.columns.map((c) => `- **${t(c.title)}** — ${t(c.note)}${c.rows?.length ? ` (${c.rows.map((r) => t(r.cap)).join(" / ")})` : ""}`).join("\n") + "\n" + f.schematic.legend.map((l) => `  - ${t(l.label)}`).join("\n"));
  if (f.legend) L.push(`> ${t(f.legend)}`);
  return L.join("\n\n");
}

function caseDoc(p, lang, ledes) {
  const en = lang === "en";
  const d = p.detail;
  const card = en ? null : caseCards[p.slug];
  const url = `${SITE}${en ? "/en" : ""}/projects/${p.slug}/`;
  const L = [];
  L.push(`# ${t(p.brand)} — ${t(p.headline)}`);
  L.push(`> ${t(p.tldr)}`);
  L.push(table(en ? ["Item", "Value"] : ["항목", "값"], [
    [en ? "Page" : "사이트", url],
    [en ? "Industry" : "업종", p.industry],
    [en ? "Period" : "기간", p.period],
    [en ? "Role" : "역할", p.role],
    [en ? "Contribution" : "기여", p.contributionNote ?? `${p.contribution}%`],
    [en ? "Channels" : "채널", (p.channels ?? []).join(" · ")],
    [en ? "Categories" : "분류", (p.categories ?? []).join(" · ")],
    [en ? "Evidence" : "증빙 성격", p.evidenceLabel ?? ""],
    ...(card ? [["기준(카드)", card.basis], ["기여 범위(카드)", card.scope], ...(card.award ? [["외부 인정", card.award]] : [])] : []),
  ]));
  L.push(`## ${en ? "Key metric" : "대표 수치"}\n\n**${t(p.keyMetric.label)}: ${metric(p.keyMetric)}**${p.keyMetric.note ? `\n\n${t(p.keyMetric.note)}` : ""}`);
  if (p.objective) L.push(`## ${en ? "Goal" : "목표"}\n\n${t(p.objective)}`);
  if (p.cardProblem || p.cardDecision || p.decisionResult) {
    L.push(`## ${en ? "Problem · What I did · Result" : "문제 · 한 일 · 성과"}`);
    if (p.cardProblem) L.push(`- **${en ? "Problem" : "문제"}** — ${t(p.cardProblem)}`);
    if (p.cardDecision) L.push(`- **${en ? "What I did" : "한 일"}** — ${t(p.cardDecision)}`);
    if (p.decisionResult) L.push(`- **${en ? "Result" : "성과"}** — ${t(p.decisionResult.result)}\n- **${en ? "Scope of reading" : "해석 범위"}** — ${t(p.decisionResult.boundary)}`);
  }
  const block = (title, lede, body) => { if (body) L.push(`## ${title}${lede ? `\n\n_${t(lede)}_` : ""}\n\n${body}`); };
  /*
   * 도식 · 표는 사이트와 같은 자리에 둔다(CaseView.tsx) — placement 가 있으면 그 단, KPI 표는 KPI 설계, 나머지는 실행(접힌 기획안은 끝).
   * 처음 판은 전부 결과 아래에 늘어놓아 'KPI 재정의' 같은 판단 단계의 표가 결과처럼 읽혔다(2026-11-17 최종 검토).
   */
  const fw = d.frameworks ?? [];
  const showKpi = Boolean(d.kpi);
  const join2 = (...parts) => parts.flat().filter(Boolean).join("\n\n");
  const placed = (pl) => fw.filter((f) => f.placement === pl).map((f) => framework(f, lang));
  const kpiTables = fw.filter((f) => f.kpi && !f.collapsed);
  const execFw = fw.filter((f) => !(showKpi && f.kpi) && !f.placement);
  const decisionLog = p.decisions?.length ? `### ${en ? "Decision log" : "판단 기록"}\n\n${table(en ? ["Decision", "Basis", "Rejected option"] : ["결정", "근거", "택하지 않은 안"], p.decisions.map((x) => [x.decision, x.basis, x.rejected]))}` : "";
  block(en ? "Problem" : "문제 정의", ledes.problem, [d.overview, d.challenge].filter(Boolean).map(t).join("\n\n"));
  block(en ? "What the data showed" : "데이터에서 확인한 것", ledes.analysis, join2(d.dataAnalysis ? t(d.dataAnalysis) : "", placed("analysis")));
  block(en ? "Core decision" : "핵심 판단", ledes.strategy, join2(d.strategy ? t(d.strategy) : "", decisionLog, placed("strategy")));
  if (showKpi) {
    const body = kpiTables.length
      ? join2(kpiTables.map((f) => framework(f, lang)))
      : join2(d.kpi.title ? `**${t(d.kpi.title)}**` : "", d.kpi.description ? t(d.kpi.description) : "", table(en ? ["Stage", "What to check", "Metrics"] : ["단계", "확인할 것", "지표"], d.kpi.stages.map((x) => [x.stage, x.check ?? "", x.labels.join(" · ")])));
    block(en ? "KPI design" : "KPI 설계", "", body);
  }
  block(en ? "Execution" : "실행", "", join2(bullets(d.execution), execFw.filter((f) => !f.collapsed).map((f) => framework(f, lang)), execFw.filter((f) => f.collapsed).map((f) => framework(f, lang))));
  const chain = showKpi
    ? join2(`**${en ? "Read stage by stage" : "단계별로 이어 읽기"}**`, table(en ? ["Stage", "Metric", "Value"] : ["단계", "지표", "값"], d.kpi.stages.flatMap((x) => x.labels.map((label) => { const m = d.results.find((r) => r.label === label); return [x.stage, label, m ? metric(m) : ""]; }))), d.kpi.note ? `> ${t(d.kpi.note)}` : "")
    : "";
  block(en ? "Results" : "결과", ledes.results, join2(chain, table(en ? ["Metric", "Value", "Basis"] : ["지표", "값", "기준"], d.results.map((m) => [m.label, metric(m), m.note ?? ""])), placed("results")));
  if (d.contribution || d.roleBreakdown) {
    const rb = d.roleBreakdown;
    block(en ? "My role" : "나의 역할", "", [d.contribution ? t(d.contribution) : "", rb ? [[en ? "Did myself" : "직접 수행", rb.direct], [en ? "Did with others" : "함께 수행", rb.shared], [en ? "Did not do" : "하지 않은 것", rb.notDone]].filter(([, v]) => v?.length).map(([k, v]) => `**${k}**\n${bullets(v)}`).join("\n\n") : ""].filter(Boolean).join("\n\n"));
  }
  block(en ? "Failure and lessons" : "실패와 배운 것", ledes.learning, [d.failure ? `**${en ? "What didn't work" : "되지 않았던 것"}** — ${t(d.failure)}` : "", d.learnings ? `**${en ? "Lesson" : "배운 것"}** — ${t(d.learnings)}` : ""].filter(Boolean).join("\n\n"));
  if (d.evidence?.length) {
    L.push(`## ${en ? "Evidence" : "증빙"}`);
    for (const e of d.evidence) {
      L.push([`### ${t(e.title ?? e.alt.split(/—|:\s|\.(?=\s|$)/)[0])}`, e.group ? `_${t(e.group)}_` : "", e.role ? `${en ? "Scope" : "담당 범위"}: ${t(e.role)}` : "", t(e.caption), `![${cell(e.alt)}](${img(e.file)})`, e.video ? `${en ? "Video" : "영상"}: ${img(e.video)}` : "", e.href ? `${en ? "Source" : "원문"}: ${e.href}` : "", e.callouts?.length ? bullets(e.callouts) : ""].filter(Boolean).join("\n\n"));
    }
  }
  if (d.evidenceLinks?.length) L.push(`## ${en ? "External links" : "외부 자료"}\n\n${d.evidenceLinks.map((x) => `- [${t(x.title)}](${x.href}) — ${t(x.note)}`).join("\n")}`);
  if (d.evidenceNote) L.push(`> ${t(d.evidenceNote)}`);
  if (d.source) L.push(`## ${en ? "Sources and basis" : "근거와 산정 기준"}\n\n${t(d.source)}`);
  return L.join("\n\n");
}

/* 이 스크립트가 만드는 폴더 · 파일만 지우고 다시 쓴다 — 더는 만들지 않는 문서(예: profiles/)가 남지 않게 */
for (const stale of ["cases", "en", "profiles", "profile.md", "automation.md", "README.md"]) rmSync(join(out, stale), { recursive: true, force: true });

/* ── 사례 ── */
const order = ["jestina", "newbalance", "daekyo", "gangwon", "dyson", "automation", "edith", "hanssem", "ktalpha"];
const ko = order.map((s) => projects.find((p) => p.slug === s)).filter(Boolean);
if (ko.length !== projects.length) throw new Error(`사례 수가 다르다: ${ko.length} / ${projects.length} — order 를 고친다`);
ko.forEach((p, i) => write(`cases/${String(i + 1).padStart(2, "0")}-${p.slug}.md`, caseDoc(p, "ko", caseLedes[p.slug] ?? {})));
projectsEn.forEach((p) => write(`en/cases/${p.slug}.md`, caseDoc(p, "en", caseLedesEn[p.slug] ?? {})));

/* ── 프로필 · 이력 ── */
const gp = S.generalProfile, gc = S.generalCover, site = S.site;
const P = [];
P.push(`# ${site.name} (${site.nameEn}) — ${site.role}`);
P.push(table(["항목", "값"], [["지금", site.org], ["이메일", site.emailPrimary], ["포트폴리오", site.url], ["링크드인", site.linkedin], ["공개용 이력서 PDF", `${SITE}${site.resumePdfPath}`]]));
P.push(`## 한 줄 소개\n\n**${gc.display.join(" ")}** — ${gc.statement.join(" ")}\n\n${t(gc.note)}`);
P.push(`## 첫 화면의 결과 세 칸\n\n${table(["지표", "값", "기준"], gc.proof.map((x) => [x.label, `${x.before ? `${t(x.before)} ` : ""}${t(x.after)}`, x.basis]))}`);
P.push(`## 소개\n\n${t(gp.intro)}\n\n**${t(gp.interestLabel)}**: ${gp.interests.join(" · ")}`);
P.push(`## 경력 이야기\n\n${S.careerNarrative.map(t).join("\n\n")}`);
P.push(`## 경력 요약\n\n${t(S.careerSummary.intro)}\n\n${S.careerSummary.columns.map((c) => `**${t(c.title)}**\n${bullets(c.items)}`).join("\n\n")}${S.careerSummary.highlights?.length ? `\n\n${table(["축", "내용"], S.careerSummary.highlights.map((h) => [h.axis, h.body]))}` : ""}`);
P.push(`## 경력\n\n${S.career.map((c) => [`### ${t(c.company)}${c.group ? ` (${t(c.group)})` : ""} · ${t(c.title)} · ${t(c.period)}`, t(c.summary), bullets(c.work), c.clients ? `담당: ${t(c.clients)}` : "", c.highlight ? `**${t(c.highlight)}**` : ""].filter(Boolean).join("\n\n")).join("\n\n")}`);
P.push(`## 학력\n\n${table(["기간", "학교", "전공"], S.education.map((e) => [e.period, e.school, e.major]))}\n\n${t(S.educationCaption)}`);
P.push(`## 수상\n\n${table(["연도", "이름", "내용"], S.awards.map((a) => [a.year, a.name, a.detail]))}\n\n### 그 밖의 수상 · 선정\n\n${table(["연도", "내용"], S.awardsArchive.map((a) => [a.year, a.items]))}`);
P.push(`## 자격증\n\n${table(["이름", "취득"], S.certifications.map((c) => [c.name, c.when]))}`);
P.push(`## 교육 · 활동\n\n${table(["기간", "이름", "내용"], S.activities.map((a) => [a.period, a.name, a.detail]))}`);
P.push(`## 보유 역량\n\n${table(["수준", "뜻"], S.skillLevels.map((l) => [l.level, l.desc]))}\n\n${S.skills.map((g) => [`### ${t(g.category)}`, g.rows.map((r) => `**${t(r.level)}**: ${r.items.map(t).join(" · ")}${r.note ? ` (${t(r.note)})` : ""}`).join("\n\n"), g.proof?.length ? `근거\n${bullets(g.proof)}` : ""].filter(Boolean).join("\n\n")).join("\n\n")}`);
P.push(`## 외부 확인 자료\n\n${S.verification.map((v) => `- **${t(v.title)}** — ${t(v.desc)} [${t(v.label ?? v.href)}](${v.href})`).join("\n")}`);
P.push(`## 공개 작업물\n\n${S.publicWork.map((w) => `### ${t(w.title)}\n\n_${t(w.label)}_\n\n${t(w.desc)}\n\n${bullets(w.facts)}\n\n${w.href}`).join("\n\n")}`);
P.push(`## 맺음\n\n**${S.contact.title.join(" ")}**\n\n${t(S.contact.desc)}\n\n${t(S.contact.interviewNote)}`);
write("profile.md", P.join("\n\n"));

/* 자동화 */
const A = [`# 자동화 6종`, ...S.builtGroups.map((g) => `## ${t(g.title)}\n\n${t(g.desc)}\n\n${g.members.map((no) => {
  const c = S.automationCases.find((x) => x.no === no);
  return c ? [`### ${c.no} ${t(c.name)}`, `- **문제** — ${t(c.problem)}`, `- **자동화** — ${t(c.automated)}`, c.effect ? `- **효과** — ${t(c.effect)}` : "", c.quality ? `- **안전장치** — ${t(c.quality)}` : "", c.tools?.length ? `- **도구** — ${c.tools.join(" · ")}` : ""].filter(Boolean).join("\n") : "";
}).join("\n\n")}`)];
write("automation.md", A.join("\n\n"));

/* 영문 프로필 */
const E = [`# Kim Seonill — Performance Marketer`, `## Story\n\n${R.narrativeEn.map(t).join("\n\n")}`];
if (R.summaryEn?.intro) E.push(`## Summary\n\n${t(R.summaryEn.intro)}${R.summaryEn.columns ? `\n\n${R.summaryEn.columns.map((c) => `**${t(c.title)}**\n${bullets(c.items)}`).join("\n\n")}` : ""}`);
E.push(`## Experience\n\n${R.careerEn.map((c) => [`### ${t(c.company)} · ${t(c.title)} · ${t(c.period)}`, t(c.summary), bullets(c.work)].filter(Boolean).join("\n\n")).join("\n\n")}`);
E.push(`## Education\n\n${table(["Period", "School", "Major"], R.educationEn.map((e) => [e.period, e.school, e.major ?? ""]))}`);
E.push(`## Skills\n\n${table(["Level", "Meaning"], R.skillLevelsEn.map((l) => [l.level, l.desc]))}\n\n${R.skillsEn.map((g) => `### ${t(g.category)}\n\n${g.rows.map((r) => `**${t(r.level)}**: ${r.items.map(t).join(" · ")}${r.note ? ` (${t(r.note)})` : ""}`).join("\n\n")}`).join("\n\n")}`);
E.push(`## Public work\n\n${R.publicWorkEn.map((w) => `### ${t(w.title)}\n\n${t(w.desc)}\n\n${bullets(w.facts)}\n\n${w.href}`).join("\n\n")}`);
write("en/profile.md", E.join("\n\n"));

/* 안내 */
/* 대표 수치는 홈 카드 · 사례 첫 화면과 같은 값(caseCards)이 있으면 그것을 쓴다 */
const headMetric = (p) => { const c = caseCards[p.slug]; const m = c?.metric ?? (c ? { ...p.keyMetric, label: c.label ?? p.keyMetric.label } : p.keyMetric); return `${cell(m.label)}: ${cell(metric(m))}`; };
const caseRow = (p, i) => `| ${String(i + 1).padStart(2, "0")} | [${t(p.brand)}](cases/${String(i + 1).padStart(2, "0")}-${p.slug}.md) | ${headMetric(p)} | ${cell(p.period)} | ${cell(p.contributionNote ?? `${p.contribution}%`)} |`;
write("README.md", [
  `# ${site.name} · ${site.role} — 포트폴리오 지식 문서`,
  `퍼포먼스 마케터 김선일의 포트폴리오에 공개된 내용을 한곳에 모은 문서다. 원본은 포트폴리오 사이트(${site.url})이고, 이 폴더는 그 사이트의 원본 데이터에서 그대로 뽑아 만든다 — 문장과 숫자가 사이트 · 공개용 이력서와 같다.`,
  `| 문서 | 내용 |\n|---|---|\n| [profile.md](profile.md) | 소개 · 경력 · 학력 · 수상 · 자격증 · 교육 · 보유 역량 · 외부 확인 자료 · 공개 작업물 |\n| [automation.md](automation.md) | 자동화 6종 — 문제 · 자동화 · 효과 · 도구 |\n| [cases/](cases/) | 사례 ${ko.length}건 전문 — 문제 · 데이터 · 판단 · KPI · 실행 · 결과 · 역할 · 실패와 배운 것 · 증빙 · 근거 |\n| [en/](en/) | 영문 프로필과 영문 사례 ${projectsEn.length}건 |`,
  `## 사례\n\n| # | 사례 | 대표 수치 | 기간 | 기여 |\n|---|---|---|---|---|\n${ko.map(caseRow).join("\n")}`,
  `## 링크\n\n- 포트폴리오: ${site.url}\n- 영문: ${SITE}/en/\n- 공개용 이력서 PDF: ${SITE}${site.resumePdfPath}\n- 링크드인: ${site.linkedin}\n- 이메일: ${site.emailPrimary}`,
  `## 표기 원칙\n\n- 숫자는 기준(기간 · 집계 출처)과 함께 쓴다. 기준이 다른 값은 한 문장에 합치지 않는다.\n- 기여도는 사례마다 적은 업무 범위 기준이다(100% 단독 · 35–75% 팀 안에서 전략 · 분석 주도 · 20–30% 담당 매체 · 분석).\n- 수상은 '대한민국 디지털 광고 대상 통합 퍼포먼스 부문 우수상'까지 쓴다(2024 · 2025, 2년 연속).\n- 직접 쓰는 소개 문장에는 경력 연수를 쓰지 않는다. 소개 줄에는 지금 직함만 쓴다.\n- 광고주 원천 데이터 · 절대 금액 · 사내 자료는 싣지 않는다. 원본 리포트는 면접에서 직접 보여 준다.`,
  `## 여기 없는 것\n\n- 포트폴리오 PDF(29쪽) — 공개 자료에 싣지 않는다. 사이트의 요청 버튼으로 메일을 받으면 따로 보낸다.\n- 전화번호 · 주소 · 생년월일 — 공개 자료에 싣지 않는다.\n- 지원처마다 따로 쓴 문구와 지원 기록.\n- 링크드인 · 채용 플랫폼에 넣는 프로필 원문과 그 작업 메모 — 포트폴리오 저장소의 \`source/\` 에만 둔다(사이트로 내보내지 않는 자료다).`,
  `## 다시 만들기\n\n원본은 \`vetnam555-del/kim-seonil-portfolio\` 의 \`source/src/data\` 다. 사이트를 고친 뒤 그 저장소에서:\n\n\`\`\`bash\ncd source\nnode scripts/export_knowledge.mjs <이 폴더 경로>\n\`\`\`\n\n이 폴더의 파일은 손으로 고치지 않는다 — 다음에 다시 만들 때 덮어써진다.\n\n마지막으로 만든 날: ${new Date().toISOString().slice(0, 10)}`,
].join("\n\n"));

console.log(`[export_knowledge] ${out} — 사례 국 ${ko.length} · 영 ${projectsEn.length} · profile · automation · en/profile`);
