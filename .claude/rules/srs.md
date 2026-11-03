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

FSRS runs **only on the server**. `@nihongo/shared/lib/srs` wraps `ts-fsrs`
(`applyReview` for one answer, `replay` for a whole history) with the user's
`fsrsParams`, and the backend service is its only caller for scheduling. It
lives in the shared package so the fold is one tested implementation, not so the
client can run it.

The client never computes card state. It stamps an answer, queues it in
IndexedDB (`enqueueAnswer` in `frontend/src/offline/db.ts`, flushed by
`offline/sync.ts`; other writes go through `offline/queue.ts`), and takes card
state from the server's responses. Do not add a client-side prediction of due
dates: two implementations of the fold is how divergence becomes a design
property instead of a bug.

## Clock skew

The client keeps no clock offset. It sends `reviewedAt` as raw device time
(`new Date().toISOString()` when the answer is given, in `views/study.vue`);
there is no separate client-time field in `submitAnswerSchema`. The server keeps
that raw value in `srs_review_logs.client_reviewed_at` for audit, and clamps it
with `clampReviewedAt` (`shared/src/lib/srs/clock.ts`) against the moment it
was received:

- `reviewedAt > receivedAt + 5min` → clamp to `receivedAt`
- `reviewedAt < receivedAt - 30d` → clamp to `receivedAt - 30d`

Either clamp sets `clockAdjusted = true` on the log and in the response. Nothing
else moves a review: it is dated when the learner answered, never when it
arrived. An answer older than the card's last review takes the slow path and is
replayed into its place; it is **not** re-dated to after the newest (that clamp
existed, and made card state depend on sync order). The fold orders by
`(reviewed_at, id)`, so equal timestamps are still a total order. Every date
stamped from an answer (`first_seen_at`, `last_correct_at`, `ghost_since`, a
miss's `cleared_at`) is the answer's time too.

The answer, study queue, due list and sync responses carry `serverTime`. The client uses it
only for display: the Due list (`views/due.vue`) measures how overdue a card is
against the server's clock, so a skewed phone does not report everything as
days late. It is never used to adjust a stamp.

## Timezones

Store the IANA zone on the user, kept in step with the device. Compute the
local date with luxon **at write time** and store it on the stats row. The day
runs **midnight to midnight local** by default (`DEFAULT_DAY_BOUNDARY_HOUR` in
the shared lib); the learner can pick a later hour in Settings, so always pass
their own `dayBoundaryHour` — never a literal. Never derive "today" from the
server clock.

## Ghost reviews

Flag when `lapses >= ghostThreshold` or rolling-10 accuracy drops below 0.6.
Effect: shorten the interval by `ghostIntervalFactor`, and draw the next prompt
from the facet's template pool **excluding the template it keeps failing**.
Clear after 3 consecutive correct (Hard or better; Again ends the run) when
either the next interval is >= 7d or the run itself spans >= 7d, first answer
to last (`streakSpanDays`). The boss and Recall never count: only real reviews. All thresholds come from
`user_settings` / `language_features.config` — never hardcode them.
