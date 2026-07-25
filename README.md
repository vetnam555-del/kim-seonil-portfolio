# kim-seonil-portfolio — 배포 산출물 저장소

김선일 포트폴리오의 **정적 빌드 결과만** 담는 저장소다. GitHub Pages가 `main` 브랜치 루트를 그대로 서비스한다.

배포 주소: <https://vetnam555-del.github.io/kim-seonil-portfolio/>

## 여기서 소스를 고치지 않는다

이 저장소의 `index.html`, `_next/`, `projects/` 는 전부 빌드 산출물이다. 직접 수정하면 다음 배포에서 사라진다.

**소스: `C:\Users\JNote\Desktop\클로드코드\포트폴리오_v2_next`** (Next.js 15 · TypeScript · Tailwind v4 · Framer Motion)

| 고칠 내용 | 소스 파일 |
|---|---|
| 프로젝트 8건 추가·수정 | `src/data/projects.ts` |
| 히어로·About·역량·경력·수상 | `src/data/site.ts` |
| 색·타이포·여백 토큰 | `src/app/globals.css` |
| 섹션 순서 | `src/app/page.tsx` |
| 상세 페이지 구조 | `src/app/projects/[slug]/page.tsx` |

자세한 규칙(수치 원칙·폰트·접근성 기준)은 소스 저장소의 README에 있다.

## 배포 절차

```powershell
cd C:\Users\JNote\Desktop\클로드코드\포트폴리오_v2_next
npm run build:full        # 빌드 + 폰트 서브셋 (반드시 :full)
```

그다음 이 저장소를 `out/` 내용으로 교체하고 푸시한다.

```powershell
cd C:\Users\JNote\Desktop\코덱스\portfolio-github-sync
# 산출물 파일만 교체한다. .git / .gitignore / qa 는 건드리지 않는다.
Copy-Item -Recurse -Force ..\..\클로드코드\포트폴리오_v2_next\out\* .
git add -A
git commit -m "Deploy: <바꾼 내용>"
git push origin main
```

`.nojekyll` · `robots.txt` · `sitemap.xml` · `og-image.png` · 파비콘 3종은 빌드에 포함되므로 따로 챙기지 않아도 된다.

## 배포 전 확인 (한 번 데인 것들)

- **basePath** — 소스 `next.config.ts` 의 `basePath`/`assetPrefix` 가 `/kim-seonil-portfolio` 여야 한다. 비우고 빌드하면 `/_next/...` 가 도메인 루트를 가리켜 CSS·JS가 전부 404가 되고, 스타일 없는 맨 HTML이 뜬다.
- **폰트** — `@font-face` 는 `layout.tsx` 인라인 `<style>` 에 있다. `globals.css` 로 옮기면 하위 경로에서 404가 나고 시스템 폰트로 조용히 폴백된다.
- **파비콘** — `icons` 는 metadataBase 로 절대화되지 않는다. 상대경로로 두면 `/projects/<slug>/` 에서 404가 된다.
- **인쇄** — Framer Motion 이 심는 `style="opacity:0"` 때문에, `@media print` 와 `<noscript>` 폴백이 없으면 인쇄본이 백지로 나온다.

## 이력서

**PDF를 이 저장소에 두지 않는다.** 연락처·학력이 포함되어 공개 URL에 올리면 크롤러에 노출된다.
모든 이력서 CTA는 메일 요청(mailto)으로 연결된다.

## 이력

- 2026-07-26 — v2(Next.js) 로 전면 교체. 이전 단일 `index.html` 정적 버전은 커밋 `c72e82a` 까지의 이력에 남아 있다.
