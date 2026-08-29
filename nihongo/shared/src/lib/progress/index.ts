/**
 * Progress aggregates — all pure, all replay-safe.
 *
 * Nothing in here increments a stored counter. Daily stats are recomputed
 * wholesale for the affected dates; XP awards are keyed by review-log id so the
 * database's unique index makes a re-emit a no-op; streaks are derived from the
 * set of study days. That combination is what keeps the numbers correct when an
 * offline device flushes reviews into the middle of history.
 */
export type { AggregateOptions } from './aggregate.js'
export { aggregateReviews } from './aggregate.js'
export * from './quiet-hours.js'
export type { StreakOptions } from './streak.js'
export { computeStreak } from './streak.js'
export { daysBetween, nextDate, studyDateFor, studyDayRange } from './study-day.js'
