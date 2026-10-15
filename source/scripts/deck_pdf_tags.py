"""LibreOffice 태그 PDF 의 구조 트리를 PowerPoint 내보내기 수준으로 보강한다 (finalize_v3.py 가 부른다).

LibreOffice 24.2 Impress 는 UseTaggedPDF 로 문단(P)·그림(Figure)·목록 태그는 만들지만
  · 슬라이드 구분 없이 모든 요소를 StructTreeRoot 바로 아래에 평평하게 놓고
  · 링크 주석을 구조 트리에 넣지 않으며(Link 태그·StructParent 없음)
  · 텍스트 없는 장식 도형을 Alt 없는 Figure 로 남긴다.
여기서 Document > Sect(슬라이드마다) 로 묶고, 링크 주석마다 Link 태그를 그 링크 글자가 든 문단 아래에 달고,
장식 도형 Figure 에 빈 Alt 를 넣는다(PowerPoint 내보내기와 같은 처리).

구조 요소의 위치는 MuPDF 의 TEXT_COLLECT_STRUCTURE 결과(struct idx = 부모 K 배열의 순번)로 찾고,
경로를 따라가며 태그 이름이 맞는지 확인한다 — 어긋나면 고치지 않고 멈춘다.
"""
import re

import pymupdf
from lxml import etree


def _tokens(arr):
    """K 배열 문자열 → [('ref', xref) | ('mcid', n) | ('dict', s)]"""
    out = []
    for tok in re.findall(r'<<.*?>>|\d+ 0 R|-?\d+', arr.strip()[1:-1]):
        if tok.startswith('<<'):
            out.append(('dict', tok))
        elif tok.endswith('R'):
            out.append(('ref', int(tok.split()[0])))
        else:
            out.append(('mcid', int(tok)))
    return out


def kids(doc, xref):
    t, v = doc.xref_get_key(xref, 'K')
    if t == 'int':
        return [('mcid', int(v))]
    if t == 'xref':
        return [('ref', int(v.split()[0]))]
    if t == 'array':
        return _tokens(v)
    if t == 'dict':
        return [('dict', v)]
    return []


def tag(doc, xref):
    t, v = doc.xref_get_key(xref, 'S')
    return v.lstrip('/') if t == 'name' else None


def root_of(doc):
    t, v = doc.xref_get_key(doc.pdf_catalog(), 'StructTreeRoot')
    if t != 'xref':
        raise SystemExit('태그 없음: StructTreeRoot 가 없다 (UseTaggedPDF 확인)')
    return int(v.split()[0])


def page_structs(page):
    """페이지의 구조 잎(leaf) 목록: [(경로 tuple, 태그 경로 tuple, Rect, 글자)]"""
    xml = page.get_text('xml', flags=pymupdf.TEXT_COLLECT_STRUCTURE | pymupdf.TEXT_PRESERVE_WHITESPACE)
    tree = etree.fromstring(xml.encode('utf8'))
    out = []

    def walk(el, path, tags):
        subs = [c for c in el if c.tag == 'struct']
        for c in subs:
            walk(c, path + (int(c.get('idx')),), tags + (c.get('raw'),))
        if el.tag == 'struct' and not subs:
            x0, y0, x1, y1 = (float(v) for v in el.get('bbox').split())
            txt = ''.join(ch.get('c', '') for ch in el.iter('char'))
            out.append((path, tags, pymupdf.Rect(x0, y0, x1, y1), txt))

    walk(tree, (), ())
    return out


def resolve(doc, root, path, tags):
    """root K 에서 경로를 따라 내려가 구조 요소 xref 를 돌려준다. 태그가 하나라도 어긋나면 멈춘다."""
    cur = root
    for idx, want in zip(path, tags):
        ks = kids(doc, cur)
        if idx >= len(ks) or ks[idx][0] != 'ref':
            raise SystemExit(f'구조 경로 불일치: {path} (idx {idx}, K {len(ks)})')
        cur = ks[idx][1]
        if tag(doc, cur) != want:
            raise SystemExit(f'구조 태그 불일치: {path} 기대 {want} 실제 {tag(doc, cur)}')
    return cur


def _nums_append(doc, pt, pairs):
    t, v = doc.xref_get_key(pt, 'Nums')
    if t != 'array':
        raise SystemExit('ParentTree 가 /Nums 배열이 아니다')
    add = ' '.join(f'{n} {x} 0 R' for n, x in pairs)
    doc.xref_set_key(pt, 'Nums', v.rstrip()[:-1] + ' ' + add + ']')


def _next_key(doc, pt):
    """/Nums [키 값 키 값 …] 에서 가장 큰 키 + 1. 값은 참조이거나 안쪽 배열이다."""
    t, v = doc.xref_get_key(pt, 'Nums')
    depth, expect_key, keys = 0, True, []
    for tok in re.findall(r'\[|\]|<<|>>|\d+ 0 R|-?\d+', v):
        if tok in ('[', '<<'):
            depth += 1
            if depth == 2 and tok == '[':
                expect_key = True  # 안쪽 배열 = 값 하나
            continue
        if tok in (']', '>>'):
            depth -= 1
            continue
        if depth == 1:
            if expect_key and not tok.endswith('R'):
                keys.append(int(tok))
                expect_key = False
            else:
                expect_key = True
    return max(keys) + 1 if keys else 0


def tag_links(doc, root, goto_titles):
    """링크 주석마다 Link 태그를 만들어 링크 글자가 든 문단 아래에 단다."""
    pt = int(doc.xref_get_key(root, 'ParentTree')[1].split()[0])
    n = _next_key(doc, pt)
    pairs, done = [], 0
    for page in doc:
        links = page.get_links()
        if not links:
            continue
        leaves = page_structs(page)
        for ln in links:
            ax = ln.get('xref')
            if not ax or doc.xref_get_key(ax, 'StructParent')[0] != 'null':
                continue
            r = pymupdf.Rect(ln['from'])
            best = max(leaves, key=lambda L: (L[2] & r).get_area() if L[2].intersects(r) else -1)
            if not best[2].intersects(r):
                raise SystemExit(f'{page.number + 1}쪽 링크 {ln.get("uri") or ln.get("page")} 에 겹치는 문단이 없다')
            parent = resolve(doc, root, best[0], best[1])
            lx = doc.get_new_xref()
            doc.update_object(lx, f'<</Type/StructElem/S/Link/P {parent} 0 R/Pg {page.xref} 0 R'
                                  f'/K[<</Type/OBJR/Obj {ax} 0 R/Pg {page.xref} 0 R>>]>>')
            t, v = doc.xref_get_key(parent, 'K')
            if t == 'array':
                doc.xref_set_key(parent, 'K', v.rstrip()[:-1] + f' {lx} 0 R]')
            elif t in ('int', 'xref', 'dict'):
                doc.xref_set_key(parent, 'K', f'[{v} {lx} 0 R]')
            else:
                doc.xref_set_key(parent, 'K', f'[{lx} 0 R]')
            doc.xref_set_key(ax, 'StructParent', str(n))
            if doc.xref_get_key(ax, 'Contents')[0] == 'null':
                label = (ln.get('uri') or '') if ln['kind'] == pymupdf.LINK_URI else goto_titles.get(ln.get('page', -1) + 1, '')
                if label:
                    doc.xref_set_key(ax, 'Contents', pymupdf.get_pdf_str(label))
            pairs.append((n, lx))
            n += 1
            done += 1
    if pairs:
        _nums_append(doc, pt, pairs)
    doc.xref_set_key(root, 'ParentTreeNextKey', str(n))
    return done


def wrap_sections(doc, root, titles):
    """StructTreeRoot 바로 아래 요소를 Document > Sect(쪽마다) 로 묶는다."""
    top = [x for k, x in kids(doc, root) if k == 'ref']
    groups = []
    for x in top:
        t, v = doc.xref_get_key(x, 'Pg')
        pg = int(v.split()[0]) if t == 'xref' else None
        if groups and groups[-1][0] == pg:
            groups[-1][1].append(x)
        else:
            groups.append((pg, [x]))
    page_no = {doc[i].xref: i + 1 for i in range(doc.page_count)}
    seen = [g[0] for g in groups]
    if len(set(seen)) != len(seen):
        raise SystemExit('구조 트리의 쪽 순서가 섞여 있다 — Sect 로 묶지 않는다')
    dx = doc.get_new_xref()
    sects = []
    for pg, members in groups:
        sx = doc.get_new_xref()
        title = titles.get(page_no.get(pg), '')
        t_entry = f'/T{pymupdf.get_pdf_str(title)}' if title else ''
        pg_entry = f'/Pg {pg} 0 R' if pg else ''
        doc.update_object(sx, f'<</Type/StructElem/S/Sect/P {dx} 0 R{pg_entry}{t_entry}'
                              f'/K[{" ".join(f"{m} 0 R" for m in members)}]>>')
        for m in members:
            doc.xref_set_key(m, 'P', f'{sx} 0 R')
        sects.append(sx)
    doc.update_object(dx, f'<</Type/StructElem/S/Document/P {root} 0 R/K[{" ".join(f"{s} 0 R" for s in sects)}]>>')
    doc.xref_set_key(root, 'K', f'[{dx} 0 R]')
    return len(sects)


def fill_figure_alt(doc):
    """Alt 없는 Figure(텍스트 없는 장식 도형)에 빈 Alt 를 넣는다. 그림 Alt 에 파일 경로가 남았으면 멈춘다."""
    filled = 0
    for x in range(1, doc.xref_length()):
        if doc.xref_get_key(x, 'Type')[1] != '/StructElem' or tag(doc, x) != 'Figure':
            continue
        t, v = doc.xref_get_key(x, 'Alt')
        if t == 'null':
            doc.xref_set_key(x, 'Alt', '()')
            filled += 1
        elif re.search(r'(/tmp/|/home/|\\\\Users\\\\|[A-Za-z]:\\\\|\.(jpe?g|png)\b)', v, re.I):
            raise SystemExit(f'그림 Alt 에 파일 경로가 남아 있다: {v[:80]}')
    return filled


def fix(doc, goto_titles, page_titles):
    root = root_of(doc)
    lang = doc.xref_get_key(doc.pdf_catalog(), 'Lang')[1]
    if not lang.lower().startswith('ko'):
        raise SystemExit(f'문서 언어가 한국어가 아니다: {lang}')
    if 'Marked true' not in doc.xref_get_key(doc.pdf_catalog(), 'MarkInfo')[1]:
        raise SystemExit('MarkInfo /Marked true 가 없다')
    links = tag_links(doc, root, goto_titles)
    sects = wrap_sections(doc, root, page_titles)
    alt = fill_figure_alt(doc)
    return {'lang': lang, 'link_tags': links, 'sections': sects, 'decor_alt': alt}


def summary(doc):
    """태그 요약: 문서 언어·태그 종류별 개수·링크 주석 중 StructParent 가 있는 수"""
    import collections
    cat = doc.pdf_catalog()
    c = collections.Counter()
    for x in range(1, doc.xref_length()):
        if doc.xref_get_key(x, 'Type')[1] == '/StructElem':
            c[tag(doc, x)] += 1
    annots = tagged = 0
    for p in doc:
        for ln in p.get_links():
            if ln.get('xref'):
                annots += 1
                tagged += doc.xref_get_key(ln['xref'], 'StructParent')[0] != 'null'
    return {
        'Lang': doc.xref_get_key(cat, 'Lang')[1],
        'Marked': 'Marked true' in doc.xref_get_key(cat, 'MarkInfo')[1],
        'StructTreeRoot': doc.xref_get_key(cat, 'StructTreeRoot')[0] == 'xref',
        'tags': dict(c.most_common()),
        'link_annots': annots,
        'link_annots_tagged': tagged,
    }
