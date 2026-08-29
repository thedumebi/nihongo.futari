import { z } from '@hono/zod-openapi'

import type {
  characterStrokes,
  kanji,
  kanjiComponents,
  kanjiReadings,
  phoneticSeries,
  phoneticSeriesMembers,
  radicals
} from '@/db/schema/kanji.js'

import { referenceStrokeSchema } from './handwriting.js'

/**
 * Kanji, components, strokes and phonetic series.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type Radical = typeof radicals.$inferSelect
export type Kanji = typeof kanji.$inferSelect
export type NewKanji = typeof kanji.$inferInsert
export type KanjiReading = typeof kanjiReadings.$inferSelect
export type CharacterStroke = typeof characterStrokes.$inferSelect
export type KanjiComponent = typeof kanjiComponents.$inferSelect
export type PhoneticSeries = typeof phoneticSeries.$inferSelect
export type PhoneticSeriesMember = typeof phoneticSeriesMembers.$inferSelect

export const phoneticSeriesMemberSchema = z.object({
  character: z.string(),
  reading: z.string(),
  meaning: z.string().nullable(),
  /** False for the exceptions — shown, not hidden. */
  followsSeries: z.boolean(),
  exceptionNote: z.string().nullable(),
  strokeCount: z.number().int().nullable(),
  grade: z.number().int().nullable()
}).openapi('PhoneticSeriesMember')

export const phoneticSeriesViewSchema = z.object({
  component: z.string(),
  primaryReading: z.string(),
  alternateReadings: z.array(z.string()),
  memberCount: z.number().int(),
  /** Fraction of members that actually take the reading, 0–1. */
  reliability: z.number(),
  componentMeaning: z.string().nullable(),
  members: z.array(phoneticSeriesMemberSchema)
}).openapi('PhoneticSeries')

export type PhoneticSeriesView = z.infer<typeof phoneticSeriesViewSchema>

export const phoneticSeriesListSchema = z.object({
  series: z.array(z.object({
    component: z.string(),
    primaryReading: z.string(),
    memberCount: z.number().int(),
    reliability: z.number(),
    componentMeaning: z.string().nullable()
  }))
}).openapi('PhoneticSeriesList')

export type PhoneticSeriesListResponse = z.infer<typeof phoneticSeriesListSchema>

/**
 * Everything known about one kanji, on one page.
 *
 * This is where the why-layer finally becomes visible: readings, the phonetic
 * series that predicts them, stroke order, and sourced etymology have all been
 * in the database with nowhere to render. Each is separately useless and
 * together they are the argument for the app.
 */
export const kanjiDetailSchema = z.object({
  character: z.string(),
  meanings: z.array(z.string()),
  level: z.string().nullable(),
  strokeCount: z.number().int().nullable(),
  grade: z.number().int().nullable(),
  frequencyRank: z.number().int().nullable(),
  readings: z.object({
    on: z.array(z.string()),
    kun: z.array(z.string())
  }),
  strokes: z.array(referenceStrokeSchema),
  /** The sound series this kanji belongs to, if any. */
  series: z.object({
    component: z.string(),
    reading: z.string().nullable(),
    reliability: z.number().nullable(),
    memberCount: z.number().int().nullable(),
    /** False when this kanji is one of the exceptions. */
    follows: z.boolean(),
    exceptionNote: z.string().nullable()
  }).nullable(),
  /**
   * Sourced explanations. `published` is false for everything under review,
   * which the UI must show as a draft rather than as fact.
   */
  etymology: z.array(z.object({
    aspect: z.string(),
    claim: z.string(),
    body: z.string(),
    confidence: z.string(),
    isDisputed: z.boolean(),
    published: z.boolean(),
    citations: z.array(z.object({
      label: z.string(),
      locator: z.string(),
      quote: z.string().nullable()
    }))
  })),
  /** Words in the curriculum that use this kanji. */
  words: z.array(z.object({
    form: z.string(),
    reading: z.string(),
    gloss: z.string().nullable(),
    level: z.string().nullable()
  }))
}).openapi('KanjiDetail')

export type KanjiDetail = z.infer<typeof kanjiDetailSchema>
