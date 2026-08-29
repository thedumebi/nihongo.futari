import type { Card, State } from 'ts-fsrs'

import { createEmptyCard } from 'ts-fsrs'

import type { CardState } from '@/types/srs.js'

/**
 * Translation between our persisted camelCase state and ts-fsrs's snake_case
 * `Card`. Kept in one place so the field mapping can never drift between the
 * scheduler, the replay fold and the sync service.
 */

export function toFsrsCard(state: CardState): Card {
  return {
    due: state.due,
    stability: state.stability,
    difficulty: state.difficulty,
    elapsed_days: state.elapsedDays,
    scheduled_days: state.scheduledDays,
    learning_steps: state.learningSteps,
    reps: state.reps,
    lapses: state.lapses,
    state: state.state as State,
    ...(state.lastReview ? { last_review: state.lastReview } : {})
  }
}

export function fromFsrsCard(card: Card): CardState {
  return {
    due: card.due,
    stability: card.stability,
    difficulty: card.difficulty,
    elapsedDays: card.elapsed_days,
    scheduledDays: card.scheduled_days,
    learningSteps: card.learning_steps,
    reps: card.reps,
    lapses: card.lapses,
    state: card.state,
    lastReview: card.last_review ?? null
  }
}

/** A brand-new, never-reviewed card. */
export function emptyCardState(now: Date): CardState {
  return fromFsrsCard(createEmptyCard(now))
}
