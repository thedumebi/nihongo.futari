import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, ONBOARDING_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import { onboardingAnswersSchema, onboardingStateSchema, placementResponseSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'

const tags = ['Onboarding']

export const get = createSecuredRoute({
  tags,
  path: ONBOARDING_ROUTES.GET,
  method: 'get',
  summary: 'Where the learner is with onboarding, and their first-week guide',
  middleware: [authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(onboardingStateSchema, 'Onboarding state')
  }
})
export type GetRoute = typeof get

export const submit = createSecuredRoute({
  tags,
  path: ONBOARDING_ROUTES.SUBMIT,
  method: 'post',
  summary: 'Apply the welcome flow\'s answers to settings and build the guide',
  middleware: [authMiddleware],
  request: { body: jsonContentRequired(onboardingAnswersSchema, 'Answers') },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(onboardingStateSchema, 'Onboarding state')
  }
})
export type SubmitRoute = typeof submit

export const skip = createSecuredRoute({
  tags,
  path: ONBOARDING_ROUTES.SKIP,
  method: 'post',
  summary: 'Skip onboarding; it stays available from Settings',
  middleware: [authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(onboardingStateSchema, 'Onboarding state')
  }
})
export type SkipRoute = typeof skip

export const dismissGuide = createSecuredRoute({
  tags,
  path: ONBOARDING_ROUTES.DISMISS_GUIDE,
  method: 'post',
  summary: 'Put the first-week guide away',
  middleware: [authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(onboardingStateSchema, 'Onboarding state')
  }
})
export type DismissGuideRoute = typeof dismissGuide

export const placement = createSecuredRoute({
  tags,
  path: ONBOARDING_ROUTES.PLACEMENT,
  method: 'get',
  summary: 'Placement questions, a few per level',
  middleware: [authMiddleware],
  request: { query: z.object({ languageCode: z.string().default('ja') }) },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(placementResponseSchema, 'Placement questions')
  }
})
export type PlacementRoute = typeof placement
