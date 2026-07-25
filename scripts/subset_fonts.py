# -*- coding: utf-8 -*-
"""Pretendard 서브셋 생성 + 검증 스크립트.

원본(assets/fonts/original/*.woff2)에서 배포용 서브셋(assets/fonts/*.woff2)을
다시 만든다. 포함 범위는 "페이지에 실제로 등장하는 문자"로 한정한다.

  - index.html / css/style.css / js/main.js 에 등장하는 모든 문자
    (CSS의 content: "..." 도 화면에 렌더되므로 반드시 포함시킨다)
  - ASCII 전체, 자주 쓰는 문장부호·기호·화살표

KS X 1001 한글 2,350자를 통째로 넣던 이전 방식 대비 약 360KB 작아진다
(543KB -> 176KB). 대신 페이지에 없던 한글이 새로 생기면 그 글자만 시스템
폰트로 대체 렌더되므로, **문구를 수정하면 반드시 이 스크립트를 다시 실행**해야
한다. 실행 마지막에 자동 검증이 돌고, 누락이 있으면 0이 아닌 코드로 종료한다.

실행:  python scripts/subset_fonts.py   (저장소 루트에서)
검증만: python scripts/subset_fonts.py --check
필요:  pip install fonttools brotli
"""
import io
import os
import sys

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC_DIR = os.path.join(ROOT, "assets", "fonts", "original")
OUT_DIR = os.path.join(ROOT, "assets", "fonts")
WEIGHTS = ["Pretendard-Regular.woff2", "Pretendard-SemiBold.woff2", "Pretendard-Bold.woff2"]

# CSS를 빼먹으면 ::before/::after 의 content 글리프가 조용히 누락된다.
TEXT_SOURCES = [
    "index.html",
    os.path.join("css", "style.css"),
    os.path.join("js", "main.js"),
    "README.md",
]

# Pretendard 원본에 없는 글리프는 여기 넣어도 서브셋에 들어가지 않는다.
# 부재 확인됨 - U+2715, U+2716, U+2718, U+274C, U+2573.
# 곱셈/닫기 기호는 U+00D7 을 사용할 것.
EXTRA_SYMBOLS = (
    " ·…—–‘’“”※×÷±≈"
    "°₩→←↑↓↔↗↘−"
    "▲▼●○■□★☆✓✗•©®™‰"
)


def _strip_control(chars):
    for c in "\n\r\t":
        chars.discard(c)
    return chars


def gather_page_chars():
    """화면에 실제로 렌더되는 문자 — 이게 누락되면 폰트가 깨진다."""
    chars = set()
    for rel in TEXT_SOURCES:
        path = os.path.join(ROOT, rel)
        if os.path.exists(path):
            with io.open(path, "r", encoding="utf-8") as f:
                chars.update(f.read())
        else:
            print("  경고: 소스 파일 없음 - %s" % rel)
    chars.update(chr(c) for c in range(0x20, 0x7F))
    return _strip_control(chars)


def gather_text():
    """서브셋 입력 — 페이지 문자 + 앞으로 쓸 수 있는 기호 여유분."""
    chars = gather_page_chars()
    chars.update(EXTRA_SYMBOLS)
    return "".join(sorted(_strip_control(chars)))


def font_cmap(path):
    font = TTFont(path)
    cmap = set()
    for table in font["cmap"].tables:
        cmap.update(table.cmap.keys())
    return cmap


def verify(page_text):
    """서브셋 폰트가 페이지의 모든 렌더 문자를 담고 있는지 확인한다.

    EXTRA_SYMBOLS 여유분은 검증 대상이 아니다 — 원본 폰트에 없는 기호가
    목록에 있어도 페이지에서 쓰지 않으면 문제가 되지 않는다.
    """
    text = page_text
    orig_cmap = font_cmap(os.path.join(SRC_DIR, WEIGHTS[0]))
    failed = False
    for name in WEIGHTS:
        out = os.path.join(OUT_DIR, name)
        if not os.path.exists(out):
            print("  FAIL %-30s 서브셋 파일이 없습니다" % name)
            failed = True
            continue
        cmap = font_cmap(out)
        missing = [c for c in text if ord(c) not in cmap]
        if not missing:
            print("  OK   %-30s 글리프 %d자 · 누락 0" % (name, len(cmap)))
            continue
        # 원본에도 없는 글리프는 서브셋 문제가 아니라 문자 선택 문제다
        nofont = [c for c in missing if ord(c) not in orig_cmap]
        real = [c for c in missing if ord(c) in orig_cmap]
        print("  FAIL %-30s 누락 %d자" % (name, len(missing)))
        if real:
            print("       서브셋 누락(재생성 필요): "
                  + " ".join("%s(U+%04X)" % (c, ord(c)) for c in real))
        if nofont:
            print("       원본 폰트에 없음(다른 문자로 교체할 것): "
                  + " ".join("%s(U+%04X)" % (c, ord(c)) for c in nofont))
        failed = True
    return not failed


def subset_one(name, text):
    src = os.path.join(SRC_DIR, name)
    out = os.path.join(OUT_DIR, name)
    font = TTFont(src)
    opts = Options()
    opts.flavor = "woff2"
    opts.layout_features = ["*"]
    opts.name_IDs = ["*"]
    opts.notdef_outline = True
    opts.drop_tables += ["DSIG"]
    ss = Subsetter(options=opts)
    ss.populate(text=text)
    ss.subset(font)
    font.save(out)
    before = os.path.getsize(src)
    after = os.path.getsize(out)
    print("  %-30s %8d -> %7d bytes (%d%%)" % (name, before, after, after * 100 // before))
    return after


def main():
    check_only = "--check" in sys.argv
    if not os.path.isdir(SRC_DIR):
        sys.exit("원본 폰트 폴더가 없습니다: " + SRC_DIR)

    text = gather_text()
    page = "".join(sorted(gather_page_chars()))
    print("서브셋 대상 %d자 (그중 페이지 실사용 %d자)" % (len(text), len(page)))

    if not check_only:
        print("")
        total = 0
        for name in WEIGHTS:
            total += subset_one(name, text)
        print("  %-30s %8s    %7d bytes 합계" % ("", "", total))

    print("")
    print("검증 - 페이지 문자가 서브셋에 모두 있는지 확인")
    if not verify(page):
        sys.exit("\n검증 실패: 위 문자가 시스템 폰트로 대체 렌더됩니다. 조치 후 다시 실행하세요.")
    print("\n검증 통과.")


if __name__ == "__main__":
    main()
