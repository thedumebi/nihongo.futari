import db, { connection } from '@nihongo/shared/db'
import { exercisePrompts } from '@nihongo/shared/db/schema'
import { asc, sql } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { promptOrderKey } from './prompt-pick.js'

/**
 * The prompt pick moved from `order by md5(p.id || salt)` in Postgres to
 * `promptOrderKey` in Node. Same digests, same order, under the test
 * database's collation and production's (en_US, which ignores hyphens in
 * words but has none to ignore in fixed-length hex).
 */
describe('promptOrderKey against Postgres', () => {
  afterAll(async () => {
    await connection.end()
  })

  // `en_US` is the one name both macOS and Debian give the UTF-8 collation.
  it.each(['C', 'en_US'])('orders a sample of prompts as Postgres does under %s', async (collation) => {
    const salt = 'k3j9x0q'
    const sample = await db.select({ id: exercisePrompts.id }).from(exercisePrompts).orderBy(asc(exercisePrompts.id)).limit(500)
    const ids = sample.map(p => p.id)
    expect(ids).toHaveLength(500)
    const pg = await db.execute<{ id: string, key: string }>(sql`
      select p.id, md5(p.id || ${salt}) as key
      from exercise_prompts p
      where p.id in ${ids}
      order by md5(p.id || ${salt}) collate ${sql.identifier(collation)}`)
    expect(pg.rows.map(r => r.key)).toEqual(pg.rows.map(r => promptOrderKey(r.id, salt)))
    expect(pg.rows.map(r => r.id)).toEqual([...ids].sort((a, b) => promptOrderKey(a, salt) < promptOrderKey(b, salt) ? -1 : 1))
  })
})
