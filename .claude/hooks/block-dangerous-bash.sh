#!/bin/bash
# ============================================================================
# block-dangerous-bash.sh — PreToolUse hook (Bash)
#
# Blocks dangerous or destructive bash commands before they execute. Catches
# force pushes, hard resets, recursive deletes, database drops, and other
# irreversible operations.
# ============================================================================

HOOK_NAME="block-dangerous-bash"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input

COMMAND=$(get_field "tool_input.command")

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

# Dangerous patterns with human-readable descriptions
# Format: "pattern|description"
DANGEROUS_PATTERNS=(
  "rm -rf /|Recursive delete of root filesystem"
  "rm -rf \.|Recursive delete of current directory"
  "rm -rf \*|Recursive delete with wildcard"
  "git push.*--force|Force push (use --force-with-lease instead if needed)"
  "git push.*-f |Force push (use --force-with-lease instead if needed)"
  "git reset --hard|Hard reset discards all uncommitted changes"
  "git clean -fd|Force-clean removes untracked files permanently"
  "DROP TABLE|SQL DROP TABLE is irreversible"
  "DROP DATABASE|SQL DROP DATABASE is irreversible"
  "TRUNCATE TABLE|SQL TRUNCATE removes all rows permanently"
  "chmod -R 777|Setting world-writable permissions recursively"
  ":(){ :|:& };:|Fork bomb"
  "mkfs\.|Filesystem format command"
  "dd if=.*of=/dev/|Direct disk write"
  "> /dev/sd|Direct device write"
)

for entry in "${DANGEROUS_PATTERNS[@]}"; do
  PATTERN="${entry%%|*}"
  DESCRIPTION="${entry##*|}"

  if echo "$COMMAND" | grep -qE "$PATTERN"; then
    log_hook "blocked" "Denied dangerous command: $DESCRIPTION"
    deny_tool "BLOCKED: Dangerous command detected — $DESCRIPTION. Command: $(echo "$COMMAND" | head -c 200)"
    exit 0
  fi
done

# Command is safe — allow it
exit 0
