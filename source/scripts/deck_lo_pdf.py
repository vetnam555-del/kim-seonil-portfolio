"""LibreOffice 로 pptx → PDF (PowerPoint 대신).

LibreOffice Impress 는 문단마다 '아시아 문자와 영문·숫자 사이 간격'(text-autospace)을 기본으로 켠다.
한글 옆 숫자·영문·가운뎃점·마침표 앞에 빈칸이 끼어 PowerPoint 렌더와 줄바꿈이 달라진다.
DrawingML 에는 이 속성이 없어 pptx 로는 끌 수 없으므로, ODP 로 한 번 바꾼 뒤 모든 문단 속성에
style:text-autospace="none" 을 넣고 PDF 로 내보낸다.

  python3 scripts/deck_lo_pdf.py deck3.pptx deck3_lo.pdf   (덱 폴더에서는 python3 lo_pdf.py …)
"""
import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile

SOFFICE = os.environ.get(
    'SOFFICE_PY',
    '/root/.claude/skills/synced/523234ef-33ab-4587-bfd6-cce28541226d_9991a7a7-a6fd-4c80-aa46-b9e03cc1d11e/pptx/scripts/office/soffice.py')

src, dst = os.path.abspath(sys.argv[1]), os.path.abspath(sys.argv[2])
work = tempfile.mkdtemp(prefix='lo_pdf_')


def run(*args):
    # 클라우드 세션의 pptx 스킬 래퍼가 있으면 쓰고(맨 soffice 가 멈추는 샌드박스 대비), 없으면 soffice 를 직접 부른다
    cmd = ['python3', SOFFICE] if os.path.exists(SOFFICE) else ['soffice']
    r = subprocess.run([*cmd, '--headless', *args], cwd=work, capture_output=True, text=True, timeout=600)
    if r.returncode != 0:
        raise SystemExit(r.stdout + r.stderr)


shutil.copy(src, os.path.join(work, 'deck.pptx'))
run('--convert-to', 'odp', 'deck.pptx')
odp = os.path.join(work, 'deck.odp')
fixed = os.path.join(work, 'fixed.odp')
n = 0
with zipfile.ZipFile(odp) as zin, zipfile.ZipFile(fixed, 'w') as zout:
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename in ('content.xml', 'styles.xml'):
            t = data.decode('utf8')
            t = re.sub(r'\sstyle:text-autospace="[^"]*"', '', t)
            t, k = re.subn(r'<style:paragraph-properties\b', '<style:paragraph-properties style:text-autospace="none"', t)
            n += k
            # 문단 속성이 없는 기본 스타일에도 넣는다
            def add_pp(m):
                body = m.group(0)
                if '<style:paragraph-properties' in body:
                    return body
                return body.replace('>', '><style:paragraph-properties style:text-autospace="none"/>', 1)
            t = re.sub(r'<style:default-style\b[^>]*?(?<!/)>', add_pp, t)
            data = t.encode('utf8')
        # mimetype 은 압축하지 않고 맨 앞에 둔다(ODF 규칙)
        ct = zipfile.ZIP_STORED if item.filename == 'mimetype' else zipfile.ZIP_DEFLATED
        zout.writestr(zipfile.ZipInfo(item.filename, date_time=item.date_time), data, compress_type=ct)
# PowerPoint 내보내기(이미지 220ppi 안팎으로 다시 압축)와 비슷한 용량이 되게 줄인다
PDF_OPTS = ('pdf:impress_pdf_Export:{"ReduceImageResolution":{"type":"boolean","value":"true"},'
            '"MaxImageResolution":{"type":"long","value":"220"},"Quality":{"type":"long","value":"80"}}')
run('--convert-to', PDF_OPTS, 'fixed.odp')
shutil.move(os.path.join(work, 'fixed.pdf'), dst)
shutil.rmtree(work, ignore_errors=True)
print(f'text-autospace off · 문단 속성 {n}곳 → {dst}')
