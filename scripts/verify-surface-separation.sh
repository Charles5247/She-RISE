#!/usr/bin/env bash
# Verifies the NEXT_PUBLIC_APP_SURFACE domain-separation middleware
# (src/middleware.ts) against real running instances of the app — not just
# theoretical route matching. Starts the app twice (once per surface),
# curls a representative set of paths against each, and asserts the
# expected status/redirect behavior. Exits non-zero on any mismatch.
#
# Usage: ./scripts/verify-surface-separation.sh
# Requires: the app already built (`npm run build`) or run via `npm run dev`;
# a reachable DATABASE_URL (falls back to the sandbox default if unset).

set -u
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

PASS=0
FAIL=0

log() { echo "[verify] $*"; }

assert_status() {
  local desc="$1" url="$2" expected="$3"
  local actual
  actual=$(curl -s -o /dev/null -w "%{http_code}" "$url")
  if [ "$actual" = "$expected" ]; then
    echo "  PASS  $desc -> $actual"
    PASS=$((PASS+1))
  else
    echo "  FAIL  $desc -> got $actual, expected $expected"
    FAIL=$((FAIL+1))
  fi
}

assert_redirect_to() {
  local desc="$1" url="$2" expected_location_substr="$3"
  local location
  location=$(curl -s -o /dev/null -D - "$url" | grep -i "^location:" | tr -d '\r' | awk '{print $2}')
  if [[ "$location" == *"$expected_location_substr"* ]]; then
    echo "  PASS  $desc -> redirected to $location"
    PASS=$((PASS+1))
  else
    echo "  FAIL  $desc -> location was '$location', expected to contain '$expected_location_substr'"
    FAIL=$((FAIL+1))
  fi
}

start_server() {
  local surface="$1" port="$2"
  NEXT_PUBLIC_APP_SURFACE="$surface" PORT="$port" \
    npx next start -p "$port" > "/tmp/surface-verify-$surface.log" 2>&1 &
  echo $!
}

wait_for_server() {
  local port="$1" tries=30
  while [ $tries -gt 0 ]; do
    if curl -s -o /dev/null "http://localhost:$port/"; then return 0; fi
    sleep 1
    tries=$((tries-1))
  done
  return 1
}

log "Building app once (shared by both surface runs)..."
npm run build > /tmp/surface-verify-build.log 2>&1 || { echo "Build failed — see /tmp/surface-verify-build.log"; exit 1; }

# --- participant surface ---
log "Starting server with NEXT_PUBLIC_APP_SURFACE=participant on :4001 ..."
PID_P=$(start_server participant 4001)
if ! wait_for_server 4001; then
  echo "participant server did not come up"; kill -9 "$PID_P" 2>/dev/null; exit 1
fi

log "participant surface checks:"
assert_status "GET /login (participant)" "http://localhost:4001/login" "200"
assert_status "GET /admin/login (participant, should 404)" "http://localhost:4001/admin/login" "404"
assert_status "GET /api/admin/overview (participant, should 404)" "http://localhost:4001/api/admin/overview" "404"
assert_status "GET / (participant)" "http://localhost:4001/" "200"

kill -9 "$PID_P" 2>/dev/null
wait "$PID_P" 2>/dev/null

# --- admin surface ---
log "Starting server with NEXT_PUBLIC_APP_SURFACE=admin on :4002 ..."
PID_A=$(start_server admin 4002)
if ! wait_for_server 4002; then
  echo "admin server did not come up"; kill -9 "$PID_A" 2>/dev/null; exit 1
fi

log "admin surface checks:"
assert_status "GET /admin/login (admin)" "http://localhost:4002/admin/login" "200"
assert_redirect_to "GET / (admin, should redirect)" "http://localhost:4002/" "/admin/login"
assert_redirect_to "GET /login (admin, should redirect)" "http://localhost:4002/login" "/admin/login"

kill -9 "$PID_A" 2>/dev/null
wait "$PID_A" 2>/dev/null

echo
log "Results: $PASS passed, $FAIL failed."
[ "$FAIL" -eq 0 ]
