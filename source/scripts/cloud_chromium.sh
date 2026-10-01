#!/usr/bin/env bash
# 클라우드 컨테이너용 Chromium (2026.10.01).
# 브라우저 QA 스크립트(qa_layout · qa_wrap 등)는 윈도우 Chrome/Edge 경로가 기본값이다.
# 클라우드는 root 로 돌아 샌드박스 없이만 Chromium 이 뜬다 — QA_BROWSER/CHROME_PATH 로 이 파일을 넘긴다.
exec "${PLAYWRIGHT_CHROMIUM:-/opt/pw-browsers/chromium}" --no-sandbox "$@"
