/*
 * 링크드인 소개 영상(15초 · 30fps · 소리 없음)을 굽는다 (2026.10.31, LINKEDIN.md 5절).
 *   node scripts/render_linkedin_video.cjs                 → assets/linkedin/intro-16x9.mp4 (1920×1080) + intro-16x9.png(대표 화면)
 *   node scripts/render_linkedin_video.cjs square          → assets/linkedin/intro-1x1.mp4  (1080×1080) + intro-1x1.png
 *   node scripts/render_linkedin_video.cjs 16x9 --at 3.2,8.9,13.5   → 그 순간만 PNG 로(확인용, 작업 폴더에)
 *   --work <폴더> 로 중간 파일 자리를 정한다(기본: 운영체제 임시 폴더).
 *
 * 글자 층은 assets/linkedin/intro-video.html 의 render(t) 가 그린다 — 프레임마다 투명 PNG 로 찍어 ffmpeg 로 넘긴다.
 * 배경은 Higgsfield 로 만든 5초 영상(assets/linkedin/hf-intro-bg.mp4, 1280×720 · 24fps)을 약 3배 느리게 늘려 15초로 쓴다
 * (바늘이 한 방향으로 천천히 돈다 — 앞뒤로 되감으면 바늘이 거꾸로 돌아 어색하다). 사이 프레임은 움직임 보간으로 채운다.
 * 보간은 마지막 0.1초를 만들지 못한다(정확히 3배면 447프레임) — 3.05배로 늘려 450프레임을 채운다.
 * 가로판은 원을 오른쪽으로 옮기고(글자가 왼쪽) 비는 왼쪽 띠는 가장자리를 거울로 채운다 — 그 자리는 글자 그늘이 가장 짙다.
 * 사이트 빌드와는 상관없다(source/ 는 사이트에 올라가지 않는다). ffmpeg 가 PATH 에 있어야 한다.
 */
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { chromium } = require("playwright");

const SQUARE = process.argv.includes("square") || process.argv.includes("1x1");
const FMT = SQUARE ? "1x1" : "16x9";
const W = SQUARE ? 1080 : 1920, H = 1080, FPS = 30, SECONDS = 15;
const argAfter = (flag) => { const i = process.argv.indexOf(flag); return i > 0 ? process.argv[i + 1] : null; };
const AT = argAfter("--at") ? argAfter("--at").split(",").map(Number) : null;
const WORK = path.resolve(argAfter("--work") || path.join(os.tmpdir(), "ksi-linkedin-video"));
const ASSETS = path.resolve("assets", "linkedin");
const BG_SRC = path.join(ASSETS, "hf-intro-bg.mp4");
const THUMB_T = 3.2; // 제목 · 소개 한 줄이 다 들어오고 나가기 전
const SHIFT = 440;   // 가로판: 원을 오른쪽으로 옮기는 폭(px)
const SQUARE_X = 340; // 정사각판: 1920 폭 배경에서 잘라 낼 왼쪽 끝 — 원이 가운데보다 조금 오른쪽에 온다

function ffmpeg(args, opts = {}) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit", ...opts });
  if (r.status !== 0) throw new Error(`ffmpeg 실패(${r.status}): ${args.join(" ")}`);
}

/* 15초 배경 — 느리게 늘린 것(오래 걸린다)은 원본이 바뀔 때만 다시 만들고, 자리 · 색만 매번 입힌다 */
function buildBackground() {
  const vf = `setpts=3.05*PTS,minterpolate=fps=${FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,trim=duration=${SECONDS}`;
  const slow = path.join(WORK, `bg-slow-${crypto.createHash("md5").update(vf).digest("hex").slice(0, 8)}.mp4`);
  if (!fs.existsSync(slow) || fs.statSync(slow).mtimeMs < fs.statSync(BG_SRC).mtimeMs) {
    console.log("[video] 배경을 15초로 늘리는 중(움직임 보간이라 2~3분 걸린다)");
    ffmpeg(["-i", BG_SRC, "-an", "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "8", "-pix_fmt", "yuv420p", slow]);
  }
  const out = path.join(WORK, `bg-${FMT}.mp4`);
  const look = "eq=brightness=-0.03:saturation=0.9";
  const frame = SQUARE
    ? `scale=1920:1080:flags=lanczos,crop=1080:1080:${SQUARE_X}:0`
    : `scale=1920:1080:flags=lanczos,split[m][s];[m]crop=${SHIFT}:1080:0:0,hflip[l];[l][s]hstack=2,crop=1920:1080:0:0`;
  ffmpeg(["-i", slow, "-filter_complex", `[0:v]${frame},${look},trim=duration=${SECONDS},setpts=PTS-STARTPTS[v]`,
    "-map", "[v]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "8", "-pix_fmt", "yuv420p", out]);
  mustHaveAllFrames(out);
  return out;
}

/* 15초 · 30fps 면 450프레임 — 모자라면 영상 끝이 잘린다 */
function mustHaveAllFrames(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", file], { encoding: "utf8" });
  const n = parseInt(r.stdout, 10);
  if (n !== FPS * SECONDS) throw new Error(`${path.basename(file)}: 프레임 ${n}개 — ${FPS * SECONDS}개여야 한다`);
}

async function openTextLayer() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: process.env.CHROME_PATH || (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : undefined),
  });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const file = path.join(ASSETS, "intro-video.html").replace(/\\/g, "/");
  await page.goto(`file://${file.startsWith("/") ? "" : "/"}${file}${SQUARE ? "?square" : ""}`);
  await page.evaluate(() => document.fonts.ready);
  const missing = await page.evaluate(() => ["Archivo", "Pretendard"].filter((f) => !document.fonts.check(`700 40px "${f}"`)));
  if (missing.length) throw new Error(`글꼴을 못 불렀다: ${missing.join(", ")} — public/fonts/original 을 확인한다`);
  const shot = async (t) => {
    const over = await page.evaluate((tt) => { window.render(tt); return window.overflow(); }, t);
    if (over.length) throw new Error(`${t.toFixed(2)}초: 화면 밖으로 나간 글자 — ${over.join(", ")}`);
    return page.screenshot({ omitBackground: true, type: "png" });
  };
  return { browser, shot };
}

/* 한 장 — 배경의 t 초 화면 위에 글자 층 */
function composeStill(bg, png, t, out) {
  ffmpeg(["-ss", t.toFixed(3), "-i", bg, "-i", png, "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto", "-frames:v", "1", out]);
}

(async () => {
  fs.mkdirSync(WORK, { recursive: true });
  const bg = buildBackground();
  const { browser, shot } = await openTextLayer();
  try {
    if (AT) {
      for (const t of AT) {
        const png = path.join(WORK, `text-${FMT}-${t}.png`);
        fs.writeFileSync(png, await shot(t));
        composeStill(bg, png, t, path.join(WORK, `still-${FMT}-${t}.png`));
        console.log(`[video] ${path.join(WORK, `still-${FMT}-${t}.png`)}`);
      }
      return;
    }

    /* 대표 화면(링크드인 썸네일로 올린다) */
    const thumbText = path.join(WORK, `text-${FMT}-thumb.png`);
    fs.writeFileSync(thumbText, await shot(THUMB_T));
    composeStill(bg, thumbText, THUMB_T, path.join(ASSETS, `intro-${FMT}.png`));

    /* 영상 — 글자 층 PNG 를 표준 입력으로 흘려 배경 위에 얹는다 */
    const out = path.join(ASSETS, `intro-${FMT}.mp4`);
    const ff = spawn("ffmpeg", ["-v", "error", "-y",
      "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
      "-i", bg,
      "-filter_complex", "[1:v][0:v]overlay=0:0:format=auto:shortest=1,format=yuv420p[v]",
      "-map", "[v]", "-an", "-r", String(FPS), "-t", String(SECONDS),
      "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out,
    ], { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((ok, fail) => ff.on("close", (c) => (c === 0 ? ok() : fail(new Error(`ffmpeg 실패(${c})`)))));
    const frames = FPS * SECONDS;
    for (let i = 0; i < frames; i++) {
      const buf = await shot(i / FPS);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      if (i % 90 === 0) console.log(`[video] ${FMT} ${i}/${frames}`);
    }
    ff.stdin.end();
    await done;
    mustHaveAllFrames(out);
    console.log(`[video] ${out} (${(fs.statSync(out).size / 1048576).toFixed(1)}MB)`);
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e.message || e); process.exit(1); });
