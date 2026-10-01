/**
 * 판별 이력서 PDF 인쇄 — out/ 을 그 판의 basePath 로 서빙하고 print_resume_cdp 를 돌린다.
 *
 * 왜 빌드 안으로 들어왔나
 *   PDF 는 public/ 에 있는 정적 파일 하나였다. Next 가 public/ 을 out/ 으로 복사하므로
 *   두 판이 같은 PDF 를 배포했고, 그 파일은 HLL 판에서 인쇄된 것이었다. 결과적으로
 *   사외 지원용인 일반판이 내려주는 이력서 PDF 에 사내 메일(kim.seonill@hll.kr)과
 *   HLL 판 주소(/kim-seonil-portfolio_HLL/)가 그대로 실려 있었다.
 *   화면에서 사내 메일을 뺀 것과 같은 종류의 누출이라, 사람이 기억해서 돌리는 단계로
 *   두지 않고 판 빌드에 묶는다. OG 자산을 판마다 복원하는 것과 같은 이유다.
 *
 * 사용: node scripts/print_resume_edition.mjs <edition>
 */
import { createServer } from "node:http";
import { spawn } from "node:child_process";
import { createReadStream, existsSync, statSync } from "node:fs";
import { extname, join, normalize, resolve } from "node:path";

const edition = process.argv[2] ?? "hll";
const BASE = {
  hll: "/kim-seonil-portfolio_HLL",
  general: "/kim-seonil-portfolio",
  /* next.config.ts 의 defaultBasePath 와 같은 값이어야 한다 — 밑줄이다 */
  shinsegae: "/kim-seonil-portfolio_shinsegae",
  ably: "/kim-seonil-portfolio_ABLY",
  v260908: "/kim-seonil-portfolio_260908",
  nw: "/kim-seonil-portfolio_new",
}[edition];
if (!BASE) {
  console.error(`[print_resume_edition] 알 수 없는 판: ${edition}`);
  process.exit(1);
}

const ROOT = resolve("out");
const PORT = 8123;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".woff2": "font/woff2",
  ".pdf": "application/pdf",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".ico": "image/x-icon",
};

const server = createServer((req, res) => {
  let p = decodeURIComponent((req.url ?? "/").split("?")[0]);
  /* basePath 를 붙여 서빙한다 — 그래야 빌드된 절대경로 자산이 그대로 맞는다 */
  if (p === BASE) p = "/";
  else if (p.startsWith(BASE + "/")) p = p.slice(BASE.length);
  let file = join(ROOT, normalize(p).replace(/^(\.\.[/\\])+/, ""));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    res.writeHead(404).end("not found");
    return;
  }
  res.writeHead(200, { "content-type": TYPES[extname(file).toLowerCase()] ?? "application/octet-stream" });
  createReadStream(file).pipe(res);
});

await new Promise((resolve, reject) => {
  server.once("error", (e) => {
    console.error(
      e.code === "EADDRINUSE"
        ? `[print_resume_edition] 포트 ${PORT} 가 이미 쓰이고 있습니다. 이전 인쇄용 서버가 남아 있는지 확인하세요.`
        : `[print_resume_edition] 서버 기동 실패: ${e.message}`,
    );
    process.exit(1);
  });
  server.listen(PORT, "127.0.0.1", resolve);
});

/*
 * spawn(비동기)이어야 한다. spawnSync 로 기다리면 이 프로세스의 이벤트 루프가 멈춰
 * 위에서 띄운 서버가 요청에 응답하지 못한다. 그러면 Chrome 이 응답 없는 요청을
 * 무한정 기다리고 Page.navigate 가 끝나지 않아 빌드가 멈춘다 — 실제로 12분 매달렸다.
 */
const child = spawn(process.execPath, ["scripts/print_resume_cdp.mjs", `http://127.0.0.1:${PORT}`], {
  stdio: "inherit",
  env: { ...process.env, BASE_PATH: BASE, EDITION: edition, RESUME_EDITION: edition },
});
const code = await new Promise((r) => {
  child.on("error", (e) => {
    console.error(`[print_resume_edition] 실행 실패: ${e.message}`);
    r(1);
  });
  child.on("close", (c) => r(c ?? 1));
});

server.close();
process.exit(code);
