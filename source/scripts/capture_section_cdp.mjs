import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";
import { createBrowserProfile } from "./browser_profile_runtime.mjs";

const browserPath =
  process.env.QA_BROWSER || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const url = process.argv[2];
const selector = process.argv[3] || "body";
const width = Number(process.argv[4] || 1440);
const height = Number(process.argv[5] || 900);
const output = path.resolve(process.argv[6] || "tmp/qa-section.png");
const port = 9600 + Math.floor(Math.random() * 300);
const profile = createBrowserProfile("capture-profile");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

if (!url) {
  console.error("Usage: node scripts/capture_section_cdp.mjs <url> <selector> <width> <height> <output>");
  process.exit(1);
}

const browser = spawn(
  browserPath,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${profile}`,
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

let targets;
for (let attempt = 0; attempt < 60; attempt += 1) {
  try {
    targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    break;
  } catch {
    await sleep(250);
  }
}
if (!targets) {
  browser.kill();
  throw new Error("Browser did not expose a debugging target.");
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
await new Promise((resolve) => socket.addEventListener("open", resolve));
const send = (method, params = {}) =>
  new Promise((resolve) => {
    const id = ++requestId;
    pending.set(id, resolve);
    socket.send(JSON.stringify({ id, method, params }));
  });

try {
  await send("Page.enable");
  await send("Runtime.enable");
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send("Page.navigate", { url });
  await sleep(3500);

  const preparation = await send("Runtime.evaluate", {
    expression: `(async()=>{
      document.querySelectorAll('img').forEach((image)=>{image.loading='eager';});
      await document.fonts.ready;
      const root=document.documentElement;
      root.style.scrollBehavior='auto';
      for(let y=0;y<root.scrollHeight;y+=640){
        window.scrollTo(0,y);
        await new Promise((resolve)=>setTimeout(resolve,24));
      }
      const target=document.querySelector(${JSON.stringify(selector)});
      if(!target)return {found:false};
      target.scrollIntoView({behavior:'instant',block:'start'});
      await new Promise((resolve)=>setTimeout(resolve,700));
      const brokenImageSources=[...document.images]
        .filter((image)=>!image.complete||image.naturalWidth===0)
        .map((image)=>image.currentSrc||image.src||'(empty)');
      return {
        found:true,
        overflow:root.scrollWidth-root.clientWidth,
        brokenImages:brokenImageSources.length,
        brokenImageSources,
        rect:(()=>{const r=target.getBoundingClientRect();return {top:r.top,left:r.left,width:r.width,height:r.height};})(),
        text:(target.innerText||'').replace(/\s+/g,' ').trim().slice(0,180),
      };
    })()`,
    awaitPromise: true,
    returnByValue: true,
  });
  const metrics = preparation?.result?.value ?? { found: false };
  if (!metrics.found) throw new Error(`Selector not found: ${selector}`);
  if (metrics.overflow > 1) throw new Error(`Horizontal overflow: ${metrics.overflow}px`);
  if (metrics.brokenImages > 0) {
    throw new Error(`Broken images: ${metrics.brokenImages} ${metrics.brokenImageSources.join(", ")}`);
  }

  const screenshot = await send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: false,
  });
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, Buffer.from(screenshot.data, "base64"));
  console.log(JSON.stringify({ url, selector, width, height, output, ...metrics }));
} finally {
  socket.close();
  browser.kill();
}
