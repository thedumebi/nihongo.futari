---
paths:
  - "*/shared/src/lib/srs/**/*.ts"
  - "*/backend/src/services/srs.service.ts"
  - "*/backend/src/services/sync.service.ts"
  - "*/backend/src/routes/study/**/*.ts"
  - "*/backend/src/routes/sync/**/*.ts"
---

# SRS & Offline Sync

The subtlest code in the project. Get these invariants wrong and the corruption
is silent.

## The log is the truth

`srs_review_logs` is append-only and authoritative. `srs_cards` is a
**derived cache** — card state is a deterministic fold over that log.

Formally the log set is a G-Set: grow-only, merge = union, keyed by a
client-minted UUIDv7. Two devices that both went offline converge on identical
state regardless of which syncs first. That is the entire correctness argument,
and every change here has to preserve it.

## Conflicts resolve by replay, never last-write-wins

On sync, insert logs with `ON CONFLICT (id) DO NOTHING` (idempotent — a retried
flush is free). Then per card:

- **Fast path** — every new log is later than `card.lastReview`: apply
  sequentially.
- **Slow path** — any new log lands *before* `card.lastReview`: reload the
  card's full history ordered by `(reviewed_at, id)`, reset to an empty card,
  re-apply every log, rewrite each log's `*Before`/`*After` snapshot, bump
  `replayGeneration` and `historyVersion`.

Full replay rather than a rollback, because FSRS stability and difficulty are
path-dependent recurrences — there is no commutative merge. It is cheap: a card
accrues O(50) logs in its lifetime.

**No review is ever discarded.**

## Derived aggregates are where this actually breaks

Card replay is easy. XP, streaks, daily stats, achievements and ghost flags are
naturally written as increments, and increments double-count under replay.
Every derived write must be either:

- **keyed by log id** — `xp_events` has `unique(userId, source, refId)`; or
- **recomputed wholesale** — `srs_daily_stats` is DELETE+INSERT for the
  affected local dates, never `+= 1`.

**Required test:** for any permutation of a log set, final card state *and all
aggregates* are byte-identical. If that test doesn't exist, assume this is broken.

## One FSRS implementation

`@nihongo/shared/lib/srs` wraps `ts-fsrs` and is imported by **both** the
backend service and the Vue client, with the user's `fsrsParams`. The client
runs the identical function against its local snapshot so its predicted due
dates match what the server will compute. Any divergence is then a bug in one
place, not a design property.

## Clock skew

Every API response carries `serverTime`; the client stamps `reviewedAt` with its
tracked offset and also sends the raw `clientReviewedAt`. The server clamps:

- `reviewedAt > receivedAt + 5min` → clamp to `receivedAt`
- `reviewedAt <= previousLog.reviewedAt` → clamp to `previousLog.reviewedAt + 1ms`

Either clamp sets `clockAdjusted = true`. This guarantees a strict total order
per card, which replay depends on.

## Timezones

Store the IANA zone on the user. Compute the local date with luxon **at write
time** and store it on the stats row. The day boundary is **4am local**, not
midnight — people study before bed. Never derive "today" from the server clock.

## Ghost reviews

Flag when `lapses >= ghostThreshold` or rolling-10 accuracy drops below 0.6.
Effect: shorten the interval by `ghostIntervalFactor`, and draw the next prompt
from the facet's template pool **excluding the template it keeps failing**.
Clear after 3 consecutive correct at intervals >= 7d. All thresholds come from
`user_settings` / `language_features.config` — never hardcode them.
