import type { AchievementKind } from '@/constants/endpoints.js'

/**
 * Which achievements a learner has, from what they have done.
 *
 * Pure, and a wholesale evaluation: every achievement's progress is set from
 * the current counts, never added to, so running it twice — or after a
 * replay — changes nothing. Unlocking is one-way; the caller keeps the first
 * unlock date and never takes an achievement back.
 */
export interface AchievementDef {
  id: string
  thresholdKind: string
  threshold: number
}

export interface AchievementState {
  achievementId: string
  /** Toward the threshold, capped at it — "37 / 100". */
  progress: number
  unlocked: boolean
}

export function evaluateAchievements(
  stats: Partial<Record<AchievementKind, number>>,
  defs: readonly AchievementDef[]
): AchievementState[] {
  return defs.map((def) => {
    const value = stats[def.thresholdKind as AchievementKind] ?? 0
    return {
      achievementId: def.id,
      progress: Math.min(Math.max(0, Math.floor(value)), def.threshold),
      unlocked: value >= def.threshold
    }
  })
}
