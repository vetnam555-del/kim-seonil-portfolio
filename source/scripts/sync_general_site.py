"""일반판 out/ 을 배포 저장소(portfolio-github-sync)로 옮기기 전후 도구.

  py scripts/sync_general_site.py diff    # 배포본 vs out/ — 페이지별 보이는 글 차이
  py scripts/sync_general_site.py apply   # .git 을 남기고 배포 저장소를 out/ 과 같게 맞춘다

diff 는 스크립트·스타일·태그를 걷어 낸 글만 비교한다(빌드 해시·자산 이름 차이는 무시).
의도한 수정 외의 글이 바뀌었으면 apply 하기 전에 멈춰야 한다.
"""
import difflib
import html
import re
import shutil
import sys
from pathlib import Path

SRC = Path(__file__).resolve().parents[1] / "out"
DST = Path(r"C:\Users\JNote\Desktop\코덱스\portfolio-github-sync")


def visible_text(p: Path) -> list[str]:
    t = p.read_text(encoding="utf-8", errors="replace")
    t = re.sub(r"<script\b.*?</script>|<style\b.*?</style>|<noscript\b.*?</noscript>", " ", t, flags=re.S | re.I)
    t = re.sub(r"<br\s*/?>|</(p|div|li|span|h\d|dt|dd|section|article|figcaption|td|th)>", "\n", t, flags=re.I)
    t = html.unescape(re.sub(r"<[^>]+>", " ", t))
    lines = [re.sub(r"\s+", " ", x).strip() for x in t.split("\n")]
    return [x for x in lines if x]


def diff():
    pages = sorted({p.relative_to(SRC) for p in SRC.rglob("index.html")} | {p.relative_to(DST) for p in DST.rglob("index.html") if ".git" not in p.parts})
    changed = 0
    for rel in pages:
        a, b = DST / rel, SRC / rel
        if not a.exists() or not b.exists():
            print(f"[{'새 페이지' if b.exists() else '사라진 페이지'}] {rel}")
            changed += 1
            continue
        la, lb = visible_text(a), visible_text(b)
        if la == lb:
            continue
        changed += 1
        d = [x for x in difflib.unified_diff(la, lb, lineterm="", n=0) if x[:1] in "+-" and x[:3] not in ("+++", "---")]
        print(f"\n[바뀜] {rel} · {len(d)}줄")
        for x in d[:24]:
            print("   " + x[:150])
    files_a = {p.relative_to(DST) for p in DST.rglob("*") if p.is_file() and ".git" not in p.parts}
    files_b = {p.relative_to(SRC) for p in SRC.rglob("*") if p.is_file()}
    print(f"\n페이지 글 차이 {changed}곳 · 파일 추가 {len(files_b - files_a)} · 삭제 {len(files_a - files_b)}")
    for x in sorted(files_a - files_b)[:15]:
        print("   삭제될 파일:", x)


def apply():
    if not (SRC / "index.html").exists():
        raise SystemExit("out/index.html 이 없다 — 빌드부터")
    for child in DST.iterdir():
        if child.name == ".git":
            continue
        shutil.rmtree(child) if child.is_dir() else child.unlink()
    for child in SRC.iterdir():
        target = DST / child.name
        shutil.copytree(child, target) if child.is_dir() else shutil.copy2(child, target)
    print("synced", SRC, "->", DST)


if __name__ == "__main__":
    {"diff": diff, "apply": apply}[sys.argv[1]]()
