# 김선일 포트폴리오 — 클라우드 작업 안내

이 저장소는 **배포물과 원본이 함께 있는** 저장소다. 2026-10-01 에 로컬 PC(Windows)에서 클라우드로 옮겼다.

| 위치 | 내용 | 직접 고치나 |
|---|---|---|
| 저장소 루트 (`index.html`, `_next/`, `projects/`, `evidence/`, `fonts/` …) | GitHub Pages 가 그대로 서비스하는 **일반판 빌드 결과** (https://vetnam555-del.github.io/kim-seonil-portfolio/) | **아니다.** 빌드로만 바꾼다 |
| `source/` | Next.js 16 원본 (`src/`, `scripts/`, `public/`, `assets/og/general/`) | 여기를 고친다 |

원본 사용법·수치 원칙은 `source/README.md`, 출시 검수 기준은 `source/RELEASE_CHECKLIST.md`,
Next.js 16 주의사항은 `source/AGENTS.md` 에 있다. 코드를 고치기 전에 읽는다.

**작업 매뉴얼은 `.claude/skills/portfolio-steward/SKILL.md`, 할 일·점수표·정해 둔 결정은 `source/BACKLOG.md` 다.**
새 성과 추가·문구 수정·점검 결과 처리·배포는 매뉴얼 순서를 따르고, 끝나면 백로그를 고친다.

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
   - 외부 링크 확인(G16)은 403·429 를 경고로만 남긴다(사이트가 자동 요청을 막는 것). 다른 항목이 모두 통과하면 정상이다.
   - 출시 승인(RELEASE_PASS)은 `scripts/runtime_evidence.mjs` 로 브라우저 증거를 만든 뒤 `qa_release --approve` 로 받는다(매뉴얼 3절).
4. `source/` 변경과 루트 빌드 결과를 **같은 커밋**에 넣어 push 한다.
   GitHub Pages 는 `main` 브랜치 루트를 서비스한다 — `main` 에 들어가야 라이브에 반영된다.

## 클라우드 환경

- 세션이 시작되면 `.claude/settings.json` 훅이 `source/scripts/cloud_setup.sh` 를 실행해
  `npm ci` 와 `pip install fonttools brotli pillow` 를 준비한다(로컬 PC 에서는 아무것도 하지 않는다).
- 파이썬은 `python3` 를 쓴다(`build_edition.mjs` 가 윈도우 밖에서는 자동으로 고른다).
- 브라우저 QA 스크립트는 윈도우 Chrome/Edge 경로가 기본값이다. 클라우드 컨테이너는 root 라
  샌드박스 없이만 Chromium 이 뜬다 — 래퍼를 넘긴다.
  ```bash
  QA_BROWSER=$PWD/scripts/cloud_chromium.sh node scripts/qa_layout.mjs general   # qa_wrap 도 같다
  CHROME_PATH=$PWD/scripts/cloud_chromium.sh node scripts/…                      # CHROME_PATH 를 읽는 스크립트
  ```

## 계속 발전시키는 체계 (2026-10-10)

| 무엇 | 어디 |
|---|---|
| 정기 점검 | 매주 월요일 08:48(KST) 루틴이 새 세션에서 `npm run health:full`, 정적 검수, 레퍼런스 비교를 돌려 앱 알림·이메일로 보고한다. 루틴은 커밋·push 하지 않는다 |
| 라이브 점검 스크립트 | `source/scripts/health_check.mjs` — 라이브가 main 과 같은지, PDF 원칙, 외부 링크, Lighthouse, 채점 기준 점수 |
| 백로그·점수표 | `source/BACKLOG.md` |
| 레퍼런스 | `source/REFERENCES.md` — 다른 포트폴리오에서 가져온 것·안 가져온 것, 비교 기준, 주차별 탐색 범위 (매뉴얼 9절) |
| 성과 추가 | 대화로 받는다. 확인할 사실과 고칠 파일 목록은 매뉴얼 1절 |

## 이 저장소에 없는 것

- 다른 판(hll · shinsegae · ably · v260908 · nw)의 OG 자산과 에이블리 덱 PDF — 일반판만 이 저장소로 배포하므로 옮기지 않았다.
  그 판을 빌드하려면 Google Drive `코덱스/kim-seonil-portfolio-HLL-source` 에서 `assets/og/<판>/` 과 PDF 를 가져온다.
- 기획·검수 메모(`docs/`, `insight/CODEX_유입분석_요청.md`) — 공개 저장소라 올리지 않았다. 원본은 같은 Drive 폴더에 있다.
