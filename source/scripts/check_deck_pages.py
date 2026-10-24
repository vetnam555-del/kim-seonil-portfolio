"""포트폴리오 PDF 의 사례 쪽 번호표(src/data/deck-pages.json)가 실제 PDF 와 맞는지 확인한다.

사례 상세의 "포트폴리오 PDF n–m쪽" 링크가 이 표를 쓴다. 덱을 다시 구워 쪽이 밀리면 링크가 다른 사례를
가리키므로, 표의 쪽마다 사례 keyword 가 PDF 글자에 있는지 본다.

    python3 scripts/check_deck_pages.py <덱 PDF> <deck-pages.json>

종료 코드: 0 일치 · 1 불일치 · 3 pypdf 없음(검사 못 함)
"""
import json
import sys

try:
    from pypdf import PdfReader
except ImportError:
    print("pypdf 가 없어 덱 쪽 번호를 확인하지 못했다 (pip install pypdf)")
    sys.exit(3)


def main() -> int:
    pdf_path, table_path = sys.argv[1], sys.argv[2]
    reader = PdfReader(pdf_path)
    table = json.load(open(table_path, encoding="utf-8"))
    total = len(reader.pages)
    problems = []
    for slug, row in table.items():
        start, end, keyword = row["from"], row["to"], row["keyword"]
        if not (1 <= start <= end <= total):
            problems.append(f"{slug}: {start}–{end}쪽이 PDF 범위(1–{total}) 밖")
            continue
        for page in range(start, end + 1):
            text = (reader.pages[page - 1].extract_text() or "").replace(" ", "")
            if keyword.replace(" ", "") not in text:
                problems.append(f"{slug}: {page}쪽에 '{keyword}' 없음")
    for problem in problems:
        print(problem)
    if not problems:
        print(f"덱 쪽 번호 일치 — 사례 {len(table)}개 · {total}쪽")
    return 1 if problems else 0


if __name__ == "__main__":
    sys.exit(main())
