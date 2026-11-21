"""
포트폴리오 PDF(덱)를 2026-11-20 · 11-21 에 주인이 확인한 사실에 맞추는 수선.

  python3 scripts/patch_deck_1121.py <원래 덱.pdf> <고친 덱.pdf>

  · 20쪽 생활백서 · 후지필름BI 담당 기간 "2024.09 – 2025.03" → "2024.09 – 2025.10"
    (2026-11-21 주인 "생활백서랑 후지필름도 25년 10월까지 담당했어" — 사이트 projects.ts otherResults 와 같은 값)
  · 뉴발란스 '월 10억+' → '월 5~10억+', '계정 운영 40%' → '30%' (2026-11-20 주인 확정 · 사이트는 #48 에서 바뀌었다)
      3쪽 AT A GLANCE 칸 "월 10억" → "월 5~10억" — 뒤의 '+'(다른 굵기 · 다른 묶음)를 늘어난 폭만큼 오른쪽으로 민다
      7쪽 "계정 운영 40%(월 10억+ 규모 팀 운영 계정) · …" · 8 · 9쪽 머리줄 "운영 40%" → 30%
  같은 쪽 다른 칸의 40%(다이슨 · KT알파쇼핑 등)는 그 브랜드의 기여도라 그대로 둔다.

방식은 patch_deck_edith.py 와 같다 — 원래 MCID 안에서 글자만 바꾸고(굵기 · 크기 · 기준선 그대로), 끝에 바뀐 쪽 ·
옛 글자 · 오른쪽 한계 · 태그 밖 글자 · 구조 트리를 확인한 뒤에만 파일을 쓴다.
덱 PDF 는 공개 저장소에 두지 않는다(헤드헌터에게만 Drive 로) — 경로를 받아서만 돈다.
"""
import re
import sys
import tempfile
from pathlib import Path

import pymupdf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from patch_deck_no_years import (  # noqa: E402
    SPACE, advance, gids_hex, mcid_texts, read_groups, spans_of, ttf_files,
)

PREFIX = "Kse1121"  # 앞선 수선(Ksi · Kse1117)과 다른 이름이어야 옛 서브셋을 다시 쓰지 않는다


def resname(font_name):
    return PREFIX + re.sub(r"[^A-Za-z0-9]", "", font_name)


# (쪽 번호(0부터), 원래 글자, 새 글자, 원래 글자의 왼쪽 x(같은 글자가 쪽에 둘 이상일 때 고른다), 오른쪽 한계 x(pt))
EDITS = [
    (2, "월 10억", "월 5~10억", 489, 700),
    (6, "계정 운영 40%(월 10억+ 규모 팀 운영 계정) · 자동화 설계·구축 100%",
        "계정 운영 30%(월 5~10억+ 규모 팀 운영 계정) · 자동화 설계·구축 100%", 508, 930),
    (7, "2025.11 – 2026.09 | 운영 40% · 자동화 100%", "2025.11 – 2026.09 | 운영 30% · 자동화 100%", 699, 930),
    (8, "2025.11 – 2026.09 | 운영 40% · 자동화 100%", "2025.11 – 2026.09 | 운영 30% · 자동화 100%", 699, 930),
    (19, "2024.09 – 2025.03", "2024.09 – 2025.10", 60, 350),
    (19, "2024.09 – 2025.03", "2024.09 – 2025.10", 358, 545),
]
# 3쪽 '+' 는 '월 10억' 바로 오른쪽 묶음이다 — 늘어난 폭만큼 민다. 다음 칸('2' 년 연속)은 x 712 에서 시작한다.
PLUS = (2, "+", 595, 705)
STALE = ["월 10억", "운영 40% · 자동화", "계정 운영 40%", "2025.03"]


def find(groups, pno, old, x):
    target = SPACE.sub("", old)
    runs = []
    for i in range(len(groups)):
        acc, j = "", i
        while j < len(groups) and len(acc) < len(target):
            acc += SPACE.sub("", groups[j]["text"])
            j += 1
        if acc == target and SPACE.sub("", groups[i]["text"]) and abs(groups[i]["bbox"].x0 - x) < 3:
            runs.append(groups[i:j])
    if len(runs) != 1:
        raise SystemExit(f"{pno + 1}쪽 x≈{x} 의 '{old}' 를 정확히 하나 찾지 못했다({len(runs)}개)")
    return runs[0]


def main(src, dst):
    doc = pymupdf.open(src)
    before = [p.get_text() for p in doc]
    pages = sorted({p for p, *_ in EDITS})
    read = {pno: read_groups(doc, pno) for pno in pages}
    expect_mcid = {pno: dict(mcid_texts(read[pno][2])) for pno in pages}

    with tempfile.TemporaryDirectory() as tmp:
        fonts = ttf_files(tmp, "".join(new for _, _, new, _, _ in EDITS))
        plan = {pno: [] for pno in pages}
        for pno, old, new, x, _ in EDITS:
            run = find(read[pno][2], pno, old, x)
            if "td" not in run[0] or "tf" not in run[0]:
                raise SystemExit(f"{pno + 1}쪽 '{old}' 묶음에 Td · Tf 가 없다")
            if len({g["mcid"] for g in run}) != 1 or run[0]["mcid"] is None:
                raise SystemExit(f"{pno + 1}쪽 '{old}' 가 한 표시 구간 안에 있지 않다 — 태그를 지키며 바꿀 수 없다")
            plan[pno].append((run, old, new))

        for pno in pages:
            xref, raw, groups = read[pno]
            page = doc[pno]
            for weight in sorted({run[0]["span"]["font"] for run, _, _ in plan[pno]}):
                if weight not in fonts:
                    raise SystemExit(f"{pno + 1}쪽 글꼴 {weight} 은 준비한 굵기에 없다")
                page.insert_font(fontname=resname(weight), fontfile=str(fonts[weight][0]))
            cuts = []
            for run, old, new in plan[pno]:
                first = run[0]
                weight = first["span"]["font"]
                x, y = first["td"]
                block = b"BT\n" + x + b" " + y + b" Td /" + resname(weight).encode() + b" " + first["tf"][1] + b" Tf<" \
                    + gids_hex(fonts[weight][1], new) + b">Tj\nET"
                cuts.append((first["bt"], first["et"], block))
                for g in run[1:]:
                    cuts.append((g["ws"], g["we"], b""))
                mc = first["mcid"]
                expect_mcid[pno][mc] = expect_mcid[pno][mc].replace(SPACE.sub("", "".join(g["text"] for g in run)), SPACE.sub("", new), 1)
                if pno == PLUS[0] and old == "월 10억":
                    size = float(first["tf"][1])
                    font = fonts[weight][1]
                    grow = sum(advance(font, c, size) for c in new) - sum(advance(font, c, size) for c in old)
                    plus = find(groups, pno, PLUS[1], PLUS[2])[0]
                    seg = raw[plus["bt"]:plus["et"]]
                    px, py = plus["td"]
                    old_td = px + b" " + py + b" Td"
                    if seg.count(old_td) != 1:
                        raise SystemExit("3쪽 '+' 의 Td 를 찾지 못했다")
                    new_x = f"{float(px) + grow:.2f}".encode()
                    cuts.append((plus["bt"], plus["et"], seg.replace(old_td, new_x + b" " + py + b" Td")))
            cuts.sort()
            out, pos = [], 0
            for a, b, rep in cuts:
                if a < pos:
                    raise SystemExit(f"{pno + 1}쪽 고칠 곳이 겹친다")
                out += [raw[pos:a], rep]
                pos = b
            out.append(raw[pos:])
            doc.update_stream(xref, b"".join(out))
        doc.save(dst, garbage=3, deflate=True)

    check(dst, before, pages, expect_mcid)


def check(dst, before, pages, expect_mcid):
    out = pymupdf.open(dst)
    after = [p.get_text() for p in out]
    problems = []
    if len(out) != len(before):
        problems.append("쪽 수가 달라졌다")
    for i in range(min(len(before), len(after))):
        if i not in pages and before[i] != after[i]:
            problems.append(f"{i + 1}쪽 글자가 바뀌었다(고칠 쪽이 아니다)")
    for pno in pages:
        for s in STALE:
            if s in after[pno]:
                problems.append(f"{pno + 1}쪽에 옛 글자가 남았다: {s}")
    for pno, _, new, x, right in EDITS:
        hit = [s for s in spans_of(out[pno]) if s["text"] == new and abs(s["bbox"][0] - x) < 3]
        if len(hit) != 1:
            problems.append(f"{pno + 1}쪽 x≈{x} 에 '{new}' 줄이 정확히 하나 있어야 한다({len(hit)}개)")
        elif hit[0]["bbox"][2] > right:
            problems.append(f"{pno + 1}쪽 '{new[:14]}…' 이 오른쪽 한계 {right}pt 를 넘는다({hit[0]['bbox'][2]:.1f}pt)")
    num = [s for s in spans_of(out[PLUS[0]]) if s["text"] == "월 5~10억"]
    plus = [s for s in spans_of(out[PLUS[0]]) if s["text"] == "+" and abs(s["bbox"][1] - 161) < 4]
    if len(num) != 1 or len(plus) != 1:
        problems.append("3쪽 '월 5~10억' 과 '+' 를 찾지 못했다")
    elif not (-1 < plus[0]["bbox"][0] - num[0]["bbox"][2] < 2 and plus[0]["bbox"][2] < PLUS[3]):
        problems.append(f"3쪽 '+' 자리가 어긋났다(숫자 끝 {num[0]['bbox'][2]:.1f} · '+' {plus[0]['bbox'][0]:.1f}–{plus[0]['bbox'][2]:.1f})")
    if "\xa0" in "".join(after[p] for p in pages):
        problems.append("고친 쪽에 줄바꿈 없는 공백이 생겼다")
    for pno in pages:
        _, _, groups = read_groups(out, pno)
        got = mcid_texts(groups)
        if None in got:
            problems.append(f"{pno + 1}쪽에 태그 밖 글자가 있다: {got[None][:40]}")
        for mc in sorted(set(got) | set(expect_mcid[pno]), key=lambda v: -1 if v is None else v):
            if got.get(mc) != expect_mcid[pno].get(mc):
                problems.append(f"{pno + 1}쪽 MCID {mc} 글자가 예상과 다르다: {got.get(mc, '')[:40]!r} ≠ {expect_mcid[pno].get(mc, '')[:40]!r}")
        for f in out[pno].get_fonts():
            if f[4].startswith(PREFIX) and f[1] != "ttf":
                problems.append(f"{pno + 1}쪽 새 글꼴 {f[4]} 이 내장되지 않았다")
    cat = out.pdf_catalog()
    if out.xref_get_key(cat, "StructTreeRoot")[0] != "xref" or "Marked true" not in out.xref_get_key(cat, "MarkInfo")[1] \
            or out.xref_get_key(cat, "Lang")[1] != "ko-KR":
        problems.append("구조 트리 · MarkInfo · 문서 언어(ko-KR) 중 빠진 것이 있다")
    if problems:
        raise SystemExit("검사 실패:\n  " + "\n  ".join(problems))
    print(f"고쳤다: {dst} · {len(out)}쪽 · {', '.join(str(p + 1) for p in pages)}쪽만 바뀜 · 옛 글자 0 · 고친 글자는 원래 MCID 안 · 태그 밖 글자 0")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
