// " · " 구분자의 앞 공백을 줄바꿈 없는 공백으로 바꾼다 — 가운뎃점이 줄 맨 앞에 오지 않게.
// 문자열 리터럴·템플릿 조각은 \u00a0 이스케이프, JSX 속성 문자열·JSX 텍스트는 &nbsp; (JSX 는 JS 이스케이프를 풀지 않는다).
// 주석은 건드리지 않는다. JSON 은 문자열만 있으므로 원문에서 바로 바꾼다.
// usage: node scripts/nbsp_separators.mjs . [--dry]   (source/ 에서)
import { createRequire } from "node:module";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, extname, resolve } from "node:path";

const root = resolve(process.argv[2] ?? ".");
const dry = process.argv.includes("--dry");
const require = createRequire(join(root, "package.json"));
const ts = require("typescript");
const SEP = " · ";

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else if ([".ts", ".tsx", ".json"].includes(extname(p)) && !p.endsWith(".d.ts")) out.push(p);
  }
  return out;
}

let files = 0, total = 0;
for (const file of walk(join(root, "src"))) {
  const text = readFileSync(file, "utf8");
  if (!text.includes(SEP)) continue;
  let next = text, n = 0;
  if (file.endsWith(".json")) {
    n = text.split(SEP).length - 1;
    next = text.replaceAll(SEP, "\\u00a0· ");
  } else {
    const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true, file.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
    const edits = [];
    const visit = (node) => {
      const k = node.kind;
      const isStr = k === ts.SyntaxKind.StringLiteral || k === ts.SyntaxKind.NoSubstitutionTemplateLiteral ||
        k === ts.SyntaxKind.TemplateHead || k === ts.SyntaxKind.TemplateMiddle || k === ts.SyntaxKind.TemplateTail;
      if (isStr || k === ts.SyntaxKind.JsxText) {
        const start = node.getStart(sf), end = node.end;
        const raw = text.slice(start, end);
        if (raw.includes(SEP)) {
          const jsx = k === ts.SyntaxKind.JsxText || (k === ts.SyntaxKind.StringLiteral && node.parent && node.parent.kind === ts.SyntaxKind.JsxAttribute);
          const repl = raw.replaceAll(SEP, jsx ? "&nbsp;· " : "\\u00a0· ");
          edits.push([start, end, repl, raw.split(SEP).length - 1]);
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sf);
    edits.sort((a, b) => b[0] - a[0]);
    for (const [s, e, r, c] of edits) { next = next.slice(0, s) + r + next.slice(e); n += c; }
  }
  if (n) {
    files++; total += n;
    console.log(`${n}\t${file.slice(root.length + 1)}`);
    if (!dry) writeFileSync(file, next);
  }
}
console.log(`${dry ? "(dry) " : ""}${total}곳 · 파일 ${files}개`);
