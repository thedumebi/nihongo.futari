import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { dismissGuide as dismiss, getOnboarding, placementQuestions, skipOnboarding, submitOnboarding } from '@/services/onboarding.service.js'

import type { DismissGuideRoute, GetRoute, PlacementRoute, SkipRoute, SubmitRoute } from './onboarding.routes.js'

export const get: AppRouteHandler<GetRoute> = async (c) => {
  return c.json(await getOnboarding(c.get('user')!.id), HttpStatusCodes.OK)
}

export const submit: AppRouteHandler<SubmitRoute> = async (c) => {
  return c.json(await submitOnboarding(c.get('user')!.id, c.req.valid('json')), HttpStatusCodes.OK)
}

export const skip: AppRouteHandler<SkipRoute> = async (c) => {
  return c.json(await skipOnboarding(c.get('user')!.id), HttpStatusCodes.OK)
}

export const dismissGuide: AppRouteHandler<DismissGuideRoute> = async (c) => {
  return c.json(await dismiss(c.get('user')!.id), HttpStatusCodes.OK)
}

export const placement: AppRouteHandler<PlacementRoute> = async (c) => {
  return c.json(await placementQuestions(c.req.valid('query').languageCode), HttpStatusCodes.OK)
}
