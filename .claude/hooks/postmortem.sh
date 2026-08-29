#!/bin/bash
# ============================================================================
# postmortem.sh — SessionEnd hook (async)
#
# Reads the transcript JSONL and extracts session metrics:
#   - Files changed (Edit/Write tool uses)
#   - Total tool uses by type
#   - Errors encountered
#   - Warnings from convention checks
#
# Saves a structured postmortem to the DB (marked as unresolved by default)
# and writes a human-readable markdown file to .claude/postmortems/.
#
# Async so it doesn't block session shutdown.
# ============================================================================

HOOK_NAME="postmortem"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input

SESSION=$(get_field "session_id")
TRANSCRIPT_PATH=$(get_field "transcript_path")
REASON=$(get_field "reason")

# Ensure DB and postmortem directory exist
init_db
mkdir -p "$POSTMORTEM_DIR"

# ---- Extract metrics from transcript ----
FILES_CHANGED=0
TOOL_USES=0
ERRORS=0
WARNINGS=0
SUMMARY=""

if [[ -n "$TRANSCRIPT_PATH" && -f "$TRANSCRIPT_PATH" ]]; then
  # Count tool uses (lines containing tool_use)
  TOOL_USES=$(grep -c '"tool_use"' "$TRANSCRIPT_PATH" 2>/dev/null || echo "0")

  # Count unique files edited (Edit and Write tool uses with file_path)
  FILES_CHANGED=$(grep -oE '"file_path"\s*:\s*"[^"]*"' "$TRANSCRIPT_PATH" 2>/dev/null | sort -u | wc -l | tr -d ' ')

  # Count errors (lines with error indicators)
  ERRORS=$(grep -ciE '"error"|"failed"|exit code [1-9]' "$TRANSCRIPT_PATH" 2>/dev/null || echo "0")

  # Count warnings from our convention hooks
  WARNINGS=$(grep -c 'ACTION REQUIRED' "$TRANSCRIPT_PATH" 2>/dev/null || echo "0")

  # Get the first user message as a summary of what was worked on
  FIRST_PROMPT=$(grep -m 1 '"user"' "$TRANSCRIPT_PATH" 2>/dev/null | jq -r '.content // .text // empty' 2>/dev/null | head -c 200 || echo "")

  SUMMARY="Session worked on: ${FIRST_PROMPT:-No user prompt found}. "
  SUMMARY+="$TOOL_USES tool uses, $FILES_CHANGED files changed, $ERRORS errors, $WARNINGS convention warnings."
else
  SUMMARY="No transcript available for analysis."
fi

# ---- Save to DB ----
SAFE_SUMMARY=$(echo "$SUMMARY" | sed "s/'/''/g")

sqlite3 "$DB_PATH" "INSERT INTO postmortems (session_id, files_changed, tool_uses, errors, warnings, summary, resolved, created_at)
  VALUES ('$SESSION', $FILES_CHANGED, $TOOL_USES, $ERRORS, $WARNINGS, '$SAFE_SUMMARY', 0, datetime('now'));"

# ---- Write markdown postmortem ----
DATE=$(date +%Y-%m-%d)
TIME=$(date +%H%M%S)
MD_FILE="$POSTMORTEM_DIR/${DATE}-${TIME}-${SESSION:0:8}.md"

cat > "$MD_FILE" <<MARKDOWN
# Session Postmortem

| Field | Value |
|-------|-------|
| Session ID | \`$SESSION\` |
| Date | $DATE $(date +%H:%M:%S) |
| End Reason | $REASON |
| Files Changed | $FILES_CHANGED |
| Tool Uses | $TOOL_USES |
| Errors | $ERRORS |
| Convention Warnings | $WARNINGS |
| Resolved | No |

## Summary

$SUMMARY

## Notes

_Add your notes here after reviewing._
MARKDOWN

log_hook "success" "Postmortem saved: $MD_FILE (files: $FILES_CHANGED, tools: $TOOL_USES, errors: $ERRORS)"
