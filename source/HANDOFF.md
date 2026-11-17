# 인계 메모 (Claude ↔ 코덱스)

지금 하던 일을 다른 에이전트가 이어받을 수 있게 남긴다. 이어받는 순서는 루트 `AGENTS.md`, 남기는 규칙은 SKILL 12절이다.
작업 단위가 끝날 때마다 고쳐 작업 브랜치에 push 한다. 이 파일은 사이트에 올라가지 않는다(`source/`).

| 항목 | 값 |
|---|---|
| 담당 | claude |
| 상태 | 2026-11-18 이력서 문장 손질(B-21)을 내보냈다 — 주인 "아직 안넣었어 이력서도 같이 고쳐줘". 이력서 자기소개 두 문단(국 · 영) · 경력 한 줄 설명 둘 · 요약 넷 · 이력서 PDF 2026.11.18 판 · `JOB_PLATFORMS.md` 11-18 판과 붙여넣기 페이지 두 장(지문 84c46abc2667) · `qa_tone` T16 허용 0. PR #42 → `main` 64624be · 라이브 확인 · makefair 허브(PR #9 → 9ab6118) · 점검 기록까지 끝. 주인에게 알린 것: 사람인 · 잡코리아 자기소개서 항목 2 가 바뀌었다(아직 넣지 않았으니 지금 판으로 한 번에 넣으면 된다). 기다리는 것: 방문 계측(O-13)은 주인의 Apps Script 웹 앱 주소. 프로필 다섯 곳 넣기(O-20)는 주인 PC 의 데스크톱 앱에서 |
| 작업 브랜치 | `claude/stoic-bohr-gze1d1` |
| 열린 PR | 새 기록용 초안(#42 뒤 기록만 — 다음 작업을 여기에 싣는다 · 번호는 PR 목록에서 본다). #42 는 64624be 로, #41 은 ed28ae0 으로, #40 은 407df63 으로 합쳤다. #20 · #1 은 예전 자비스 검토용 초안이라 그대로 둔다. 작업 브랜치는 강제 push 를 쓸 수 없어 main 을 병합해 맞춘다 — 다음 PR 도 스쿼시로 합친다 |
| 마지막 갱신 | 2026-11-18 · Claude |

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

5. 판단 위임 손질(주인 11-12 "합쳐 · 기존에 규칙이 있어도 이상하다 싶으면 개선 · 모든 걸 판단에 맡긴다").
   - 끝: 연락 제목 목적어(`site.ts` contact.title) · 소개 페이지 '다음 역할' → '앞으로'와 끝 문장(`site.ts`) · EDIT H 역할 표기(`projects.ts` edith ·
     `site.ts` publicWork · `en/home.en.ts` · `en/resume.en.ts` · `render_og_cases.mjs` → `assets/og/general/og/edith.png` · `OG_VERSION` 20261112a) ·
     `validate_export` 소개 페이지 필수 문구 · 영문 낮은 창 규칙(`globals.css`). 빌드 [글자 바뀜] 7쪽 · 검수 0 · RELEASE_PASS cd63dc27.
   - 기준은 BACKLOG '정해 둔 것' 맨 위 '2026-11-12 주인 위임' — 바꾸지 않는 것(사실 추가 · 개인정보 · 주소 · 덱 공유 범위 · 로고)도 거기 있다.

6. 레퍼런스 세 가지 적용(주인 11-12 "적용해" — 골드넥스 분석의 R-08 · R-09 · R-10).
   - 끝: 휴대폰 머리줄 이력서 바로가기(`Header.tsx`) · 연도별 담당 브랜드(`BrandTimeline.tsx` · `BrandWall.tsx` · `globals.css` `.tl`) ·
     소개 쪽 휴대폰 접기(`PhoneFold.tsx` · `sections.tsx` BuiltByMe 카드 · `CreativeHistory.tsx` · `globals.css` `.pfold` `.auto-card` ·
     `layout.tsx` FOLD_GUARD — 첫 그림부터 접고, 부품이 끝내 안 붙으면 펼친다).
     가드: `qa_interactions` 26건 · `qa_layout` `qa_wrap` 펼친 상태 · 출시 계약 `fold` 와 소개 쪽(`release_contract.mjs` · `runtime_evidence.mjs` · 계약 시험 10건).
     빌드 [글자 바뀜] 21쪽 · 검수 0 · RELEASE_PASS 911fbbec · PR #30.
   - 접는 기준은 BACKLOG '정해 둔 것'의 '휴대폰에서 접는 것은 설명뿐이다'. 소개 쪽 390px 은 28.3화면이다(목표로 적었던 20화면은 버렸다 — 이유는 완료 기록).

7. 최종 검토(주인 11-12 "더 수정할 부분은 없는가 · 10점 만점에 10점인가 · 문구부터 디자인 · 구조설계 · 배치까지").
   - 끝: #주소로 새로 연 쪽이 구간을 지나쳐 멈추던 것(B-16 — `FragmentAnchor.tsx` · `globals.css` `html:not(.js)` · `layout.tsx`),
     물음표가 붙은 주소에서 머리줄 메뉴 첫 클릭이 움직이지 않던 것(`Header.tsx` `hrefOf`).
     가드: `qa_interactions` 33건 · 출시 계약 `fragment`(`release_contract.mjs` · `runtime_evidence.mjs` · 계약 시험 11건).
     빌드 [글자 바뀜] 0쪽 · 검수 0 · RELEASE_PASS f7a6258b.
   - 문구 · 배치에서는 고칠 것이 나오지 않았다. 남긴 것은 영문 홈 360×640(B-17)과 주인 확인 항목(O-18 5초 테스트 등).

8. 사이트 밖 프로필 원문(주인 11-13 "사람인 · 리멤버 · 잡코리아 · 원티드 · 링크드인도 전부 업데이트 · 완벽하게").
   - 끝: `JOB_PLATFORMS.md` · `LINKEDIN.md` v4(바뀐 칸은 두 문서의 '먼저 볼 것') · 문서 → 붙여넣기 페이지(`platform_docs.mjs` · `build_paste_pages.mjs` · `paste_page_template.html`) ·
     검사 `check_platform_copy.mjs`(`npm run qa:platforms` · `qa_release` · `health_check` 경고) · 두 페이지 다시 올림(지문은 아래 검토 반영으로 바뀌어 지금 f215aec7f527) · 영상 v3.1 세 판형.
   - Codex 지적(5adce1c · P2) 반영: `--pages` 가 페이지마다 복사 칸을 개수까지 맞춘다(표 줄 포함 · `platform_docs.mjs` `copyCells` · `pasteFields`). 페이지는 문서 순서대로 넘긴다.
   - Codex 재검토 지적(b2522bb · P2 3건) 반영: 템플릿 `.panel[hidden] { display: none; }`(빌더가 없으면 멈춘다) · `--pages` 는 2장이 아니면 실패 ·
     숫자 검사가 '30여 개'를 읽는다. 템플릿이 바뀌어 두 페이지를 다시 올렸다.
     지문은 `--pages <올린 두 페이지> --stamp` 로만 고쳐진다(확인에 실패가 없을 때).
   - Codex 세 번째 검토 지적(6b3222f · P2 4건) 반영: 올린 페이지는 지금 다시 만든 것과 글자 하나까지 견준다(`build_paste_pages.mjs` `comparePublished`) ·
     지문은 메모 없이 만든 두 페이지의 해시(`pageFingerprint`) · 숫자 검사가 부호를 본다 · 출시 검수에서는 지문 문제가 모두 경고 ·
     `<!-- 페이지 끝 -->` 줄이 없으면 멈춘다. 도구 회귀 시험 `test_platform_copy.mjs`(출시 검수 포함).
   - Codex 네 번째 검토 지적(89daf10 · P2 2건) 반영: 메모가 든 결과물의 자리를 실제 경로로 확인(링크 포함) · `--private` 는 두 묶음이 다 있어야 한다 ·
     `--carry` 순서 확인 · 모르는 깃발 거절 · 만든 페이지 바깥의 복사 칸 거절. 페이지 결과는 그대로라 다시 올리지 않았다.
   - Codex 다섯 번째 검토 지적(f05918e · P2 2건) 반영: 짧은 값 · 키워드 묶음에도 '넣음' 표시 · 표시의 이름은 칸의 글 전체에서(글이 바뀐 칸만 풀린다).
     회귀 시험 29건. 두 페이지 다시 올림 — 지금 지문 f215aec7f527. 주인 지시("검토 끝나면 합쳐줘")로 이 수정은 재검토 없이 합쳤다.
   - 주인만 보는 메모는 페이지 안에만 있다(저장소에는 내용도 주제도 적지 않는다). 다시 만들 때 `--carry` 로 옮긴다(SKILL 13절).
   - 남은 것: 실제 프로필에 넣기(O-20 · 주인). 넣었다고 알려 주면 두 문서 머리의 '상태' 표를 고친다.

9. 글꼴이 붙는 순간의 밀림(B-18 · 11-12 최종 검토에서 남긴 것).
   - 끝: `globals.css` 대체 글꼴 13개(`Pretendard Fallback KR · Num · Alpha · Space`) · `--font-sans` · `--font-display` · `--font-mono` 순서 ·
     `qa_interactions` 정적 시험(34건) · `scripts/measure_font_fallback.cjs`. 빌드 [글자 바뀜] 0쪽 · 검수 0 · RELEASE_PASS 3751e4b1.
   - 재려면 Android 글꼴이 있어야 한다(스크립트 머리 주석의 '준비'). 컨테이너 기본 글꼴로 잰 CLS 는 실제보다 크다.
   - 남은 것: 실제 기기(iOS · Windows · 삼성 Android)에서는 재지 못했다(B-19). 값은 Android 글꼴을 깐 리눅스 Chromium 에서 잰 것이다.

10. 홈 디자인 시안(주인 11-13 "포트폴리오는 디자인이 뭔가 아쉬운 것 같은데" — 아쉬운 곳 네 가지를 모두 골랐고 "시안부터 보기"를 골랐다).
   - 끝: 지금 홈 진단(1440 · 390px 끝까지 캡처) → 시안 A(밝은 매거진형) · B(어두운 대시보드형) → 이미지 세 장 전달(지금 · A · B 비교판, A 전체, B 전체 · 1440 폭).
     두 시안의 차이 · 공통 원칙 · Claude 의견(A) · 다시 만드는 법은 `proposals/O-21-home-design.md`, 스크립트는 `proposals/O-21-home-design/`(지금 홈의 문장 · 숫자만 쓴다).
     원본(`src/`)과 루트 빌드 결과는 손대지 않았다 — 이 커밋은 문서와 시안 스크립트뿐이다.
   - 2차(주인 "이게 최선의 방법이야? 더 없어? 확실해? 10점 만점에 10점이야?"): A · B 의 결함(문장을 줄임 · 휴대폰과 뒤 구간 없음 · 꾸밈이 앞섬 · 같은 그래프 두 번 · B 는 범위가 넓음)을 문서에 적고
     **보완안 C** 를 만들었다 — 지금 홈의 마크업을 그대로 두고 스타일과 배치만 입힌다(`variant_c.mjs` 의 CSS 와 `augment()`), 홈 전체 · 1440 과 390.
     `check_c.mjs`: 통째로 빠진 글 0 · 여섯 창 가로 넘침 0 · 대비 미달 0 · 44px 미만 0. 이미지 세 장 전달(지금 → C 비교판 · PC 전체 · 휴대폰 전체).
   - 3차(11-14 주인 "뭔가 마음에 안드는데?" — 평범하고 임팩트가 없다 · 박스가 너무 많다 · 색 · 분위기가 안 맞다. 원하는 느낌 '검정 · 큰 글자 · 움직임' · 글의 양은 판단에 맡김 · 첫 화면도 새로):
     **제안 D** 를 만들었다 — `variant_d.mjs` 의 `build()` 가 홈 전체를 새로 쓰고 `engine()` 이 움직임을 계산한다. 글은 `extract.mjs` 가 지금 홈에서 읽어 온 `content.json` 것만 쓴다(문장을 다시 치지 않는다).
     전달한 것: 영상 두 편(`capture_d.mjs` · PC 1440×900 26초 · 휴대폰 390×844 22초) · 파일 하나로 만든 화면(`standalone_d.mjs`) · 정지 화면 네 장(첫 화면 비교 `compare_d.mjs` · PC 전체 둘 · 휴대폰 전체).
     확인: `render_d.mjs --first`(첫 화면 창 11가지) · `check_d.mjs`(글 · 넘침 · 대비 · 누르는 곳) · `live_d.mjs`(움직임 켬 · 줄이기 · 스크립트 꺼짐) · `end_d.mjs`(쪽 끝 · 창 8가지) 모두 통과.
     주인에게 간 파일은 마지막 고침(뉴발란스 칸의 작은 막대를 뺌) 하나 전의 것이다. 다시 만들면 그 막대만 없다.
   - 기다리는 것: 주인이 D 로 적용할지 정하는 것(BACKLOG O-21). 정하기 전에는 적용을 시작하지 않는다. 파일은 대화로 보냈고, 다시 필요하면 위 문서의 명령으로 만든다(저장소에는 스크립트만 있다).
     D 로 정하면 범위도 물어야 한다 — 홈만 어둡게 할지, 소개 · 사례 쪽까지 한 번에 할지(문서의 '적용 범위' · Claude 의견은 한 번에, 이력서 쪽은 밝게).
   - 같이 적은 것: PR #32 를 합친 뒤의 라이브 점검 · 속도 비교(BACKLOG 완료 기록 · 점검 기록 2026-11-13).

11. 최종 검토(주인 11-17 "더이상 수정 및 개선할 부분은 없는지 최종검토해줘") — 자세한 것은 BACKLOG 완료 기록 2026-11-17.
   - 고친 것(커밋 a3b90ab): 결과 상자 큰 수치의 줄바꿈(`ui.tsx` MetricDelta · `CaseView.tsx`), 자동화 실행 구조 그림의 좁은 칸용 세로 판(`AutomationArchitecture.tsx` — 칸 폭 600px 기준 컨테이너 쿼리),
     표 밀기 안내를 표가 칸보다 넓을 때만(`CaseView.tsx` · `caseLabels.ts` · `qa_final.mjs`), 영문 뉴발란스 "0 duplicates", `export_knowledge.mjs`(프로필 작업 문서는 내보내지 않는다).
   - EDIT H 11.17 갱신(다음 커밋): 열린 PR #37(144편 · 11-15 · 다른 세션)이 합쳐지지 않고 충돌 상태인 것을 찾아, 아카이브를 다시 세어 오늘 수치로 넣었다 —
     `projects.ts` edith(146편 · 최장 연속 48일 · 11.11 발행 없음 · 실패 한 단) · `site.ts`(이력서 한 줄 · 공개 작업물 카드 · v=20261117a) · `en/resume.en.ts` · `edition.ts` OG_VERSION 20261117a ·
     `render_og_cases.mjs` → `assets/og/general/og/edith.png` · `validate_export.mjs` · 이력서 PDF(2026.11.17 인쇄 · 5쪽 · 태그) · `proposals/O-10`.
   - 빌드 · 검수 끝: 보이는 글자 14쪽 · typecheck · tone · en · final · layout · wrap · platforms 0 · RELEASE_PASS 4ac66a97.
   - 끝: PR #38 → `main` ecdd381(스쿼시) · `npm run health:full` 결함 0 · 모바일 홈 98 · 모바일 사례 97 · 데스크톱 100 · makefair 허브 다시 내보냄(makefair PR #4 → feb7bca) ·
     PR #37 닫음 · BACKLOG 완료 기록 · 점검 기록 2026-11-17.
   - 이번에 배운 것: 출시 승인 직전에 사용량 한도로 한 번 멈췄는데(11-17) 그때 원본 변경이 커밋되지 않은 채 작업 트리에만 있었다.
     **빌드 · 검수를 돌리기 전에 원본 변경부터 커밋해 push 한다** — 루트 빌드는 다시 만들 수 있지만 원본은 그렇지 않다.

12. 덱 숫자와 릴스(주인 11-17 "덱 pdf도 edih 숫자 맞춰줘 · edih는 릴스영상 만들어놓은것도 반영해줘 · 메인에다가도 릴스영상 몇개깔아두면") — 자세한 것은 BACKLOG 완료 기록 2026-11-17 두 줄.
   - 덱: `scripts/patch_deck_edith.py` 로 2026.11 판 PDF 의 23쪽(146편 · VOL.146 · 역할 줄)과 29쪽 제목을 고쳐 Drive '포트폴리오 PDF (헤드헌터 공유용)' 폴더에
     `김선일_퍼포먼스마케팅_포트폴리오_2026.11.17.pdf` 로 올렸다(권한 주인만). 다음에 숫자를 올릴 때는 SKILL 7절 7번.
   - 릴스: 사례 블록 `EdithReels.tsx`(누르면 소리와 함께 · 좁은 칸은 옆으로 넘기는 줄) · 홈 띠 `ReelLoops.tsx` + `HomeFolio.tsx` #edith(소리 없이 · 화면에 들어온 칸만 · 멈춤 버튼) ·
     `src/data/reels.ts`(세 편) · `public/evidence/edith-reel-*` · `scripts/make_reel_assets.sh <reel_ai.mp4> <id>`.
     원본 영상은 공개 아카이브 `instagram/{날짜}/reel_ai.mp4`, 문구의 근거는 `automation/RUNBOOK_REEL.md` 다.
   - 지킬 것(BACKLOG '정해 둔 것' 홈의 EDIT H 릴스 띠): 홈을 열 때 릴스 파일 0건 · 발행 주기는 적지 않는다 · 싣는 편은 최근 호 세 편.
   - 끝: PR #39 → `main` b1c5b28(스쿼시) · `npm run health` 결함 0 · 라이브에서 재생 확인(홈을 열 때 릴스 요청 0건) · makefair 허브 다시 내보냄(makefair PR #6 → 65debb5).

13. 접근성(같은 날 · #39 를 합친 뒤 `health:full` 이 홈 100 → 97 을 잡았다) — 자세한 것은 BACKLOG 완료 기록 2026-11-17 끝 두 줄.
   - 원인은 이번에 넣은 것 둘: 홈 릴스 칸의 연회색 가운뎃점(대비 1.87:1 — `ReelLoops.tsx`), EDIT H 릴스 블록 제목 h4(구간 제목 h2 바로 아래 — `EdithReels.tsx` h3 으로).
   - **배포 전 검수를 만들었다: `scripts/qa_a11y.mjs` · `npm run qa:a11y`**(SKILL 3절). 모든 페이지에 처음 돌려 전부터 있던 것도 고쳤다 — 국 · 영 이력서 주소 링크 밑줄(`app/resume/page.tsx` · `app/en/resume/page.tsx`),
     막대 차트의 `role="img"` 를 막대 묶음으로(`Bars.tsx` — 설명 줄은 읽기에서 뺐다 · 읽히는 내용은 전과 같다), 사례 표지 링크 이름에 브랜드 이름(`CaseView.tsx`).
   - 빌드 · 검수 끝: `qa:a11y` 22화면 100 · 걸린 항목 0 · typecheck · tone · en · final · platforms · layout · wrap 0 · RELEASE_PASS f939d782 · 커밋 e8dec21.
   - 끝: PR #40 → `main` 407df63(스쿼시) · `health:full` 결함 0 · 접근성 세 화면 100 · 모바일 홈 98 (96·98·98) · BACKLOG 완료 기록 · 점검 기록.
   - 속도: 모바일 홈이 96 (91·96·96)으로 나와 이전 빌드와 번갈아 쟀더니 차이 없음(둘 다 중앙값 84 · 홈을 열 때 요청 24건). 릴스 구간은 속도를 깎지 않았다.
   - 이번에 배운 것: ① 화면에 보이는 것을 바꿨으면 배포 전에 `qa:a11y` — 접근성은 정적 검수 · 배치 검수 · 출시 승인 어디에도 없었다. ② 파이썬으로 파일을 고칠 때는 `open(..., newline="")` 로 읽는다 —
     기본값으로 읽으면 CRLF 가 LF 로 바뀌어 파일 전체가 바뀐 것으로 나온다(`app/resume/page.tsx` · `Bars.tsx` 는 CRLF — 고친 뒤 `git diff --stat` 의 줄 수를 본다).
     ③ `publish:general` 이 '루트에 커밋되지 않은 파일'로 멈추면 SKILL 3절 순서대로 한다. 이 세션에서 한 번 `git restore` · `git clean` 으로 루트를 통째로 되돌렸는데(잃은 것은 없었다 — 빌드 결과뿐이었다) 그 절이 금지한 방법이다.
     가장 쉬운 길은 앞 빌드를 먼저 커밋하는 것이다 — 그러면 루트가 깨끗해져 되돌릴 일이 없다.

14. 문장 손질(주인 11-17 홈 경력 칸 화면과 함께 "글들이 다 ai스럽고 자연스럽지가않아. ~했습니다~했습니다. 너무 교과서적이지않아?") — 자세한 것은 BACKLOG 완료 기록 2026-11-17 끝 줄.
   - 홈 경력 칸: `site.ts` `generalCover.career[]` 의 `text`(맡은 역할 한 문장) + `points`(굵은 머리말 + 명사로 끝나는 항목) · 영문 `en/home.en.ts` · `HomeFolio.tsx` · `globals.css`(`.folio-career ol > li` · `.folio-career-points`).
   - 사례 문단 여섯: `projects.ts` 제이에스티나(challenge · dataAnalysis) · 뉴발란스(challenge · learnings · 증빙 caption) · 다이슨(legend). 문장을 이었을 뿐 사실은 같다. 영문은 그대로.
   - 규칙: `qa_tone` T16 — 짧은(70자 이하) 과거형 문장 4연속. 허용 3 은 이력서 쪽 셋이다(B-21). 늘리지 않는다.
   - 기준은 BACKLOG '정해 둔 것'의 '한 일의 나열은 문장으로 쌓지 않는다' · SKILL 2절.
   - 끝: 빌드 [글자 바뀜] 5쪽(홈 국 · 영 · 제이에스티나 · 뉴발란스 · 다이슨) · 검수 0 · `qa:a11y` 고친 쪽 7화면 100 · RELEASE_PASS 16149e1d · PR #41 → `main` ed28ae0 · 라이브에서 경력 칸(국 · 영 · 1440 · 390px)과 고친 문장 확인 · makefair 허브 PR #8 → bea01b1.
   - B-21 끝(2026-11-18 · 주인 "이력서도 같이 고쳐줘"): 이력서 자기소개는 두 문단(`site.ts` `careerNarrative` · 영문 `narrativeEn`) — 회사별 두 문단은 사이트에서 빼고 `JOB_PLATFORMS.md` 자기소개서 항목 2 에만 이은 글로 둔다. `career[].summary`(HLL중앙 · 플레이디) · `projects.ts` `tldr`(제이에스티나 · 뉴발란스 · 대교 · 강원) · 이력서 PDF 11.18 판 · T16 허용 0. 이력서 PDF 는 5쪽이 꽉 차 있다 — 요약을 고치면 시험 인쇄로 쪽수 · 줄 수를 본다(SKILL 2절). 기준은 BACKLOG '정해 둔 것'의 '이력서 자기소개는 두 문단이다'.

## 다음 할 일

1. O-21 남은 것 — 맺음말 한 줄은 주인의 문장을 받으면 `HomeFolio.tsx` 연락 구간에 넣는다. 다이슨 가운데 낱장은 더 선명한 원본을 받으면 `scripts/cut_cover_tiles.py` 의 PICK 을 고쳐 다시 자른다(표지는 홈 카드와 사례 상세가 같이 쓴다 — `CaseCover.tsx`).
2. 주인이 다섯 곳에 원문을 넣었다고 알려 주면(O-20) `JOB_PLATFORMS.md` · `LINKEDIN.md` 머리의 '상태' 표를 고친다. 상태 표는 페이지에 실리지 않아 지문이 바뀌지 않는다.
3. 사이트의 사실 · 숫자를 바꾸면 두 문서도 같이 고치고 붙여넣기 페이지를 다시 올린다(SKILL 13절). 첫 화면을 바꾸면 링크드인 영상도 다시 굽는다.
4. O-15 — 주인이 공개 저장소 · 토큰 · 변수를 만들면 "Publish public site" 수동 실행 → 공개 저장소 파일 확인 → 주인 Pages · 비공개 전환 → `npm run health`.
5. O-13 계측 — 주인이 웹 앱 주소를 주면 `src/lib/insight.ts` 의 GENERAL_INSIGHT_URL 에 넣고 빌드 → 시험 방문을 보내 시트에 줄이 생기는지 확인 → 배포(BACKLOG O-13 · `insight/README.md`). 프로필 다섯 곳의 링크에는 이미 수신처 코드(`?r=`)가 붙어 있다.
6. O-14 검토 방식 · O-16 다른 공개 저장소 · O-12 다이슨 신규 칸 · O-18 5초 테스트 — 주인이 정한다.
   B-17(영문 홈 360×640 첫 버튼 48px 아래)은 영문 문구 손질과 같이 본다. B-19(실제 기기의 대체 글꼴 — iOS · Windows · 삼성 Android)는 그 기기가 있어야 잰다.
7. B-09 코드 정리(주인이 골랐다 · 비공개 전환 뒤 P3) · B-20 주간 점검이 열린 PR 을 보고하게(지시문은 주인 루틴이라 제안만) · R-11 테스트 기록 모음(P3) · B-15 EDIT H 뒤처짐 알림(기준 7편). 주간 점검은 접근성을 홈과 뉴발란스 사례만 잰다 — 나머지 쪽은 화면을 바꿀 때 `qa:a11y` 가 본다.
8. EDIT H 숫자를 다음에 올릴 때는 사이트(B-15 순서) · 이력서 PDF · 덱 PDF(`patch_deck_edith.py` — SKILL 7절 7번) · 홈과 사례의 릴스 세 편(`make_reel_assets.sh` → `reels.ts`)을 같이 맞춘다. 지금은 모두 2026.11.17 VOL.146 · 146편 · 최장 연속 48일(09.24 – 11.10)이고 릴스는 11.13 · 11.16 · 11.17호다.

## 이어받을 때 주의

- 덱 PDF 를 다시 굽는 일은 Drive 원본이 필요하다(SKILL 7절). 원본에는 아직 '경력 4년' 이 있다 — 7절 6번.
- 덱 PDF 를 **원본으로** 다시 구울 때 함께 맞출 것(2026-11-12): 29쪽 제목 "…브랜드를 함께 키웁니다", EDIT H 쪽의 역할 표기(기획 · 편집 기준 · 구축 · 운영은 본인, 매일 제작은 AI 루틴). 2026.11.17 판 PDF 에는 `patch_deck_edith.py` 로 이미 들어가 있다 — v3 원본에는 아직 없다.
- Higgsfield 바이럴 예측은 16초 이하 영상만 받고, 요금제상 동시에 두 건까지다. 점수는 영상마다 따로 정규화한 추정값이다.
- 주인 확인(O-)이 필요한 항목은 사실을 받기 전에 문장을 만들지 않는다.
- 작업 브랜치에는 PR #32 의 스쿼시 전 커밋 9개가 남아 있고, 그 위에 main(7a9b069)을 병합했다(이 세션에서는 강제 push 를 쓸 수 없었다 — 병합한 내용은 main 과 같다).
  그래서 **다음 PR 도 스쿼시로 합친다**(예전 커밋이 main 에 따로 들어가지 않게). 주인이 GitHub 에서 브랜치를 지우면 main 에서 같은 이름으로 다시 만들고 그 뒤 커밋만 옮긴다.

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
