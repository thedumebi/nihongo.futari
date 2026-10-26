import db, { connection } from '@nihongo/shared/db'
import { srsCards, studyItemFacets, studyItems, users } from '@nihongo/shared/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { LANGUAGE_ID } from '@/test/learner-specs.js'

import { loadLearnerState } from './learner-state.service.js'
import { markLessonSeen, saveStudyItem } from './srs.service.js'

const USER = 'learner-state-test'

async function firstItem(kind: 'kanji' | 'grammar'): Promise<{ id: string, kanjiId: string | null }> {
  const [row] = await db.select({ id: studyItems.id, kanjiId: studyItems.kanjiId }).from(studyItems).where(and(eq(studyItems.languageId, LANGUAGE_ID), eq(studyItems.kind, kind), eq(studyItems.published, true))).orderBy(asc(studyItems.sortIndex), asc(studyItems.id)).limit(1)
  if (!row)
    throw new Error(`The seeds hold no published ${kind} item`)
  return row
}

describe('loadLearnerState', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('reads a learner\'s cards, the items they cover, the kanji learned and the lessons opened', async () => {
    await db.insert(users).values({ id: USER, name: USER, email: `${USER}@example.test`, emailVerified: true, timezone: 'Asia/Tokyo' })
    const kanji = await firstItem('kanji')
    const grammar = await firstItem('grammar')

    await saveStudyItem(USER, kanji.id, 'saved')
    await markLessonSeen(USER, grammar.id)
    const state = await loadLearnerState(USER, LANGUAGE_ID)
    const cards = await db.select({ facetId: srsCards.facetId, itemId: studyItemFacets.studyItemId, state: srsCards.state, suspended: srsCards.suspended }).from(srsCards).innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId)).where(eq(srsCards.userId, USER))
    expect(cards.some(c => c.itemId === kanji.id)).toBe(true)
    expect(state.cards).toEqual(new Map(cards.map(c => [c.facetId, { state: c.state, suspended: c.suspended }])))
    expect(state.itemsWithCard).toEqual(new Set(cards.map(c => c.itemId)))
    expect(state.knownKanji).toEqual(new Set())
    expect(state.lessonsViewed).toEqual(new Set([grammar.id]))

    // Learned: the kanji now counts towards a sound series.
    await db.update(srsCards).set({ state: 2 }).where(eq(srsCards.userId, USER))
    expect((await loadLearnerState(USER, LANGUAGE_ID)).knownKanji).toEqual(new Set([kanji.kanjiId]))
  })
})
