import db, { connection } from '@nihongo/shared/db'
import { srsCards, srsReviewLogs, studyItems, users } from '@nihongo/shared/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { randomUUID } from 'node:crypto'
import { afterAll, describe, expect, it } from 'vitest'

import { LANGUAGE_ID } from '@/test/learner-specs.js'

import { getGhostBoss, ghostBossHasCards } from './games.service.js'
import { saveStudyItem } from './srs.service.js'

const USER = 'ghost-boss-test'
const DAY = 86_400_000

// The check must agree with the boss itself: someone to face exactly when the
// boss has ghosts to show.
async function bothSay(): Promise<boolean> {
  const has = await ghostBossHasCards(USER, LANGUAGE_ID)
  expect((await getGhostBoss(USER, 'ja')).ghosts.length > 0).toBe(has)
  return has
}

describe('whether the ghost boss has anyone to face', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('says yes for a ghost or a card nearly one, and no for a suspended ghost or misses long past', async () => {
    await db.insert(users).values({ id: USER, name: USER, email: `${USER}@example.test`, emailVerified: true, timezone: 'UTC' })
    const [item] = await db.select({ id: studyItems.id }).from(studyItems).where(and(eq(studyItems.languageId, LANGUAGE_ID), eq(studyItems.kind, 'kanji'), eq(studyItems.published, true))).orderBy(asc(studyItems.sortIndex), asc(studyItems.id)).limit(1)
    await saveStudyItem(USER, item!.id, 'saved')
    const [card] = await db.select({ id: srsCards.id, facetId: srsCards.facetId }).from(srsCards).where(eq(srsCards.userId, USER)).limit(1)
    expect(await bothSay()).toBe(false)

    await db.update(srsCards).set({ ghost: true }).where(eq(srsCards.id, card!.id))
    expect(await bothSay()).toBe(true)
    await db.update(srsCards).set({ suspended: true }).where(eq(srsCards.id, card!.id))
    expect(await bothSay()).toBe(false)

    // Nearly haunting: two misses inside the window. One miss, or misses
    // outside it, or superseded ones, are not.
    await db.update(srsCards).set({ ghost: false, suspended: false }).where(eq(srsCards.id, card!.id))
    const miss = (daysAgo: number) => ({ id: randomUUID(), userId: USER, cardId: card!.id, facetId: card!.facetId, languageId: LANGUAGE_ID, rating: 1, reviewedAt: new Date(Date.now() - daysAgo * DAY) })
    await db.insert(srsReviewLogs).values([miss(20), miss(30), miss(1)])
    expect(await bothSay()).toBe(false)
    const [late] = await db.insert(srsReviewLogs).values(miss(2)).returning({ id: srsReviewLogs.id })
    expect(await bothSay()).toBe(true)
    await db.update(srsReviewLogs).set({ superseded: true }).where(eq(srsReviewLogs.id, late!.id))
    expect(await bothSay()).toBe(false)
  })
})
