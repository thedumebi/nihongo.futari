import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getCourse, getDecks, getDueList, getQueue, submitAnswer } from '@/services/srs.service.js'

import type { AnswerRoute, CourseRoute, DecksRoute, DueRoute, QueueRoute } from './study.routes.js'

export const decks: AppRouteHandler<DecksRoute> = async (c) => {
  const user = c.get('user')!
  const { languageCode, level } = c.req.valid('query')
  return c.json(await getDecks(user.id, languageCode, level), HttpStatusCodes.OK)
}

export const queue: AppRouteHandler<QueueRoute> = async (c) => {
  const user = c.get('user')!
  const result = await getQueue(user.id, c.req.valid('query'))
  return c.json(result, HttpStatusCodes.OK)
}

export const course: AppRouteHandler<CourseRoute> = async (c) => {
  const user = c.get('user')!
  const { languageCode } = c.req.valid('query')
  return c.json(await getCourse(user.id, languageCode), HttpStatusCodes.OK)
}

export const due: AppRouteHandler<DueRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await getDueList(user.id, c.req.valid('query')), HttpStatusCodes.OK)
}

export const answer: AppRouteHandler<AnswerRoute> = async (c) => {
  const user = c.get('user')!
  try {
    const result = await submitAnswer(user.id, c.req.valid('json'))
    return c.json(result, HttpStatusCodes.OK)
  } catch (err) {
    if (err instanceof Error && err.message.startsWith('Unknown facet')) {
      return c.json({ message: err.message }, HttpStatusCodes.NOT_FOUND)
    }
    throw err
  }
}
