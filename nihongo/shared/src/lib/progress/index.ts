export { evaluateAchievements } from './achievements.js'
export type { AchievementDef, AchievementState } from './achievements.js'
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
export { LEVEL_STEP_XP, levelProgress, xpForLevel, xpToLevel } from './level.js'
export type { LevelProgress } from './level.js'
export { QUEST_POOL, QUEST_XP, questProgress, QUESTS_FROM, questsFor } from './quests.js'
export type { QuestDef, QuestProgress } from './quests.js'
export { reviewGoal } from './review-goal.js'
export type { ReviewGoalCard } from './review-goal.js'
export type { StreakOptions } from './streak.js'
export { computeStreak, dayLongestReached } from './streak.js'
export { FREEZE_CAP, FREEZE_EARN_EVERY } from './streak.js'
export { daysBetween, DEFAULT_DAY_BOUNDARY_HOUR, nextDate, studyDateFor, studyDayRange } from './study-day.js'
