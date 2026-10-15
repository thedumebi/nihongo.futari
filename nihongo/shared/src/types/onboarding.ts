import { z } from '@hono/zod-openapi'

import {
  FURIGANA_MODES,
  JLPT_LEVELS,
  ONBOARDING_GOALS,
  ONBOARDING_STARTS,
  ONBOARDING_STATUSES
} from '@/constants/endpoints.js'

/**
 * Onboarding: the welcome flow's answers, the state Today and Settings read,
 * and the placement check.
 */

export const onboardingAnswersSchema = z.object({
  start: z.enum(ONBOARDING_STARTS),
  goals: z.array(z.enum(ONBOARDING_GOALS)).max(ONBOARDING_GOALS.length),
  minutes: z.union([z.literal(5), z.literal(15), z.literal(30), z.literal(60)]),
  /** The reading help they chose (preselected from where they start). */
  furiganaMode: z.enum(FURIGANA_MODES),
  /** From the placement check, for someone who has studied before. */
  level: z.enum(JLPT_LEVELS).nullable(),
  /** A daily reminder, or null for none. */
  reminder: z.object({
    hour: z.number().int().min(0).max(23),
    minute: z.union([z.literal(0), z.literal(15), z.literal(30), z.literal(45)]),
    email: z.boolean(),
    push: z.boolean()
  }).nullable()
}).openapi('OnboardingAnswers')

export type OnboardingAnswers = z.infer<typeof onboardingAnswersSchema>

export const guideStepViewSchema = z.object({
  code: z.string(),
  title: z.string(),
  why: z.string(),
  done: z.boolean()
}).openapi('GuideStep')

export const onboardingStateSchema = z.object({
  status: z.enum(ONBOARDING_STATUSES),
  answers: onboardingAnswersSchema.nullable(),
  /** The first-week guide, each step marked done from what the learner has actually done. Empty until answered. */
  guide: z.array(guideStepViewSchema),
  /** True once they have put the guide away, or finished every step. */
  guideHidden: z.boolean()
}).openapi('OnboardingState')

export type OnboardingState = z.infer<typeof onboardingStateSchema>

export const placementQuestionSchema = z.object({
  level: z.enum(JLPT_LEVELS),
  /** The word asked about, as written. */
  word: z.string(),
  reading: z.string(),
  /** Four meanings, one of them right. */
  choices: z.array(z.string()),
  answer: z.string()
}).openapi('PlacementQuestion')

export type PlacementQuestion = z.infer<typeof placementQuestionSchema>

export const placementResponseSchema = z.object({
  questions: z.array(placementQuestionSchema)
}).openapi('Placement')

export type PlacementResponse = z.infer<typeof placementResponseSchema>
