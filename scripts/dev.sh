#!/bin/bash

# Dev orchestrator — start all packages of a project in watch mode with one
# command. Mirrors ofuma's scripts/dev.sh.
#
#   ./scripts/dev.sh nihongo                  # nihongo's backend + frontend + shared
#   ./scripts/dev.sh <project>            # any project folder added to the monorepo
#
# Extra args are forwarded to turbo, so you can refine the filter:
#
#   ./scripts/dev.sh nihongo --filter='!frontend'      # exclude the frontend
#   ./scripts/dev.sh nihongo --output-logs=errors-only # quieter output

set -e

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

# Top-level dirs that are shared infrastructure, never a runnable project.
NON_PROJECTS="packages scripts k8s node_modules dist .git .github .husky .vscode .turbo .claude"

is_non_project() {
  case " $NON_PROJECTS " in *" $1 "*) return 0 ;; *) return 1 ;; esac
}

REPO_ROOT=$(git rev-parse --show-toplevel 2>/dev/null || pwd)

# Discover project folders: top-level dirs (not infra) that contain at least
# one nested package.json (i.e. a workspace-style multi-package folder).
discover_projects() {
  for dir in "$REPO_ROOT"/*/; do
    local name
    name=$(basename "$dir")
    is_non_project "$name" && continue
    if find "$dir" -mindepth 2 -maxdepth 2 -name package.json -not -path "*/node_modules/*" 2>/dev/null | grep -q .; then
      echo "$name"
    fi
  done
}

PROJECT="${1:-}"
if [ $# -gt 0 ]; then shift; fi  # remaining args ($@) pass through to turbo

# ---------------------------------------------------------------------------
# Help / list mode (no arg, or --help)
# ---------------------------------------------------------------------------
if [ -z "$PROJECT" ] || [ "$PROJECT" = "--help" ] || [ "$PROJECT" = "-h" ]; then
  echo "Usage: $0 <project> [extra-turbo-args]"
  echo ""
  echo "Starts dev (watch) mode for every package in the named project."
  echo ""
  echo "Available projects:"
  for p in $(discover_projects); do
    echo "  $p"
  done
  echo ""
  echo "Examples:"
  echo "  $0 nihongo"
  echo "  $0 nihongo --filter='!frontend'        # exclude the frontend"
  echo "  $0 nihongo --output-logs=errors-only   # quieter output"
  echo ""
  echo "Note: projects are auto-discovered — any new top-level folder with"
  echo "nested packages works without editing this script."
  echo ""
  echo "Tip: this is roughly equivalent to:"
  echo "  turbo dev --filter='./<project>/*'"
  exit 0
fi

# ---------------------------------------------------------------------------
# Verify a runner is available (depends on the user's terminal, e.g. nvm)
# ---------------------------------------------------------------------------
if ! command -v pnpm >/dev/null 2>&1 && ! command -v turbo >/dev/null 2>&1; then
  echo -e "${RED}✗ Neither pnpm nor turbo is on PATH.${NC}"
  echo -e "  If you use nvm: ${YELLOW}source ~/.nvm/nvm.sh && nvm use${NC}"
  exit 1
fi

RUNNER="turbo"
if ! command -v turbo >/dev/null 2>&1; then
  RUNNER="pnpm exec turbo"
fi

# ---------------------------------------------------------------------------
# Validate the requested project
# ---------------------------------------------------------------------------
if is_non_project "$PROJECT"; then
  echo -e "${RED}✗ '$PROJECT' is shared infrastructure, not a project.${NC}"
  echo -e "  Run '${YELLOW}$0${NC}' (no args) to see available projects."
  exit 1
fi

if [ ! -d "$REPO_ROOT/$PROJECT" ]; then
  echo -e "${RED}✗ Project directory '$PROJECT/' not found at $REPO_ROOT.${NC}"
  echo -e "  Run '${YELLOW}$0${NC}' (no args) to see available projects."
  exit 1
fi

if ! find "$REPO_ROOT/$PROJECT" -mindepth 2 -maxdepth 2 -name package.json -not -path "*/node_modules/*" 2>/dev/null | grep -q .; then
  echo -e "${RED}✗ '$PROJECT/' doesn't look like a multi-package workspace (no nested package.json).${NC}"
  exit 1
fi

FILTER="./$PROJECT/*"
echo -e "${BLUE}=== Starting dev for all packages in $PROJECT/ ===${NC}"
echo -e "Runner: ${YELLOW}$RUNNER dev --filter='$FILTER' $*${NC}"
echo ""
echo -e "${GREEN}Tip:${NC} Ctrl-C stops every package. To run a subset, add a filter"
echo -e "     (e.g. ${YELLOW}--filter='!$PROJECT-frontend'${NC} or ${YELLOW}--filter='!frontend'${NC})."
echo ""

# shellcheck disable=SC2086  # RUNNER may be 'turbo' or 'pnpm exec turbo'
exec $RUNNER dev --filter="$FILTER" "$@"
