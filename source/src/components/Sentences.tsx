import { Fragment } from "react";

/*
 * 문장 단위 줄바꿈 (2026.09.26, 사용자: "같은 표본으로 다시"가 줄 끝에 걸려 갈라진다).
 * 문장마다 한 덩어리(inline-block)로 두어, 다음 문장이 남은 칸에 다 안 들어가면 통째로 다음 줄로 내려간다.
 * 한 문장이 한 줄보다 길면 그 안에서는 평소처럼 줄이 바뀐다. "독립문(2024)"처럼 말과 괄호도 붙여 둔다.
 * 글자는 그대로다 — 화면 조판만 바꾼다.
 */
const SPLIT = /(?<=[.!?])\s+/;
const KEEP = /(\S+\([^()]{1,14}\)[가-힣]{0,2})/;

export default function Sentences({ text }: { text: string }) {
  const parts = text.split(SPLIT).filter(Boolean);
  return (
    <>
      {parts.map((sentence, i) => (
        <Fragment key={i}>
          {i ? " " : null}
          <span className="sent">
            {sentence.split(KEEP).map((seg, j) => (j % 2 ? <span key={j} className="nw">{seg}</span> : seg))}
          </span>
        </Fragment>
      ))}
    </>
  );
}
