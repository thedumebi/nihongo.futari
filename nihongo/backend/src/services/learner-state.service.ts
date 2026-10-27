import type { FacetFacts, LearnerState } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { lessonViews, srsCards } from '@nihongo/shared/db/schema'
import { and, asc, eq, sql } from 'drizzle-orm'

import { perRequest } from '@/lib/request-scope.js'

import { facetFacts, facetFactsOf } from './catalogue.service.js'

/**
 * One learner's cards in a language, and the lessons they have opened, in two
 * indexed queries (see `types/curriculum.ts`); what each card needs of its
 * facet and item comes from the cached `facetFacts`, not a join. Load it once per request and
 * hand it to whatever needs it: it is a snapshot, so a caller that writes cards
 * loads it again.
 *
 * Cards come in the order Postgres sorts them (`due, facet_id`), never re-sorted
 * here: facet ids compare differently under the database's collation.
 */
export async function loadLearnerState(userId: string, languageId: string): Promise<LearnerState> {
  const [rows, views, facts] = await Promise.all([
    db
      .select({
        facetId: srsCards.facetId,
        id: srsCards.id,
        state: srsCards.state,
        suspended: srsCards.suspended,
        due: srsCards.due,
        firstSeenAt: srsCards.firstSeenAt,
        origin: srsCards.origin,
        createdAt: srsCards.createdAt,
        ghost: srsCards.ghost,
        answered: sql<boolean>`${srsCards.reps} > 0 or ${srsCards.lastReview} is not null`
      })
      .from(srsCards)
      .where(and(eq(srsCards.userId, userId), eq(srsCards.languageId, languageId)))
      .orderBy(asc(srsCards.due), asc(srsCards.facetId)),
    db.select({ studyItemId: lessonViews.studyItemId, completedAt: lessonViews.completedAt, quizScore: lessonViews.quizScore }).from(lessonViews).where(eq(lessonViews.userId, userId)),
    facetFacts(languageId)
  ])

  // A facet added since the index was loaded (an import between deploys) is
  // read from the tables, so a card is never dropped for want of its facet.
  const missing = rows.filter(r => !facts.has(r.facetId)).map(r => r.facetId)
  const late = missing.length === 0 ? new Map<string, FacetFacts>() : await facetFactsOf(missing)
  const cards = rows.flatMap((row) => {
    const fact = facts.get(row.facetId) ?? late.get(row.facetId)
    return fact ? [{ ...row, ...fact }] : []
  })

  const state: LearnerState = {
    cards: new Map(),
    itemsWithCard: new Set(),
    itemsAnswered: new Set(),
    itemStates: new Map(),
    knownKanji: new Set(),
    knownKana: new Set(),
    knownWords: new Set(),
    lessonsViewed: new Map(views.map(({ studyItemId, ...view }) => [studyItemId, view]))
  }
  for (const { facetId, kanjiId, kanaId, wordId, answered, ...card } of cards) {
    state.cards.set(facetId, card)
    state.itemsWithCard.add(card.itemId)
    if (answered)
      state.itemsAnswered.add(card.itemId)
    state.itemStates.set(card.itemId, Math.max(card.state, state.itemStates.get(card.itemId) ?? 0))
    if (kanjiId !== null && card.state >= 2)
      state.knownKanji.add(kanjiId)
    if (kanaId !== null && card.state >= 2)
      state.knownKana.add(kanaId)
    if (wordId !== null && card.state >= 2 && !card.suspended)
      state.knownWords.add(wordId)
  }
  return state
}

/** `loadLearnerState`, once per request for everything that reads it. */
export function learnerState(userId: string, languageId: string): Promise<LearnerState> {
  return perRequest(`learner-state:${userId}:${languageId}`, () => loadLearnerState(userId, languageId))
}
