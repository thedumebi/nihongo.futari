import db, { connection } from '@nihongo/shared/db'
import { exercisePrompts } from '@nihongo/shared/db/schema'
import { asc, sql } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

import { promptOrderKey } from './prompt-pick.js'

/**
 * English collations, by the names the platforms give them: ICU's, then
 * Debian's and macOS's libc ones. CI's Alpine Postgres has no libc locales.
 */
const ENGLISH = ['en-US-x-icu', 'en_US.utf8', 'en_US.UTF-8']

async function englishCollation(): Promise<string> {
  const found = await db.execute<{ collname: string }>(sql`
    select collname from pg_collation
    where collname in ${ENGLISH} and collencoding in (-1, pg_char_to_encoding('UTF8'))`)
  const name = ENGLISH.find(n => found.rows.some(r => r.collname === n))
  if (!name)
    throw new Error(`None of ${ENGLISH.join(', ')} exists on this server`)
  return name
}

/**
 * The prompt pick moved from `order by md5(p.id || salt)` in Postgres to
 * `promptOrderKey` in Node. Same digests, same order, under the test
 * database's collation (C) and an English one like production's (en_US,
 * which ignores hyphens in words but has none to ignore in fixed-length hex).
 */
describe('promptOrderKey against Postgres', () => {
  afterAll(async () => {
    await connection.end()
  })

  it.each(['C', 'English'])('orders a sample of prompts as Postgres does under %s', async (name) => {
    const collation = name === 'C' ? 'C' : await englishCollation()
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
