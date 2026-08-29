Summarize a specific Claude Code session by its handle, UUID, or shortcut.

The argument is: $ARGUMENTS

## Step 0: Resolve `$ARGUMENTS` into a single full UUID

Sessions in the SQLite DB are keyed by UUID, but UUIDs are hard to read. This command accepts several friendlier forms — figure out which form `$ARGUMENTS` is, then resolve it to a single full UUID before running the queries below.

| Input form | Meaning |
|---|---|
| (empty) or `last` | Most recent session by `started_at DESC` |
| `today` | First session that started today (local date); `today#N` = Nth session today |
| `yesterday` | Same as `today` but for yesterday's date; `yesterday#N` for Nth |
| `YYYY-MM-DD` | First session on that date |
| `YYYY-MM-DD#N` | Nth session on that date (1-indexed, in chronological order) |
| 36-char UUID with dashes | Use as-is |
| 4–35 hex characters (UUID prefix) | `LIKE 'prefix%'` — must match exactly one session |
| Anything else | Error: list recent handles and ask the user to retry |

To resolve, run a single SQL query that uses a CTE for the per-day sequence and matches whichever shape applies. Example for a date-handle input like `2026-05-04#2`:

```bash
RAW="$ARGUMENTS"
SESSION_ID=$(sqlite3 "$CLAUDE_PROJECT_DIR/.claude/data/hooks.db" "
WITH ranked AS (
  SELECT
    id,
    started_at,
    DATE(started_at) AS day,
    ROW_NUMBER() OVER (PARTITION BY DATE(started_at) ORDER BY started_at) AS day_seq
  FROM sessions
)
SELECT id FROM ranked
WHERE day = '2026-05-04' AND day_seq = 2;
")
```

Adapt the `WHERE` clause based on the input shape. For the empty/`last` case:

```sql
SELECT id FROM sessions ORDER BY started_at DESC LIMIT 1;
```

For `today` (no `#N` suffix), pick the FIRST session of today — i.e., `day = DATE('now', 'localtime') AND day_seq = 1`. For `today#N`, use `day_seq = N`.

For a UUID prefix:

```sql
SELECT id FROM sessions WHERE id LIKE 'PREFIX%';
```

If the result is empty or returns more than one row:
- **Empty**: print "no session matched `<input>`" + run the `/sessions` query inline (limit 10) so the user can see what's available, then stop.
- **Multiple** (only possible for ambiguous UUID prefixes): list the matches with their handles and full UUIDs, ask the user to use a longer prefix or the handle, then stop.

If exactly one row matches, set `$SESSION_ID` to that UUID and print one line of confirmation:

```
Resolved "$RAW" → handle 2026-05-04#1, UUID 27a73ae7-...
```

(Look up the handle for the resolved UUID via the same `ranked` CTE so the confirmation line shows both forms.)

Now use `$SESSION_ID` in every query below.

## Step 1: Session info

```bash
sqlite3 -header -column "$CLAUDE_PROJECT_DIR/.claude/data/hooks.db" "
SELECT id, started_at, ended_at, end_reason, duration_seconds, model
FROM sessions
WHERE id = '$SESSION_ID';
"
```

## Step 2: Postmortem (if exists)

```bash
sqlite3 -header -column "$CLAUDE_PROJECT_DIR/.claude/data/hooks.db" "
SELECT files_changed, tool_uses, errors, warnings, summary, resolved
FROM postmortems
WHERE session_id = '$SESSION_ID';
"
```

## Step 3: Hook activity log

```bash
sqlite3 -header -column "$CLAUDE_PROJECT_DIR/.claude/data/hooks.db" "
SELECT hook_name, status, message, created_at
FROM hook_logs
WHERE session_id = '$SESSION_ID'
ORDER BY created_at;
"
```

## Step 4: Security audit (if exists)

```bash
sqlite3 -header -column "$CLAUDE_PROJECT_DIR/.claude/data/hooks.db" "
SELECT audit_summary, secrets_found, created_at
FROM security_audits
WHERE session_id = '$SESSION_ID';
"
```

## Output

Present a comprehensive summary combining all the above data, organized in this order:
- Session info (header — handle, UUID, started/ended, duration, model)
- Postmortem if present, or "No postmortem recorded"
- Hook activity counts (group by `hook_name, status` first; show the full log only on request or if the session is small)
- Security audit if present
- Outstanding items / notable events (errors, blocked tool calls, retries)

## Examples

```
/session-summary                                          # latest session
/session-summary last                                     # same as above
/session-summary today                                    # today's first session
/session-summary today#2                                  # today's second session
/session-summary yesterday                                # yesterday's first session
/session-summary 2026-05-03#3                             # third session on May 3, 2026
/session-summary 2026-05-04                               # first session on May 4
/session-summary 9bdc9286                                 # by UUID prefix (must be unique)
/session-summary 9bdc9286-9780-4d51-8611-651254c7ca52     # full UUID (always works)
```

Run `/sessions` to see all available handles.
