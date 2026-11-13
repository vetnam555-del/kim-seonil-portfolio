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
 *
 * 지문(pageFingerprint)은 메모 없이 만든 두 페이지 전체의 해시다 — 문서 · 템플릿 · 만드는 규칙 가운데 무엇이 바뀌어도
 * 달라진다. 올린 페이지 확인(comparePublished)은 그 페이지에 든 메모로 지금 다시 만든 것과 글자 하나까지 같은지를 본다.
 * 검사(check_platform_copy.mjs)와 시험(test_platform_copy.mjs)이 이 파일의 함수를 가져다 쓴다.
 */
import { createHash } from "node:crypto";
import { existsSync, lstatSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { basename, dirname, join, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { DOCS, copyCells, count, parseDoc, squash } from "./platform_docs.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));

export const PAGES = [
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

let templateText = null;
function template() {
  if (templateText == null) {
    templateText = readFileSync(join(HERE, "paste_page_template.html"), "utf8");
    /* 탭은 hidden 속성으로 접는다. .panel 의 display 가 그 속성을 이기므로 이 규칙이 빠지면 모든 탭이 한꺼번에 보인다(2026.11.13 Codex 지적) */
    if (!/\.panel\[hidden\]\s*\{\s*display:\s*none/.test(templateText)) {
      throw new Error("paste_page_template.html: `.panel[hidden] { display: none; }` 규칙이 없다 — 탭을 바꿔도 다른 탭이 숨지 않는다.");
    }
  }
  return templateText;
}

/** 주인만 보는 메모의 모양 — 어긋나면 만들다 엉뚱한 곳에서 죽지 않게 여기서 알린다 */
export function validateNotes(notes, where) {
  if (!Array.isArray(notes)) throw new Error(`${where}: 주인 메모는 배열이어야 한다.`);
  notes.forEach((m, i) => {
    const ok = m && typeof m === "object" && ["tab", "title", "body"].every((k) => typeof m[k] === "string" && m[k]) && ["check", "aside"].includes(m.kind);
    if (!ok) throw new Error(`${where}: 주인 메모 ${i + 1}번의 모양이 다르다 — { tab, kind: "check" | "aside", title, body } 가 다 있어야 한다.`);
  });
  return notes;
}

/**
 * --private 로 받은 JSON 을 페이지별 메모로. 페이지마다 열쇠(jobs · linkedin)가 꼭 있어야 한다 — 빈 배열은 되지만,
 * 빠지거나 잘못 적힌 열쇠를 '메모 없음'으로 넘기면 그 페이지가 메모 없이 다시 올라간다.
 */
export function notesFromPrivate(raw, where) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error(`${where}: { ${PAGES.map((x) => `"${x.id}": [...]`).join(", ")} } 모양이어야 한다.`);
  const ids = PAGES.map((x) => x.id);
  const unknown = Object.keys(raw).filter((k) => !ids.includes(k));
  if (unknown.length) throw new Error(`${where}: 모르는 열쇠 ${unknown.join(", ")} — 쓸 수 있는 것은 ${ids.join(" · ")} 다.`);
  const missing = ids.filter((k) => !(k in raw));
  if (missing.length) throw new Error(`${where}: ${missing.join(", ")} 묶음이 없다 — 그 페이지에 메모가 없으면 빈 배열([])을 적는다.`);
  return Object.fromEntries(ids.map((k) => [k, validateNotes(raw[k], `${where} 의 ${k}`)]));
}

export function renderPage(page, doc, fingerprint, notes) {
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
  const html = template().replace(/\{\{([A-Z_0-9]+)\}\}/g, (all, k) => (k in fill ? fill[k] : all));
  const left = html.match(/\{\{[A-Z_0-9]+\}\}/);
  if (left) throw new Error(`${page.file}: 채우지 못한 자리 ${left[0]}`);
  return html;
}

/**
 * 지문 — 메모 없이 만든 두 페이지 전체의 해시(지문 자리는 비워 두고 센다).
 * 문서의 페이지 부분 · 템플릿 · 만드는 규칙 가운데 무엇이 바뀌어도 달라지고, 결과가 같은 손질(주석 · 정리)에는 그대로다.
 */
export function pageFingerprint(docs) {
  const h = createHash("sha256");
  for (const page of PAGES) {
    const doc = docs.find((d) => d.name === page.doc);
    if (!doc) throw new Error(`${page.doc}: 이 페이지의 문서가 없다.`);
    h.update(`${page.file}\n${renderPage(page, doc, "", [])}\n\u0000\n`);
  }
  return h.digest("hex").slice(0, 12);
}

/* ── 주인만 보는 메모 ──────────────────────────────────── */
export function notesFromHtml(html, where) {
  const m = html.match(/<script type="application\/json" id="private-notes">([\s\S]*?)<\/script>/);
  if (!m) throw new Error(`${where}: 주인 메모 칸(private-notes)이 없다 — build_paste_pages.mjs 로 만든 페이지가 아니다.`);
  let notes;
  try {
    notes = JSON.parse(m[1]);
  } catch (e) {
    throw new Error(`${where}: 주인 메모 칸을 읽지 못했다 — ${e.message}`);
  }
  return validateNotes(notes, where);
}

/* ── 올린 페이지가 지금 만든 것과 같은가 ───────────────── */
const panelsOf = (html) =>
  [...html.matchAll(/<section class="panel" id="p-([^"]+)"[^>]*>([\s\S]*?)<\/section>/g)].map((m) => ({
    id: m[1],
    title: squash((m[2].match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || ["", ""])[1].replace(/<[^>]+>/g, "")),
    fields: [...m[2].matchAll(/<(div|span|button)\b[^>]*\bdata-paste\b[^>]*>([\s\S]*?)<\/\1>/g)].map((f) => squash(f[2].replace(/<[^>]+>/g, ""))).filter(Boolean),
  }));
const short = (t) => (t.length > 70 ? `${t.slice(0, 70)}…` : t);

/**
 * 올린 페이지(Artifact read 로 받은 HTML)를 지금 문서 · 템플릿으로 다시 만든 것과 견준다. 다른 점을 글로 돌려준다(같으면 빈 배열).
 * 기준은 '받은 HTML 안에 지금 만든 페이지가 글자 하나까지 그대로 들어 있는가'다 — 올리는 쪽이 앞뒤에 문서 껍데기를 씌우므로 포함으로 본다.
 * 그래서 빠진 칸 · 남는 칸뿐 아니라 다른 탭으로 옮겨진 칸, 바뀐 이름표 · 안내 글, 옛 템플릿도 걸린다.
 * 주인 메모는 받은 페이지에 든 것을 그대로 써서 만든다(메모는 저장소에 없다).
 */
export function comparePublished(html, page, doc, fingerprint, where = page.file) {
  let notes;
  try {
    notes = notesFromHtml(html, where);
  } catch (e) {
    return [e.message];
  }
  let fresh;
  try {
    fresh = renderPage(page, doc, fingerprint, notes);
  } catch (e) {
    return [`${where}: 그 페이지의 메모로 다시 만들지 못했다 — ${e.message}`];
  }
  if (html.includes(fresh)) return [];

  const out = [];
  const stamp = (html.match(/data-fingerprint="([0-9a-f]*)"/) || [])[1];
  if (stamp == null) out.push("지문이 없다(build_paste_pages.mjs 로 만든 페이지가 아니다)");
  else if (stamp !== fingerprint) out.push(`페이지 지문 ${stamp || "(빈 값)"} · 지금 ${fingerprint} — 옛 문서나 옛 템플릿으로 만든 페이지다`);

  const got = panelsOf(html);
  const want = panelsOf(fresh);
  const gotIds = got.map((x) => x.id).join(" · ");
  const wantIds = want.map((x) => x.id).join(" · ");
  if (gotIds !== wantIds) out.push(`탭이 다르다 — 올린 페이지: ${gotIds || "(없음)"} / 지금 문서: ${wantIds}`);
  for (const w of want) {
    const g = got.find((x) => x.id === w.id);
    if (!g) continue;
    if (g.title !== w.title) out.push(`'${w.title}' 탭의 제목이 다르다 — 올린 페이지 '${g.title}'`);
    if (g.fields.join("\u0001") === w.fields.join("\u0001")) continue;
    const left = new Map();
    for (const f of g.fields) left.set(f, (left.get(f) || 0) + 1);
    let moved = true;
    for (const f of w.fields) {
      const n = left.get(f) || 0;
      if (n > 0) left.set(f, n - 1);
      else {
        moved = false;
        out.push(`'${w.title}' 탭 — 이 칸이 올린 페이지에 없다(또는 글이 다르다): ${short(f)}`);
      }
    }
    for (const [f, n] of left) {
      if (n > 0) {
        moved = false;
        out.push(`'${w.title}' 탭 — 문서의 이 탭에 없는 칸이 올린 페이지에 있다${n > 1 ? `(${n}번)` : ""}: ${short(f)}`);
      }
    }
    if (moved) {
      const i = w.fields.findIndex((f, k) => f !== g.fields[k]);
      out.push(`'${w.title}' 탭 — 칸의 순서가 다르다. ${i + 1}번째 칸이 '${short(w.fields[i])}' 여야 하는데 '${short(g.fields[i])}' 다`);
    }
  }
  if (!out.length || (out.length === 1 && /^페이지 지문/.test(out[0]))) {
    /* 복사 칸은 같다 — 이름표 · 안내 글 · 템플릿 어딘가가 다르다. 처음 어긋나는 곳을 보여 준다 */
    const start = html.indexOf(fresh.slice(0, 40));
    const body = start >= 0 ? html.slice(start) : html;
    let i = 0;
    while (i < fresh.length && body[i] === fresh[i]) i += 1;
    const cut = (t) => JSON.stringify(t.slice(Math.max(0, i - 30), i + 50));
    out.push(`복사 칸의 글과 자리는 같지만 지금 만든 페이지와 다른 곳이 있다(이름표 · 안내 글 · 템플릿) — 지금 ${cut(fresh)} / 올린 페이지 ${cut(body)}`);
  }
  return out;
}

/* ── 직접 실행할 때만 — 페이지 두 장을 만든다 ──────────── */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();

function main() {
  const args = process.argv.slice(2);
  const stop = (msg) => {
    console.error(msg);
    process.exit(2);
  };
  const USAGE = "쓰는 법: build_paste_pages.mjs (--carry <앞 판 구직 페이지> <앞 판 링크드인 페이지> | --private <메모.json> | --no-private) [--out <저장소 밖 폴더>]";
  const unknown = args.filter((a) => a.startsWith("--") && !["--carry", "--private", "--no-private", "--out"].includes(a));
  if (unknown.length) stop(`모르는 깃발 ${unknown.join(" ")}\n${USAGE}`);
  /** 깃발 뒤에 이어지는 값들(다음 깃발 전까지) */
  const after = (flag) => {
    const i = args.indexOf(flag);
    if (i < 0) return null;
    const rest = args.slice(i + 1);
    const end = rest.findIndex((a) => a.startsWith("--"));
    return end < 0 ? rest : rest.slice(0, end);
  };
  const outArg = after("--out");
  if (outArg && outArg.length !== 1) stop(`--out 에는 폴더 하나를 준다.\n${USAGE}`);
  const OUT = resolve(outArg ? outArg[0] : join(tmpdir(), "ksi-paste-pages"));

  /* 주인만 보는 메모를 어디서 가져올지는 하나만 — 둘을 같이 주면 어느 쪽이 쓰였는지 모르게 된다 */
  const sources = ["--carry", "--private", "--no-private"].filter((f) => args.includes(f));
  if (sources.length !== 1) stop(`주인만 보는 메모를 어디서 가져올지 하나만 정한다: --carry <앞 판 두 장> · --private <json> · --no-private(메모 없이).\n${USAGE}`);
  let notesBy;
  try {
    if (sources[0] === "--carry") {
      const carry = after("--carry");
      if (carry.length !== PAGES.length) stop(`--carry 에는 앞 판 페이지 ${PAGES.length}장을 ${PAGES.map((x) => x.h1).join(" → ")} 순서로 넘긴다.`);
      notesBy = Object.fromEntries(
        PAGES.map((page, i) => {
          const html = readFileSync(carry[i], "utf8");
          /* 순서가 바뀌면 한 페이지의 메모가 다른 페이지로 간다 — 제목으로 그 페이지가 맞는지 본다 */
          if (!html.includes(`<title>${E(page.title)}</title>`)) stop(`${carry[i]}: '${page.title}' 페이지가 아니다 — --carry 는 ${PAGES.map((x) => x.h1).join(" → ")} 순서로 넘긴다.`);
          return [page.id, notesFromHtml(html, carry[i])];
        }),
      );
    } else if (sources[0] === "--private") {
      const priv = after("--private");
      if (priv.length !== 1) stop(`--private 에는 JSON 파일 하나를 준다.\n${USAGE}`);
      notesBy = notesFromPrivate(JSON.parse(readFileSync(priv[0], "utf8")), priv[0]);
    } else {
      notesBy = Object.fromEntries(PAGES.map((page) => [page.id, []]));
    }
  } catch (e) {
    stop(`주인 메모를 읽지 못했다 — ${e.message}`);
  }

  const docs = DOCS.map(parseDoc);
  const fingerprint = pageFingerprint(docs);
  /* 결과물에는 주인만 보는 메모가 들어 있다 — 저장소 안에는 쓰지 않는다(실수로 커밋되면 공개된다).
     저장소 밖에 있는 링크가 안을 가리킬 수 있으므로 글자로 된 경로가 아니라 실제 자리로 본다. 아직 없는 폴더는 있는 데까지 풀고 나머지를 붙인다 */
  const repo = realpathSync(resolve(HERE, "..", ".."));
  const realOf = (target) => {
    let cur = target;
    const rest = [];
    while (!existsSync(cur)) {
      const parent = dirname(cur);
      if (parent === cur) break;
      rest.unshift(basename(cur));
      cur = parent;
    }
    return join(realpathSync(cur), ...rest);
  };
  const insideRepo = (target) => {
    const real = realOf(target);
    return real === repo || real.startsWith(repo + sep);
  };
  const hasNotes = PAGES.some((page) => notesBy[page.id].length);
  const refuse = (target) => stop(`결과물 자리가 저장소 안이다(${target} → ${realOf(target)}). 주인만 보는 메모가 들어가므로 저장소 밖 폴더를 준다.`);
  if (hasNotes && insideRepo(OUT)) refuse(OUT);
  mkdirSync(OUT, { recursive: true });
  if (hasNotes && insideRepo(OUT)) refuse(OUT);
  for (const page of PAGES) {
    const doc = docs.find((d) => d.name === page.doc);
    const notes = notesBy[page.id];
    const html = renderPage(page, doc, fingerprint, notes);
    const file = join(OUT, page.file);
    /* 파일 자리에 링크가 놓여 있으면 쓰는 순간 그 링크가 가리키는 곳에 쓰인다(끊긴 링크도 마찬가지다) */
    if (hasNotes && lstatSync(file, { throwIfNoEntry: false })?.isSymbolicLink()) stop(`${file} 자리에 링크가 있다 — 지우고 다시 한다(메모가 든 결과물을 링크 너머에 쓰지 않는다).`);
    writeFileSync(file, html);
    const fields = (html.match(/data-paste/g) || []).length;
    console.log(`${file}  — 탭 ${doc.pageSections.length} · 복사하는 칸 ${fields} · 주인 메모 ${notes.length} · ${Math.round(Buffer.byteLength(html) / 1024)}KB`);
  }
  console.log(`지문 ${fingerprint} — 두 주소에 다시 올린 뒤, 올린 것을 받아 check_platform_copy.mjs --pages <두 파일> --stamp.`);
}
