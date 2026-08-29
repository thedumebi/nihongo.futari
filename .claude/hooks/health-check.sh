#!/bin/bash
# ============================================================================
# health-check.sh — SessionStart hook (startup|resume)
#
# Simple confirmation that hooks are loaded and working. Outputs a
# systemMessage so you see it in the session.
# ============================================================================

HOOK_NAME="health-check"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input

SESSION=$(get_field "session_id")
SOURCE=$(get_field "source")
MODEL=$(get_field "model")

log_hook "success" "Hooks active. Session $SESSION ($SOURCE) using $MODEL"

system_message "Hooks active. Session $SESSION started ($SOURCE)."
