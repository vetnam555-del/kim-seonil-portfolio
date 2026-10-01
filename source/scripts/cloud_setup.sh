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

# 폰트 서브셋(fontTools·brotli)과 증빙 이미지 크기 측정(Pillow)에 쓴다
if ! python3 -c "import fontTools, brotli, PIL" 2>/dev/null; then
  echo "[cloud_setup] pip install fonttools brotli pillow"
  pip install --quiet --disable-pip-version-check fonttools brotli pillow 2>/dev/null \
    || pip install --quiet --disable-pip-version-check --break-system-packages fonttools brotli pillow
fi

echo "[cloud_setup] 준비 완료 — cd source && npm run publish:general"
