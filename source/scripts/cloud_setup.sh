#!/usr/bin/env bash
# 클라우드(Claude Code on the web) 세션 시작 때 빌드 도구를 준비한다 (2026.10.01).
# .claude/settings.json 의 SessionStart 훅이 부른다. 로컬 PC 에서는 아무것도 하지 않는다.
# 이미 준비돼 있으면 바로 끝난다.
set -euo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" = "true" ] || exit 0
cd "$(dirname "$0")/.."

# 처음이거나, 이어 받은 컨테이너에서 package-lock.json 이 바뀌었으면 다시 설치한다
if [ ! -d node_modules/next ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  echo "[cloud_setup] npm ci"
  npm ci --no-audit --no-fund --loglevel=error
fi

# 폰트 서브셋(fontTools·brotli), 증빙 이미지 크기 측정(Pillow), 덱 쪽 번호 검사(pypdf)에 쓴다.
# 실제로 불러 본다 — 컨테이너의 python3 판이 바뀌면 apt 로 깔린 Pillow · cryptography(다른 판용 C 확장)가
# 'import PIL' 은 통과하고 PIL.Image · pypdf 에서 깨진다. pip 도 그것들을 설치된 것으로 보므로
# 같은 python3 의 pip 로 --ignore-installed 해서 다시 깐다(2026.10.31).
PY_PKGS="fonttools brotli pillow pypdf cryptography cffi"
if ! python3 -c "import fontTools, brotli, PIL.Image; from pypdf import PdfReader" 2>/dev/null; then
  echo "[cloud_setup] pip install $PY_PKGS"
  python3 -m pip install --quiet --disable-pip-version-check --ignore-installed $PY_PKGS 2>/dev/null \
    || python3 -m pip install --quiet --disable-pip-version-check --ignore-installed --break-system-packages $PY_PKGS
fi

echo "[cloud_setup] 준비 완료 — cd source && npm run publish:general"
