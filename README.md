# 김선일 포트폴리오

디지털 퍼포먼스 마케터 김선일의 경력과 대표 프로젝트를 정리한 정적 포트폴리오 사이트입니다.

## 구성

- `index.html`: 페이지 콘텐츠, SEO 메타데이터, 구조화 데이터
- `css/style.css`: 반응형 레이아웃과 시각 스타일
- `js/main.js`: 내비게이션, 프로젝트 필터, 카운터, 접근성 보조 동작
- `assets/evidence/`: 대표 프로젝트의 비식별 성과 근거 이미지
- `assets/fonts/`: 자체 호스팅 Pretendard 서브셋 폰트
- `robots.txt`, `sitemap.xml`: 검색 엔진 등록 파일

## 콘텐츠 구조

1. 핵심 포지셔닝과 주요 성과
2. 제이에스티나, 뉴발란스, 다이슨 대표 사례
3. 쌤소나이트, 동원몰, 강원심층수, 한샘, KT알파쇼핑, 생활백서 추가 성과
4. 경력, 역량과 도구, 운영 브랜드, 수상 이력
5. 연락 및 이력서 요청 동선

## 로컬 확인

```powershell
python -m http.server 8017
```

브라우저에서 `http://127.0.0.1:8017/?static=1`로 접속하면 애니메이션이 제거된 최종 배치를 확인할 수 있습니다.

## QA 체크리스트

- 1440px 데스크톱과 390px 모바일에서 가로 넘침이 없는지 확인
- 대표 사례 이미지, 외부 근거 링크, 메일 링크가 정상 동작하는지 확인
- 한글 폰트 로딩, 텍스트 잘림, 버튼 터치 영역을 확인
- 이미지 대체텍스트, 제목 구조, 중복 ID, 로컬 파일 참조를 확인
- 배포 후 캐시 무효화 쿼리를 붙여 GitHub Pages 결과를 재검증

## 배포

GitHub Pages는 `main` 브랜치의 루트 정적 파일을 배포합니다.

```powershell
git add .
git commit -m "Update portfolio"
git push origin main
```

배포 주소: <https://vetnam555-del.github.io/kim-seonil-portfolio/>
