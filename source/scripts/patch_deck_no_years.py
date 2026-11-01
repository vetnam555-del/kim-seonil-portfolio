"""
포트폴리오 PDF(덱)에서 경력 연수 표기를 빼는 임시 수선 (2026-11-01).

주인 결정: 사이트 · 이력서 · 링크드인에 이어 덱에서도 '경력 4년'을 쓰지 않는다. 덱 원본(Drive `코덱스/portfolio-deck-v2`,
pptxgenjs v3)을 다시 굽기 전까지 지금 PDF 의 그 줄만 고친다 — 다음에 원본으로 구울 때는 v3 원본에서 같은 곳을 고쳐야 한다(SKILL 7절).
덱 PDF 는 공개 저장소에 두지 않으므로(헤드헌터에게만 Drive 로) 이 스크립트도 경로를 받아서만 돈다.

  python3 scripts/patch_deck_no_years.py <원래 덱.pdf> <고친 덱.pdf>

고치는 곳(글꼴 굵기 · 크기 · 색 · 기준선은 원래 글자 그대로 쓴다):
  1쪽 소개   "4년 동안 9개 업종 30여 개 브랜드의 …"  → "9개 업종 30여 개 브랜드의 …"
  1쪽 프로필 "퍼포먼스 마케터  |  경력 4년"          → "퍼포먼스 마케터"
  2쪽 프로필 "퍼포먼스 마케터  |  경력 4년"          → "퍼포먼스 마케터"
  3쪽 첫 칸  경력 / 4년 / 2022.09 – 현재            → 운영 자동화 / 6종 / 기획·구축·운영 100%
             (같은 쪽 사례 표 06행 "운영 자동화 · 시스템 6종 · 기획·구축·운영 100%"에 있는 사실이다 — 새 사실을 만들지 않는다)
  문서 정보의 주제 "… | 2026.10" → "… | 2026.11"

덱 PDF 는 태그 PDF 다(README "포트폴리오 PDF" — 문단마다 MCID 로 구조 트리에 이어져 있다). 그래서 글자를 지우고 쪽 끝에
덧붙이지 않고(그러면 새 글자가 태그 밖에 놓여 화면낭독기 · 텍스트 추출에서 빠지거나 순서가 밀린다), 내용 스트림에서 옛 글자의
BT…ET 묶음을 같은 표시 구간(BDC…EMC) 안에서 새 글자 묶음으로 바꾼다. 배경 · 선 · 그림은 건드리지 않는다.
새 글자는 Pretendard 원본을 쓸 글자만 남겨 서브셋한 글꼴(Type0 · Identity-H)로 쓴다.
끝에 확인: 모든 쪽 글자에 연수 표기 0, 고친 줄 그대로, 줄바꿈 없는 공백 0, 고칠 쪽이 아닌 쪽 글자 그대로,
고친 쪽의 MCID 별 글자가 고친 구간만 바뀌었는지(태그 밖 글자 0), 구조 트리 · 언어 · 문서 정보.
"""
import re
import sys
import tempfile
from pathlib import Path

import pymupdf
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONTS = {
    "Pretendard-Regular": "Pretendard-Regular.woff2",
    "Pretendard-SemiBold": "Pretendard-SemiBold.woff2",
    "Pretendard-Black": "Pretendard-Black.woff2",
}
# (쪽 번호(0부터), 원래 글자, 새 글자) — 원래 글자는 이어진 BT 묶음들의 글자를 합친 것과 같아야 한다(공백은 무시)
EDITS = [
    (0, "4년 동안 9개 업종 30여 개 브랜드의 검색·디스플레이·영상 광고를 운영했습니다.",
        "9개 업종 30여 개 브랜드의 검색·디스플레이·영상 광고를 운영했습니다."),
    (0, "퍼포먼스 마케터  |  경력 4년", "퍼포먼스 마케터"),
    (1, "퍼포먼스 마케터  |  경력 4년", "퍼포먼스 마케터"),
    (2, "경력", "운영 자동화"),
    (2, "4", "6"),
    (2, "년", "종"),
    (2, "2022.09 – 현재", "기획·구축·운영 100%"),
]
TILE_EDITS = {"경력", "4", "년", "2022.09 – 현재"}  # 3쪽에서 같은 글자가 다른 곳에도 있어 첫 칸 안에서만 찾는다


def in_tile(bbox):
    return 115 < bbox[1] < 205 and bbox[0] < 120


SUBJECT = ("| 2026.10", "| 2026.11")
YEARS = re.compile(r"경력\s*\d+\s*년|\d+\s*년\s*동안")
SPACE = re.compile(r"\s+")

# ---------------------------------------------------------------- 내용 스트림 읽기

_TOKEN = re.compile(rb"""
    (?P<ws>[\x00\t\n\x0c\r ]+)
  | (?P<comment>%[^\r\n]*)
  | (?P<dict><<|>>)
  | (?P<hex><[0-9A-Fa-f\x00\t\n\x0c\r ]*>)
  | (?P<arr>[\[\]{}])
  | (?P<name>/[^\x00\t\n\x0c\r ()<>\[\]{}/%]*)
  | (?P<lit>\()
  | (?P<word>[^\x00\t\n\x0c\r ()<>\[\]{}/%]+)
""", re.X)
_NUMBER = re.compile(rb"[+-]?(\d+\.?\d*|\.\d+)$")


def tokens(raw):
    """(종류, 바이트, 시작, 끝). 연산자는 종류 'op'. 문자열 안의 BT · ET 같은 글자는 연산자로 세지 않는다."""
    out, pos = [], 0
    while pos < len(raw):
        m = _TOKEN.match(raw, pos)
        if not m:
            raise SystemExit(f"내용 스트림을 읽지 못했다(위치 {pos})")
        kind = m.lastgroup
        if kind == "lit":  # 괄호 문자열 — 짝 괄호와 역슬래시를 따라간다
            depth, i = 0, pos
            while True:
                c = raw[i:i + 1]
                if c == b"\\":
                    i += 2
                    continue
                if c == b"(":
                    depth += 1
                elif c == b")":
                    depth -= 1
                    if depth == 0:
                        break
                i += 1
            out.append(("str", raw[pos:i + 1], pos, i + 1))
            pos = i + 1
            continue
        if kind == "word":
            word = m.group()
            kind = "num" if _NUMBER.match(word) else ("const" if word in (b"true", b"false", b"null") else "op")
        if kind not in ("ws", "comment"):
            out.append((kind, m.group(), m.start(), m.end()))
        pos = m.end()
    return out


def text_groups(raw):
    """BT…ET 묶음 목록. 묶음마다 바이트 범위, 감싼 q … rg … Q 범위, 들어 있는 MCID, Td · Tf 값."""
    toks = tokens(raw)
    ops = [i for i, t in enumerate(toks) if t[0] == "op"]
    groups, stack, bt = [], [], None
    for n, i in enumerate(ops):
        op = toks[i][1]
        if op == b"BDC":
            prev = toks[ops[n - 1]][3] if n else 0
            m = re.search(rb"/MCID\s+(\d+)", raw[prev:toks[i][2]])
            stack.append(int(m.group(1)) if m else None)
        elif op == b"BMC":
            stack.append(None)
        elif op == b"EMC":
            stack.pop()
        elif op == b"BT":
            bt = n
        elif op == b"ET":
            g = {"bt": toks[ops[bt]][2], "et": toks[i][3], "mcid": next((x for x in reversed(stack) if x is not None), None)}
            g["ws"], g["we"] = g["bt"], g["et"]
            # q <색> rg BT … ET Q 로 감싸였으면 지울 때 통째로 지운다
            if bt >= 2 and toks[ops[bt - 1]][1] in (b"rg", b"g", b"k", b"sc", b"scn") and toks[ops[bt - 2]][1] == b"q" \
                    and n + 1 < len(ops) and toks[ops[n + 1]][1] == b"Q":
                g["ws"], g["we"] = toks[ops[bt - 2]][2], toks[ops[n + 1]][3]
            inner = toks[ops[bt] + 1:i]
            for k, t in enumerate(inner):
                if t[0] == "op" and t[1] == b"Td" and "td" not in g:
                    g["td"] = (inner[k - 2][1], inner[k - 1][1])
                if t[0] == "op" and t[1] == b"Tf" and "tf" not in g:
                    g["tf"] = (inner[k - 2][1], inner[k - 1][1])
            groups.append(g)
            bt = None
    if stack:
        raise SystemExit("표시 구간(BDC/EMC) 짝이 맞지 않는다")
    return groups


def spans_of(page):
    for block in page.get_text("dict")["blocks"]:
        for line in block.get("lines", []):
            yield from line["spans"]


def read_groups(doc, pno):
    """쪽의 BT 묶음마다 글자 · 상자 · 첫 span 을 붙인다 — 그 묶음만 남긴 스트림으로 바꿔 읽고 되돌린다."""
    page = doc[pno]
    conts = page.get_contents()
    if len(conts) != 1:
        raise SystemExit(f"{pno + 1}쪽 내용 스트림이 {len(conts)}개다 — 하나일 때만 고친다")
    xref = conts[0]
    raw = doc.xref_stream(xref)
    groups = text_groups(raw)
    for k, g in enumerate(groups):
        parts, pos = [], 0
        for j, h in enumerate(groups):
            if j != k:
                parts.append(raw[pos:h["bt"]])
                pos = h["et"]
        parts.append(raw[pos:])
        doc.update_stream(xref, b"".join(parts))
        sp = list(spans_of(page))  # 스트림을 바꾸면 같은 page 로 다시 읽어도 새 내용이 나온다
        g["text"] = "".join(s["text"] for s in sp)
        g["span"] = sp[0] if sp else None
        g["bbox"] = pymupdf.Rect(sp[0]["bbox"]) if sp else None
        for s in sp[1:]:
            g["bbox"] |= pymupdf.Rect(s["bbox"])
    doc.update_stream(xref, raw)
    return xref, raw, groups


def mcid_texts(groups):
    out = {}
    for g in groups:
        if g["text"].strip():
            out[g["mcid"]] = out.get(g["mcid"], "") + SPACE.sub("", g["text"])
    return out


# ---------------------------------------------------------------- 새 글꼴

def ttf_files(tmp, text):
    """새로 쓸 글자만 담은 TTF. Pretendard 는 U+0020 과 U+00A0 이 같은 글리프라, 통째로 넣으면 PDF 에서 띄어쓰기가
    줄바꿈 없는 공백(U+00A0)으로 읽힌다 — 쓸 글자만 남겨 글리프마다 문자가 하나가 되게 한다."""
    out = {}
    for name, woff2 in FONTS.items():
        font = TTFont(ROOT / "public" / "fonts" / "original" / woff2)
        font.flavor = None
        opts = subset.Options()
        opts.layout_features = []
        opts.notdef_outline = True
        opts.name_IDs = ["*"]
        sub = subset.Subsetter(options=opts)
        sub.populate(text=text)
        sub.subset(font)
        path = Path(tmp) / f"{name}.ttf"
        font.save(path)
        out[name] = (path, TTFont(path))
    return out


def gids_hex(font, text):
    cmap = font.getBestCmap()
    return "".join(f"{font.getGlyphID(cmap[ord(ch)]):04X}" for ch in text).encode()


def advance(font, char, size):
    return font["hmtx"][font.getBestCmap()[ord(char)]][0] * size / font["head"].unitsPerEm


def resname(font_name):
    return "Ksi" + re.sub(r"[^A-Za-z0-9]", "", font_name)


# ---------------------------------------------------------------- 고치기

def find_run(groups, pno, old):
    target = SPACE.sub("", old)
    runs = []
    for i in range(len(groups)):
        acc, j = "", i
        while j < len(groups) and len(acc) < len(target):
            acc += SPACE.sub("", groups[j]["text"])
            j += 1
        if acc == target and SPACE.sub("", groups[i]["text"]):
            run = groups[i:j]
            if pno == 2 and old in TILE_EDITS and not all(g["bbox"] and in_tile(g["bbox"]) for g in run if g["text"].strip()):
                continue
            runs.append(run)
    if len(runs) != 1:
        raise SystemExit(f"{pno + 1}쪽 '{old}' 를 정확히 하나 찾지 못했다({len(runs)}개) — 덱이 바뀌었으면 EDITS 를 고친다")
    return runs[0]


def main(src, dst):
    doc = pymupdf.open(src)
    before = [p.get_text() for p in doc]
    pages = sorted({p for p, _, _ in EDITS})
    read = {pno: read_groups(doc, pno) for pno in pages}
    old_mcids = {pno: mcid_texts(read[pno][2]) for pno in pages}
    expect_mcid = {pno: dict(old_mcids[pno]) for pno in pages}

    with tempfile.TemporaryDirectory() as tmp:
        fonts = ttf_files(tmp, "".join(new for _, _, new in EDITS))
        plan = {pno: [] for pno in pages}  # (run, new)
        for pno, old, new in EDITS:
            run = find_run(read[pno][2], pno, old)
            if any("td" not in g or "tf" not in g for g in run[:1]):
                raise SystemExit(f"{pno + 1}쪽 '{old}' 묶음에 Td · Tf 가 없다")
            plan[pno].append((run, new))

        # 3쪽 단위 글자('종')는 새 숫자 폭만큼 옮긴다(옛 숫자 끝과 단위 사이 간격은 그대로)
        num_run = next(r for r, n in plan[2] if n == "6")
        unit_run = next(r for r, n in plan[2] if n == "종")
        num_span, unit_span = num_run[0]["span"], unit_run[0]["span"]
        gap = unit_span["origin"][0] - num_span["bbox"][2]
        unit_x = num_span["origin"][0] + advance(fonts[num_span["font"]][1], "6", num_span["size"]) + gap

        for pno in pages:
            xref, raw, groups = read[pno]
            page = doc[pno]
            for weight in sorted({run[0]["span"]["font"] for run, _ in plan[pno]}):
                page.insert_font(fontname=resname(weight), fontfile=str(fonts[weight][0]))
            cuts = []  # (시작, 끝, 바꿀 바이트)
            for run, new in plan[pno]:
                first = run[0]
                weight = first["span"]["font"]
                x, y = first["td"]
                if new == "종":
                    x = f"{unit_x:.3f}".encode()
                block = b"BT\n" + x + b" " + y + b" Td /" + resname(weight).encode() + b" " + first["tf"][1] + b" Tf<" \
                    + gids_hex(fonts[weight][1], new) + b">Tj\nET"
                cuts.append((first["bt"], first["et"], block))
                for g in run[1:]:
                    cuts.append((g["ws"], g["we"], b""))
                if len({g["mcid"] for g in run}) != 1 or first["mcid"] is None:
                    raise SystemExit(f"{pno + 1}쪽 '{new}' 자리의 옛 글자가 한 표시 구간 안에 있지 않다 — 태그를 지키며 바꿀 수 없다")
                mc = first["mcid"]
                expect_mcid[pno][mc] = expect_mcid[pno][mc].replace(SPACE.sub("", "".join(g["text"] for g in run)), SPACE.sub("", new), 1)
            cuts.sort()
            out, pos = [], 0
            for a, b, rep in cuts:
                if a < pos:
                    raise SystemExit(f"{pno + 1}쪽 고칠 곳이 겹친다")
                out += [raw[pos:a], rep]
                pos = b
            out.append(raw[pos:])
            doc.update_stream(xref, b"".join(out))

        meta = doc.metadata
        if SUBJECT[0] in (meta.get("subject") or ""):
            meta["subject"] = meta["subject"].replace(*SUBJECT)
        doc.set_metadata(meta)
        doc.save(dst, garbage=3, deflate=True)

    check(src, dst, before, pages, expect_mcid)


def check(src, dst, before, pages, expect_mcid):
    out = pymupdf.open(dst)
    after = [p.get_text() for p in out]
    problems = []
    for i, text in enumerate(after):
        if YEARS.search(text):
            problems.append(f"{i + 1}쪽에 연수 표기가 남았다: {YEARS.search(text).group(0)}")
    expected = {0: ["9개 업종 30여 개 브랜드의 검색·디스플레이·영상 광고를 운영했습니다.", "퍼포먼스 마케터"], 1: ["퍼포먼스 마케터"]}
    for i, words in expected.items():
        lines = [s["text"] for s in spans_of(out[i])]
        for w in words:
            if w not in lines:
                problems.append(f"{i + 1}쪽에 '{w}' 줄이 없다(띄어쓰기까지 같아야 한다)")
    if "\xa0" in "".join(after[:3]):
        problems.append("1–3쪽에 줄바꿈 없는 공백이 생겼다")
    # 3쪽 첫 칸 — 같은 쪽 표에도 '운영 자동화'가 있으므로 칸 안의 글자만 본다
    tile = pymupdf.Rect(40, 115, 200, 205)
    tile_text = [s["text"] for s in spans_of(out[2]) if tile.contains(pymupdf.Rect(s["bbox"]))]
    if tile_text != ["운영 자동화", "6", "종", "기획·구축·운영 100%"]:
        problems.append(f"3쪽 첫 칸 글자가 예상과 다르다: {tile_text}")
    for i in range(len(before)):
        if i not in pages and before[i] != after[i]:
            problems.append(f"{i + 1}쪽 글자가 바뀌었다(고칠 쪽이 아니다)")
    if len(out) != len(before):
        problems.append("쪽 수가 달라졌다")
    # 태그 — 고친 쪽의 MCID 별 글자가 고친 구간만 바뀌었고, 표시 구간 밖 글자가 없다
    for pno in pages:
        _, _, groups = read_groups(out, pno)
        got = mcid_texts(groups)
        if None in got:
            problems.append(f"{pno + 1}쪽에 태그 밖 글자가 있다: {got[None][:40]}")
        for mc in sorted(set(got) | set(expect_mcid[pno]), key=lambda v: -1 if v is None else v):
            if got.get(mc) != expect_mcid[pno].get(mc):
                problems.append(f"{pno + 1}쪽 MCID {mc} 글자가 예상과 다르다: {got.get(mc, '')[:40]!r} ≠ {expect_mcid[pno].get(mc, '')[:40]!r}")
        for f in out[pno].get_fonts():
            if f[4].startswith("Ksi") and f[1] != "ttf":
                problems.append(f"{pno + 1}쪽 새 글꼴 {f[4]} 이 내장되지 않았다")
    cat = out.pdf_catalog()
    if out.xref_get_key(cat, "StructTreeRoot")[0] != "xref" or "Marked true" not in out.xref_get_key(cat, "MarkInfo")[1] \
            or out.xref_get_key(cat, "Lang")[1] != "ko-KR":
        problems.append("구조 트리 · MarkInfo · 문서 언어(ko-KR) 중 빠진 것이 있다")
    if SUBJECT[1] not in (out.metadata.get("subject") or ""):
        problems.append(f"문서 정보 주제에 '{SUBJECT[1]}' 이 없다")
    if problems:
        raise SystemExit("검사 실패:\n  " + "\n  ".join(problems))
    print(f"고쳤다: {dst} · {len(out)}쪽 · 1–3쪽만 바뀜 · 연수 표기 0 · 고친 글자는 원래 MCID 안 · 태그 밖 글자 0")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
