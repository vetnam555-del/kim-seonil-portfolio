const fs = require("fs");
const path = require("path");
const { chromium, request } = require("playwright");

const origin = process.env.QA_ORIGIN || "http://127.0.0.1:8034";
const basePath = process.env.QA_BASE_PATH || "/kim-seonil-portfolio_HLL";
const homeUrl = origin + basePath + "/";
const outputDir = path.resolve(
  process.env.QA_OUTPUT_DIR || path.join("tmp", `qa-${basePath.replace(/^\/+/, "").replaceAll("/", "-")}`),
);
fs.mkdirSync(outputDir, { recursive: true });

const results = { origin, checks: [] };
const check = (name, pass, detail = "") =>
  results.checks.push({ name, pass: Boolean(pass), detail: String(detail) });
const clean = (value) => String(value || "").replace(/\s+/g, " ").trim();

async function loadAllImages(page) {
  await page.locator("img").evaluateAll((images) => {
    images.forEach((image) => {
      image.loading = "eager";
    });
  });
  await page.evaluate(async () => {
    const before = document.documentElement.style.scrollBehavior;
    document.documentElement.style.scrollBehavior = "auto";
    for (let y = 0; y < document.documentElement.scrollHeight; y += 640) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 18));
    }
    window.scrollTo(0, 0);
    document.documentElement.style.scrollBehavior = before;
  });
  await page.waitForFunction(
    () => [...document.images].every((image) => image.complete),
    null,
    { timeout: 8000 },
  ).catch(() => {});
}

async function homeAudit(browser, label, width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(error.message));
  const response = await page.goto(homeUrl, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await loadAllImages(page);

  const metrics = await page.evaluate(() => {
    const sectionIds = [
      "story",
      "impact",
      "projects",
      "method",
      "why-studio",
      "automation",
      "career",
      "verification",
      "contact",
    ];
    const headings = [...document.querySelectorAll("h1,h2,h3,h4,h5,h6")].map((node) => ({
      level: Number(node.tagName.slice(1)),
      text: (node.textContent || "").trim(),
    }));
    const projectHrefs = [...document.querySelectorAll('#projects a[href*="/projects/"]')]
      .map((node) => node.getAttribute("href"))
      .filter(Boolean);
    const actionNodes = [...document.querySelectorAll("button, summary, header a, #projects a")]
      .filter((node) => node.getClientRects().length > 0);
    return {
      title: document.title,
      statusText: document.body.innerText.length,
      h1: [...document.querySelectorAll("h1")].map((node) => (node.innerText || "").replace(/\s+/g, " ").trim()),
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImages: [...document.images]
        .filter((image) => !image.complete || image.naturalWidth === 0)
        .map((image) => image.currentSrc || image.src),
      missingAltAttribute: [...document.images].filter((image) => !image.hasAttribute("alt")).length,
      headingJumps: headings.filter(
        (heading, index) => index > 0 && heading.level - headings[index - 1].level > 1,
      ),
      sectionOrder: sectionIds.map((id) => {
        const node = document.getElementById(id);
        return { id, top: node ? node.offsetTop : null };
      }),
      projectHrefs,
      canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") || "",
      jsonLd: Boolean(document.querySelector('script[type="application/ld+json"]')),
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") || "",
      ogDescription: document.querySelector('meta[property="og:description"]')?.getAttribute("content") || "",
      visibleForbidden: ["권고사직", "조직 종료", "조직 개편", "감원"].filter((word) =>
        document.body.innerText.includes(word),
      ),
      clippedActions: actionNodes
        .filter((node) => node.clientWidth > 0 && node.scrollWidth > node.clientWidth + 1)
        .map((node) => (node.textContent || "").replace(/\s+/g, " ").trim()),
      smallPrimaryTargets: actionNodes
        .filter((node) => {
          const rect = node.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.height < 40;
        })
        .map((node) => `${node.tagName}:${(node.textContent || "").replace(/\s+/g, " ").trim()}:${Math.round(node.getBoundingClientRect().height)}`),
      unsafeExternalLinks: [...document.querySelectorAll('a[href^="http"]')]
        .filter((node) => node.getAttribute("target") !== "_blank" || !String(node.getAttribute("rel") || "").includes("noopener"))
        .map((node) => node.getAttribute("href")),
      contactLinks: [...document.querySelectorAll("#contact a")].map((node) => node.getAttribute("href") || ""),
      storyTitle: document.querySelector("#story h2")?.textContent || "",
      storyCount: document.querySelectorAll("#story article").length,
      methodCount: document.querySelectorAll("#method article").length,
      whyTitle: document.querySelector("#why-studio h2")?.textContent || "",
      whyProcessCount: document.querySelectorAll("#why-studio article").length,
      first90Details: Boolean(document.querySelector("#why-studio details")),
      standaloneFirst90: Boolean(document.querySelector("#first-90-days")),
      featuredCount: document.querySelectorAll("#projects .project-card").length,
      supportingHead: [...document.querySelectorAll("#projects p")].find((node) => node.textContent?.trim() === "확장 역량")?.textContent || "",
      heroMedia: Boolean(document.querySelector('[data-hero-media="metal-human"]')),
      heroVideoSource: document.querySelector('[data-hero-media="metal-human"] source')?.getAttribute("src") || "",
      nextSectionTop: document.querySelectorAll("main > section")[1]?.getBoundingClientRect().top + window.scrollY || null,
      viewportHeight: window.innerHeight,
    };
  });

  const expectedOrder = ["dyson", "jestina", "daekyo", "newbalance", "gangwon", "automation"];
  const firstSix = metrics.projectHrefs.slice(0, 6).map((href) => href.match(/projects\/([^/]+)/)?.[1]);
  const robots = metrics.robots.toLowerCase();
  check(`${label}: HTTP`, response && response.ok(), response?.status());
  check(`${label}: H1 하나`, metrics.h1.length === 1, metrics.h1.join(" | "));
  check(
    `${label}: H1 포지셔닝`,
    metrics.h1[0] === "아이디어를 실행으로, 실행을 반복 가능한 구조로 만듭니다.",
    metrics.h1[0],
  );
  check(`${label}: 가로 오버플로`, metrics.overflow <= 1, metrics.overflow);
  check(`${label}: 이미지 로드`, metrics.brokenImages.length === 0, metrics.brokenImages.join(" | "));
  check(`${label}: 이미지 alt 속성`, metrics.missingAltAttribute === 0, metrics.missingAltAttribute);
  check(`${label}: 제목 계층`, metrics.headingJumps.length === 0, JSON.stringify(metrics.headingJumps));
  check(
    `${label}: 섹션 순서`,
    metrics.sectionOrder.every((item) => item.top !== null) &&
      metrics.sectionOrder.every((item, index) => index === 0 || item.top > metrics.sectionOrder[index - 1].top),
    JSON.stringify(metrics.sectionOrder),
  );
  check(`${label}: My Story 제목`, clean(metrics.storyTitle).includes("문제를 구조로 바꾸는 일"), clean(metrics.storyTitle));
  check(`${label}: My Story 4단계`, metrics.storyCount === 4, metrics.storyCount);
  check(`${label}: How I Work 3개`, metrics.methodCount === 3, metrics.methodCount);
  check(`${label}: Why Studio`, clean(metrics.whyTitle).includes("콘텐츠의 기획 단계"), clean(metrics.whyTitle));
  check(`${label}: 솔루션 프로세스 4개`, metrics.whyProcessCount === 4, metrics.whyProcessCount);
  check(`${label}: 90일 가설 접힘`, metrics.first90Details && !metrics.standaloneFirst90, `${metrics.first90Details}/${metrics.standaloneFirst90}`);
  check(`${label}: 핵심 사례 4개`, metrics.featuredCount === 4, metrics.featuredCount);
  check(`${label}: 확장 역량 표기`, metrics.supportingHead === "확장 역량", metrics.supportingHead);
  check(`${label}: 프로젝트 순서`, JSON.stringify(firstSix) === JSON.stringify(expectedOrder), JSON.stringify(firstSix));
  check(
    `${label}: Hero 보조 비주얼`,
    metrics.heroMedia && metrics.heroVideoSource.endsWith("/media/metal-human-loop.mp4"),
    metrics.heroVideoSource,
  );
  check(`${label}: noindex`, ["noindex", "nofollow", "noarchive", "nosnippet"].every((token) => robots.includes(token)), robots);
  check(`${label}: canonical 제거`, !metrics.canonical, metrics.canonical);
  check(`${label}: JSON-LD 제거`, !metrics.jsonLd, String(metrics.jsonLd));
  check(`${label}: 메타 설명 일반화`, !/[0-9]{3,}|뉴발란스|다이슨|제이에스티나/.test(metrics.ogDescription), metrics.ogDescription);
  check(`${label}: 금지 문구 없음`, metrics.visibleForbidden.length === 0, metrics.visibleForbidden.join(" | "));
  check(`${label}: 컨트롤 글자 잘림`, metrics.clippedActions.length === 0, metrics.clippedActions.join(" | "));
  check(`${label}: 주요 터치 영역`, metrics.smallPrimaryTargets.length === 0, metrics.smallPrimaryTargets.join(" | "));
  check(`${label}: 외부 링크 안전 속성`, metrics.unsafeExternalLinks.length === 0, metrics.unsafeExternalLinks.join(" | "));
  check(
    `${label}: Contact CTA`,
    metrics.contactLinks.some((href) => href.startsWith("mailto:")) &&
      metrics.contactLinks.some((href) => href.endsWith("/resume/")) &&
      metrics.contactLinks.some((href) => href.includes("linkedin.com")),
    JSON.stringify(metrics.contactLinks),
  );
  check(
    `${label}: 첫 화면 다음 섹션 힌트`,
    metrics.nextSectionTop !== null && metrics.nextSectionTop < metrics.viewportHeight,
    `${metrics.nextSectionTop} / ${metrics.viewportHeight}`,
  );
  check(`${label}: 콘솔 오류`, consoleErrors.length === 0 && pageErrors.length === 0, [...consoleErrors, ...pageErrors].join(" | "));

  if (width < 1024) {
    const menu = page.getByRole("button", { name: "메뉴" });
    await menu.click();
    check(`${label}: 모바일 메뉴 열기`, await page.locator("#mobile-nav").isVisible());
    await page.keyboard.press("Escape");
    check(`${label}: 모바일 메뉴 Esc 닫기`, !(await page.locator("#mobile-nav").isVisible()));
  }

  await page.getByRole("button", { name: "데이터 분석" }).click();
  const filtered = await page.locator('#projects a[href*="/projects/"]').count();
  check(`${label}: 프로젝트 필터`, filtered > 0 && filtered < 8, filtered);
  await page.getByRole("button", { name: "전체" }).click();

  await page.keyboard.press("Tab");
  const focus = await page.evaluate(() => {
    const node = document.activeElement;
    return node ? { tag: node.tagName, outline: getComputedStyle(node).outlineStyle } : null;
  });
  check(`${label}: 키보드 포커스`, focus && focus.outline !== "none", JSON.stringify(focus));

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  await page.screenshot({ path: path.join(outputDir, `viewport-${label}.png`), fullPage: false });
  await page.screenshot({ path: path.join(outputDir, `home-${label}.png`), fullPage: true });
  if (label === "390" || label === "1440") {
    await page.locator("header").evaluate((node) => {
      node.style.visibility = "hidden";
    });
    await page.locator("#story").screenshot({ path: path.join(outputDir, `story-${label}.png`) });
    await page.locator("#method").screenshot({ path: path.join(outputDir, `method-${label}.png`) });
    await page.locator("#why-studio").screenshot({ path: path.join(outputDir, `why-studio-${label}.png`) });
    await page.locator("#projects").screenshot({ path: path.join(outputDir, `projects-${label}.png`) });
    await page.locator("header").evaluate((node) => {
      node.style.visibility = "";
    });
  }
  await context.close();
}

async function projectAudit(browser, label, width, height) {
  const context = await browser.newContext({ viewport: { width, height } });
  const page = await context.newPage();
  const slugs = ["dyson", "jestina", "daekyo", "newbalance", "gangwon", "automation"];
  const baseLabels = [
    "문제 정의",
    "데이터에서 확인한 것",
    "핵심 판단",
    "실행",
    "결과",
    "나의 역할",
    "실패와 수정한 판단",
  ];

  for (const slug of slugs) {
    const errors = [];
    page.removeAllListeners("console");
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    const response = await page.goto(`${origin}${basePath}/projects/${slug}/`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    await loadAllImages(page);
    const data = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      h1: document.querySelector("h1")?.textContent || "",
      h2: [...document.querySelectorAll("article h2")].map((node) => (node.textContent || "").trim()),
      sourceDetails: Boolean(document.querySelector('#case-source details')),
      returnHref: document.querySelector('a[href$="#projects"]')?.getAttribute("href") || "",
      brokenImages: [...document.images].filter((image) => !image.complete || image.naturalWidth === 0).length,
      body: document.body.innerText,
      robots: document.querySelector('meta[name="robots"]')?.getAttribute("content") || "",
      stickyHint: Boolean(document.querySelector('nav[aria-label="프로젝트 사례 흐름"] > span')),
      mobileTableHint: document.body.innerText.includes("모바일에서는 좌우로 밀어 확인할 수 있습니다."),
      nextProject: Boolean([...document.querySelectorAll("a")].find((node) => node.textContent?.includes("다음 프로젝트"))),
    }));
    check(`${slug}@${label}: HTTP`, response && response.ok(), response?.status());
    check(`${slug}@${label}: 공통 상세 흐름`, baseLabels.every((item, index) => data.h2[index] === item), JSON.stringify(data.h2));
    check(`${slug}@${label}: 근거 details`, data.sourceDetails, String(data.sourceDetails));
    check(`${slug}@${label}: 목록 복귀`, data.returnHref.endsWith("/#projects"), data.returnHref);
    check(`${slug}@${label}: 가로 오버플로`, data.overflow <= 1, data.overflow);
    check(`${slug}@${label}: 이미지 로드`, data.brokenImages === 0, data.brokenImages);
    check(`${slug}@${label}: noindex`, data.robots.toLowerCase().includes("noindex"), data.robots);
    check(`${slug}@${label}: 스티키 메뉴 힌트`, data.stickyHint, String(data.stickyHint));
    if (label === "390" && (slug === "dyson" || slug === "jestina")) {
      check(`${slug}@${label}: 표 스크롤 안내`, data.mobileTableHint, String(data.mobileTableHint));
    }
    check(`${slug}@${label}: 콘솔 오류`, errors.length === 0, errors.join(" | "));

    if (label === "1440" && slug === "dyson") {
      check("dyson: 콘텐츠 운영 매트릭스", data.body.includes("콘텐츠 운영 매트릭스") && data.body.includes("라이브커머스"), "");
      check("dyson: 고객 여정과 측정 범위", data.body.includes("설계 KPI") && data.body.includes("최종 판매 성과는 담당 범위에서 제외했습니다"), "");
      check("dyson: 기여도 40%", data.body.includes("기여도 40%"), "");
    }
    if (label === "1440" && slug === "jestina") {
      check("jestina: 동일 기간 대표 비교", data.body.includes("352% → 583%") && data.body.includes("동일 마감보고 기준"), "");
      check("jestina: 비교 한계", data.body.includes("동일 기간 월별 재산출 비교가 아닙니다"), "");
      check("jestina: 고객 단계별 표", data.body.includes("고객 단계별 채널 역할") && data.body.includes("인지") && data.body.includes("전환"), "");
    }
    if (label === "1440" && slug === "daekyo") {
      check("daekyo: 문제 재정의", data.h1.includes("전환 경로의 병목"), data.h1);
      check("daekyo: 폼 3단계", ["입력 항목 축소", "자격 질문 일부 복원", "문항 순서 조정"].every((text) => data.body.includes(text)), "");
      check("daekyo: 재비교와 폼 효과 분리", data.body.includes("상담 폼 개선의 단독 효과로 해석하지 않았습니다"), "");
    }
    if (label === "1440" && slug === "newbalance") {
      check("newbalance: 대형 운영과 중단 기준", data.body.includes("월 10억") && data.body.includes("자동 조치 중단"), "");
      /* 근사값·상한값으로 계산한 파생 수치(115분 · 95.8%)는 싣지 않는다 — 실측 표기만 남긴다 (2026.09.24) */
      check("newbalance: 점검 시간은 실측 표기만", data.body.includes("약 2시간") && data.body.includes("5분 이내") && !data.body.includes("95.8%"), "");
    }
    if (label === "1440" && slug === "gangwon") {
      check("gangwon: 단정 제거", !data.body.includes("공동구매로의 이동이었습니다"), "");
      check("gangwon: 관찰·추정·검증", ["관찰 사실", "추정", "다음 검증"].every((text) => data.body.includes(text)), "");
      check("gangwon: 측정 구조 설계", data.body.includes("분리해서 볼 수 있도록 측정 구조를 설계했습니다"), "");
    }
    if (label === "1440" && slug === "automation") {
      check("automation: 재사용 기반 메시지", data.h1.includes("반복할 수 있는 기반"), data.h1);
      check("automation: fail-closed", data.body.includes("데이터가 정상이라는 증거가 없으면 실행하지 않습니다"), "");
      check("automation: 사용 도구 라벨", data.body.includes("사용 도구") && !data.body.includes("담당 매체"), "");
    }
    if ((label === "390" || label === "1440") && ["dyson", "daekyo", "automation"].includes(slug)) {
      await page.screenshot({ path: path.join(outputDir, `project-${slug}-${label}.png`), fullPage: true });
    }
  }
  await context.close();
}

async function routeAndFileAudit(browser) {
  const api = await request.newContext();
  const expected = [
    "/",
    "/resume/",
    "/projects/dyson/",
    "/projects/jestina/",
    "/projects/daekyo/",
    "/projects/newbalance/",
    "/projects/gangwon/",
    "/projects/automation/",
    "/404.html",
  ];
  for (const pathname of expected) {
    const response = await api.get(origin + basePath + pathname);
    check(`경로 ${pathname}`, response.ok(), response.status());
  }
  const pdf = await api.get(origin + basePath + "/kim-seonil-resume-public.pdf");
  const pdfBytes = await pdf.body();
  check("PDF 이력서 다운로드", pdf.ok() && pdfBytes.slice(0, 4).toString() === "%PDF", `${pdf.status()} / ${pdfBytes.length}`);
  const heroPoster = await api.get(origin + basePath + "/media/metal-human-poster.webp");
  const heroPosterBytes = await heroPoster.body();
  check("Hero 포스터", heroPoster.ok() && heroPosterBytes.length > 50000, `${heroPoster.status()} / ${heroPosterBytes.length}`);
  const heroVideo = await api.get(origin + basePath + "/media/metal-human-loop.mp4");
  const heroVideoBytes = await heroVideo.body();
  check(
    "Hero 영상",
    heroVideo.ok() && heroVideoBytes.length > 100000 && heroVideoBytes.length < 2000000,
    `${heroVideo.status()} / ${heroVideoBytes.length}`,
  );
  const robots = await api.get(origin + basePath + "/robots.txt");
  const robotsText = await robots.text();
  check("robots 전체 차단", robots.ok() && /Disallow:\s*\//i.test(robotsText), `${robots.status()} / ${robotsText}`);
  const sitemap = await api.get(origin + basePath + "/sitemap.xml");
  check("sitemap 비활성", sitemap.status() === 404, sitemap.status());

  const context = await browser.newContext({ viewport: { width: 768, height: 1024 } });
  const page = await context.newPage();
  await page.goto(origin + basePath + "/resume/", { waitUntil: "networkidle" });
  const resume = await page.evaluate(() => ({
    h1: document.querySelector("h1")?.textContent || "",
    order: [...document.querySelectorAll("article section h3")].map((node) => node.textContent || ""),
    pdfHref: document.querySelector('a[download]')?.getAttribute("href") || "",
    body: document.body.innerText,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  check("이력서 영문명", clean(resume.h1).includes("KIM SEONILL"), clean(resume.h1));
  check("이력서 경력 표기", resume.body.includes("총 경력 4년"), "");
  check("이력서 프로젝트 순서", resume.order.findIndex((text) => text.includes("다이슨")) < resume.order.findIndex((text) => text.includes("제이에스티나")), JSON.stringify(resume.order.slice(0, 8)));
  check("이력서 PDF 링크", resume.pdfHref.endsWith("/kim-seonil-resume-public.pdf"), resume.pdfHref);
  check("이력서 가로 오버플로", resume.overflow <= 1, resume.overflow);
  check("이력서 제이에스티나 성과 압축", !resume.body.includes("매체 ROAS 808%") && !resume.body.includes("브랜드검색 쿼리수"), "");
  await page.screenshot({ path: path.join(outputDir, "resume-768.png"), fullPage: true });
  await page.goto(origin + basePath + "/404.html", { waitUntil: "networkidle" });
  const notFoundBody = await page.locator("body").innerText();
  check("404 안내와 복귀 링크", notFoundBody.includes("요청한 페이지를 찾을 수 없습니다") && notFoundBody.includes("대표 사례로 돌아가기"), "");
  await page.screenshot({ path: path.join(outputDir, "404-768.png"), fullPage: true });
  await context.close();
  await api.dispose();
}

async function fallbackAudit(browser) {
  const jsOff = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } });
  const page = await jsOff.newPage();
  await page.goto(homeUrl, { waitUntil: "domcontentloaded" });
  const text = await page.locator("body").innerText();
  check("JavaScript 비활성 콘텐츠", text.includes("아이디어를 실행으로") && text.length > 4000, text.length);
  await jsOff.close();

  const reduced = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 390, height: 844 } });
  const reducedPage = await reduced.newPage();
  await reducedPage.goto(homeUrl, { waitUntil: "networkidle" });
  const values = await reducedPage.evaluate(() => ({
    scroll: getComputedStyle(document.documentElement).scrollBehavior,
    marquee: document.querySelector(".marquee__track")
      ? getComputedStyle(document.querySelector(".marquee__track")).animationDuration
      : "0s",
    transition: document.querySelector("a")
      ? getComputedStyle(document.querySelector("a")).transitionDuration
      : "0s",
    heroVideo: (() => {
      const video = document.querySelector('[data-hero-media="metal-human"] video');
      return video
        ? { paused: video.paused, display: getComputedStyle(video).display }
        : { paused: false, display: "missing" };
    })(),
  }));
  check(
    "prefers-reduced-motion",
    values.scroll === "auto" &&
      Number.parseFloat(values.marquee) <= 0.00002 &&
      Number.parseFloat(values.transition) <= 0.00002 &&
      values.heroVideo.paused &&
      values.heroVideo.display === "none",
    JSON.stringify(values),
  );
  await reduced.close();
}

(async () => {
  const executablePath = process.env.QA_BROWSER || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  const browser = await chromium.launch({ headless: true, executablePath });
  try {
    await homeAudit(browser, "390", 390, 844);
    await homeAudit(browser, "768", 768, 1024);
    await homeAudit(browser, "1440", 1440, 900);
    await projectAudit(browser, "390", 390, 844);
    await projectAudit(browser, "768", 768, 1024);
    await projectAudit(browser, "1440", 1440, 900);
    await routeAndFileAudit(browser);
    await fallbackAudit(browser);
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
