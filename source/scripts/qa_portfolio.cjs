const fs = require("fs");
const path = require("path");
const { chromium, request } = require("playwright");

const origin = process.env.QA_ORIGIN || "http://localhost:8024";
const basePath = "/kim-seonil-portfolio_HLL";
const homeUrl = origin + basePath + "/";
const outputDir = path.resolve("tmp", "qa-2026-08-13");
fs.mkdirSync(outputDir, { recursive: true });

const results = { origin, checks: [], externalLinks: [] };
const check = (name, pass, detail = "") => results.checks.push({ name, pass: Boolean(pass), detail });

async function screenshotAfterMotion(page, locator, filePath) {
  await locator.scrollIntoViewIfNeeded();
  await page.waitForTimeout(950);
  await locator.screenshot({ path: filePath });
}

async function auditViewport(browser, name, width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  await page.goto(homeUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.locator("img").evaluateAll((images) => images.forEach((image) => { image.loading = "eager"; }));
  await page.evaluate(async () => {
    const previousScrollBehavior = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = previousScrollBehavior;
  });
  await page.waitForFunction(() => [...document.images].every((image) => image.complete), null, { timeout: 5000 }).catch(() => {});

  const metrics = await page.evaluate(() => {
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((node) => ({
      level: Number(node.tagName.slice(1)),
      text: (node.textContent || "").trim(),
    }));
    return {
      title: document.title,
      h1: [...document.querySelectorAll("h1")].map((node) => (node.innerText || "").replace(/\s+/g, " ").trim()),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      missingAlt: [...document.images].filter((image) => !image.hasAttribute("alt") || !image.alt.trim()).length,
      headingJumps: headings.filter((heading, index) => index > 0 && heading.level - headings[index - 1].level > 1),
      sectionOrder: ["impact", "solution-fit", "projects", "summary", "method", "expertise", "automation", "career", "verification", "story", "next", "contact"]
        .map((id) => {
          const element = document.getElementById(id);
          return { id, top: element ? element.getBoundingClientRect().top + window.scrollY : null };
        }),
      canonical: document.querySelector('link[rel="canonical"]')?.href || "",
      ogTitle: document.querySelector('meta[property="og:title"]')?.content || "",
      jsonLd: Boolean(document.querySelector('script[type="application/ld+json"]')),
      firstFold: {
        viewportHeight: window.innerHeight,
        heroBottom: document.querySelector("main > section")?.getBoundingClientRect().height ?? null,
        nextSectionTop: document.querySelectorAll("main > section")[1]?.getBoundingClientRect().top + window.scrollY ?? null,
      },
      projectStoryLabels: [...document.querySelectorAll("#projects dl")][0]
        ? [...document.querySelectorAll("#projects dl")[0].querySelectorAll("dt")].map((node) => node.textContent?.trim())
        : [],
      firstProjectProblem:
        document.querySelector("#projects dl dd")?.textContent?.replace(/\s+/g, " ").trim() || "",
      desktopNavLabels: [...document.querySelectorAll("header nav a")].map((node) =>
        (node.textContent || "").replace(/\s+/g, " ").trim(),
      ),
      anchorOffset: {
        headerHeight: document.querySelector("header")?.getBoundingClientRect().height ?? 0,
        scrollPaddingTop: Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0,
      },
      clippedControls: [...document.querySelectorAll("button, header nav a")]
        .filter((node) => node.getClientRects().length > 0 && node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 1)
        .map((node) => (node.textContent || "").replace(/\s+/g, " ").trim()),
      headerNavOverlap: (() => {
        const links = [...document.querySelectorAll("header nav a")]
          .filter((node) => node.getClientRects().length > 0)
          .map((node) => node.getBoundingClientRect())
          .sort((a, b) => a.left - b.left);
        return links.some((rect, index) => index > 0 && rect.left < links[index - 1].right - 0.5);
      })(),
      heroTitleInsideViewport: (() => {
        const title = document.querySelector("h1");
        if (!title) return false;
        const rect = title.getBoundingClientRect();
        return rect.left >= -0.5 && rect.right <= window.innerWidth + 0.5;
      })(),
      scrollProgress: Boolean(document.querySelector('[data-testid="scroll-progress"]')),
    };
  });

  check(`${name}: 가로 오버플로`, metrics.overflow <= 1, String(metrics.overflow));
  check(`${name}: H1 하나`, metrics.h1.length === 1, metrics.h1.join(" | "));
  check(`${name}: H1 문구`, metrics.h1[0] === "사람이 보고 싶은 콘텐츠와 브랜드가 얻어야 할 결과를 연결합니다.", metrics.h1[0]);
  check(`${name}: 이미지 로드`, metrics.brokenImages.length === 0, metrics.brokenImages.join(", "));
  check(`${name}: 이미지 alt`, metrics.missingAlt === 0, String(metrics.missingAlt));
  check(`${name}: 제목 계층`, metrics.headingJumps.length === 0, JSON.stringify(metrics.headingJumps));
  check(
    `${name}: 홈 섹션 순서`,
    metrics.sectionOrder.every((item) => item.top !== null) &&
      metrics.sectionOrder.every((item, index) => index === 0 || item.top > metrics.sectionOrder[index - 1].top),
    JSON.stringify(metrics.sectionOrder),
  );
  check(`${name}: SEO 제목`, metrics.title.includes("스튜디오 룰루랄라") && metrics.title.includes("솔루션팀"), metrics.title);
  check(`${name}: canonical`, metrics.canonical.endsWith(basePath + "/"), metrics.canonical);
  check(`${name}: OG 제목`, metrics.ogTitle.includes("스튜디오 룰루랄라") && metrics.ogTitle.includes("솔루션팀"), metrics.ogTitle);
  check(`${name}: JSON-LD`, metrics.jsonLd);
  check(
    `${name}: 첫 화면 다음 섹션 노출`,
    metrics.firstFold.nextSectionTop !== null && metrics.firstFold.nextSectionTop < metrics.firstFold.viewportHeight,
    JSON.stringify(metrics.firstFold),
  );
  check(
    `${name}: 사례 문제·판단·결과`,
    JSON.stringify(metrics.projectStoryLabels.slice(0, 3)) === JSON.stringify(["문제", "판단", "결과"]),
    JSON.stringify(metrics.projectStoryLabels),
  );
  check(
    `${name}: 첫 사례 실제 문제 문장`,
    metrics.firstProjectProblem ===
      "프리미엄 가전은 구매 전 정보 탐색이 긴 고관여 제품인데, 단기 세일즈 광고는 집행이 끝나는 순간 소재도 트래픽도 사라졌습니다.",
    metrics.firstProjectProblem,
  );
  check(
    `${name}: 채용용 한국어 메뉴`,
    ["핵심 성과", "직무 적합도", "대표 사례", "일하는 방식", "자동화", "경력", "이력서"].every((label) =>
      metrics.desktopNavLabels.includes(label),
    ),
    metrics.desktopNavLabels.join(" | "),
  );
  check(
    `${name}: 고정 헤더 앵커 여백`,
    metrics.anchorOffset.scrollPaddingTop > metrics.anchorOffset.headerHeight,
    JSON.stringify(metrics.anchorOffset),
  );
  check(`${name}: 버튼·메뉴 글자 잘림`, metrics.clippedControls.length === 0, metrics.clippedControls.join(" | "));
  check(`${name}: 헤더 메뉴 겹침`, !metrics.headerNavOverlap, String(metrics.headerNavOverlap));
  check(`${name}: 히어로 제목 화면 내 배치`, metrics.heroTitleInsideViewport, String(metrics.heroTitleInsideViewport));
  check(`${name}: 스크롤 진행 표시`, metrics.scrollProgress);
  check(`${name}: 콘솔 오류`, consoleErrors.length === 0, consoleErrors.join(" | "));

  if (name === "1440") {
    const readMotion = () => {
      const card = document.querySelector(".hero-stage__card--primary");
      const strip = document.querySelector(".hero-kinetic-strip__track");
      const runner = document.querySelector(".solution-flow__runner");
      return {
        card: card ? getComputedStyle(card).translate : "",
        strip: strip ? getComputedStyle(strip).transform : "",
        runner: runner ? getComputedStyle(runner).left : "",
      };
    };
    const motionStart = await page.evaluate(readMotion);
    await page.waitForTimeout(700);
    const motionEnd = await page.evaluate(readMotion);
    check(
      `${name}: 히어로 카드 모션`,
      motionStart.card !== motionEnd.card,
      `${motionStart.card} -> ${motionEnd.card}`,
    );
    check(
      `${name}: 키네틱 타이포 모션`,
      motionStart.strip !== motionEnd.strip,
      `${motionStart.strip} -> ${motionEnd.strip}`,
    );
    check(
      `${name}: Solution 흐름 모션`,
      motionStart.runner !== motionEnd.runner,
      `${motionStart.runner} -> ${motionEnd.runner}`,
    );
  }

  if (width < 1024) {
    const menu = page.getByRole("button", { name: "메뉴" });
    await menu.click();
    await page.locator("#mobile-nav").waitFor({ state: "visible" });
    check(`${name}: 모바일 메뉴 열기`, await page.locator("#mobile-nav").isVisible());
    await page.keyboard.press("Escape");
    check(`${name}: 모바일 메뉴 Esc 닫기`, !(await page.locator("#mobile-nav").isVisible()));
  }

  await page.getByRole("button", { name: "Data Analysis" }).click();
  const filteredCount = await page.locator('a[href*="/projects/"]').count();
  check(`${name}: 프로젝트 필터`, filteredCount > 0, String(filteredCount));
  await page.getByRole("button", { name: "All" }).click();

  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const element = document.activeElement;
    if (!element) return { tag: "", outline: "" };
    return { tag: element.tagName, outline: getComputedStyle(element).outlineStyle };
  });
  check(`${name}: 키보드 포커스`, Boolean(focus.tag) && focus.outline !== "none", JSON.stringify(focus));

  if (name === "375") {
    await screenshotAfterMotion(page, page.locator("main > section").first(), path.join(outputDir, "hero-375.png"));
    await screenshotAfterMotion(page, page.locator("#solution-fit"), path.join(outputDir, "solution-fit-375.png"));
    await screenshotAfterMotion(page, page.locator("#projects"), path.join(outputDir, "projects-375.png"));
  }
  if (name === "1440") {
    await screenshotAfterMotion(page, page.locator("main > section").first(), path.join(outputDir, "hero-1440.png"));
    await screenshotAfterMotion(page, page.locator("#solution-fit"), path.join(outputDir, "solution-fit-1440.png"));
    await screenshotAfterMotion(page, page.locator("#projects"), path.join(outputDir, "projects-1440.png"));
    await screenshotAfterMotion(page, page.locator("#method"), path.join(outputDir, "method-1440.png"));
    await screenshotAfterMotion(page, page.locator("#automation"), path.join(outputDir, "automation-1440.png"));
  }
  await page.screenshot({ path: path.join(outputDir, `home-${name}.png`), fullPage: true });
  await context.close();
}

async function auditProjectTiers(browser) {
  const expected = {
    jestina: ["문제 정의", "분석 근거", "전략", "실행", "나의 역할", "배운 것", "보유 증빙", "출처"],
    daekyo: ["문제", "판단", "변화", "역할 · 근거", "배운 것"],
    dyson: ["문제 정의", "분석 근거", "전략", "실행", "나의 역할", "배운 것", "출처"],
  };
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  for (const [slug, labels] of Object.entries(expected)) {
    await page.goto(`${origin}${basePath}/projects/${slug}/`, { waitUntil: "networkidle" });
    const actual = await page.locator("article h2").allTextContents();
    check(`프로젝트 ${slug}: 등급별 구조`, JSON.stringify(actual) === JSON.stringify(labels), JSON.stringify(actual));
    if (slug === "jestina") {
      const flowLabels = await page.locator('nav[aria-label="프로젝트 사례 흐름"] a').allTextContents();
      check(
        "프로젝트 jestina: 사례 흐름 내비게이션",
        JSON.stringify(flowLabels.map((label) => label.replace(/\s+/g, "").trim())) ===
          JSON.stringify(["01문제", "02분석", "03전략", "04실행", "05역할", "06배운것", "07증빙", "08출처"]),
        JSON.stringify(flowLabels),
      );
    }
    const nextHref = await page
      .locator("article")
      .getByText("다음 프로젝트")
      .locator("..")
      .locator("a")
      .getAttribute("href", { timeout: 10000 })
      .catch(() => null);
    check(
      `프로젝트 ${slug}: 다음 프로젝트 링크`,
      Boolean(nextHref && nextHref.includes("/projects/")),
      nextHref || "not found",
    );
  }
  await context.close();
}

async function auditLinksAndFiles(browser) {
  const api = await request.newContext({ ignoreHTTPSErrors: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const pages = ["/", "/resume/", ...["jestina", "newbalance", "gangwon", "daekyo", "automation", "dyson", "hanssem", "ktalpha"].map((slug) => `/projects/${slug}/`)];
  const internal = new Set();
  const external = new Set();
  for (const pathname of pages) {
    await page.goto(origin + basePath + pathname, { waitUntil: "domcontentloaded" });
    const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((link) => link.href));
    hrefs.forEach((href) => {
      if (href.startsWith(origin)) internal.add(href.split("#")[0]);
      else if (href.startsWith("http")) external.add(href);
    });
  }

  for (const href of internal) {
    const response = await api.get(href, { timeout: 15000 });
    check(`내부 링크: ${new URL(href).pathname}`, response.ok(), String(response.status()));
  }

  for (const href of external) {
    try {
      const response = await api.get(href, { timeout: 20000, maxRedirects: 5 });
      const botBlocked = new URL(href).hostname === "www.linkedin.com" && response.status() === 999;
      const reachable = response.status() < 500 || botBlocked;
      results.externalLinks.push({ href, status: response.status(), reachable, botBlocked });
      check(`외부 링크: ${new URL(href).hostname}`, reachable, `${response.status()}${botBlocked ? " / bot-blocked" : ""}`);
    } catch (error) {
      results.externalLinks.push({ href, status: 0, reachable: false, error: String(error.message || error) });
      check(`외부 링크: ${new URL(href).hostname}`, false, String(error.message || error));
    }
  }

  const pdfUrl = origin + basePath + "/kim-seonil-resume-public.pdf";
  const pdfResponse = await api.get(pdfUrl, { timeout: 15000 });
  const pdfBody = await pdfResponse.body();
  check("공개 PDF 다운로드", pdfResponse.ok() && pdfBody.slice(0, 4).toString() === "%PDF", `${pdfResponse.status()} / ${pdfBody.length} bytes`);

  const robots = await api.get(origin + basePath + "/robots.txt");
  const sitemap = await api.get(origin + basePath + "/sitemap.xml");
  check("robots.txt", robots.ok() && (await robots.text()).includes("sitemap.xml"), String(robots.status()));
  check("sitemap /resume/", sitemap.ok() && (await sitemap.text()).includes(basePath + "/resume/"), String(sitemap.status()));
  await context.close();
  await api.dispose();
}

async function auditFallbacks(browser) {
  const jsOff = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 375, height: 812 } });
  const jsOffPage = await jsOff.newPage();
  await jsOffPage.goto(homeUrl, { waitUntil: "domcontentloaded" });
  const jsOffText = (await jsOffPage.locator("body").innerText()).trim();
  check("JavaScript 비활성 콘텐츠", jsOffText.includes("사람이 보고 싶은 콘텐츠와") && jsOffText.length > 3000, String(jsOffText.length));
  await jsOff.close();

  const reduced = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 375, height: 812 } });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(homeUrl, { waitUntil: "networkidle" });
  const motion = await reducedPage.evaluate(() => {
    const style = getComputedStyle(document.querySelector("a") || document.body);
    const heroCard = document.querySelector(".hero-stage__card--primary");
    return {
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
      transitionDuration: style.transitionDuration,
      heroAnimationDuration: heroCard ? getComputedStyle(heroCard).animationDuration : "0s",
    };
  });
  check(
    "prefers-reduced-motion",
    motion.scrollBehavior === "auto" &&
      Number.parseFloat(motion.transitionDuration) <= 0.00002 &&
      Number.parseFloat(motion.heroAnimationDuration) <= 0.00002,
    JSON.stringify(motion),
  );
  await reduced.close();
}

async function printResume(browser) {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage();
  await page.goto(origin + basePath + "/resume/", { waitUntil: "networkidle" });
  await page.emulateMedia({ media: "print" });
  await page.pdf({
    path: path.join(outputDir, "kim-seonil-resume-public.pdf"),
    format: "A4",
    printBackground: true,
    preferCSSPageSize: true,
    scale: 0.85,
    margin: { top: "0", right: "0", bottom: "0", left: "0" },
  });
  check("웹 이력서 인쇄 PDF 생성", fs.statSync(path.join(outputDir, "kim-seonil-resume-public.pdf")).size > 50000);
  await context.close();
}

(async () => {
  const executablePath = process.env.QA_BROWSER || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    await auditViewport(browser, "375", 375, 812);
    await auditViewport(browser, "768", 768, 1024);
    await auditViewport(browser, "1440", 1440, 1000);
    await auditProjectTiers(browser);
    await auditLinksAndFiles(browser);
    await auditFallbacks(browser);
    await printResume(browser);
  } finally {
    await browser.close();
  }
  results.summary = {
    passed: results.checks.filter((item) => item.pass).length,
    failed: results.checks.filter((item) => !item.pass).length,
  };
  fs.writeFileSync(path.join(outputDir, "qa-results.json"), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
  process.exitCode = results.summary.failed ? 1 : 0;
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
