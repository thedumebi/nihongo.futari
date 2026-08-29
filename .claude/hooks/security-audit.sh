#!/bin/bash
# ============================================================================
# security-audit.sh — SessionStart hook (startup, async)
#
# Runs a security audit at the start of each new session:
#   1. pnpm audit — checks for known dependency vulnerabilities
#   2. Secret scan — checks for accidentally committed secrets
#
# Async so it doesn't block session startup. Results are saved to the
# security_audits table and a systemMessage is shown if issues are found.
# ============================================================================

HOOK_NAME="security-audit"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input
setup_node

SESSION=$(get_field "session_id")
ISSUES_FOUND=0
AUDIT_SUMMARY=""
SECRETS_COUNT=0
VULN_JSON=""

# Ensure DB exists (session-start.sh should have run first, but be safe)
init_db

cd "$PROJECT_ROOT"

# ---- 1. Dependency vulnerability check (opt-in) ----
# pnpm audit is slow (network call to npm registry), so it's skipped by default.
# Set CLAUDE_AUDIT=1 in your shell environment to enable it.
# The secret scan (part 2) always runs regardless.
if [[ "${CLAUDE_AUDIT:-}" != "1" ]]; then
  AUDIT_SUMMARY="Dependencies: Skipped (set CLAUDE_AUDIT=1 to enable). "
  VULN_JSON="{}"
else
  AUDIT_OUTPUT=$(pnpm audit --json 2>/dev/null || true)

  if [[ -n "$AUDIT_OUTPUT" ]]; then
    # Extract vulnerability counts from pnpm audit JSON
    # pnpm audit --json outputs advisories; count by severity
    CRITICAL=$(echo "$AUDIT_OUTPUT" | jq '[.advisories // {} | to_entries[].value | select(.severity == "critical")] | length' 2>/dev/null || echo "0")
    HIGH=$(echo "$AUDIT_OUTPUT" | jq '[.advisories // {} | to_entries[].value | select(.severity == "high")] | length' 2>/dev/null || echo "0")
    MODERATE=$(echo "$AUDIT_OUTPUT" | jq '[.advisories // {} | to_entries[].value | select(.severity == "moderate")] | length' 2>/dev/null || echo "0")

    VULN_JSON=$(jq -n \
      --argjson critical "${CRITICAL:-0}" \
      --argjson high "${HIGH:-0}" \
      --argjson moderate "${MODERATE:-0}" \
      '{ critical: $critical, high: $high, moderate: $moderate }')

    TOTAL_VULNS=$(( ${CRITICAL:-0} + ${HIGH:-0} + ${MODERATE:-0} ))

    if [[ $TOTAL_VULNS -gt 0 ]]; then
      ISSUES_FOUND=1
      AUDIT_SUMMARY="Dependencies: $TOTAL_VULNS vulnerabilities ($CRITICAL critical, $HIGH high, $MODERATE moderate). "
    else
      AUDIT_SUMMARY="Dependencies: No known vulnerabilities. "
    fi
  else
    AUDIT_SUMMARY="Dependencies: Audit unavailable. "
  fi
fi

# ---- 2. Secret scan ----
# Check for common secret patterns in tracked files.
# We scan git-tracked files only (not node_modules, not .gitignored).
SECRET_PATTERNS=(
  'AKIA[0-9A-Z]{16}'                    # AWS Access Key
  'sk-[a-zA-Z0-9]{20,}'                 # OpenAI/Stripe secret key
  'ghp_[a-zA-Z0-9]{36}'                 # GitHub personal access token
  'glpat-[a-zA-Z0-9\-]{20}'             # GitLab PAT
  'password\s*[:=]\s*["\x27][^"\x27]+'  # Hardcoded passwords
  'secret\s*[:=]\s*["\x27][^"\x27]+'    # Hardcoded secrets
)

SECRET_MATCHES=""
for pattern in "${SECRET_PATTERNS[@]}"; do
  MATCHES=$(git grep -lnE "$pattern" -- '*.ts' '*.js' '*.json' '*.env*' '*.yml' '*.yaml' 2>/dev/null | grep -v node_modules | grep -v pnpm-lock | grep -v '.test.' | head -5 || true)
  if [[ -n "$MATCHES" ]]; then
    SECRET_MATCHES+="$MATCHES"$'\n'
  fi
done

if [[ -n "$SECRET_MATCHES" ]]; then
  SECRETS_COUNT=$(echo "$SECRET_MATCHES" | sort -u | wc -l | tr -d ' ')
  ISSUES_FOUND=1
  AUDIT_SUMMARY+="Secrets: Found $SECRETS_COUNT file(s) with potential hardcoded secrets."
else
  AUDIT_SUMMARY+="Secrets: No hardcoded secrets detected."
fi

# ---- Save to DB ----
SAFE_SUMMARY=$(echo "$AUDIT_SUMMARY" | sed "s/'/''/g")
SAFE_VULN=$(echo "$VULN_JSON" | sed "s/'/''/g")

sqlite3 "$DB_PATH" "INSERT INTO security_audits (session_id, vulnerabilities_json, secrets_found, audit_summary, created_at)
  VALUES ('$SESSION', '$SAFE_VULN', $SECRETS_COUNT, '$SAFE_SUMMARY', datetime('now'));"

log_hook "success" "$AUDIT_SUMMARY"

# ---- Output warning if issues found ----
if [[ $ISSUES_FOUND -eq 1 ]]; then
  system_message "Security Audit: $AUDIT_SUMMARY Run 'pnpm audit' for details."
fi
