import { z } from '@hono/zod-openapi'

import type { speakProgress, speakSessions, speakSteps } from '@/db/schema/speak.js'

import { SPEAK_STEP_KINDS } from '@/constants/endpoints.js'

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
    audio: z.string()
  })),
  /** The answer as written. Null on an explanation. */
  text: z.string().nullable(),
  /** The answer in kana, particles as spoken. Null on an explanation. */
  reading: z.string().nullable(),
  note: z.string().nullable(),
  /** The answer cut into tappable words; empty on an explanation. */
  tokens: z.array(glossedTokenSchema),
  /** Where to hear the answer. Null on an explanation. */
  answerAudio: z.string().nullable()
}).openapi('SpeakStep')

export type SpeakStepView = z.infer<typeof speakStepViewSchema>

export const speakSessionSummarySchema = z.object({
  code: z.string(),
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

export const speakQuerySchema = z.object({
  languageCode: z.string().min(2).default('ja')
})

export const speakCompleteSchema = z.object({
  /** Prompts answered "Got it" the first time round. */
  gotIt: z.number().int().min(0),
  total: z.number().int().min(1)
}).refine(v => v.gotIt <= v.total, { message: 'gotIt cannot exceed total' }).openapi('SpeakComplete')

export type SpeakCompleteInput = z.infer<typeof speakCompleteSchema>
