import { z } from '@hono/zod-openapi'

import type {
  achievements,
  levelReadinessSnapshots,
  userLanguages,
  userSettings,
  userStreaks,
  xpEvents
} from '@/db/schema/user-progress.js'

import { FURIGANA_MODES } from '@/constants/endpoints.js'

/**
 * Per-user settings, progress, streaks and gamification.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type UserSettings = typeof userSettings.$inferSelect
export type NewUserSettings = typeof userSettings.$inferInsert
export type UserLanguage = typeof userLanguages.$inferSelect
export type UserStreak = typeof userStreaks.$inferSelect
export type XpEvent = typeof xpEvents.$inferSelect
export type Achievement = typeof achievements.$inferSelect
export type LevelReadinessSnapshot = typeof levelReadinessSnapshots.$inferSelect

/**
 * Study preferences.
 *
 * The database is the source of truth so the setting follows the reader between
 * phone and desk; the client caches it for instant and offline reads. There is
 * exactly one home for this value, and one vocabulary for it (FURIGANA_MODES).
 */
export const studySettingsSchema = z.object({
  furiganaMode: z.enum(FURIGANA_MODES),
  /** A level code such as 'N5'; the empty string means every level. */
  studyLevel: z.string()
}).openapi('StudySettings')

export type StudySettings = z.infer<typeof studySettingsSchema>

/**
 * The body of a settings PATCH.
 *
 * Partial because a PATCH sends only what changed: the furigana picker writes
 * `furiganaMode` alone and the level picker writes `studyLevel` alone. Demanding
 * the whole object would make adding any second setting break the first — which
 * is exactly what happened when this became more than one field.
 */
export const studySettingsPatchSchema = studySettingsSchema
  .partial()
  .openapi('StudySettingsPatch')

export type StudySettingsPatch = z.infer<typeof studySettingsPatchSchema>
