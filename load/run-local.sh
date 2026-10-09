#!/usr/bin/env bash
# Local load test: starts a local Supabase, builds and starts the app, runs the k6 scenario (20 virtual users by default, `VUS=50 bash load/run-local.sh` for more)
# through Docker, and prints the CPU and database cost. See docs/load-testing.md.
#
# Usage: bash load/run-local.sh [hold-duration, default 120s]
# Needs Docker and the Supabase CLI (npx). Never targets a hosted project: everything is local (Linux or macOS).
set -u
HOLD="${1:-120s}"
PORT=3200
cd "$(dirname "$0")/.."

npx supabase start >/dev/null 2>&1 || { echo "Could not start the local Supabase (is Docker running?)"; exit 1; }
npx supabase db reset >/dev/null 2>&1
eval "$(npx supabase status -o env 2>/dev/null | grep -E '^(API_URL|SERVICE_ROLE_KEY|PUBLISHABLE_KEY|ANON_KEY)=')"
case "$API_URL" in
  http://127.0.0.1:* | http://localhost:*) ;;
  *) echo "Refusing to run: the database is not local ($API_URL)"; exit 1 ;;
esac

# TODO(A-xxx): insert the target volume here (a few hundred profiles, and the exercises, tips and videos of the catalogue)
# with a single SQL script through `docker exec supabase_db_DrawToday psql -U postgres -q -c "..."`, so that the test
# measures realistic queries. Nothing to seed while the schema has no table.

export NEXT_PUBLIC_SUPABASE_URL="$API_URL" NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="$PUBLISHABLE_KEY" NEXT_PUBLIC_SITE_URL="http://localhost:$PORT"
npm run build >/dev/null 2>&1 || { echo "Build failed"; exit 1; }
# Keep connections open longer than the pauses between page views: otherwise every virtual user reconnects through
# Docker's network layer and part of the requests time out on connect, which says nothing about the app.
npx next start -p "$PORT" --keepAliveTimeout 60000 >/dev/null 2>&1 &
SERVER_PID=$!
cleanup() { kill "$SERVER_PID" 2>/dev/null; npx supabase stop >/dev/null 2>&1; }
trap cleanup EXIT
sleep 8

# Warm-up so that the first compilation is not counted, then reset the counters.
curl -s -o /dev/null "http://localhost:$PORT/"
docker exec supabase_db_DrawToday psql -U postgres -tAc "select pg_stat_statements_reset()::text" >/dev/null 2>&1
# Total CPU seconds of the Node process and its children ("[DD-]HH:MM:SS" with ps; whole seconds are enough here).
cpu_seconds() {
  ps -o cputime= -g "$(ps -o pgid= -p "$SERVER_PID" | tr -d ' ')" 2>/dev/null | awk '
    { n = split($1, p, /[-:]/); s = p[n] + 60 * p[n-1] + 3600 * (n > 2 ? p[n-2] : 0) + 86400 * (n > 3 ? p[n-3] : 0); total += s }
    END { print total + 0 }'
}
CPU_BEFORE=$(cpu_seconds)

docker run --rm -i --add-host=host.docker.internal:host-gateway -e HOLD="$HOLD" -e VUS="${VUS:-20}" -e BASE_URL="http://host.docker.internal:$PORT" \
  grafana/k6 run --quiet - <load/k6-peak.js | tee load/last-run.txt
K6_EXIT=${PIPESTATUS[0]}

CPU_AFTER=$(cpu_seconds)
echo
echo "---- cost of the run ----"
echo "server CPU time: $((CPU_AFTER - CPU_BEFORE)) s (Node process, this machine)"
docker exec supabase_db_DrawToday psql -U postgres -tAc "
select 'database reads: ' || coalesce(sum(calls), 0) || ' (PostgREST)'
from pg_stat_statements where query like '%pgrst_source%';" 2>/dev/null || echo "database reads: n/a (pg_stat_statements unavailable)"

exit "$K6_EXIT"
