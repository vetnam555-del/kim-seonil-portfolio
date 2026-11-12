export const requiredWidths = [360, 390, 768, 1024, 1440];
/*
 * 낮은 창 (2026.11.12) — 위 다섯 폭의 높이(800 · 844 · 1024 · 768 · 900)는 넉넉하다. 실제로 처음 열리는 창은 더 낮다:
 * 갤럭시 브라우저 · 인앱 브라우저 360×640 남짓, 14인치 FHD 노트북 150% 배율 1280×585, 1366×768 노트북 1366×625.
 * 이 창에서도 결과 세 칸과 첫 버튼이 첫 화면 안에 끝나야 한다.
 */
export const requiredShortWindows = [[360, 640], [1280, 585], [1366, 625]];
/*
 * 접기 (2026.11.12 R-09) — 소개 쪽은 휴대폰에서 자동화 카드 설명과 창업·기획 기록의 자료 · 본문을 접는다(PhoneFold).
 * 접힌 글은 눌러야 보이므로, 눌러서 열리는지와 넓은 화면에서 버튼 없이 다 보이는지를 실제 화면에서 확인한 증거가 있어야 한다.
 */
export const requiredInteractions = ["menu", "case-index", "detail", "original", "email", "resume-pdf", "portfolio-pdf", "demo", "fold", "fragment"];
/*
 * #주소 (2026.11.12 B-16) — 주소에 #이 붙어 새로 열린 쪽은 구간 머리가 제자리에 서야 한다. 고치기 전에는 글꼴이 붙기 전의 긴 배치에서
 * 부드러운 스크롤이 떠나, 390px /about/#career 가 988px 지나쳐 멈췄다. `fragment` 항목은 처음 온 브라우저로 연 실제 화면에서 잰다.
 */
/* 쪽마다 390 · 1440 에서 가로 넘침 · 깨진 이미지 · 제목 · 불러오기 오류를 본다. 소개 쪽은 2026.11.12 에 넣었다(연도별 표 · 접기가 여기 있다) */
export const requiredRoutes = ["/", "/about/", "/resume/", ...["jestina", "newbalance", "daekyo", "gangwon", "dyson", "automation", "edith", "hanssem", "ktalpha"].map(s => `/projects/${s}/`)];

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
  for (const [width, height] of requiredShortWindows) {
    const row = evidence.shortWindows?.find(v => v.width === width && v.height === height);
    if (!row || Math.abs(row.clientWidth - width) > 20 || Math.abs(row.innerHeight - height) > 20 || !(row.proofBottom < height) || !(row.primaryBottom < height)) failures.push(`Short window ${width}x${height}: missing evidence, or results / primary button below the first screen`);
  }
  const pages = evidence.pages || [];
  for (const width of [390, 1440]) {
    for (const route of requiredRoutes) {
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
