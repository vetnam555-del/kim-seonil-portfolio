/**
 * 붙여넣기 페이지 두 장을 문서에서 만든다 (2026.11.13).
 *   JOB_PLATFORMS.md → job-platforms.html   https://claude.ai/artifact/Bjv7HbNXoMJeqxNH39xH3U
 *   LINKEDIN.md      → linkedin.html        https://claude.ai/artifact/15ZKb6YBZpitr43a13WZsm
 *
 * 문서가 원본이다. 페이지를 손으로 고치지 않는다 — 전에는 문서와 페이지를 따로 고쳐서 링크드인 페이지에 옛 문구가 일주일 남아 있었다.
 *
 *   node scripts/build_paste_pages.mjs --carry <앞 판 구직 페이지.html> <앞 판 링크드인 페이지.html> [--out <폴더>]
 *   node scripts/build_paste_pages.mjs --private <메모.json> [--out <폴더>]
 *   node scripts/build_paste_pages.mjs --no-private [--out <폴더>]
 *
 * 주인만 보는 메모(저장소에 적지 않는 것 — SKILL 1절 표의 채용 플랫폼 줄)는 페이지 안에만 있다.
 * 다시 만들 때는 올라가 있는 앞 판(Artifact read 로 받은 HTML)을 --carry 로 넘기면 그 메모를 그대로 옮긴다.
 * 메모 없이 만들려면 --no-private 를 일부러 적어야 한다(모르고 빠뜨리지 않게).
 * 결과물에는 그 메모가 들어 있으므로 저장소 밖(기본: 운영체제 임시 폴더)에 쓴다. 커밋하지 않는다.
 *
 * 올리는 순서(SKILL 13절): check --fix-counts → 이 스크립트 → Artifact 로 두 주소에 다시 올리기 →
 * 올린 것을 다시 받아 check --pages <받은 두 파일> --stamp(같을 때만 지문을 고친다) → 커밋.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { DOCS, copyCells, count, fingerprintOf, parseDoc } from "./platform_docs.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
/** 깃발 뒤에 이어지는 값들(다음 깃발 전까지) */
const after = (flag) => {
  const i = args.indexOf(flag);
  if (i < 0) return null;
  const rest = args.slice(i + 1);
  const end = rest.findIndex((a) => a.startsWith("--"));
  return end < 0 ? rest : rest.slice(0, end);
};
const OUT = resolve((after("--out") || [])[0] || join(tmpdir(), "ksi-paste-pages"));

const PAGES = [
  {
    id: "jobs",
    doc: "JOB_PLATFORMS.md",
    file: "job-platforms.html",
    title: "김선일 구직 플랫폼 원문",
    h1: "구직 플랫폼 원문",
    lede: "리멤버 · 사람인 · 잡코리아 · 원티드에 붙여 넣을 문구입니다. 칸마다 복사 버튼이 있고, 넣은 칸을 체크하면 이 기기에 남습니다.",
    key: "ksi-jobs-v2",
  },
  {
    id: "linkedin",
    doc: "LINKEDIN.md",
    file: "linkedin.html",
    title: "김선일 링크드인 원문",
    h1: "링크드인 원문",
    lede: "링크드인 편집 화면 순서대로 정리했습니다. 칸마다 복사해 붙여 넣고, 넣은 칸을 체크하면 이 기기에 남습니다.",
    key: "ksi-linkedin-v4",
  },
];

/* 탭 주소 — 영문 · 숫자 · 붙임표만 쓴다(claude.ai 가 쓰는 이름은 피한다) */
const TAB_IDS = [
  [/먼저 볼 것/, "check"], [/공통/, "common"], [/리멤버/, "remember"], [/사람인/, "saramin"], [/원티드/, "wanted"], [/링크드인/, "linkedin"],
  [/직접 넣게/, "handoff"], [/프로필 상단/, "top"], [/영문/, "english"], [/소개/, "about"], [/수상/, "awards"], [/^(?:\d+\.\s*)?경력$/, "experience"],
  [/프로젝트/, "projects"], [/Featured/, "featured"], [/자격증/, "certs"], [/보유기술/, "skills"], [/학력/, "education"], [/마지막 점검/, "final"],
];
const tabIdOf = (title, used) => {
  let id = (TAB_IDS.find(([re]) => re.test(title)) || [null, ""])[1];
  if (!id || used.has(id)) id = `s${used.size + 1}`;
  used.add(id);
  return id;
};
/* 탭 이름은 짧게 — '3. 사람인 · 잡코리아' → '사람인 · 잡코리아' */
const tabLabel = (title) => title.replace(/^\d+\.\s*/, "");

const E = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const idOf = (prefix, ...parts) => `${prefix}-${createHash("sha1").update(parts.join("\u0001")).digest("hex").slice(0, 10)}`;
/* 안내 글 — 백틱은 걷고 주소는 링크로 */
const prose = (s) =>
  E(s.replace(/`/g, "")).replace(/https?:\/\/[^\s<)]+[^\s<).,]/g, (u) => `<a href="${u}" target="_blank" rel="noopener">${u}</a>`).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

function renderPage(page, doc, fingerprint, notes) {
  const used = new Set();
  const usedIds = new Set();
  const uid = (prefix, ...parts) => {
    let id = idOf(prefix, ...parts);
    for (let k = 2; usedIds.has(id); k += 1) id = idOf(prefix, ...parts, String(k));
    usedIds.add(id);
    return id;
  };
  const tabs = [];
  const panels = [];

  for (const section of doc.pageSections) {
    const tab = tabIdOf(section.title, used);
    tabs.push({ id: tab, label: tabLabel(section.title) });
    const out = [];
    let entryOpen = false;
    const closeEntry = () => { if (entryOpen) { out.push("</article>"); entryOpen = false; } };

    /* 주인만 보는 메모 — 이 탭에 해당하는 것. 확인 줄은 첫 확인 목록 바로 뒤에, 나머지는 탭 끝에 둔다 */
    const mine = notes.filter((m) => section.title.includes(m.tab));
    const privateChecks = mine.filter((m) => m.kind === "check");
    let checksPlaced = privateChecks.length === 0;
    const privateCheckList = () =>
      `<ul class="checks">${privateChecks
        .map((m) => `<li data-done-scope><label><input type="checkbox" id="d-${uid("p", tab, m.title)}" data-done><span><b>${prose(m.title)}</b><small>${prose(m.body)}</small></span></label></li>`)
        .join("")}</ul>`;

    for (const n of section.nodes) {
      if (n.type === "heading") {
        closeEntry();
        if (n.level >= 4) {
          out.push(`<article class="entry"><h4 class="entry-name">${E(n.text)}</h4>`);
          entryOpen = true;
        } else out.push(`<h3 class="sub">${E(n.text)}</h3>`);
      } else if (n.type === "note") {
        out.push(`<p class="note">${prose(n.text)}</p>`);
      } else if (n.type === "field") {
        const v = uid("v", tab, n.label, n.text.slice(0, 40));
        const one = !n.text.includes("\n") && count(n.text) <= 120;
        const hint = n.hints.map((h) => `<p class="field-hint">${prose(h)}</p>`).join("");
        out.push(
          `<div class="field" data-done-scope><div class="field-head"><span class="field-label">${E(n.label || "붙여 넣을 글")}</span>` +
            `<span class="count" data-count="${v}"${n.limit ? ` data-limit="${n.limit}"` : ""}></span>` +
            `<button class="copy" type="button" data-copy="${v}" aria-label="${E(n.label)} 복사">복사</button>` +
            `<label class="done-toggle"><input type="checkbox" id="d-${v}" data-done> 넣음</label></div>${hint}` +
            `<div class="value${one ? " one" : ""}" id="${v}" data-paste>${E(n.text)}</div></div>`,
        );
      } else if (n.type === "values") {
        const hint = n.hints.map((h) => `<p class="field-hint">${prose(h)}</p>`).join("");
        if (n.items.every((it) => !it.label)) {
          out.push(`<div class="field">${hint}<div class="chips">${n.items.map((it) => `<button class="chip" type="button" data-paste>${E(it.text)}</button>`).join("")}</div></div>`);
        } else {
          const rows = n.items.map((it) => {
            const v = uid("k", tab, it.label, it.text);
            return `<div class="kv-row"><dt>${E(it.label || "값")}</dt><dd><span id="${v}" data-paste>${E(it.text)}</span></dd><button class="copy" type="button" data-copy="${v}" aria-label="${E(it.label)} 복사">복사</button></div>`;
          });
          out.push(`${hint}<dl class="kv">${rows.join("")}</dl>${n.tail ? `<p class="note">${prose(n.tail)}</p>` : ""}`);
        }
      } else if (n.type === "table") {
        const rows = n.rows.map((r) => {
          const title = r.cells[0];
          const t = uid("r", tab, title);
          const subs = [];
          const buttons = [`<button class="copy" type="button" data-copy="${t}" aria-label="${E(title)} 복사">${E(n.head[0])}</button>`];
          /* 주소와 '설명' 칸은 따로 복사한다. 나머지 칸은 읽고 고르는 값이다 — 규칙은 platform_docs.mjs copyCells(검사와 같이 쓴다) */
          const copied = new Set(copyCells(n.head, r.cells).map((c) => c.index));
          r.cells.slice(1).forEach((cell, k) => {
            if (!cell) return;
            const head = n.head[k + 1] || "";
            if (copied.has(k + 1)) {
              const c = uid("c", tab, title, head);
              subs.push(`<span class="row-sub"><b>${E(head)}</b> <span id="${c}" data-paste>${E(cell)}</span></span>`);
              buttons.push(`<button class="copy" type="button" data-copy="${c}" aria-label="${E(title)} ${E(head)} 복사">${E(head.replace(/^확인\s*/, ""))}</button>`);
            } else subs.push(`<span class="row-sub"><b>${E(head)}</b> ${prose(cell)}</span>`);
          });
          return (
            `<div class="row" data-done-scope><div class="row-main"><span class="row-title" id="${t}" data-paste>${E(title)}</span>${subs.join("")}</div>` +
            `<div class="row-actions">${buttons.join("")}<label class="done-toggle"><input type="checkbox" id="d-${t}" data-done> 넣음</label></div></div>`
          );
        });
        out.push(`<div class="rows">${rows.join("")}</div>`);
      } else if (n.type === "list") {
        if (n.items.every((it) => it.title)) {
          const items = n.items.map((it) => {
            const k = uid("c", tab, it.title);
            return `<li data-done-scope><label><input type="checkbox" id="d-${k}" data-done><span><b>${prose(it.title)}</b><small>${prose(it.body)}</small></span></label></li>`;
          });
          out.push(`<ul class="checks">${items.join("")}</ul>`);
          if (!checksPlaced) {
            out.push(privateCheckList());
            checksPlaced = true;
          }
        } else out.push(`<ul class="notes">${n.items.map((it) => `<li>${prose(it.title ? `**${it.title}** — ${it.body}` : it.body)}</li>`).join("")}</ul>`);
      }
    }
    closeEntry();

    if (!checksPlaced) out.push(privateCheckList());
    for (const m of mine.filter((x) => x.kind !== "check")) out.push(`<div class="aside"><h3>${prose(m.title)}</h3><p>${prose(m.body)}</p></div>`);

    panels.push(`<section class="panel" id="p-${tab}" data-panel="${tab}" aria-labelledby="h-${tab}"><h2 class="panel-title" id="h-${tab}">${E(tabLabel(section.title))}</h2>${out.join("\n")}</section>`);
  }
  const unplaced = notes.filter((m) => !doc.pageSections.some((s) => s.title.includes(m.tab)));
  if (unplaced.length) throw new Error(`${page.doc}: 주인 메모가 갈 탭이 없다 — ${unplaced.map((m) => m.tab).join(", ")}`);

  const nav = `<nav class="tabs" aria-label="칸 묶음">${tabs.map((t) => `<a class="tab" href="#${t.id}" data-tab="${t.id}">${E(t.label)}<span class="tab-count"></span></a>`).join("")}</nav>`;
  const date = (doc.text.match(/^# .*?(\d{4})-(\d{2})-(\d{2})/m) || []).slice(1).join(".");
  const fill = {
    TITLE: E(page.title),
    EYEBROW: E(`${date || "원문"} · 사이트 · 이력서와 같은 사실만`),
    H1: E(page.h1),
    LEDE: E(page.lede),
    NAV: nav,
    PANELS: panels.join("\n"),
    FOOTER: E(`문장과 숫자는 포트폴리오 사이트 · 이력서 원본과 같습니다. 새 성과가 생기면 사이트와 문서를 먼저 고치고 이 페이지를 다시 만듭니다. 문서 지문 ${fingerprint}.`),
    FINGERPRINT: fingerprint,
    KEY: page.key,
    TABS_JSON: JSON.stringify(tabs.map((t) => t.id)),
    PRIVATE_JSON: JSON.stringify(notes).replace(/</g, "\\u003c"),
  };
  const template = readFileSync(join(HERE, "paste_page_template.html"), "utf8");
  /* 탭은 hidden 속성으로 접는다. .panel 의 display 가 그 속성을 이기므로 이 규칙이 빠지면 모든 탭이 한꺼번에 보인다(2026.11.13 Codex 지적) */
  if (!/\.panel\[hidden\]\s*\{\s*display:\s*none/.test(template)) throw new Error("paste_page_template.html: `.panel[hidden] { display: none; }` 규칙이 없다 — 탭을 바꿔도 다른 탭이 숨지 않는다.");
  return template.replace(/\{\{([A-Z_0-9]+)\}\}/g, (all, k) => (k in fill ? fill[k] : all));
}

/* ── 주인만 보는 메모 ──────────────────────────────────── */
function notesFromPage(file) {
  const html = readFileSync(file, "utf8");
  const m = html.match(/<script type="application\/json" id="private-notes">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`${file}: 주인 메모 칸(private-notes)이 없다 — build_paste_pages.mjs 로 만든 페이지가 아니다. 메모를 --private 로 넘긴다.`);
  return JSON.parse(m[1]);
}
let notesBy = null;
const carry = after("--carry");
const priv = after("--private");
if (carry && carry.length) {
  if (carry.length !== PAGES.length) throw new Error(`--carry 에는 앞 판 페이지 ${PAGES.length}장(구직 · 링크드인 순서)을 넘긴다.`);
  notesBy = Object.fromEntries(PAGES.map((p, i) => [p.id, notesFromPage(carry[i])]));
} else if (priv && priv.length) {
  notesBy = JSON.parse(readFileSync(priv[0], "utf8"));
} else if (args.includes("--no-private")) {
  notesBy = {};
} else {
  console.error("주인만 보는 메모를 어디서 가져올지 정한다: --carry <앞 판 두 장> · --private <json> · --no-private(메모 없이).");
  process.exit(2);
}

const docs = DOCS.map(parseDoc);
const fingerprint = fingerprintOf(docs);
mkdirSync(OUT, { recursive: true });
if (OUT.startsWith(resolve(HERE, "..", ".."))) console.warn("주의: 결과물에는 주인만 보는 메모가 들어 있다. 저장소 안에 두었다면 커밋하지 않는다.");
for (const page of PAGES) {
  const doc = docs.find((d) => d.name === page.doc);
  const notes = notesBy[page.id] || [];
  const html = renderPage(page, doc, fingerprint, notes);
  const left = html.match(/\{\{[A-Z_0-9]+\}\}/);
  if (left) throw new Error(`${page.file}: 채우지 못한 자리 ${left[0]}`);
  const file = join(OUT, page.file);
  writeFileSync(file, html);
  const fields = (html.match(/data-paste/g) || []).length;
  console.log(`${file}  — 탭 ${doc.pageSections.length} · 복사하는 칸 ${fields} · 주인 메모 ${notes.length} · ${Math.round(Buffer.byteLength(html) / 1024)}KB`);
}
console.log(`문서 지문 ${fingerprint} — 두 주소에 다시 올린 뒤, 올린 것을 받아 check_platform_copy.mjs --pages <두 파일> --stamp.`);
if (!existsSync(OUT)) process.exit(1);
