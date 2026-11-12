# 인계 메모 (Claude ↔ 코덱스)

지금 하던 일을 다른 에이전트가 이어받을 수 있게 남긴다. 이어받는 순서는 루트 `AGENTS.md`, 남기는 규칙은 SKILL 12절이다.
작업 단위가 끝날 때마다 고쳐 작업 브랜치에 push 한다. 이 파일은 사이트에 올라가지 않는다(`source/`).

| 항목 | 값 |
|---|---|
| 담당 | claude |
| 상태 | 검토 대기 · 주인 "합쳐" 대기 |
| 작업 브랜치 | `claude/stoic-bohr-gze1d1` |
| 열린 PR | #28 (EDIT H 11.06 갱신) — #27 은 2026-11-05 `main` 902914c 로 합쳤다(라이브 확인 · health 결함 0) |
| 마지막 갱신 | 2026-11-12 · Claude |

## 지금 하던 일

1. EDIT H 갱신(주인 11-07 "포트폴리오 업데이트해줘") — 사이트 숫자가 10.15 VOL.114 · 22일에 멈춰 있었다.
   기준은 `vetnam555-del/edit-h-archive` da2f426(11.06 VOL.136): 루트 날짜 HTML 136개 · 09.24 – 11.06 44일 빠진 날 없음 ·
   11.01 부터 독자 '경제부터 트렌드까지, 2030' · 11.05 호부터 숫자 2곳 대조(빌드 막음) · 11.01 부터 AI 영상 릴스 · 웹툰.
   - 원본 수정 끝: `projects.ts` edith(숫자 · 독자 · 짧게 읽는 소식 · 게이트 · 실패 한 단 · 최근 이미지 설명), `site.ts`(이력서 한 줄 ·
     공개 작업물 카드 · `resumePdfPath` v=20261107a), `en/resume.en.ts`, `edition.ts` OG_VERSION 20261107a, `render_og_cases.mjs` →
     `assets/og/general/og/edith.png`, `validate_export.mjs` EDIT H 기준, 증빙 4장(11.06 카드 10장 · 뉴스레터), 이력서 PDF(2026.11.07 인쇄 —
     글자 차이는 머리 날짜와 4쪽 EDIT H 한 줄뿐), `LINKEDIN.md` · `JOB_PLATFORMS.md` EDIT H 소개, `proposals/O-10`.
   - 빌드 · 검수 끝: `publish:general` [글자 바뀜] 4쪽(edith · resume · en/resume · about) · typecheck · tone · en · final · layout · wrap 0 ·
     동작 시험 23 · RELEASE_PASS 1f1a4771 · 390 · 1440px 캡처 확인. PR #28 · 자비스 요청.

2. 레퍼런스 비교(주인 11-07 "레퍼런스에서 참고하여 개선할 부분 분석 · 있으면 적용") — AI 크리에이터 개인 사이트 한 곳. 가져온 것은 링크 미리보기 칸 채우기(`src/data/og.ts` · `validate_export` 가드) 하나, 나머지는 REFERENCES.md 2026-11-07 에 이유와 함께.
   - 빌드 · 검수 끝: [글자 바뀜] 0쪽 · `validate_export` 0(새 가드 포함) · typecheck · tone · en · final · layout · wrap 0 · 동작 시험 23 ·
     RELEASE_PASS 0b4c382f. PR #28 에 실었다 · 새 자비스 요청.

3. 첫 화면 개편(주인 11-11 "국내 최고 · 처음 보는 사람도 딱 보고 10점 · 전부 바꿔도 된다") — 감사 → 조사(REFERENCES 2026-11-11) → 개편.
   - 끝: 홈 첫 화면(결과 세 칸을 제목 아래로 · 작은 막대 · 사례 링크 · 좁은 화면 사진 옆 이름 · 소속 · 순서 변경) · 경력 세 칸 연표 · `runtime_evidence` 첫 화면 높이에 결과 칸 포함.
     원본: `HomeFolio.tsx` · `globals.css` 맨 아래 '첫 화면 개편' 블록 · `site.ts` / `en/home.en.ts` proof 의 bars · marks. 빌드 · 검수 0 · RELEASE_PASS 8bb0e2a5 · PR #28.
   - 남은 것: 주인 5초 테스트(O-18) · 다음 손질 후보는 주인 보고에 적은 목록.

4. 낮은 창 보강과 더블체크(주인 11-12 "문구 · 구조 · 디자인이 전체적으로 개선됐나 · 자연스러운가 · AI스럽지 않은가 · 최종판이 맞나").
   - 끝: 높이 720px 이하 넓은 화면 배치(`globals.css` '첫 화면 개편' 블록 끝) · 휴대폰 여백 · 결과 칸 묶음(`folio-proof-main` · `folio-proof-text`) ·
     수상 기준 줄 묶음(`site.ts`) · 이력서 표제부(국 · 영 `resume/page.tsx`) · 출시 계약 낮은 창 세 개(`release_contract.mjs` · `runtime_evidence.mjs` · 계약 시험).
     빌드 [글자 바뀜] 0쪽 · 검수 0 · RELEASE_PASS e73ab073 · PR #28.
   - 문장은 고치지 않았다. 걸린 세 문장은 O-19(주인이 정한다).

## 다음 할 일

1. PR #28 — 주인이 합치라고 하면 main 에 합치고 라이브 확인(`npm run health` · EDIT H 사례 136편 · 이력서 PDF v=20261107a · og/edith.png).
2. 주인에게 알릴 것: 링크드인 소개 · Featured 3번, 채용 플랫폼 항목 3 의 EDIT H 문구를 바꿨다(다시 붙여 넣기).
3. O-15 — 주인이 공개 저장소 · 토큰 · 변수를 만들면 "Publish public site" 수동 실행 → 공개 저장소 파일 확인 → 주인 Pages · 비공개 전환 → `npm run health`.
4. O-13 계측 — 주인이 웹앱 주소를 주면 `NEXT_PUBLIC_INSIGHT_URL` 로 빌드(로컬 주소로 만든 산출물은 배포하지 않는다).
5. O-14 검토 방식 · O-16 다른 공개 저장소 · O-12 다이슨 신규 칸 — 주인이 정한다.
6. B-09 코드 정리(주인이 골랐다 · 비공개 전환 뒤 P3) · B-05 이력서 PDF 태그 · 채용 플랫폼 반영(주인).
7. 덱 PDF(비공개 · Drive)에 EDIT H 숫자가 있으면 다음에 다시 구울 때 같은 기준으로 맞춘다(SKILL 7절).

## 이어받을 때 주의

- 덱 PDF 를 다시 굽는 일은 Drive 원본이 필요하다(SKILL 7절). 원본에는 아직 '경력 4년' 이 있다 — 7절 6번.
- Higgsfield 바이럴 예측은 16초 이하 영상만 받고, 요금제상 동시에 두 건까지다. 점수는 영상마다 따로 정규화한 추정값이다.
- 주인 확인(O-)이 필요한 항목은 사실을 받기 전에 문장을 만들지 않는다.

<!--
진행 중일 때 쓰는 모양:

| 담당 | claude 또는 codex |
| 상태 | 검토 대기 |
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
