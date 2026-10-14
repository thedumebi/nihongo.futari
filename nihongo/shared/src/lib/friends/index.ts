import { daysBetween } from '../progress/study-day.js'

/**
 * Friends, as pure rules over study days (local dates, yyyy-MM-dd).
 *
 * Everything shared between friends is derived from the days each studied —
 * never words, accuracy or ghosts.
 */

/** Characters a code is made of: no 0/O, 1/I/L, so it can be read aloud and typed. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
export const FRIEND_CODE_LENGTH = 8

/** A friend code from random bytes — the caller supplies them, so this stays pure. */
export function friendCodeFrom(bytes: ArrayLike<number>): string {
  let code = ''
  for (let i = 0; i < FRIEND_CODE_LENGTH; i++)
    code += CODE_ALPHABET[(bytes[i] ?? 0) % CODE_ALPHABET.length]
  return code
}

/** A typed code, forgiving of case, spaces and dashes. */
export function normaliseFriendCode(input: string): string {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

/**
 * Days in a row both friends studied, counting back from today — or from
 * yesterday when today is not done yet by both, so the streak does not read
 * zero all morning. Each date is that person's own local study day.
 */
export function pairStreak(mine: readonly string[], theirs: readonly string[], today: string): number {
  const theirSet = new Set(theirs)
  const both = new Set(mine.filter(d => theirSet.has(d)))
  const dates = [...both].sort().reverse()
  if (dates.length === 0)
    return 0
  const gap = daysBetween(dates[0]!, today)
  if (gap > 1)
    return 0
  let streak = 1
  for (let i = 1; i < dates.length; i++) {
    if (daysBetween(dates[i]!, dates[i - 1]!) !== 1)
      break
    streak++
  }
  return streak
}

/** Distinct days studied in the seven ending today, today included. */
export function daysThisWeek(days: readonly string[], today: string): number {
  return new Set(days.filter((d) => {
    const ago = daysBetween(d, today)
    return ago >= 0 && ago < 7
  })).size
}
