#!/usr/bin/env bash
# 클라우드 컨테이너의 HTTPS 프록시 CA 를 Chromium 인증서 저장소(NSS)에 넣는다 (2026.10.10).
# Lighthouse 가 ERR_CERT_AUTHORITY_INVALID 로 점수 없이 끝날 때 쓴다(health_check --lighthouse).
# TLS 검증을 끄는 것이 아니라 컨테이너가 이미 쓰는 프록시 CA 를 브라우저도 믿게 한다. 세션이 바뀌면 CA 도 바뀌므로 다시 돌린다.
# 끝에 저장소에 실제로 들어갔는지 지문으로 대조하고, 하나라도 없으면 원인을 출력하고 1 로 끝난다(자비스 6432087 P3).
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
cleanup() { rm -f "$TMP"/*.pem "$TMP"/err; rmdir "$TMP" 2>/dev/null || true; }
trap cleanup EXIT

fingerprint() { openssl x509 -noout -fingerprint -sha256 -in "$1" | cut -d= -f2 | tr -d ':'; }

awk -v d="$TMP" '/BEGIN CERTIFICATE/{n++} n{print > (d "/ca-" n ".pem")}' "$CA"
wanted=()
for f in "$TMP"/ca-*.pem; do
  fp=$(fingerprint "$f")
  wanted+=("$fp")
  # 이름에 지문 끝자리를 붙여 세션마다 바뀌는 CA 가 서로 덮어쓰지 않게 한다.
  # 같은 인증서가 다른 이름으로 이미 있으면 certutil 이 실패할 수 있다 — 결과는 아래 대조로 판단한다
  if ! certutil -d "sql:$DIR" -A -t "C,," -n "ccr-agent-proxy-${fp: -12}" -i "$f" 2>"$TMP/err"; then
    echo "[ca] certutil 추가 실패(이미 있을 수 있음): $(tr '\n' ' ' < "$TMP/err")"
  fi
done

# 저장소에 들어 있는 인증서들의 지문과 대조한다. 신뢰 표시(C)까지 있어야 한다
missing=0
for fp in "${wanted[@]}"; do
  found=""
  while IFS= read -r nick; do
    [ -n "$nick" ] || continue
    certutil -d "sql:$DIR" -L -n "$nick" -a > "$TMP/one.pem" 2>/dev/null || continue
    if [ "$(fingerprint "$TMP/one.pem")" = "$fp" ]; then
      trust=$(certutil -d "sql:$DIR" -L | awk -v n="$nick" 'index($0, n) == 1 { print $NF }')
      case "$trust" in C*) found="$nick" ;; esac
    fi
  done < <(certutil -d "sql:$DIR" -L | tail -n +5 | sed -E 's/[[:space:]]+$//; s/[[:space:]]+[^[:space:]]+$//')
  if [ -n "$found" ]; then
    echo "[ca] 확인: ${fp: -12} → $found"
  else
    echo "[ca] 없음: ${fp: -12} — Chromium 이 이 프록시 CA 를 믿지 않는다" >&2
    missing=$((missing + 1))
  fi
done
rm -f "$TMP/one.pem"

if [ "$missing" -gt 0 ]; then
  echo "[ca] 프록시 CA ${#wanted[@]}개 중 ${missing}개를 $DIR 에 넣지 못했다" >&2
  exit 1
fi
echo "[ca] 프록시 CA ${#wanted[@]}개가 $DIR 에 신뢰(C)로 들어 있다"
