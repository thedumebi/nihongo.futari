import type {
  exercisePrompts,
  exerciseTemplates,
  kindFacetTemplates
} from '@/db/schema/exercises.js'

import type { SrsCard } from './srs.js'

/**
 * The data-driven exercise engine.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type ExerciseTemplate = typeof exerciseTemplates.$inferSelect
export type NewExerciseTemplate = typeof exerciseTemplates.$inferInsert
export type ExercisePrompt = typeof exercisePrompts.$inferSelect
export type NewExercisePrompt = typeof exercisePrompts.$inferInsert
export type KindFacetTemplate = typeof kindFacetTemplates.$inferSelect

/**
 * One published prompt a facet could show, with the rules that decide whether
 * and in what order (see `pickPrompt` in `backend/src/lib/prompt-pick.ts`).
 * `firstExposureOnly` is the kind's rule where it has one, else the
 * template's; `minState` and `maxReps` are null where the kind sets none.
 */
export type PromptOption = Pick<ExercisePrompt, 'id' | 'facetId' | 'requiresGrammarPointId'>
  & Pick<ExerciseTemplate, 'firstExposureOnly'>
  & Pick<KindFacetTemplate, 'minState' | 'maxReps'>

/** What a learner's prompt choice depends on, whichever card it is for. */
export interface LearnerPromptContext {
  /** Grammar points with a learned card, any language. */
  knownGrammar: ReadonlySet<string>
  /** Prompts missed in a lesson and not yet cleared. */
  missed: ReadonlySet<string>
  /** Varies the pick between requests; see `promptOrderKey`. */
  salt: string
}

/** What `pickPrompt` knows about the card and the learner when it chooses. */
export type PromptContext = LearnerPromptContext & Pick<SrsCard, 'state' | 'reps'>
