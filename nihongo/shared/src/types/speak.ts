import { z } from '@hono/zod-openapi'

import type { speakProgress, speakSessions, speakSteps } from '@/db/schema/speak.js'

import { SPEAK_SESSION_KINDS, SPEAK_STEP_KINDS } from '@/constants/endpoints.js'

import { glossedTokenSchema } from './study.js'

/**
 * Speak: the build-up course.
 *
 * Rows come from the Drizzle tables; the API contract is Zod, and the response
 * types are inferred from it.
 */
export type SpeakSession = typeof speakSessions.$inferSelect
export type NewSpeakSession = typeof speakSessions.$inferInsert
export type SpeakStep = typeof speakSteps.$inferSelect
export type NewSpeakStep = typeof speakSteps.$inferInsert
export type SpeakProgress = typeof speakProgress.$inferSelect

export const speakStepViewSchema = z.object({
  index: z.number().int(),
  kind: z.enum(SPEAK_STEP_KINDS),
  /**
   * What the teacher says — the explanation, or the English to put into
   * Japanese — cut into English and Japanese runs, each with its own clip,
   * played in order.
   */
  say: z.array(z.object({
    lang: z.enum(['en', 'ja']),
    text: z.string(),
    /** Null for a run with nothing to say — a full stop after a Japanese word. */
    audio: z.string().nullable()
  })),
  /** The answer — or, on a narration, the passage read aloud — as written. Null on an explanation. */
  text: z.string().nullable(),
  /** The answer in kana, particles as spoken. Null on an explanation. */
  reading: z.string().nullable(),
  /** A one-line "why" after an answer; on a narration, its English. */
  note: z.string().nullable(),
  /** The answer cut into tappable words; empty on an explanation. */
  tokens: z.array(glossedTokenSchema),
  /** Where to hear the answer. Null on an explanation. */
  answerAudio: z.string().nullable()
}).openapi('SpeakStep')

export type SpeakStepView = z.infer<typeof speakStepViewSchema>

export const speakSessionSummarySchema = z.object({
  code: z.string(),
  kind: z.enum(SPEAK_SESSION_KINDS),
  number: z.number().int(),
  title: z.string(),
  titleEn: z.string(),
  /** `language_levels.code` — N5 … N1. */
  level: z.string(),
  promptCount: z.number().int(),
  /** This learner's latest finished run, or null if they have not finished it. */
  progress: z.object({
    completedAt: z.iso.datetime(),
    gotIt: z.number().int(),
    total: z.number().int()
  }).nullable()
}).openapi('SpeakSessionSummary')

export type SpeakSessionSummary = z.infer<typeof speakSessionSummarySchema>

export const speakListResponseSchema = z.object({
  sessions: z.array(speakSessionSummarySchema),
  /** The first session not yet finished — where "Continue" goes. */
  next: z.string().nullable()
}).openapi('SpeakList')

export type SpeakListResponse = z.infer<typeof speakListResponseSchema>

export const speakSessionViewSchema = speakSessionSummarySchema.omit({ progress: true }).extend({
  /** False only for an admin previewing a draft from the review queue. */
  published: z.boolean(),
  steps: z.array(speakStepViewSchema)
}).openapi('SpeakSession')

export type SpeakSessionView = z.infer<typeof speakSessionViewSchema>

/** Which session a review card came from, so the card can say so. */
const speakPromptSessionSchema = z.object({
  code: z.string(),
  number: z.number().int(),
  titleEn: z.string()
})

/**
 * A Speak prompt as stored on its exercise prompt — the content only.
 *
 * No audio URLs and no word cuts: those are derived when the card is served,
 * the same way a session's are, so a change of teacher voice or a dictionary
 * fix reaches cards already in someone's reviews.
 */
export const speakStoredPromptSchema = z.object({
  kind: z.literal('speak'),
  /** The English prompt, {braced} Japanese and all. */
  en: z.string(),
  text: z.string(),
  reading: z.string(),
  note: z.string().nullable(),
  session: speakPromptSessionSchema
})

export type SpeakStoredPrompt = z.infer<typeof speakStoredPromptSchema>

/** A Speak prompt as a review card receives it: the stored content, made playable and tappable. */
export const speakPromptSchema = speakStepViewSchema
  .pick({ say: true, tokens: true, note: true })
  .extend({
    kind: z.literal('speak'),
    text: z.string(),
    reading: z.string(),
    answerAudio: z.string(),
    session: speakPromptSessionSchema
  })

export type SpeakPrompt = z.infer<typeof speakPromptSchema>

export const speakMissParamsSchema = z.object({
  code: z.string().min(1),
  index: z.coerce.number().int().min(0)
})

export const speakQuerySchema = z.object({
  languageCode: z.string().min(2).default('ja')
})

export const speakCompleteSchema = z.object({
  /** Prompts answered "Got it" the first time round. */
  gotIt: z.number().int().min(0),
  total: z.number().int().min(1)
}).refine(v => v.gotIt <= v.total, { message: 'gotIt cannot exceed total' }).openapi('SpeakComplete')

export type SpeakCompleteInput = z.infer<typeof speakCompleteSchema>
