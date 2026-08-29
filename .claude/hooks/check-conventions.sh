#!/bin/bash
# ============================================================================
# check-conventions.sh — PreToolUse hook (Edit|Write, synchronous)
#
# BLOCKS edits that violate project conventions. Claude must fix the violation
# before the edit can go through. Checks:
#
#   1. Missing test file for files in shared/src/{services,openapi,plugins}/
#   2. Hardcoded API paths (auto-discovered from the backend routes folder)
#   3. Type exports inside Drizzle schema files
#   4. $inferSelect/$inferInsert used outside shared/src/types/
#
# This is a PreToolUse hook — it runs BEFORE the edit is applied. For content
# checks (2 & 3), we inspect tool_input.new_string (Edit) or tool_input.content
# (Write) so we only catch violations being introduced, not pre-existing ones.
#
# Project-aware: resolves the workspace from the edited file's path.
# Project name is extracted from the file path; per-project domain lists for
# Check 2 are defined inline below — extend `get_api_path_pattern` when adding
# a new project (or new domains to an existing project).
# ============================================================================

HOOK_NAME="check-conventions"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input

FILE=$(get_field "tool_input.file_path")
if [[ -z "$FILE" ]]; then
  FILE=$(get_field "tool_input.path")
fi

# If no file path, allow the edit (nothing to check)
if [[ -z "$FILE" ]]; then
  exit 0
fi

REL_FILE="${FILE#$PROJECT_ROOT/}"
VIOLATIONS=""

# Get the content being written/edited — this is what we check for violations.
NEW_CONTENT=$(get_field "tool_input.new_string")
if [[ -z "$NEW_CONTENT" ]]; then
  NEW_CONTENT=$(get_field "tool_input.content")
fi

# ============================================================
# Detect project from path
# ============================================================
# Pattern: <project>/<rest> at the start of the relative path. Skip if the
# leading segment is a reserved monorepo dir (packages/, internals/, k8s/, etc.).
PROJECT=""
if [[ "$REL_FILE" =~ ^([a-z][a-z0-9-]+)/ ]]; then
  candidate="${BASH_REMATCH[1]}"
  case "$candidate" in
    packages|node_modules|dist|build|scripts|k8s|internals|docs|diagrams|.github|.claude|.husky)
      PROJECT="" ;;
    *)
      PROJECT="$candidate" ;;
  esac
fi

# Resolve the frontend folder name for this project (used by Check 3).
# We probe the filesystem rather than hardcoding so the hook self-adjusts.
FRONTEND_DIR_NAME=""
if [[ -n "$PROJECT" ]]; then
  if [[ -d "$PROJECT_ROOT/$PROJECT/frontend" ]]; then
    FRONTEND_DIR_NAME="frontend"
  elif [[ -d "$PROJECT_ROOT/$PROJECT/web" ]]; then
    FRONTEND_DIR_NAME="web"
  fi
fi

# ============================================================
# Per-project API path patterns (Check 2)
# ============================================================
# Discovered automatically from each project's backend routes folder. Every
# subdirectory of <project>/<backend>/src/routes/ becomes a domain in the
# pattern (e.g., prompts/ → /prompts/, api-keys/ → /api-keys/). The universal
# /api/ prefix is always included.
#
# This means:
#   - Adding a new route domain (creating a folder under src/routes/) is
#     immediately picked up — no hook edit required
#   - Removing a domain stops triggering this check for that path
#   - Works for any project, including ones added by /new-project, with no
#     per-project case statements
#
# The backend dir name is `backend/` here; `api/` is probed as a fallback.
get_api_path_pattern() {
  local proj="$1"
  local backend_dir=""
  if [[ -d "$PROJECT_ROOT/$proj/backend/src/routes" ]]; then
    backend_dir="backend"
  elif [[ -d "$PROJECT_ROOT/$proj/api/src/routes" ]]; then
    backend_dir="api"
  else
    # No routes folder yet (e.g., a freshly scaffolded project) — only catch
    # the generic /api/ prefix.
    echo "/api/"
    return
  fi

  local routes_dir="$PROJECT_ROOT/$proj/$backend_dir/src/routes"
  local pattern="/api/"
  for d in "$routes_dir"/*/; do
    [[ -d "$d" ]] || continue
    local name
    name=$(basename "$d")
    pattern="$pattern|/$name/"
  done
  echo "$pattern"
}

# ============================================================
# CHECK 1: Missing test file
# ============================================================
# Any project's <project>/shared/src/{services,openapi,plugins}/*.ts requires
# a co-located *.test.ts file. Gated on PROJECT being a real project (the
# reserved-name skip-list above filters out packages/, internals/, etc.).
if [[ -n "$PROJECT" ]] && \
   [[ "$REL_FILE" =~ ^${PROJECT}/shared/src/(services|openapi|plugins)/ ]] && \
   [[ "$FILE" =~ \.ts$ ]] && \
   [[ ! "$FILE" =~ \.test\.ts$ ]] && \
   [[ ! "$FILE" =~ \.spec\.ts$ ]] && \
   [[ ! "$FILE" =~ \.d\.ts$ ]] && \
   [[ ! "$REL_FILE" =~ index\.ts$ ]]; then

  TEST_FILE="${FILE%.ts}.test.ts"
  if [[ ! -f "$TEST_FILE" ]]; then
    REL_TEST="${TEST_FILE#$PROJECT_ROOT/}"
    VIOLATIONS+="BLOCKED: No test file found for $REL_FILE. Create $REL_TEST first with tests covering the functions you are editing, then retry this edit.\n\n"
    echo "[HOOK] ✗ Blocked edit — missing test file: $REL_TEST" >&2
    log_hook "denied" "Missing test file: $REL_TEST"
  fi
fi

# ============================================================
# CHECK 2: Hardcoded API paths in new content
# ============================================================
if [[ -n "$NEW_CONTENT" ]] && \
   [[ -n "$PROJECT" ]] && \
   [[ "$FILE" =~ \.(ts|tsx|vue)$ ]] && \
   [[ ! "$FILE" =~ endpoints\.ts$ ]] && \
   [[ ! "$FILE" =~ \.test\.ts$ ]] && \
   [[ ! "$FILE" =~ /constants/ ]] && \
   [[ ! "$FILE" =~ /types/ ]] && \
   [[ ! "$FILE" =~ /db/schema/ ]]; then

  PATTERN=$(get_api_path_pattern "$PROJECT")
  HARDCODED=$(echo "$NEW_CONTENT" | grep -nE "['\"]($PATTERN)" 2>/dev/null | head -3 || true)

  if [[ -n "$HARDCODED" ]]; then
    MATCH_COUNT=$(echo "$HARDCODED" | wc -l | tr -d ' ')
    VIOLATIONS+="BLOCKED: Your edit introduces $MATCH_COUNT hardcoded API path(s):\n$HARDCODED\nUse the appropriate constant from API_ENDPOINTS in @${PROJECT}/shared/constants instead, then retry.\n\n"
    echo "[HOOK] ✗ Blocked edit — hardcoded API paths in new content" >&2
    log_hook "denied" "Hardcoded API paths in $REL_FILE ($MATCH_COUNT matches)"
  fi
fi

# ============================================================
# CHECK 3: Type exports in Drizzle schema files
# ============================================================
# The single most important convention in this repo (see CLAUDE.md): every
# shape has exactly one definition. Schema files export TABLES AND RELATIONS
# ONLY; the derived types live in <project>/shared/src/types/. Catching this at
# edit time is far cheaper than untangling duplicate types later.
if [[ -n "$NEW_CONTENT" ]] && \
   [[ "$REL_FILE" =~ /shared/src/db/schema/.*\.ts$ ]] && \
   [[ ! "$REL_FILE" =~ /schema/index\.ts$ ]]; then

  TYPE_EXPORTS=$(echo "$NEW_CONTENT" | grep -nE '^export (type|interface) ' 2>/dev/null | head -3 || true)

  if [[ -n "$TYPE_EXPORTS" ]]; then
    MATCH_COUNT=$(echo "$TYPE_EXPORTS" | wc -l | tr -d ' ')
    TYPES_DIR="$PROJECT/shared/src/types"
    VIOLATIONS+="BLOCKED: Your edit adds $MATCH_COUNT type export(s) to a Drizzle schema file:\n$TYPE_EXPORTS\nSchema files export tables and relations only. Move these to $TYPES_DIR/ and derive them there (\`typeof <table>.\$inferSelect\` / \`\$inferInsert\`, or \`z.infer\` of a Zod schema), then retry.\n\n"
    echo "[HOOK] ✗ Blocked edit — type export in schema file" >&2
    log_hook "denied" "Type export in schema file $REL_FILE ($MATCH_COUNT matches)"
  fi
fi

# ============================================================
# CHECK 4: Hand-written interface duplicating a derived type
# ============================================================
# Catches the other half of the same rule: re-declaring a shape in a route,
# service or component instead of importing it from shared/types.
if [[ -n "$NEW_CONTENT" ]] && \
   [[ "$FILE" =~ \.(ts|vue)$ ]] && \
   [[ ! "$REL_FILE" =~ /shared/src/types/ ]] && \
   [[ ! "$FILE" =~ \.test\.ts$ ]] && \
   [[ ! "$FILE" =~ \.d\.ts$ ]]; then

  DUP_INFER=$(echo "$NEW_CONTENT" | grep -nE '\$inferSelect|\$inferInsert' 2>/dev/null | head -3 || true)

  if [[ -n "$DUP_INFER" ]]; then
    VIOLATIONS+="BLOCKED: Your edit uses \$inferSelect/\$inferInsert outside shared/src/types/:\n$DUP_INFER\nDerive the type once in $PROJECT/shared/src/types/ and import it from \`@$PROJECT/shared/types\` instead, then retry.\n\n"
    echo "[HOOK] ✗ Blocked edit — \$infer* outside shared/types" >&2
    log_hook "denied" "\$infer* outside shared/types in $REL_FILE"
  fi
fi

# ---- Output ----
if [[ -n "$VIOLATIONS" ]]; then
  deny_tool "$(echo -e "$VIOLATIONS")"
else
  echo "[HOOK] ✓ Convention checks passed for $REL_FILE" >&2
  log_hook "success" "All conventions passed for $REL_FILE"
fi
