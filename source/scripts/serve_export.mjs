import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const edition = process.argv[2] ?? "hll";
const root = resolve(process.argv[3] ?? "out");
const port = Number(process.argv[4] ?? 8130);
const basePath = {
  general: "/kim-seonil-portfolio",
  hll: "/kim-seonil-portfolio_HLL",
  shinsegae: "/kim-seonil-portfolio_shinsegae",
  ably: "/kim-seonil-portfolio_ABLY",
  v260908: "/kim-seonil-portfolio_260908",
  nw: "/kim-seonil-portfolio_new",
}[edition];

if (!basePath || !existsSync(root)) {
  console.error(`Invalid export server configuration: ${edition} / ${root}`);
  process.exit(1);
}

const types = {
  ".avif": "image/avif",
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
  ".xml": "application/xml; charset=utf-8",
};

const server = createServer((request, response) => {
  let pathname = decodeURIComponent((request.url ?? "/").split("?")[0]);
  if (pathname === basePath) pathname = "/";
  else if (pathname.startsWith(basePath + "/")) pathname = pathname.slice(basePath.length);

  let file = join(root, normalize(pathname).replace(/^(\.\.[/\\])+/, ""));
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, "index.html");
  if (!existsSync(file)) {
    response.writeHead(404).end("not found");
    return;
  }

  response.writeHead(200, {
    "cache-control": "no-store",
    "content-type": types[extname(file).toLowerCase()] ?? "application/octet-stream",
  });
  createReadStream(file).pipe(response);
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Serving ${edition} at http://127.0.0.1:${port}${basePath}/`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
