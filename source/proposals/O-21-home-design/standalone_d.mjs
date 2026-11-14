// 제안 D 를 파일 하나로 만든다(글꼴 · 이미지를 안에 넣는다) — 서버 없이 바로 열어 스크롤해 볼 수 있다.
// 만든 뒤 네트워크를 끊고 열어 글꼴 · 이미지가 다 뜨는지 확인한다. 쪽 밖으로 나가는 링크는 라이브 주소로 바꾼다.
// content.json 은 사이트 사본 옆(<site dir>/../content.json)에서 읽는다.
// Usage: node standalone_d.mjs <site dir> <out.html>
import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { join, extname, resolve } from "node:path";
import { build } from "./variant_d.mjs";

const [, , siteDir, out] = process.argv;
const d = JSON.parse(readFileSync(join(siteDir, "..", "content.json"), "utf8"));
const MIME = { ".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".jpeg": "image/jpeg" };
const BASE = "/kim-seonil-portfolio/"; const LIVE = "https://vetnam555-del.github.io/kim-seonil-portfolio/";
const asset = (p) => { const rel = p.replace(BASE, "").split("?")[0]; const buf = readFileSync(join(siteDir, rel)); return `data:${MIME[extname(rel)] || "application/octet-stream"};base64,${buf.toString("base64")}`; };
const html = build(d, { asset }).replace(/href="\/kim-seonil-portfolio\//g, `href="${LIVE}`);
writeFileSync(out, html);

let checked = null;
try {
  const { chromium } = createRequire(import.meta.url)("playwright");
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, offline: true });
  const p = await ctx.newPage(); const failed = []; const errors = [];
  p.on("requestfailed", (r) => failed.push(r.url().slice(0, 80))); p.on("pageerror", (e) => errors.push(String(e).slice(0, 200)));
  await p.goto("file://" + resolve(out), { waitUntil: "load" });
  await p.waitForTimeout(2500);
  checked = await p.evaluate(async () => { await document.fonts.ready; return { fonts: [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/"/g, "")))], images: `${[...document.images].filter((i) => i.naturalWidth > 0).length}/${document.images.length}`, motion: document.documentElement.className }; });
  checked = { ...checked, failed, errors };
  await browser.close();
} catch (e) { checked = { skipped: String(e).slice(0, 120) }; }
console.log(JSON.stringify({ out, bytes: html.length, offline: checked }));
