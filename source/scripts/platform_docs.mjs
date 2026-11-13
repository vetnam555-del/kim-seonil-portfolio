/**
 * 사이트 밖 프로필 원문(JOB_PLATFORMS.md · LINKEDIN.md)을 읽는 한 가지 방법 (2026.11.13).
 * 검사(check_platform_copy.mjs)와 붙여넣기 페이지(build_paste_pages.mjs)가 같은 눈으로 문서를 본다 —
 * 문서가 원본이고 페이지는 문서를 그대로 옮긴 것이다.
 *
 * 문서 쓰는 법
 *   ## 제목              탭 하나(첫 '## ' 위는 머리말이라 페이지에 싣지 않는다)
 *   ### · #### 제목      탭 안의 작은 제목
 *   칸 이름 (n / 한도)   ```text 블록 바로 위 줄. 괄호는 선택 — 있으면 글자 수를 센다
 *   > 설명               칸 이름과 블록 사이, 또는 `값` 줄 위. 그 칸의 설명이 된다
 *   ```text … ```        붙여 넣는 글(칸 하나)
 *   이름 `값` · 이름 `값`  짧은 값(하나씩 복사)
 *   | 표 |               칸마다 복사
 *   - **제목** — 설명     확인 목록(체크)
 *   - 글 · 그냥 문단       안내 글
 *   <!-- 페이지 끝 -->     이 아래는 페이지에 싣지 않는다(에이전트 순서 · 만든 방법 · 결정 기록)
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const SOURCE = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const ROOT = resolve(SOURCE, "..");
export const DOCS = ["JOB_PLATFORMS.md", "LINKEDIN.md"];
export const PAGE_END = "<!-- 페이지 끝 -->";
export const STAMP_RE = /<!-- 붙여넣기 페이지 지문: ([0-9a-f]{12}|없음) -->/;
export const COUNT_RE = /\s*\((\d[\d,]*)\s*\/\s*(\d[\d,]*)\)\s*$/;

/* 파일 · 명령 이름은 붙여 넣는 값이 아니다 */
const NOT_A_VALUE = /^[\w./<>-]+\.(md|mjs|cjs|py|html|png|mp4|ts|tsx|json)$|^node |^npm |^assets\/|^src\/|^scripts\/|^--|^```/;

export const count = (s) => [...s].length;

/** 한 줄의 `값`들을 앞 글(이름)과 묶는다 — 부서 `광고운영팀` · 직급 `매니저` → [{label:"부서",text:"광고운영팀"}, …] */
export function inlineItems(line) {
  const items = [];
  let last = 0;
  for (const m of line.matchAll(/`([^`]+)`/g)) {
    const before = line.slice(last, m.index).replace(/^[\s·—:|,]+|[\s·—:|,]+$/g, "");
    last = m.index + m[0].length;
    if (NOT_A_VALUE.test(m[1])) continue;
    items.push({ label: before, text: m[1] });
  }
  const tail = line.slice(last).replace(/^[\s·—:|,]+|[\s·—:|,]+$/g, "");
  return { items, tail };
}

export function parseDoc(name) {
  const file = join(SOURCE, name);
  const text = readFileSync(file, "utf8").replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  const sections = [];
  let section = null;
  let inPage = true;
  let fence = null;
  let hints = [];
  const push = (node) => section && section.nodes.push(node);
  const lastNode = () => (section ? section.nodes[section.nodes.length - 1] : null);

  for (let i = 0; i < lines.length; i += 1) {
    const raw = lines[i];
    const line = raw.trim();
    if (fence) {
      if (line === "```") {
        push({ type: "field", ...fence, text: fence.body.join("\n"), body: undefined });
        fence = null;
      } else fence.body.push(raw);
      continue;
    }
    if (line === PAGE_END) {
      inPage = false;
      section = null;
      continue;
    }
    if (/^```/.test(line)) {
      /* 칸 이름 = 바로 위 문단. 그 문단은 안내 글에서 빼낸다 */
      let label = "";
      const prev = lastNode();
      if (prev && prev.type === "note" && !prev.used) {
        label = prev.text;
        section.nodes.pop();
      }
      const m = label.match(COUNT_RE);
      fence = {
        label: label.replace(COUNT_RE, "").trim(),
        declared: m ? Number(m[1].replace(/,/g, "")) : null,
        limit: m ? Number(m[2].replace(/,/g, "")) : null,
        hints,
        line: i + 2,
        labelLine: prev ? prev.line : i + 1,
        body: [],
      };
      hints = [];
      continue;
    }
    const h = line.match(/^(#{1,4})\s+(.*)$/);
    if (h) {
      hints = [];
      if (h[1].length === 2) {
        section = { doc: name, title: h[2].trim(), inPage, line: i + 1, nodes: [] };
        sections.push(section);
      } else if (h[1].length > 2) push({ type: "heading", level: h[1].length, text: h[2].trim(), line: i + 1 });
      continue;
    }
    if (!line || !section) continue;
    if (/^<!--/.test(line)) continue;
    if (line.startsWith(">")) {
      hints.push(line.replace(/^>\s?/, ""));
      continue;
    }
    if (line.startsWith("|")) {
      const cells = line.split("|").slice(1, -1).map((c) => c.trim().replace(/`/g, ""));
      const prev = lastNode();
      if (cells.every((c) => /^:?-+:?$/.test(c))) {
        if (prev && prev.type === "table") prev.endLine = i + 1;
        continue;
      }
      if (prev && prev.type === "table" && prev.endLine === i) {
        prev.rows.push({ cells, line: i + 1 });
        prev.endLine = i + 1;
      } else push({ type: "table", head: cells, rows: [], line: i + 1, endLine: i + 1 });
      continue;
    }
    const li = line.match(/^(?:[-*]|\d+\.)\s+(.*)$/);
    if (li) {
      const strong = li[1].match(/^\*\*(.+?)\*\*\s*(?:—\s*)?(.*)$/);
      const item = strong ? { title: strong[1], body: strong[2] } : { title: "", body: li[1] };
      const prev = lastNode();
      if (prev && prev.type === "list" && prev.endLine === i) {
        prev.items.push(item);
        prev.endLine = i + 1;
      } else push({ type: "list", items: [item], line: i + 1, endLine: i + 1 });
      hints = [];
      continue;
    }
    const { items, tail } = inlineItems(line);
    if (items.length) {
      push({ type: "values", items, tail, hints, line: i + 1 });
      hints = [];
      continue;
    }
    /* 이어 쓴 문단은 한 덩어리로 */
    const prev = lastNode();
    if (prev && prev.type === "note" && prev.endLine === i) {
      prev.text += ` ${line}`;
      prev.endLine = i + 1;
      prev.used = true; /* 두 줄 넘는 문단은 칸 이름이 아니다 */
    } else push({ type: "note", text: line, line: i + 1, endLine: i + 1 });
  }

  const pageSections = sections.filter((s) => s.inPage);
  /* 붙여 넣는 글 — 검사와 지문이 보는 것 */
  const blocks = [];
  for (const s of pageSections) {
    for (const n of s.nodes) {
      if (n.type === "field") blocks.push({ doc: name, kind: "block", section: s.title, label: n.label, line: n.line, text: n.text, declared: n.declared, limit: n.limit, labelLine: n.labelLine });
      if (n.type === "values") for (const it of n.items) blocks.push({ doc: name, kind: "inline", section: s.title, label: it.label || s.title, line: n.line, text: it.text });
      if (n.type === "table") for (const r of n.rows) blocks.push({ doc: name, kind: "row", section: s.title, label: n.head[0], line: r.line, text: r.cells.join(" · ") });
    }
  }
  /* 페이지에 실리는 부분 = 첫 '## ' 줄부터 '페이지 끝' 줄 앞까지. 머리말이 그 표시를 글로 언급하므로 줄 전체가 같은 것만 센다 */
  const pageText = (() => {
    const start = lines.findIndex((l) => /^## /.test(l));
    const end = lines.findIndex((l, i) => i > start && l.trim() === PAGE_END);
    return lines.slice(start < 0 ? 0 : start, end < 0 ? lines.length : end).join("\n");
  })();
  return { name, file, text, sections, pageSections, blocks, pageText };
}

/** 두 문서의 '페이지에 실리는 부분' 전체의 지문 — 한 글자라도 바뀌면 붙여넣기 페이지를 다시 올려야 한다 */
export function fingerprintOf(docs) {
  return createHash("sha256")
    .update(docs.map((d) => `${d.name}\n${d.pageText}`).join("\n\u0000\n"))
    .digest("hex")
    .slice(0, 12);
}
