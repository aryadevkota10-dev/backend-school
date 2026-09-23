#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
command -v node >/dev/null 2>&1 || { echo "Node.js 20+ is required."; exit 1; }
[ -d node_modules ] || npm install
[ -f .env ] || cp .env.example .env
node server.js &
pid=$!
trap 'kill $pid 2>/dev/null || true' EXIT
sleep 2
if command -v xdg-open >/dev/null 2>&1; then xdg-open http://localhost:3000/admin-login.html >/dev/null 2>&1 || true; fi
wait $pid
