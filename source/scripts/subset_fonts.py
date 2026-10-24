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
from fontTools.varLib import instancer

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

# JetBrains Mono 는 구글이 라틴 서브셋으로 제공한 31KB 파일이라 그대로 통과시킨다.
PASSTHROUGH = ["JetBrainsMono-Var.woff2"]

# Archivo 는 가변축 범위를 줄이고 렌더 문자만 남긴다 (2026.10.24 B-04 · 90KB → 26KB).
# 사이트 전체에서 쓰는 값은 굵기 700·800, 폭 112–125% 다(모든 쪽 · 390/1440px 실측). 여유를 두어 600–900 · 100–125 를 남긴다.
# 축을 지우지 않고 범위만 줄이므로(varLib.instancer) wdth 축은 그대로다 — 예전 메모의 "wdth 축을 잃을 수 있다"는
# 서브셋만 할 때의 걱정이었다. 범위를 바꾸면 layout.tsx 의 @font-face font-weight · font-stretch 도 같이 바꾼다.
ARCHIVO = "Archivo-Var.woff2"
ARCHIVO_AXES = {"wght": (600, 900), "wdth": (100, 125)}

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
        font = instancer.instantiateVariableFont(TTFont(os.path.join(SRC, ARCHIVO)), ARCHIVO_AXES)
        o = Options()
        o.flavor = "woff2"
        o.layout_features = ["*"]
        o.name_IDs = ["*"]
        o.notdef_outline = True
        ss = Subsetter(options=o)
        ss.populate(text=text)
        ss.subset(font)
        dst = os.path.join(OUT, ARCHIVO)
        font.flavor = "woff2"
        font.save(dst)
        shutil.copy2(dst, os.path.join(DEPLOY_OUT, ARCHIVO))
        before = os.path.getsize(os.path.join(SRC, ARCHIVO))
        after = os.path.getsize(dst)
        total += after
        print("  %-30s %8d -> %7d bytes (%d%% · 축 %s)" % (ARCHIVO, before, after, after * 100 // before, ARCHIVO_AXES))
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
    archivo = TTFont(os.path.join(OUT, ARCHIVO))
    axes = {a.axisTag: (a.minValue, a.maxValue) for a in archivo["fvar"].axes} if "fvar" in archivo else {}
    if axes != {k: (float(v[0]), float(v[1])) for k, v in ARCHIVO_AXES.items()}:
        print("  FAIL %-30s 가변축 범위가 다름: %s" % (ARCHIVO, axes))
        failed = True
    # 원본 Archivo 가 가진 렌더 문자는 서브셋에도 모두 있어야 한다(자비스 5019b4b 비차단 의견, 2026.10.24).
    # 없는 문자는 Pretendard 로 넘어가 같은 줄 안에서 서체가 갈린다 — 경고가 아니라 실패로 센다.
    archivo_orig = cmap_of(os.path.join(SRC, ARCHIVO))
    archivo_sub = set()
    for t in archivo["cmap"].tables:
        archivo_sub.update(t.cmap.keys())
    lost = sorted(ch for ch in page if ord(ch) in archivo_orig and ord(ch) not in archivo_sub)
    if lost:
        print("  FAIL %-30s 원본에 있는 렌더 문자 %d자 누락: %s" % (ARCHIVO, len(lost), " ".join("%s(U+%04X)" % (ch, ord(ch)) for ch in lost)))
        failed = True
    for name in [ARCHIVO] + PASSTHROUGH:
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

    for name in WEIGHTS + [ARCHIVO] + PASSTHROUGH:
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
