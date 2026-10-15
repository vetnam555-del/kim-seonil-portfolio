/**
 * 판(edition)별 개발 서버.
 *   node scripts/dev_edition.mjs general
 *
 * build_edition.mjs 와 같은 이유로 존재한다 — 윈도우에서 `EDITION=x npm run dev` 가
 * 통하지 않는다. 이게 없으면 기본값(hll)만 개발 서버로 볼 수 있어서, 일반판·신세계판의
 * 레이아웃은 매번 정적 빌드를 돌려야만 확인할 수 있었다.
 */
import { spawn } from "node:child_process";

const edition = ["general", "hll", "shinsegae", "ably", "v260908", "nw"].includes(process.argv[2]) ? process.argv[2] : "hll";
const port = process.argv[3] || "3000";
console.log(`=== dev edition: ${edition} (port ${port}) ===`);
spawn("npx", ["next", "dev", "--port", port], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, EDITION: edition, NEXT_PUBLIC_EDITION: edition },
}).on("exit", (c) => process.exit(c ?? 0));
