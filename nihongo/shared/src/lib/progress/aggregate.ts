import type { AggregateEvent, AggregateResult, DailyStat, XpAward } from '@/types/progress.js'

import { xpForReview } from '@/types/progress.js'
import { SRS_RATINGS } from '@/types/srs.js'

import { studyDateFor } from './study-day.js'

export interface AggregateOptions {
  timezone: string
  dayBoundaryHour?: number
}

/**
 * Fold a set of reviews into per-day statistics and XP awards.
 *
 * PURE, ORDER-INDEPENDENT, AND TOTAL. Those three properties are the whole
 * point:
 *
 * - **Pure** — no clock, no randomness, no I/O. The same events always produce
 *   the same result.
 * - **Order-independent** — every value is a sum or a count over the input set,
 *   so shuffling the input cannot change the output. That is what makes it
 *   safe under replay, where reviews genuinely do arrive out of order.
 * - **Total** — it recomputes affected days from scratch rather than adjusting
 *   a running counter. `affectedDates` tells the caller exactly which rows to
 *   DELETE and re-INSERT.
 *
 * XP awards are keyed by log id so the database's
 * `unique(userId, source, refId)` turns a re-emit into a no-op. Between these
 * two mechanisms — recompute-wholesale for stats, key-by-log-id for XP —
 * nothing here can double-count.
 */
export function aggregateReviews(
  events: readonly AggregateEvent[],
  options: AggregateOptions
): AggregateResult {
  const { timezone, dayBoundaryHour = 4 } = options

  const byDate = new Map<string, DailyStat>()
  const xp: XpAward[] = []

  for (const event of events) {
    const localDate = studyDateFor(event.reviewedAt, timezone, dayBoundaryHour)

    let day = byDate.get(localDate)
    if (!day) {
      day = {
        localDate,
        timezone,
        newCount: 0,
        reviewCount: 0,
        correctCount: 0,
        lapseCount: 0,
        timeMs: 0,
        xpEarned: 0
      }
      byDate.set(localDate, day)
    }

    const amount = xpForReview(event)

    day.reviewCount += 1
    if (event.stateBefore === 0)
      day.newCount += 1
    if (event.rating !== SRS_RATINGS.AGAIN)
      day.correctCount += 1
    if (event.lapsed)
      day.lapseCount += 1
    day.timeMs += event.durationMs
    day.xpEarned += amount

    xp.push({ source: 'review', refId: event.logId, amount, localDate })
  }

  // Sort for stable output. Sorting is presentation only — every value above is
  // a sum or count, so the result was already order-independent.
  const daily = [...byDate.values()].sort((a, b) => a.localDate.localeCompare(b.localDate))
  xp.sort((a, b) => (a.refId < b.refId ? -1 : a.refId > b.refId ? 1 : 0))

  return {
    daily,
    xp,
    totalXp: daily.reduce((sum, d) => sum + d.xpEarned, 0),
    affectedDates: daily.map(d => d.localDate)
  }
}
