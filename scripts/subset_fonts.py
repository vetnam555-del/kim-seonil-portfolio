# -*- coding: utf-8 -*-
"""Pretendard 서브셋 생성 스크립트.

원본(assets/fonts/original/*.woff2)에서 배포용 서브셋(assets/fonts/*.woff2)을
다시 만든다. 포함 범위:
  - KS X 1001 완성형 한글 2,350자 (euc-kr 인코딩 가능 여부로 판별)
  - index.html / js/main.js / README.md 에 실제로 등장하는 모든 문자
  - ASCII 전체, 자주 쓰는 문장부호·기호·화살표

페이지에 새 글자가 생겨도 KS X 1001 범위면 자동 커버된다.
실행:  python scripts/subset_fonts.py  (저장소 루트에서)
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
TEXT_SOURCES = ["index.html", os.path.join("js", "main.js"), "README.md"]


def ksx1001_hangul():
    # iso2022_kr은 KS X 1001만 엄격하게 인코딩한다 (euc_kr/cp949는 확장
    # 한글 11,172자를 전부 통과시켜 서브셋 효과가 사라짐)
    chars = set()
    for cp in range(0xAC00, 0xD7A4):
        ch = chr(cp)
        try:
            ch.encode("iso2022_kr")
            chars.add(ch)
        except UnicodeEncodeError:
            pass
    return chars


def gather_text():
    chars = set()
    for rel in TEXT_SOURCES:
        path = os.path.join(ROOT, rel)
        if os.path.exists(path):
            with io.open(path, "r", encoding="utf-8") as f:
                chars.update(f.read())
    # ASCII printable + NBSP + common punctuation/symbols/arrows/currency
    chars.update(chr(c) for c in range(0x20, 0x7F))
    chars.update(" ·…—–‘’“”※×÷±≈∙°₩→←↑↓↔▲▼●○■□★☆✓✔•©®™%‰")
    chars.update(ksx1001_hangul())
    chars.discard("\n")
    chars.discard("\r")
    chars.discard("\t")
    return "".join(sorted(chars))


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
    print(f"{name}: {before:,} -> {after:,} bytes ({after * 100 // before}%)")


def main():
    if not os.path.isdir(SRC_DIR):
        sys.exit("원본 폰트 폴더가 없습니다: " + SRC_DIR)
    text = gather_text()
    print(f"subset glyph candidates: {len(text)} chars")
    for name in WEIGHTS:
        subset_one(name, text)


if __name__ == "__main__":
    main()
