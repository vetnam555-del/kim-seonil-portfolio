---
name: portfolio-steward
description: 김선일 포트폴리오를 고치고·검수하고·배포하고·점검할 때 쓴다. 대화로 받은 새 성과를 사례·경력·이력서·영문판·PDF 에 반영하는 순서, 주간 점검 보고 처리, 백로그·점수표 갱신, 자비스 검토와 main 배포 규칙, 정해 둔 결정이 들어 있다. "성과 추가", "포트폴리오 수정", "점검 결과", "백로그", "배포" 요청이면 먼저 읽는다.
---

# 포트폴리오 관리 매뉴얼

저장소 구조와 빌드 명령은 루트 `CLAUDE.md`, 수치·문구 규칙은 `source/README.md`, 할 일과 점수는 `source/BACKLOG.md` 에 있다.
다른 포트폴리오에서 배운 것은 `source/REFERENCES.md` 에 쌓는다. 이 문서는 이것들을 어떤 순서로 쓰는지 정한다.

## 0. 시작할 때

1. `source/BACKLOG.md` 를 읽는다 — 점수표, 할 일(B-·R-), 주인 확인(O-), **정해 둔 것**(다시 바꾸지 않는 결정).
2. 세션이 정해 준 작업 브랜치에서 일한다. 다른 브랜치에 push 하지 않는다.
3. main 은 라이브다. main 에는 아래 6절 순서(자비스 검토 → PR 합치기)로만 들인다.

## 1. 새 성과 추가 (대화로 받는다)

주인이 대화로 성과를 알려 주면 바로 쓰지 않고, 먼저 아래 사실을 **한 번에 모아** 묻는다. 모르는 값은 추측하지 않고
`NEEDS_DATA`(`"데이터 확인 필요"`)로 두거나 문장에서 뺀다.

| 확인할 것 | 예 | 왜 |
|---|---|---|
| 브랜드·조직, 공개 가능 여부 | 광고주 이름을 써도 되는가, 비식별로 쓸 것인가 | 공개 저장소·공개 사이트다 |
| 기간 | `2026.03 – 2026.06` | 비교 기간이 다르면 나란히 두지 않는다 |
| 지표 · 전후 값 · 기준 | ROAS 210% → 340%, 같은 4주 비교 | 기준이 다른 수치를 섞지 않는다 |
| 분모 | 전체 계정인가, 특정 캠페인인가 | 부풀려 읽히지 않게 |
| 출처 | GA4 · 매체 리포트 · 운영 로그 | `detail.source` 에 남긴다 |
| 기여 범위와 % | "검색광고 운영·분석 단독 100%" | 기여도는 **그 범위 기준**이다. 팀 인원은 적지 않는다 |
| 함께한 사람 · 범위 밖 | 소재 제작은 디자인팀 | "제 제작 실적은 아닙니다"처럼 밝힌다 |
| 증빙 | 비식별 캡처가 가능한가 | `public/evidence/` |
| 배운 것 | 처음 짐작이 틀렸던 점 | 사례 마지막 단 |

받은 뒤 반영할 곳 (빠뜨리면 사이트·이력서·PDF 가 어긋난다):

| 무엇 | 파일 |
|---|---|
| 사례 본문 (대표·보조·아카이브) 또는 추가 성과 카드 | `source/src/data/projects.ts` (`projects` · `otherResults`) |
| 대표 사례면 홈 카드 · 단별 요지 | `source/src/data/caseCards.ts` · `caseLedes.ts` |
| 홈 경력 문장 · 핵심 수치 · 이력서 경력 | `source/src/data/site.ts` (`generalCover.career` · `keyNumbers` · `career`) |
| 영문판 (새 사실을 더하지 않고 옮긴다) | `source/src/data/en/projects.en.json` · `caseCards.en.ts` · `caseLedes.en.ts` · `home.en.ts` · `resume.en.ts` |
| 증빙 이미지 | `source/public/evidence/` + `python3 scripts/measure_evidence.py` 로 `evidence-sizes.json` |
| 이력서 PDF (5쪽) | `source/README.md` "이력서" 절대로 다시 인쇄 → `site.ts` `resumePdfPath` `?v=` 올림 |
| 포트폴리오 PDF (29쪽 덱) | 아래 7절. 덱 문구(`v3/cases.js`)도 같은 사실로 맞춘다 |
| 백로그 | `source/BACKLOG.md` 완료 기록 |

## 2. 문구·수치 원칙

- 검증된 값만 쓴다. 출처·기간·기여 범위를 사례마다 적는다. 사이트·이력서·PDF 의 같은 수치는 같아야 한다.
- 말투: 주장형 제목, 짧은 문장, 한자어 명사 나열·"~하며," 이어 붙이기·AI 상투어(혁신적·압도적·원스톱 등)를 쓰지 않는다.
  영문판은 em dash 를 쓰지 않는다.
- 띄어 쓴 구분자 `" · "` 는 NBSP(`" · "`, JSX `&nbsp;· `). 문구를 고친 뒤 `node scripts/nbsp_separators.mjs . --dry` → 적용.
- 개인정보: 전화번호·주소·생년월일은 사이트·이력서 PDF 어디에도 싣지 않는다. 광고주 원천 데이터는 비식별 처리한다.
- 다른 판(hll · shinsegae · ably · v260908 · nw) 자료나 비공개 원본을 이 공개 저장소로 옮기지 않는다.

## 3. 고치고 검수하기

```bash
cd source
# 1) src/data … 수정
npm run publish:general        # 빌드 → 검증 → 루트 교체. 끝의 [글자 바뀜] 이 의도와 맞는지 본다
npm run typecheck
npm run qa:tone && npm run qa:en && npm run qa:final
QA_BROWSER=$PWD/scripts/cloud_chromium.sh node scripts/qa_layout.mjs general
QA_BROWSER=$PWD/scripts/cloud_chromium.sh node scripts/qa_wrap.mjs general
node scripts/qa_release.mjs    # STATIC_PASS_RUNTIME_PENDING 과 fingerprint 를 얻는다
```

출시 승인(RELEASE_PASS)까지:

```bash
npm i --prefix /tmp/portfolio-qa-tools --no-save --no-audit --no-fund puppeteer-core@24.43.1   # 세션마다 한 번
node scripts/serve_export.mjs general .. 8154 &          # 이미 떠 있으면 EADDRINUSE — 그대로 쓴다
node scripts/runtime_evidence.mjs http://127.0.0.1:8154/kim-seonil-portfolio artifacts/release/runtime <fingerprint>
node scripts/qa_release.mjs --approve --runtime=artifacts/release/runtime/runtime.json --report=artifacts/release/release.json
```

- 클라우드에서는 외부 링크 확인(G16)이 403 으로 경고만 남는다. 다른 항목이 모두 통과하면 정상이다.
- `publish:general` 이 "루트에 커밋되지 않은 파일"로 멈추면 일괄로 되돌리지 않는다. 그 검사는 작업 파일을 지키려고 있는 것이다.
  저장소 루트에서 한다(`cd "$(git rev-parse --show-toplevel)"`).
  1. publish 검사와 같은 목록을 본다:
     `git status --porcelain --untracked-files=all --ignored -- . ':(exclude)source' ':(exclude).claude' ':(exclude).github' ':(exclude).git' ':(exclude)CLAUDE.md' ':(exclude)README.md' ':(exclude).gitignore'`
  2. 추적되는 파일의 변경(` M`, ` D`)이 이전 빌드가 남긴 배포물이면 그 경로만 지정해 되돌린다:
     `git restore --source=HEAD --staged --worktree -- <경로>`.
  3. 추적되지 않거나 무시되는 파일(`??`, `!!` — 새 해시 이름의 `_next/…` 같은 것)은 지우지 말고 저장소 밖 스크래치 폴더로
     옮긴다(`mkdir -p <스크래치>/publish-held && mv <경로> <스크래치>/publish-held/`). 배포물이 아닌 메모라면 커밋해도 된다.
  4. 1번 목록이 비면 `cd source && npm run publish:general` 로 다시 돈다. `git checkout HEAD -- .` 같은 일괄 복원과 `git clean` 은 쓰지 않는다.
- 화면을 바꿨다면 375·390·1440px 캡처를 직접 본다. 가운뎃점이 줄 맨 앞에 오지 않는지 본다.

## 4. 커밋

- `source/` 변경과 루트 빌드 결과를 **같은 커밋**에 넣는다. 커밋 메시지는 무엇을·왜.
- `git push -u origin <작업 브랜치>`

## 5. 자비스(코덱스) 검토

작업 브랜치의 열린 PR 에 새 head 커밋마다 요청한다(2026-10-10 까지는 PR #2). 형식은 정확히 이것만:

````
<!-- jarvis-review-request:v1 -->
```json
{"request_id":"<새 uuid4>","head_sha":"<40자 sha>","mode":"review","scope":"public-portfolio-diff"}
```
````

- 응답은 `<!-- jarvis-review-response:v1 -->` 표시가 있는 댓글이다. 응답 URL·SHA·mode 와 함께 **원문 그대로** 주인에게 전한다.
- 자비스 응답을 지어내거나 흉내 내지 않는다. 응답이 없으면 없다고 말한다.
- P1·P2 지적은 고치고 새 커밋으로 다시 요청한다.

## 6. main 배포 (라이브)

`main` 에는 원본과 빌드 결과가 함께 있다(2026-10-10 주인 결정 — 비공개 저장소를 따로 두지 않는다).
사이트에는 GitHub Actions(`.github/workflows/pages.yml`)가 루트 빌드 결과만 골라 올린다.
빼는 목록은 `publish_general.mjs` 의 KEEP(`.git` `.github` `.claude` `.gitignore` `CLAUDE.md` `README.md` `source`)과 같다.

1. 작업 브랜치에서 3·4절까지 마치고(빌드 결과가 같은 커밋에 있어야 한다) 자비스 검토를 받는다.
2. PR 을 `main` 에 합친다(merge commit). `main` 에 push 되면 "Deploy Pages" 워크플로가 돈다.
3. 워크플로가 초록인지 보고, 1–3분 뒤 `npm run health` 로 라이브가 `main` 과 같은지, 원본 파일이 사이트에서 404 인지 확인한다.

- 저장소 Settings → Pages → Source 는 **GitHub Actions** 다. "Deploy from a branch" 로 바꾸면 원본이 사이트에서 열린다.
- 워크플로는 결과물에 `source/` `.claude/` `CLAUDE.md` 나 `.ts` `.tsx` `.mjs` `.py` `.md` 파일이 있으면 배포하지 않고 멈춘다.
  루트에 새 파일을 둘 때(빌드 결과가 아닌 것) KEEP 과 워크플로 제외 목록을 같이 고친다.

## 7. 포트폴리오 PDF (덱) 다시 굽기

덱 생성기(pptxgenjs `v3/*.js`)는 이 공개 저장소에 없다. Google Drive `코덱스/portfolio-deck-v2` 에 원본이 있고,
클라우드 수정분은 같은 폴더의 네 개다 — 패치 세 개(2026-10-10 part1·part2, 2026-10-15 part3 — 리멤버 합류)와
2026-10-25 part4 스크립트(실측 줄 수로 상자 높이·구역 간격, 줄바꿈 위치, `qa/measure_lines.py` · `qa/qa_breaks.py`).
이름에 `superseded` 가 붙은 패치는 쓰지 않는다.

1. Drive 에서 `v3/` · `img/` · `post_pptx.py` · `finalize_v3.py` · `qa/` 와
   `portfolio-deck-v3-cloud-20261010-part1.patch` · `part2.patch` · `portfolio-deck-v3-cloud-20261015-part3.patch` ·
   `portfolio-deck-v3-cloud-20261025-part4.py` 를 받는다.
2. 원본의 CRLF 를 LF 로 바꾼 뒤 덱 폴더에서 `patch -p1 < part1.patch`, `part2.patch`, `part3.patch` 순서로 적용하고
   `python3 portfolio-deck-v3-cloud-20261025-part4.py` 를 실행한다(바꿀 곳이 어긋나거나 결과 해시가 다르면 아무것도 쓰지 않고 멈춘다).
3. `bash build3_cloud.sh` 로 굽는다(명령은 `source/README.md` "포트폴리오 PDF" 절 · 실측 줄 수가 바뀌면 스스로 한 번 더 굽는다).
   `qa_boxes` 넘침 0 · `qa_breaks` 줄바꿈 결함 0 이어야 한다. 줄바꿈은 문구 안 "\n" 으로만 고치고 문구는 바꾸지 않는다.
4. 쪽별 글자를 이전 PDF 와 비교하고, `site.ts` · `edition.ts` 의 `portfolioPdfPath` `?v=` 를 올린다.
   `python3 scripts/check_deck_pages.py public/kim-seonil-performance-marketing-portfolio.pdf src/data/deck-pages.json` 로 사례 쪽 번호표도 확인한다.

비공개 원본 저장소(BACKLOG O-03)가 생기면 덱 원본을 거기로 옮기고 이 절을 고친다.

## 8. 주간 점검 (매주 월요일 08:48 KST, 자동)

정기 점검 루틴이 새 세션에서 `npm run health:full`, 정적 검수, 레퍼런스 비교를 돌리고 결과를 앱 알림·이메일로 보낸다.
**루틴은 커밋·push·PR 댓글을 하지 않는다.** 주인이 보고를 보고 대화로 지시하면 그때 아래를 한다.

1. 보고서의 결함을 먼저 처리한다. 결함 기준: 라이브 접속 실패, main 과 다른 배포, 죽은 링크(4xx),
   이력서 쪽수·개인정보(글자 추출이 안 돼 "확인 불가"인 경우 포함).
2. `BACKLOG.md` 점검 기록에 한 줄 더하고, 측정 점수가 바뀌었으면 점수표를 고친다.
   "측정 불완전"·"점수 없음"으로 나온 값은 점수표에 반영하지 않는다.
3. 새로 보인 문제는 할 일에 ID 를 붙여 넣는다(근거 · 위치 · 끝난 조건).
4. 레퍼런스 결과는 9절 순서로 옮긴다.

`npm run health` (라이브 · main 대조 · PDF · 링크) / `npm run health:full` (+ Lighthouse 세 화면, 화면마다 3번 재서
성능 중앙값 회차 · 약 8분, `LH_REPEAT=1` 이면 한 번씩). 결과는 `source/artifacts/health/health-YYYY-MM-DD.{md,json}`
(git 에 올리지 않는다). 403·429 는 차단 응답, 다시 물어도 남는 5xx 는 경고다. 5xx 가 두 주 연속이면 링크를 확인한다.

## 9. 레퍼런스 비교

다른 마케팅 포트폴리오에서 배울 것을 계속 찾는다. 원칙·비교 기준 8가지·주차별 탐색 범위·이미 본 목록은 `source/REFERENCES.md` 에 있다.

1. 형식만 가져온다. 수치·경력·문장은 이 포트폴리오의 사실만 쓴다. 다른 사이트의 문장·이미지를 옮기지 않는다.
2. 가져올 것과 안 가져올 것(이유 한 줄)을 `REFERENCES.md` 표에 같이 적는다. 개인 사이트는 배울 점만 적는다.
3. 가져올 것은 `BACKLOG.md` 할 일에 `R-` 번호로 넣는다. 사실이 필요하면(합류 시점·추천사·협업 상대 등) 주인 확인(`O-`)을 같이 만든다.
4. "정해 둔 것"과 부딪히는 아이디어는 할 일로 만들지 않고 주인에게 묻는다.
5. 페이지는 글자로 읽는다(웹 검색 · 웹 가져오기). 무거운 화면 캡처는 주인이 원할 때만 한다.

## 10. 백로그 갱신 규칙

- 점수는 `BACKLOG.md` 채점 기준으로만 바꾼다. 측정값이 없는 영역(스토리·문장)은 근거를 한 줄 적고 0.5 단위로만 움직인다.
- 끝낸 항목은 지우지 않고 완료 기록으로 옮겨 커밋을 적는다.
- 주인 확인 항목은 주인이 답하기 전에는 손대지 않는다. 답을 받으면 결정은 "정해 둔 것"에 날짜와 함께 적는다.

## 11. 클라우드 환경 메모

- 세션 시작 훅이 `source/scripts/cloud_setup.sh` 로 `npm ci` 와 파이썬 패키지를 준비한다. 파이썬은 `python3`.
- Chromium 은 root 라 샌드박스 없이 띄운다: `QA_BROWSER=$PWD/scripts/cloud_chromium.sh`, `CHROME_PATH` 를 읽는 스크립트도 같다.
- Lighthouse 가 `ERR_CERT_AUTHORITY_INVALID` 로 점수 없이 끝나면 `bash scripts/cloud_browser_ca.sh` 를 돌린다.
  컨테이너의 프록시 CA 를 Chromium 인증서 저장소에 넣는 것이다. TLS 검증을 끄거나 프록시 설정을 지우지 않는다.
- 덱을 구우려면 `apt-get install -y --no-install-recommends libreoffice-impress` 와 Pretendard TTF(`~/.fonts`, `fc-cache -f`)가 필요하다.
- `pkill -f <패턴>` 은 자기 셸까지 끝낼 수 있다. 서버는 PID 로 끈다.
