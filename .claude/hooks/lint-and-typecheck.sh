#!/bin/bash
# ============================================================================
# lint-and-typecheck.sh — PostToolUse hook (Edit|Write, synchronous)
#
# After every file edit, runs:
#   1. ESLint --fix on the changed file
#   2. Package-aware typecheck (vue-tsc for frontend pkgs, tsc for the rest)
#
# Project-aware: resolves the workspace from the edited file's path.
# The project name and subpackage are extracted from the path; the right
# typechecker is chosen based on whether the subpackage is a Vue frontend
# (`frontend/` or `web/`) or a plain TS package (`backend/`, `api/`, `shared/`).
#
# This hook is SYNCHRONOUS — Claude blocks until lint+typecheck completes,
# ensuring errors are caught and fixed before the next edit.
# ============================================================================

HOOK_NAME="lint-and-typecheck"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input
setup_node

FILE=$(get_field "tool_input.file_path")
if [[ -z "$FILE" ]]; then
  FILE=$(get_field "tool_input.path")
fi

if [[ -z "$FILE" || ! -f "$FILE" ]]; then
  exit 0
fi

# Only process TypeScript and Vue files
if [[ ! "$FILE" =~ \.(ts|tsx|vue)$ ]]; then
  exit 0
fi

# Skip type declarations and config files
if [[ "$FILE" =~ \.d\.ts$ ]] || [[ "$FILE" =~ \.config\. ]]; then
  exit 0
fi

cd "$PROJECT_ROOT"

REL_FILE="${FILE#$PROJECT_ROOT/}"
MESSAGES=""

# ---- 1. ESLint --fix ----
echo "[HOOK] Linting $REL_FILE..." >&2

# Disable set -e temporarily so we can capture the real exit code
set +e
LINT_OUTPUT=$(npx eslint --fix "$FILE" 2>&1)
LINT_EXIT=$?
set -e

if [[ $LINT_EXIT -ne 0 ]]; then
  # Extract just the error lines (not the full verbose output)
  LINT_ERRORS=$(echo "$LINT_OUTPUT" | grep -E "^\s+\d+:\d+" | head -5)
  if [[ -n "$LINT_ERRORS" ]]; then
    MESSAGES+="Lint errors in $REL_FILE:\n$LINT_ERRORS\n\n"
    echo "[HOOK] ✗ Lint errors found in $REL_FILE" >&2
    log_hook "warning" "ESLint errors in $FILE"
  fi
else
  echo "[HOOK] ✓ Lint passed for $REL_FILE" >&2
fi

# ---- 2. Typecheck ----
# Detect project and subpackage from the path:
#   <project>/<subpkg>/...  where <subpkg> is one of:
#     - frontend, web         → Vue frontend, use vue-tsc
#     - backend, api, shared  → plain TS, use tsc
#     - cli, sdk              → plain TS, use tsc (skip if no tsconfig)
#
# Reserved leading segments are skipped so edits to packages/, internals/,
# scripts/, etc. don't run a typecheck against the wrong place.
TYPECHECK_OUTPUT=""
TYPECHECK_EXIT=0

PROJECT=""
SUBPKG=""
TYPECHECKER=""  # tsc or vue-tsc

if [[ "$REL_FILE" =~ ^([a-z][a-z0-9-]+)/([a-z][a-z0-9-]+)/ ]]; then
  candidate_project="${BASH_REMATCH[1]}"
  candidate_subpkg="${BASH_REMATCH[2]}"
  case "$candidate_project" in
    packages|node_modules|dist|build|scripts|k8s|internals|docs|diagrams|.github|.claude|.husky)
      ;; # skip — not a project
    *)
      case "$candidate_subpkg" in
        frontend|web)
          PROJECT="$candidate_project"
          SUBPKG="$candidate_subpkg"
          TYPECHECKER="vue-tsc"
          ;;
        backend|api|shared|cli|sdk)
          PROJECT="$candidate_project"
          SUBPKG="$candidate_subpkg"
          TYPECHECKER="tsc"
          ;;
      esac ;;
  esac
fi

if [[ -n "$PROJECT" && -n "$SUBPKG" && -n "$TYPECHECKER" ]]; then
  PKG_DIR="$PROJECT_ROOT/$PROJECT/$SUBPKG"
  if [[ -d "$PKG_DIR" && -f "$PKG_DIR/tsconfig.json" ]]; then
    echo "[HOOK] Running typecheck for $PROJECT/$SUBPKG ($TYPECHECKER)..." >&2
    set +e
    TYPECHECK_OUTPUT=$(cd "$PKG_DIR" && npx "$TYPECHECKER" --noEmit 2>&1 | grep -A 2 "$(basename "$FILE")" | head -10)
    TYPECHECK_EXIT=${PIPESTATUS[0]}
    set -e
  fi
fi

if [[ -n "$TYPECHECK_OUTPUT" ]]; then
  MESSAGES+="Type errors related to $REL_FILE:\n$TYPECHECK_OUTPUT\n"
  echo "[HOOK] ✗ Type errors found related to $REL_FILE" >&2
  log_hook "warning" "Type errors in $FILE"
else
  echo "[HOOK] ✓ Typecheck passed for $REL_FILE" >&2
fi

# ---- Output results ----
if [[ -n "$MESSAGES" ]]; then
  system_message "$(echo -e "$MESSAGES")"
else
  log_hook "success" "Lint and typecheck passed for $FILE"
fi
