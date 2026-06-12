# 김선일 포트폴리오

디지털 퍼포먼스 마케터 김선일의 개인 포트폴리오 사이트입니다.
검색, 디스플레이, SNS, CRM, 데이터 분석, 자동화 프로젝트를 한 페이지에서 확인할 수 있도록 구성했습니다.

## 구성

- `index.html`: 전체 포트폴리오 페이지
- `css/style.css`: 반응형 레이아웃, 다크 데이터 비주얼 테마, 인쇄/스크린샷 대응 스타일
- `js/main.js`: 스크롤 인터랙션, 모바일 내비게이션, 카운터 애니메이션, 이메일 복사 기능
- `assets/`: 파비콘 및 공유 이미지

## 주요 섹션

- Hero: 핵심 포지셔닝 및 대표 성과
- About / Impact / Experience: 경력과 성과 요약
- Skills & Stack: 매체 운영, 데이터 분석, 전략, 자동화 역량
- Brands I've Worked With: 산업군별 운영 브랜드
- Selected Campaigns: 대표 캠페인 및 자동화 성과
- Awards & Recognition: 수상 이력
- Contact: 이메일 연락 동선

## 배포

GitHub Pages 정적 사이트로 배포합니다.

```powershell
git add .
git commit -m "Update portfolio"
git push origin main
```

브라우저 캐시를 피하려면 배포 후 URL에 `?check=YYYYMMDD` 같은 쿼리를 붙여 확인합니다.

## QA

- 데스크톱과 모바일에서 텍스트 잘림 여부 확인
- `?static=1` 쿼리로 애니메이션 없이 최종 상태 확인
- 주요 프로젝트 문구와 수치가 최신 이력과 일치하는지 확인
