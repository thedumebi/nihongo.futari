import { z } from '@hono/zod-openapi'

import type {
  contentReviewQueue,
  enrichmentItems,
  enrichmentRuns,
  importConflicts,
  importRuns,
  importSources
} from '@/db/schema/ops.js'

import { REVIEW_KINDS, SPEAK_STEP_KINDS } from '@/constants/endpoints.js'

import { readingLineViewSchema, readingSummarySchema } from './readings.js'
import { furiganaSegmentSchema } from './sentences.js'
import { speakSessionSummarySchema } from './speak.js'

/**
 * Import pipeline and AI-enrichment provenance.
 *
 * Derived from the Drizzle tables — the schema is the single source of truth.
 * Never hand-write a shape that duplicates one of these.
 */
export type ImportSource = typeof importSources.$inferSelect
export type ImportRun = typeof importRuns.$inferSelect
export type NewImportRun = typeof importRuns.$inferInsert
export type ImportConflict = typeof importConflicts.$inferSelect
export type EnrichmentRun = typeof enrichmentRuns.$inferSelect
export type EnrichmentItem = typeof enrichmentItems.$inferSelect
export type NewEnrichmentItem = typeof enrichmentItems.$inferInsert
export type ContentReviewItem = typeof contentReviewQueue.$inferSelect
export type NewContentReviewItem = typeof contentReviewQueue.$inferInsert

/**
 * A proposed correction to readings already live, as the queue row's
 * `proposed` column holds it. Everything a reviewer needs is in it — the line
 * as it reads now and as it would read — and so is everything approval needs
 * to apply it, each change guarded by the value it replaces.
 */
export const correctionProposalSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('sentence'),
    text: z.string(),
    translation: z.string().nullable(),
    /** The whole sentence's furigana now, and after the change. */
    before: z.array(furiganaSegmentSchema),
    after: z.array(furiganaSegmentSchema),
    /** Tokens whose furigana changes: from → to. */
    tokens: z.array(z.object({
      index: z.number().int(),
      from: z.array(furiganaSegmentSchema),
      to: z.array(furiganaSegmentSchema),
      why: z.string()
    })),
    /** Words (names, mostly) that had no token and so no reading at all. */
    gaps: z.array(z.object({ at: z.number().int(), t: z.string(), reading: z.string(), why: z.string() }))
  }),
  z.object({
    type: z.literal('line'),
    text: z.string(),
    translation: z.string().nullable(),
    /** The conversation it is in. */
    dialogue: z.string(),
    from: z.string(),
    to: z.string(),
    why: z.string()
  })
]).openapi('CorrectionProposal')

export type CorrectionProposal = z.infer<typeof correctionProposalSchema>

/**
 * One item awaiting sign-off, with everything a reviewer needs on screen at
 * once: the claim, the prose, and the exact source quotes behind it. Reviewing
 * without the quotes in view is just rubber-stamping.
 */
export const reviewItemSchema = z.object({
  id: z.string(),
  targetTable: z.string(),
  targetId: z.string(),
  origin: z.string(),
  status: z.string(),
  createdAt: z.iso.datetime(),
  /** Which shape the payload takes — the reviewer sees different fields. */
  kind: z.enum(REVIEW_KINDS),
  /** What this is about: the grammar point's title. */
  subject: z.string().nullable(),

  // Etymology
  claim: z.string().nullable(),
  body: z.string().nullable(),
  confidence: z.string().nullable(),
  aspect: z.string().nullable(),

  // Grammar prose
  pattern: z.string().nullable(),
  meaningShort: z.string().nullable(),
  meaningLong: z.string().nullable(),
  nuance: z.string().nullable(),
  citations: z.array(z.object({
    source: z.string(),
    abbreviation: z.string().nullable(),
    locator: z.string(),
    quote: z.string().nullable(),
    reliabilityTier: z.number().int()
  })),

  /** A read-aloud speech: every line with its reading and English, to read through. */
  reading: readingSummarySchema.pick({ code: true, title: true, titleEn: true, level: true }).extend({
    stanzas: z.array(z.array(readingLineViewSchema.pick({ text: true, reading: true, translation: true })))
  }).nullable(),

  /** A Speak session: every step, teacher lines and answers, to read through. */
  speak: speakSessionSummarySchema.pick({ code: true, number: true, title: true, titleEn: true, level: true }).extend({
    steps: z.array(z.object({
      kind: z.enum(SPEAK_STEP_KINDS),
      en: z.string(),
      text: z.string().nullable(),
      reading: z.string().nullable(),
      note: z.string().nullable()
    }))
  }).nullable(),

  /** A Particles set: one lesson's questions, each with its gap, options and why. */
  particles: z.object({
    lesson: z.string(),
    slug: z.string(),
    level: z.string(),
    questions: z.array(z.object({
      id: z.string(),
      before: z.string(),
      after: z.string(),
      answer: z.string(),
      alsoRight: z.array(z.string()),
      wrong: z.array(z.string()),
      note: z.string(),
      translation: z.string().nullable()
    }))
  }).nullable(),

  /** A correction to readings already live: before, after, and why. */
  correction: correctionProposalSchema.nullable()
}).openapi('ReviewItem')

export type ReviewItem = z.infer<typeof reviewItemSchema>

export const reviewListResponseSchema = z.object({
  items: z.array(reviewItemSchema),
  pending: z.number().int()
}).openapi('ReviewList')

export type ReviewListResponse = z.infer<typeof reviewListResponseSchema>

export const reviewDecisionSchema = z.object({
  note: z.string().max(500).optional()
}).openapi('ReviewDecision')

export type ReviewDecisionInput = z.infer<typeof reviewDecisionSchema>

/**
 * Bulk decision.
 *
 * Genuinely useful once you have read a run of related items — approving
 * fifteen grammar points one Enter at a time is friction, not rigour. The
 * safeguard is unchanged: every approval still records the real reviewer, and
 * the CHECK constraints still refuse to publish anything unsourced.
 */
export const bulkReviewSchema = z.object({
  ids: z.array(z.string()).min(1).max(100),
  note: z.string().max(500).optional()
}).openapi('BulkReview')

export type BulkReviewInput = z.infer<typeof bulkReviewSchema>

export const bulkReviewResultSchema = z.object({
  succeeded: z.array(z.string()),
  failed: z.array(z.object({ id: z.string(), reason: z.string() }))
}).openapi('BulkReviewResult')

export type BulkReviewResult = z.infer<typeof bulkReviewResultSchema>

/**
 * Attribution.
 *
 * CC BY-SA obliges attribution for JMdict, KANJIDIC2, KanjiVG and Wiktionary,
 * and CC BY for Tatoeba. This is a licence term, not a courtesy, so the page is
 * built from the same `import_sources` rows the pipeline reads rather than from
 * a hand-maintained list that can silently drift from what actually shipped.
 */
export const attributionSourceSchema = z.object({
  code: z.string(),
  name: z.string(),
  url: z.string().nullable(),
  homepage: z.string().nullable(),
  license: z.string(),
  attributionText: z.string()
}).openapi('AttributionSource')

export const attributionResponseSchema = z.object({
  sources: z.array(attributionSourceSchema)
}).openapi('AttributionResponse')

export type AttributionSource = z.infer<typeof attributionSourceSchema>
export type AttributionResponse = z.infer<typeof attributionResponseSchema>
