# go

A language-learning PWA (repo: `nihongo.futari`). Japanese first, built so other
languages can follow — the name comes from 語, the suffix meaning "language".

The thing that makes it different: it explains **why**. Not just "〜てしまう means
regret" but where です came from, why 山 is やま alone and さん in 火山, and why
learning 青 = セイ makes 晴・清・請・精・静 predictable instead of five separate
memorisations. Sourced, cited, and never confused with an invented mnemonic.

Sibling to [`dmb.futari`](../dmb.futari) and [`abm.futari`](../abm.futari);
shares their VPS, Caddy edge, Postgres and Redis.

## Stack

pnpm 9 + Turbo 2 monorepo on Node 22.17.0.

| Workspace | What |
|---|---|
| `nihongo/frontend` | Vue 3.5 + Vite 7 + Pinia + Tailwind v4, served by nginx |
| `nihongo/backend` | Hono 4 + Drizzle + Postgres 16 + Redis + better-auth, port 3008 |
| `nihongo/shared` | `@nihongo/shared` — schema, types, env, email, OpenAPI helpers |

Spaced repetition is [FSRS](https://github.com/open-spaced-repetition/ts-fsrs)
via `ts-fsrs`, not a hand-rolled SM-2.

## Setup

```bash
pnpm install
cp nihongo/backend/.env.example nihongo/backend/.env      # fill in the secret
cp nihongo/frontend/.env.example nihongo/frontend/.env

docker compose up -d postgres redis     # dev Postgres on 5434, Redis on 6381
pnpm -C nihongo/shared build            # backend + frontend depend on this
pnpm create:db                          # creates the `nihongo` database
pnpm -C nihongo/backend db:migrate
pnpm -C nihongo/backend db:seed         # languages, JLPT levels, sources, templates
pnpm dev                                # frontend :5175, backend :3008
```

Dev ports are offset from dmb's and abm's so all three stacks can run at once.

## Content

Vocabulary comes from open datasets, imported locally (never on the VPS — JMdict
is 63 MB of XML):

```
pnpm -C nihongo/backend import:n5         # JMdict + KANJIDIC2 -> words & kanji
pnpm -C nihongo/backend import:n5-study   # -> study items, facets, drills
pnpm -C nihongo/backend import:conjugation # -> conjugation drills for every verb
pnpm -C nihongo/backend import:kanji      # all 2,136 jōyō, as reference data
pnpm -C nihongo/backend import:phonetics  # -> sound series, derived from CHISE + KANJIDIC
pnpm -C nihongo/backend audio:kana        # pronunciation audio (macOS `say`)
pnpm -C nihongo/backend audio:words
```

Datasets cache in `.data/` and audio lands in `nihongo/frontend/public/audio/`.
Both are gitignored — the audio is ~8 MB for N5 alone and grows per level, so
production serves it from R2 instead.

The JLPT level list is used only as an index of *which* words are N5; every
gloss, part of speech and sense comes from JMdict, which is the canonical,
properly-licensed source.

## Scripts

| Command | Does |
|---|---|
| `pnpm dev` | Run every workspace in watch mode |
| `pnpm build` / `lint` / `typecheck` / `test` | Across all workspaces via Turbo |
| `pnpm create:db` / `pnpm drop:db` | Create or drop the local database |
| `pnpm -C nihongo/backend db:migrate` | Apply migrations |
| `pnpm -C nihongo/backend db:seed` | Apply tracked SQL seeds (idempotent) |
| `pnpm -C nihongo/shared drizzle:generate` | Generate a migration from schema changes |

Turbo caches lint, so a passing `turbo lint` can hide errors from a cached run —
verify with `pnpm -C <workspace> exec eslint .`.

Note: `cd` triggers an nvm hook in some shells here. Prefer `pnpm -C <dir>`.

## Accounts

One sign-in for everyone at `/login` — `admin` is a role on a normal account,
not a separate login. The default path is passwordless: enter your email, get a
6-digit code. Password sign-in is available if you prefer it.

Signup is controlled by `SIGNUP_MODE` (`closed` | `invite` | `open`, default
`invite`). To invite someone, mint a code from the admin dashboard and send them
the `/signup?code=…` link it returns. Codes can be bound to one address, given a
use limit, and expire.

Create the first admin with `pnpm -C nihongo/backend admin:create -- --email you@example.com`,
then mint invites from the dashboard. Nothing self-promotes to admin, so this is
needed even in `open` mode.

## Content

The factual spine is open data — JMdict, KANJIDIC2, KanjiVG, Tatoeba, kanjium,
CHISE IDS, EDRDG phonetic components — imported by a pipeline that never
clobbers reviewed work. Claude enriches on top, but only ever *explaining source
material passed to it*: no grounding packet means no generation, every citation
must be a literal substring of the input, and nothing reaches a reader without a
human reviewer. The database enforces the last part with CHECK constraints.

JMdict/KANJIDIC are CC BY-SA 4.0, KanjiVG CC BY-SA 3.0, Tatoeba CC BY 2.0 FR.
Attribution is an obligation, not a courtesy — see `/attribution`.

## Reminders

Daily nudges go out by email and (where the browser allows it) web push. There
is no in-app scheduler — the same host-cron pattern as the nightly backup:

```cron
*/15 * * * * curl -fsS -X POST https://nihongo.futari.live/api/notifications/run-reminders \
  -H "x-cron-secret: $CRON_SECRET" >> /home/deploy/reminders.log 2>&1
```

Every 15 minutes is deliberate: the endpoint only sends to users whose chosen
hour has arrived **in their own timezone**, so it has to be checked more often
than hourly. Sends are idempotent per user per local day via a unique dedupe
key, so overlapping or retried runs cannot double-send.

Push needs VAPID keys (`npx web-push generate-vapid-keys` → `VAPID_PUBLIC_KEY`,
`VAPID_PRIVATE_KEY`). Without them push is simply unavailable and email still
works. On iPhone and iPad, push only works once the app is added to the Home
Screen, and not at all for PWAs in the EU since Apple's DMA change — so push is
always an enhancement here, never the only channel.

## Deployment

Shares dmb's infrastructure on one Hetzner box. `docker-compose.prod.yml` builds
only backend + frontend, joined to the external `futari` network, against
`dmb-postgres` (database `nihongo`) and `dmb-redis`. The `Caddyfile` here is
intentionally inert — routing lives in `dmb.futari/Caddyfile`, which already has
the `nihongo.futari.live` block.

Deploys run from `.github/workflows/deploy-vps.yaml` on push to `master`.

Step-by-step for the first deploy — DNS, the shared database, encrypted config,
cron and verification — is in [DEPLOY.md](DEPLOY.md).

## Working on this

Read `CLAUDE.md`. The short version: **every shape has exactly one definition** —
types live in `nihongo/shared/src/types/`, derived from Drizzle tables or Zod
schemas, never hand-written twice. Hooks in `.claude/` enforce it.
