const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:8043";
const basePath = "/kim-seonil-portfolio_HLL";
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const outputDir = path.resolve("tmp", "qa-creative-roots");
fs.mkdirSync(outputDir, { recursive: true });

const checks = [];
const check = (viewport, name, pass, detail = "") =>
  checks.push({ viewport, name, pass: Boolean(pass), detail: String(detail) });

async function audit(browser, viewport, width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));

  const response = await page.goto(origin + basePath + "/", { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator("img").evaluateAll((images) => {
    images.forEach((image) => {
      image.loading = "eager";
    });
  });
  await page.evaluate(async () => {
    const previous = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    for (let y = 0; y < document.documentElement.scrollHeight; y += 640) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 18));
    }
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = previous;
  });
  await page.waitForFunction(
    () => [...document.images].every((image) => image.complete),
    null,
    { timeout: 8000 },
  );
  const section = page.locator("#creative-roots");
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.waitForFunction(
    () => [...document.querySelectorAll("#creative-roots img")].every((image) => image.complete),
    null,
    { timeout: 8000 },
  );

  const metrics = await page.evaluate(() => {
    const root = document.querySelector("#creative-roots");
    if (!root) return null;
    const headings = [...root.querySelectorAll("h2,h3")].map((node) => ({
      level: Number(node.tagName.slice(1)),
      text: (node.textContent || "").replace(/\s+/g, " ").trim(),
    }));
    const clippedText = [...root.querySelectorAll("h2,h3,p,dt,dd")]
      .filter((node) => node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 1)
      .map((node) => (node.textContent || "").replace(/\s+/g, " ").trim());
    const globalHeadings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((node) => ({
      level: Number(node.tagName.slice(1)),
      text: (node.textContent || "").replace(/\s+/g, " ").trim(),
    }));
    const edith = document.querySelector("#case-edith");
    const jestina = document.querySelector("#case-jestina");
    return {
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      sectionOverflow: root.scrollWidth - root.clientWidth,
      articleCount: root.querySelectorAll("article").length,
      images: [...root.querySelectorAll("img")].map((image) => ({
        alt: image.getAttribute("alt") || "",
        loaded: image.complete && image.naturalWidth > 0,
        width: image.naturalWidth,
        height: image.naturalHeight,
      })),
      headings,
      roleLabels: [...root.querySelectorAll("dt")].filter((node) => node.textContent?.trim() === "맡은 역할").length,
      evidenceLabels: [...root.querySelectorAll("dt")].filter((node) => node.textContent?.trim() === "확인 자료").length,
      clippedText,
      globalBrokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      globalHeadingJumps: globalHeadings.filter(
        (heading, index) => index > 0 && heading.level - globalHeadings[index - 1].level > 1,
      ),
      placement: {
        edith: edith ? edith.getBoundingClientRect().top + window.scrollY : null,
        creativeRoots: root.getBoundingClientRect().top + window.scrollY,
        jestina: jestina ? jestina.getBoundingClientRect().top + window.scrollY : null,
      },
      rect: root.getBoundingClientRect().toJSON(),
    };
  });

  check(viewport, "HTTP", response && response.ok(), response?.status());
  check(viewport, "섹션 존재", Boolean(metrics), metrics ? "found" : "missing");
  if (metrics) {
    check(viewport, "카드 3건", metrics.articleCount === 3, metrics.articleCount);
    check(viewport, "이미지 3건 로드", metrics.images.length === 3 && metrics.images.every((image) => image.loaded), JSON.stringify(metrics.images));
    check(viewport, "이미지 alt", metrics.images.every((image) => image.alt.trim().length > 0), JSON.stringify(metrics.images.map((image) => image.alt)));
    check(viewport, "페이지 가로 넘침", metrics.pageOverflow <= 1, metrics.pageOverflow);
    check(viewport, "섹션 가로 넘침", metrics.sectionOverflow <= 1, metrics.sectionOverflow);
    check(viewport, "역할·증빙 라벨", metrics.roleLabels === 3 && metrics.evidenceLabels === 3, `${metrics.roleLabels}/${metrics.evidenceLabels}`);
    check(viewport, "제목 계층", metrics.headings[0]?.level === 2 && metrics.headings.slice(1).every((heading) => heading.level === 3), JSON.stringify(metrics.headings));
    check(viewport, "텍스트 잘림", metrics.clippedText.length === 0, metrics.clippedText.join(" | "));
    check(viewport, "전체 이미지 로드", metrics.globalBrokenImages.length === 0, metrics.globalBrokenImages.join(" | "));
    check(viewport, "전체 제목 계층", metrics.globalHeadingJumps.length === 0, JSON.stringify(metrics.globalHeadingJumps));
    check(
      viewport,
      "사례 사이 배치",
      metrics.placement.edith !== null &&
        metrics.placement.jestina !== null &&
        metrics.placement.edith < metrics.placement.creativeRoots &&
        metrics.placement.creativeRoots < metrics.placement.jestina,
      JSON.stringify(metrics.placement),
    );
  }
  check(viewport, "콘솔 오류", consoleErrors.length === 0 && pageErrors.length === 0, [...consoleErrors, ...pageErrors].join(" | "));

  const header = page.locator("header");
  if (await header.count()) {
    await header.evaluate((node) => {
      node.style.visibility = "hidden";
    });
  }
  await section.screenshot({ path: path.join(outputDir, `creative-roots-${viewport}.png`) });
  if (await header.count()) {
    await header.evaluate((node) => {
      node.style.visibility = "";
    });
  }
  await context.close();
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  try {
    await audit(browser, "1440", 1440, 1000);
    await audit(browser, "390", 390, 844);
  } finally {
    await browser.close();
  }

  const failed = checks.filter((item) => !item.pass);
  fs.writeFileSync(path.join(outputDir, "results.json"), JSON.stringify({ origin, checks }, null, 2));
  console.log(JSON.stringify({ total: checks.length, passed: checks.length - failed.length, failed }, null, 2));
  process.exitCode = failed.length ? 1 : 0;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
