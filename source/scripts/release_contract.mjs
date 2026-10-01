export const requiredWidths = [360, 390, 768, 1024, 1440];
export const requiredInteractions = ["menu", "case-index", "detail", "original", "email", "resume-pdf", "portfolio-pdf", "demo"];

export function checkHome(html) {
  const failures = [];
  const visible = html.replace(/<script[\s\S]*?<\/script>/g, "");
  /*
   * 2026.09.24 공용판 입구형 홈. 카드마다 결과 옆에 기준 · 기여 범위 · 원본 링크가 있어야 하고,
   * 수치는 움직임으로 드러나야 한다(data-enter="wipe"). 재고 자동화 시연과 연락 구간도 홈에 남는다.
   */
  if (!visible.includes('class="folio-hero"')) failures.push("Hero missing");
  if ((visible.match(/class="folio-case folio-case-lg"/g) || []).length !== 2) failures.push("Exactly two featured cases required");
  for (const slug of ["jestina", "newbalance", "daekyo", "gangwon", "dyson"]) {
    const article = visible.match(new RegExp(`<article id="case-${slug}"[\\s\\S]*?<\\/article>`))?.[0] || "";
    for (const token of ["folio-case-result", "folio-case-evidence", 'data-enter="wipe"', "기여 범위", "folio-case-basis", "원본 크기로 열기"]) {
      if (!article.includes(token)) failures.push(`${slug}: ${token} missing`);
    }
  }
  for (const token of ['id="inventory-demo"', 'id="contact"', "count-up-measure"]) {
    if (!visible.includes(token)) failures.push(`Home section missing: ${token}`);
  }
  return failures;
}

export function checkRuntime(evidence, fingerprint) {
  const failures = [];
  const measured = row => row && Number.isFinite(row.clientWidth) && Number.isFinite(row.scrollWidth);
  if (evidence.version !== 1 || evidence.fingerprint !== fingerprint) failures.push("Runtime evidence is missing or belongs to another build");
  for (const width of requiredWidths) {
    const row = evidence.viewports?.find(v => v.width === width);
    if (!measured(row) || !Array.isArray(row.clipped) || Math.abs(row.clientWidth - width) > 20 || row.scrollWidth > row.clientWidth + 1 || row.clipped.length || !(row.heroHeight < row.height)) failures.push(`Viewport ${width}: missing evidence, overflow, or oversized hero`);
  }
  const pages = evidence.pages || [];
  for (const width of [390, 1440]) {
    for (const route of ["/", "/resume/", ...["jestina", "newbalance", "daekyo", "gangwon", "dyson", "automation", "edith", "hanssem", "ktalpha"].map(s => `/projects/${s}/`)]) {
      const page = pages.find(p => p.width === width && p.route === route);
      if (!measured(page) || !Array.isArray(page.brokenImages) || !Array.isArray(page.loadingErrors) || Math.abs(page.clientWidth - width) > 20 || page.scrollWidth > page.clientWidth + 1 || page.brokenImages.length || page.missingTitle !== false || page.loadingErrors.length) failures.push(`Page ${width} ${route}: missing or failed`);
    }
  }
  for (const name of ["hero", "case"]) {
    const frames = evidence.motion?.[name] || [];
    const first = frames[0];
    const final = frames.at(-1);
    if (!first || !final || !frames.some(f => f.state === "running" && f.visual !== f.target && /[1-9]/.test(f.visual)) || final.visual !== final.target || final.state !== "done") failures.push(`${name}: intermediate and completed motion not demonstrated`);
    if (frames.some(f => Math.abs(f.width - first.width) > 1)) failures.push(`${name}: count-up changed layout width`);
  }
  for (const name of requiredInteractions) {
    if (!evidence.interactions?.some(i => i.name === name && i.passed === true && typeof i.observed === "string" && i.observed.length > 8)) failures.push(`Interaction ${name}: missing verification`);
  }
  if (!evidence.visualReview || evidence.visualReview.openIssues !== 0 || (evidence.visualReview.screenshots || []).length < 8) failures.push("Visual review is incomplete");
  return failures;
}
