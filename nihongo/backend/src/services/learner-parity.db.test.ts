import db, { connection } from '@nihongo/shared/db'
import { nextDue, studyDateFor, studyDayRange } from '@nihongo/shared/lib'
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
