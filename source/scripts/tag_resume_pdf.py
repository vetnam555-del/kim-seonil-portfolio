"""공개 이력서 PDF 에 접근성 태그(구조 트리)를 붙인다 (2026.11.15 B-05).

    python3 scripts/tag_resume_pdf.py <입력.pdf> <출력.pdf>

ReportLab(print_resume_reportlab.py)은 태그 PDF 를 만들지 못한다. 그림은 그대로 두고 쪽의 그리기 명령을
표시 구간(marked content)으로 감싼 뒤 구조 트리를 단다 — 화면 낭독기 · 지원 시스템이 제목과 문단을 순서대로 읽는다.
  · 글 덩어리(BT … ET) 하나 = 요소 하나. ReportLab 은 문단 하나를 BT 하나로 그린다.
    굵은 25pt → H1(이름) · 굵은 17pt → H2(큰 장) · 굵은 12pt → H3(장 · 회사 · 프로젝트), 다만 이름 바로 아래 한 줄(직함)은 P · 나머지 P.
  · 쪽 아래 머리줄(8pt · 이름 | 문서명 | 날짜 · 쪽 번호)과 선 · 빈 글 덩어리는 장식(Artifact).
  · 사진(XObject Do)은 Figure + 대체 글.
그리는 명령의 순서 · 값은 바꾸지 않는다 — 앞뒤로 BDC/BMC … EMC 만 끼운다. 끝에 쪽마다 그림이 같고 글이 같은지 확인한다.
문서 언어(/Lang ko-KR)는 ReportLab 출력에 이미 있다.
"""
import re
import sys

import pymupdf

PHOTO_ALT = "김선일 프로필 사진"


def scan(stream: bytes):
    """그리기 명령에서 BT · ET · Do 연산자의 위치를 찾는다 — 문자열 · 사전 · 주석 안은 건너뛴다."""
    i, n = 0, len(stream)
    ops = []
    delim = b"()<>[]{}/%"
    ws = b" \t\r\n\f\x00"
    while i < n:
        c = stream[i:i + 1]
        if c in (b" ", b"\t", b"\r", b"\n", b"\f", b"\x00"):
            i += 1
        elif c == b"%":
            while i < n and stream[i:i + 1] not in (b"\r", b"\n"):
                i += 1
        elif c == b"(":
            depth, i = 1, i + 1
            while i < n and depth:
                ch = stream[i:i + 1]
                if ch == b"\\":
                    i += 2
                    continue
                if ch == b"(":
                    depth += 1
                elif ch == b")":
                    depth -= 1
                i += 1
        elif c == b"<":
            if stream[i:i + 2] == b"<<":
                i += 2
            else:
                j = stream.index(b">", i)
                i = j + 1
        elif c == b">":
            i += 2 if stream[i:i + 2] == b">>" else 1
        elif c in (b"[", b"]", b"{", b"}"):
            i += 1
        elif c == b"/":
            i += 1
            while i < n and stream[i:i + 1] not in ws and stream[i:i + 1] not in delim:
                i += 1
        else:
            j = i
            while j < n and stream[j:j + 1] not in ws and stream[j:j + 1] not in delim:
                j += 1
            tok = stream[i:j]
            if tok in (b"BT", b"ET", b"Do", b"BI"):
                if tok == b"BI":
                    raise SystemExit("인라인 그림(BI)은 다루지 않는다")
                ops.append((tok, i, j))
            i = j if j > i else i + 1
    return ops


def segments(stream: bytes):
    """[(kind, bytes)] — kind: 'text' (BT..ET), 'image' (… Do), 'other'."""
    ops = scan(stream)
    out, pos, k = [], 0, 0
    while k < len(ops):
        tok, s, e = ops[k]
        if tok == b"BT":
            end = next(o for o in ops[k + 1:] if o[0] == b"ET")
            if s > pos:
                out.append(("other", stream[pos:s]))
            out.append(("text", stream[s:end[2]]))
            pos = end[2]
            k = ops.index(end) + 1
        elif tok == b"Do":
            # 'Do' 앞의 이름(/FormXob…)부터 감싼다
            line_start = stream.rfind(b"/", 0, s)
            if line_start > pos:
                out.append(("other", stream[pos:line_start]))
            out.append(("image", stream[line_start:e]))
            pos = e
            k += 1
        else:
            k += 1
    if pos < len(stream):
        out.append(("other", stream[pos:]))
    return out


def classify(text: bytes, prev_role):
    m = re.search(rb"/(F\d+)\+?\d*\s+([\d.]+)\s+Tf", text)
    if not re.search(rb"\)\s*Tj|\]\s*TJ|>\s*Tj", text):
        return None  # 빈 글 덩어리
    font, size = (m.group(1).decode(), float(m.group(2))) if m else ("", 0)
    if size <= 8.5:
        return None  # 쪽 아래 머리줄 · 쪽 번호
    bold = font == "F3"
    if bold and size >= 24:
        return "H1"
    if bold and size >= 16:
        return "H2"
    if bold and size >= 11.5:
        return "P" if prev_role == "H1" else "H3"
    return "P"


def main(src, dst):
    doc = pymupdf.open(src)
    before_text = [p.get_text() for p in doc]
    before_pix = [p.get_pixmap(dpi=72).samples for p in doc]
    cat = doc.pdf_catalog()
    if doc.xref_get_key(cat, "StructTreeRoot")[0] != "null":
        raise SystemExit("이미 구조 트리가 있다")

    root = doc.get_new_xref()
    doc_elem = doc.get_new_xref()
    parent_tree_nums = []
    kids = []
    prev_role = None
    for pno, page in enumerate(doc):
        page.clean_contents(sanitize=False)  # 내용 스트림을 하나로 모은다(그림은 그대로)
        cx = page.get_contents()[0]
        stream = doc.xref_stream(cx)
        parts, mcid, page_elems = [], 0, []
        for kind, chunk in segments(stream):
            role = classify(chunk, prev_role) if kind == "text" else ("Figure" if kind == "image" else None)
            if role is None:
                if chunk.strip():
                    parts.append(b"/Artifact BMC\n" + chunk + b"\nEMC\n")
                else:
                    parts.append(chunk)
                continue
            el = doc.get_new_xref()
            alt = " /Alt <FEFF" + PHOTO_ALT.encode("utf-16-be").hex().upper() + ">" if role == "Figure" else ""
            doc.update_object(el, f"<< /Type /StructElem /S /{role} /P {doc_elem} 0 R /Pg {page.xref} 0 R /K {mcid}{alt} >>")
            parts.append(f"/{role} <</MCID {mcid}>> BDC\n".encode() + chunk + b"\nEMC\n")
            page_elems.append(el)
            kids.append(el)
            mcid += 1
            if role != "Figure":
                prev_role = role
        doc.update_stream(cx, b"".join(parts))
        doc.xref_set_key(page.xref, "StructParents", str(pno))
        doc.xref_set_key(page.xref, "Tabs", "/S")
        parent_tree_nums.append(f"{pno} [{' '.join(f'{x} 0 R' for x in page_elems)}]")

    doc.update_object(doc_elem, f"<< /Type /StructElem /S /Document /P {root} 0 R /K [{' '.join(f'{x} 0 R' for x in kids)}] >>")
    doc.update_object(root, f"<< /Type /StructTreeRoot /K {doc_elem} 0 R /ParentTree << /Nums [{' '.join(parent_tree_nums)}] >> /ParentTreeNextKey {doc.page_count} >>")
    doc.xref_set_key(cat, "StructTreeRoot", f"{root} 0 R")
    doc.xref_set_key(cat, "MarkInfo", "<< /Marked true >>")
    doc.xref_set_key(cat, "ViewerPreferences", "<< /DisplayDocTitle true >>")
    doc.save(dst, garbage=3, deflate=True)

    out = pymupdf.open(dst)
    assert out.page_count == len(before_text), "쪽 수가 달라졌다"
    for i, p in enumerate(out):
        assert p.get_text() == before_text[i], f"{i + 1}쪽 글이 달라졌다"
        assert p.get_pixmap(dpi=72).samples == before_pix[i], f"{i + 1}쪽 그림이 달라졌다"
    print(f"태그 완료 — {out.page_count}쪽 · 요소 {len(kids)}개 {tag_summary(out)} · 그림 · 글 같음")


def tag_summary(doc):
    """저장된 파일의 구조 트리를 다시 읽어 요소 종류별 수를 센다 — 태그가 실제로 들어갔는지 확인한다."""
    cat = doc.pdf_catalog()
    t, v = doc.xref_get_key(cat, "StructTreeRoot")
    if t != "xref" or "Marked true" not in doc.xref_get_key(cat, "MarkInfo")[1]:
        raise SystemExit("구조 트리 · MarkInfo 가 없다")
    root = int(v.split()[0])
    top = int(doc.xref_get_key(root, "K")[1].split()[0])
    refs = re.findall(r"(\d+) 0 R", doc.xref_get_key(top, "K")[1])
    roles = {}
    for r in refs:
        s = doc.xref_get_key(int(r), "S")[1].lstrip("/")
        roles[s] = roles.get(s, 0) + 1
    return roles


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
