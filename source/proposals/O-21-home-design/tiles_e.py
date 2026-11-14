# 사례 표지에 쓸 소재 낱장을 우리 증빙 이미지(소재 모음 사진)에서 잘라 public/evidence/cover-<사례>-<n>.webp 로 쓴다.
# 칸을 찾고(바탕과 다른 덩어리) → 고른 칸만 → 흰 여백과 얇은 테두리 줄을 벗겨 낸다. 그림을 새로 만들지 않는다.
# Usage: python3 tiles_e.py <evidence dir(원본)> <out dir>        예: python3 proposals/O-21-home-design/tiles_e.py public/evidence public/evidence
import sys, os
from PIL import Image
import numpy as np
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
# 사례 → (모음 사진, 고른 칸 번호(왼쪽 위부터), 모양)
PICK = {
    "jestina": ("jestina-creatives", [1, 3, 4], "sq"),
    "newbalance": ("newbalance-bizboard-set", [1, 3, 7], "wide"),
    "daekyo": ("daekyo-flamu-set", [1, 4, 6], "sq"),
    "gangwon": ("gangwon-creative-set", [1, 3, 6], "sq"),
    "dyson": ("dyson-youtube-placements", [1, 2, 4], "tall"),
}
def segs(profile, thr, mingap, minlen):
    on = profile > thr; res = []; start = None; gap = 0
    for i, v in enumerate(on):
        if v:
            if start is None: start = i
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= mingap: res.append((start, i - gap + 1)); start = None; gap = 0
    if start is not None: res.append((start, len(on)))
    return [(a, b) for a, b in res if b - a >= minlen]
def cells(im):
    a = np.asarray(im).astype(int); bg = a[2, 2]; mask = (np.abs(a - bg).sum(axis=2) > 40); H, W = mask.shape; tiles = []
    for (x0, x1) in segs(mask.mean(axis=0), 0.04, 10, W // 12):
        sub = mask[:, x0:x1]
        for (y0, y1) in segs(sub.mean(axis=1), 0.25, 8, H // 10):
            cols = np.where(mask[y0:y1, x0:x1].mean(axis=0) > 0.3)[0]
            if len(cols): tiles.append((x0 + cols[0], y0, x0 + cols[-1] + 1, y1))
    tiles.sort(key=lambda t: (round(t[1] / (H / 6)), t[0]))
    return tiles
def peel(tile):
    """흰 여백 줄, 그리고 가장자리에서 6px 안쪽까지의 한 가지 색 테두리 줄을 벗긴다."""
    a = np.asarray(tile).astype(int); y0, y1, x0, x1 = 0, a.shape[0], 0, a.shape[1]
    def white(line): return (line.min(axis=1) >= 234).mean() > 0.97
    def flat(line): return line.std(axis=0).max() < 10
    changed = True
    while changed and y1 - y0 > 40 and x1 - x0 > 40:
        changed = False
        for side in ("t", "b", "l", "r"):
            line = {"t": a[y0, x0:x1], "b": a[y1 - 1, x0:x1], "l": a[y0:y1, x0], "r": a[y0:y1, x1 - 1]}[side]
            depth = {"t": y0, "b": a.shape[0] - y1, "l": x0, "r": a.shape[1] - x1}[side]
            if white(line) or (flat(line) and depth < 6 and white({"t": a[min(y1 - 1, y0 + 8), x0:x1], "b": a[max(y0, y1 - 9), x0:x1], "l": a[y0:y1, min(x1 - 1, x0 + 8)], "r": a[y0:y1, max(x0, x1 - 9)]}[side])):
                if side == "t": y0 += 1
                elif side == "b": y1 -= 1
                elif side == "l": x0 += 1
                else: x1 -= 1
                changed = True
    return tile.crop((x0, y0, x1, y1))
def fit(tile, kind, shift=0.5):
    """소재는 제 비율 그대로 둔다(정사각 · 4:5 가 한 사례에 섞여 있다). 가로 영상 캡처가 섞인 다이슨만 3:4 로 맞춘다."""
    w, h = tile.size
    if kind == "wide": return tile.resize((800, round(800 * h / w)), Image.LANCZOS)
    if kind == "tall":
        tw = min(w, int(h * 3 / 4)); th = int(tw * 4 / 3); x = max(0, int((w - tw) * shift))   # shift: 가로 캡처에서 사람이 가운데 오게(오른쪽의 재생 표시를 뺀다)
        return tile.crop((x, 0, x + tw, th)).resize((420, 560), Image.LANCZOS)
    return tile.resize((440, round(440 * h / w)), Image.LANCZOS)
for slug, (name, picks, kind) in PICK.items():
    im = Image.open(os.path.join(src, name + ".webp")).convert("RGB"); cs = cells(im); line = []
    for n, k in enumerate(picks, 1):
        t = fit(peel(im.crop(cs[k - 1])), kind, 0.3 if (slug, n) == ("dyson", 2) else 0.5); f = os.path.join(out, f"cover-{slug}-{n}.webp"); t.save(f, quality=84, method=6)
        line.append(f"[{t.size[0]}, {t.size[1]}]")
    print(f'{slug}: {{ kind: "{kind}", sizes: [{", ".join(line)}] }}')
