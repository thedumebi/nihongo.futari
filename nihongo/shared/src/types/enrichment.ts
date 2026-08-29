import { z } from '@hono/zod-openapi'

/**
 * Grounded enrichment.
 *
 * The model is never asked "what is the etymology of X". It is given passages
 * from named sources and asked to explain only what those passages support.
 * No packet means no generation.
 */

/** One source passage handed to the model, and the only thing it may cite. */
export const groundingSourceSchema = z.object({
  /** Matches a row in `sources`. The model may cite these ids and no others. */
  sourceId: z.string(),
  label: z.string(),
  locator: z.string(),
  /** The verbatim text. Returned quotes are checked against exactly this. */
  passage: z.string()
}).openapi('GroundingSource')

export const groundingPacketSchema = z.object({
  targetTable: z.string(),
  targetId: z.string(),
  /** What is being explained: the character, the word, the pattern. */
  subject: z.string(),
  aspect: z.string(),
  /** Facts drawn from imported data — readings, decomposition, series. */
  facts: z.record(z.string(), z.unknown()),
  sources: z.array(groundingSourceSchema)
}).openapi('GroundingPacket')

export const enrichmentCitationSchema = z.object({
  sourceId: z.string(),
  /** Must appear verbatim in that source's passage. */
  quote: z.string(),
  supports: z.enum(['supports', 'contradicts', 'partial'])
}).openapi('EnrichmentCitation')

export const enrichmentDraftSchema = z.object({
  claim: z.string(),
  body: z.string(),
  /** `unknown` means the packet did not cover it; those are dropped. */
  confidence: z.enum(['well-supported', 'attested', 'disputed', 'folk', 'unknown']),
  isDisputed: z.boolean().default(false),
  period: z.string().nullable().default(null),
  citations: z.array(enrichmentCitationSchema).default([]),
  competingTheories: z.array(z.object({
    theoryName: z.string(),
    summary: z.string()
  })).default([])
}).openapi('EnrichmentDraft')

export const validationResultSchema = z.object({
  ok: z.boolean(),
  /** True when the model honestly declined — not a failure. */
  dropped: z.boolean(),
  reason: z.string().nullable(),
  failures: z.array(z.string()),
  checkedQuotes: z.number().int().nonnegative()
}).openapi('ValidationResult')

export type GroundingSource = z.infer<typeof groundingSourceSchema>
export type GroundingPacket = z.infer<typeof groundingPacketSchema>
export type EnrichmentCitation = z.infer<typeof enrichmentCitationSchema>
export type EnrichmentDraft = z.infer<typeof enrichmentDraftSchema>
export type ValidationResult = z.infer<typeof validationResultSchema>
