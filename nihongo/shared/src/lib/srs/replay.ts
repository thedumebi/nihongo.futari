import type { CardState, FsrsParams, ReviewEvent, ReviewSnapshot } from '@/types/srs.js'

import { emptyCardState } from './card.js'
import { applyReview } from './schedule.js'

export interface ReplayOptions {
  /** Hard cap on history length. Beyond this, only the tail is folded. */
  maxEvents?: number
  /** How many events to keep when truncating. */
  tailEvents?: number
  /**
   * Two reviews of the same card closer together than this, from DIFFERENT
   * devices, are treated as one: the later is superseded. Set 0 to disable.
   */
  dedupeWindowMs?: number
}

export interface ReplayResult {
  state: CardState
  snapshots: ReviewSnapshot[]
  /** Ids excluded from the fold by the double-review guard. Kept for audit. */
  supersededIds: string[]
  /** True when history exceeded `maxEvents` and only the tail was folded. */
  truncated: boolean
  /** Events actually folded, in the order they were applied. */
  appliedCount: number
}

const DEFAULTS = { maxEvents: 5000, tailEvents: 500, dedupeWindowMs: 2000 } as const

/**
 * Total order over review events.
 *
 * `reviewedAt` first, then `id`. The id tiebreak matters: two devices can
 * genuinely stamp the same millisecond, and without it the order would be
 * merely partial — which is enough to make the fold non-deterministic. Ids are
 * client-minted UUIDv7, so the tiebreak is also chronologically sensible.
 */
export function compareEvents(a: ReviewEvent, b: ReviewEvent): number {
  const at = a.reviewedAt.getTime()
  const bt = b.reviewedAt.getTime()
  if (at !== bt)
    return at - bt
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

/**
 * Fold a card's entire review history into its current state.
 *
 * This is THE correctness primitive of the offline design. `srs_review_logs` is
 * the source of truth; `srs_cards` is a cache of this function's output.
 *
 * The log set is a G-Set — grow-only, merged by union, keyed by a
 * client-minted id — and this fold is deterministic over it. Two devices that
 * both went offline therefore converge on identical state regardless of which
 * one syncs first, with no last-write-wins and nothing discarded.
 *
 * Full replay rather than an incremental rollback because FSRS stability and
 * difficulty are path-dependent recurrences: inserting a review in the middle
 * changes every value after it, and there is no commutative merge. It is cheap
 * — a card accrues on the order of fifty reviews in its lifetime.
 *
 * Deliberately takes no `now`: the result depends only on the events, so the
 * same history always folds to the same state.
 */
export function replay(events: readonly ReviewEvent[], params: FsrsParams = {}, options: ReplayOptions = {}): ReplayResult {
  const maxEvents = options.maxEvents ?? DEFAULTS.maxEvents
  const tailEvents = options.tailEvents ?? DEFAULTS.tailEvents
  const dedupeWindowMs = options.dedupeWindowMs ?? DEFAULTS.dedupeWindowMs

  const ordered = [...events].sort(compareEvents)

  const truncated = ordered.length > maxEvents
  const window = truncated ? ordered.slice(-tailEvents) : ordered

  if (window.length === 0) {
    // No history: an empty card anchored at the epoch, so the result stays
    // independent of wall-clock time. Callers seeding a genuinely new card
    // should use `emptyCardState(now)` directly.
    return {
      state: emptyCardState(new Date(0)),
      snapshots: [],
      supersededIds: [],
      truncated: false,
      appliedCount: 0
    }
  }

  // Anchor the starting card at the first review, not at `now`.
  let state = emptyCardState(window[0]!.reviewedAt)
  const snapshots: ReviewSnapshot[] = []
  const supersededIds: string[] = []

  let lastApplied: ReviewEvent | undefined

  for (const event of window) {
    if (
      dedupeWindowMs > 0
      && lastApplied
      && event.clientId
      && lastApplied.clientId
      && event.clientId !== lastApplied.clientId
      && event.reviewedAt.getTime() - lastApplied.reviewedAt.getTime() < dedupeWindowMs
    ) {
      // Same card answered on two devices within the window — almost certainly
      // one action double-reported. Keep the first, record the second.
      supersededIds.push(event.id)
      continue
    }

    const { state: next, snapshot } = applyReview(state, event, params)
    state = next
    snapshots.push(snapshot)
    lastApplied = event
  }

  return { state, snapshots, supersededIds, truncated, appliedCount: snapshots.length }
}

/**
 * Whether a batch of incoming events can take the cheap path.
 *
 * True when every new event is strictly later than the card's last review, so
 * they can be applied on top of the cached state. Any event landing earlier
 * means the cache is stale and the caller must `replay()` the full history.
 */
export function canFastForward(cached: CardState, incoming: readonly ReviewEvent[]): boolean {
  if (!cached.lastReview)
    return cached.reps === 0
  const last = cached.lastReview.getTime()
  return incoming.every(e => e.reviewedAt.getTime() > last)
}
