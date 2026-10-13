import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getCrossword, KNOWN_ENOUGH, saveCrosswordResult } from '@/services/crossword.service.js'

import type { GetRoute, ResultRoute } from './crossword.routes.js'

export const get: AppRouteHandler<GetRoute> = async (c) => {
  const user = c.get('user')!
  const puzzle = await getCrossword(user.id, c.req.valid('query'))
  if (!('error' in puzzle))
    return c.json(puzzle, HttpStatusCodes.OK)
  if (puzzle.error === 'no-level')
    return c.json({ message: 'No such level' }, HttpStatusCodes.NOT_FOUND)
  if (puzzle.error === 'learn-more') {
    return c.json({
      message: `Learn a few more words first — a puzzle from words you know needs ${KNOWN_ENOUGH}.`,
      knownCount: puzzle.knownCount
    }, HttpStatusCodes.UNPROCESSABLE_ENTITY)
  }
  return c.json({ message: 'Could not build a puzzle from these words — try another choice.' }, HttpStatusCodes.UNPROCESSABLE_ENTITY)
}

export const result: AppRouteHandler<ResultRoute> = async (c) => {
  const user = c.get('user')!
  const { languageCode } = c.req.valid('query')
  const saved = await saveCrosswordResult(user.id, languageCode, c.req.valid('json'))
  if (!saved)
    return c.json({ message: 'No such level' }, HttpStatusCodes.NOT_FOUND)
  return c.json(saved, HttpStatusCodes.OK)
}
