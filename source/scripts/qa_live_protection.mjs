import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { createBrowserProfile } from "./browser_profile_runtime.mjs";

const browserPath =
  process.env.QA_BROWSER ||
  "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const targetUrl =
  process.argv[2] ||
  "https://vetnam555-del.github.io/kim-seonil-portfolio/?verify=live-protection";
const debugPort = 9900 + Math.floor(Math.random() * 80);
const profileDir = createBrowserProfile("live-protection");
const outputDir = resolve("tmp");
const sleep = (ms) => new Promise((resolveSleep) => setTimeout(resolveSleep, ms));

mkdirSync(outputDir, { recursive: true });

const browser = spawn(
  browserPath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--remote-debugging-port=" + debugPort,
    "--user-data-dir=" + profileDir,
    "about:blank",
  ],
  { stdio: "ignore" },
);

let targets;
for (let attempt = 0; attempt < 80 && !targets; attempt += 1) {
  try {
    targets = await (await fetch("http://127.0.0.1:" + debugPort + "/json/list")).json();
  } catch {
    await sleep(250);
  }
}

if (!targets) {
  browser.kill();
  throw new Error("Headless browser did not expose a debugging target.");
}

const pageTarget = targets.find((target) => target.type === "page");
const socket = new WebSocket(pageTarget.webSocketDebuggerUrl);
let requestId = 0;
const pending = new Map();

socket.addEventListener("message", (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    pending.get(message.id)(message.result);
    pending.delete(message.id);
  }
});

await new Promise((resolveOpen) => socket.addEventListener("open", resolveOpen));

const send = (method, params = {}) =>
  new Promise((resolveRequest) => {
    const id = ++requestId;
    pending.set(id, resolveRequest);
    socket.send(JSON.stringify({ id, method, params }));
  });

const probeExpression = `(() => {
  const watermark = document.querySelector('.content-owner-mark');
  const dispatch = (event) => {
    document.body.dispatchEvent(event);
    return event.defaultPrevented;
  };
  const images = [...document.images];
  return {
    url: location.href,
    title: document.title,
    readyState: document.readyState,
    bodyClass: document.body.className,
    userSelect: getComputedStyle(document.body).userSelect,
    watermark: watermark ? watermark.textContent : '',
    watermarkVisible: !!watermark && watermark.getBoundingClientRect().width > 0,
    watermarkRect: watermark ? {
      left: Math.round(watermark.getBoundingClientRect().left),
      top: Math.round(watermark.getBoundingClientRect().top),
      right: Math.round(watermark.getBoundingClientRect().right),
      bottom: Math.round(watermark.getBoundingClientRect().bottom)
    } : null,
    imageCount: images.length,
    protectedImages: images.filter((image) =>
      image.getAttribute('draggable') === 'false' &&
      image.getAttribute('data-protected-asset') === 'true'
    ).length,
    copyBlocked: dispatch(new Event('copy', { bubbles: true, cancelable: true })),
    cutBlocked: dispatch(new Event('cut', { bubbles: true, cancelable: true })),
    selectBlocked: dispatch(new Event('selectstart', { bubbles: true, cancelable: true })),
    dragBlocked: dispatch(new Event('dragstart', { bubbles: true, cancelable: true })),
    contextMenuBlocked: dispatch(new MouseEvent('contextmenu', { bubbles: true, cancelable: true, button: 2 })),
    copyShortcutBlocked: dispatch(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'c', ctrlKey: true })),
    devtoolsShortcutBlocked: dispatch(new KeyboardEvent('keydown', { bubbles: true, cancelable: true, key: 'F12' })),
    horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    metadata: [...document.querySelectorAll('meta[name="copyright"], meta[name="content-owner"], meta[name="usage-rights"]')]
      .map((meta) => ({ name: meta.getAttribute('name'), content: meta.getAttribute('content') })),
  };
})()`;

async function waitForProtection() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const result = await send("Runtime.evaluate", {
      /* 세로 워터마크는 2026.09.25 에 뺐다 — 이미지 보호 표시가 붙었는지로 준비 완료를 판단한다 */
      expression: "document.readyState === 'complete' && !!document.querySelector('[data-protected-asset]')",
      returnByValue: true,
    });
    if (result?.result?.value) return;
    await sleep(250);
  }
  throw new Error("Protection marker did not appear on the live page.");
}

async function auditViewport(label, width, height, mobile) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
  });
  await send("Page.navigate", { url: targetUrl + "&viewport=" + label });
  await waitForProtection();
  await sleep(700);

  const result = await send("Runtime.evaluate", {
    expression: probeExpression,
    returnByValue: true,
  });
  const audit = result?.result?.value;
  if (!audit) throw new Error("Live protection probe returned no value for " + label + ".");

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  const screenshotPath = resolve(outputDir, "live-protection-" + label + ".png");
  writeFileSync(screenshotPath, Buffer.from(screenshot.data, "base64"));

  return { label, width, height, screenshotPath, ...audit };
}

try {
  await send("Page.enable");
  await send("Runtime.enable");
  const desktop = await auditViewport("desktop", 1440, 1000, false);
  const mobile = await auditViewport("mobile", 375, 812, true);
  const results = [desktop, mobile];

  const failures = results.flatMap((result) => {
    const failed = [];
    if (result.bodyClass !== "content-protected") failed.push("body class");
    if (result.userSelect !== "none") failed.push("user-select");
    if (!result.watermarkVisible) failed.push("watermark");
    if (result.protectedImages !== result.imageCount) failed.push("image drag protection");
    if (!result.copyBlocked || !result.cutBlocked || !result.selectBlocked) failed.push("clipboard/selection events");
    if (!result.dragBlocked || !result.contextMenuBlocked) failed.push("drag/context menu events");
    if (!result.copyShortcutBlocked || !result.devtoolsShortcutBlocked) failed.push("keyboard shortcuts");
    if (result.horizontalOverflow) failed.push("horizontal overflow");
    if (result.metadata.length !== 3) failed.push("ownership metadata");
    return failed.map((item) => result.label + ": " + item);
  });

  console.log(JSON.stringify({ targetUrl, results, failures }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
} finally {
  socket.close();
  browser.kill();
}
