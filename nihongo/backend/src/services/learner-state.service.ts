import type { LearnerState } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'

/**
 * One learner's cards in a language, and the lessons they have opened, in two
 * indexed queries (see `types/curriculum.ts`). Load it once per request and
 * hand it to whatever needs it: it is a snapshot, so a caller that writes cards
 * loads it again.
 */
export async function loadLearnerState(userId: string, languageId: string): Promise<LearnerState> {
  const [cards, views] = await Promise.all([
    db.execute<{ facet_id: string, state: number, suspended: boolean, due: Date | string, study_item_id: string, kanji_id: string | null }>(sql`
      select c.facet_id, c.state, c.suspended, c.due, f.study_item_id, si.kanji_id
      from srs_cards c
      join study_item_facets f on f.id = c.facet_id
      join study_items si on si.id = f.study_item_id
      where c.user_id = ${userId} and c.language_id = ${languageId}`),
    db.execute<{ study_item_id: string }>(sql`
      select study_item_id from lesson_views where user_id = ${userId}`)
  ])

  const state: LearnerState = {
    cards: new Map(),
    itemsWithCard: new Set(),
    itemStates: new Map(),
    knownKanji: new Set(),
    lessonsViewed: new Set(views.rows.map(r => r.study_item_id))
  }
  for (const row of cards.rows) {
    state.cards.set(row.facet_id, { state: row.state, suspended: row.suspended, due: new Date(row.due) })
    state.itemsWithCard.add(row.study_item_id)
    state.itemStates.set(row.study_item_id, Math.max(row.state, state.itemStates.get(row.study_item_id) ?? 0))
    if (row.kanji_id !== null && row.state >= 2)
      state.knownKanji.add(row.kanji_id)
  }
  return state
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
