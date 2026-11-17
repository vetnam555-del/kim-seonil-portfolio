"""
포트폴리오 PDF(덱)의 EDIT H 수치 · 역할 표기 · 맺음 제목을 사이트와 맞추는 수선 (2026-11-17).

주인 요청 "덱 pdf도 edit h 숫자 맞춰줘". 덱 원본(Drive `코덱스/portfolio-deck-v2` · pptxgenjs v3)을 다시 굽기 전까지
지금 PDF 의 그 줄만 고친다 — 다음에 원본으로 구울 때는 v3 원본에서 같은 곳을 고쳐야 한다(SKILL 7절).
덱 PDF 는 공개 저장소에 두지 않으므로(헤드헌터에게만 Drive 로) 경로를 받아서만 돈다.

  python3 scripts/patch_deck_edith.py <원래 덱.pdf> <고친 덱.pdf>

고치는 곳(글꼴 굵기 · 크기 · 색 · 기준선은 원래 글자 그대로 — patch_deck_no_years.py 와 같은 방식으로 원래 MCID 안에서 바꾼다):
  23쪽 수치   "공개 문서 114편 · 2026.10.15 VOL.114까지"  → "공개 문서 146편 · 2026.11.17 VOL.146까지"
              (edit-h-archive 21648c5 — 날짜 HTML 146개 · 마지막 호 VOL.146. 사이트 projects.ts edith 와 같은 값)
  23쪽 역할   "기획부터 편집·제작 파이프라인·발행까지 맡고 있습니다."
              → "기획·편집 기준·구축·운영을 맡고, 매일 제작은 이 기준을 따르는 AI 루틴이 합니다."
              (2026-11-12 사이트에서 바꾼 표기 — 매일 제작은 AI 루틴이 한다. 공개 아카이브의 런북과 어긋나지 않게)
  29쪽 제목   "가설을 세워 확인하며 함께 키웁니다." → "가설을 세워 확인하며 브랜드를 함께 키웁니다."
              (2026-11-12 사이트 연락 구간 제목과 같게 — 목적어가 없었다)
그대로 두는 곳: 23쪽 그림 두 장과 그 설명("2026.10.15 카드뉴스 10장" · "2026.10.15 뉴스레터(VOL.114)") — 그 호를 찍은 그림이다.
끝에 확인: 고친 줄 그대로 · 옛 줄 0 · 고칠 쪽이 아닌 쪽 글자 그대로 · 고친 쪽의 MCID 별 글자가 고친 구간만 바뀜(태그 밖 글자 0) ·
새 글자가 오른쪽 이웃 칸이나 쪽 밖으로 나가지 않음 · 구조 트리 · 언어.
"""
import re
import sys
import tempfile
from pathlib import Path

import pymupdf

sys.path.insert(0, str(Path(__file__).resolve().parent))
from patch_deck_no_years import (  # noqa: E402
    SPACE, find_run, gids_hex, mcid_texts, read_groups, spans_of, ttf_files,
)

PREFIX = "Kse1117"


def resname(font_name):
    """새 글꼴의 자원 이름. 2026.11 판에는 앞선 수선(patch_deck_no_years)이 넣은 'Ksi…' 글꼴이 이미 있다 —
    같은 이름으로 넣으면 PyMuPDF 가 그 옛 서브셋을 다시 써서 글리프 번호가 어긋난다(글자가 엉뚱하게 찍힌다). 이름을 달리한다."""
    return PREFIX + re.sub(r"[^A-Za-z0-9]", "", font_name)


# (쪽 번호(0부터), 원래 글자, 새 글자, 새 글자의 오른쪽 끝이 넘으면 안 되는 x(pt))
EDITS = [
    (22, "공개 문서 114편 · 2026.10.15 VOL.114까지", "공개 문서 146편 · 2026.11.17 VOL.146까지", 540),
    (22, "기획부터 편집·제작 파이프라인·발행까지 맡고 있습니다.",
         "기획·편집 기준·구축·운영을 맡고, 매일 제작은 이 기준을 따르는 AI 루틴이 합니다.", 540),
    (28, "가설을 세워 확인하며 함께 키웁니다.", "가설을 세워 확인하며 브랜드를 함께 키웁니다.", 916),
]
STALE = ["공개 문서 114편", "VOL.114까지", "제작 파이프라인·발행까지 맡고", "확인하며 함께 키웁니다"]


def main(src, dst):
    doc = pymupdf.open(src)
    before = [p.get_text() for p in doc]
    pages = sorted({p for p, *_ in EDITS})
    read = {pno: read_groups(doc, pno) for pno in pages}
    expect_mcid = {pno: dict(mcid_texts(read[pno][2])) for pno in pages}

    with tempfile.TemporaryDirectory() as tmp:
        fonts = ttf_files(tmp, "".join(new for _, _, new, _ in EDITS))
        plan = {pno: [] for pno in pages}
        for pno, old, new, _ in EDITS:
            run = find_run(read[pno][2], pno, old)
            if "td" not in run[0] or "tf" not in run[0]:
                raise SystemExit(f"{pno + 1}쪽 '{old}' 묶음에 Td · Tf 가 없다")
            plan[pno].append((run, new))

        for pno in pages:
            xref, raw, groups = read[pno]
            page = doc[pno]
            for weight in sorted({run[0]["span"]["font"] for run, _ in plan[pno]}):
                if weight not in fonts:
                    raise SystemExit(f"{pno + 1}쪽 글꼴 {weight} 은 준비한 굵기에 없다")
                page.insert_font(fontname=resname(weight), fontfile=str(fonts[weight][0]))
            cuts = []
            for run, new in plan[pno]:
                first = run[0]
                weight = first["span"]["font"]
                x, y = first["td"]
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
    whole = "".join(after)
    for s in STALE:
        if s in whole:
            problems.append(f"옛 글자가 남았다: {s}")
    for pno, _, new, right in EDITS:
        hit = [s for s in spans_of(out[pno]) if s["text"] == new]
        if len(hit) != 1:
            problems.append(f"{pno + 1}쪽에 '{new}' 줄이 정확히 하나 있어야 한다({len(hit)}개 · 띄어쓰기까지 같아야 한다)")
        elif hit[0]["bbox"][2] > right:
            problems.append(f"{pno + 1}쪽 '{new[:14]}…' 이 오른쪽 한계 {right}pt 를 넘는다({hit[0]['bbox'][2]:.1f}pt)")
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
    print(f"고쳤다: {dst} · {len(out)}쪽 · {', '.join(str(p + 1) for p in pages)}쪽만 바뀜 · 옛 수치 0 · 고친 글자는 원래 MCID 안 · 태그 밖 글자 0")


if __name__ == "__main__":
    if len(sys.argv) != 3:
        raise SystemExit(__doc__)
    main(sys.argv[1], sys.argv[2])
