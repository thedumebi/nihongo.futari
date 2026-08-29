#!/bin/bash
# ============================================================================
# common.sh — Shared helper library for all Claude Code hooks
#
# Source this file at the top of every hook script:
#   HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
#   source "$HOOK_DIR/lib/common.sh"
#
# Provides:
#   - setup_node()     — nvm PATH workaround for non-interactive shells
#   - init_db()        — create/open SQLite DB with schema migrations
#   - log_hook()       — log hook activity to hook_logs table
#   - read_input()     — read and parse stdin JSON
#   - get_field()      — extract a field from the parsed input
#   - json_output()    — helper to build JSON output
#   - Error trap       — logs failures, never exits silently
# ============================================================================

set -euo pipefail

# ---- Resolve paths ----
# PROJECT_ROOT is the monorepo root. CLAUDE_PROJECT_DIR is set by Claude Code,
# but we fall back to git rev-parse for manual testing.
PROJECT_ROOT="${CLAUDE_PROJECT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
DB_PATH="$PROJECT_ROOT/.claude/data/hooks.db"
POSTMORTEM_DIR="$PROJECT_ROOT/.claude/postmortems"

# ---- Global state ----
# These get populated by read_input()
_HOOK_INPUT=""
_SESSION_ID=""
_HOOK_EVENT=""
_HOOK_NAME="${HOOK_NAME:-unknown}"

# ---- Error trap ----
# If any command fails, log the error and exit cleanly (never silently).
# We log to stderr so Claude sees the error, and also try to log to the DB.
_on_error() {
  local exit_code=$?
  local line_no=${1:-unknown}
  local msg="Hook '$_HOOK_NAME' failed at line $line_no with exit code $exit_code"
  echo "[HOOK ERROR] $msg" >&2

  # Try to log to DB (may fail if DB isn't initialized yet)
  if [[ -f "$DB_PATH" ]] && command -v sqlite3 &>/dev/null; then
    sqlite3 "$DB_PATH" "INSERT INTO hook_logs (session_id, hook_name, event, status, message, created_at)
      VALUES ('${_SESSION_ID:-unknown}', '$_HOOK_NAME', '${_HOOK_EVENT:-unknown}', 'error', '$(echo "$msg" | sed "s/'/''/g")', datetime('now'));" 2>/dev/null || true
  fi

  exit 0  # Exit 0 so we don't block Claude with an unexpected error
}
trap '_on_error ${LINENO}' ERR

# ---- Node environment ----
# Defensive setup: ~/.zshenv already prepends nvm-managed Node to PATH for
# non-interactive shells, and ~/.zshrc only defines the lazy-load function
# stubs inside an `if [[ -o interactive ]]` guard. The unset is therefore a
# no-op in normal use, and the PATH export is redundant — both are kept as a
# safety net in case .zshenv/.zshrc are ever reverted.
setup_node() {
  unset -f pnpm node npm npx 2>/dev/null || true
  export PATH="$HOME/.nvm/versions/node/v22.17.0/bin:$PATH"
}

# ---- SQLite DB ----
init_db() {
  # Ensure data directory exists
  mkdir -p "$(dirname "$DB_PATH")"

  # Create tables if they don't exist. Using IF NOT EXISTS so this is
  # safe to call from every hook — idempotent by design.
  sqlite3 "$DB_PATH" <<'SQL'
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  project_dir TEXT,
  model TEXT,
  started_at TEXT NOT NULL,
  ended_at TEXT,
  end_reason TEXT,
  duration_seconds INTEGER
);

CREATE TABLE IF NOT EXISTS conversations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  transcript_path TEXT,
  transcript_content TEXT,
  saved_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS postmortems (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  files_changed INTEGER DEFAULT 0,
  tool_uses INTEGER DEFAULT 0,
  errors INTEGER DEFAULT 0,
  warnings INTEGER DEFAULT 0,
  summary TEXT,
  resolved INTEGER DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS hook_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  hook_name TEXT NOT NULL,
  event TEXT,
  status TEXT NOT NULL,
  message TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS security_audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT,
  vulnerabilities_json TEXT,
  secrets_found INTEGER DEFAULT 0,
  audit_summary TEXT,
  created_at TEXT NOT NULL
);
SQL
}

# ---- Input parsing ----
# Read stdin once and cache it. Call this at the top of your hook.
read_input() {
  _HOOK_INPUT=$(cat)
  _SESSION_ID=$(echo "$_HOOK_INPUT" | jq -r '.session_id // "unknown"' 2>/dev/null)
  _HOOK_EVENT=$(echo "$_HOOK_INPUT" | jq -r '.hook_event_name // "unknown"' 2>/dev/null)
}

# Extract a field from the cached input
get_field() {
  local field="$1"
  echo "$_HOOK_INPUT" | jq -r ".$field // empty" 2>/dev/null
}

# ---- Logging ----
# Log hook activity to the hook_logs table.
# Usage: log_hook "success" "Linted file.ts successfully"
#        log_hook "skipped" "Not a TypeScript file"
#        log_hook "error" "ESLint failed with exit code 1"
log_hook() {
  local status="$1"
  local message="${2:-}"

  # Always log to stderr for debugging (visible with claude --debug)
  echo "[HOOK] $_HOOK_NAME | $status | $message" >&2

  # Log to DB if available
  if [[ -f "$DB_PATH" ]] && command -v sqlite3 &>/dev/null; then
    local safe_msg
    safe_msg=$(echo "$message" | sed "s/'/''/g" | head -c 1000)
    sqlite3 "$DB_PATH" "INSERT INTO hook_logs (session_id, hook_name, event, status, message, created_at)
      VALUES ('$_SESSION_ID', '$_HOOK_NAME', '$_HOOK_EVENT', '$status', '$safe_msg', datetime('now'));" 2>/dev/null || true
  fi
}

# ---- JSON output helpers ----
# Build a systemMessage JSON response
system_message() {
  local msg="$1"
  jq -n --arg msg "$msg" '{ systemMessage: $msg }'
}

# Build an additionalContext JSON response
additional_context() {
  local ctx="$1"
  jq -n --arg ctx "$ctx" '{ additionalContext: $ctx }'
}

# Build a PreToolUse deny response
deny_tool() {
  local msg="$1"
  jq -n --arg msg "$msg" '{
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny"
    },
    systemMessage: $msg
  }'
}
