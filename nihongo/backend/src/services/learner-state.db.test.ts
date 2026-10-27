import db, { connection } from '@nihongo/shared/db'
import { kanji as kanjiTable, srsCards, studyItemFacets, studyItems, users } from '@nihongo/shared/db/schema'
import { and, asc, eq } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { LANGUAGE_ID } from '@/test/learner-specs.js'

import { inRequestScope } from '../lib/request-scope.js'
import { itemCharacters } from './catalogue.service.js'
import { loadLearnerState } from './learner-state.service.js'
import { getKnownKanji } from './progress.service.js'
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
    const cards = await db.select({ facetId: srsCards.facetId, id: srsCards.id, createdAt: srsCards.createdAt, ghost: srsCards.ghost, kind: studyItems.kind, levelId: studyItems.levelId, itemId: studyItemFacets.studyItemId, state: srsCards.state, suspended: srsCards.suspended, due: srsCards.due, firstSeenAt: srsCards.firstSeenAt, origin: srsCards.origin, enabled: studyItemFacets.enabled }).from(srsCards).innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId)).innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId)).where(eq(srsCards.userId, USER)).orderBy(asc(srsCards.due), asc(srsCards.facetId))
    expect(cards.some(c => c.itemId === kanji.id)).toBe(true)
    expect([...state.cards]).toEqual(cards.map(c => [c.facetId, { id: c.id, state: c.state, suspended: c.suspended, due: c.due, firstSeenAt: c.firstSeenAt, origin: c.origin, createdAt: c.createdAt, ghost: c.ghost, itemId: c.itemId, kind: c.kind, levelId: c.levelId, live: c.enabled }]))
    expect(state.itemsWithCard).toEqual(new Set(cards.map(c => c.itemId)))
    // Saved, not yet answered: met by no card.
    expect(state.itemsAnswered).toEqual(new Set())
    expect(state.itemStates).toEqual(new Map(cards.map(c => [c.itemId, Math.max(...cards.filter(d => d.itemId === c.itemId).map(d => d.state))])))
    expect(state.knownKanji).toEqual(new Set())
    expect(state.lessonsViewed).toEqual(new Map([[grammar.id, { completedAt: null, quizScore: null }]]))

    // Learned: the kanji now counts towards a sound series.
    await db.update(srsCards).set({ state: 2 }).where(eq(srsCards.userId, USER))
    expect((await loadLearnerState(USER, LANGUAGE_ID)).knownKanji).toEqual(new Set([kanji.kanjiId]))
  })

  it('reads a card whose facet came after the cached facet index, from the tables', async () => {
    const kanji = await firstItem('kanji')
    await loadLearnerState(USER, LANGUAGE_ID)
    const [late] = await db.insert(studyItemFacets).values({ studyItemId: kanji.id, facet: 'late-test', enabled: false }).returning({ id: studyItemFacets.id })
    const [card] = await db.select().from(srsCards).where(eq(srsCards.userId, USER)).limit(1)
    const { id: _, facetId: __, ...copy } = card!
    await db.insert(srsCards).values({ ...copy, facetId: late!.id })

    const state = await loadLearnerState(USER, LANGUAGE_ID)
    expect(state.cards.get(late!.id)).toMatchObject({ itemId: kanji.id, kind: 'kanji', live: false })
  })

  it('reads out a known kanji taught by an item added after the cached characters loaded', async () => {
    await itemCharacters(LANGUAGE_ID)
    const [added] = await db.insert(kanjiTable).values({ languageId: LANGUAGE_ID, character: '㐂' }).returning({ id: kanjiTable.id })
    const [item] = await db.insert(studyItems).values({ languageId: LANGUAGE_ID, kind: 'kanji', kanjiId: added!.id, published: true }).returning({ id: studyItems.id })
    const [facet] = await db.insert(studyItemFacets).values({ studyItemId: item!.id, facet: 'meaning' }).returning({ id: studyItemFacets.id })
    const [card] = await db.select().from(srsCards).where(eq(srsCards.userId, USER)).limit(1)
    const { id: _, facetId: __, ...copy } = card!
    await db.insert(srsCards).values({ ...copy, facetId: facet!.id, state: 2 })

    expect((await itemCharacters(LANGUAGE_ID)).has(added!.id)).toBe(false)
    const { characters } = await inRequestScope(() => getKnownKanji(USER, 'ja'))
    expect(characters).toContain('㐂')
  })
})
