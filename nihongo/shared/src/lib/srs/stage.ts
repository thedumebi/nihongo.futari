import type { StageCelebrationMarks } from '@/types/user-progress.js'

import { STAGE_PASS } from '@/constants/endpoints.js'

/**
 * How many more of a stage's cards must be learned before the next stage opens.
 *
 * The same test the server applies (`learned / total < STAGE_PASS` means the
 * stage is still open), counted up rather than multiplied out: 0.85 × 20 is
 * 17.000000000000004 in floating point, and rounding that up would ask for one
 * card too many.
 */
export function cardsToPassStage(learned: number, total: number): number {
  if (total <= 0)
    return 0
  let needed = Math.floor(STAGE_PASS * total)
  while (needed / total < STAGE_PASS)
    needed++
  while (needed > 0 && (needed - 1) / total >= STAGE_PASS)
    needed--
  return Math.max(0, needed - learned)
}

/**
 * A level's celebration marks after seeing the learner on stage `current`.
 *
 * - First sight of a level: record where they are, say nothing.
 * - Above the highest stage ever celebrated: a genuine pass. It waits as
 *   pending until a screen shows it; a second pass before then keeps the
 *   earlier starting point, so it reads "stage 4 to 6", not "5 to 6".
 * - Anything else, down included: only follow them. A content release that
 *   puts earlier material in front of them lowers `last` and nothing more, and
 *   finishing it again cannot re-fire, since the highest mark did not move.
 */
export function nextCelebration(marks: StageCelebrationMarks | null, current: number): { marks: StageCelebrationMarks, claimed: boolean } {
  if (!marks)
    return { marks: { highestStageSeen: current, lastStageSeen: current, pendingFrom: null, pendingTo: null }, claimed: false }
  if (current > marks.highestStageSeen) {
    return {
      marks: { highestStageSeen: current, lastStageSeen: current, pendingFrom: marks.pendingFrom ?? marks.lastStageSeen, pendingTo: current },
      claimed: true
    }
  }
  return { marks: { ...marks, lastStageSeen: current }, claimed: false }
}
