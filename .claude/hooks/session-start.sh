#!/bin/bash
# ============================================================================
# session-start.sh — SessionStart hook (startup|resume)
#
# Initializes the SQLite database (creates tables if needed) and logs the
# session start. Also injects additionalContext telling Claude about the
# session history DB so users can query it naturally.
# ============================================================================

HOOK_NAME="session-start"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input

SESSION=$(get_field "session_id")
SOURCE=$(get_field "source")
MODEL=$(get_field "model")
CWD=$(get_field "cwd")

# Initialize database (idempotent — safe to call every time)
init_db

# Insert or update session record.
# On resume, the session row may already exist, so we use INSERT OR IGNORE
# for startups and UPDATE for resumes.
if [[ "$SOURCE" == "startup" ]]; then
  sqlite3 "$DB_PATH" "INSERT OR IGNORE INTO sessions (id, project_dir, model, started_at)
    VALUES ('$SESSION', '$(echo "$CWD" | sed "s/'/''/g")', '$MODEL', datetime('now'));"
else
  # Resume — update model if it changed, but don't overwrite started_at
  sqlite3 "$DB_PATH" "UPDATE sessions SET model = '$MODEL' WHERE id = '$SESSION';" 2>/dev/null || \
  sqlite3 "$DB_PATH" "INSERT OR IGNORE INTO sessions (id, project_dir, model, started_at)
    VALUES ('$SESSION', '$(echo "$CWD" | sed "s/'/''/g")', '$MODEL', datetime('now'));"
fi

log_hook "success" "Session $SESSION logged to DB (source: $SOURCE)"

# Inject context about the session history DB so the user can query it naturally.
# This is the key feature: the user can say "list my sessions" or "show unresolved
# postmortems" and Claude will know how to query the DB.
additional_context "SESSION HISTORY DATABASE:
A local SQLite database tracks all Claude Code sessions at: $DB_PATH
When the user asks about past sessions, postmortems, hook activity, or security audits, query it with sqlite3.

Tables:
  sessions          — id, project_dir, model, started_at, ended_at, end_reason, duration_seconds
  conversations     — id, session_id, transcript_path, transcript_content, saved_at
  postmortems       — id, session_id, files_changed, tool_uses, errors, warnings, summary, resolved (0/1), created_at
  hook_logs         — id, session_id, hook_name, event, status, message, created_at
  security_audits   — id, session_id, vulnerabilities_json, secrets_found, audit_summary, created_at

Example queries:
  sqlite3 \"$DB_PATH\" \"SELECT id, started_at, model, duration_seconds FROM sessions ORDER BY started_at DESC LIMIT 10;\"
  sqlite3 \"$DB_PATH\" \"SELECT * FROM postmortems WHERE resolved = 0 ORDER BY created_at DESC;\"
  sqlite3 \"$DB_PATH\" \"SELECT * FROM security_audits WHERE session_id = 'SESSION_ID';\"

To mark a postmortem as resolved:
  sqlite3 \"$DB_PATH\" \"UPDATE postmortems SET resolved = 1 WHERE id = POSTMORTEM_ID;\""
