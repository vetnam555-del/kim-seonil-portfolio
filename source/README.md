# 김선일 포트폴리오 (v2)

Next.js 16 · React 19 · TypeScript · Tailwind v4로 만든 정적 사이트.
디자인은 **Toss의 원칙**(넓은 여백 · 섹션당 메시지 하나 · 흰 배경 + 액센트 하나)을 기본 시스템으로 두고,
Nasmedia의 역량 분류 구조, PlayD의 카드 간결성, BAT의 Selected Works 골격을 얹었다.

## 실행

```bash
npm install
npm run dev          # http://localhost:3000
```

| 명령 | 하는 일 |
|---|---|
| `npm run dev` | 개발 서버 |
| `npm run build` | 정적 빌드 → `out/` |
| `npm run publish:general` | **일반판 배포** — 빌드 · 검증 후 저장소 루트(GitHub Pages)에 반영 (저장소 루트 `CLAUDE.md`) |
| `npm run build:full` | 빌드 + 폰트 서브셋 (기본 판 hll · 윈도우 `py` 전용 — 일반판 배포에는 쓰지 않는다) |
| `npm run typecheck` | 타입 검사 |
| `npm run health` | 라이브 점검 — main 과 같은지 · PDF · 외부 링크 (`health:full` 은 Lighthouse 포함) |
| `npm run fonts` | 폰트 서브셋만 재생성 |

## 계속 발전시키기

- `BACKLOG.md` — 점수표·채점 기준, 할 일(B-·R-), 주인 확인, 정해 둔 결정, 점검 기록.
- `REFERENCES.md` — 다른 마케팅 포트폴리오에서 가져온 것과 안 가져온 것, 비교 기준, 주차별 탐색 범위.
- `npm run health` / `npm run health:full` — 라이브 점검. 매주 월요일 정기 점검이 이 둘과 레퍼런스 비교를 돌려 보고한다(커밋은 하지 않는다).

## 어디를 고치면 되는가

| 고칠 내용 | 파일 |
|---|---|
| **프로젝트 추가·수정** (8개) | `src/data/projects.ts` → `projects` |
| 추가 성과 카드 (6개) | `src/data/projects.ts` → `otherResults` |
| 이름·이메일·링크·이력서 처리 | `src/data/site.ts` |
| 히어로 카피, Key Numbers | `src/data/site.ts` |
| About, Expertise 4영역 | `src/data/site.ts` |
| 자동화 사례 | `src/data/site.ts` |
| 경력·수상·자격증 | `src/data/site.ts` |
| 창업·디자인 이력 아카이브 | `src/data/site.ts` → `awardsArchive` |
| 색·타이포·여백 토큰 | `src/app/globals.css` (`@theme`) |
| 섹션 순서 | `src/app/page.tsx` |
| 등급별 상세 페이지 구조 | `src/app/projects/[slug]/page.tsx` |

### 프로젝트 하나 추가하기

`src/data/projects.ts`의 `projects` 배열에 객체를 하나 더 넣으면 끝이다.
카드·필터·상세 페이지·사이트맵이 모두 자동으로 생성된다(`generateStaticParams`).

```ts
{
  slug: "brand-x",              // URL이 된다 → /projects/brand-x/
  brand: "브랜드 X",
  tier: "featured",             // featured · supporting · archive
  evidenceLabel: "비식별 리포트",
  headline: "카드에 크게 걸릴 한 줄",
  tldr: "문제와 변화, 결과를 세 문장 안에 요약",
  industry: "업종",
  period: "2026.01 – 2026.03",
  categories: ["Performance"],  // 필터에 쓰인다
  objective: "해결하려던 문제",
  channels: ["네이버 SA"],
  role: "역할 한 줄",
  contribution: 100,
  keyMetric: { label: "ROAS", before: "200%", after: "400%", note: "기준" },
  accent: ["#1B64DA", "#0F4AA8"],   // 썸네일 색면
  detail: { /* featured 8단 · supporting 5단 · archive 3단으로 자동 렌더링 */ },
}
```

## 수치 원칙

- **검증된 값만 쓴다.** 각 프로젝트 `detail.source`에 출처를 남긴다.
- 기준 기간이 다른 수치를 나란히 두지 않는다. 다르면 `note`에 적는다.
- 확인되지 않은 값은 만들지 않고 `NEEDS_DATA`(`"데이터 확인 필요"`)를 쓴다.
- 기여도는 증빙 슬라이드 인쇄값을 기준으로 한다. 사이트·이력서·슬라이드가 어긋나면 안 된다.
- 기여도는 사례마다 적은 업무 범위 기준이다(푸터·이력서 범례). 100% 를 "계정 전체 단독"으로 일반화하지 않는다.

## 문구 규칙

- 띄어 쓴 구분자 `" · "` 는 점 앞을 줄바꿈 없는 공백으로 쓴다(`"\u00a0· "`, JSX 는 `&nbsp;· `). 좁은 화면에서
  가운뎃점이 줄 맨 앞에 오지 않게 하려는 것이다. 문구를 고친 뒤 `node scripts/nbsp_separators.mjs .` 를 돌리면
  문자열·JSX 텍스트만 바꾸고 주석은 두지 않는다(`--dry` 로 먼저 본다). 검사기(`validate_export`·`qa_final`)는 공백 종류를 가리지 않는다.

## 이력서

- `public/kim-seonil-resume-public.pdf`: 전화번호·주소·생년월일을 제외한 3페이지 공개용 PDF
- `/resume/`: 같은 데이터에서 파생되는 웹 이력서와 인쇄용 원본
- `site.resumeMailto`: 전화번호가 포함된 제출용 원본 요청

배포 중인 공개 PDF(5쪽)는 웹 이력서 인쇄본이 아니라 ReportLab 문서다. 사이트 데이터(`src/data`)를 그대로 읽어 만든다
(2026.10.09, Drive `portfolio-resume-20260924` 스크립트를 옮김 · 2026.10.10 재인쇄).

```bash
node scripts/export_resume_data.mjs /tmp/resume-data.json
python3 scripts/print_resume_reportlab.py /tmp/resume-data.json public/kim-seonil-resume-public.pdf 2026.10.09
```

만든 뒤 5쪽·개인정보 제외·한글 렌더링을 쪽마다 눈으로 확인하고, `site.ts` 의 `resumePdfPath` `?v=` 판 번호를 올린다.
`build_edition.mjs --reprint-resume` 은 웹 이력서를 A4 로 인쇄한 다른 문서라 쓰지 않는다.

## 포트폴리오 PDF (29쪽)

**2026-10-31 부터 사이트 · 이 공개 저장소에 싣지 않는다** — 주인 결정 "헤드헌터한테만 보여주고 싶다".
PDF 는 Google Drive '포트폴리오 PDF (헤드헌터 공유용)' 폴더(https://drive.google.com/drive/folders/11hb1Ma0YOZYrsp2nr7fzhR3iAZ1vALQD)에 두고 지정한 사람에게만 공유한다(주인 계정 · 받는 사람은 구글 계정으로 로그인).
사이트의 버튼은 요청 메일(`edition.ts` `portfolioPdfRequest`)이다. `.gitignore` 가 덱 PDF 를 막고, `validate_export` · `runtime_evidence` ·
`health_check` 가 실리거나 열리면 실패로 센다. 지난 커밋 기록에는 예전 판이 남아 있다(주인 결정 — 기록은 두기).

덱 PDF 는 pptxgenjs 덱(portfolio-deck v3)을 PDF 로 구운 것이다.
덱 원본(`v3/*.js` · `img/` · `post_pptx.py` · `finalize_v3.py` · `qa/qa_boxes.py`)은 Drive `portfolio-deck-v2` 폴더에 있다.
문구는 이 저장소의 `src/data` 와 같은 사실만 쓰고, 사이트 문구를 고치면 덱 문구도 같이 맞춘다.

PowerPoint 가 없는 클라우드에서는 LibreOffice 로 굽는다(2026.10.10 판부터).

```bash
apt-get install -y --no-install-recommends libreoffice-impress   # 기본 이미지에는 Impress 가 없어 pptx 를 못 연다
# Pretendard 원본(public/fonts/original/*.woff2)을 TTF 로 풀어 ~/.fonts 에 넣고 fc-cache -f
node v3/gen3.js                                   # deck3.pptx · toc3.json · boxes3.json
python3 post_pptx.py deck3.pptx deck3.pptx        # 글자 언어 ko-KR
python3 <저장소>/source/scripts/deck_lo_pdf.py deck3.pptx deck3_lo.pdf
python3 qa/measure_lines.py deck3_lo.pdf boxes3.json measured.json   # 종료 코드 3 이면 위 세 줄을 한 번 더
python3 qa/qa_boxes.py deck3_lo.pdf boxes3.json qa3/png
python3 qa/qa_breaks.py deck3_lo.pdf boxes3.json  # 단어 중간 줄바꿈 · 짧은 끝줄
python3 finalize_v3.py deck3_lo.pdf final3.pdf     # 책갈피 · 목차 쪽 이동 · 태그 보강 · 메타데이터
```

덱 폴더의 `build3_cloud.sh` 가 이 순서를 한 번에 한다.

- 글 높이는 생성기가 글자 수로 추정하는데 실제보다 7–8% 넓게 잡는다. '배운 것' 상자 · 판단 과정 구역 · 역할 구분 칸은
  `measure_lines.py` 가 PDF 에서 잰 줄 수(`measured.json`)로 높이를 정한다. 문구가 바뀌면 그 칸만 추정으로 돌아가므로
  두 번 굽는다(2026.10.25).
- 줄바꿈 위치는 문구 안 "\n" 으로만 지정한다(글머리표 안에서는 같은 글머리표의 줄바꿈). 문구 자체는 바꾸지 않는다.

- LibreOffice 는 한글과 숫자·영문·가운뎃점 사이에 간격을 자동으로 넣는다(text-autospace). `deck_lo_pdf.py` 가 ODP 를 거쳐 이 간격을 끄고, 이미지는 PowerPoint 내보내기처럼 220ppi · 품질 80 으로 줄인다.
- 접근성 태그: `deck_lo_pdf.py` 가 태그 PDF(UseTaggedPDF)로 내보내고 한국어 로캘로 실행해 문서 언어를 ko-KR 로 만든다.
  LibreOffice 는 슬라이드 구분 없이 요소를 평평하게 놓고 링크를 구조 트리에 넣지 않으므로, `finalize_v3.py` 가
  `deck_pdf_tags.py`(덱 폴더에서는 `pdf_tags.py`)로 Document > Sect(쪽마다, 책갈피 제목) · 링크마다 Link 태그 ·
  장식 도형 빈 Alt 를 보강한다. 태그·MarkInfo·ko 언어가 없거나 그림 Alt 에 파일 경로가 남으면 멈춘다.
  그림 Alt 는 덱 생성기 `v3/lib.js` 의 `ALT` 표에 적는다(빠지면 생성 단계에서 멈춘다).
- ODP 의 서양 문자 언어를 ko 로 바꾸지 않는다 — 영문 단어(GPS·Contest)가 중간에서 끊긴다.
- `qa_boxes.py` 의 '3pt 넘침'은 LibreOffice 와 PowerPoint 의 줄 높이 차이일 때가 있다. 2026.10.25 판은 0건이다. 화면에서 다른 요소와 겹치지 않는지 쪽마다 눈으로 확인한다.
- 바꾼 뒤 이전 PDF 와 쪽별 글자를 비교해 의도한 곳만 바뀌었는지 보고, 위 Drive 폴더의 파일을 바꾼다(공유 권한은 그대로 남는다 — '새 버전 업로드').
  저장소에 커밋하지 않는다. 사례 쪽 번호표(`deck-pages.json`)는 사이트가 쓰지 않지만 덱과 맞춰 둔다.

## 폰트

Pretendard를 자체 호스팅하고, **빌드 산출물(`out/**/*.html`)에 실제 등장하는 문자만** 서브셋한다.
2.3MB → 160KB.

문구를 수정하면 `npm run build:full`을 쓴다. 서브셋 후 자동 검증이 돌고, 누락이 있으면 어떤 글자가
문제인지 출력하며 0이 아닌 코드로 종료한다. 원본은 `public/fonts/original/`에 있다.

> Pretendard에 없는 글리프는 재생성으로도 해결되지 않는다. 확인된 부재 문자:
> `✕`(U+2715) `✖`(U+2716) `✘`(U+2718) `❌`(U+274C) `╳`(U+2573). 곱셈·닫기 기호는 `×`(U+00D7)를 쓴다.

## 접근성 · 성능 점검 기준

- **대비**: 브라우저에서 실측해 일반 텍스트 302개 전부 AA 통과. 그라데이션 위 텍스트는 양 끝 정지점으로 검사.
  Tailwind v4는 색을 `oklab()`으로 출력하므로, 대비를 잴 때 `oklab → sRGB` 변환을 반드시 거쳐야 한다.
  이 변환을 빼면 반투명 배경이 검정으로 읽혀 거짓 실패가 대량 발생한다.
- **토큰 주의**: `#3182F6`(3.71:1)과 `#0BA37F`(3.2:1)는 흰 배경에서 AA 미달이라 각각
  `#1B64DA`, `#067A5E`로 낮춰 잡았다. 밝게 되돌리면 대비가 깨진다.
- 가로 넘침 0 (1440 / 900 / 375px), 터치 타깃 44px 이상, `prefers-reduced-motion` 지원.
- 정적 export이므로 Vercel·GitHub Pages 어디든 `out/`을 그대로 올리면 된다.

## 배포

```bash
npm run publish:general   # 일반판 빌드 → 검증 → 저장소 루트에 반영 (2026.10 클라우드 이전 후)
```

루트 빌드 결과와 `source/` 변경을 같은 커밋으로 `main` 에 합치면 GitHub Actions(`.github/workflows/pages.yml`)가
빌드 결과만 사이트에 올린다(2026-10-10 부터, 저장소 Settings → Pages → Source: GitHub Actions).

판(edition)마다 basePath 가 다르므로 배포는 `scripts/build_edition.mjs <판>` 을 거친다.
일반판은 소스가 배포 저장소의 `source/` 에 있으므로 위 명령이 `out/` 을 루트로 옮겨 준다 — 절차는 저장소 루트 `CLAUDE.md`. `.nojekyll`·`sitemap.xml`·`robots.txt`·`og-image.png` 는 빌드에 포함된다.

### basePath — 건드리기 전에 읽을 것

GitHub Pages 프로젝트 페이지는 `https://<user>.github.io/<repo>/` **하위 경로**로 서비스된다.
`next.config.ts` 의 `basePath`/`assetPrefix` 가 `/kim-seonil-portfolio_HLL` 로 잡혀 있고, 이게 없으면
`/_next/...` 가 도메인 루트를 가리켜 **CSS·JS가 전부 404** 가 된다(화면이 스타일 없이 뜬다).

커스텀 도메인(루트 배포)으로 옮길 때만 비운다.

```powershell
$env:BASE_PATH=""; npm run build:full
```

동시에 `src/data/site.ts` 의 `url` 도 새 주소로 바꾼다. `sitemap.xml`·`robots.txt`·OG 이미지 URL이
모두 이 값을 기준으로 만들어진다.

### 폰트 경로 규칙 (중요)

`@font-face` 는 `globals.css` 가 아니라 **`layout.tsx` 의 인라인 `<style>`** 에 있다.
CSS 파일 안의 `url()` 은 webpack 이 빌드 시점 모듈로 해석해서 `assetPrefix` 가 반영되지 않기 때문이다.

- `globals.css` 에 `url("/fonts/...")` 를 되살리면 하위 경로 배포에서 404 → 시스템 폰트로 **조용히** 폴백된다.
- 상대경로(`url("../../../fonts/...")`)도 안 된다. webpack 이 모듈로 찾다가 빌드가 깨진다.
- 서브셋 대상은 그대로 `public/fonts/*.woff2` 다.

### 인쇄 · JS 없는 환경 폴백

Reveal 컴포넌트(`src/components/motion.tsx`)는 정적 HTML에 `data-enter` 속성을 심고, `MotionRuntime` 의 옵저버 하나가 스크롤 진입 때 내용을 드러낸다.
그대로 두면 **인쇄하면 아직 안 본 섹션이 백지로 찍히고**, JS가 없으면 화면이 비어 보인다.
그래서 두 겹을 둔다.

- `globals.css` 의 `@media print` — `opacity:0` 을 강제 해제(인쇄 텍스트 313 → 6,309 오퍼레이터로 검증).
- `layout.tsx` 의 `<noscript><style>` — JS 없는 환경에서 같은 처리.

둘 중 하나라도 지우면 인쇄본이 백지가 된다.
