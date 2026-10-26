import type { LessonFirst, LessonListResponse, Today } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { languages } from '@nihongo/shared/db/schema'
import { eq } from 'drizzle-orm'

import { unseenAchievements } from './achievements.service.js'
import { pendingRequestCount } from './friends.service.js'
import { loadLearnerState } from './learner-state.service.js'
import { listLessons } from './lesson.service.js'
import { getSummary, lessonDoneToday, studiedToday, todayQuests } from './progress.service.js'
import { listReadings } from './readings.service.js'
import { listSpeak } from './speak.service.js'
import { claimStageCelebration, countDue, newLeftToday, nextDueAfter, stageProgress } from './srs.service.js'

/**
 * Lesson first, then words: until a lesson is finished today, today's new
 * words wait on the next one, so a learner meets how the language works before
 * the words to use with it. Kana rows are lessons too, and come first in that
 * order. Nothing waits when there is no lesson left to take.
 */
export async function lessonFirst(userId: string, languageCode: string, lessons?: LessonListResponse): Promise<LessonFirst | null> {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, languageCode)).limit(1)
  if (!language)
    return null
  const [{ done, day }, list] = await Promise.all([
    lessonDoneToday(userId, language.id),
    lessons ?? listLessons(userId, languageCode)
  ])
  const next = list.next
  return done || !next ? null : { level: next.level, slug: next.slug, title: next.title, day }
}

/**
 * The Today screen, assembled from what each feature already knows.
 *
 * Nothing new is computed here: the due count is `countDue`, the next lesson
 * is the lesson list's `next`, the next Speak session is the course's `next`.
 * One request so the screen paints at once instead of four spinners.
 */
export async function getToday(userId: string, languageCode: string, moreNew = 0): Promise<Today | null> {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, languageCode)).limit(1)
  if (!language)
    return null

  // One read of the learner's cards for the two that need them.
  const learner = await loadLearnerState(userId, language.id)
  const [due, nextDueAt, newToday, lessons, speak, summary, today, quests, unseen, readings, friendRequests, progress] = await Promise.all([
    countDue(userId, language.id),
    nextDueAfter(userId, language.id, new Date()),
    newLeftToday(userId, language.id, new Date(), moreNew, learner),
    listLessons(userId, languageCode),
    listSpeak(userId, languageCode),
    getSummary(userId, languageCode),
    studiedToday(userId, language.id),
    todayQuests(userId, language.id),
    unseenAchievements(userId),
    listReadings(languageCode, undefined, userId),
    pendingRequestCount(userId),
    stageProgress(userId, language.id, learner)
  ])
  // A stage passed while reviewing, or on another device, is announced here
  // too, not only on the next Study batch.
  const [celebrate, first] = await Promise.all([
    claimStageCelebration(userId, progress),
    lessonFirst(userId, languageCode, lessons)
  ])

  // The unread speech most within reach; ties go to the easier level, which
  // the list is already ordered by.
  const suggested = readings.readings
    .filter(r => !r.read)
    .reduce<typeof readings.readings[number] | null>((best, r) => !best || (r.coverage ?? 0) > (best.coverage ?? 0) ? r : best, null)

  const nextSpeak = speak.next ? speak.sessions.find(s => s.code === speak.next) : undefined

  return {
    due: due.items,
    nextDueAt,
    // In WORDS, with today's "learn 5 more" counted in, as Study counts them.
    newToday: newToday.budget.wordsToday,
    newLimit: newToday.budget.wordsLimit,
    extrasLeft: newToday.extrasLeft,
    newAvailable: newToday.newAvailable,
    stageWait: newToday.stageWait,
    celebrate,
    nextLesson: lessons.next ?? null,
    lessonFirst: first,
    nextSpeak: nextSpeak ? { code: nextSpeak.code, number: nextSpeak.number, level: nextSpeak.level, titleEn: nextSpeak.titleEn } : null,
    streak: { current: summary.currentStreak, longest: summary.longestStreak, studiedToday: today },
    xp: { total: summary.totalXp, level: summary.level },
    quests: quests.quests,
    suggestedReading: suggested
      ? { code: suggested.code, title: suggested.title, titleEn: suggested.titleEn, level: suggested.level, coverage: suggested.coverage }
      : null,
    unseenAchievements: unseen,
    friendRequests
  }
}
