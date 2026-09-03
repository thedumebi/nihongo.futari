import { z } from '@hono/zod-openapi'

import type {
  grammarFormations,
  grammarMistakes,
  grammarPoints,
  grammarVariants
} from '@/db/schema/grammar.js'

import { furiganaSegmentSchema } from './sentences.js'
import { grammarExampleSchema } from './study.js'

/**
 * Grammar points and their formations, variants and common mistakes.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type GrammarPoint = typeof grammarPoints.$inferSelect
export type NewGrammarPoint = typeof grammarPoints.$inferInsert
export type GrammarFormation = typeof grammarFormations.$inferSelect
export type GrammarVariant = typeof grammarVariants.$inferSelect
export type GrammarMistake = typeof grammarMistakes.$inferSelect

/** A sourced explanation, with its citations. Never merged with a mnemonic. */
export const etymologyViewSchema = z.object({
  id: z.string(),
  aspect: z.string(),
  claim: z.string(),
  body: z.string().nullable(),
  period: z.string().nullable(),
  confidence: z.string(),
  isDisputed: z.boolean(),
  citations: z.array(z.object({
    source: z.string(),
    abbreviation: z.string().nullable(),
    url: z.string().nullable(),
    locator: z.string(),
    /** The exact supporting snippet. Rendered as "the source says". */
    quote: z.string().nullable(),
    reliabilityTier: z.number().int()
  }))
}).openapi('Etymology')

export type EtymologyView = z.infer<typeof etymologyViewSchema>

/**
 * The same prose, split into segments with readings attached.
 *
 * Sent alongside the plain strings rather than replacing them: the plain text
 * is what a screen reader, a copy-paste and a search index should get, and the
 * segments are only for rendering ruby. Readings come from the dictionary and
 * are a reading aid, not a source of truth — see lib/ja/annotate.
 */
export const grammarFuriganaSchema = z.object({
  pattern: z.array(furiganaSegmentSchema),
  meaningLong: z.array(furiganaSegmentSchema),
  nuance: z.array(furiganaSegmentSchema),
  formations: z.array(z.object({
    ruleTemplate: z.array(furiganaSegmentSchema),
    example: z.array(furiganaSegmentSchema),
    notes: z.array(furiganaSegmentSchema)
  })),
  mistakes: z.array(z.object({
    wrong: z.array(furiganaSegmentSchema),
    right: z.array(furiganaSegmentSchema),
    whyWrong: z.array(furiganaSegmentSchema),
    explanation: z.array(furiganaSegmentSchema)
  })),
  etymology: z.array(z.object({
    claim: z.array(furiganaSegmentSchema),
    body: z.array(furiganaSegmentSchema)
  }))
}).openapi('GrammarFurigana')

export type GrammarFurigana = z.infer<typeof grammarFuriganaSchema>

export const grammarPointViewSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  pattern: z.string(),
  category: z.string().nullable(),
  register: z.string().nullable(),
  level: z.string().nullable(),
  meaningShort: z.string(),
  meaningLong: z.string().nullable(),
  nuance: z.string().nullable(),
  /** True until a human has signed the prose off. */
  inReview: z.boolean(),
  /** Ruby for every Japanese string above, in the same order. */
  furigana: grammarFuriganaSchema,
  formations: z.array(z.object({
    attachesTo: z.string(),
    ruleTemplate: z.string(),
    example: z.string().nullable(),
    notes: z.string().nullable()
  })),
  mistakes: z.array(z.object({
    wrong: z.string(),
    right: z.string(),
    whyWrong: z.string(),
    explanation: z.string().nullable()
  })),
  /** Only published entries. Unreviewed ones are invisible by design. */
  etymology: z.array(etymologyViewSchema),
  /**
   * Points a learner is likely to confuse this with.
   *
   * Directed: the useful thing to say about から while looking at ので is not
   * the same sentence read the other way round.
   */
  related: z.array(z.object({
    slug: z.string(),
    title: z.string(),
    kind: z.string(),
    note: z.string().nullable()
  })),
  /** The sentences the lesson is built from. Ordered. */
  examples: z.array(grammarExampleSchema)
}).openapi('GrammarPoint')

export type GrammarPointView = z.infer<typeof grammarPointViewSchema>

export const grammarListResponseSchema = z.object({
  points: z.array(z.object({
    /** Ruby for the title, which is as often kanji (可能形) as kana (〜ます). */
    titleFurigana: z.array(furiganaSegmentSchema),
    slug: z.string(),
    title: z.string(),
    pattern: z.string(),
    meaningShort: z.string(),
    category: z.string().nullable(),
    level: z.string().nullable(),
    hasEtymology: z.boolean()
  }))
}).openapi('GrammarList')

export type GrammarListResponse = z.infer<typeof grammarListResponseSchema>
