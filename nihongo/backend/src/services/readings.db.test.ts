import { connection } from '@nihongo/shared/db'
import { afterAll, describe, expect, it } from 'vitest'

import { listReadings } from './readings.service.js'

describe('the readings list', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('narrows to one level, and to nothing for a level that is not one', async () => {
    const all = (await listReadings('ja', undefined, 'readings-list-test')).readings
    const n5 = (await listReadings('ja', 'N5', 'readings-list-test')).readings
    expect(all.length).toBeGreaterThan(n5.length)
    expect(n5.map(r => r.code)).toEqual(all.filter(r => r.level === 'N5').map(r => r.code))
    expect(n5.length).toBeGreaterThan(0)
    expect((await listReadings('ja', 'no-such-level', 'readings-list-test')).readings).toEqual([])
  })

  it('lists nothing for a language that is not one', async () => {
    expect(await listReadings('xx', undefined, 'readings-list-test')).toEqual({ readings: [] })
  })
})
