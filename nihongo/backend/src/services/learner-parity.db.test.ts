import db, { connection } from '@nihongo/shared/db'
import { deckDue, nextDue, studyDateFor, studyDayRange } from '@nihongo/shared/lib'
import { sql } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { resetClock, seedRandom } from '@/test/clock.js'
import { afterFixture, DAY_MS, LANGUAGE_ID, LEARNERS, sessionStart } from '@/test/learner-specs.js'
import { createLearner } from '@/test/learners.js'

import { loadLearnerState } from './learner-state.service.js'
import { loadUserContext } from './progress.service.js'
import { countDue, newCardsToday, newWordsToday, nextDueAfter } from './srs.service.js'

/**
 * The counts read off the learner's cards in memory, held to the SQL they
 * replaced, which is kept here as the definition. `due` is a timestamptz and
 * `first_seen_at` UTC wall-clock without a zone, so each is compared as such;
 * the database's own session zone then changes nothing.
 */
const legacy = {
  async due(userId: string, at: Date) {
    const res = await db.execute<{ items: number, cards: number }>(sql`
      select count(distinct si.id)::int as items, count(*)::int as cards
      from srs_cards c
      join study_item_facets f on f.id = c.facet_id
      join study_items si on si.id = f.study_item_id
      where c.user_id = ${userId} and c.language_id = ${LANGUAGE_ID} and not c.suspended
        and c.due <= ${at.toISOString()}::timestamptz and c.state in (1, 2, 3)
        and f.enabled and si.published and si.active`)
    return res.rows[0]
  },

  async nextDue(userId: string, now: Date) {
    const res = await db.execute<{ due: string | null }>(sql`
      select to_char(min(c.due) at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"') as due
      from srs_cards c
      join study_item_facets f on f.id = c.facet_id
      join study_items si on si.id = f.study_item_id
      where c.user_id = ${userId} and c.language_id = ${LANGUAGE_ID} and not c.suspended
        and c.due > ${now.toISOString()}::timestamptz and c.state in (1, 2, 3)
        and f.enabled and si.published and si.active`)
    return res.rows[0]?.due ?? null
  },

  /** The queue header's counts for a deck, as getQueue counted them. */
  async deck(userId: string, at: Date, filter: { kind?: string, levelId?: string, unitItemIds?: string[] }) {
    const deck = sql.join([
      filter.kind ? sql`and si.kind = ${filter.kind}` : sql``,
      filter.levelId !== undefined ? sql`and (si.level_id = ${filter.levelId} or si.level_id is null)` : sql``,
      filter.unitItemIds ? sql`and si.id in ${filter.unitItemIds.length > 0 ? filter.unitItemIds : ['']}` : sql``
    ], sql` `)
    const counts = await db.execute<{ due: number, due_cards: number, learning: number }>(sql`
      select count(distinct si.id)::int as due, count(*)::int as due_cards,
        (count(*) filter (where c.state in (1, 3)))::int as learning
      from srs_cards c
      join study_item_facets f on f.id = c.facet_id
      join study_items si on si.id = f.study_item_id
      where c.user_id = ${userId} and c.language_id = ${LANGUAGE_ID} and not c.suspended
        and c.due <= ${at.toISOString()}::timestamptz and c.state in (1, 2, 3)
        and f.enabled and si.published and si.active ${deck}`)
    const ghosts = await db.execute<{ ghost: number }>(sql`
      select count(distinct si.id)::int as ghost
      from srs_cards c
      join study_item_facets f on f.id = c.facet_id
      join study_items si on si.id = f.study_item_id
      where c.user_id = ${userId} and c.language_id = ${LANGUAGE_ID} and not c.suspended and c.ghost ${deck}`)
    return { ...counts.rows[0], ghost: ghosts.rows[0]?.ghost }
  },

  async newCards(userId: string, from: string, to: string) {
    const res = await db.execute<{ n: number }>(sql`
      select count(*)::int as n from srs_cards
      where user_id = ${userId} and language_id = ${LANGUAGE_ID} and origin = 'queue'
        and first_seen_at >= ${from}::timestamp and first_seen_at < ${to}::timestamp`)
    return res.rows[0]?.n
  },

  async newWords(userId: string, from: string, to: string) {
    const res = await db.execute<{ n: number }>(sql`
      select count(*)::int as n from (
        select f.study_item_id
        from srs_cards c
        join study_item_facets f on f.id = c.facet_id
        where c.user_id = ${userId}
          and f.study_item_id in (
            select f2.study_item_id from srs_cards c2
            join study_item_facets f2 on f2.id = c2.facet_id
            where c2.user_id = ${userId} and c2.language_id = ${LANGUAGE_ID}
              and c2.first_seen_at >= ${from}::timestamp and c2.first_seen_at < ${to}::timestamp
          )
        group by f.study_item_id
        having min(c.first_seen_at) >= ${from}::timestamp and min(c.first_seen_at) < ${to}::timestamp
          and bool_and(c.origin = 'queue')
      ) t`)
    return res.rows[0]?.n
  }
}

/** No filter, each kind, one level, an unknown level, and the first unit. */
async function deckFilters(): Promise<Array<{ kind?: string, levelId?: string, unitItemIds?: string[] }>> {
  const [n5] = (await db.execute<{ id: string }>(sql`select id from language_levels where language_id = ${LANGUAGE_ID} and code = 'N5'`)).rows
  const unit = (await db.execute<{ id: string }>(sql`
    select ui.study_item_id as id from curriculum_unit_items ui
    where ui.unit_id = (select id from curriculum_units where language_id = ${LANGUAGE_ID} and published order by sort_index, id limit 1)`)).rows
  return [{}, { kind: 'kanji' }, { kind: 'word' }, { kind: 'grammar' }, { levelId: n5!.id }, { levelId: '' }, { unitItemIds: unit.map(r => r.id) }]
}

describe('counts from the learner\'s cards', () => {
  afterAll(async () => {
    await resetClock()
    await connection.end()
  })

  it.each(Object.entries(LEARNERS))('%s counts what the SQL counted', async (_, golden) => {
    seedRandom(7)
    const spec = { ...golden, id: golden.id.replace('golden-', 'parity-') }
    const userId = await createLearner(spec)
    const { timezone, dayBoundaryHour } = await loadUserContext(userId)

    // The last session's day, and later, once more has come due.
    const lastSession = sessionStart(spec, Math.max(spec.days - 1, 0))
    for (const at of [lastSession, afterFixture(spec), new Date(afterFixture(spec).getTime() + 3 * DAY_MS)]) {
      expect(await countDue(userId, LANGUAGE_ID, at)).toEqual(await legacy.due(userId, at))
      expect(nextDue(await loadLearnerState(userId, LANGUAGE_ID), at)?.toISOString() ?? null).toBe(await legacy.nextDue(userId, at))
      expect(await nextDueAfter(userId, LANGUAGE_ID, at)).toBe(await legacy.nextDue(userId, at))

      const { start, end } = studyDayRange(studyDateFor(at, timezone, dayBoundaryHour), timezone, dayBoundaryHour)
      const [from, to] = [start.toISOString(), end.toISOString()]
      expect(await newCardsToday(userId, LANGUAGE_ID, at)).toBe(await legacy.newCards(userId, from, to))
      expect(await newWordsToday(userId, LANGUAGE_ID, at)).toBe(await legacy.newWords(userId, from, to))

      const state = await loadLearnerState(userId, LANGUAGE_ID)
      for (const filter of await deckFilters()) {
        const { unitItemIds, ...rest } = filter
        const { due, dueCards, learning, ghost } = deckDue(state, { ...rest, ...(unitItemIds ? { unitItemIds: new Set(unitItemIds) } : {}) }, at)
        expect({ due, due_cards: dueCards, learning, ghost }).toEqual(await legacy.deck(userId, at, filter))
      }
    }
  })

  it('has learners whose last day introduced new words, so the counts above are not all zero', async () => {
    const spec = LEARNERS['mid-n5']!
    const userId = spec.id.replace('golden-', 'parity-')
    const at = sessionStart(spec, spec.days - 1)
    expect(await newWordsToday(userId, LANGUAGE_ID, new Date(at.getTime() + 2 * 60 * 60 * 1000))).toBeGreaterThan(0)
    expect((await countDue(userId, LANGUAGE_ID, new Date(afterFixture(spec).getTime() + 3 * DAY_MS))).cards).toBeGreaterThan(0)
  })
})
