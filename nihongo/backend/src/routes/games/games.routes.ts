import { GAMES_ROUTES, HttpStatusCodes } from '@nihongo/shared/constants'
import { createSecuredRoute, jsonContent } from '@nihongo/shared/openapi'
import { gamesQuerySchema, ghostBossSchema, kanjiBuildGameSchema, listeningGameSchema, verbFormsGameSchema } from '@nihongo/shared/types'

import authMiddleware from '@/middlewares/auth.js'

const tags = ['Games']

export const listening = createSecuredRoute({
  tags,
  path: GAMES_ROUTES.LISTENING,
  method: 'get',
  summary: 'Minimal pairs: hear a word, pick which of two it was',
  description: 'Pairs differ by one long vowel, small っ or ん. Writes nothing.',
  middleware: [authMiddleware],
  request: { query: gamesQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(listeningGameSchema, 'The rounds')
  }
})
export type ListeningRoute = typeof listening

export const kanjiBuild = createSecuredRoute({
  tags,
  path: GAMES_ROUTES.KANJI_BUILD,
  method: 'get',
  summary: 'Build kanji from their parts, and guess readings from sound families',
  description: 'Parts from the IDS decomposition; readings from published phonetic series only. Writes nothing.',
  middleware: [authMiddleware],
  request: { query: gamesQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(kanjiBuildGameSchema, 'The rounds')
  }
})
export type KanjiBuildRoute = typeof kanjiBuild

export const ghostBoss = createSecuredRoute({
  tags,
  path: GAMES_ROUTES.GHOST_BOSS,
  method: 'get',
  summary: 'This week\'s ghost boss: the cards that keep slipping, with sourced explanations and look-alikes',
  description: 'Preparation only: no review is written and no schedule changes.',
  middleware: [authMiddleware],
  request: { query: gamesQuerySchema.pick({ languageCode: true }) },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(ghostBossSchema, 'The ghosts and the rounds')
  }
})
export type GhostBossRoute = typeof ghostBoss

export const verbForms = createSecuredRoute({
  tags,
  path: GAMES_ROUTES.VERB_FORMS,
  method: 'get',
  summary: 'Verb forms: the verbs to conjugate, and which forms the learner has been taught',
  description: 'Known verbs, topped up from the level. Questions and answers are built on the device. Writes nothing.',
  middleware: [authMiddleware],
  request: { query: gamesQuerySchema },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(verbFormsGameSchema, 'The verbs and the forms')
  }
})
export type VerbFormsRoute = typeof verbForms
