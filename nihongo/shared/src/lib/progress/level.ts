/**
 * The level curve: each level costs 100 XP more than the one before.
 *
 *   level 2 at 100 XP, 3 at 300, 4 at 600, 5 at 1,000 — level L starts at
 *   100 × L(L−1)/2.
 *
 * Shared so the server that stores the level and the screen that shows how
 * far there is to go cannot disagree.
 */
export const LEVEL_STEP_XP = 100

/** Total XP at which `level` starts. */
export function xpForLevel(level: number): number {
  return LEVEL_STEP_XP * level * (level - 1) / 2
}

/** The level a total XP has reached. */
export function xpToLevel(totalXp: number): number {
  let level = Math.max(1, Math.floor((Math.sqrt(1 + (8 * totalXp) / LEVEL_STEP_XP) - 1) / 2) + 1)
  // Guard the float edge: exactly 300 XP must be level 3, not 2.
  while (xpForLevel(level + 1) <= totalXp)
    level++
  return level
}

export interface LevelProgress {
  level: number
  /** XP earned since this level started. */
  into: number
  /** XP this level takes in all. */
  span: number
  /** XP still needed for the next level. */
  toNext: number
}

export function levelProgress(totalXp: number): LevelProgress {
  const level = xpToLevel(totalXp)
  const start = xpForLevel(level)
  const span = xpForLevel(level + 1) - start
  return { level, into: totalXp - start, span, toNext: start + span - totalXp }
}
