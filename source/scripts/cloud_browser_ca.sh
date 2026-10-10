#!/usr/bin/env bash
# 클라우드 컨테이너의 HTTPS 프록시 CA 를 Chromium 인증서 저장소(NSS)에 넣는다 (2026.10.10).
# Lighthouse 가 ERR_CERT_AUTHORITY_INVALID 로 점수 없이 끝날 때 쓴다(health_check --lighthouse).
# TLS 검증을 끄는 것이 아니라 컨테이너가 이미 쓰는 프록시 CA 를 브라우저도 믿게 한다. 세션이 바뀌면 CA 도 바뀌므로 다시 돌린다.
set -euo pipefail

CA=/root/.ccr/agent-proxy-ca.crt
[ -f "$CA" ] || { echo "[ca] $CA 가 없다 — 클라우드 밖이면 할 일이 없다"; exit 0; }

if ! command -v certutil >/dev/null; then
  apt-get install -y --no-install-recommends libnss3-tools >/dev/null 2>&1 \
    || { apt-get update >/dev/null 2>&1 && apt-get install -y --no-install-recommends libnss3-tools >/dev/null; }
fi

DIR="$HOME/.pki/nssdb"
mkdir -p "$DIR"
[ -f "$DIR/cert9.db" ] || certutil -d "sql:$DIR" -N --empty-password

TMP=$(mktemp -d)
awk -v d="$TMP" '/BEGIN CERTIFICATE/{n++} n{print > (d "/ca-" n ".pem")}' "$CA"
added=0
for f in "$TMP"/ca-*.pem; do
  # 이름에 지문 끝자리를 붙여 세션마다 바뀌는 CA 가 서로 덮어쓰지 않게 한다
  fp=$(openssl x509 -noout -fingerprint -sha256 -in "$f" | tr -d ':' | tail -c 13)
  if certutil -d "sql:$DIR" -A -t "C,," -n "ccr-agent-proxy-$fp" -i "$f" 2>/dev/null; then added=$((added + 1)); fi
done
rm -f "$TMP"/ca-*.pem
rmdir "$TMP"
echo "[ca] 프록시 CA ${added}개를 $DIR 에 넣었다"
