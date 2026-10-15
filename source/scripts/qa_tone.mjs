/**
 * 말투 검수 — 빌드된 out/ 의 렌더 텍스트에서 'AI가 쓴 티'를 찾는다.
 *
 * qa_final.mjs 가 사실관계와 구조를 본다면 이쪽은 문장만 본다.
 * 규칙은 전부 "사람이 쓴 글에서는 드문데 생성 글에서는 흔한 것"이다.
 * 자동으로 고치지 않는다 — 찾아서 보여 주고, 고칠지는 읽고 정한다.
 *
 * 실행: node scripts/qa_tone.mjs [general|hll|shinsegae|ably]
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const OUT = "out";

/* ── 렌더 텍스트 추출 ─────────────────────────────────── */
function htmlFiles(dir, acc = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) htmlFiles(p, acc);
    else if (name.endsWith(".html")) acc.push(p);
  }
  return acc;
}

function unescape(s) {
  return s
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * 산문 덩어리만 뽑는다.
 *
 * 처음엔 페이지 전체 텍스트를 한 덩어리로 놓고 마침표로 잘랐는데, 그러면
 * 카드 목록·내비게이션처럼 마침표가 없는 UI가 통째로 한 문장이 된다.
 * 줄표 두 개짜리 '문장'과 같은 어미 네 번 연속이 전부 거기서 나왔다 —
 * 문장이 아니라 서로 다른 카드였다. 그래서 문단·항목·캡션만 본다.
 */
function proseBlocks(html) {
  const out = [];
  const body = html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    // Keep reused notes separate from their screen/print skill labels.
    .replace(/<span\b(?=[^>]*\bdata-prose(?:\s|=|>))[^>]*>([^<]*)<\/span>/g, (_, text) => {
      out.push({ tag: "p", text: unescape(text) });
      return " ";
    });
  const re = /<(p|li|figcaption|blockquote|dd)\b[^>]*>([\s\S]*?)<\/\1>/g;
  let m;
  while ((m = re.exec(body))) {
    /* 중첩된 li 안의 p 는 바깥 li 에서 한 번 더 잡히지만, 중복 문장은 뒤에서 걸러진다 */
    // A step heading is a label, not part of the first prose sentence.
    const prose = m[2].replace(/<h([1-6])\b[^>]*>[\s\S]*?<\/h\1>/g, " ");
    const t = unescape(prose.replace(/<[^>]+>/g, " "));
    if (t.length > 8 && /[가-힣]/.test(t)) out.push({ tag: m[1], text: t });
  }
  return out;
}

/**
 * 덩어리 안에서만 문장을 자른다 — 덩어리를 가로질러 잇지 않는다.
 *
 * 마침표로 끝나는 것만 남긴다. 라벨·범례·이력서 항목은 문장이 아니라서
 * 말투를 따질 대상이 아닌데, 그것들이 줄표 규칙에 계속 걸렸다
 * ("설계 — 기준과 구조를… · 운영 — 계정·데이터를…" 같은 범례 한 줄).
 */
function sentences(block) {
  return block
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 8 && /[가-힣]/.test(s) && /[.?!]$/.test(s));
}

/* ── 규칙 ─────────────────────────────────────────────── */
/**
 * 각 규칙은 { id, label, why, test } 다.
 * test 는 문장 배열을 받아 걸린 것들을 돌려준다.
 */
const RULES = [
  {
    id: "T15",
    label: "방어적인 실적 서술",
    why: "주장 여부 대신 담당 업무와 확인 범위를 구체적으로 적는다. 이 규칙은 문체 검수용이며 AI 작성 여부를 판별하지 않는다.",
    max: 0,
    test: (ss) => ss.filter((s) => /주장하지\s*않|최종\s*운영환경\s*해결로\s*단정|없는\s*근거를\s*만들지\s*않기\s*위해/.test(s)),
  },
  {
    id: "T1",
    label: "번역투 '~를 통해'",
    why: "한국어로 쓰면 '~로', '~해서'가 자연스럽다. 생성 글에서 유독 잦다.",
    max: 0,
    test: (ss) => ss.filter((s) => /(을|를)\s*통해/.test(s)),
  },
  {
    id: "T2",
    label: "빈 형용사",
    why: "다양한·효과적인·체계적인·전략적인은 무엇이 어떻다는 정보가 없다.",
    max: 2,
    test: (ss) => ss.filter((s) => /(다양한|효과적인|효율적인|체계적인|전략적인|성공적인|혁신적인|최적의)/.test(s)),
  },
  {
    id: "T3",
    label: "'단순히 ~가 아니라' 대구",
    why: "생성 글의 대표 문형. 한 문서에 두 번 이상 나오면 티가 난다.",
    max: 1,
    test: (ss) => ss.filter((s) => /단순히[^.]*아니(라|고)/.test(s)),
  },
  {
    id: "T4",
    label: "당위 표현",
    why: "중요합니다·핵심입니다·필수적입니다는 주장만 있고 근거가 없다.",
    max: 1,
    test: (ss) => ss.filter((s) => /(중요합니다|핵심입니다|필수적입니다|필수입니다|관건입니다)/.test(s)),
  },
  {
    id: "T5",
    label: "3중 병렬",
    why: "'A하고, B하며, C합니다' 리듬이 반복되면 사람이 쓴 문장으로 안 읽힌다.",
    max: 3,
    test: (ss) => ss.filter((s) => /\S+하고,\s*\S+하며,/.test(s) || /\S+며,\s*\S+며,/.test(s)),
  },
  {
    id: "T6",
    label: "한 문장에 줄표 2개 이상",
    why: "줄표는 한 번 쓰면 강조가 되고 두 번 쓰면 버릇으로 읽힌다.",
    max: 0,
    test: (ss) => ss.filter((s) => (s.match(/—/g) || []).length >= 2),
  },
  {
    id: "T7",
    label: "'~할 수 있습니다' 과다",
    why: "가능형이 몰리면 무엇을 했는지가 흐려진다.",
    max: 14,
    test: (ss) => ss.filter((s) => /할 수 있습니다/.test(s)),
  },
  {
    id: "T8",
    label: "같은 어미 4문장 연속",
    why: "'~했습니다'만 이어지면 리듬이 죽는다. 사람 글은 길이가 들쭉날쭉하다.",
    max: 0,
    /* 문단 안에서만 본다 — 서로 다른 문단을 이어 붙이면 우연히 걸린다 */
    blockLevel: true,
    test: (bs) => {
      const hits = [];
      const tail = (s) => (s.match(/([가-힣]{2,4})\.$/) || [])[1] || "";
      for (const ss of bs) {
        for (let i = 0; i + 3 < ss.length; i += 1) {
          const t = tail(ss[i]);
          if (t && [1, 2, 3].every((k) => tail(ss[i + k]) === t)) hits.push(`${t} × 4 — ${ss[i].slice(0, 60)}…`);
        }
      }
      return hits;
    },
  },
  {
    id: "T9",
    label: "자기 칭찬",
    why: "성공적으로·훌륭히·완벽하게는 읽는 쪽이 판단할 몫이다.",
    max: 0,
    test: (ss) => ss.filter((s) => /(성공적으로|훌륭히|완벽하게|탁월한|뛰어난)/.test(s)),
  },
  {
    id: "T10",
    label: "군더더기 서두",
    why: "'~에 있어서', '~의 경우에는'은 빼도 뜻이 같다.",
    max: 1,
    test: (ss) => ss.filter((s) => /(에 있어서|의 경우에는|하는 데 있어)/.test(s)),
  },
  {
    /*
     * 규칙 하나로 잡히는 문형보다 이게 더 티가 났다.
     * 증빙 캡션 넷이 "촬영·디자인은 제작팀 범위이고, …가 담당 범위입니다"로 끝나고 있었다.
     * 밝혀야 할 내용이라 지울 수는 없으니, 같은 틀로 찍어 내지만 않으면 된다.
     */
    /*
     * 팀장 포트폴리오와 나란히 놓고 읽었을 때 가장 크게 갈린 지점.
     * 저쪽 캡션은 판단 한 줄로 끝나는데, 이쪽은 "왼쪽은 A, 오른쪽은 B입니다"로
     * 화면을 받아쓰고 있었다. 읽는 사람이 보면 아는 것을 말로 옮기는 건
     * 생성 글의 버릇이고, 항목 나열은 어차피 콜아웃이 따로 한다.
     * 36개 중 17개가 여기 걸렸다.
     */
    id: "T12",
    label: "화면 위치 받아쓰기",
    why: "왼쪽·오른쪽·윗줄로 그림을 설명하지 말고 무엇을 판단했는지를 쓴다. 항목은 콜아웃 몫이다.",
    max: 0,
    test: (ss) => {
      const w = /(왼쪽|오른쪽|윗줄|아랫줄|아래 줄|맨 오른쪽|맨 왼쪽)/g;
      return ss.filter((s) => (s.match(w) || []).length >= 2).map((s) => `${s.slice(0, 90)}…`);
    },
  },
  {
    id: "T13",
    label: "300자 넘는 캡션",
    why: "한 캡션에 관찰을 네다섯 개씩 이어 붙이면 사람이 쓴 글로 안 읽힌다. 항목은 콜아웃이 받는다.",
    max: 0,
    captionLevel: true,
    test: (cs) => cs.filter((t) => t.length > 300).map((t) => `${t.length}자 — ${t.slice(0, 70)}…`),
  },
  {
    id: "T14",
    label: "자기서술 공식 반복",
    why: "직접·검증된·설계했습니다를 반복하면 판단보다 자기평가가 먼저 읽힌다.",
    max: 6,
    test: (ss) =>
      ss.filter((s) => /(직접\s+(기획|구축|설계|제작)|검증된\s+방식|설계했습니다|남겼습니다)/.test(s)),
  },
  {
    id: "T11",
    label: "같은 말로 끝나는 문장",
    why: "끝 20자가 겹치는 문장이 셋 이상이면 틀에 찍어 낸 것으로 읽힌다.",
    max: 0,
    test: (ss) => {
      const bucket = new Map();
      for (const s of ss) {
        if (s.length < 24) continue;
        const key = s.slice(-20);
        bucket.set(key, (bucket.get(key) ?? 0) + 1);
      }
      return [...bucket.entries()].filter(([, n]) => n >= 3).map(([k, n]) => `${n}회 — …${k}`);
    },
  },
];

/* ── 실행 ─────────────────────────────────────────────── */
const edition = process.argv[2] ?? "general";
const files = htmlFiles(OUT);
if (!files.length) {
  console.error(`out/ 에 html 이 없다 — 먼저 npm run build:${edition}`);
  process.exit(1);
}

/*
 * 페이지마다 반복되는 머리말·꼬리말이 통계를 흐린다. 같은 문장은 한 번만 센다.
 * T8(같은 어미 연속)은 덩어리 안에서만 봐야 해서 문단 단위도 따로 모아 둔다.
 */
const seen = new Map();
const blocks = [];
const captions = [];
for (const f of files) {
  const where = f.replace(/\\/g, "/").replace(`${OUT}/`, "");
  for (const { tag, text } of proseBlocks(readFileSync(f, "utf8"))) {
    const ss = sentences(text);
    if (ss.length >= 4 && !blocks.some((x) => x.join(" ") === ss.join(" "))) blocks.push(ss);
    /* 길이 규칙은 캡션에만 건다 — 본문 서술과 출처 각주는 길어도 되는 자리다 */
    if (tag === "figcaption" && ss.length) {
      /* 캡션 끝에는 컴포넌트가 붙이는 링크 글자가 딸려 온다 — 길이를 잴 때는 뺀다 */
      const only = text.replace(/\s*(원본 크기로 열기|영상 원본 열기|원문 보기)\s*↗\s*$/, "").trim();
      if (!captions.includes(only)) captions.push(only);
    }
    for (const s of ss) if (!seen.has(s)) seen.set(s, where);
  }
}
const all = [...seen.keys()];

console.log(`\n=== 말투 검수 · ${edition} ===`);
console.log(`  · html ${files.length}건 · 산문 문장 ${all.length}건 · 4문장 이상 문단 ${blocks.length}건\n`);

let fail = 0;
for (const r of RULES) {
  const hits = r.test(r.captionLevel ? captions : r.blockLevel ? blocks : all);
  const over = hits.length > r.max;
  if (over) fail += 1;
  const mark = over ? "✗" : "·";
  console.log(`  ${mark} ${r.id} ${r.label} — ${hits.length}건 (허용 ${r.max})`);
  if (over) {
    console.log(`      ${r.why}`);
    for (const h of hits.slice(0, 6)) {
      const t = typeof h === "string" ? h : String(h);
      console.log(`      · ${t.length > 110 ? `${t.slice(0, 110)}…` : t}`);
    }
    if (hits.length > 6) console.log(`      · 그 외 ${hits.length - 6}건`);
  }
}

console.log(
  fail === 0
    ? `\n통과 — 위반 0건 (${RULES.map((r) => r.id).join("·")})\n`
    : `\n실패 ${fail}건 — 위 문장을 읽고 고친 뒤 다시 빌드해서 재실행\n`,
);
process.exit(fail === 0 ? 0 : 1);
