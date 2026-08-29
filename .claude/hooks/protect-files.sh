#!/bin/bash
# ============================================================================
# protect-files.sh — PreToolUse hook (Edit|Write)
#
# Blocks edits to files that should never be modified directly by Claude:
# lock files, env secrets, build output, migration journals, git internals,
# and the hooks SQLite database.
# ============================================================================

HOOK_NAME="protect-files"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input

FILE=$(get_field "tool_input.file_path")
if [[ -z "$FILE" ]]; then
  FILE=$(get_field "tool_input.path")
fi

if [[ -z "$FILE" ]]; then
  exit 0
fi

# Patterns that should never be edited
PROTECTED_PATTERNS=(
  "\.env$"
  "\.env\."
  "pnpm-lock\.yaml$"
  "package-lock\.json$"
  "yarn\.lock$"
  "/node_modules/"
  "/dist/"
  "/\.git/"
  "migrations/meta/_journal\.json$"
  "\.sqlite$"
  "\.sqlite3$"
  "\.db$"
  "credentials\.json$"
  "serviceAccountKey\.json$"
  "/\.claude/data/"
)

for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if echo "$FILE" | grep -qE "$pattern"; then
    log_hook "blocked" "Denied edit to protected file: $FILE (pattern: $pattern)"
    deny_tool "Blocked: Cannot modify protected file: $FILE (matches pattern: $pattern). These files should not be edited directly."
    exit 0
  fi
done

# File is not protected — allow the edit
exit 0
