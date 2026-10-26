import type { SubmitAnswerInput } from '@nihongo/shared/types'

import { createHash } from 'node:crypto'

/**
 * Who the DB-backed tests' learners are and when things happen to them. Plain
 * data, with no test runner in it, so a script (`bench-reads.ts`) can name a
 * learner too. `learners.ts` builds them.
 */
export const START = new Date('2026-09-01T00:00:00.000Z')
export const DAY_MS = 24 * 60 * 60 * 1000
export const LANGUAGE_ID = 'lang-ja'

/** A valid v4-shaped UUID from its parts, so ids repeat across runs. */
export function uuidFrom(...parts: string[]): string {
  const hex = createHash('md5').update(parts.join(':')).digest('hex')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-8${hex.slice(17, 20)}-${hex.slice(20, 32)}`
}

export interface LearnerSpec {
  id: string
  timezone: keyof typeof UTC_OFFSET_HOURS
  dayBoundaryHour?: number
  /** Days of study, one session a day. */
  days: number
  /** Most answers in a day's session. */
  answersPerDay: number
  /** Which queue each session studies from. */
  mode?: 'mixed' | 'due'
  /** Every answer this rating, instead of the hashed mix. */
  rating?: SubmitAnswerInput['rating']
  /** Finish the next lesson on these days (0-based). */
  lessonDays?: number[]
  /** Lessons finished on each of those days. */
  lessonsPerDay?: number
  /** New words a day, when not the default. */
  dailyNewLimit?: number
  /** Suspend this many of the learner's cards at the end. */
  suspend?: number
  /** Sync one day's answers in two batches, the later answer first, so a card's history arrives out of order. */
  replayOnDay?: number
  /** Save this sound series' kanji on day 0, so the series is ready once they are learned. */
  knowSeries?: string
}

/**
 * Fixed offsets are enough: none of these zones changes its clocks between
 * START and the last fixture day (London's clocks go back on 25 October,
 * after it).
 */
const UTC_OFFSET_HOURS = { 'UTC': 0, 'Asia/Tokyo': 9, 'Europe/London': 1 } as const

export const LEARNERS: Record<string, LearnerSpec> = {
  'fresh': { id: 'golden-fresh', timezone: 'UTC', days: 0, answersPerDay: 0 },
  // Far enough through to have read grammar lessons (it stops at 〜ません).
  'mid-n5': {
    id: 'golden-mid-n5',
    timezone: 'Asia/Tokyo',
    dayBoundaryHour: 4,
    days: 21,
    answersPerDay: 80,
    dailyNewLimit: 20,
    lessonDays: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
    lessonsPerDay: 4,
    suspend: 3
  },
  'replayed': {
    id: 'golden-replayed',
    timezone: 'Europe/London',
    days: 10,
    answersPerDay: 25,
    lessonDays: [0, 3, 6, 9],
    replayOnDay: 8
  },
  // Knows the kanji that follow 工 (功, 巧, 紅, 攻, 項, 貢, 虹), so the series is ready.
  'series-ready': {
    id: 'golden-series-ready',
    timezone: 'UTC',
    days: 9,
    answersPerDay: 40,
    mode: 'due',
    rating: 3,
    knowSeries: 'ps-ja-工'
  }
}

/** When a learner's session on `day` starts: 10:00 their time. */
export function sessionStart(spec: LearnerSpec, day: number): Date {
  return new Date(START.getTime() + day * DAY_MS + (10 - UTC_OFFSET_HOURS[spec.timezone]) * 60 * 60 * 1000)
}

/** The moment after a learner's last session, when goldens are taken. */
export function afterFixture(spec: LearnerSpec): Date {
  return new Date(sessionStart(spec, spec.days).getTime() + 2 * 60 * 60 * 1000)
}
