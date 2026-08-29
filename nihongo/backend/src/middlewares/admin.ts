import type { MiddlewareHandler } from 'hono'

import { HttpStatusCodes, HttpStatusPhrases } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import { users } from '@nihongo/shared/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Run AFTER `authMiddleware`. Reads the user's role from the DB and returns
 * 403 unless `role === 'admin'`. Kept separate from the session payload so
 * promoting/demoting users doesn't require re-issuing the session.
 */
const adminMiddleware: MiddlewareHandler = async (ctx, next) => {
  const user = ctx.var.user as { id: string } | null

  if (!user) {
    return ctx.json({ message: HttpStatusPhrases.UNAUTHORIZED }, HttpStatusCodes.UNAUTHORIZED)
  }

  const [row] = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1)

  if (!row || row.role !== 'admin') {
    return ctx.json({ message: HttpStatusPhrases.FORBIDDEN }, HttpStatusCodes.FORBIDDEN)
  }

  return next()
}

export default adminMiddleware
