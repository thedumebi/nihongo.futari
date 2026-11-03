import db, { connection } from '@nihongo/shared/db'
import { srsReviewLogs, users, xpEvents } from '@nihongo/shared/db/schema'
import { asc, eq } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { resetClock, setClock } from '@/test/clock.js'
import { START, uuidFrom } from '@/test/learner-specs.js'

import { getQueue, repairReviewSnapshots, submitAnswer } from './srs.service.js'

const USER = 'srs-snapshots-test'
const DAY = 24 * 60 * 60 * 1000

async function logsAndXp() {
  const logs = await db.select({ id: srsReviewLogs.id, stateBefore: srsReviewLogs.stateBefore, stateAfter: srsReviewLogs.stateAfter })
    .from(srsReviewLogs)
    .where(eq(srsReviewLogs.userId, USER))
    .orderBy(asc(srsReviewLogs.reviewedAt))
  const xp = await db.select({ refId: xpEvents.refId, amount: xpEvents.amount }).from(xpEvents).where(eq(xpEvents.userId, USER))
  const paid = new Map(xp.map(x => [x.refId, x.amount]))
  return logs.map(l => ({ stateBefore: l.stateBefore, stateAfter: l.stateAfter, xp: paid.get(l.id) }))
}

/**
 * Each answer keeps the card's state before and after it. Progress reads that
 * to tell a new card from a review, so without it every answer paid the 3 XP
 * of a new card.
 */
describe('an answer\'s before/after state', () => {
  afterAll(async () => {
    try {
      await resetClock()
    } finally {
      await connection.end()
    }
  })

  it('is kept, so only the first answer to a card pays as new, and a repair restores it', async () => {
    const t0 = new Date(START.getTime() + 60 * 60 * 1000)
    await setClock(t0)
    await db.insert(users).values({ id: USER, name: USER, email: `${USER}@example.test`, emailVerified: true, timezone: 'Asia/Tokyo' })
    const [item] = (await getQueue(USER, { languageCode: 'ja', limit: 1, horizonDays: 0, mode: 'new' })).items
    const answer = async (key: string, at: Date) => {
      await setClock(at)
      return submitAnswer(USER, { id: uuidFrom(USER, key), facetId: item!.facetId, rating: 3, reviewedAt: at.toISOString(), durationMs: 3000, hintsUsed: 0, offline: false })
    }

    await answer('first', t0)
    await answer('second', new Date(t0.getTime() + DAY))
    await answer('third', new Date(t0.getTime() + 5 * DAY))

    const kept = await logsAndXp()
    expect(kept[0]!.stateBefore).toBe(0)
    expect(kept.slice(1).map(l => l.stateBefore === 0)).toEqual([false, false])
    expect(kept.map(l => l.xp)).toEqual([3, 2, 2])

    // As every answer was stored before the fix: no snapshot, paid as new.
    await db.update(srsReviewLogs).set({ stateBefore: null, stateAfter: null }).where(eq(srsReviewLogs.userId, USER))
    await db.update(xpEvents).set({ amount: 3 }).where(eq(xpEvents.userId, USER))

    expect(await repairReviewSnapshots()).toEqual({ cards: 1, learners: 1, failed: 0 })
    expect(await logsAndXp()).toEqual(kept)
    // Once done, it finds nothing.
    expect(await repairReviewSnapshots()).toEqual({ cards: 0, learners: 0, failed: 0 })
  })
})
