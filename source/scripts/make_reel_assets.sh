#!/usr/bin/env bash
# EDIT H 릴스를 사이트용으로 바꾼다 (2026.11.17 — 홈 릴스 띠 · EDIT H 사례).
#
#   bash scripts/make_reel_assets.sh <아카이브 reel_ai.mp4> <id>      예: … instagram/2026-11-17/reel_ai.mp4 1117
#
# 원본은 공개 아카이브(vetnam555-del/edit-h-archive)의 instagram/{날짜}/reel_ai.mp4 다(1080×1920 · 약 22.6초 · 끝 2.8초는 끝 화면).
# public/evidence/ 에 네 개를 만든다:
#   edith-reel-<id>.mp4            사례 쪽 — 540×960 · 소리 포함 · 끝 화면까지(누르면 재생)
#   edith-reel-<id>-loop.mp4       홈 — 360×640 · 소리 없음 · 끝 화면(인스타 팔로우 안내) 앞까지 19.8초를 되풀이
#   edith-reel-<id>-poster.webp    0.8초 프레임(릴스의 썸네일 자리 — 첫 장면 제목 · 출처가 보인다) 540×960
#   edith-reel-<id>-poster-360.webp 같은 프레임 360×640(홈)
# 만든 뒤 src/data/reels.ts 에 날짜 · 호수 · 첫 장면 제목을 적는다. 화면에 실제 인물 · 회사 로고가 없는지 프레임으로 한 번 본다.
set -euo pipefail
src="$1"; id="$2"
out="$(cd "$(dirname "$0")/.." && pwd)/public/evidence"
ffmpeg -v error -y -i "$src" -vf "scale=540:-2" -c:v libx264 -preset slow -crf 27 -profile:v main -pix_fmt yuv420p \
  -c:a aac -b:a 80k -ac 2 -movflags +faststart "$out/edith-reel-$id.mp4"
ffmpeg -v error -y -i "$src" -t 19.8 -an -vf "scale=360:-2,fps=24" -c:v libx264 -preset slow -crf 31 -profile:v main -pix_fmt yuv420p \
  -movflags +faststart "$out/edith-reel-$id-loop.mp4"
tmp="$(mktemp --suffix=.png)"
ffmpeg -v error -y -ss 0.8 -i "$src" -frames:v 1 "$tmp"
python3 - "$tmp" "$out/edith-reel-$id" <<'PY'
import sys
from PIL import Image
im = Image.open(sys.argv[1]).convert("RGB")
im.resize((540, 960), Image.LANCZOS).save(sys.argv[2] + "-poster.webp", "WEBP", quality=80, method=6)
im.resize((360, 640), Image.LANCZOS).save(sys.argv[2] + "-poster-360.webp", "WEBP", quality=78, method=6)
PY
rm -f "$tmp"
ls -la "$out" | grep "edith-reel-$id"
