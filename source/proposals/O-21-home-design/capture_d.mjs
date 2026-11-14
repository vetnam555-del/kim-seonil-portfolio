// 제안 D 를 위에서 아래로 내려 보는 영상으로 굽는다. 쪽의 움직임은 engine() 의 tick(t) 가 계산하므로 프레임마다 시간과 스크롤 위치를 주고 찍는다.
// Usage: node capture_d.mjs <base url>/mock-d.html <out.mp4> [width=1440] [height=900] [scale=1] [speed px/s=620] [fps=30]
import { createRequire } from "node:module";
import { spawn } from "node:child_process";
const { chromium } = createRequire(import.meta.url)("playwright");
const [, , url, out, W = "1440", H = "900", SCALE = "1", SPEED = "620", FPS = "30"] = process.argv;
const fps = +FPS;
const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: +W, height: +H }, deviceScaleFactor: +SCALE, isMobile: +W < 600, hasTouch: +W < 600 });
await ctx.addInitScript(() => { window.__capture = true; });
const p = await ctx.newPage();
await p.goto(url, { waitUntil: "load", timeout: 30000 });
await p.evaluate(() => document.fonts.ready);
await p.evaluate(() => Promise.all([...document.images].map((im) => im.decode().catch(() => null))));
const total = await p.evaluate(() => document.documentElement.scrollHeight - innerHeight);
const HOLD0 = 2.6; const HOLD1 = 1.6; const RAMP = 0.9;            // 처음 멈춤 · 끝 멈춤 · 속도 올리고 내리는 시간(초)
const v = +SPEED; const cruise = Math.max(0, (total - v * RAMP) / v); const scrollT = cruise + 2 * RAMP;
const pos = (ts) => {                                               // ts: 스크롤을 시작한 뒤 흐른 시간(초)
  if (ts <= 0) return 0; if (ts >= scrollT) return total;
  if (ts < RAMP) return 0.5 * (v / RAMP) * ts * ts;
  if (ts < RAMP + cruise) return 0.5 * v * RAMP + v * (ts - RAMP);
  const r = scrollT - ts; return total - 0.5 * (v / RAMP) * r * r;
};
const frames = Math.round((HOLD0 + scrollT + HOLD1) * fps);
const ff = spawn("ffmpeg", ["-v", "error", "-y", "-f", "image2pipe", "-framerate", String(fps), "-c:v", "mjpeg", "-i", "-",
  "-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2", "-c:v", "libx264", "-preset", "medium", "-crf", "21", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out], { stdio: ["pipe", "inherit", "inherit"] });
const done = new Promise((ok, fail) => ff.on("close", (c) => (c === 0 ? ok() : fail(new Error("ffmpeg " + c)))));
for (let i = 0; i < frames; i += 1) {
  const t = i / fps; const y = Math.round(pos(t - HOLD0));
  await p.evaluate(([yy, tt]) => { window.scrollTo(0, yy); window.__d.tick(tt); }, [y, t * 1000]);
  const buf = await p.screenshot({ type: "jpeg", quality: 92 });
  if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
  if (i % 150 === 0) console.log(`frame ${i}/${frames}`);
}
ff.stdin.end(); await done;
console.log(JSON.stringify({ out, frames, seconds: +(frames / fps).toFixed(1), total }));
await browser.close();
