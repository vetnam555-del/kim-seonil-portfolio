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
 *   | 표 |               한 줄씩 — 첫 칸(이름) · 주소 · '설명' 칸에 복사 버튼(copyCells)
 *   - **제목** — 설명     확인 목록(체크)
 *   - 글 · 그냥 문단       안내 글
 *   <!-- 페이지 끝 -->     이 아래는 페이지에 싣지 않는다(에이전트 순서 · 만든 방법 · 결정 기록)
 */
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

/* ── 글자 다듬기 — 검사와 페이지 대조가 같은 눈으로 본다 ── */
export const plain = (s) =>
  s
    .replace(/[   ]/g, " ")
    .replace(/[⁠​﻿]/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;|&apos;/g, "'")
    .replace(/&lsquo;|&rsquo;/g, "'")
    .replace(/&ldquo;|&rdquo;/g, '"')
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
    .replace(/&amp;/g, "&");
export const squash = (s) => plain(s).replace(/\s+/g, " ").trim();
export const noUrls = (s) => s.replace(/https?:\/\/\S+/g, " ");

/* ── 숫자 토큰 — 숫자와 바로 뒤 단위를 한 덩어리로 본다 ── */
const UNIT = "%p|%|pp|배|억|만|천|개|종|명|건|편|일|시간|분|초|년|월|곳|장|회|차|축|주|줄|단계|hours?|minutes?|months?|days?|channels?|brands?|industries|B\\+|M\\+|K\\+|x";
/* '30여 개' 처럼 숫자와 단위 사이에 '여'가 끼면 단위까지 한 덩어리로 읽는다(30개) — 안 그러면 단위 없는 두 자리 숫자로 버려져
   문서의 '30여 개'가 '47여 개'로 바뀌어도 걸리지 않는다. 뒤에 단위가 올 때만 '여'로 본다('2025 여름'은 아니다) */
const NUM_RE = new RegExp(`([-−–+])?(\\d[\\d,]*(?:\\.\\d+)?)(\\+)?(?:\\s?여(?=\\s?(?:${UNIT})))?\\s?(${UNIT})?`, "gi");

/**
 * 글의 숫자를 { token, sign, shown } 으로 — token 은 숫자+단위('397.3%' · '30개'), sign 은 '+' · '-' · ''.
 * 부호는 숫자 바로 앞에 붙어 있고 그 앞이 숫자 · 글자가 아닐 때만 부호로 본다:
 * '+397.3%' · '(−1.0%)' 는 부호, '35–75%' · '1+1' · 'A-1' · 'D−1' · '2026-11-13' · '2023.10 – 2025.10' 은 아니다.
 * 빼기는 '-' · '−' · '–' 를 같은 것으로 본다.
 */
export function numberTokens(text) {
  const src = noUrls(plain(text));
  const out = [];
  for (const m of src.matchAll(NUM_RE)) {
    const digits = m[2].replace(/,/g, "");
    const unit = (m[4] || "").toLowerCase().replace(/s$/, "");
    /* 단위 없는 한두 자리 숫자(순번 · 날짜의 일)는 어디에나 있어 뜻이 없다 */
    if (!unit && digits.replace(".", "").length < 3) continue;
    let sign = "";
    if (m[1] && !/[0-9A-Za-z가-힣]/.test(src[m.index - 1] || " ")) sign = m[1] === "+" ? "+" : "-";
    out.push({ token: digits + unit, sign, shown: (sign ? m[0] : m[0].slice(m[1] ? 1 : 0)).trim() });
  }
  return out;
}
const isUrl = (s) => /^https?:\/\/\S+$/.test(s);

/**
 * 표 한 줄에서 따로 복사하는 칸 — 첫 칸(이름)과, 주소이거나 머리가 '설명'인 칸. 나머지 칸은 읽고 고르는 값이라 복사 버튼이 없다.
 * 페이지를 만드는 쪽(build_paste_pages)과 올린 페이지를 확인하는 쪽(check --pages)이 이 규칙 하나를 같이 쓴다.
 */
export function copyCells(head, cells) {
  const out = [{ index: 0, head: head[0] || "", text: cells[0] || "" }];
  cells.slice(1).forEach((cell, k) => {
    const h = head[k + 1] || "";
    if (cell && (isUrl(cell) || /설명/.test(h))) out.push({ index: k + 1, head: h, text: cell });
  });
  return out;
}

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
  return parseDocText(name, readFileSync(file, "utf8"), file);
}

/** 문서 글을 읽는다(파일을 읽지 않는다 — 시험에서 지어낸 문서를 넣을 수 있다) */
export function parseDocText(name, source, file = name) {
  const text = source.replace(/\r\n/g, "\n");
  const lines = text.split("\n");
  /* '페이지 끝' 줄이 없으면 그 아래(에이전트 순서 · 결정 기록)가 전부 페이지에 실린다 — 만들기 전에 멈춘다 */
  if (!lines.some((l) => l.trim() === PAGE_END)) {
    throw new Error(`${name} — '${PAGE_END}' 줄이 없다. 이 줄 아래는 페이지에 싣지 않는 부분이라, 없으면 문서 끝까지 페이지에 실린다.`);
  }
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

  /* 닫지 않은 ``` 블록은 그 아래 문서를 통째로 삼킨다 — 조용히 넘어가지 않는다 */
  if (fence) throw new Error(`${name}:${fence.line - 1} — \`\`\` 블록이 닫히지 않았다. 그 아래 칸이 전부 빠진다.`);
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
  /* 페이지에 복사 칸으로 실리는 것 전부, 실리는 순서대로 — 올린 페이지와 하나씩(개수까지) 맞춰 보는 기준 */
  const pasteFields = [];
  for (const s of pageSections) {
    for (const n of s.nodes) {
      if (n.type === "field") pasteFields.push({ doc: name, section: s.title, label: n.label, line: n.line, text: n.text });
      if (n.type === "values") for (const it of n.items) pasteFields.push({ doc: name, section: s.title, label: it.label || s.title, line: n.line, text: it.text });
      if (n.type === "table") {
        for (const r of n.rows) for (const c of copyCells(n.head, r.cells)) pasteFields.push({ doc: name, section: s.title, label: `${r.cells[0]} · ${c.head}`, line: r.line, text: c.text });
      }
    }
  }
  return { name, file, text, sections, pageSections, blocks, pasteFields };
}
