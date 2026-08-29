import { z } from '@hono/zod-openapi'

import type {
  wordForms,
  words,
  wordSenses,
  wordSenseSources
} from '@/db/schema/words.js'

/**
 * Vocabulary.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type Word = typeof words.$inferSelect
export type NewWord = typeof words.$inferInsert
export type WordForm = typeof wordForms.$inferSelect
export type WordSense = typeof wordSenses.$inferSelect
export type WordSenseSource = typeof wordSenseSources.$inferSelect

/**
 * Dictionary search.
 *
 * One box searching words, kanji and grammar together. Splitting them into
 * three tabs would make the reader decide what KIND of thing they half-remember
 * before they can look it up, which is exactly the thing they cannot do.
 */
export const searchHitSchema = z.object({
  kind: z.enum(['word', 'kanji', 'grammar']),
  /** Routing key: the character, or a slug. */
  key: z.string(),
  headword: z.string(),
  reading: z.string().nullable(),
  gloss: z.string().nullable(),
  level: z.string().nullable(),
  /** 0-1. Exact matches are 1; trigram similarity below that. */
  score: z.number()
}).openapi('SearchHit')

export const searchResponseSchema = z.object({
  query: z.string(),
  hits: z.array(searchHitSchema),
  total: z.number().int().nonnegative()
}).openapi('SearchResponse')

export type SearchHit = z.infer<typeof searchHitSchema>
export type SearchResponse = z.infer<typeof searchResponseSchema>

/**
 * Everything known about one word.
 *
 * Pitch accent and example sentences have both been in the database with
 * nowhere to render. A word page is where they finally do any work: the pitch
 * shape is unreadable as a number, and a sentence is what turns a gloss into
 * something you could actually say.
 */
export const wordDetailSchema = z.object({
  id: z.string(),
  form: z.string(),
  reading: z.string(),
  level: z.string().nullable(),
  isCommon: z.boolean(),
  senses: z.array(z.object({
    glosses: z.array(z.string()),
    pos: z.array(z.string())
  })),
  pitch: z.object({
    reading: z.string(),
    positions: z.array(z.number().int()),
    pattern: z.string(),
    /** High/low per mora, plus a trailing entry for the following particle. */
    shape: z.array(z.boolean())
  }).nullable(),
  /** Kanji in this word that the curriculum teaches, for onward links. */
  kanji: z.array(z.object({ character: z.string(), meanings: z.array(z.string()) })),
  etymology: z.array(z.object({
    claim: z.string(),
    body: z.string(),
    confidence: z.string(),
    published: z.boolean(),
    citations: z.array(z.object({
      label: z.string(),
      locator: z.string(),
      quote: z.string().nullable()
    }))
  })),
  examples: z.array(z.object({
    text: z.string(),
    translation: z.string().nullable(),
    /** Precomputed ruby for the whole sentence, gaps included. */
    furigana: z.array(z.object({ t: z.string(), r: z.string().optional() })),
    audio: z.string().nullable()
  }))
}).openapi('WordDetail')

export type WordDetail = z.infer<typeof wordDetailSchema>
