const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.goto(`file:///${path.resolve("scripts", "og-source.html").replace(/\\/g, "/")}`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.resolve("public", "og-image.png") });
  await browser.close();
})();
