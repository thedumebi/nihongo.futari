export interface ClampOptions {
  /** How far ahead of the server a client stamp may sit before being pulled back. */
  futureToleranceMs?: number
  /** Reviews older than this are treated as a broken clock, not real history. */
  maxBacklogMs?: number
}

export interface ClampResult {
  reviewedAt: Date
  adjusted: boolean
  reason?: 'future' | 'stale' | 'not-after-previous'
}

const DEFAULTS = {
  futureToleranceMs: 5 * 60 * 1000, // 5 minutes
  maxBacklogMs: 30 * 24 * 60 * 60 * 1000 // 30 days
} as const

/**
 * Pull a client-supplied review time into something the fold can trust.
 *
 * Device clocks are wrong more often than people expect — a phone that has been
 * off for a week, a manually-set date, a timezone bug. Two guarantees matter
 * downstream:
 *
 *   1. A review never claims to have happened in the future.
 *   2. A review is never at or before the previous review on the same card,
 *      so the per-card order is strictly total. `replay()` depends on this.
 *
 * Every clamp is reported so the caller can persist `clockAdjusted` and the
 * data stays auditable rather than silently rewritten.
 */
export function clampReviewedAt(
  clientReviewedAt: Date,
  receivedAt: Date,
  previousReviewedAt: Date | null,
  options: ClampOptions = {}
): ClampResult {
  const futureTolerance = options.futureToleranceMs ?? DEFAULTS.futureToleranceMs
  const maxBacklog = options.maxBacklogMs ?? DEFAULTS.maxBacklogMs

  let ms = clientReviewedAt.getTime()
  let adjusted = false
  let reason: ClampResult['reason']

  if (ms > receivedAt.getTime() + futureTolerance) {
    ms = receivedAt.getTime()
    adjusted = true
    reason = 'future'
  } else if (ms < receivedAt.getTime() - maxBacklog) {
    ms = receivedAt.getTime() - maxBacklog
    adjusted = true
    reason = 'stale'
  }

  if (previousReviewedAt && ms <= previousReviewedAt.getTime()) {
    ms = previousReviewedAt.getTime() + 1
    adjusted = true
    reason = 'not-after-previous'
  }

  return { reviewedAt: new Date(ms), adjusted, ...(reason ? { reason } : {}) }
}
