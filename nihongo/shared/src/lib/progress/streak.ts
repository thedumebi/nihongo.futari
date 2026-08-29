import type { Streak } from '@/types/progress.js'

import { daysBetween } from './study-day.js'

export interface StreakOptions {
  /** Today's study date (YYYY-MM-DD), computed with the user's boundary. */
  today: string
  /** Unused freezes available to bridge gaps. */
  freezesAvailable?: number
}

/**
 * Compute a streak from the set of days the user actually studied.
 *
 * Derived from the day set, never incremented — the same reason the daily
 * stats are recomputed wholesale. A replayed review can add a day in the
 * middle of history and join two runs into one; an incrementing counter would
 * never notice.
 *
 * A **streak freeze** bridges a single missed day. This is not indulgence: the
 * day someone breaks a long chain is overwhelmingly the day they stop using
 * the app entirely, and one forgiven day costs nothing pedagogically.
 *
 * Today counts as unbroken whether or not the user has studied yet — the
 * streak only ends once a day passes with nothing in it.
 */
export function computeStreak(studyDates: readonly string[], options: StreakOptions): Streak {
  const { today, freezesAvailable = 0 } = options

  const dates = [...new Set(studyDates)].sort()
  if (dates.length === 0) {
    return {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      freezesUsed: [],
      freezesRemaining: freezesAvailable
    }
  }

  let budget = freezesAvailable
  const freezesUsed: string[] = []

  let runLength = 1
  let longest = 1

  for (let i = 1; i < dates.length; i++) {
    const gap = daysBetween(dates[i - 1]!, dates[i]!)
    const missing = gap - 1

    if (missing === 0) {
      runLength += 1
    } else if (missing > 0 && budget >= missing) {
      // Spend freezes to bridge. The bridged days count toward the streak —
      // that is what makes a freeze worth having.
      budget -= missing
      for (let d = 1; d <= missing; d++) {
        freezesUsed.push(addDays(dates[i - 1]!, d))
      }
      runLength += missing + 1
    } else {
      runLength = 1
    }

    if (runLength > longest)
      longest = runLength
  }

  const last = dates[dates.length - 1]!
  const sinceLast = daysBetween(last, today)

  // The run is live if the last study day is today, or yesterday (today simply
  // has not happened yet). Anything older means a day elapsed empty.
  let current = 0
  if (sinceLast === 0) {
    current = runLength
  } else if (sinceLast === 1) {
    current = runLength
  } else if (sinceLast > 1) {
    const missing = sinceLast - 1
    if (budget >= missing) {
      budget -= missing
      for (let d = 1; d <= missing; d++) freezesUsed.push(addDays(last, d))
      current = runLength + missing
      if (current > longest)
        longest = current
    } else {
      current = 0
    }
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    lastActiveDate: last,
    freezesUsed,
    freezesRemaining: budget
  }
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number]
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}
