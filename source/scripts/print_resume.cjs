const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const origin = process.env.QA_ORIGIN || "http://localhost:8024";
const outputDir = path.resolve("tmp", "qa-2026-08-13");
fs.mkdirSync(outputDir, { recursive: true });

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.QA_BROWSER || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
  });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    await page.goto(origin + "/kim-seonil-portfolio_HLL/resume/", { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "print" });
    for (const scale of [0.75, 0.8, 0.85]) {
      await page.pdf({
        path: path.join(outputDir, `resume-scale-${String(scale).replace(".", "")}.pdf`),
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        scale,
        margin: { top: "0", right: "0", bottom: "0", left: "0" },
      });
    }
  } finally {
    await browser.close();
  }
})();
