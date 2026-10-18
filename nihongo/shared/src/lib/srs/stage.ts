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
