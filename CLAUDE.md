# 김선일 포트폴리오 — 클라우드 작업 안내

이 저장소는 **배포물과 원본이 함께 있는** 저장소다. 2026-10-01 에 로컬 PC(Windows)에서 클라우드로 옮겼다.

| 위치 | 내용 | 직접 고치나 |
|---|---|---|
| 저장소 루트 (`index.html`, `_next/`, `projects/`, `evidence/`, `fonts/` …) | GitHub Pages 가 그대로 서비스하는 **일반판 빌드 결과** (https://vetnam555-del.github.io/kim-seonil-portfolio/) | **아니다.** 빌드로만 바꾼다 |
| `source/` | Next.js 16 원본 (`src/`, `scripts/`, `public/`, `assets/og/general/`) | 여기를 고친다 |

원본 사용법·수치 원칙은 `source/README.md`, 출시 검수 기준은 `source/RELEASE_CHECKLIST.md`,
Next.js 16 주의사항은 `source/AGENTS.md` 에 있다. 코드를 고치기 전에 읽는다.

## 고치고 배포하는 순서

1. `source/src/…` 를 고친다. 문구·수치는 대부분 `source/src/data/` 에 있다.
2. 빌드하고 루트에 반영한다.
   ```bash
   cd source
   npm run publish:check     # (선택) 지금 out/ 과 루트의 차이만 본다
   npm run publish:general   # 일반판 빌드 → 검증 → 루트 갈아 끼우기
   ```
   - 빌드는 `scripts/build_edition.mjs general` 이다. 검토된 이력서 PDF(`public/kim-seonil-resume-public.pdf`)는 그대로 둔다.
   - 출력 끝의 **[글자 바뀜]** 목록이 의도한 변경과 맞는지 확인한다.
   - 루트에서 지키는 것은 `.git` `.github` `.claude` `.gitignore` `CLAUDE.md` `README.md` `source` 뿐, 나머지는 빌드 결과로 바뀐다.
3. `npm run typecheck` 와 `node scripts/qa_release.mjs` 로 정적 검수를 돌린다.
   - 클라우드 기본 네트워크 정책에서는 외부 링크 확인(G16)이 403 으로 실패한다. 다른 항목이 모두 통과하면 그것만 남는 것이 정상이다.
4. `source/` 변경과 루트 빌드 결과를 **같은 커밋**에 넣어 push 한다.
   GitHub Pages 는 `main` 브랜치 루트를 서비스한다 — `main` 에 들어가야 라이브에 반영된다.

## 클라우드 환경

- 세션이 시작되면 `.claude/settings.json` 훅이 `source/scripts/cloud_setup.sh` 를 실행해
  `npm ci` 와 `pip install fonttools brotli pillow` 를 준비한다(로컬 PC 에서는 아무것도 하지 않는다).
- 파이썬은 `python3` 를 쓴다(`build_edition.mjs` 가 윈도우 밖에서는 자동으로 고른다).
- 브라우저 QA 스크립트는 윈도우 Chrome/Edge 경로가 기본값이다. 클라우드에서는
  `QA_BROWSER=/opt/pw-browsers/chromium` (또는 `CHROME_PATH`) 로 넘긴다.

## 이 저장소에 없는 것

- 다른 판(hll · shinsegae · ably · v260908 · nw)의 OG 자산과 에이블리 덱 PDF — 일반판만 이 저장소로 배포하므로 옮기지 않았다.
  그 판을 빌드하려면 Google Drive `코덱스/kim-seonil-portfolio-HLL-source` 에서 `assets/og/<판>/` 과 PDF 를 가져온다.
- 기획·검수 메모(`docs/`, `insight/CODEX_유입분석_요청.md`) — 공개 저장소라 올리지 않았다. 원본은 같은 Drive 폴더에 있다.
