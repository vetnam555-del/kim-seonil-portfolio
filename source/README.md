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
| `npm run fonts` | 폰트 서브셋만 재생성 |

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

## 이력서

- `public/kim-seonil-resume-public.pdf`: 전화번호·주소·생년월일을 제외한 3페이지 공개용 PDF
- `/resume/`: 같은 데이터에서 파생되는 웹 이력서와 인쇄용 원본
- `site.resumeMailto`: 전화번호가 포함된 제출용 원본 요청

공개 PDF를 갱신할 때는 `/resume/`을 A4로 다시 인쇄하고, 3페이지·개인정보 제외·한글 렌더링을
확인한 뒤 같은 파일명으로 교체한다.

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

Reveal 컴포넌트는 정적 HTML에 `data-reveal` 속성을 심고 스크롤 진입 때 내용을 드러낸다.
그대로 두면 **인쇄하면 아직 안 본 섹션이 백지로 찍히고**, JS가 없으면 화면이 비어 보인다.
그래서 두 겹을 둔다.

- `globals.css` 의 `@media print` — `opacity:0` 을 강제 해제(인쇄 텍스트 313 → 6,309 오퍼레이터로 검증).
- `layout.tsx` 의 `<noscript><style>` — JS 없는 환경에서 같은 처리.

둘 중 하나라도 지우면 인쇄본이 백지가 된다.
