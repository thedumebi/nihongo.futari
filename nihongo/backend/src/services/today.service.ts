import type { Today } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { languages } from '@nihongo/shared/db/schema'
import { eq } from 'drizzle-orm'

import { listLessons } from './lesson.service.js'
import { getSummary, studiedToday } from './progress.service.js'
import { listSpeak } from './speak.service.js'
import { countDue, newCardsToday } from './srs.service.js'
import { getSettings } from './users.service.js'

/**
 * The Today screen, assembled from what each feature already knows.
 *
 * Nothing new is computed here: the due count is `countDue`, the next lesson
 * is the lesson list's `next`, the next Speak session is the course's `next`.
 * One request so the screen paints at once instead of four spinners.
 */
export async function getToday(userId: string, languageCode: string): Promise<Today | null> {
  const [language] = await db.select({ id: languages.id }).from(languages).where(eq(languages.code, languageCode)).limit(1)
  if (!language)
    return null

  const [due, newToday, lessons, speak, summary, today, settings] = await Promise.all([
    countDue(userId, language.id),
    newCardsToday(userId, language.id, new Date()),
    listLessons(userId, languageCode),
    listSpeak(userId, languageCode),
    getSummary(userId, languageCode),
    studiedToday(userId, language.id),
    getSettings(userId)
  ])

  const nextSpeak = speak.next ? speak.sessions.find(s => s.code === speak.next) : undefined

  return {
    due: due.items,
    newToday,
    newLimit: settings.dailyNewLimit,
    nextLesson: lessons.next ?? null,
    nextSpeak: nextSpeak ? { code: nextSpeak.code, number: nextSpeak.number, level: nextSpeak.level, titleEn: nextSpeak.titleEn } : null,
    streak: { current: summary.currentStreak, longest: summary.longestStreak, studiedToday: today },
    xp: { total: summary.totalXp, level: summary.level }
  }
}
