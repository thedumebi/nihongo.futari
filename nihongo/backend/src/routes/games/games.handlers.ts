import { HttpStatusCodes } from '@nihongo/shared/constants'

import type { AppRouteHandler } from '@/lib/types.js'

import { getGhostBoss, getKanjiBuildGame, getListeningGame } from '@/services/games.service.js'

import type { GhostBossRoute, KanjiBuildRoute, ListeningRoute } from './games.routes.js'

export const listening: AppRouteHandler<ListeningRoute> = async (c) => {
  return c.json(await getListeningGame(c.req.valid('query')), HttpStatusCodes.OK)
}

export const kanjiBuild: AppRouteHandler<KanjiBuildRoute> = async (c) => {
  return c.json(await getKanjiBuildGame(c.req.valid('query')), HttpStatusCodes.OK)
}

export const ghostBoss: AppRouteHandler<GhostBossRoute> = async (c) => {
  const user = c.get('user')!
  return c.json(await getGhostBoss(user.id, c.req.valid('query').languageCode), HttpStatusCodes.OK)
}
