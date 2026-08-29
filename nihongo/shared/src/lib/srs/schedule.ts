import type { Grade } from 'ts-fsrs'

import { fsrs } from 'ts-fsrs'

import type { CardState, FsrsParams, ReviewEvent, ReviewSnapshot } from '@/types/srs.js'

import { fromFsrsCard, toFsrsCard } from './card.js'
import { buildParameters } from './params.js'

export interface ScheduleResult {
  state: CardState
  snapshot: ReviewSnapshot
}

/**
 * Apply ONE review to a card.
 *
 * This is the only place `fsrs().next()` is called. Both the backend service
 * and the Vue client go through it with the same user parameters, so the
 * client's optimistic due date matches what the server will compute. Any
 * divergence is then a bug in one function, not a property of the design.
 */
export function applyReview(state: CardState, event: ReviewEvent, params: FsrsParams = {}): ScheduleResult {
  const scheduler = fsrs(buildParameters(params))
  const before = toFsrsCard(state)
  const { card, log } = scheduler.next(before, event.reviewedAt, event.rating as Grade)
  const after = fromFsrsCard(card)

  return {
    state: after,
    snapshot: {
      logId: event.id,
      stateBefore: before.state,
      stabilityBefore: before.stability,
      difficultyBefore: before.difficulty,
      dueBefore: before.due,
      elapsedDays: log.elapsed_days,
      scheduledDays: log.scheduled_days,
      stateAfter: after.state,
      stabilityAfter: after.stability,
      difficultyAfter: after.difficulty,
      dueAfter: after.due
    }
  }
}
