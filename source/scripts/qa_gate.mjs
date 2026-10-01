/**
 * 검수 게이트 — 빌드된 판 하나에 사실·구조, 말투, 배치 검수를 함께 돌린다.
 *
 * out/ 이 어느 판인지 스스로 읽어서 두 스크립트에 같은 판을 넘긴다.
 * 판을 손으로 적다가 어긋나면 qa_final 이 G0 에서 떨어지는데,
 * 그때 나오는 건 "판이 다르다"는 말뿐이라 무엇을 고쳐야 할지가 한 단계 멀어진다.
 *
 * 실행: npm run qa:all
 */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

const BASE = {
  "/kim-seonil-portfolio_HLL": "hll",
  "/kim-seonil-portfolio_shinsegae": "shinsegae",
  "/kim-seonil-portfolio_ABLY": "ably",
  "/kim-seonil-portfolio_260908": "v260908",
  "/kim-seonil-portfolio_new": "nw",
  "/kim-seonil-portfolio": "general",
};

let edition = process.argv[2];
if (!edition) {
  const html = readFileSync("out/index.html", "utf8");
  edition = Object.entries(BASE).find(([b]) => html.includes(`${b}/_next/`))?.[1];
  if (!edition) {
    console.error("out/ 이 어느 판인지 못 읽었다 — 판 이름을 인자로 넘겨라");
    process.exit(1);
  }
}

let failed = 0;
/* qa_wrap 은 줄바꿈이 의미 단위를 끊는 곳을 본다 — 폭이 정해져야 생기는 결함이라
   앞의 셋으로는 잡히지 않는다 (S1 수치의 "(내부 / 실측 기준)" 이 그렇게 새어 나갔다). */
for (const s of ["qa_final.mjs", "qa_tone.mjs", "qa_layout.mjs", "qa_wrap.mjs"]) {
  const r = spawnSync(process.execPath, [`scripts/${s}`, edition], { stdio: "inherit" });
  if (r.status !== 0) failed += 1;
}
console.log(failed === 0 ? `\n검수 게이트 통과 — ${edition}\n` : `\n검수 게이트 실패 ${failed}건 — ${edition}\n`);
process.exit(failed === 0 ? 0 : 1);
