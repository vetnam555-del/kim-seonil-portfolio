/*
 * 가운뎃점이 줄 맨 앞에 오지 않게 한다 — B-06 (2026-11-03).
 *
 * 본문은 word-break: keep-all 이라 한글 단어 안에서는 줄이 바뀌지 않지만, '·' 앞은 줄바꿈 자리로 남는다.
 * 그래서 좁은 화면에서 "운영 / ·분석" 처럼 가운뎃점이 줄 맨 앞에 왔다(375px 에서 22곳 · 2026-11-03 측정).
 * 두 가지를 막는다.
 *  1. 붙여 쓴 가운뎃점(운영·분석) — '·' 앞에 줄바꿈 금지 문자(U+2060 WORD JOINER)를 넣는다.
 *     '·' 뒤에서 줄이 바뀌는 것("운영· / 분석")은 그대로 허용한다.
 *  2. 띄어 쓴 구분자(" · ") — '·' 앞의 보통 공백을 줄바꿈 없는 공백(NBSP)으로 바꾼다. nbsp_separators.mjs 가
 *     원본 문구에서 한 번 바꿔 두었지만 JSX 조각 사이({이메일} ·{" "}<a>…, {이름} · {설명})와 그 뒤에 쓴 문구에는
 *     보통 공백이 남아 있었다(푸터 연락처 줄 · 이력서 머리 · 교육·활동 목록 — 360px 에서 24곳).
 * 원본 문구(src/data)는 그대로 두고 화면에 그리는 순간(JSX 런타임)에만 바꾼다 — 데이터 · 링크 · 속성값 · 이력서 PDF 는 영향이 없다.
 * 줄바꿈 문자 뒤의 '·'(pre-line 목록의 줄 머리)는 건드리지 않는다.
 */
const SPACED = / +·/g;
const JOINED = /([^\s\u00a0\u2060])·/g;

export function joinDots(text: string): string {
  if (!text.includes("·")) return text;
  return text.replace(SPACED, "\u00a0·").replace(JOINED, "$1\u2060·");
}

/* 이 요소 안의 글자는 바꾸지 않는다(코드 · 스타일 · 입력 칸) */
const SKIP = new Set(["script", "style", "textarea", "code", "pre"]);

/* 요소 글자가 '·' 로 시작하면(<span>· 2016.08.15</span>, 링크 사이의 <span>·</span>) 앞 요소와의 사이에서 줄이 바뀔 수 있어
   맨 앞에도 붙인다 */
function leadDot(text: string): string {
  return text.startsWith("·") ? "\u2060" + text : text;
}

const TRAILING_SPACES = / +$/;
const ENDS_WITH_SPACE = /[\s\u00a0\u2060]$/;

/** JSX props 의 children 중 문자열만 바꾼다. 바뀐 게 없으면 같은 객체를 돌려준다 */
export function withJoinedDots(type: unknown, props: unknown): unknown {
  if (!props || typeof props !== "object" || (typeof type === "string" && SKIP.has(type))) return props;
  const p = props as { children?: unknown };
  const c = p.children;
  if (typeof c === "string") {
    const n = leadDot(joinDots(c));
    return n === c ? props : { ...p, children: n };
  }
  if (Array.isArray(c)) {
    let changed = false;
    const next = c.map((x, i) => {
      if (typeof x !== "string") return x;
      let n = joinDots(x);
      /* 다음 조각이 '·' 로 시작하면({이메일}{" "}·{" "}<a>…) 이 조각 끝의 보통 공백을 NBSP 로 바꾼다 */
      const after = c[i + 1];
      if (typeof after === "string" && after.startsWith("·")) n = n.replace(TRAILING_SPACES, "\u00a0");
      /* {앞 글자}·{뒤 글자} 처럼 '·' 가 조각 맨 앞이면 — 첫 조각이거나, 앞 조각이 공백으로 끝나지 않을 때 앞에 붙인다.
         앞 조각이 보통 공백으로 끝나면 바로 위 규칙이 그 공백을 NBSP 로 바꿔 두었다 */
      if (n.startsWith("·")) {
        const prev = i > 0 ? c[i - 1] : null;
        if (i === 0 || typeof prev !== "string" || (prev.length > 0 && !ENDS_WITH_SPACE.test(prev))) n = "\u2060" + n;
      }
      if (n !== x) changed = true;
      return n;
    });
    return changed ? { ...p, children: next } : props;
  }
  return props;
}
