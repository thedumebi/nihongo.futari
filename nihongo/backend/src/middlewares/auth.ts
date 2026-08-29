import type { MiddlewareHandler } from 'hono'

import { HttpStatusCodes, HttpStatusPhrases } from '@nihongo/shared/constants'

import { auth } from '@/lib/auth.js'

/**
 * Strict auth — requires a session, otherwise 401. Sets user + session on
 * the context for downstream handlers.
 */
const authMiddleware: MiddlewareHandler = async (ctx, next) => {
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers })

  if (!session) {
    return ctx.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED)
  }

  ctx.set('user', session.user)
  ctx.set('session', session.session)
  return next()
}

/** Sets user/session if present, but never 401s. */
export const optionalAuthMiddleware: MiddlewareHandler = async (ctx, next) => {
  const session = await auth.api.getSession({ headers: ctx.req.raw.headers })
  if (session) {
    ctx.set('user', session.user)
    ctx.set('session', session.session)
  }
  return next()
}

export default authMiddleware
