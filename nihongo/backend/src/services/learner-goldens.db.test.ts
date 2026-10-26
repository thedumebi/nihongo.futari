import db, { connection } from '@nihongo/shared/db'
import { srsCards } from '@nihongo/shared/db/schema'
import { eq, sql } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { resetClock, seedRandom, setClock } from '@/test/clock.js'
import { afterFixture, LANGUAGE_ID, LEARNERS } from '@/test/learner-specs.js'
import { createLearner } from '@/test/learners.js'

import { knownWordIds } from './coverage.service.js'
import { getCrossword } from './crossword.service.js'
import { listDialogues } from './dialogues.service.js'
import { listLessons } from './lesson.service.js'
import { getKnownKanji, getSummary } from './progress.service.js'
import { getCourse, getDecks, getQueue, newLeftToday, stageCeilings, stageProgress } from './srs.service.js'
import { getToday } from './today.service.js'

/**
 * What each learner-facing read returns, for learners built through the real
 * study paths (`src/test/learners.ts`), frozen in `__goldens__/`.
 *
 * These exist for the speed work: the queries behind these reads are being
 * replaced, and the replacements must return exactly what these do. A golden
 * that changes is a behaviour change, so update one (`pnpm test:db -u`) only
 * when the change is meant.
 *
 * Order matters and is fixed: Today and the queue can record a stage
 * celebration as they go, so each read sees what the one before it left.
 */
/**
 * The stage celebrations recorded so far. Today and the queue write these, so
 * they are read back after each, as part of what those reads did.
 */
async function celebrations(userId: string): Promise<unknown[]> {
  const result = await db.execute(sql`
    select to_jsonb(c) - array['user_id', 'created_at', 'updated_at'] as row
    from stage_celebrations c where user_id = ${userId} order by level_id`)
  return result.rows.map(r => r.row)
}

/**
 * How many kanji of a sound series this learner has learned, which is what
 * makes the series ready (`seriesReady` in srs.service.ts).
 */
async function seriesKanjiLearned(userId: string, seriesId: string): Promise<number> {
  const result = await db.execute<{ n: number }>(sql`
    select count(distinct m.kanji_id)::int as n
    from phonetic_series_members m
    join study_items si on si.kanji_id = m.kanji_id
    join study_item_facets f on f.study_item_id = si.id
    join srs_cards c on c.facet_id = f.id and c.user_id = ${userId} and c.state >= 2
    where m.series_id = ${seriesId} and m.follows_series`)
  return result.rows[0]?.n ?? 0
}

/**
 * Card ids are minted at random as cards are made, so they are written as the
 * facet they belong to. Everything else is fixed by the fixtures.
 */
async function normalise(userId: string, value: unknown): Promise<unknown> {
  const cards = await db.select({ id: srsCards.id, facetId: srsCards.facetId }).from(srsCards).where(eq(srsCards.userId, userId))
  const byId = new Map(cards.map(card => [card.id, `card(${card.facetId})`]))
  return JSON.parse(JSON.stringify(value, (_key, v: unknown) => {
    if (v instanceof Map)
      return Object.fromEntries([...v.entries()].sort(([a], [b]) => String(a).localeCompare(String(b))))
    if (v instanceof Set)
      return [...v].sort()
    return typeof v === 'string' ? (byId.get(v) ?? v) : v
  }))
}

async function readEverything(userId: string) {
  const reads: Array<[string, () => Promise<unknown>]> = [
    ['today', () => getToday(userId, 'ja')],
    ['celebrations:afterToday', () => celebrations(userId)],
    ['queue:due', () => getQueue(userId, { languageCode: 'ja', limit: 20, horizonDays: 0, mode: 'due' })],
    ['queue:new', () => getQueue(userId, { languageCode: 'ja', limit: 20, horizonDays: 0, mode: 'new' })],
    ['queue:mixed', () => getQueue(userId, { languageCode: 'ja', limit: 20, horizonDays: 0, mode: 'mixed' })],
    ['queue:ghost', () => getQueue(userId, { languageCode: 'ja', limit: 20, horizonDays: 0, mode: 'ghost' })],
    ['queue:offline', () => getQueue(userId, { languageCode: 'ja', limit: 60, horizonDays: 7, mode: 'mixed' })],
    ['queue:n5-kana', () => getQueue(userId, { languageCode: 'ja', limit: 20, horizonDays: 0, mode: 'mixed', level: 'N5', kind: 'kana' })],
    // Sound series sort late; narrowed to them, the readiness gate shows.
    ['queue:new-series', () => getQueue(userId, { languageCode: 'ja', limit: 20, horizonDays: 0, mode: 'new', kind: 'phonetic-series' })],
    ['celebrations:afterQueues', () => celebrations(userId)],
    ['lessons', () => listLessons(userId, 'ja')],
    ['summary', () => getSummary(userId, 'ja')],
    ['knownKanji', () => getKnownKanji(userId, 'ja')],
    ['course', () => getCourse(userId, 'ja')],
    ['decks', () => getDecks(userId, 'ja')],
    ['decks:N5', () => getDecks(userId, 'ja', 'N5')],
    ['newLeftToday', () => newLeftToday(userId, LANGUAGE_ID, new Date())],
    ['stageProgress', () => stageProgress(userId, LANGUAGE_ID)],
    ['stageCeilings', () => stageCeilings(userId, LANGUAGE_ID)],
    ['dialogues', () => listDialogues('ja', userId)],
    ['crossword', () => getCrossword(userId, { languageCode: 'ja', level: 'N5', source: 'daily' })],
    ['knownWordIds', () => knownWordIds(userId, LANGUAGE_ID)]
  ]
  const out: Record<string, unknown> = {}
  for (const [name, read] of reads) {
    seedRandom(7)
    out[name] = await read()
  }
  return normalise(userId, out)
}

describe('learner goldens', () => {
  afterAll(async () => {
    try {
      await resetClock()
    } finally {
      await connection.end()
    }
  })

  it.each(Object.entries(LEARNERS))('%s reads what the golden says', async (name, spec) => {
    seedRandom(1)
    const userId = await createLearner(spec)
    await setClock(afterFixture(spec))
    // The fixture must reach the state it exists for, or its golden pins nothing.
    if (spec.knowSeries)
      expect(await seriesKanjiLearned(userId, spec.knowSeries)).toBeGreaterThanOrEqual(2)
    const reads = await readEverything(userId)
    await expect(`${JSON.stringify(reads, null, 2)}\n`).toMatchFileSnapshot(`./__goldens__/${name}.json`)
  })
})
