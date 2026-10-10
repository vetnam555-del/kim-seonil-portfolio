"""공개 이력서 PDF(ReportLab) 생성 (2026.10.09, 클라우드 이전).

    node scripts/export_resume_data.mjs <data.json>
    python3 scripts/print_resume_reportlab.py <data.json> <출력.pdf> [YYYY.MM.DD]

배포 중인 public/kim-seonil-resume-public.pdf 는 웹 이력서 인쇄본이 아니라 이 스크립트로 만든 문서다.
Drive 의 portfolio-resume-20260924/create_resume_public_20260924.py(2026.09.26 판)를 옮겼고,
바꾼 것은 경로뿐이다 — 윈도우 글꼴(C:/Windows/Fonts) 대신 저장소의 Pretendard 원본(woff2)을 TTF 로 풀어 쓰고,
프로필 사진은 public/profile-kim-seonil.jpeg 를 쓴다. 구성·간격·문장 규칙은 원본 설명을 따른다:
  · 대표 프로젝트 1 앞에서만 쪽을 나누고 나머지 장은 이어서 싣는다(5쪽).
  · 어절 단위 줄바꿈(wordWrap='CJK' 를 쓰지 않는다 — 글자 단위라 '넓혔/습니다'처럼 끊긴다).
  · 수상 2025·2024 줄 끝에 '출품서 단독 작성·제출'을 붙이지 않는다(2026-09-24 본인 요청).
  · 한 줄 소개는 사이트·포트폴리오 PDF 표지와 같은 문장(generalCover.statement).
  · 첫 문단은 본인이 설명한 진로 이유(careerNarrative[0], 2026-09-24 공개 승인).
build_edition.mjs 는 이 PDF 를 그대로 복사한다(--reprint-resume 은 웹 이력서 인쇄본이라 다른 문서다).
"""
import html
import json
import sys
import tempfile
from pathlib import Path

import pymupdf
from fontTools.ttLib import TTFont as FontToolsFont
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer

SOURCE = Path(__file__).resolve().parent.parent
D = json.loads(Path(sys.argv[1]).read_text(encoding='utf-8'))
RESUME = Path(sys.argv[2])
DATE = sys.argv[3] if len(sys.argv) > 3 else '2026.09.26'
PROFILE = SOURCE / 'public' / 'profile-kim-seonil.jpeg'

fonts = Path(tempfile.mkdtemp(prefix='resume-fonts-'))
for weight in ('Regular', 'Bold'):
    font = FontToolsFont(str(SOURCE / 'public' / 'fonts' / 'original' / f'Pretendard-{weight}.woff2'))
    font.flavor = None
    font.save(str(fonts / f'Pretendard-{weight}.ttf'))
pdfmetrics.registerFont(TTFont('Pretendard', str(fonts / 'Pretendard-Regular.ttf')))
pdfmetrics.registerFont(TTFont('Pretendard-Bold', str(fonts / 'Pretendard-Bold.ttf')))
pdfmetrics.registerFontFamily('Pretendard', normal='Pretendard', bold='Pretendard-Bold')
S = {
    'body': ParagraphStyle('body', fontName='Pretendard', fontSize=11, leading=16.5, textColor=colors.HexColor('#222930'), spaceAfter=5),
    'small': ParagraphStyle('small', fontName='Pretendard', fontSize=10, leading=15, textColor=colors.HexColor('#4E5963'), spaceAfter=3),
    'h1': ParagraphStyle('h1', fontName='Pretendard-Bold', fontSize=25, leading=31, spaceAfter=8),
    'h2': ParagraphStyle('h2', fontName='Pretendard-Bold', fontSize=17, leading=23, spaceBefore=3, spaceAfter=13, keepWithNext=True),
    'h3': ParagraphStyle('h3', fontName='Pretendard-Bold', fontSize=12, leading=17, spaceBefore=7, spaceAfter=5, keepWithNext=True),
}
story = []


def p(text, style='body'):
    return Paragraph(html.escape(str(text)).replace('\n', '<br/>'), S[style])


def add(text, style='body'):
    story.append(p(text, style))


def link(label, url, style='small'):
    return Paragraph(f'<link href="{html.escape(url, quote=True)}" color="#B32F1C"><u>{html.escape(label)}</u></link>', S[style])


def page(title, new_page=False):
    if story:
        story.append(PageBreak() if new_page else Spacer(1, 4))
    add(title, 'h2')


def block(title, paragraphs):
    story.append(KeepTogether([p(title, 'h3')] + [p(x, 'small') for x in paragraphs]))


projects = {x['slug']: x for x in D['projects']}


def project(slug, metric_labels):
    x = projects[slug]
    add(x['brand'], 'h3'); add(x['period'] + ' | ' + x['contributionNote'], 'small')
    add(x['tldr'])
    add('담당: ' + x['role'], 'small')
    for label in metric_labels:
        m = next(i for i in x['detail']['results'] if i['label'] == label)
        value = (m.get('before') + ' → ' if m.get('before') and m['before'] != '기준' else '') + m['after']
        add(label + ' ' + value + ' | ' + m.get('note', ''), 'small')
    story.append(link('사례와 증빙 보기', D['site']['url'] + 'projects/' + slug + '/'))


add('김선일', 'h1'); add(f"퍼포먼스 마케터 | 경력 {D['careerYear']}년 | 전 HLL중앙 퍼포먼스전략국 과장", 'h3')
add(' '.join(D['generalCover']['statement']).replace('\u00a0', ' '))
story.append(link('makefair@naver.com', 'mailto:makefair@naver.com'))
story.append(link('웹 포트폴리오', D['site']['url']))
add(D['careerNarrative'][0])
add('핵심 경험', 'h3')
add('제이에스티나: 고객 단계별 예산 배분과 UTM·측정 기준 정리. GA4 ROAS 352% → 583% (2025.05 → 07, 동일 마감보고 기준).', 'small')
add('뉴발란스: 월 10억+ 규모의 팀 운영 계정에서 매체 운영 40%를 담당. 재고 자동화는 요구사항·구축·검수·운영을 맡아 내부 점검 시간을 약 2시간에서 5분 이내로 단축. 구현에는 AI 도구 사용.', 'small')
add('대교에듀캠프: 비교 표본을 맞춰 CVR 0.66% → 2.24% 재산출, 상담 폼 3차 개선으로 광고 DB 전환율 2.84% → 7.55%·정규 서비스 전환율 9.9% → 11.28%.', 'small')
add('강원심층수: 광고 밖 판매 경로로 인스타그램 공동구매·파트너십 광고를 더해 2026년 7월 스토어 판매금액 전년 대비 +397.3%(공동구매 포함).', 'small')
# 2026.09.25 경력직 개편 — 외부 인정을 첫 장으로 (verification 에 있는 사실)
add('외부 인정: 대한민국 디지털 광고 대상 통합 퍼포먼스 부문 우수상 2년 연속(2024 독립문 · 2025 제이에스티나) · LG CNS MOP 우수사례(쇼핑검색 재고 연동 자동화, 단독 수행).', 'small')
add('경력', 'h3')
for c in D['career']:
    block(c['company'] + ' | ' + c['period'], [c['title'], c['summary'], '주요 업무: ' + ' · '.join(c['work']), '담당: ' + c['clients']])

page('대표 프로젝트 1 | 예산 배분과 운영 자동화', new_page=True)
project('jestina', ['GA4 ROAS'])
add('채널 효율만 비교하면 신규 고객을 만드는 역할이 가려집니다. DA를 통합하고 고객 단계별 KPI와 예산 기준을 정했습니다. 촬영·디자인은 제작팀, 일 단위 집행은 팀 분담 범위입니다.', 'small')
story.append(Spacer(1, 12))
project('newbalance', ['재고·운영 점검 시간', '데이터 이상 시'])
add('기획·중단 조건·실행 결과 검수와 운영은 제가 맡았고 Python·API 구현에는 AI 도구를 썼습니다. 점검 시간은 내부 실측이라 같은 업무를 소개한 MOP 공개 사례의 수작업 평균 3시간과 구분합니다.', 'small')

page('대표 프로젝트 2 | 비교 기준과 고객 행동')
project('daekyo', ['CVR'])
add('약 9천 원만 소진된 고CTR 소재를 제외한 동일 기준 재비교입니다. 상담 폼 3차 개선은 이 비교 뒤에 한 일이라 위 수치와 따로 봅니다.', 'small')
project('gangwon', ['스토어 판매금액'])  # ROAS 201% → 238% 는 요약 문단(tldr)에 이미 있다 — 5쪽 유지
project('dyson', ['동영상 광고 CTR', 'YouTube 구독자'])
add('다이슨 매체 집계 구독 전환은 104,257건(2023.12)으로 채널 전체 구독자와는 다른 지표입니다.', 'small')

page('추가 경험 | 브랜드·콘텐츠·공개 작업물')
for x in D['otherResults']:
    metrics = ' · '.join(m['label'] + ' ' + m['value'] for m in x['metrics'])
    block(x['brand'] + ' | ' + x.get('period', ''), [x['summary'], metrics])
add('공개 작업물', 'h3')
for w in D['publicWork']:
    add(w['title'], 'small'); add(' · '.join(w['facts']), 'small')
    story.append(link('공개 작업물 보기', w['href']))
add('기획의 출발점', 'h3')
add('고등학교 공모전 기획, 대학의 보행 안전 시제품(팀장 · 300일간 매주 14시간 사용자 인터뷰), 예비창업패키지 대표로 맡은 첫 마케팅(차량 소유자 300명 설문 · 노출 78,000회), 인액터스 펀딩 캠페인(목표 금액 469%), 인턴 시기 정책상품 유튜브 협업을 거쳤습니다. 이때 좋은 아이디어보다 고객 데이터가 먼저라는 것을 배웠습니다. 문제 조사 · 메시지 정리 · 제작 파트너 조율 경험은 이후 캠페인 운영에 그대로 썼습니다.', 'small')

page('보유 역량 | 수행 범위와 도구')
add('설계는 업무 기준과 구조 수립, 운영은 계정·데이터 관리, 활용은 업무 도구 사용을 뜻합니다. SQL은 기초 학습 범위로 별도 표기합니다.', 'small')
for group in D['skills']:
    add(group['category'], 'h3')
    for row in group['rows']:
        add(row['level'] + ' | ' + ' · '.join(row['items']), 'small')
        if row.get('note'):
            add(row['note'], 'small')
add('실무 범위', 'h3')
add('퍼포먼스 캠페인 운영과 성과 분석이 핵심 전문성입니다. 자동화는 업무 요구사항과 예외 처리·검수·운영을 책임지는 경험이고 전문 개발 경력이나 고급 SQL 역량으로 표기하지 않습니다.', 'small')

page('학력·자격·수상 | 확인 가능한 기록')
add('학력', 'h3')
for e in D['education']:
    add(e['school'] + ' | ' + e['major'] + ' | ' + e['period'], 'small')
add('자격·인증 취득 이력', 'h3')
# 한 문단으로 잇는다 — 교육·활동이 늘어 6쪽으로 넘쳤다(2026.09.25). 웹 이력서 인쇄본과 같은 방식
add(' · '.join(c['name'] + (' (' + c['when'] + ')' if c['when'] else '') for c in D['certifications']), 'small')
add('수상·선정', 'h3')
awards = [dict(a) for a in D['awards']]
# '출품서 단독 작성·제출'은 싣지 않는다(2026-09-24 본인 요청) — 09.15 판은 여기서 덧붙였다
award_rows = {a['year']: a['name'] + ' | ' + a['detail'] for a in awards}
for a in D['awardsArchive']:
    items = [s.strip() for s in a['items'].split('·')]
    if a['year'] in award_rows:
        items = [s for s in items if s != '대한민국 인재상']
        award_rows[a['year']] += ' · ' + ' · '.join(items)
    else:
        award_rows[a['year']] = ' · '.join(items)
for year, items in sorted(award_rows.items(), reverse=True):
    add(year + ' | ' + items, 'small')
add('교육·활동', 'h3')
add(' / '.join(a['period'] + ' ' + a['name'] + ' (' + a['detail'] + ')' for a in D['activities']), 'small')
add('외부 확인 자료', 'h3')
verification = list(D['verification'])
if not any('2024kodaf' in v['href'] for v in verification):
    at = next(k for k, v in enumerate(verification) if '2025kodaf' in v['href'])
    verification.insert(at + 1, {'title': '대한민국 디지털 광고 대상 (2024)', 'href': 'https://kodaa.or.kr/2024kodaf'})
for v in verification:
    story.append(link(v['title'], v['href']))
add('출처·집계 기간·기여 범위는 프로젝트마다 적었습니다. 기여도는 그 범위 기준으로 100% 단독 수행, 35–75% 팀 내 전략·분석 주도, 20% 담당 매체·분석입니다. 전화번호·주소·생년월일과 광고주 원천 데이터는 싣지 않았습니다.', 'small')


def footer(c, doc):
    if doc.page == 1:
        c.drawImage(str(PROFILE), A4[0] - 101, A4[1] - 108, 57, 73, preserveAspectRatio=True, mask='auto')
    c.saveState(); c.setStrokeColor(colors.HexColor('#CDD2D6')); c.line(44, 36, A4[0] - 44, 36)
    c.setFont('Pretendard', 8); c.setFillColor(colors.HexColor('#4E5963'))
    c.drawString(44, 23, f'김선일 | 이력서 및 경력기술서 | {DATE}')
    c.drawRightString(A4[0] - 44, 23, str(doc.page)); c.restoreState()


RESUME.parent.mkdir(parents=True, exist_ok=True)
SimpleDocTemplate(str(RESUME), pagesize=A4, leftMargin=44, rightMargin=44, topMargin=39, bottomMargin=44,
                  title='김선일 | 이력서 및 경력기술서', author='김선일', lang='ko-KR', subject=f'퍼포먼스 마케팅 경력과 프로젝트 | {DATE} 검수',
                  creator='ReportLab').build(story, onFirstPage=footer, onLaterPages=footer)
with pymupdf.open(RESUME) as checked:
    print(json.dumps({'resume_pages': len(checked), 'output': str(RESUME)}, ensure_ascii=False))
