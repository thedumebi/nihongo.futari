import type { LearnerState } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { lessonViews, srsCards, studyItemFacets, studyItems } from '@nihongo/shared/db/schema'
import { and, asc, eq, sql } from 'drizzle-orm'

import { perRequest } from '@/lib/request-scope.js'

/**
 * One learner's cards in a language, and the lessons they have opened, in two
 * indexed queries (see `types/curriculum.ts`). Load it once per request and
 * hand it to whatever needs it: it is a snapshot, so a caller that writes cards
 * loads it again.
 *
 * Cards come in the order Postgres sorts them (`due, facet_id`), never re-sorted
 * here: facet ids compare differently under the database's collation.
 */
export async function loadLearnerState(userId: string, languageId: string): Promise<LearnerState> {
  const [cards, views] = await Promise.all([
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
        itemId: studyItemFacets.studyItemId,
        live: sql<boolean>`${studyItemFacets.enabled} and ${studyItems.published} and ${studyItems.active}`,
        kanjiId: studyItems.kanjiId
      })
      .from(srsCards)
      .innerJoin(studyItemFacets, eq(studyItemFacets.id, srsCards.facetId))
      .innerJoin(studyItems, eq(studyItems.id, studyItemFacets.studyItemId))
      .where(and(eq(srsCards.userId, userId), eq(srsCards.languageId, languageId)))
      .orderBy(asc(srsCards.due), asc(srsCards.facetId)),
    db.select({ studyItemId: lessonViews.studyItemId }).from(lessonViews).where(eq(lessonViews.userId, userId))
  ])

  const state: LearnerState = {
    cards: new Map(),
    itemsWithCard: new Set(),
    itemStates: new Map(),
    knownKanji: new Set(),
    lessonsViewed: new Set(views.map(r => r.studyItemId))
  }
  for (const { facetId, kanjiId, ...card } of cards) {
    state.cards.set(facetId, card)
    state.itemsWithCard.add(card.itemId)
    state.itemStates.set(card.itemId, Math.max(card.state, state.itemStates.get(card.itemId) ?? 0))
    if (kanjiId !== null && card.state >= 2)
      state.knownKanji.add(kanjiId)
  }
  return state
}

/** `loadLearnerState`, once per request for everything that reads it. */
export function learnerState(userId: string, languageId: string): Promise<LearnerState> {
  return perRequest(`learner-state:${userId}:${languageId}`, () => loadLearnerState(userId, languageId))
}

/**
 * Each item's highest card state, for readers that need no more than that:
 * one row per item met rather than one per card. `grammarOnly` narrows it to
 * lesson topics.
 */
export async function loadItemStates(userId: string, languageId: string, { grammarOnly = false } = {}): Promise<Map<string, number>> {
  const rows = await db.execute<{ study_item_id: string, state: number }>(sql`
    select f.study_item_id, max(c.state) as state
    from srs_cards c
    join study_item_facets f on f.id = c.facet_id
    join study_items si on si.id = f.study_item_id
    where c.user_id = ${userId} and c.language_id = ${languageId}
      ${grammarOnly ? sql`and si.grammar_point_id is not null` : sql``}
    group by f.study_item_id`)
  return new Map(rows.rows.map(r => [r.study_item_id, Number(r.state)]))
}
