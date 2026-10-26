import db, { connection } from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'
import { afterAll, describe, expect, it } from 'vitest'

/**
 * The pool's connection settings reach Postgres. JIT in particular: left on,
 * compiling the lessons query cost 1.45 s a request in production.
 */
describe('a pooled connection', () => {
  afterAll(async () => {
    await connection.end()
  })

  it('runs with JIT off, on every connection the pool opens', async () => {
    // Several at once, so the pool has to open more than one connection.
    const settings = await Promise.all(Array.from({ length: 4 }, () =>
      db.execute<{ jit: string }>(sql`select current_setting('jit') as jit, pg_sleep(0.05)`)))
    expect(settings.map(r => r.rows[0]?.jit)).toEqual(['off', 'off', 'off', 'off'])
  })
})
