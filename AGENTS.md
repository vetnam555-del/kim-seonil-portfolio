# 김선일 포트폴리오 — 코덱스(자비스) 이어받기 안내

코덱스가 이 저장소에서 일할 때 먼저 읽는 파일이다. 작업 규칙은 Claude 와 같다.

| 무엇 | 어디 |
|---|---|
| 저장소 구조 · 빌드 · 배포 | `CLAUDE.md` |
| 작업 순서(성과 추가 · 수정 · 검수 · 배포 · 덱 PDF) | `.claude/skills/portfolio-steward/SKILL.md` |
| 할 일 · 점수표 · **정해 둔 것** | `source/BACKLOG.md` |
| 수치 · 문구 원칙 | `source/README.md` · `source/RELEASE_CHECKLIST.md` |
| **지금 하던 일 · 다음 할 일** | `source/HANDOFF.md` |

## 언제 이어받나

Claude 사용량이 바닥나 Claude 가 멈추면 코덱스가 이어서 한다(2026-10-25 주인 결정).
Claude 는 사용량 한도에 걸리는 순간 아무것도 할 수 없으므로, 멈춘 뒤에 신호를 보내지 못한다. 그래서 시작은 둘 중 하나다.

1. 주인이 코덱스에게 말한다 — "AGENTS.md 이어받기대로 진행해".
2. 열린 PR 에 아래 댓글이 달린다. Claude 가 멈출 것을 미리 알 때(주인이 넘기라고 했을 때 등) 단다.
   자비스 감시가 이 댓글을 받도록 설정돼 있으면 거기서 시작한다.

````
<!-- jarvis-handoff-request:v1 -->
```json
{"request_id":"<새 uuid4>","head_sha":"<40자 sha>","branch":"<작업 브랜치>","mode":"continue","handoff":"source/HANDOFF.md"}
```
````

## 이어받는 순서

1. `git fetch` 뒤 `source/HANDOFF.md` 의 **작업 브랜치**를 받고, 그 브랜치에 있는 HANDOFF 를 기준으로 한다
   (main 의 HANDOFF 는 PR 을 합칠 때만 따라오므로 늦을 수 있다). 열린 PR 이 그 브랜치를 보고 있으므로 새 브랜치를 만들지 않는다.
   HANDOFF 에 진행 중인 일이 없고 새 일을 시작하면 `main` 에서 `codex/<주제>` 브랜치를 만든다.
2. HANDOFF 의 **담당**을 `codex` 로 바꿔 먼저 commit · push 한다. 두 에이전트가 한 브랜치에 동시에 쓰지 않기 위해서다.
   담당이 `claude` 이고 상태가 "진행 중"인데 주인이 넘기라고 하지 않았다면 주인에게 먼저 묻는다.
3. HANDOFF 의 "다음 할 일"부터 한다. 순서와 검수는 SKILL.md 그대로다
   (원본 `source/` 수정 → `npm run publish:general` → `npm run typecheck` · `node scripts/qa_release.mjs` → 같은 커밋에 원본과 루트 빌드 결과).
4. 한 단계가 끝날 때마다 HANDOFF 를 고쳐 push 한다. 코덱스도 언제 멈출지 모르기 때문이다.
5. 끝나면 PR 을 열거나 갱신하고 HANDOFF 상태를 "검토 대기", 담당을 `없음` 으로 둔다.

## 검토와 배포 (코덱스가 만든 커밋)

- 자비스가 곧 코덱스다. 코덱스가 만든 head 에는 `jarvis-review-request` 를 달지 않는다 — 자기 검토가 된다.
- `main` 에 직접 합치지 않는다. Claude 가 돌아오면 Claude 가 diff 를 읽고 검수를 다시 돌려 교차 검토한 뒤 합친다.
  주인이 바로 합치라고 하면 그 말을 따른다.
- 자비스 응답 · 검수 결과 · 라이브 측정값을 지어내지 않는다. 못 돌린 검수는 못 돌렸다고 적는다.

## 코덱스 환경

- 주인 PC(Windows) 기준: 브라우저 QA 스크립트의 기본 Chrome · Edge 경로가 그대로 맞고, 파이썬은 `py` 다(`build_edition.mjs` 가 고른다).
- `.claude/settings.json` 의 시작 훅(`source/scripts/cloud_setup.sh`)은 Claude 클라우드 전용이다. 코덱스는 직접 준비한다:
  `cd source && npm ci` · `pip install fonttools brotli pillow`.
- 포트폴리오 PDF(덱) 생성기는 이 저장소에 없다. Drive `코덱스/portfolio-deck-v2` 원본과 SKILL 7절 순서로 굽는다.

## 꼭 지키는 것 (자세한 것은 BACKLOG "정해 둔 것")

- 이력서 PDF 에 전화번호 · 주소 · 생년월일을 넣지 않는다. 공개 저장소에 비공개 자료(기획 메모 · 사내 자료)를 올리지 않는다.
- 사실 · 수치를 지어내지 않는다. 모르는 값은 묻거나 뺀다. 광고주 로고는 쓰지 않는다.
- 저장소 이름을 바꾸지 않는다. Pages Source 는 GitHub Actions 다.
- 루트에 빌드 결과가 아닌 파일을 더하면 `source/scripts/publish_general.mjs` 의 KEEP 과 `.github/workflows/pages.yml` 제외 목록을 같이 고친다.
