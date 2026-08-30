#!/bin/bash
# ============================================================================
# protect-files.sh — PreToolUse hook (Edit|Write|Bash)
#
# Blocks edits to files that should never be modified directly by Claude:
# lock files, env secrets, build output, migration journals, git internals,
# and the hooks SQLite database.
#
# Covers Bash as well as Edit and Write, because guarding only the file tools
# guards only the front door. The migration journal is on this list precisely so
# it is never hand-edited, and it was hand-edited anyway — through a `python`
# heredoc in a Bash call, which this hook never saw. Three migrations went in
# without snapshots that way and broke `drizzle-kit generate`.
#
# For Bash the match is deliberately narrow: a protected path is only a problem
# when it is the TARGET of a write. Reading one is fine and common — `cat`,
# `grep`, `git diff` — so the patterns below look for the path in write
# position (after a redirect, after `tee`, as an argument to an in-place editor
# or a file-moving command) rather than anywhere in the command.
# ============================================================================

HOOK_NAME="protect-files"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input

FILE=$(get_field "tool_input.file_path")
if [[ -z "$FILE" ]]; then
  FILE=$(get_field "tool_input.path")
fi

# Bash carries no file path — the target is somewhere inside the command.
COMMAND=$(get_field "tool_input.command")

if [[ -z "$FILE" && -z "$COMMAND" ]]; then
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
  if [[ -n "$FILE" ]] && echo "$FILE" | grep -qE "$pattern"; then
    log_hook "blocked" "Denied edit to protected file: $FILE (pattern: $pattern)"
    deny_tool "Blocked: Cannot modify protected file: $FILE (matches pattern: $pattern). These files should not be edited directly."
    exit 0
  fi
done

if [[ -z "$COMMAND" ]]; then
  exit 0
fi

# A path stripped of its anchors, so it can be matched mid-command.
for pattern in "${PROTECTED_PATTERNS[@]}"; do
  bare="${pattern%$}"

  # Each of these puts the protected path in WRITE position. `[^|;&]*` keeps a
  # match inside one command, so `cat secret | grep x > /tmp/out` is not caught
  # by the redirect rule.
  writes=(
    ">>?[[:space:]]*[^[:space:]|;&]*${bare}"
    "tee([[:space:]]+-[a-zA-Z]+)*[[:space:]]+[^[:space:]|;&]*${bare}"
    "(sed|perl)[[:space:]][^|;&]*-[a-zA-Z]*i[^|;&]*${bare}"
    "(mv|cp|rm|truncate|shred|install|dd[[:space:]]+of=)[[:space:]][^|;&]*${bare}"
    "(writeFileSync|writeFile|write_text)\\([^)]*${bare}"
    # A write MODE is what makes it a write. Without this an
    # ordinary read — json.load(open(path)) — was blocked too.
    "open\\([^)]*${bare}[^)]*,[[:space:]]*['\"][wax]"
  )

  for w in "${writes[@]}"; do
    if echo "$COMMAND" | grep -qE "$w"; then
      log_hook "blocked" "Denied bash write to protected file (pattern: $pattern)"
      deny_tool "Blocked: this command writes to a protected file (matches: $pattern). Reading it is fine; modifying it is not. Migration journals in particular must be produced by \`drizzle-kit generate\`, never edited — see .claude/rules/migrations.md."
      exit 0
    fi
  done
done

# Not a protected target — allow it
exit 0
