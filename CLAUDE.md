# nihongo.futari — working rules

**The product is called `go`** — from 語, the suffix that means "language"
(日本語, 英語, フランス語). The repo keeps the `nihongo.futari` name, but nothing
user-facing should be Japanese-specific: a language is a COURSE inside the app,
never the brand. The icon is 言, the speech radical inside 語.

A language-learning PWA. Japanese first, built so other languages can follow.
Sibling to `dmb.futari` and `abm.futari`; shares their VPS, Caddy edge, Postgres
and Redis.

## Types: define once, never redefine

**This is the rule to break least.** Every shape has exactly one definition, and
everything else derives from it.

1. **All exported types and interfaces live in `nihongo/shared/src/types/`**,
   one file per domain, re-exported from `types/index.ts`. Not in schema files,
   not in route files, not in components.

2. **A Drizzle table is the source of truth for anything persisted.** Derive
   with `$inferSelect` / `$inferInsert`:

   ```ts
   // shared/src/types/kanji.ts
   import type { kanji } from '@/db/schema/kanji.js'

   export type Kanji = typeof kanji.$inferSelect
   export type NewKanji = typeof kanji.$inferInsert
   ```

   Schema files (`shared/src/db/schema/*.ts`) export **tables and relations
   only** — no `export type`.

3. **A Zod schema is the source of truth for anything validated at runtime**
   (request bodies, API responses, enrichment output, config). Derive with
   `z.infer`, never hand-write the matching interface:

   ```ts
   export const answerSchema = z.object({ cardId: z.string(), rating: z.number() })
   export type AnswerInput = z.infer<typeof answerSchema>
   ```

   `drizzle-zod`'s `createSelectSchema` / `createInsertSchema` are fine when you
   need a *runtime* schema for a table — then the type comes from `z.infer` of
   that, and you do **not** also add an `$inferSelect` alias for the same shape.

4. **Never write an interface that restates a shape that already exists.** No
   `interface KanjiDto { character: string; strokeCount: number }` next to a
   `Kanji` that already says it. Narrow with `Pick`, `Omit`, `Partial` instead.

5. One shape, one derivation chain. If you find yourself typing the same field
   list twice, the second one is a bug.

> Gotcha found the hard way: `drizzle-zod@0.5.1` resolves its own `zod`
> instance, so `.openapi()` from `@hono/zod-openapi` is **not** chainable off
> `createSelectSchema(...)`. Apply `.openapi()` to schemas built with the `z`
> re-exported from `@hono/zod-openapi`.

## Stack

pnpm 9 + Turbo 2 monorepo. Node 22.17.0.
`nihongo/{frontend,backend,shared}` + `packages/{eslint-config,typescript-config}`.

- **Frontend** — Vue 3.5, Vite 7, Pinia, vue-router, Tailwind v4 (CSS-first
  `@theme` in `style.css`), lucide-vue-next. Hand-rolled UI components.
- **Backend** — Hono 4, `@hono/zod-openapi`, Scalar docs, Drizzle 0.45,
  Postgres 16, ioredis, `rate-limiter-flexible`, better-auth 1.4, pino. Port 3008.
- **Shared** — `@nihongo/shared`, subpath exports (`./db`, `./db/schema`,
  `./types`, `./env`, `./emails`, `./constants`, `./middlewares`, `./openapi`,
  `./lib`, `./utils`).

## Conventions

- **kebab-case filenames**, enforced by `unicorn/filename-case`. Vue SFCs too.
- No semicolons, single quotes, 2-space indent, no trailing commas.
- `node/no-process-env: error` — all env access goes through `@nihongo/shared/env`.
- Zod v4, re-exported from `@hono/zod-openapi` so schemas double as OpenAPI
  components.
- **Three-file route trio** per domain under `backend/src/routes/<domain>/`:
  `<domain>.routes.ts` (createRoute configs + exported route types),
  `<domain>.handlers.ts` (typed handlers), `<domain>.index.ts` (router; register
  literal paths **before** `/:id`). All DB access lives in
  `backend/src/services/<domain>.service.ts` — never in a handler.
- Paths come from `shared/src/constants/endpoints.ts`. Don't hard-code a URL.
- **Migrations: `drizzle-kit generate` + reviewed SQL.** Never hand-written,
  never `push`. Generate first, then edit the file it produced. Hand-writing the
  `.sql` and registering it yourself skips the snapshot Drizzle needs and breaks
  the NEXT generate, not yours — it happened three times running. Full rule and
  the repair procedure: `.claude/rules/migrations.md`.

## Domain rules that are not negotiable

- **`study_items` polymorphism is an exclusive arc** — N nullable FKs plus
  `CHECK (num_nonnulls(...) = 1)`. If a new content kind appears, add a table and
  an arm. **Never add `payload jsonb`.**
- **`srs_review_logs` is the source of truth; `srs_cards` is a derived cache.**
  Card state is a deterministic fold over the log. Conflicts resolve by replay,
  never last-write-wins, and no review is ever discarded.
- **Derived aggregates must be replay-safe.** Anything counted (XP, streaks,
  daily stats, achievements) is either keyed by log id
  (`xp_events unique(userId, source, refId)`) or recomputed wholesale
  (`srs_daily_stats` DELETE+INSERT). Increments double-count under replay.
- **Sourced etymology and invented mnemonics are separate tables with separate
  UI.** `etymology_entries` carries citations, confidence and disputed markers
  and cannot be published without a source *and* a reviewer — enforced by CHECK
  constraints, not by convention. `mnemonics` has none of that and is always
  labelled as invented. They share zero code, deliberately.
- **Enrichment is grounded, never free-generated.** The model only ever explains
  source material passed to it in the grounding packet. No packet → no
  generation → queue `needs-source`. Every returned quote must be a literal
  substring of the input, and every `sourceId` must be one that was passed in;
  otherwise auto-reject. Nothing AI-generated reaches a user unreviewed.
- **Furigana is precomputed at import**, never aligned at render time.
- **Timezones**: store IANA zone on the user, compute local date at write time
  with luxon, day boundary is 4am local.

## Auth

**One sign-in for everyone.** `admin` is a role on an ordinary account, not a
separate door — there is deliberately no `/admin/login`. An admin signs in at
`/login` like a learner; the admin surface is gated by `user.role`, re-read from
the database on every admin request (`middlewares/admin.ts`) so promote/demote
takes effect without re-issuing the session.

**Passwordless first.** The primary path is a one-time code by email
(`emailOTP`). Nobody should have to invent a password to practise vocabulary.
Email+password still works for people who prefer a password manager, but nothing
requires it.

**Signup is a policy, not a boolean** — `SIGNUP_MODE` in the env:

| Mode | Behaviour |
|---|---|
| `closed` | No self-signup; an admin creates accounts |
| `invite` | A code must be reserved against the address first (**default**) |
| `open` | Anyone with an email address |

Invites are minted by an admin (`POST /invites`, returns a shareable
`/signup?code=…` link), optionally bound to one email, with a use limit and an
expiry. `SIGNUP_ALLOWED_DOMAINS` is an additional gate that applies in every
mode.

The gate lives in better-auth's `databaseHooks.user.create.before` — the ONE
place both signup paths converge, so neither OTP nor password can slip past it.
Signup is two steps (validate the code, then create the account), and better-auth
owns the second, so the code is bound to the email in `invite_reservations`
first rather than smuggled through better-auth's request body. A reservation
does not spend the code: an abandoned signup returns it to circulation.

**When adding a field to `users`, update `auth.ts` `additionalFields` too.**
They drifted apart once already and `timezone` silently fell back to UTC, which
would have broken every streak and daily-stat row.

## Claude tooling in this repo

Mirrors `ofuma`'s setup. `.claude/` contains:

- **Media** — audio and illustrations are produced by CLI on a laptop and
  served from R2, never from the image. How to make more of either, and the
  house style every drawing must satisfy, is in `.claude/rules/media.md`.
  Illustrations are hand-authored SVG; no image API is configured.
- **`rules/`** — path-scoped rules loaded automatically when you touch matching
  files. `shared-types.md` and `shared-schema.md` carry the types rule above;
  `srs.md` and `etymology.md` carry the invariants that are expensive to get
  wrong.
- **`hooks/`** — wired in `.claude/settings.json`.
  - `check-conventions.sh` (PreToolUse) **blocks** edits that: add a type export
    to a Drizzle schema file, use `$inferSelect`/`$inferInsert` outside
    `shared/src/types/`, hardcode an API path, or add a service without a test.
  - `protect-files.sh` blocks edits to lockfiles, `.env*`, `dist/`, migration
    journals and the hooks DB.
  - `block-dangerous-bash.sh` (PreToolUse on Bash), `lint-and-typecheck.sh`
    (PostToolUse), plus session start/end, postmortem and security-audit hooks.
  - Session history goes to a SQLite DB at `.claude/data/hooks.db` (gitignored).
- **`commands/`** — `/new-route`, `/new-schema`, `/new-feature`, `/session-summary`.
- **`agents/`** — the `code-review-*` reviewer set.
- **`.claudeignore`** and a `permissions.deny` list keep `.env*` and secrets out
  of reach.

If a hook blocks you, fix the violation — don't route around it. They encode the
rules above.

## Commands

Run from the repo root (`cd` triggers an nvm hook — prefer `pnpm -C <dir>`):

```
pnpm install
pnpm -C nihongo/shared build      # backend and frontend depend on this
pnpm lint / lint:fix / typecheck / test / build
pnpm -C nihongo/shared drizzle:generate
```

Turbo caches lint; a passing `turbo lint` can still hide errors from a cached
run. Verify with `pnpm -C <workspace> exec eslint .`.

## Deployment

Shares dmb's infrastructure. `docker-compose.prod.yml` builds only backend +
frontend, joined to the external `futari` network, against `dmb-postgres`
(database `nihongo`) and `dmb-redis`. The Caddyfile here is intentionally inert —
routing lives in `dmb.futari/Caddyfile`.
