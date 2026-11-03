/*
 * 링크드인 소개 영상(20초 · 30fps · 소리 없음)을 굽는다 (2026.10.31 v2 · 2026.11.01 v3 장면 순서, LINKEDIN.md 5절).
 *   node scripts/render_linkedin_video.cjs 1x1     → assets/linkedin/intro-1x1.mp4  (1080×1080, 피드 기본) + intro-1x1.png(대표 화면)
 *   node scripts/render_linkedin_video.cjs 16x9    → assets/linkedin/intro-16x9.mp4 (1920×1080) + intro-16x9.png
 *   node scripts/render_linkedin_video.cjs 9x16    → assets/linkedin/intro-9x16.mp4 (1080×1920, 세로 피드) + intro-9x16.png
 *   … --at 0.2,3.3,6.8 → 그 순간만 PNG 로(확인용, 작업 폴더에)
 *   --work <폴더>: 중간 파일 자리(기본: 운영체제 임시 폴더) · --site <주소>: 캡처할 사이트(기본: 라이브)
 *   --order s3,s1,s2,… : 장면 순서를 바꿔 굽는다(비교용 · intro-video.html 의 기본 순서 대신) · --out <폴더>: 결과 자리(기본 assets/linkedin)
 *
 * 화면은 assets/linkedin/intro-video.html 의 render(t) 가 그린다 — 프레임마다 PNG 로 찍어 ffmpeg 로 넘긴다.
 * 6장면의 포트폴리오 화면은 사이트를 캡처해 쓴다(모바일 390px · 데스크톱 1440px, 늦게 불러오는 사진까지 다 불러온 뒤).
 * 배경은 Higgsfield 로 만든 5초 영상(assets/linkedin/hf-intro-bg.mp4, 1280×720 · 24fps)을 약 4배 느리게 늘려 20초로 쓴다
 * (바늘이 한 방향으로 천천히 돈다). 사이 프레임은 움직임 보간 — 보간은 끝 0.1초를 못 만들어 4.1배로 늘려 600프레임을 채운다.
 * 배경은 투명한 장면(2 · 7)에서만 보인다. 가로판은 원을 오른쪽으로 옮기고 비는 왼쪽 띠는 가장자리를 거울로 채운다.
 * 프레임마다 화면 밖으로 나간 글자를 검사하고(장면이 멈춘 구간), 끝에 600프레임인지 확인한다.
 * 사이트 빌드와는 상관없다(source/ 는 사이트에 올라가지 않는다). ffmpeg 가 PATH 에 있어야 한다.
 */
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn, spawnSync } = require("child_process");
const { chromium } = require("playwright");

const FMTS = { "16x9": [1920, 1080], "1x1": [1080, 1080], "9x16": [1080, 1920] };
const FMT = Object.keys(FMTS).find((f) => process.argv.includes(f)) || (process.argv.includes("square") ? "1x1" : "1x1");
const [W, H] = FMTS[FMT];
const FPS = 30, SECONDS = 20;
const argAfter = (flag) => { const i = process.argv.indexOf(flag); return i > 0 ? process.argv[i + 1] : null; };
const AT = argAfter("--at") ? argAfter("--at").split(",").map(Number) : null;
const WORK = path.resolve(argAfter("--work") || path.join(os.tmpdir(), "ksi-linkedin-video"));
const SITE = argAfter("--site") || "https://vetnam555-del.github.io/kim-seonil-portfolio/";
const ASSETS = path.resolve("assets", "linkedin");
const OUT = path.resolve(argAfter("--out") || ASSETS);
const ORDER = argAfter("--order");
const BG_SRC = path.join(ASSETS, "hf-intro-bg.mp4");
const SHIFT = 440;    // 가로판: 원을 오른쪽으로 옮기는 폭(px)
const CHROME = process.env.CHROME_PATH || (process.platform === "win32" ? "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" : undefined);

function ffmpeg(args) {
  const r = spawnSync("ffmpeg", ["-v", "error", "-y", ...args], { stdio: "inherit" });
  if (r.status !== 0) throw new Error(`ffmpeg 실패(${r.status}): ${args.join(" ")}`);
}

/* 600프레임(20초 · 30fps) — 모자라면 영상 끝이 잘린다 */
function mustHaveAllFrames(file) {
  const r = spawnSync("ffprobe", ["-v", "error", "-count_frames", "-select_streams", "v", "-show_entries", "stream=nb_read_frames", "-of", "csv=p=0", file], { encoding: "utf8" });
  const n = parseInt(r.stdout, 10);
  if (n !== FPS * SECONDS) throw new Error(`${path.basename(file)}: 프레임 ${n}개 — ${FPS * SECONDS}개여야 한다`);
}

/* 20초 배경 — 느리게 늘린 것(오래 걸린다)은 원본이나 늘리는 방법이 바뀔 때만 다시 만들고, 판별 자리 · 색만 매번 입힌다 */
function buildBackground() {
  const vf = `setpts=4.1*PTS,minterpolate=fps=${FPS}:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1,trim=duration=${SECONDS}`;
  const slow = path.join(WORK, `bg-slow-${crypto.createHash("md5").update(vf).digest("hex").slice(0, 8)}.mp4`);
  if (!fs.existsSync(slow) || fs.statSync(slow).mtimeMs < fs.statSync(BG_SRC).mtimeMs) {
    console.log("[video] 배경을 20초로 늘리는 중(움직임 보간이라 3~5분 걸린다)");
    ffmpeg(["-i", BG_SRC, "-an", "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "8", "-pix_fmt", "yuv420p", slow]);
  }
  const frame = {
    "16x9": `scale=1920:1080:flags=lanczos,split[m][s];[m]crop=${SHIFT}:1080:0:0,hflip[l];[l][s]hstack=2,crop=1920:1080:0:0`,
    "1x1": "scale=1920:1080:flags=lanczos,crop=1080:1080:340:0",
    "9x16": "scale=-2:1920:flags=lanczos,crop=1080:1920:(iw-1080)/2:0",
  }[FMT];
  const out = path.join(WORK, `bg-${FMT}.mp4`);
  ffmpeg(["-i", slow, "-filter_complex", `[0:v]${frame},eq=brightness=-0.03:saturation=0.9,trim=duration=${SECONDS},setpts=PTS-STARTPTS[v]`,
    "-map", "[v]", "-c:v", "libx264", "-preset", "veryfast", "-crf", "8", "-pix_fmt", "yuv420p", out]);
  mustHaveAllFrames(out);
  return out;
}

/* 6장면에 쓸 사이트 화면 — 정지 화면 한 장(전체 길이)을 찍어 두고 영상 안에서 내린다 */
async function captureSite(browser) {
  const mobile = FMT !== "16x9";
  const out = path.join(WORK, `site-${mobile ? "mobile" : "desktop"}.jpg`);
  const ctx = await browser.newContext({
    viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
    deviceScaleFactor: mobile ? 2 : 1, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce",
  });
  const page = await ctx.newPage();
  const step = (m) => console.log(`[video] 사이트 캡처 — ${m}`);
  step(`${SITE} (${mobile ? "모바일" : "데스크톱"})`);
  await page.goto(SITE, { waitUntil: "load", timeout: 60000 });
  const within = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
  await page.evaluate((ms) => Promise.race([window.__ksiFontsReady || document.fonts.ready, new Promise((r) => setTimeout(r, ms))]), 10000);
  await page.addStyleTag({ content: "*{content-visibility:visible !important} [data-enter]{opacity:1 !important;transform:none !important}" });
  step("사진 불러오기");
  /* 늦게 불러오는 사진까지 — 안 그러면 사례 카드가 빈칸으로 찍힌다 */
  await within(page.evaluate(async () => {
    document.querySelectorAll("img").forEach((i) => { i.loading = "eager"; });
    for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 40)); }
    window.scrollTo(0, 0);
    const waitAll = Promise.all([...document.images].map((i) => (i.complete ? null : new Promise((r) => { i.addEventListener("load", r); i.addEventListener("error", r); }))));
    await Promise.race([waitAll, new Promise((r) => setTimeout(r, 15000))]);
  }), 30000);
  await page.waitForTimeout(600);
  const blank = await page.evaluate(() => [...document.images].filter((i) => !i.naturalWidth).map((i) => i.src));
  if (blank.length) throw new Error(`사이트 사진이 안 불러와졌다: ${blank.slice(0, 3).join(", ")}`);
  step("전체 화면 찍기");
  await page.screenshot({ path: out, fullPage: true, type: "jpeg", quality: 90, timeout: 120000 });
  step("끝");
  await ctx.close();
  return out;
}

async function openStage(browser, shotFile) {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  const file = path.join(ASSETS, "intro-video.html").replace(/\\/g, "/");
  const shotUrl = "file://" + (shotFile.startsWith("/") ? "" : "/") + shotFile.replace(/\\/g, "/");
  await page.goto(`file://${file.startsWith("/") ? "" : "/"}${file}?fmt=${FMT}&shot=${encodeURIComponent(shotUrl)}${ORDER ? `&order=${ORDER}` : ""}`);
  await page.evaluate(() => Promise.all([document.fonts.ready, window.ready]));
  const missing = await page.evaluate(() => ["Archivo", "Pretendard"].filter((f) => !document.fonts.check(`700 40px "${f}"`)));
  if (missing.length) throw new Error(`글꼴을 못 불렀다: ${missing.join(", ")} — public/fonts/original 을 확인한다`);
  if (!(await page.evaluate(() => document.getElementById("shot").naturalWidth))) throw new Error("사이트 캡처를 못 불렀다");
  const shot = async (t) => {
    const over = await page.evaluate((tt) => { window.render(tt); return window.overflow(tt); }, t);
    if (over.length) throw new Error(`${t.toFixed(2)}초: 화면 밖으로 나간 것 — ${over.join(", ")}`);
    return page.screenshot({ omitBackground: true, type: "png" });
  };
  shot.thumbT = await page.evaluate(() => window.thumbT); /* 대표 화면 순간 — 장면 순서에 따라 화면 쪽이 정한다 */
  return shot;
}

/* 한 장 — 배경의 t 초 화면 위에 화면 층 */
function composeStill(bg, png, t, out) {
  ffmpeg(["-ss", t.toFixed(3), "-i", bg, "-i", png, "-filter_complex", "[0:v][1:v]overlay=0:0:format=auto", "-frames:v", "1", out]);
}

(async () => {
  fs.mkdirSync(WORK, { recursive: true });
  const bg = buildBackground();
  const browser = await chromium.launch({ headless: true, executablePath: CHROME });
  try {
    const shot = await openStage(browser, await captureSite(browser));
    if (AT) {
      for (const t of AT) {
        const png = path.join(WORK, `layer-${FMT}-${t}.png`);
        fs.writeFileSync(png, await shot(t));
        composeStill(bg, png, t, path.join(WORK, `still-${FMT}-${t}.png`));
        console.log(`[video] ${path.join(WORK, `still-${FMT}-${t}.png`)}`);
      }
      return;
    }

    /* 대표 화면(링크드인에서 썸네일로 고른다) */
    fs.mkdirSync(OUT, { recursive: true });
    const thumb = path.join(WORK, `layer-${FMT}-thumb.png`);
    fs.writeFileSync(thumb, await shot(shot.thumbT));
    composeStill(bg, thumb, shot.thumbT, path.join(OUT, `intro-${FMT}.png`));

    /* 영상 — 화면 층 PNG 를 표준 입력으로 흘려 배경 위에 얹는다 */
    const out = path.join(OUT, `intro-${FMT}.mp4`);
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
      if (i % 150 === 0) console.log(`[video] ${FMT} ${i}/${frames}`);
    }
    ff.stdin.end();
    await done;
    mustHaveAllFrames(out);
    console.log(`[video] ${out} (${(fs.statSync(out).size / 1048576).toFixed(1)}MB)`);
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error(e.message || e); process.exit(1); });
