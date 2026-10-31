# 링크드인 프로필 원문 (v3 · 2026-10-30)

사이트 밖의 공개 프로필이다. 이 저장소에서 빌드하지 않는다. 주인이 직접 붙여 넣거나, 브라우저를 다룰 수 있는 에이전트
(Claude 데스크톱 앱의 내장 브라우저 · 크롬 확장)가 **주인이 직접 로그인한 화면**에서 넣는다. 클라우드 세션은 링크드인을 열지 못한다
(로그인이 필요하고 자동 접속은 999 로 막힌다).

문장과 숫자는 모두 사이트 · 이력서 원문(`src/data/`)에서 가져왔다. 사실이 바뀌면 사이트와 같이 고친다(SKILL 1절).
칸마다 복사 버튼이 달린 붙여넣기 페이지(주인 계정에서만 열림): https://claude.ai/artifact/15ZKb6YBZpitr43a13WZsm

| 항목 | 값 |
|---|---|
| 프로필 | https://www.linkedin.com/in/%EC%84%A0%EC%9D%BC-%EA%B9%80-b28a1021b/ |
| 상태 | 주인이 일부 반영(2026-10-31) — 지금 프로필과 이 문서의 대조는 아직. 포트폴리오 링크 미리보기 그림은 robots.txt 차단을 푼 빌드가 main 에 들어간 뒤부터 뜬다 |
| 정할 것 | BACKLOG O-11 — 직함 표기 · 공개 범위. 아래는 권장안(직무명 붙이기 · 이력서 수준)으로 썼다 |

## 적용할 때 지킬 것

- 이 문서에 없는 사실 · 숫자를 만들지 않는다. 숫자는 표기 그대로(기준 · 괄호 포함).
- 수상은 '통합 퍼포먼스 부문 우수상'까지 쓴다. "디지털 광고 대상 수상"으로 줄이면 대상을 받은 것으로 읽힌다.
- 저장할 때 '네트워크에 알리기'는 끈다. 구직 중(Open to Work)은 켜지 않는다(재직 중, 2026-10-15 결정).
- 프로필 주소(URL) · 이름 · 사진은 건드리지 않는다(이력서 · 사이트에 지금 주소가 실려 있다). 전화번호 · 주소는 넣지 않는다.
- 로그아웃하거나 계정 · 개인정보 · 공개 범위 설정을 바꾸지 않는다. 비밀번호 · 인증 코드가 필요하면 멈추고 주인에게 넘긴다.

## 적용 순서 (에이전트)

1. 프로필 첫 화면과 상세 화면(경력 · 프로젝트 · 자격증 · 수상 · 보유기술)을 접힌 '더보기'까지 펼쳐 읽는다.
2. 이 문서와 칸별 대조표를 주인에게 보인다 — 지금 내용 / 이 문서 / 차이(빠진 칸, 다른 문장 · 숫자, 오타, 줄바꿈 깨짐).
3. 주인이 확인하면 칸 하나씩 고친다. 바꾸기 전에 지금 내용과 바꿀 내용을 보여 주고, 저장은 주인이 좋다고 한 뒤에만.
4. 끝나면 다시 읽어 이 문서와 같은지 확인하고 남은 차이를 보고한다. 위 표의 '상태'를 고친다.

---

## 1. 프로필 상단 (이름 아래 연필 → 소개 편집)

헤드라인 (85 / 220)

```text
퍼포먼스 마케터 | 리멤버 광고운영팀 | 검색·DA·SNS 4년 · 30여 개 브랜드 | 대한민국 디지털 광고 대상 통합 퍼포먼스 부문 우수상 2년 연속
```

- 위치: 시 · 도까지만(실제 지역으로).
- 연락처 정보: 이메일 `makefair@naver.com` · 웹사이트(유형 포트폴리오) `https://vetnam555-del.github.io/kim-seonil-portfolio/`
- 배경 사진(2026-10-31): `assets/linkedin/banner-a.png`(포트폴리오 공유 이미지와 같은 글꼴 · 색 · 문구) 또는
  `banner-b.png`(같은 문구를 Higgsfield 로 만든 배경 위에 — 8크레딧, 바탕이 살짝 보랏빛). 둘 중 주인이 고른다.
  문구가 바뀌면 `assets/linkedin/banner.html` 을 고치고 `node scripts/render_linkedin_banner.cjs a`(또는 b)로 다시 굽는다.
  10-31 소개 줄의 쉼표("세우고, 테스트로")를 뺐다 — 사이트 첫 화면과 같게. 그 전 그림을 이미 올렸다면 새 그림으로 바꾼다.
  글자 있는 그림은 생성 모델이 한글을 틀리기 쉬워 직접 그린다. Higgsfield 는 글자 없는 배경에만 썼다.

## 2. 소개 (908 / 2,600)

```text
4년 동안 9개 업종 30여 개 브랜드의 검색·DA·SNS 광고를 운영했고, 지금은 리멤버에서 B2B 리드 생성 캠페인을 맡고 있습니다.
성과가 막히면 소재를 바꾸기 전에 비교 기준부터 점검합니다. '성과가 떨어졌다'는 보고를 같은 표본으로 다시 계산해 CVR이 오히려 0.66%에서 2.24%로 올랐음을 확인한 적이 있습니다.

▸ 대표 사례
· 제이에스티나 — 검색에 쏠린 예산을 고객 단계별로 다시 나눴습니다. 같은 마감보고에서 GA4 ROAS가 2025년 5월 352%에서 7월 583%로 올랐고, 이 캠페인은 그해 대한민국 디지털 광고 대상 통합 퍼포먼스 부문 우수상을 받았습니다.
· 강원심층수 천년동안(단독 운영) — 검색·쇼핑 광고만으로는 판매를 늘리는 데 한계가 있어 인스타그램 공동구매와 파트너십 광고로 판매 경로를 넓혔습니다. 2026년 7월 스토어 판매금액은 전년 같은 기간보다 397.3% 늘었습니다(공동구매 포함).
· 뉴발란스 — 월 10억+ 규모 10개 채널을 팀으로 운영하며 재고 점검을 광고 운영과 연결해 내부 점검 시간을 약 2시간에서 5분 이내로 줄였습니다. 데이터가 이상하면 광고 설정을 바꾸지 않고 멈추게 했고, 이 작업은 LG CNS MOP 우수사례로 소개됐습니다.

▸ 일하는 방식
반복되는 점검은 자동화해 판단에 쓸 시간을 확보합니다. 캠페인이 끝나면 다음 담당자가 이어받을 수 있게 리포트·검수 절차·인수인계 문서까지 남겨 왔습니다.

▸ 그 밖
경영학과 산업디자인을 전공했습니다. 아이디어를 보여 주려고 디자인을, 제품을 알리려고 광고를 택했습니다. 2030 직장인 돈·일·소비 트렌드 뉴스레터 EDIT H를 기획·발행합니다.

포트폴리오 https://vetnam555-del.github.io/kim-seonil-portfolio/
메일 makefair@naver.com
```

주요 기술(소개 칸 아래, 최대 5개): 퍼포먼스 마케팅 · Google Analytics · 검색 광고(SEM) · 미디어 플래닝 · 마케팅 자동화
— 링크드인 기술 목록에서 이름이 가장 가까운 것을 고른다.

## 3. 경력 (항목마다 연필)

회사 칸은 입력할 때 뜨는 목록에서 회사 페이지를 고른다(로고가 붙는다). 고용 형태는 실제대로(정규직 · 인턴).
직함은 '직급 · 퍼포먼스 마케터'(권장). 회사 직함 그대로를 고르면 괄호 안 것을 쓰고, 설명 첫 줄의 부서 이름은 뺀다.

### 리멤버앤컴퍼니 · 2026.10 – 현재

직함: `광고운영팀 매니저 · 퍼포먼스 마케터` (그대로: `광고운영팀 매니저`)

```text
광고운영팀
• 리멤버 직장인 명함 데이터 기반 산업·직무·직급·기업 규모 타겟팅
• 구글·메타 등 네트워크 매체 B2B 리드 생성 캠페인 기획·운영
• 성과 분석에 따른 타겟·소재·랜딩페이지·캠페인 구조 최적화
• 광고주 성과 리뷰와 개선 방향 제안
```

### HLL중앙 · 2025.11 – 2026.09

직함: `과장 · 퍼포먼스 마케터` (그대로: `퍼포먼스전략국 과장`)

```text
퍼포먼스전략국 · 매체 운영에 더해 성과 측정 기준과 운영 자동화까지 담당
• 뉴발란스 월 10억+ 규모 10개 채널 통합 운영(계정 운영 40%)
• 재고 점검과 광고 운영 연동 — 내부 점검 약 2시간 → 5분 이내(내부 실측), 데이터 이상 시 설정 변경 없이 중단
• 쇼핑검색 입찰 최적화 · 재고 연동 소재 ON/OFF 자동화 — LG CNS MOP 우수사례 게재(단독 수행)
• 재고·리포트·모니터링·정산 자동화 6종 단독 기획·구축
• 강원심층수 천년동안 단독 운영 — 인스타그램 공동구매로 판매 경로 확장, 2026.07 스토어 판매금액 전년 대비 +397.3%(공동구매 포함)
• 대교에듀캠프 비교 표본 재검증 — 동일 기준 CVR 0.66% → 2.24%, 이후 상담 폼 3차 개선
• 사내 AI 전환(AX) 프로젝트 참여
```

### 플레이디 (PlayD) · 2022.09 – 2025.10

직함: `PM · 퍼포먼스 마케터` (그대로: `데이터마케팅본부 PM`)

```text
데이터마케팅본부 · 대형 광고주 PM으로 30여 개 브랜드의 SA·DA·SNS 담당
• 제이에스티나 IMC 재설계 — 흩어진 DA 통합 · 고객 단계별 예산 재배분, GA4 ROAS 352% → 583%(2025.05 → 07, 같은 마감보고 기준)
• 대한민국 디지털 광고 대상 통합 퍼포먼스 부문 우수상 2년 연속 — 2025 제이에스티나 · 2024 독립문 PAT · 엘르골프
• 다이슨 공동 기획 · 매체 믹스 분석 — 성과가 낮은 디스플레이에서 동영상으로 예산 이동
• 다이슨 콘텐츠–구독–커머스 여정 설계 참여 — 채널 전체 구독자 2,000 → 107,600(팀 성과)
• KT알파쇼핑 — 합산 ROAS 하나로 보던 평가 기준을 역할별 KPI 3축으로 분리
• 한샘 SA·DA·APP 통합 운영
```

### 중소벤처기업진흥공단 · 2022.04 – 2022.07

직함: `인턴` (그대로: `혁신성장본부 인턴`)

```text
혁신성장본부
• 금융 인플루언서 협업 콘텐츠 기획
• 지원사업 신청 프로세스 관리
• 운영 목표 대비 154% 달성에 기여
```

## 4. 프로젝트 (프로필 섹션 추가 → 프로젝트 · '관련 항목'은 해당 경력)

**뉴발란스 재고 연동 광고 자동화 — LG CNS MOP 우수사례** · 2025.11 – 2026.09 · HLL중앙 · URL `https://blog.mop.co.kr/hll`

```text
재고 점검을 광고 운영과 연결해 내부 점검 시간을 약 2시간에서 5분 이내로 줄였습니다(내부 실측). 데이터가 이상하면 광고 설정을 바꾸지 않고 멈추게 했습니다. 쇼핑검색 입찰 최적화와 재고에 따른 소재 ON/OFF 자동화 사례가 LG CNS MOP 우수사례로 게재됐고, 운영과 자동화 적용은 단독으로 수행했습니다.
사례 https://vetnam555-del.github.io/kim-seonil-portfolio/projects/newbalance/
```

**제이에스티나 IMC 재설계 — 2025 대한민국 디지털 광고 대상 통합 퍼포먼스 부문 우수상** · 2024.05 – 2025.10 · 플레이디 · URL `https://vetnam555-del.github.io/kim-seonil-portfolio/projects/jestina/`

```text
대행사별로 흩어져 있던 DA를 한곳으로 모으고 예산을 채널 효율 순위 대신 고객 단계에 맞춰 나눴습니다. 같은 마감보고 기준 GA4 ROAS가 2025년 5월 352%에서 7월 583%로 올랐습니다.
```

**대교에듀캠프 비교 표본 재검증 · 상담 폼 개선** · 2025.11 – 2026.09 · HLL중앙 · URL `https://vetnam555-del.github.io/kim-seonil-portfolio/projects/daekyo/`

```text
'전년보다 성과가 나빠졌다'는 비교에 약 9천 원만 쓴 고CTR 소재가 섞여 있었습니다. 표본을 맞추자 동일 기준 CVR은 0.66%에서 2.24%로 오히려 올랐고, 병목은 상담 폼에 있었습니다. 폼을 다시 도입한 뒤 광고 DB 전환율은 2.84%에서 7.55%로 올랐지만 정규 서비스 전환율은 13.7%에서 9.9%로 낮아졌고, 문항을 다시 조정해 11.28%까지 회복했습니다.
```

**강원심층수 천년동안 판매 경로 확장** · 2025.11 – 2026.09 · HLL중앙 · URL `https://vetnam555-del.github.io/kim-seonil-portfolio/projects/gangwon/`

```text
단독 운영. 검색·쇼핑 광고만으로는 판매를 늘리는 데 한계가 있어 인스타그램 공동구매와 파트너십 광고로 판매 경로를 넓혔습니다. 2026년 7월 스토어 판매금액은 전년 같은 기간 대비 +397.3%(공동구매 포함)였고, 광고 기여만 계산한 상반기 ROAS는 201%에서 238%로 올랐습니다(전년 기간은 담당 이전).
```

## 5. Featured (링크 추가 — 제목 · 설명은 아래로 바꾼다)

| 순서 | 제목 | 링크 | 설명 |
|---|---|---|---|
| 1 | 김선일 퍼포먼스 마케팅 포트폴리오 | https://vetnam555-del.github.io/kim-seonil-portfolio/ | 대표 사례 5개 — 문제 · 판단 · 실행 · 결과 · 배운 것과 증빙 |
| 2 | 포트폴리오 PDF (29쪽) | https://vetnam555-del.github.io/kim-seonil-portfolio/kim-seonil-performance-marketing-portfolio.pdf | 전달 · 인쇄용 |
| 3 | LG CNS MOP 우수사례 | https://blog.mop.co.kr/hll | 쇼핑검색 입찰 최적화와 재고에 따른 소재 ON/OFF 자동화 · 단독 수행 |
| 4 | EDIT H | https://vetnam555-del.github.io/edit-h-archive/ | 2030 직장인 돈·일·소비 트렌드 뉴스레터 · 기획·발행 |

- 소개 영상(2026-10-31, 15초 · 소리 없음): `assets/linkedin/intro-16x9.mp4`(가로 1920×1080) · `intro-1x1.mp4`(정사각 1080×1080),
  대표 화면은 `intro-16x9.png` · `intro-1x1.png`. 글자는 사이트 홈 첫 화면 그대로(제목 · 소개 한 줄 · 증거 세 칸과 기준)이고,
  끝 장면의 직함 줄은 1절 헤드라인과 같으며 주소를 더했다. 배경만 Higgsfield 로 만든 5초 영상(35크레딧, `hf-intro-bg.mp4`)을 약 3배 느리게 늘려 썼다.
  게시물에 영상을 올리고(대표 화면을 고를 수 있으면 위 PNG), 그 게시물을 Featured 에 추가한다. 순서는 주인이 정한다.
  문구가 바뀌면 `assets/linkedin/intro-video.html` 을 고치고 `node scripts/render_linkedin_video.cjs`(정사각은 `square`)로 다시 굽는다(ffmpeg 필요).

## 6. 자격증/수료증 (발행일을 아는 것만 · '만료되지 않음'은 확인한 것만)

| 이름 | 발급 기관 | 발행일 |
|---|---|---|
| 텔레마케팅관리사 | 자격증에 적힌 대로 | 2016.08 |
| 행정관리사 3급 | 자격증에 적힌 대로 | 2014.06 |
| GAIQ (Google Analytics) | Google | 실제 기록대로(사이트에는 '취득 이력') |
| Google Ads 인증 | Google | 실제 기록대로(사이트에는 '취득 이력') |
| 카카오모먼트 비즈니스 (Basic) | 카카오 | 실제 기록대로 |
| 카카오톡채널 비즈니스 (Basic) | 카카오 | 실제 기록대로 |

## 7. 수상 경력

| 이름 | 발급 기관 · 날짜 | 관련 경력 | 확인 링크 |
|---|---|---|---|
| 대한민국 디지털 광고 대상 통합 퍼포먼스 부문 우수상 — 제이에스티나 | 한국디지털광고협회 · 2025 | 플레이디 | https://kodaa.or.kr/2025kodaf |
| 대한민국 디지털 광고 대상 통합 퍼포먼스 부문 우수상 — 독립문 PAT · 엘르골프 | 한국디지털광고협회 · 2024 | 플레이디 | https://kodaa.or.kr/2024kodaf |
| 대한민국 인재상 — 선정 및 표창(부총리 겸 교육부장관상) | 2020.12 | — | https://news.unn.net/news/articleView.html?idxno=503973 |

## 8. 보유기술 (주요 기술 5개 말고 더할 것)

Google Ads · Meta 광고 · Google Tag Manager · Looker Studio · AppsFlyer · A/B 테스트 · Python · Google Apps Script · B2B 리드 생성 · IMC

## 9. 학력 (지금 프로필과 같으면 그대로)

| 학교 | 전공 · 학위 | 기간 |
|---|---|---|
| 연세대학교 미래캠퍼스 | 디자인예술학부 산업디자인전공 · 학사 | 2017.03 – 2022.02 |
| 학점은행제 | 경영학전공 · 학사 | 2014.03 – 2017.02 |
| 숭실대학교 | (전공 비워 둠 — 학교 이름과 기간만) | 2014.03 – 2017.02 |

## 10. 영문 프로필 (선택 — 프로필 상단 → 다른 언어로 프로필 추가 → English)

한국어 칸에 영어를 같이 쓰지 않는다(설명이 두 배로 길어진다).

Headline (211 / 220)

```text
Performance Marketer | Ad Operations Manager at Remember | Search, display & social ads for 30+ brands over 4 years | Excellence Award, Integrated Performance, Korea Digital Advertising Awards, two years running
```

About

```text
I've run search, display and social ads for 30+ brands across 9 industries over 4 years, and I now run B2B lead-generation campaigns at Remember. When performance stalls, I check the comparison baseline before changing the creative.

At PlayD I split J.ESTINA's search-heavy budget by customer stage. In the same closing report, GA4 ROAS rose from 352% in May 2025 to 583% in July, and that campaign won an Excellence Award at the Korea Digital Advertising Awards that year.

At HLL JoongAng I ran New Balance's 10 channels at KRW 1B+ a month as part of a team. I connected the inventory checks people did site by site to ad operations, cutting internal check time from about 2 hours to under 5 minutes, and made the system stop without changing ad settings when data looks wrong. This work was featured as an LG CNS MOP best practice. I also ran Gangwon Deep Sea Water on my own and added Instagram group-buys as a sales channel; July 2026 store sales were 397.3% higher than the same period last year (incl. group-buys).

Portfolio https://vetnam555-del.github.io/kim-seonil-portfolio/en/
```

---

## 어떻게 정했나

- v1(2026-10-29): 사이트 · 이력서 문장으로 초안. 링크드인 기준 평가 — 증거 · 서류 일치는 좋고, 첫 화면(소개 첫 줄에 숫자 없음) · 훑어 읽기(한 줄에 사실 여럿) · 대표 성과(강원 빠짐)가 약했다.
- v2: 소개 둘째 줄에 근거 하나, 대표 사례 셋(제이에스티나 · 강원 · 뉴발란스), 경력 한 줄 한 사실, 헤드라인 끝을 외부 기록으로.
- v3: 레퍼런스(같은 업계 마케터의 링크드인 프로필 1건, REFERENCES 2026-10-30)에서 형식만 — 직함에 직무명, 경력 줄 맞춤(명사로 끝맺음), 프로젝트 칸에 외부 기록 · 사례 링크, 자격증 발행일, 기본 칸(위치 · 회사 로고 · 인증).
  가져오지 않은 것: 한 단어 헤드라인, 성격 · 사무 도구를 늘어놓은 소개, 한 칸에 한 · 영 병기.
- 대교 상담 폼 결과는 경력 칸에서 빼고 프로젝트 칸에 대가(정규 서비스 전환율 하락)와 함께 둔다 — 좋은 숫자만 남기지 않는다.
