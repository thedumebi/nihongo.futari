import type {
  exercisePrompts,
  exerciseTemplates
} from '@/db/schema/exercises.js'

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
