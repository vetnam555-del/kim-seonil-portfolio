import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const script = resolve("scripts/qa_tone.mjs");
const sentence = "매출은 검색에 몰렸고, 신규 수요를 만드는 DA는 대행사별로 흩어져 있었습니다.";
const fixtures = [
  {
    name: "Repeated prose with different step headings is counted once",
    html: ["01 문제", "02 배경", "03 현황"].map((label) => `<li><h4>${label}</h4><p>${sentence}</p></li>`).join(""),
    expected: 0,
  },
  {
    name: "Three distinct sentences with the same ending are still flagged",
    html: ["기존 캠페인에서", "이전 운영에서는", "광고주 요청 당시"].map((lead) => `<p>${lead} 신규 수요를 만드는 DA는 대행사별로 흩어져 있었습니다.</p>`).join(""),
    expected: 1,
  },
];
for (const fixture of fixtures) {
  const dir = mkdtempSync(resolve(".tone-fixture-"));
  mkdirSync(join(dir, "out"));
  writeFileSync(join(dir, "out/index.html"), fixture.html);
  const result = spawnSync(process.execPath, [script, "general"], { cwd: dir, encoding: "utf8", windowsHide: true });
  assert.equal(result.status, fixture.expected, `${fixture.name}\n${result.stdout}\n${result.stderr}`);
  assert.match(result.stdout, new RegExp(`T11 같은 말로 끝나는 문장 — ${fixture.expected}건`));
  console.log(`PASS ${fixture.name}`);
}
