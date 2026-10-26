import db, { connection, withQueryTiming } from '@nihongo/shared/db'
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

  it('counts each query once, in a transaction or out of one, with the time it took', async () => {
    const { result, timing } = await withQueryTiming(async () => {
      await db.execute(sql`select pg_sleep(0.02)`)
      return db.transaction(async (tx) => {
        await tx.execute(sql`select 1`)
        return 'done'
      })
    })
    expect(result).toBe('done')
    // Two of ours, plus the transaction's begin and commit.
    expect(timing.queries).toBe(4)
    expect(timing.ms).toBeGreaterThanOrEqual(20)
  })

  it('times queries run side by side as the wall time they took, not their sum', async () => {
    const { timing } = await withQueryTiming(async () => {
      await Promise.all([1, 2, 3].map(() => db.execute(sql`select pg_sleep(0.05)`)))
    })
    expect(timing.queries).toBe(3)
    expect(timing.ms).toBeGreaterThanOrEqual(50)
    expect(timing.ms).toBeLessThan(140)
  })

  it('counts the wait for a free connection apart, and keeps each request\'s tally its own', async () => {
    // More queries at once than the pool has clients, from two requests: the
    // queued ones are handed a client by whichever request frees one.
    const many = connection.options.max + 2
    const busy = (n: number) => withQueryTiming(async () => {
      await Promise.all(Array.from({ length: n }, () => db.execute(sql`select pg_sleep(0.03)`)))
    })
    const [a, b] = await Promise.all([busy(many), busy(1)])
    expect([a.timing.queries, b.timing.queries]).toEqual([many, 1])
    expect(a.timing.waitMs + b.timing.waitMs).toBeGreaterThan(10)
  })
})
