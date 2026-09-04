import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { completeLesson, getLesson, listLessons } from '@/services/lesson.service.js'

import type { CompleteRoute, GetRoute, ListRoute } from './lessons.routes.js'

export const list: AppRouteHandler<ListRoute> = async (c) => {
  const user = c.get('user')!
  const { languageCode } = c.req.valid('query')
  return c.json(await listLessons(user.id, languageCode), HttpStatusCodes.OK)
}

export const get: AppRouteHandler<GetRoute> = async (c) => {
  const user = c.get('user')!
  const { slug } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const lesson = await getLesson(user.id, languageCode, slug)
  return lesson
    ? c.json(lesson, HttpStatusCodes.OK)
    : c.json({ message: 'No such lesson' }, HttpStatusCodes.NOT_FOUND)
}

export const complete: AppRouteHandler<CompleteRoute> = async (c) => {
  const user = c.get('user')!
  const { slug } = c.req.valid('param')
  const { languageCode } = c.req.valid('query')
  const result = await completeLesson(user.id, languageCode, slug, c.req.valid('json'))
  return result
    ? c.json(result, HttpStatusCodes.OK)
    : c.json({ message: 'No such lesson' }, HttpStatusCodes.NOT_FOUND)
}
