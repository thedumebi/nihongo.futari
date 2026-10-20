import type { GhostEvent, GhostPolicy, SrsRating } from '@/types/srs.js'

import { SRS_RATINGS } from '@/types/srs.js'

export interface GhostInput {
  ghost: boolean
  lapses: number
  consecutiveCorrect: number
  scheduledDays: number
  /** Most recent ratings, newest last. Only `policy.recentWindow` are read. */
  recentRatings: readonly SrsRating[]
  /** Days from the first answer of the current right-answer run to this one. */
  streakSpanDays?: number
}

export interface GhostDecision {
  ghost: boolean
  event: GhostEvent | null
  reason: string | null
  /** Multiplier to apply to the next interval. 1 = leave it alone. */
  intervalFactor: number
}

/**
 * Decide whether a card is "haunting" the learner.
 *
 * Plain lapse counting misses the card you keep half-remembering, so accuracy
 * over a recent window is a second trigger. A ghosted card gets a shortened
 * interval and, at the call site, a prompt drawn from anything EXCEPT the
 * template it keeps failing — repeating the same failing prompt is what makes
 * these cards feel like a wall.
 *
 * Every threshold arrives as config (`user_settings` / `language_features`),
 * never a constant in here.
 */
export function evaluateGhost(input: GhostInput, policy: GhostPolicy): GhostDecision {
  const recent = input.recentRatings.slice(-policy.recentWindow)
  const correct = recent.filter(r => r !== SRS_RATINGS.AGAIN).length
  const accuracy = recent.length > 0 ? correct / recent.length : 1

  if (input.ghost) {
    // Right enough times in a row, and either spread over a week or already
    // scheduled a week out. A ghost's intervals are halved, so the run alone
    // can take a fortnight to reach a week's interval; three right answers
    // a week apart from first to last show it is held just as well. A run
    // inside a few days proves less, and waits for the interval.
    const span = input.streakSpanDays ?? 0
    const recovered
      = input.consecutiveCorrect >= policy.clearAfterCorrect
        && (input.scheduledDays >= policy.clearMinIntervalDays || span >= policy.clearMinIntervalDays)

    if (recovered) {
      return { ghost: false, event: 'cleared', reason: 'recovered', intervalFactor: 1 }
    }

    const worsened = input.lapses >= policy.threshold * 2
    return {
      ghost: true,
      event: worsened ? 'escalated' : null,
      reason: worsened ? 'lapses-doubled' : null,
      intervalFactor: policy.intervalFactor
    }
  }

  const byLapses = input.lapses >= policy.threshold
  const byAccuracy = input.lapses >= 3 && recent.length >= 3 && accuracy < policy.recentAccuracyFloor

  if (byLapses || byAccuracy) {
    return {
      ghost: true,
      event: 'flagged',
      reason: byLapses ? 'lapse-threshold' : 'low-recent-accuracy',
      intervalFactor: policy.intervalFactor
    }
  }

  return { ghost: false, event: null, reason: null, intervalFactor: 1 }
}

/**
 * How many days the current run of right answers covers: from its first
 * answer to the newest. Ratings oldest first; Again ends a run.
 */
export function streakSpanDays(recent: ReadonlyArray<{ rating: number, reviewedAt: Date }>): number {
  const last = recent.at(-1)
  if (!last || last.rating === 1)
    return 0
  let first = last
  for (let i = recent.length - 1; i >= 0 && recent[i]!.rating !== 1; i--)
    first = recent[i]!
  return (last.reviewedAt.getTime() - first.reviewedAt.getTime()) / 86_400_000
}

/** Shorten a ghosted card's interval, capped so it never runs away. */
export function applyGhostInterval(scheduledDays: number, decision: GhostDecision, policy: GhostPolicy): number {
  if (!decision.ghost)
    return scheduledDays
  const shortened = Math.round(scheduledDays * decision.intervalFactor)
  return Math.max(1, Math.min(shortened, policy.maxGhostIntervalDays))
}
