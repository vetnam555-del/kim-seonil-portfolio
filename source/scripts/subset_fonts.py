# -*- coding: utf-8 -*-
"""빌드 산출물(out/**/*.html)에 실제로 등장하는 문자만 남겨 Pretendard를 서브셋한다.

원본: public/fonts/original/*.woff2  ->  배포용: public/fonts/*.woff2

문구를 수정하면 `npm run build` 후 이 스크립트를 다시 실행해야 한다.
마지막에 자동 검증이 돌고, 누락이 있으면 0이 아닌 코드로 종료한다.

실행:  py scripts/subset_fonts.py          (빌드 후)
검증만: py scripts/subset_fonts.py --check
필요:  pip install fonttools brotli
"""
import glob
import io
import os
import re
import shutil
import sys

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "public", "fonts", "original")
OUT = os.path.join(ROOT, "public", "fonts")
DEPLOY_OUT = os.path.join(ROOT, "out", "fonts")
WEIGHTS = [
    "Pretendard-Regular.woff2",
    "Pretendard-SemiBold.woff2",
    "Pretendard-Bold.woff2",
    # 한글 디스플레이 웨이트. 위계를 굵기 하나로만 만들던 문제를 푼다.
    "Pretendard-Black.woff2",
]

# 라틴·숫자 전용 가변 서체는 서브셋하지 않고 그대로 통과시킨다.
# fontTools 서브셋은 가변축(fvar/gvar)을 다루다 wdth 축을 잃을 수 있는데,
# 이 둘은 이미 구글이 라틴 서브셋으로 제공한 파일이라 각각 90KB/31KB로 충분히 작다.
PASSTHROUGH = ["Archivo-Var.woff2", "JetBrainsMono-Var.woff2"]

TAG_RE = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.S | re.I)
ATTR_RE = re.compile(r'(?:aria-label|alt|title|content|placeholder)="([^"]*)"')
ANGLE_RE = re.compile(r"<[^>]+>")
ENTITY = {"&nbsp;": " ", "&amp;": "&", "&lt;": "<", "&gt;": ">", "&quot;": '"', "&#x27;": "'"}

EXTRA = " ·…—–‘’“”※×÷±≈°₩→←↑↓↔↗−▲▼●○■□★☆✓✗•©®™‰"


def rendered_chars():
    files = glob.glob(os.path.join(ROOT, "out", "**", "*.html"), recursive=True)
    if not files:
        sys.exit("out/ 에 HTML이 없습니다. 먼저 `npm run build` 를 실행하세요.")
    chars = set()
    for path in files:
        html = io.open(path, "r", encoding="utf-8").read()
        body = TAG_RE.sub(" ", html)
        attrs = " ".join(ATTR_RE.findall(body))
        text = ANGLE_RE.sub(" ", body) + " " + attrs
        for k, v in ENTITY.items():
            text = text.replace(k, v)
        chars.update(text)
    chars.update(chr(c) for c in range(0x20, 0x7F))
    for c in "\n\r\t":
        chars.discard(c)
    print("  HTML %d개에서 렌더 문자 %d자 수집" % (len(files), len(chars)))
    return chars


def cmap_of(path):
    font = TTFont(path)
    s = set()
    for t in font["cmap"].tables:
        s.update(t.cmap.keys())
    return s


def main():
    check_only = "--check" in sys.argv
    page = rendered_chars()
    text = "".join(sorted(page | set(EXTRA)))

    if not check_only:
        print("")
        total = 0
        os.makedirs(DEPLOY_OUT, exist_ok=True)
        for name in WEIGHTS:
            font = TTFont(os.path.join(SRC, name))
            o = Options()
            o.flavor = "woff2"
            o.layout_features = ["*"]
            o.name_IDs = ["*"]
            o.notdef_outline = True
            o.drop_tables += ["DSIG"]
            ss = Subsetter(options=o)
            ss.populate(text=text)
            ss.subset(font)
            dst = os.path.join(OUT, name)
            font.save(dst)
            shutil.copy2(dst, os.path.join(DEPLOY_OUT, name))
            before = os.path.getsize(os.path.join(SRC, name))
            after = os.path.getsize(dst)
            total += after
            print("  %-30s %8d -> %7d bytes (%d%%)" % (name, before, after, after * 100 // before))
        for name in PASSTHROUGH:
            src = os.path.join(SRC, name)
            dst = os.path.join(OUT, name)
            shutil.copy2(src, dst)
            shutil.copy2(src, os.path.join(DEPLOY_OUT, name))
            size = os.path.getsize(dst)
            total += size
            print("  %-30s %8d -> %7d bytes (가변축 보존 · 통과)" % (name, size, size))
        print("  %-30s %19d bytes 합계" % ("", total))

    print("")
    print("검증 - 렌더 문자가 서브셋에 모두 있는지 확인")
    orig = cmap_of(os.path.join(SRC, WEIGHTS[0]))
    failed = False
    for name in WEIGHTS:
        c = cmap_of(os.path.join(OUT, name))
        missing = [ch for ch in page if ord(ch) not in c]
        if not missing:
            print("  OK   %-30s 글리프 %d자 · 누락 0" % (name, len(c)))
            continue
        real = [ch for ch in missing if ord(ch) in orig]
        nofont = [ch for ch in missing if ord(ch) not in orig]
        print("  FAIL %-30s 누락 %d자" % (name, len(missing)))
        if real:
            print("       서브셋 누락: " + " ".join("%s(U+%04X)" % (ch, ord(ch)) for ch in real))
        if nofont:
            print("       원본에 없음(문자 교체 필요): " + " ".join("%s(U+%04X)" % (ch, ord(ch)) for ch in nofont))
        failed = True
    # 화살표(U+2192)는 구글이 배포하는 Archivo/JetBrains Mono 라틴 서브셋에 원래 없다.
    # globals.css 의 --font-display / --font-mono 스택이 Pretendard 를 바로 뒤에 두고 있어
    # 화살표는 Pretendard 로 렌더된다(= 한글과 같은 서체라 오히려 정합적이다).
    # 여기 넣어두면 고칠 수 없는 경고가 매 빌드마다 찍혀 진짜 경고를 가린다.
    LATIN_NEEDED = "0123456789,.%+-/"
    for name in PASSTHROUGH:
        path = os.path.join(OUT, name)
        if not os.path.exists(path):
            print("  FAIL %-30s 파일 없음" % name)
            failed = True
            continue
        c = cmap_of(path)
        miss = [ch for ch in LATIN_NEEDED if ord(ch) not in c]
        if miss:
            print("  WARN %-30s 라틴 기호 누락: %s" % (name, " ".join(miss)))
        else:
            print("  OK   %-30s 글리프 %d자 · 숫자/기호 완비" % (name, len(c)))

    for name in WEIGHTS + PASSTHROUGH:
        source_font = os.path.join(OUT, name)
        deploy_font = os.path.join(DEPLOY_OUT, name)
        if not os.path.exists(deploy_font):
            print("  FAIL %-30s out/fonts 파일 없음" % name)
            failed = True
            continue
        with open(source_font, "rb") as source_file, open(deploy_font, "rb") as deploy_file:
            if source_file.read() != deploy_file.read():
                print("  FAIL %-30s public/fonts와 out/fonts 불일치" % name)
                failed = True
    if failed:
        sys.exit("\n검증 실패: 위 문자가 시스템 폰트로 대체 렌더됩니다.")
    print("\n검증 통과.")


if __name__ == "__main__":
    main()
