import type { Streak } from '@/types/progress.js'

import { daysBetween } from './study-day.js'

export interface StreakOptions {
  /** Today's study date (YYYY-MM-DD), computed with the user's boundary. */
  today: string
  /** Freezes granted outright (by an admin), held from the start. */
  freezesAvailable?: number
  /** A freeze is earned every this many real study days in a run. 0 turns earning off. */
  earnEvery?: number
  /** Most freezes held at once — earning stops at the cap. */
  cap?: number
}

/** Freeze earning, unless told otherwise: one per week of study, two at most. */
export const FREEZE_EARN_EVERY = 7
export const FREEZE_CAP = 2

/**
 * Compute a streak from the set of days the user actually studied.
 *
 * Derived from the day set, never incremented — the same reason the daily
 * stats are recomputed wholesale. A replayed review can add a day in the
 * middle of history and join two runs into one; an incrementing counter would
 * never notice.
 *
 * A **streak freeze** bridges a missed day. This is not indulgence: the day
 * someone breaks a long chain is overwhelmingly the day they stop using the
 * app entirely, and one forgiven day costs nothing pedagogically.
 *
 * Freezes are EARNED by the walk itself — every `earnEvery` real study days
 * in a run, up to `cap` held — and a gap can only be bridged by a freeze
 * earned before it, oldest first. That keeps the fold chronological: it used
 * to start with today's freezes and spend them on the oldest gaps in history,
 * afresh on every recompute. Bridged days count toward the streak but not
 * toward earning the next freeze.
 *
 * Today counts as unbroken whether or not the user has studied yet — the
 * streak only ends once a day passes with nothing in it.
 */
export function computeStreak(studyDates: readonly string[], options: StreakOptions): Streak {
  const { today, freezesAvailable = 0, earnEvery = FREEZE_EARN_EVERY, cap = FREEZE_CAP } = options

  // Freezes held, oldest first: the date each was earned, or null if granted.
  const held: Array<string | null> = Array.from({ length: freezesAvailable }, () => null)
  const freezes: Streak['freezes'] = []
  const freezesUsed: string[] = []

  /** Bridge `missing` days after `from` with the oldest held freezes. */
  function bridge(from: string, missing: number) {
    for (let d = 1; d <= missing; d++) {
      const earnedOn = held.shift() ?? null
      const usedOn = addDays(from, d)
      freezesUsed.push(usedOn)
      if (earnedOn)
        freezes.find(f => f.earnedOn === earnedOn && f.usedOn === null)!.usedOn = usedOn
    }
  }

  const dates = [...new Set(studyDates)].sort()
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastActiveDate: null, freezesUsed: [], freezesRemaining: held.length, freezes }
  }

  let runLength = 0
  /** Real study days in the current run, for earning. */
  let realDays = 0
  let longest = 0

  for (let i = 0; i < dates.length; i++) {
    const day = dates[i]!
    const missing = i === 0 ? 0 : daysBetween(dates[i - 1]!, day) - 1

    if (i === 0 || missing === 0) {
      runLength += 1
      realDays += 1
    } else if (held.length >= missing) {
      // Spend freezes to bridge. The bridged days count toward the streak —
      // that is what makes a freeze worth having.
      bridge(dates[i - 1]!, missing)
      runLength += missing + 1
      realDays += 1
    } else {
      runLength = 1
      realDays = 1
    }

    if (earnEvery > 0 && realDays % earnEvery === 0 && held.length < cap) {
      held.push(day)
      freezes.push({ earnedOn: day, usedOn: null })
    }
    if (runLength > longest)
      longest = runLength
  }

  const last = dates[dates.length - 1]!
  const sinceLast = daysBetween(last, today)

  // The run is live if the last study day is today, or yesterday (today simply
  // has not happened yet). Anything older means a day elapsed empty.
  let current = 0
  if (sinceLast <= 1) {
    current = runLength
  } else {
    const missing = sinceLast - 1
    if (held.length >= missing) {
      bridge(last, missing)
      current = runLength + missing
      if (current > longest)
        longest = current
    }
  }

  return {
    currentStreak: current,
    longestStreak: longest,
    lastActiveDate: last,
    freezesUsed,
    freezesRemaining: held.length,
    freezes
  }
}

function addDays(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number) as [number, number, number]
  const dt = new Date(Date.UTC(y, m - 1, d))
  dt.setUTCDate(dt.getUTCDate() + days)
  return dt.toISOString().slice(0, 10)
}

/**
 * The study day on which the longest streak first reached `length`, or null
 * if it never has: the day a streak achievement was earned. Each day is the
 * fold of the days up to it, freezes included, so it agrees with what
 * `computeStreak` said on that day.
 */
export function dayLongestReached(studyDates: readonly string[], length: number, options: Omit<StreakOptions, 'today'> = {}): string | null {
  const dates = [...new Set(studyDates)].sort()
  for (let i = 0; i < dates.length; i++) {
    if (computeStreak(dates.slice(0, i + 1), { ...options, today: dates[i]! }).longestStreak >= length)
      return dates[i]!
  }
  return null
}
