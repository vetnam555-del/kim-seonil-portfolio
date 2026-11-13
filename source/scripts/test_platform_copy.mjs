/**
 * 사이트 밖 프로필 원문 도구의 회귀 시험 (2026.11.13) — 문서 읽기 · 숫자 토큰 · 페이지 만들기 · 올린 페이지 대조.
 * Codex 검토가 세 번에 걸쳐 짚은 것(빠진 표 줄, 탭 숨김, '30여 개', 부호, 옮겨진 칸, 빠진 '페이지 끝')을 한곳에 묶어 둔다.
 * 앞부분은 지어낸 문서로 돌린다. 끝의 명령줄 시험은 실제 두 문서로 페이지를 만들어 보되 결과물은 임시 폴더에만 쓴다.
 * qa_release.mjs 가 부른다.
 *
 *   node scripts/test_platform_copy.mjs
 */
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PAGES, comparePublished, notesFromPrivate, pageFingerprint, renderPage, validateNotes } from "./build_paste_pages.mjs";
import { PAGE_END, copyCells, numberTokens, parseDocText } from "./platform_docs.mjs";

let passed = 0;
const check = (name, fn) => {
  fn();
  passed += 1;
};

/* ── 숫자 토큰 ─────────────────────────────────────────── */
const tok = (text) => numberTokens(text).map((t) => t.sign + t.token);
check("'여'가 낀 개수는 단위까지 읽는다", () => {
  assert.deepEqual(tok("검색·DA·SNS 30여 개 브랜드"), ["30개"]);
  assert.deepEqual(tok("47여개"), ["47개"]);
  assert.deepEqual(tok("2025 여름"), ["2025"]);
});
check("부호는 숫자 바로 앞에 붙고 그 앞이 숫자 · 글자가 아닐 때만 부호다", () => {
  assert.deepEqual(tok("전년 대비 +397.3%(공동구매 포함)"), ["+397.3%"]);
  assert.deepEqual(tok("거의 그대로(−1.0%)"), ["-1.0%"]);
  assert.deepEqual(tok("CPA -14.1%"), ["-14.1%"]);
  assert.deepEqual(tok("–5% 감소"), ["-5%"], "en dash 도 빼기로 본다");
  assert.deepEqual(tok("35–75%는 팀"), ["75%"], "범위의 줄표는 부호가 아니다");
  assert.deepEqual(tok("2023.10 – 2025.10"), ["2023.10", "2025.10"]);
  assert.deepEqual(tok("2026-11-13 기준"), ["2026"]);
  assert.deepEqual(tok("1+1 · A-1 · D−1"), []);
  assert.deepEqual(tok("- 2026.07 스토어"), ["2026.07"], "글머리표는 부호가 아니다");
});
check("단위와 덧셈표", () => {
  assert.deepEqual(tok("월 10억+ 규모 10개 채널"), ["10억", "10개"]);
  assert.deepEqual(tok("30+ brands across 9 industries"), ["30brand", "9industrie"]);
  assert.deepEqual(tok("2,000 → 107,600"), ["2000", "107600"]);
  assert.deepEqual(tok("https://example.com/2024/397 에서"), [], "주소 안의 숫자는 보지 않는다");
});

/* ── 문서 읽기 ─────────────────────────────────────────── */
const fence = "```";
const docText = (extra = "") => `# 시험 문서 (2026-11-13)

머리말은 싣지 않는다. 여기서 ${PAGE_END} 를 글로 말해도 경계가 아니다.

<!-- 붙여넣기 페이지 지문: 없음 -->

## 먼저 볼 것

- **첫 확인** — 설명 하나.

## 1. 공통

이름 \`김선일\` · 이메일 \`someone@example.com\`

> 칸 설명입니다.
이력서 제목 (9 / 100)
${fence}text
제목 한 줄 +12%
${fence}

| 이름 | 링크 | 설명 | 기간 |
|---|---|---|---|
| 첫 줄 | https://example.com/a | 첫 줄 설명 | 2024 |
| 둘째 줄 |  | 둘째 줄 설명 | 2025 |

## 2. 리멤버

소개
${fence}text
소개 글입니다.
${fence}
${extra}
${PAGE_END}

## 적용 순서 (에이전트)

이 아래는 싣지 않는다. \`싣지않는값\`
`;
const jobs = parseDocText("JOB_PLATFORMS.md", docText());
const linkedin = parseDocText("LINKEDIN.md", docText().replace("## 2. 리멤버", "## 2. 소개"));
check("페이지에 실리는 탭과 복사 칸", () => {
  assert.deepEqual(jobs.pageSections.map((s) => s.title), ["먼저 볼 것", "1. 공통", "2. 리멤버"]);
  assert.deepEqual(jobs.pasteFields.map((f) => f.text), ["김선일", "someone@example.com", "제목 한 줄 +12%", "첫 줄", "https://example.com/a", "첫 줄 설명", "둘째 줄", "둘째 줄 설명", "소개 글입니다."]);
  const title = jobs.blocks.find((b) => b.label === "이력서 제목");
  assert.equal(title.declared, 9);
  assert.equal(title.limit, 100);
});
check("표에서 따로 복사하는 칸은 이름 · 주소 · '설명' 칸", () => {
  assert.deepEqual(copyCells(["이름", "링크", "설명", "기간"], ["가", "https://example.com/x", "나", "2024"]).map((c) => c.text), ["가", "https://example.com/x", "나"]);
  assert.deepEqual(copyCells(["이름", "취득일"], ["자격증", "2016.08"]).map((c) => c.text), ["자격증"]);
});
check("'페이지 끝' 줄이 없으면 멈춘다", () => {
  assert.throws(() => parseDocText("JOB_PLATFORMS.md", docText().replace(`\n${PAGE_END}\n`, "\n")), /줄이 없다/);
});
check("닫지 않은 글 블록은 멈춘다", () => {
  assert.throws(() => parseDocText("JOB_PLATFORMS.md", docText().replace(`소개 글입니다.\n${fence}`, "소개 글입니다.")), /닫히지 않았다/);
});

/* ── 페이지 만들기 · 지문 ──────────────────────────────── */
const [jobsPage] = PAGES;
const docs = [jobs, linkedin];
const fp = pageFingerprint(docs);
const notes = [{ tab: "먼저 볼 것", kind: "check", title: "주인만 보는 확인", body: "저장소에 없는 메모." }, { tab: "리멤버", kind: "aside", title: "주인만 보는 글", body: "탭 끝에 놓인다." }];
/* 올리는 쪽은 앞뒤에 문서 껍데기를 씌운다(탭 숨김 규칙도 넣는다) — 그 모양을 흉내 낸다 */
const host = (inner) => `<!doctype html><html><head><meta charset=utf8><style>[hidden]{display:none!important}</style></head><body>\n${inner}\n</body></html>`;
const built = renderPage(jobsPage, jobs, fp, notes);
const published = host(built);
check("지문은 12자리이고 메모와 상관없다", () => {
  assert.match(fp, /^[0-9a-f]{12}$/);
  assert.equal(pageFingerprint(docs), fp);
  assert.ok(built.includes(`data-fingerprint="${fp}"`));
});
check("문서의 페이지 부분이 바뀌면 지문이 바뀌고, 싣지 않는 부분은 상관없다", () => {
  const changed = parseDocText("JOB_PLATFORMS.md", docText().replace("소개 글입니다.", "소개 글을 고쳤습니다."));
  assert.notEqual(pageFingerprint([changed, linkedin]), fp);
  const hint = parseDocText("JOB_PLATFORMS.md", docText().replace("칸 설명입니다.", "칸 설명을 고쳤습니다."));
  assert.notEqual(pageFingerprint([hint, linkedin]), fp, "안내 글도 페이지에 실린다");
  const below = parseDocText("JOB_PLATFORMS.md", docText().replace("이 아래는 싣지 않는다.", "이 아래를 고쳤다."));
  assert.equal(pageFingerprint([below, linkedin]), fp);
  const stamped = parseDocText("JOB_PLATFORMS.md", docText().replace("지문: 없음", `지문: ${fp}`));
  assert.equal(pageFingerprint([stamped, linkedin]), fp, "지문 줄을 고쳐도 지문은 그대로다");
});
check("만든 페이지는 탭 숨김 규칙을 스스로 갖고, 싣지 않는 부분은 들어가지 않는다", () => {
  assert.match(built, /\.panel\[hidden\]\s*\{\s*display:\s*none/);
  assert.ok(!built.includes("싣지않는값") && !built.includes("적용 순서"));
  assert.ok(built.includes("주인만 보는 확인") && built.includes("주인만 보는 글"));
});
check("메모의 모양이 다르거나 갈 탭이 없으면 멈춘다", () => {
  assert.throws(() => validateNotes([{ tab: "먼저 볼 것", kind: "memo", title: "가", body: "나" }], "시험"), /모양이 다르다/);
  assert.throws(() => validateNotes({ jobs: [] }, "시험"), /배열/);
  assert.throws(() => renderPage(jobsPage, jobs, fp, [{ tab: "없는 탭", kind: "check", title: "가", body: "나" }]), /갈 탭이 없다/);
});

/* ── 올린 페이지 대조 ──────────────────────────────────── */
const diff = (html) => comparePublished(html, jobsPage, jobs, fp, "시험.html");
const rowRe = /<div class="row" data-done-scope>[\s\S]*?<\/label><\/div><\/div>/g;
check("그대로 올린 페이지는 같다 — 메모가 달라도 그 페이지의 메모로 다시 만들어 견준다", () => {
  assert.deepEqual(diff(published), []);
  assert.deepEqual(diff(host(renderPage(jobsPage, jobs, fp, []))), []);
});
check("표 한 줄이 빠지면 다르다", () => {
  const rows = published.match(rowRe);
  assert.equal(rows.length, 2);
  const out = diff(published.replace(rows[1], ""));
  assert.ok(out.some((x) => x.includes("이 칸이 올린 페이지에 없다") && x.includes("둘째 줄")), out.join("\n"));
});
check("표 줄의 설명 칸 하나만 빠져도 다르다", () => {
  const cell = published.match(/<span class="row-sub"><b>설명<\/b> <span id="[^"]+" data-paste>첫 줄 설명<\/span><\/span>/)[0];
  assert.ok(diff(published.replace(cell, "")).some((x) => x.includes("첫 줄 설명")));
});
check("칸이 다른 탭으로 옮겨지면 글이 다 있어도 다르다", () => {
  const field = published.match(/<div class="field" data-done-scope>(?:(?!<div class="field")[\s\S])*?소개 글입니다\.<\/div><\/div>/)[0];
  const moved = published.replace(field, "").replace('<h2 class="panel-title" id="h-common">공통</h2>', `<h2 class="panel-title" id="h-common">공통</h2>${field}`);
  assert.notEqual(moved, published);
  const out = diff(moved);
  assert.ok(out.some((x) => x.includes("'리멤버' 탭") && x.includes("없다")), out.join("\n"));
  assert.ok(out.some((x) => x.includes("'공통' 탭") && x.includes("없는 칸")), out.join("\n"));
});
check("같은 탭 안에서 순서가 바뀌어도 다르다", () => {
  const rows = published.match(rowRe);
  const swapped = published.replace(rows[0] + rows[1], rows[1] + rows[0]);
  assert.notEqual(swapped, published);
  assert.ok(diff(swapped).some((x) => x.includes("순서가 다르다")));
});
check("이름표나 안내 글만 달라도 다르다", () => {
  const out = diff(published.replace(">이력서 제목</span>", ">이력서 머리말</span>"));
  assert.ok(out.some((x) => x.includes("복사 칸의 글과 자리는 같지만")), out.join("\n"));
  assert.ok(diff(published.replace("칸 설명입니다.", "칸 설명이 다릅니다.")).length > 0);
});
check("옛 템플릿(탭 숨김 규칙 없음)이나 옛 지문으로 만든 페이지는 다르다", () => {
  assert.ok(diff(published.replace(/\.panel\[hidden\] \{ display: none; \}\n/, "")).length > 0);
  const old = host(renderPage(jobsPage, jobs, "0123456789ab", notes));
  assert.ok(diff(old).some((x) => x.includes("페이지 지문 0123456789ab")));
});
check("이 빌더로 만들지 않은 페이지는 다르다", () => {
  assert.ok(diff("<html><body><p>다른 페이지</p></body></html>").some((x) => x.includes("주인 메모 칸")));
});

/* ── 메모 묶음의 모양 ──────────────────────────────────── */
check("--private JSON 은 페이지마다 묶음이 있어야 한다(빈 배열은 된다)", () => {
  const one = { tab: "먼저 볼 것", kind: "check", title: "가", body: "나" };
  assert.deepEqual(notesFromPrivate({ jobs: [one], linkedin: [] }, "시험"), { jobs: [one], linkedin: [] });
  assert.throws(() => notesFromPrivate({ jobs: [one] }, "시험"), /linkedin 묶음이 없다/);
  assert.throws(() => notesFromPrivate({ jobs: [one], linkedIn: [] }, "시험"), /모르는 열쇠 linkedIn/);
  assert.throws(() => notesFromPrivate([one], "시험"), /모양이어야 한다/);
});

/* ── 명령줄 — 실제 문서로 만들어 본다(결과물은 임시 폴더에만 쓴다) ── */
const HERE = dirname(fileURLToPath(import.meta.url));
const run = (script, ...args) => spawnSync(process.execPath, [join(HERE, script), ...args], { encoding: "utf8" });
const tmp = mkdtempSync(join(tmpdir(), "ksi-paste-test-"));
try {
  const fake = { jobs: [{ tab: "먼저 볼 것", kind: "check", title: "시험 메모", body: "시험." }], linkedin: [{ tab: "먼저 볼 것", kind: "aside", title: "시험 메모", body: "시험." }] };
  const priv = join(tmp, "notes.json");
  writeFileSync(priv, JSON.stringify(fake));
  const first = join(tmp, "first");
  const built1 = run("build_paste_pages.mjs", "--private", priv, "--out", first);
  check("빌더는 임시 폴더에 두 장을 만든다", () => {
    assert.equal(built1.status, 0, built1.stderr);
    assert.deepEqual(readdirSync(first).sort(), PAGES.map((x) => x.file).sort());
  });
  const files = PAGES.map((x) => join(first, x.file));
  check("모르는 깃발 · 메모를 가져올 곳이 없거나 둘이면 멈춘다", () => {
    assert.equal(run("build_paste_pages.mjs", "--carry", ...files, "--outt", join(tmp, "x")).status, 2);
    assert.equal(run("build_paste_pages.mjs", "--out", join(tmp, "x")).status, 2);
    assert.equal(run("build_paste_pages.mjs", "--carry", ...files, "--no-private", "--out", join(tmp, "x")).status, 2);
    assert.ok(!existsSync(join(tmp, "x")));
  });
  check("--private 에 한 페이지의 묶음이 빠지면 만들지 않는다", () => {
    const bad = join(tmp, "bad.json");
    writeFileSync(bad, JSON.stringify({ jobs: fake.jobs }));
    const r = run("build_paste_pages.mjs", "--private", bad, "--out", join(tmp, "bad"));
    assert.equal(r.status, 2);
    assert.match(r.stderr, /linkedin 묶음이 없다/);
    assert.ok(!existsSync(join(tmp, "bad")));
  });
  check("--carry 의 순서가 바뀌면 만들지 않는다", () => {
    const r = run("build_paste_pages.mjs", "--carry", files[1], files[0], "--out", join(tmp, "swapped"));
    assert.equal(r.status, 2);
    assert.match(r.stderr, /페이지가 아니다/);
    assert.ok(!existsSync(join(tmp, "swapped")));
  });
  check("메모가 든 결과물은 저장소 안으로 쓰지 않는다 — 밖에 있는 링크가 안을 가리켜도", () => {
    const inside = join(HERE, "..", "artifacts", `paste-test-${process.pid}`);
    try {
      assert.equal(run("build_paste_pages.mjs", "--carry", ...files, "--out", inside).status, 2);
      assert.ok(!existsSync(inside), "저장소 안에 폴더를 만들지 않는다");
      mkdirSync(inside, { recursive: true });
      const link = join(tmp, "link");
      let linked = true;
      try {
        symlinkSync(inside, link, "dir");
      } catch {
        linked = false; /* 링크를 만들 권한이 없는 환경(Windows 기본값)에서는 이 경우를 건너뛴다 */
      }
      if (linked) {
        assert.equal(run("build_paste_pages.mjs", "--carry", ...files, "--out", link).status, 2);
        assert.equal(run("build_paste_pages.mjs", "--carry", ...files, "--out", join(link, "deeper")).status, 2);
        const fileLink = join(tmp, "filelink");
        mkdirSync(fileLink);
        symlinkSync(join(inside, "leak.html"), join(fileLink, PAGES[0].file), "file");
        assert.equal(run("build_paste_pages.mjs", "--carry", ...files, "--out", fileLink).status, 2);
      }
      assert.deepEqual(readdirSync(inside), [], "저장소 안에 아무것도 쓰이지 않았다");
      /* 메모가 없으면 저장소 안에도 쓸 수 있다 — 숨길 것이 없다 */
      assert.equal(run("build_paste_pages.mjs", "--no-private", "--out", inside).status, 0);
    } finally {
      rmSync(inside, { recursive: true, force: true });
    }
  });
  check("검사도 모르는 깃발 · 자리 없는 값을 받지 않는다", () => {
    assert.equal(run("check_platform_copy.mjs", "--page", ...files).status, 2);
    assert.equal(run("check_platform_copy.mjs", files[0]).status, 2);
  });
} finally {
  rmSync(tmp, { recursive: true, force: true });
}

console.log(`Platform copy tools: ${passed} regression checks passed`);
