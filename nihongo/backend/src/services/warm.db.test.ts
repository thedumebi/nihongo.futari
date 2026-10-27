import db, { connection, withQueryTiming } from '@nihongo/shared/db'
import { users } from '@nihongo/shared/db/schema'
import { afterAll, describe, expect, it } from 'vitest'

import { inRequestScope } from '../lib/request-scope.js'
import { listDialogues } from './dialogues.service.js'
import { listReadings } from './readings.service.js'
import { warmConnections, warmContent } from './warm.service.js'

describe('warming the content caches', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('opens every connection the pool keeps, each its own, and leaves them idle', async () => {
    const min = connection.options.min ?? 0
    expect(min).toBeGreaterThan(1)
    // A pool opens connections only as queries ask for them.
    expect(connection.totalCount).toBeLessThan(min)
    await warmConnections()
    expect(connection.totalCount).toBeGreaterThanOrEqual(min)
    expect(connection.idleCount).toBe(connection.totalCount)
  })

  it('leaves the first learner only their own rows to read', async () => {
    await db.insert(users).values({ id: 'warm-first', name: 'w', email: 'warm-first@example.test', emailVerified: true, timezone: 'UTC' })
    await warmContent()

    // The learner's cards and lessons, and which speeches they have read: no
    // speech's lines, no reading list, no glossary.
    const readings = await withQueryTiming(() => inRequestScope(() => listReadings('ja', undefined, 'warm-first')))
    expect(readings.result.readings.length).toBeGreaterThan(0)
    expect(readings.timing.queries).toBe(3)

    // The list itself is the learner's (it joins their cards), plus the turn
    // digest and the cards and lessons and conversations they have practised.
    const dialogues = await withQueryTiming(() => inRequestScope(() => listDialogues('ja', 'warm-first')))
    expect(dialogues.result.dialogues.length).toBeGreaterThan(0)
    expect(dialogues.timing.queries).toBeLessThanOrEqual(5)
  })
})
