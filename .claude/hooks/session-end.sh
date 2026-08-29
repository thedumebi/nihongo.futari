#!/bin/bash
# ============================================================================
# session-end.sh — SessionEnd hook (timeout: 30s)
#
# Saves the full conversation transcript to the SQLite DB and updates the
# session record with ended_at, end_reason, and duration_seconds.
#
# The transcript is a JSONL file (one JSON object per line). We store the
# full content so it can be queried later for session summaries.
#
# Timeout is set to 30s in settings.json because transcripts can be large.
# Also set CLAUDE_CODE_SESSIONEND_HOOKS_TIMEOUT_MS=30000 in your shell profile.
# ============================================================================

HOOK_NAME="session-end"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input

SESSION=$(get_field "session_id")
REASON=$(get_field "reason")
TRANSCRIPT_PATH=$(get_field "transcript_path")

# Ensure DB exists
init_db

# ---- Update session record ----
sqlite3 "$DB_PATH" <<SQL
UPDATE sessions
SET ended_at = datetime('now'),
    end_reason = '$(echo "$REASON" | sed "s/'/''/g")',
    duration_seconds = CAST(
      (julianday('now') - julianday(started_at)) * 86400 AS INTEGER
    )
WHERE id = '$SESSION';
SQL

# ---- Save transcript ----
if [[ -n "$TRANSCRIPT_PATH" && -f "$TRANSCRIPT_PATH" ]]; then
  # Read transcript content. For very large files, we truncate to 5MB
  # to keep the DB manageable.
  TRANSCRIPT_SIZE=$(wc -c < "$TRANSCRIPT_PATH" | tr -d ' ')
  MAX_SIZE=5242880  # 5MB

  if [[ $TRANSCRIPT_SIZE -gt $MAX_SIZE ]]; then
    CONTENT=$(head -c $MAX_SIZE "$TRANSCRIPT_PATH")
    CONTENT+=$'\n[TRUNCATED — original size: '"$TRANSCRIPT_SIZE"' bytes]'
  else
    CONTENT=$(cat "$TRANSCRIPT_PATH")
  fi

  # Escape single quotes for SQL and insert
  SAFE_CONTENT=$(echo "$CONTENT" | sed "s/'/''/g")
  SAFE_PATH=$(echo "$TRANSCRIPT_PATH" | sed "s/'/''/g")

  sqlite3 "$DB_PATH" "INSERT INTO conversations (session_id, transcript_path, transcript_content, saved_at)
    VALUES ('$SESSION', '$SAFE_PATH', '$SAFE_CONTENT', datetime('now'));"

  log_hook "success" "Transcript saved ($TRANSCRIPT_SIZE bytes) for session $SESSION (reason: $REASON)"
else
  log_hook "skipped" "No transcript file found at: $TRANSCRIPT_PATH"
fi
