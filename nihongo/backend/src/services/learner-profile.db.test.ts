import db, { connection } from '@nihongo/shared/db'
import { users, userSettings } from '@nihongo/shared/db/schema'
import { DEFAULT_DAY_BOUNDARY_HOUR } from '@nihongo/shared/lib'
import { ghostPolicySchema } from '@nihongo/shared/types'
import { eq } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { inRequestScope } from '@/lib/request-scope.js'
import { uuidFrom } from '@/test/learner-specs.js'

import { learnerProfile, loadUserContext, studyLevelOf } from './progress.service.js'
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
})
