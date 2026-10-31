/*
 * 링크드인 배경 사진을 assets/linkedin/banner.html 에서 굽는다 (2026.10.31, LINKEDIN.md 1절).
 *   node scripts/render_linkedin_banner.cjs a   → assets/linkedin/banner-a.png (글자 배경)
 *   node scripts/render_linkedin_banner.cjs b   → assets/linkedin/banner-b.png (Higgsfield 배경 위 같은 문구)
 * 사이트 빌드와는 상관없다(source/ 는 사이트에 올라가지 않는다).
 */
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const variant = process.argv[2] === "b" ? "b" : "a";
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : undefined),
  });
  const page = await browser.newPage({ viewport: { width: 1584, height: 396 }, deviceScaleFactor: 2 });
  const file = path.resolve("assets", "linkedin", "banner.html").replace(/\\/g, "/");
  await page.goto(`file://${file.startsWith("/") ? "" : "/"}${file}?${variant}`);
  await page.evaluate(() => document.fonts.ready);
  const fit = await page.evaluate(() => document.querySelector("h1").getBoundingClientRect().right <= 1512.5);
  if (!fit) throw new Error("제목이 오른쪽 여백(72px)을 넘었다 — banner.html 의 h1 글자 크기를 줄인다");
  await page.screenshot({ path: path.resolve("assets", "linkedin", `banner-${variant}.png`) });
  await browser.close();
})();
