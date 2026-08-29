/**
 * The one FSRS implementation.
 *
 * Imported by BOTH the backend service and the Vue client with the same user
 * parameters, so the client's optimistic scheduling matches what the server
 * computes. Divergence is then a bug in one place rather than something the
 * architecture has to tolerate.
 */
export { emptyCardState, fromFsrsCard, toFsrsCard } from './card.js'
export type { ClampOptions, ClampResult } from './clock.js'
export { clampReviewedAt } from './clock.js'
export type { GhostDecision, GhostInput } from './ghost.js'
export { applyGhostInterval, evaluateGhost } from './ghost.js'
export { buildParameters } from './params.js'
export type { ReplayOptions, ReplayResult } from './replay.js'
export { canFastForward, compareEvents, replay } from './replay.js'
export type { ScheduleResult } from './schedule.js'
export { applyReview } from './schedule.js'
export * from './uuid-v7.js'
