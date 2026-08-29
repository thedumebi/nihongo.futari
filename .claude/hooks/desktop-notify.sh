#!/bin/bash
# ============================================================================
# desktop-notify.sh — Notification hook (permission_prompt|idle_prompt, async)
#
# Sends a macOS desktop notification when Claude needs user input.
# macOS only — uses osascript. Silently exits on other platforms.
# ============================================================================

HOOK_NAME="desktop-notify"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input

# Only run on macOS
if [[ "$(uname)" != "Darwin" ]]; then
  exit 0
fi

NOTIFICATION_TYPE=$(get_field "notification_type")

case "$NOTIFICATION_TYPE" in
  permission_prompt)
    TITLE="Claude Code — Permission Required"
    MESSAGE="Claude needs your permission to continue."
    ;;
  idle_prompt)
    TITLE="Claude Code — Waiting for Input"
    MESSAGE="Claude is idle and waiting for your input."
    ;;
  *)
    TITLE="Claude Code"
    MESSAGE="Claude needs your attention."
    ;;
esac

osascript -e "display notification \"$MESSAGE\" with title \"$TITLE\" sound name \"Tink\"" 2>/dev/null || true

log_hook "success" "Notification sent: $NOTIFICATION_TYPE"
