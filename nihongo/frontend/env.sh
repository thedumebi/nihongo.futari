#!/bin/sh
# ================================================================================
# Runtime configuration for the built SPA, filled in when the container starts.
#
# The image is built ONCE with placeholders instead of real values (the
# Dockerfile sets VITE_API_URL=NIHONGO_API_URL, …). The stock nginx entrypoint
# runs every script in /docker-entrypoint.d/ before starting nginx; this one:
#   1. loads /etc/app-env/<NODE_ENV>.env (production.env or staging.env, from
#      frontend/runtime-env/ in this repo), so one image serves both
#      environments: nagaya sets NODE_ENV per container;
#   2. replaces each NIHONGO_* placeholder in the built .js/.html/.css with its
#      value.
# A variable already set in the container's environment wins over the file,
# so a one-off `docker run -e NIHONGO_API_URL=…` still works.
# Same mechanism as ofuma's frontend (env.sh + runtime-env/).
# ================================================================================
set -eu

APP_PREFIX="${APP_PREFIX:-NIHONGO_}"
ASSET_DIR="${ASSET_DIR:-/usr/share/nginx/html}"
ENV_FILE="/etc/app-env/${NODE_ENV:-production}.env"

if [ -f "$ENV_FILE" ]; then
  echo "runtime-env: loading $ENV_FILE"
  while IFS='=' read -r key value; do
    case "$key" in ''|\#*) continue ;; esac
    eval "already=\${$key+set}"
    [ -n "$already" ] || export "$key=$value"
  done < "$ENV_FILE"
else
  echo "runtime-env: WARNING: $ENV_FILE not found; placeholders stay unreplaced" >&2
fi

replacements=0
for key in $(env | sed -n "s/^\(${APP_PREFIX}[A-Z0-9_]*\)=.*/\1/p" | sort -r); do
  value="$(printenv "$key")"
  # Escape the characters sed treats specially in the replacement (| & \).
  escaped="$(printf '%s' "$value" | sed 's/[|&\\]/\\&/g')"
  find "$ASSET_DIR" -type f \( -name '*.js' -o -name '*.html' -o -name '*.css' \) \
    -exec sed -i "s|${key}|${escaped}|g" {} +
  replacements=$((replacements + 1))
done
echo "runtime-env: replaced $replacements placeholder(s) for NODE_ENV=${NODE_ENV:-production}"
