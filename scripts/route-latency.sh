#!/usr/bin/env bash
#
# How long each API route takes in production, from the backend's own request
# logs: count, p50, p95 and max of pino's `responseTime` per route, with ids
# and slugs folded so /lessons/n5-masen and /lessons/n5-desu count as one.
#
# Run it before and after a deploy that is meant to make something faster:
#
#   ./scripts/route-latency.sh            # the last 24 hours
#   ./scripts/route-latency.sh 2h         # any `docker logs --since` value
#   ./scripts/route-latency.sh 2026-10-27T09:00:00Z
#
# The logs live in the container, so a restart (every deploy) starts them
# afresh: after a deploy, wait for some real use before reading the numbers.
#
# Needs `ssh nagaya` to work. CONTAINER overrides the container name.

set -euo pipefail

since="${1:-24h}"
container="${CONTAINER:-futari-nihongo-backend}"

# The parser, kept out of the shell's quoting.
read -r -d '' summarise <<'PY' || true
import json, re, sys

routes = {}
first_other = None
for line in sys.stdin:
    try:
        entry = json.loads(line)
    except ValueError:
        first_other = first_other or line.strip()
        continue
    ms = entry.get("responseTime")
    req = entry.get("req") or {}
    url = req.get("url")
    if ms is None or not url:
        continue
    path = url.split("?")[0]
    path = re.sub(r"[0-9a-f]{8}-[0-9a-f-]{27}", ":id", path)
    path = re.sub(r"/\d+(?=/|$)", "/:n", path)
    path = re.sub(r"/(lessons|dialogues|readings|speak|kanji|words|grammar|phonetics)/[^/]+", r"/\1/:slug", path)
    routes.setdefault(req.get("method", "?") + " " + path, []).append(ms)

if not routes:
    hint = f" The first other line was: {first_other}" if first_other else ""
    sys.exit("No requests logged in that window." + hint)

def pct(values, p):
    return values[min(len(values) - 1, int(len(values) * p))]

print(f"{'route':48} {'n':>5} {'p50':>7} {'p95':>7} {'max':>7}")
for route, values in sorted(routes.items(), key=lambda kv: -len(kv[1])):
    values.sort()
    print(f"{route[:48]:48} {len(values):5} {pct(values, .5):7.0f} {pct(values, .95):7.0f} {values[-1]:7.0f}")
PY

# pino writes to stdout; docker's own complaints (no such container, a bad
# --since) come back on stderr and are left there for you to see.
remote="docker logs --since $(printf %q "$since") $(printf %q "$container")"
ssh -o BatchMode=yes nagaya "$remote" | python3 -c "$summarise"
