# 사례 소재 모음 사진에서 소재 한 장씩을 잘라 낸다(우리 증빙 이미지). Usage: python3 tiles.py <evidence dir> <out dir>
import sys, os
from PIL import Image
import numpy as np
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
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
def cut(name, key):
    im = Image.open(os.path.join(src, name + ".webp")).convert("RGB"); a = np.asarray(im).astype(int)
    bg = a[2, 2]; mask = (np.abs(a - bg).sum(axis=2) > 40)
    H, W = mask.shape; tiles = []
    for (x0, x1) in segs(mask.mean(axis=0), 0.04, 10, W // 12):
        sub = mask[:, x0:x1]
        for (y0, y1) in segs(sub.mean(axis=1), 0.25, 8, H // 10):
            cell = mask[y0:y1, x0:x1]; cols = np.where(cell.mean(axis=0) > 0.3)[0]
            if len(cols): tiles.append((x0 + cols[0], y0, x0 + cols[-1] + 1, y1))
    tiles.sort(key=lambda t: (round(t[1] / (H / 6)), t[0]))
    for i, t in enumerate(tiles):
        tile = im.crop(t); tile.thumbnail((720, 720)); tile.save(os.path.join(out, f"{key}-{i+1}.webp"), quality=88)
    print(name, im.size, len(tiles), [(t[2]-t[0], t[3]-t[1]) for t in tiles])
for name, key in [("jestina-creatives","jestina"),("newbalance-bizboard-set","newbalance"),("daekyo-flamu-set","daekyo"),("gangwon-creative-set","gangwon"),("dyson-youtube-placements","dyson")]:
    cut(name, key)
