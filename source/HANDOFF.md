# 인계 메모 (Claude ↔ 코덱스)

지금 하던 일을 다른 에이전트가 이어받을 수 있게 남긴다. 이어받는 순서는 루트 `AGENTS.md`, 남기는 규칙은 SKILL 12절이다.
작업 단위가 끝날 때마다 고쳐 작업 브랜치에 push 한다. 이 파일은 사이트에 올라가지 않는다(`source/`).

| 항목 | 값 |
|---|---|
| 담당 | claude |
| 상태 | 진행 중 |
| 작업 브랜치 | `claude/quirky-rubin-va27c0` |
| 열린 PR | 없음(이 일로 새로 연다) |
| 마지막 갱신 | 2026-10-29 · Claude |

## 지금 하던 일

B-13 글꼴 서브셋 결정성(주인 요청: 보이는 글자가 그대로인데 `publish:general` 마다 `fonts/` 의 woff2 5개가 바이트만 달라진다 —
같은 문자 집합이면 같은 바이트가 나오게). 원인은 fontTools 가 저장할 때 `head.modified` 에 지금 시각을 적는 것
(`TTFont(..., recalcTimestamp=True)` 기본값). `PYTHONHASHSEED` 를 바꿔도 결과는 같았다(입력 문자는 이미 정렬).
고칠 곳은 `scripts/subset_fonts.py` 하나 — 원본을 `recalcTimestamp=False` 로 열어 원본의 `head.modified` 를 그대로 둔다.
PR #18 은 main 에 합쳐졌다(e6787a9).

## 다음 할 일

1. `subset_fonts.py` 수정 → `npm run publish:general` 한 번(글꼴 5개의 `head.modified` 가 원본 날짜로 바뀌는 한 번뿐인 변경 —
   HEAD 와 문자표 · 글리프 수 같음 확인) → 다시 두 번(한 번은 다른 `PYTHONHASHSEED`) 돌려 `git status -- fonts source/public/fonts` 깨끗한지.
2. `npm run typecheck` · `node scripts/qa_release.mjs` · RELEASE_PASS.
3. `BACKLOG.md` B-13 을 완료 기록으로, PR(`[자비스 검토]`) · 자비스 검토 요청.

## 이어받을 때 주의

- 덱 PDF 를 다시 굽는 일은 Drive 원본이 필요하다(SKILL 7절).
- 주인 확인(O-)이 필요한 항목은 사실을 받기 전에 문장을 만들지 않는다.

<!--
진행 중일 때 쓰는 모양:

| 담당 | claude 또는 codex |
| 상태 | 진행 중 |
| 작업 브랜치 | <브랜치> |
| 열린 PR | <PR 링크> |
| 마지막 갱신 | <날짜 · 누가> |

## 지금 하던 일
<무엇을 · 왜(주인 요청 원문 요지) · 어디까지 했나 — 커밋 sha>

## 다음 할 일
1. <지금 일의 바로 다음 단계 — 파일 · 명령까지>
2. ...
### 그 다음
<지금 일이 끝난 뒤 새 작업으로 시작할 것(백로그)>

## 확인한 것 · 아직 못 한 것
- <검수 결과, 돌리지 못한 검수>
-->
