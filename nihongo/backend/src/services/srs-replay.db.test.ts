import db, { connection } from '@nihongo/shared/db'
import { srsCards, srsReviewLogs, users } from '@nihongo/shared/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { resetClock, setClock } from '@/test/clock.js'
import { START, uuidFrom } from '@/test/learner-specs.js'

import { getQueue, submitAnswer } from './srs.service.js'

const USER = 'srs-replay-test'

/**
 * Reviews dated by when they were answered, however late they arrive. An
 * older answer is replayed into its place; and when two devices report one
 * answer within the dedupe window, which one is the double follows the fold,
 * even after a third answer lands before both.
 */
describe('an answer that arrives after newer ones', () => {
  afterAll(async () => {
    try {
      await resetClock()
    } finally {
      await connection.end()
    }
  })

  it('is replayed into its place, and the dropped double follows the new fold', async () => {
    const t0 = new Date(START.getTime() + 60 * 60 * 1000)
    await setClock(t0)
    await db.insert(users).values({ id: USER, name: USER, email: `${USER}@example.test`, emailVerified: true, timezone: 'Asia/Tokyo' })
    const [item] = (await getQueue(USER, { languageCode: 'ja', limit: 1, horizonDays: 0, mode: 'new' })).items
    const answer = (key: string, clientId: string, offsetMs: number) => submitAnswer(USER, {
      id: uuidFrom(USER, key),
      facetId: item!.facetId,
      rating: 3,
      reviewedAt: new Date(t0.getTime() + offsetMs).toISOString(),
      clientId,
      durationMs: 3000,
      hintsUsed: 0,
      offline: true
    })

    await setClock(new Date(t0.getTime() + 60_000))
    await answer('a', 'phone', 0)
    // The same answer, reported by the laptop 1.5 s later: the double.
    await answer('b', 'laptop', 1500)
    // Then the tablet's, from a second before either: now A is the double.
    const late = await answer('c', 'tablet', -1000)

    const logs = await db.select({ id: srsReviewLogs.id, superseded: srsReviewLogs.superseded, reviewedAt: srsReviewLogs.reviewedAt })
      .from(srsReviewLogs)
      .where(eq(srsReviewLogs.userId, USER))
      .orderBy(asc(srsReviewLogs.reviewedAt))
    expect(logs.map(l => [l.id, l.superseded])).toEqual([
      [uuidFrom(USER, 'c'), false],
      [uuidFrom(USER, 'a'), true],
      [uuidFrom(USER, 'b'), false]
    ])
    // Dated by the answer, not moved to after the newest.
    expect(logs[0]!.reviewedAt).toEqual(new Date(t0.getTime() - 1000))
    expect(late.replayed).toBe(true)

    const [card] = await db.select().from(srsCards).where(and(eq(srsCards.userId, USER), eq(srsCards.facetId, item!.facetId)))
    expect(card!.totalReviews).toBe(2)
    expect(card!.firstSeenAt).toEqual(new Date(t0.getTime() - 1000))
    expect(card!.lastCorrectAt).toEqual(new Date(t0.getTime() + 1500))
  })
})
