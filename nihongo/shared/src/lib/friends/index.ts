import type { ActivityKind } from '@/constants/endpoints.js'
import type { ActivityCounts } from '@/types/friends.js'

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

/** Which count each kind of activity adds to — grouped as the menu groups them. */
const ACTIVITY_BUCKET: Record<ActivityKind, keyof ActivityCounts> = {
  'lesson': 'lessons',
  'kana-lesson': 'lessons',
  'conversation': 'conversations',
  'reading': 'reads',
  'speak': 'speak',
  'speak-listen': 'speak',
  'story': 'speak',
  'recall': 'recall',
  'shadowing': 'shadowing',
  'crossword': 'games',
  'listening-game': 'games',
  'kanji-build': 'games',
  'ghost-boss': 'games'
}

export function emptyActivityCounts(): ActivityCounts {
  return { reviews: 0, newWords: 0, lessons: 0, conversations: 0, reads: 0, speak: 0, recall: 0, shadowing: 0, games: 0 }
}

/**
 * Add up a stretch of study: the review totals from the daily stats, and each
 * finished activity in its group. A kind this does not know is left out
 * rather than guessed into a group.
 */
export function activityCounts(
  stats: ReadonlyArray<{ reviews: number, newWords: number }>,
  activities: ReadonlyArray<{ kind: string, count: number }>
): ActivityCounts {
  const out = emptyActivityCounts()
  for (const s of stats) {
    out.reviews += s.reviews
    out.newWords += s.newWords
  }
  for (const a of activities) {
    const bucket = ACTIVITY_BUCKET[a.kind as ActivityKind] as keyof ActivityCounts | undefined
    if (bucket)
      out[bucket] += a.count
  }
  return out
}

/** The weekly board's order: days studied, then XP, then you first on a full tie. */
export function rankBoard<T extends { days: number, xp: number, isMe: boolean }>(rows: readonly T[]): T[] {
  return [...rows].sort((a, b) => b.days - a.days || b.xp - a.xp || Number(b.isMe) - Number(a.isMe))
}

/** A place on the weekly board: days studied in the last seven, then XP. */
export interface BoardScore { days: number, xp: number }

/** How close behind counts as "close": level on days and within this much XP. */
export const BOARD_CLOSE_XP = 30

function compareScores(a: BoardScore, b: BoardScore): number {
  return a.days - b.days || a.xp - b.xp
}

/**
 * Whether a friend's movement on the weekly board is worth a push to you:
 *
 * - `passed`: they were level with you or behind and are now ahead.
 * - `close`: they are level with you on days, behind or tied, and within
 *   BOARD_CLOSE_XP of you.
 *
 * Either only when THEIR score went up since the last look, so the board
 * shifting because one of your days left the seven never counts as them
 * passing you. With no earlier look there is nothing to compare: null.
 */
export function boardNudge(
  before: { me: BoardScore, friend: BoardScore } | null,
  now: { me: BoardScore, friend: BoardScore }
): 'passed' | 'close' | null {
  if (!before)
    return null
  const theyMoved = compareScores(now.friend, before.friend) > 0
  if (!theyMoved)
    return null
  if (compareScores(before.friend, before.me) <= 0 && compareScores(now.friend, now.me) > 0)
    return 'passed'
  if (compareScores(now.friend, now.me) <= 0 && now.friend.days === now.me.days && now.me.xp - now.friend.xp <= BOARD_CLOSE_XP && now.me.xp > 0)
    return 'close'
  return null
}
