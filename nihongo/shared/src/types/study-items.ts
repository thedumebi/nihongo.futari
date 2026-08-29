import type {
  curriculumUnits,
  studyItemFacets,
  studyItems
} from '@/db/schema/study-items.js'

/**
 * Study items and the facets the scheduler actually schedules.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type StudyItem = typeof studyItems.$inferSelect
export type NewStudyItem = typeof studyItems.$inferInsert
export type StudyItemFacet = typeof studyItemFacets.$inferSelect
export type NewStudyItemFacet = typeof studyItemFacets.$inferInsert
export type CurriculumUnit = typeof curriculumUnits.$inferSelect
