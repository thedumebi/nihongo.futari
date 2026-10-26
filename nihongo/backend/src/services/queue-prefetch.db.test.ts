import type { StudyQueueItem } from '@nihongo/shared/types'

import db, { connection } from '@nihongo/shared/db'
import { users } from '@nihongo/shared/db/schema'
import { afterAll, describe, expect, it } from 'vitest'

import { resetClock, setClock } from '@/test/clock.js'
import { START, uuidFrom } from '@/test/learner-specs.js'

import { getQueue, submitAnswer } from './srs.service.js'
import { updateSettings } from './users.service.js'

const USER = 'queue-prefetch-test'
const LIMIT = 8

let clock = new Date(START.getTime() + 60 * 60 * 1000)
let answered = 0

async function answer(items: StudyQueueItem[]): Promise<void> {
  for (const item of items) {
    clock = new Date(clock.getTime() + 20_000)
    await setClock(clock)
    await submitAnswer(USER, {
      id: uuidFrom(USER, String(answered++)),
      facetId: item.facetId,
      promptId: item.promptId,
      rating: 3,
      reviewedAt: clock.toISOString(),
      durationMs: 4000,
      hintsUsed: 0,
      offline: false
    })
  }
}

function newBatch(inFlight?: StudyQueueItem[]) {
  return getQueue(USER, {
    languageCode: 'ja',
    limit: 20,
    horizonDays: 0,
    mode: 'new',
    ...(inFlight ? { inFlight: inFlight.map(i => i.facetId).join(',') } : {})
  })
}

/**
 * The page fetches its next batch while it still holds the end of this one.
 * The cards it holds must not come back in the next batch, and the new words
 * among them must count against today's limit before they are answered:
 * otherwise the two batches together hand over more new words than the day
 * allows.
 */
describe('a queue fetched ahead', () => {
  afterAll(async () => {
    try {
      await resetClock()
    } finally {
      await connection.end()
    }
  })

  it('leaves out the cards in flight and keeps the day\'s new words to the limit', async () => {
    await setClock(clock)
    await db.insert(users).values({ id: USER, name: USER, email: `${USER}@example.test`, emailVerified: true, timezone: 'Asia/Tokyo' })
    await updateSettings(USER, { dailyNewLimit: LIMIT })

    const first = await newBatch()
    expect(first.items).toHaveLength(LIMIT)
    // Three answered, five still on the page when the next batch is fetched.
    await answer(first.items.slice(0, 3))
    const held = first.items.slice(3)

    // A word is new if its item is not one of the first batch's; anything else
    // new is extra practice of a word already met.
    const met = new Set(first.items.map(i => i.studyItemId))
    const words = (items: StudyQueueItem[]) => items.filter(i => i.cardId === null && !met.has(i.studyItemId))

    const ahead = await newBatch(held)
    const heldFacets = new Set(held.map(i => i.facetId))
    expect(ahead.items.filter(i => heldFacets.has(i.facetId))).toEqual([])
    // Today's words are all accounted for: three answered and five held.
    expect(words(ahead.items)).toEqual([])

    // Without saying what it holds, the same request hands the held five over
    // again, as a second copy of the day's last words.
    const blind = await newBatch()
    expect(blind.items.filter(i => i.cardId === null).map(i => i.facetId).sort()).toEqual([...heldFacets].sort())

    await answer(held)
    const after = await newBatch()
    expect(after.counts.newToday).toBe(LIMIT)
    expect(after.counts.newLimit).toBe(LIMIT)
  })
})
