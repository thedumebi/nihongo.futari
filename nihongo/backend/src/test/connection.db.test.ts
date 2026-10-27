import db, { connection, withQueryTiming } from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'
import { afterAll, describe, expect, it, vi } from 'vitest'

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
    // A free client was there each time.
    expect(timing.queued).toBe(0)
    expect(timing.ms).toBeGreaterThanOrEqual(20)
  })

  it('names the slowest query by its statement, without the values in it', async () => {
    const { timing } = await withQueryTiming(async () => {
      await db.execute(sql`select 1`)
      await db.execute(sql`select 'someone@example.test' as who, ${'a parameter'}::text as p, pg_sleep(0.03)`)
    })
    expect(timing.slowest?.ms).toBeGreaterThanOrEqual(30)
    expect(timing.slowest?.sql).toBe('select ? as who, $1::text as p, pg_sleep(0.03)')
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
    // Every client open and idle first, so the wait below is for one to come
    // free, not for a new connection.
    await busy(connection.options.max)
    expect(connection.totalCount).toBe(connection.options.max)
    const [a, b] = await Promise.all([busy(many), busy(1)])
    expect([a.timing.queries, b.timing.queries]).toEqual([many, 1])
    // Every client busy for three of them, whichever request asked first.
    expect(a.timing.queued + b.timing.queued).toBe(3)
    // The queued ones wait out a 30 ms query side by side, counted once.
    expect(a.timing.waitMs + b.timing.waitMs).toBeGreaterThan(20)
    expect(a.timing.waitMs).toBeLessThan(80)
  })

  it('closes idle connections past their timeout, down to the minimum it keeps open', async () => {
    const min = connection.options.min ?? 0
    expect(min).toBeGreaterThan(0)
    const timeout = connection.options.idleTimeoutMillis
    connection.options.idleTimeoutMillis = 30
    try {
      // Across the whole pool, so every connection is released under the short
      // timeout, the ones earlier tests opened included.
      await Promise.all(Array.from({ length: connection.options.max ?? 10 }, () => db.execute(sql`select pg_sleep(0.02)`)))
      expect(connection.totalCount).toBeGreaterThan(min)
      await vi.waitFor(() => {
        expect(connection.totalCount).toBe(min)
      })
    } finally {
      connection.options.idleTimeoutMillis = timeout
    }
  })

  it('drops an idle connection the server closes, and carries on', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const [idle, other] = await Promise.all([connection.connect(), connection.connect()])
    const pid = (await idle.query<{ pid: number }>('select pg_backend_pid() as pid')).rows[0]!.pid
    idle.release()
    await other.query('select pg_terminate_backend($1)', [pid])
    other.release()
    await vi.waitFor(() => {
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('[db] idle connection lost'))
    })
    expect((await db.execute<{ n: number }>(sql`select 1 as n`)).rows[0]?.n).toBe(1)
    warn.mockRestore()
  })
})
