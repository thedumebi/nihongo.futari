import type { SubmitAnswerInput, SyncResult } from '@nihongo/shared/types'

import db, { connection } from '@nihongo/shared/db'
import { users } from '@nihongo/shared/db/schema'
import { QUESTS_FROM } from '@nihongo/shared/lib'
import { eq, sql } from 'drizzle-orm'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'

import { resetClock, seedRandom, setClock } from '@/test/clock.js'
import { DAY_MS, LANGUAGE_ID, uuidFrom } from '@/test/learner-specs.js'

import { completeLesson, listLessons } from './lesson.service.js'
import { recomputeProgress } from './progress.service.js'
import { getQueue, submitAnswer } from './srs.service.js'
import { applyMutations } from './sync.service.js'

/**
 * `.claude/rules/srs.md`: for any permutation of a log set, final card state
 * and every aggregate are identical.
 *
 * One set of answers, over four days, reaches the server three ways: one at a
 * time as they happen; in a single late batch, newest first; and in small
 * shuffled batches, the first sent twice. Cards, XP, streaks, daily stats and
 * achievements must come out the same for all three.
 *
 * What legitimately differs by route is left out of the comparison: how the
 * answer travelled (offline, received_at, client ids) and the replay counters,
 * which record that a replay happened rather than what it produced. Streaks are
 * rebuilt for every learner at the same moment first, since "current" depends
 * on when you look.
 *
 * Every date on a card is the moment of the answer, never of the sync: an
 * answer older than the card's newest is replayed into its place, and the card
 * is first seen and last correct when the learner answered.
 *
 * So is every date an achievement was unlocked, and every quest earned: an
 * offline day earns its quests when it syncs, and an achievement is dated by
 * the answer that crossed the line. Quests are drawn per learner, so that is
 * checked with one learner taking both routes.
 */
/** Days with quests, so the offline days have quests to earn. */
const START = new Date(`${QUESTS_FROM}T00:00:00.000Z`)
const SYNC_AT = new Date(START.getTime() + 5 * DAY_MS)

async function makeUser(id: string): Promise<void> {
  await db.insert(users).values({ id, name: id, email: `${id}@example.test`, emailVerified: true, timezone: 'Asia/Tokyo' })
}

/** The answers, made by `online` studying for real; replayed for the others. */
async function studyOnline(userId: string): Promise<SubmitAnswerInput[]> {
  const answers: SubmitAnswerInput[] = []
  for (let day = 0; day < 4; day++) {
    let at = new Date(START.getTime() + day * DAY_MS + 60 * 60 * 1000)
    await setClock(at)
    const { next } = await listLessons(userId, 'ja')
    if (next)
      await completeLesson(userId, 'ja', next.slug, { score: 100, missedPromptIds: [] })
    const queue = await getQueue(userId, { languageCode: 'ja', limit: 15, horizonDays: 0, mode: 'mixed' })
    for (const [i, item] of queue.items.entries()) {
      at = new Date(at.getTime() + 30_000)
      await setClock(at)
      const answer: SubmitAnswerInput = {
        id: uuidFrom('perm', String(answers.length)),
        facetId: item.facetId,
        promptId: item.promptId,
        rating: ([3, 1, 3, 4, 2, 3] as const)[(i + day) % 6]!,
        reviewedAt: at.toISOString(),
        durationMs: 3000,
        hintsUsed: 0,
        offline: false
      }
      answers.push(answer)
      await submitAnswer(userId, answer)
    }
  }
  return answers
}

/** The same lessons, finished at the same moments, so the gates open alike. */
async function sameLessons(userId: string): Promise<void> {
  for (let day = 0; day < 4; day++) {
    await setClock(new Date(START.getTime() + day * DAY_MS + 60 * 60 * 1000))
    const { next } = await listLessons(userId, 'ja')
    if (next)
      await completeLesson(userId, 'ja', next.slug, { score: 100, missedPromptIds: [] })
  }
}

/** Columns dated by the answer, compared only for one learner by both routes. */
const ARRIVAL_TIMES = ['unlocked_at']

/** Everything derived from the log, with ids written as what they stand for. */
async function stateOf(userId: string, logIndex: Map<string, number>, { arrivalTimes = false } = {}) {
  await setClock(SYNC_AT)
  await recomputeProgress(userId, LANGUAGE_ID)
  const rows = async (query: ReturnType<typeof sql>) => (await db.execute(query)).rows as Array<Record<string, unknown>>
  const logId = (id: unknown) => logIndex.get(String(id)) ?? id
  const withoutArrival = (row: Record<string, unknown>) =>
    arrivalTimes ? row : Object.fromEntries(Object.entries(row).filter(([k]) => !ARRIVAL_TIMES.includes(k)))
  // Table and column names are constants here; the user id is bound.
  const table = (name: string, order: string) => rows(sql`
    select to_jsonb(t) - array['id', 'user_id', 'created_at', 'updated_at'] as row
    from ${sql.identifier(name)} t where user_id = ${userId} order by ${sql.raw(order)}`)

  const cards = await rows(sql`
    select to_jsonb(c) - array['id', 'user_id', 'created_at', 'updated_at', 'last_applied_log_id', 'history_version', 'replay_generation'] as row
    from srs_cards c where user_id = ${userId} order by facet_id`)
  const logs = await rows(sql`
    select id, to_jsonb(l) - array['id', 'user_id', 'card_id', 'created_at', 'updated_at', 'received_at', 'client_id', 'client_seq', 'offline', 'clock_adjusted', 'client_reviewed_at', 'replay_generation', 'superseded', 'applied'] as row
    from srs_review_logs l where user_id = ${userId} order by reviewed_at, facet_id`)
  const xp = await rows(sql`
    select to_jsonb(x) - array['id', 'user_id', 'created_at', 'updated_at'] as row
    from xp_events x where user_id = ${userId} and (${arrivalTimes} or source <> 'quest') order by source, ref_id`)
  return {
    cards: cards.map(r => withoutArrival(r.row as Record<string, unknown>)),
    logs: logs.map(r => ({ log: logId(r.id), ...(r.row as object) })),
    xp: xp.map((r) => {
      const row = r.row as Record<string, unknown>
      return { ...row, ref_id: logId(row.ref_id) }
    }).sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
    dailyStats: await table('srs_daily_stats', 'language_id, local_date'),
    streaks: await table('user_streaks', 'language_id'),
    // Includes quest XP, so compared only with the arrival times.
    userXp: arrivalTimes ? await table('user_xp', 'language_id') : [],
    achievements: (await table('user_achievements', 'achievement_id')).map(r => withoutArrival(r.row as Record<string, unknown>))
  }
}

describe('a set of answers, however it arrives', () => {
  let answers: SubmitAnswerInput[] = []
  let late: SyncResult
  const shuffledResults: SyncResult[] = []
  let shuffledBatches: SubmitAnswerInput[][] = []
  const indexFor = (prefix: string) => new Map(answers.map((a, i) => [prefix ? uuidFrom(prefix, a.id) : a.id, i]))

  beforeAll(async () => {
    seedRandom(3)
    await makeUser('perm-online')
    answers = await studyOnline('perm-online')

    // All of it in one late batch, newest first.
    await makeUser('perm-late')
    await sameLessons('perm-late')
    await setClock(SYNC_AT)
    late = await applyMutations('perm-late', {
      deviceId: 'late',
      mutations: answers.map(a => ({ ...a, id: uuidFrom('late', a.id), offline: true })).reverse()
    })

    // A fixed shuffle in batches of seven, the first batch sent twice.
    await makeUser('perm-shuffled')
    await sameLessons('perm-shuffled')
    await setClock(SYNC_AT)
    const mutations = answers.map(a => ({ ...a, id: uuidFrom('shuffled', a.id), offline: true }))
    const shuffled = [...mutations.filter((_, i) => i % 3 === 2).reverse(), ...mutations.filter((_, i) => i % 3 !== 2).reverse()]
    for (let i = 0; i < shuffled.length; i += 7)
      shuffledBatches.push(shuffled.slice(i, i + 7))
    shuffledBatches = [shuffledBatches[0]!, ...shuffledBatches]
    for (const batch of shuffledBatches)
      shuffledResults.push(await applyMutations('perm-shuffled', { deviceId: 'shuffled', mutations: batch }))
  })

  afterAll(async () => {
    try {
      await resetClock()
    } finally {
      await connection.end()
    }
  })

  it('studied enough to mean something', () => {
    expect(answers.length).toBeGreaterThanOrEqual(30)
    expect(answers.filter(a => a.rating === 1).length).toBeGreaterThanOrEqual(4)
  })

  it('accepts every answer, by any route, and counts a resent batch as duplicates', () => {
    expect(late.rejected).toEqual([])
    expect(late.accepted).toHaveLength(answers.length)
    expect(shuffledResults.flatMap(r => r.rejected)).toEqual([])
    expect(shuffledResults[1]!.duplicates).toHaveLength(shuffledBatches[1]!.length)
  })

  it('in one late batch, newest first, leaves the same cards and aggregates', async () => {
    expect(await stateOf('perm-late', indexFor('late'))).toEqual(await stateOf('perm-online', indexFor('')))
  })

  it('in shuffled small batches, the first sent twice, leaves the same cards and aggregates', async () => {
    expect(await stateOf('perm-shuffled', indexFor('shuffled'))).toEqual(await stateOf('perm-online', indexFor('')))
  })

  // Quests are drawn per learner, so the same learner takes both routes: as
  // studied online, then again from nothing, all of it in one late batch.
  it('in one late batch, dates each achievement and quest by the answer, not the sync', async () => {
    const online = await stateOf('perm-online', indexFor(''), { arrivalTimes: true })
    await db.delete(users).where(eq(users.id, 'perm-online'))
    await makeUser('perm-online')
    await sameLessons('perm-online')
    await setClock(SYNC_AT)
    const again = await applyMutations('perm-online', {
      deviceId: 'again',
      mutations: answers.map(a => ({ ...a, id: uuidFrom('again', a.id), offline: true })).reverse()
    })
    expect(again.rejected).toEqual([])
    expect(await stateOf('perm-online', indexFor('again'), { arrivalTimes: true })).toEqual(online)
  })
})
