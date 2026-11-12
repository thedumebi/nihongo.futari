import db, { connection } from '@nihongo/shared/db'
import { learningActivities, srsDailyStats, users, userSettings, userStreaks, userXp } from '@nihongo/shared/db/schema'
import { DEFAULT_DAY_BOUNDARY_HOUR } from '@nihongo/shared/lib'
import { ghostPolicySchema } from '@nihongo/shared/types'
import { eq } from 'drizzle-orm'
import { DateTime } from 'luxon'
import { afterAll, describe, expect, it } from 'vitest'

import { inRequestScope } from '@/lib/request-scope.js'
import { LANGUAGE_ID, uuidFrom } from '@/test/learner-specs.js'

import { currentStreakOf, headlineToday, learnerHeadline, learnerProfile, loadUserContext, streakCalendar, studiedToday, studyLevelOf } from './progress.service.js'
import { loadPolicy } from './srs.service.js'

async function bareUser(name: string): Promise<string> {
  const id = uuidFrom('learner-profile', name)
  await db.insert(users).values({ id, name: id, email: `${id}@example.test`, emailVerified: true, timezone: 'Asia/Tokyo' })
  return id
}

describe('the learner profile', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('falls back to each reader\'s own default when there is no settings row', async () => {
    const id = await bareUser('no-settings')
    expect(await learnerProfile(id)).toEqual({ timezone: 'Asia/Tokyo', settings: null })
    expect(await loadUserContext(id)).toEqual({ timezone: 'Asia/Tokyo', dayBoundaryHour: DEFAULT_DAY_BOUNDARY_HOUR })
    expect(await studyLevelOf(id)).toBeNull()
    expect(await loadPolicy(id)).toEqual({ policy: ghostPolicySchema.parse({}), fsrsParams: {} })
  })

  it('reads UTC for an account that does not exist', async () => {
    const id = uuidFrom('learner-profile', 'nobody')
    expect(await loadUserContext(id)).toEqual({ timezone: 'UTC', dayBoundaryHour: DEFAULT_DAY_BOUNDARY_HOUR })
    expect(await studyLevelOf(id)).toBeNull()
  })

  it('carries the learner\'s own settings to every reader', async () => {
    const id = await bareUser('with-settings')
    await db.insert(userSettings).values({ userId: id, dayBoundaryHour: 4, studyLevel: 'N4', ghostThreshold: 6, ghostIntervalFactor: '0.25', fsrsParams: { requestRetention: 0.85 } })
    expect(await loadUserContext(id)).toEqual({ timezone: 'Asia/Tokyo', dayBoundaryHour: 4 })
    expect(await studyLevelOf(id)).toBe('N4')
    expect(await loadPolicy(id)).toEqual({ policy: ghostPolicySchema.parse({ threshold: 6, intervalFactor: 0.25 }), fsrsParams: { requestRetention: 0.85 } })
  })

  it('is read once per request, and afresh in the next', async () => {
    const id = await bareUser('memoised')
    await db.insert(userSettings).values({ userId: id, studyLevel: 'N5' })
    const levels = await inRequestScope(async () => {
      const before = await studyLevelOf(id)
      await db.update(userSettings).set({ studyLevel: 'N3' }).where(eq(userSettings.userId, id))
      return [before, await studyLevelOf(id)]
    })
    expect(levels).toEqual(['N5', 'N5'])
    expect(await inRequestScope(() => studyLevelOf(id))).toBe('N3')
  })

  it('reads a headline of nothing yet for a learner who has not started', async () => {
    const id = await bareUser('headline-empty')
    expect(await headlineToday(id, LANGUAGE_ID)).toEqual({ xp: null, streak: null, reviewsToday: null, friendRequests: 0 })
    expect(await studiedToday(id, LANGUAGE_ID)).toBe(false)
  })

  it('reads XP, streak and the study day\'s reviews in one headline', async () => {
    const id = await bareUser('headline-full')
    const now = new Date('2026-10-20T03:00:00Z') // 12:00 in Tokyo
    await db.insert(userXp).values({ userId: id, languageId: LANGUAGE_ID, totalXp: 340, level: 3 })
    // Rebuilt today, so it is read as stored.
    await db.insert(userStreaks).values({ userId: id, languageId: LANGUAGE_ID, currentStreak: 5, longestStreak: 9, freezeCount: 1, updatedAt: new Date() })
    await db.insert(srsDailyStats).values([
      { userId: id, languageId: LANGUAGE_ID, localDate: '2026-10-19', timezone: 'Asia/Tokyo', reviewCount: 40 },
      { userId: id, languageId: LANGUAGE_ID, localDate: '2026-10-20', timezone: 'Asia/Tokyo', reviewCount: 12 }
    ])
    expect(await learnerHeadline(id, LANGUAGE_ID, '2026-10-20')).toEqual({ xp: { totalXp: 340, level: 3 }, streak: { currentStreak: 5, longestStreak: 9, freezeCount: 1 }, reviewsToday: 12, friendRequests: 0 })
    expect(await studiedToday(id, LANGUAGE_ID, now)).toBe(true)
  })

  it('brings a streak that ended while the learner was away up to today', async () => {
    const id = await bareUser('streak-lapsed')
    // Six days running, the last of them five days ago, and nothing since:
    // the row still says six, as it did the day it was written.
    const today = DateTime.now().setZone('Asia/Tokyo').startOf('day')
    const studied = [10, 9, 8, 7, 6, 5].map(n => today.minus({ days: n }).toISODate()!)
    await db.insert(srsDailyStats).values(studied.map(localDate => ({ userId: id, languageId: LANGUAGE_ID, localDate, timezone: 'Asia/Tokyo', reviewCount: 10 })))
    const lastWritten = today.minus({ days: 5 }).plus({ hours: 12 }).toJSDate()
    await db.insert(userStreaks).values({ userId: id, languageId: LANGUAGE_ID, currentStreak: 6, longestStreak: 6, lastActiveDate: studied.at(-1)!, freezeCount: 0, updatedAt: lastWritten })

    expect((await headlineToday(id, LANGUAGE_ID)).streak).toEqual({ currentStreak: 0, longestStreak: 6, freezeCount: 0 })
    expect(await currentStreakOf(id)).toBe(0)
    const [row] = await db.select({ updatedAt: userStreaks.updatedAt }).from(userStreaks).where(eq(userStreaks.userId, id))
    expect(row!.updatedAt.getTime()).toBeGreaterThan(lastWritten.getTime())
  })

  it('draws a month of the streak calendar: what was done, and where a freeze was earned and spent', async () => {
    const id = await bareUser('streak-calendar')
    // 1-7 March studied (a freeze earned on the 7th), the 8th missed and
    // covered by it, the 9th studied again: a nine-day run.
    const reviewed = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-05', '2026-03-06', '2026-03-07', '2026-03-09']
    await db.insert(srsDailyStats).values(reviewed.map(localDate => ({ userId: id, languageId: LANGUAGE_ID, localDate, timezone: 'Asia/Tokyo', reviewCount: 20, newCount: 4, timeMs: 300000 })))
    // The 4th was a lesson and a Speak session, no reviews; April is outside.
    const at = new Date('2026-03-04T03:00:00Z')
    await db.insert(learningActivities).values([
      { id: `${id}-lesson`, userId: id, languageId: LANGUAGE_ID, kind: 'lesson', refId: 'te-form', occurredAt: at, localDate: '2026-03-04', timezone: 'Asia/Tokyo' },
      { id: `${id}-speak-1`, userId: id, languageId: LANGUAGE_ID, kind: 'speak', refId: 's1', occurredAt: at, localDate: '2026-03-04', timezone: 'Asia/Tokyo' },
      { id: `${id}-speak-2`, userId: id, languageId: LANGUAGE_ID, kind: 'speak', refId: 's2', occurredAt: at, localDate: '2026-03-04', timezone: 'Asia/Tokyo' },
      { id: `${id}-april`, userId: id, languageId: LANGUAGE_ID, kind: 'speak', refId: 's3', occurredAt: new Date('2026-04-01T03:00:00Z'), localDate: '2026-04-01', timezone: 'Asia/Tokyo' }
    ])
    await db.insert(userStreaks).values({ userId: id, languageId: LANGUAGE_ID, currentStreak: 9, longestStreak: 9, lastActiveDate: '2026-04-01', freezeCount: 1, updatedAt: new Date('2026-04-01T03:00:00Z') })

    const calendar = (await streakCalendar(id, 'ja', '2026-03'))!
    const reviewDay = { studied: true, reviews: 20, newCards: 4, reviewMs: 300000, activities: [], freezeUsed: false, freezeEarned: false }
    expect(calendar).toMatchObject({ month: '2026-03', firstDay: '2026-03-01', currentStreak: 0, longestStreak: 9, freezes: 0 })
    expect(calendar.days).toEqual([
      { date: '2026-03-01', ...reviewDay },
      { date: '2026-03-02', ...reviewDay },
      { date: '2026-03-03', ...reviewDay },
      { date: '2026-03-04', studied: true, reviews: 0, newCards: 0, reviewMs: 0, activities: [{ kind: 'lesson', count: 1 }, { kind: 'speak', count: 2 }], freezeUsed: false, freezeEarned: false },
      { date: '2026-03-05', ...reviewDay },
      { date: '2026-03-06', ...reviewDay },
      { date: '2026-03-07', ...reviewDay, freezeEarned: true },
      { date: '2026-03-08', studied: false, reviews: 0, newCards: 0, reviewMs: 0, activities: [], freezeUsed: true, freezeEarned: false },
      { date: '2026-03-09', ...reviewDay }
    ])
  })

  it('reads no calendar for a language that does not exist', async () => {
    const id = await bareUser('streak-calendar-nolang')
    expect(await streakCalendar(id, 'xx', '2026-03')).toBeNull()
  })
})
