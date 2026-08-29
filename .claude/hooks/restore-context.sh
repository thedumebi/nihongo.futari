#!/bin/bash
# ============================================================================
# restore-context.sh — SessionStart hook (compact)
#
# When context gets compacted (long sessions filling the context window),
# critical project rules can be lost. This hook re-injects the ones that are
# expensive to rediscover and expensive to get wrong.
#
# Single-project monorepo: workspaces live under nihongo/{backend,frontend,shared}
# and the shared package is @nihongo/shared.
# ============================================================================

HOOK_NAME="restore-context"
HOOK_DIR="$(cd "$(dirname "$0")" && pwd)"
source "$HOOK_DIR/lib/common.sh"

read_input

log_hook "success" "Context compacted — re-injecting critical rules"

additional_context "CRITICAL PROJECT RULES (restored after compaction):

nihongo.futari — a Japanese-learning PWA. Workspaces: nihongo/{backend,frontend,shared} plus packages/{eslint-config,typescript-config}. Shared package is @nihongo/shared. Full detail in CLAUDE.md and .claude/rules/.

1. TYPES — DEFINE ONCE, NEVER REDEFINE. This is the rule to break least.
   - ALL exported types live in \`nihongo/shared/src/types/\`, one file per domain.
   - Drizzle tables are the source of truth for persisted shapes; derive with \`typeof x.\$inferSelect\` / \`\$inferInsert\` IN THE TYPES FILE.
   - Schema files (\`shared/src/db/schema/*.ts\`) export TABLES AND RELATIONS ONLY — no \`export type\`.
   - Zod schemas are the source of truth for runtime-validated shapes; derive with \`z.infer\`.
   - Never hand-write an interface that restates an existing shape. Narrow with Pick/Omit/Partial.
   A PreToolUse hook blocks violations of this — if it fires, move the type, do not work around it.

2. ENDPOINT CONSTANTS: never hardcode a URL. Everything is in \`shared/src/constants/endpoints.ts\` at three levels: ROUTE_BASE_PATHS, {DOMAIN}_ROUTES, API_ENDPOINTS. Import from \`@nihongo/shared/constants\`.

3. BACKEND ROUTES: three-file trio per domain under \`backend/src/routes/<domain>/\` — \`.routes.ts\` (createRoute configs), \`.handlers.ts\` (typed handlers), \`.index.ts\` (router; literal paths registered BEFORE /:id). All DB access lives in \`backend/src/services/<domain>.service.ts\`, never in a handler.

4. OWNERSHIP SCOPING: every srs_cards, srs_review_logs, user_* and progress query MUST be scoped by userId from c.var.session. A missing user scope is a data-leak bug.

5. SRS INVARIANTS:
   - \`srs_review_logs\` is the source of truth; \`srs_cards\` is a derived cache. Card state is a deterministic fold over the log.
   - Conflicts resolve by REPLAY in reviewedAt order, never last-write-wins. No review is ever discarded.
   - Derived aggregates must be replay-safe: keyed by log id (xp_events unique(userId, source, refId)) or recomputed wholesale (srs_daily_stats DELETE+INSERT). Increments double-count under replay.

6. THE WHY LAYER: sourced \`etymology_entries\` and invented \`mnemonics\` are SEPARATE tables with separate UI and zero shared code. Etymology cannot be published without a source AND a reviewer — enforced by CHECK constraints. Enrichment is grounded: the model only explains source material passed to it; no grounding packet means no generation.

7. POLYMORPHISM: \`study_items\` uses an exclusive arc (N nullable FKs + CHECK num_nonnulls = 1). New content kind means a new table and a new arm. NEVER add \`payload jsonb\`.

8. MIGRATIONS: \`pnpm -C nihongo/shared drizzle:generate\` plus reviewed SQL. Never \`drizzle-kit push\` — this DB holds a large imported corpus.

9. STYLE: kebab-case filenames (enforced), no semicolons, single quotes, 2-space indent, no trailing commas. All env access through \`@nihongo/shared/env\` (\`node/no-process-env\` is an error). Icons are lucide-vue-next components; colours are the Tailwind v4 @theme tokens in frontend/src/style.css.

10. COMMANDS: \`cd\` triggers an nvm hook in this shell — prefer \`pnpm -C <dir> <script>\`. Build shared before backend/frontend. Turbo caches lint, so a passing \`turbo lint\` can hide errors: verify with \`pnpm -C <workspace> exec eslint .\`.

11. COMPLETE IMPLEMENTATIONS: no TODOs, placeholders, mock data, or simplified versions.

SESSION HISTORY DATABASE (restored):
SQLite DB at $DB_PATH — query with sqlite3 when the user asks about past sessions, postmortems, or hook logs.
Tables: sessions, conversations, postmortems (has 'resolved' column), hook_logs, security_audits."
