# 인계 메모 (Claude ↔ 코덱스)

지금 하던 일을 다른 에이전트가 이어받을 수 있게 남긴다. 이어받는 순서는 루트 `AGENTS.md`, 남기는 규칙은 SKILL 12절이다.
작업 단위가 끝날 때마다 고쳐 작업 브랜치에 push 한다. 이 파일은 사이트에 올라가지 않는다(`source/`).

| 항목 | 값 |
|---|---|
| 담당 | claude |
| 상태 | 진행 중 |
| 작업 브랜치 | `claude/quirky-rubin-va27c0` |
| 열린 PR | [#20](https://github.com/vetnam555-del/kim-seonil-portfolio/pull/20) (초안 · 자비스 검토 요청 전) |
| 마지막 갱신 | 2026-10-29 · Claude |

## 지금 하던 일

B-13 글꼴 서브셋 결정성(주인 요청: 보이는 글자가 그대로인데 `publish:general` 마다 `fonts/` 의 woff2 5개가 바이트만 달라진다 —
같은 문자 집합이면 같은 바이트가 나오게). 원인은 fontTools 가 저장할 때 `head.modified` 에 지금 시각을 적는 것.
`subset_fonts.py` 가 원본을 `recalcTimestamp=False` 로 연다(8b68a55). 첫 빌드에서 글꼴 5개가 한 번 바뀌고(6e1c778 — `head` 수정 시각 · 체크섬만 다름),
이어서 두 번(한 번은 `PYTHONHASHSEED=4242`) publish 해도 `fonts/` 변경 0 · 서브셋 검증 통과. typecheck · `qa_release` 정적 통과.
RELEASE_PASS 는 "hero: count-up changed layout width" 로 실패했다 — main 빌드도 4번 중 3번 실패하는 기존 경합(첫 표본이 글꼴 도착 전).
`runtime_evidence.mjs` 가 `__ksiFontsReady` 를 기다리게 고친 커밋을 따로 두었다(이 브랜치 3/3 · main 빌드 통과). PR #18 은 main 에 합쳐졌다(e6787a9).

## 다음 할 일

1. 주인 답 대기: `runtime_evidence.mjs` 고침을 이 PR 에 둘지(두면 RELEASE_PASS 를 받는다), 빼서 따로 할지(빼면 그 커밋만 revert 하고 B-14 로 할 일에 넣는다).
2. RELEASE_PASS: `node scripts/qa_release.mjs` 로 fingerprint → `runtime_evidence.mjs` → `qa_release --approve` (SKILL 3절).
3. PR 제목에 `[자비스 검토]` · 새 head 에 자비스 검토 요청(SKILL 5절) → 합친 뒤 `npm run health`, 이 표를 "끝"으로.

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
