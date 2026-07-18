# 김선일 포트폴리오 — PROOF OF STRUCTURE (2026-07-18 전면 리빌드)

디지털 퍼포먼스 마케터 김선일의 포트폴리오 사이트. 모든 케이스를
**문제 정의 → 분석 근거 → 실행 → 결과 → 나의 역할** 5단 구조로 기록한 데이터 에디토리얼.

## 구성

- `index.html` — 전체 콘텐츠, SEO 메타, JSON-LD
- `css/style.css` — 디자인 토큰(ink/bone/orange + 케이스별 액센트), 반응형, print
- `js/main.js` — 진행 게이지, 헤더 테마 동기화, 리빌, 카운트업, 라이트박스, 이메일 복사
- `assets/evidence/` — 비식별 증빙 이미지
- `assets/fonts/` — Pretendard 서브셋(400/600/700), 원본은 `original/`
- `assets/kim-seonill-resume.pdf` — 이력서 (헤더·히어로·연락 섹션에서 다운로드)
- `docs/DESIGN_BRIEF.md` — 설계 근거 문서 (배포 제외)
- `qa/` — QA 스크린샷 (배포 제외)

## 로컬 확인

```powershell
py -m http.server 8932
# http://localhost:8932/?static=1  → 애니메이션 제거된 최종 배치
# http://localhost:8932/?static=1&from=experience  → 해당 섹션부터 렌더(QA용)
```

헤드리스 크롬 캡처 시 주의: 크롬 최소 창 너비가 500px라 `--window-size=390`은
레이아웃이 500px로 잡힘. 모바일 확인은 실브라우저 뷰포트로 할 것.

## 수치 업데이트 체크리스트 (하드코딩 위치)

수치 하나를 바꾸면 아래를 전부 확인한다. 특히 **차트 SVG는 rect 폭이 수치에 비례**하므로 함께 수정.

1. `<head>` — meta description, og:description
2. 히어로 스탯 4타일 — `data-count` 속성 + 주변 텍스트(210% 등)
3. 케이스 인덱스(#cases) — 3개 행의 `caseindex__nums`
4. 케이스 01 — 메타 표, 본문(210→583, 808%, 58.3억, CPC −21%, CTR +7.3%), 차트 SVG(text+rect width), 판정 박스
5. 케이스 02 — 본문(17.6%/98.5%, 120분→5분, 60분→5분, 662건), 차트 SVG, 판정 박스
6. 케이스 03 — 본문(9.46%, 950원, 1.4억, 2,000→100,600, 12.27%), 차트 SVG, 판정 박스
7. 시스템 6타일 — dl 수치(900개, 38종, 82그룹, 84건, 854개 등)
8. 추가 성과 6카드 + 각주
9. 경력·수상 연도/수치

## 폰트 서브셋 재생성 (문구 대량 수정 후 필수)

```powershell
py scripts/subset_fonts.py   # 필요: py -m pip install fonttools brotli
```

## 배포 (portfolio-github-sync → GitHub Pages)

배포 대상 파일만 복사한다 — `docs/`, `qa/`, `.claude/`, `scripts/`(스크립트는 기존 리포에 이미 있음)는 제외.

```powershell
# index.html, css/, js/, assets/, robots.txt, sitemap.xml, .nojekyll
# 복사 후 portfolio-github-sync에서: git add . ; git commit ; git push origin main
```

배포 주소: <https://vetnam555-del.github.io/kim-seonil-portfolio/>
커밋/푸시는 반드시 사용자 확인 후 진행.

## QA 체크리스트

- 1440px / 390px 가로 넘침 없음 (`document.documentElement.scrollWidth === clientWidth`)
- 콘솔 에러 0, 이미지·이력서 PDF·외부 링크(LG CNS) 동작
- 증빙 라이트박스 열림/닫힘(ESC 포함), 이메일 복사 동작
- 케이스 수치 ↔ 증빙 이미지 표기 일치 (기여도·기간)
- 폰트 서브셋 재생성 후 ①~⑤·→·× 등 특수문자 렌더 확인
- prefers-reduced-motion, print(Ctrl+P) 확인
