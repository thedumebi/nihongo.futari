import type { SubmitAnswerInput } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { phoneticSeriesMembers, srsCards, studyItems, users } from '@nihongo/shared/db/schema'
import { and, asc, eq, inArray } from 'drizzle-orm'
import { createHash } from 'node:crypto'

import { completeLesson, listLessons } from '@/services/lesson.service.js'
import { getQueue, saveStudyItem, submitAnswer } from '@/services/srs.service.js'
import { applyMutations } from '@/services/sync.service.js'
import { updateSettings } from '@/services/users.service.js'

import type { LearnerSpec } from './learner-specs.js'

import { setClock } from './clock.js'
import { sessionStart, START, uuidFrom } from './learner-specs.js'

/**
 * Learners for the DB-backed tests, made the way real ones are: by asking for a
 * queue, answering it, and finishing lessons, through the same services the
 * routes call. Nothing is inserted behind the services' backs except the
 * account itself and, where a fixture needs it, a suspended card.
 *
 * Everything is fixed: the days (from `START`), the answers (a hash of the
 * facet and the day), the ids. Built twice, a learner comes out the same, which
 * is what lets a golden snapshot of their Today mean anything.
 */
function hashNumber(...parts: Array<string | number>): number {
  return createHash('md5').update(parts.join(':')).digest().readUInt32BE(0)
}

/** Mostly Good, sometimes Again, now and then Hard or Easy. */
function ratingFor(facetId: string, day: number): SubmitAnswerInput['rating'] {
  const roll = hashNumber(facetId, day) % 100
  return roll < 12 ? 1 : roll < 20 ? 2 : roll < 92 ? 3 : 4
}

/** Saves the series' kanji, as a learner adding them from the kanji page would. */
async function saveSeriesKanji(userId: string, seriesId: string): Promise<void> {
  const items = await db
    .select({ id: studyItems.id })
    .from(phoneticSeriesMembers)
    .innerJoin(studyItems, eq(studyItems.kanjiId, phoneticSeriesMembers.kanjiId))
    .where(and(eq(phoneticSeriesMembers.seriesId, seriesId), eq(phoneticSeriesMembers.followsSeries, true)))
    .orderBy(asc(studyItems.id))
  for (const item of items)
    await saveStudyItem(userId, item.id, 'saved')
}

export async function createLearner(spec: LearnerSpec): Promise<string> {
  await setClock(START)
  await db.insert(users).values({
    id: spec.id,
    name: spec.id,
    email: `${spec.id}@example.test`,
    emailVerified: true,
    timezone: spec.timezone
  })
  if (spec.dayBoundaryHour !== undefined || spec.dailyNewLimit !== undefined)
    await updateSettings(spec.id, { dayBoundaryHour: spec.dayBoundaryHour, dailyNewLimit: spec.dailyNewLimit })
  if (spec.knowSeries)
    await saveSeriesKanji(spec.id, spec.knowSeries)

  let answered = 0
  for (let day = 0; day < spec.days; day++) {
    let at = sessionStart(spec, day)
    await setClock(at)

    for (let n = 0; spec.lessonDays?.includes(day) && n < (spec.lessonsPerDay ?? 1); n++) {
      const { next } = await listLessons(spec.id, 'ja')
      if (!next)
        break
      await completeLesson(spec.id, 'ja', next.slug, { score: 80, missedPromptIds: [] })
    }

    const answers: SubmitAnswerInput[] = []
    while (answers.length < spec.answersPerDay) {
      const queue = await getQueue(spec.id, { languageCode: 'ja', limit: 20, horizonDays: 0, mode: spec.mode ?? 'mixed' })
      if (queue.items.length === 0)
        break
      const page: SubmitAnswerInput[] = []
      for (const item of queue.items.slice(0, spec.answersPerDay - answers.length)) {
        at = new Date(at.getTime() + 20_000)
        const answer: SubmitAnswerInput = {
          id: uuidFrom(spec.id, String(answered++)),
          facetId: item.facetId,
          promptId: item.promptId,
          rating: spec.rating ?? ratingFor(item.facetId, day),
          reviewedAt: at.toISOString(),
          durationMs: 4000,
          hintsUsed: 0,
          offline: false
        }
        answers.push(answer)
        page.push(answer)
      }
      if (day === spec.replayOnDay)
        break
      // The session's first answer goes up on its own, through the online
      // route; the rest sync a page at a time, as the app sends them.
      await setClock(at)
      const online = answers.length === page.length ? page.shift() : undefined
      if (online)
        await submitAnswer(spec.id, online)
      if (page.length > 0)
        await applyMutations(spec.id, { deviceId: 'golden-device', mutations: page.map(a => ({ ...a, offline: true })) })
    }

    if (day === spec.replayOnDay)
      answered = await syncOutOfOrder(spec, answers, at, answered)
  }

  if (spec.suspend) {
    const cards = await db
      .select({ id: srsCards.id })
      .from(srsCards)
      .where(eq(srsCards.userId, spec.id))
      .orderBy(asc(srsCards.facetId))
      .limit(spec.suspend)
    await db.update(srsCards).set({ suspended: true }).where(and(
      eq(srsCards.userId, spec.id),
      inArray(srsCards.id, cards.map(card => card.id))
    ))
  }
  return spec.id
}

/**
 * The day's answers go up offline, and the first card is answered twice: once
 * early, once late. The late answer syncs first, so the early one arrives after
 * the card's last review. The rules say that replays the card's history; today
 * the clock clamp re-dates the early answer instead (see the known divergences
 * in `sync-permutation.db.test.ts`). The golden pins whichever happens.
 */
async function syncOutOfOrder(spec: LearnerSpec, answers: SubmitAnswerInput[], at: Date, answered: number): Promise<number> {
  const [first, ...rest] = answers
  if (!first)
    return answered
  const lateAt = new Date(at.getTime() + 10 * 60 * 1000)
  const late: SubmitAnswerInput = { ...first, id: uuidFrom(spec.id, String(answered++)), rating: 3, reviewedAt: lateAt.toISOString() }
  await setClock(new Date(lateAt.getTime() + 60_000))
  await applyMutations(spec.id, { deviceId: 'golden-device', mutations: [...rest, late].map(a => ({ ...a, offline: true })) })
  await applyMutations(spec.id, { deviceId: 'golden-device', mutations: [{ ...first, offline: true }] })
  return answered
}
