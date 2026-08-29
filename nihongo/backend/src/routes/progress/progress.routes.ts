import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, PROGRESS_ROUTES } from '@nihongo/shared/constants'
import { createSecuredRoute, ErrorSchema, jsonContent } from '@nihongo/shared/openapi'
import { knownKanjiSchema, progressSummarySchema, readinessSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'

const tags = ['Progress']

export const summary = createSecuredRoute({
  tags,
  path: PROGRESS_ROUTES.SUMMARY,
  method: 'get',
  summary: 'Streak, XP and item counts',
  middleware: [authMiddleware],
  responses: {
    [HttpStatusCodes.OK]: jsonContent(progressSummarySchema, 'Progress summary')
  }
})
export type SummaryRoute = typeof summary

export const knownKanji = createSecuredRoute({
  tags,
  path: PROGRESS_ROUTES.KNOWN_KANJI,
  method: 'get',
  summary: 'Kanji this user has learned',
  description: 'Drives the "furigana over unknown kanji only" mode.',
  middleware: [authMiddleware],
  request: { query: z.object({ languageCode: z.string().min(2).default('ja') }) },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(knownKanjiSchema, 'Known kanji')
  }
})
export type KnownKanjiRoute = typeof knownKanji

export const readiness = createSecuredRoute({
  tags,
  path: PROGRESS_ROUTES.READINESS,
  method: 'get',
  summary: 'Coverage of a JLPT level',
  description: 'Share of this app\'s content for the level that the learner has retained. Not an exam-score prediction.',
  middleware: [authMiddleware],
  request: {
    params: z.object({ levelCode: z.string().min(2) }),
    query: z.object({ languageCode: z.string().min(2).default('ja') })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(readinessSchema, 'Readiness'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such level')
  }
})
export type ReadinessRoute = typeof readiness
