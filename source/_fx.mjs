import fs from "node:fs";
const p = "scripts/print_resume_cdp.mjs";
let s = fs.readFileSync(p, "utf8");
const bad = `"const left=[...document.querySelectorAll('a[href]')].filter(a=>/127\.0\.0\.1|localhost/.test(a.href)).map(a=>a.href);" +`;
const good = `/* 정규식은 문자열 안에서 역슬래시가 한 겹 벗겨져 점이 와일드카드가 된다 — 문자열 검색으로 둔다 */
    "const bad=h=>h.indexOf('127.0.0.1')>=0||h.indexOf('localhost')>=0;" +
    "const left=[...document.querySelectorAll('a[href]')].map(a=>a.href).filter(bad);" +`;
if (!s.includes(bad)) { console.error("MISS"); process.exit(1); }
fs.writeFileSync(p, s.replace(bad, good));
console.log("ok");
