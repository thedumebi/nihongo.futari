#!/usr/bin/env bash
#
# Nightly Postgres backup -> S3-compatible object storage (Cloudflare R2 or
# Backblaze B2). Fully containerised: needs only Docker on the host.
#
# nihongo reuses dmb's Postgres container, so this dumps the `nihongo` database from
# the shared `dmb-postgres` container (override with PG_CONTAINER if renamed).
# Dumps land under the `nihongo/` key prefix in the shared bucket, separate from
# dmb's own backups.
#
# All config (PG_*, S3_BUCKET, S3_ENDPOINT, AWS_*) comes from the environment.
# Run it through dotenvx so the encrypted .env.production is decrypted first:
#
#   dotenvx run -f nihongo/backend/.env.production -- ./scripts/backup-db.sh
#
# Retention: don't delete here — set a lifecycle rule on the bucket (e.g.
# "delete objects older than 30 days") in the R2/B2 dashboard. Simpler and
# safer than scripting deletes.

set -euo pipefail

# Resolve repo root regardless of where cron invokes this from.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$ROOT_DIR"

: "${PG_USERNAME:?PG_USERNAME missing — run via 'dotenvx run -f nihongo/backend/.env.production -- ...'}"
: "${PG_DATABASE:?PG_DATABASE missing — run via 'dotenvx run -f nihongo/backend/.env.production -- ...'}"
: "${S3_BUCKET:?S3_BUCKET missing — set it in nihongo/backend/.env.production}"
: "${S3_ENDPOINT:?S3_ENDPOINT missing — set it in nihongo/backend/.env.production}"
: "${AWS_ACCESS_KEY_ID:?AWS_ACCESS_KEY_ID missing — set it in nihongo/backend/.env.production}"
: "${AWS_SECRET_ACCESS_KEY:?AWS_SECRET_ACCESS_KEY missing — set it in nihongo/backend/.env.production}"

# dmb's Postgres container (shared). nihongo has no postgres service of its own.
PG_CONTAINER="${PG_CONTAINER:-dmb-postgres}"
STAMP="$(date -u +%Y-%m-%dT%H-%M-%SZ)"
KEY="nihongo/${PG_DATABASE}-${STAMP}.sql.gz"

echo "[$(date -u)] dumping ${PG_DATABASE} (from ${PG_CONTAINER}) -> s3://${S3_BUCKET}/${KEY}"

# pg_dump inside dmb's postgres container -> gzip on the host -> aws-cli
# container streams it straight to object storage. Nothing touches disk.
docker exec -i "$PG_CONTAINER" pg_dump -U "$PG_USERNAME" -d "$PG_DATABASE" \
  | gzip \
  | docker run --rm -i \
      -e AWS_ACCESS_KEY_ID \
      -e AWS_SECRET_ACCESS_KEY \
      amazon/aws-cli \
      s3 cp - "s3://${S3_BUCKET}/${KEY}" --endpoint-url "$S3_ENDPOINT"

echo "[$(date -u)] backup complete: ${KEY}"
