import db, { connection, withQueryTiming } from '@nihongo/shared/db'
import { languageLevels, languages, speakProgress, speakSessions, speakSteps, users } from '@nihongo/shared/db/schema'
import { and, asc, count, eq } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { listSpeak } from './speak.service.js'

const USER = 'speak-list-test'

// The list as one join read it before the sessions were cached: the oracle.
async function joined(userId: string) {
  const rows = await db
    .select({ code: speakSessions.code, kind: speakSessions.kind, number: speakSessions.number, title: speakSessions.title, titleEn: speakSessions.titleEn, level: languageLevels.code, promptCount: count(speakSteps.id), completedAt: speakProgress.completedAt, gotIt: speakProgress.gotIt, total: speakProgress.total })
    .from(speakSessions)
    .innerJoin(languages, eq(languages.id, speakSessions.languageId))
    .innerJoin(languageLevels, eq(languageLevels.id, speakSessions.levelId))
    .leftJoin(speakSteps, and(eq(speakSteps.sessionId, speakSessions.id), eq(speakSteps.kind, 'prompt')))
    .leftJoin(speakProgress, and(eq(speakProgress.sessionId, speakSessions.id), eq(speakProgress.userId, userId)))
    .where(and(eq(languages.code, 'ja'), eq(speakSessions.published, true)))
    .groupBy(speakSessions.id, languageLevels.code, languageLevels.rank, speakProgress.completedAt, speakProgress.gotIt, speakProgress.total)
    .orderBy(asc(languageLevels.rank), asc(speakSessions.kind), asc(speakSessions.number))
  return rows.map(({ completedAt, gotIt, total, ...rest }) => ({ ...rest, progress: completedAt ? { completedAt: completedAt.toISOString(), gotIt, total } : null }))
}

describe('the speak list', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('lists the published sessions in course order with the learner\'s own progress, read fresh each time', async () => {
    await db.insert(users).values({ id: USER, name: USER, email: `${USER}@example.test`, emailVerified: true, timezone: 'UTC' })
    const before = await listSpeak(USER, 'ja')
    expect(before.sessions.length).toBeGreaterThan(1)
    expect(before.sessions).toEqual(await joined(USER))
    expect(before.next).toBe(before.sessions.find(s => s.kind === 'course')!.code)

    // Progress is the learner's, not the cache's: a run shows on the next read.
    const [first] = await db.select({ id: speakSessions.id }).from(speakSessions).where(eq(speakSessions.code, before.next!))
    await db.insert(speakProgress).values({ userId: USER, sessionId: first!.id, gotIt: 3, total: 4 })
    const { result: after, timing } = await withQueryTiming(() => listSpeak(USER, 'ja'))
    expect(timing.queries).toBe(1)
    expect(after.sessions).toEqual(await joined(USER))
    expect(after.sessions.find(s => s.code === before.next)!.progress).toMatchObject({ gotIt: 3, total: 4 })
    expect(after.next).toBe(after.sessions.filter(s => s.kind === 'course')[1]!.code)
  })

  it('lists nothing for a language that is not one', async () => {
    expect(await listSpeak(USER, 'xx')).toEqual({ sessions: [], next: null })
  })
})
