/**
 * RSC 프리페치 404 보정 (Next.js 16 static export)
 *
 * 왜 필요한가
 *  next build 는 라우트별 프리페치 페이로드를 **디렉토리** 형태로 쓴다.
 *      out/resume/__next.resume/__PAGE__.txt
 *  그런데 클라이언트는 같은 것을 **점(.)으로 이어붙인 파일명**으로 요청한다.
 *      out/resume/__next.resume.__PAGE__.txt        ← 404
 *
 *  결과: 헤더의 "웹 이력서" 링크를 프리페치할 때마다 모든 페이지에서 404가 찍히고,
 *  /resume/ 이동이 클라이언트 내비게이션 대신 전체 새로고침으로 떨어진다.
 *  (페이지 자체는 정상 동작하므로 기능 장애는 아니고, 콘솔 오류 + 이동 속도 손해다.)
 *
 * 무엇을 하는가
 *  out/ 안의 모든 `__next.*` 디렉토리 밑 `__PAGE__.txt` 를 찾아, 클라이언트가 기대하는
 *  점 연결 경로에 **복사본을 추가**한다. 원본은 건드리지 않으므로 되돌릴 필요가 없고,
 *  Next가 나중에 이 동작을 고쳐도 사본이 남을 뿐 깨지지 않는다.
 */
import { readdir, copyFile, stat } from "node:fs/promises";
import { join, relative, sep } from "node:path";

const OUT = "out";

/** out/ 하위의 모든 __PAGE__.txt 경로를 모은다 */
async function collect(dir, found = []) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await collect(p, found);
    else if (e.name === "__PAGE__.txt") found.push(p);
  }
  return found;
}

const pages = await collect(OUT);
let copied = 0;

for (const src of pages) {
  const parts = relative(OUT, src).split(sep);
  // __next. 으로 시작하는 첫 세그먼트를 찾는다. 없으면 보정 대상이 아니다(루트 페이로드 등).
  const i = parts.findIndex((s) => s.startsWith("__next."));
  if (i === -1) continue;

  // __next.* 부터 __PAGE__.txt 까지를 점으로 이어 붙이고, 그 앞 경로는 그대로 둔다.
  const base = parts.slice(0, i);
  const joined = parts.slice(i).join(".");
  const dest = join(OUT, ...base, joined);

  if (dest === src) continue;
  try {
    await stat(dest);
    continue; // 이미 있으면 건너뛴다
  } catch {
    /* 없으니 만든다 */
  }
  await copyFile(src, dest);
  copied += 1;
  console.log(`  + ${relative(OUT, dest)}`);
}

console.log(
  copied
    ? `\nRSC 프리페치 보정 완료 — ${copied}개 추가`
    : "\nRSC 프리페치 보정 대상 없음 (이미 정상이거나 Next가 고침)",
);
