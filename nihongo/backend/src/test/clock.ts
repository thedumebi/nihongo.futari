import db from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'
import { vi } from 'vitest'

/**
 * Moves the time both JavaScript and Postgres see (see `installClock` in
 * `db-global-setup.ts`). Only `Date` is faked, so the pg driver's own timers
 * keep running.
 */
export async function setClock(at: Date): Promise<void> {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(at)
  await db.execute(sql`update public.test_clock set at = ${at.toISOString()}::timestamptz`)
}

export async function resetClock(): Promise<void> {
  vi.useRealTimers()
  await db.execute(sql`update public.test_clock set at = null`)
}

/**
 * Pins `Math.random` to a seeded sequence (mulberry32), so a queue's prompt
 * salt and anything shuffled come out the same on every run.
 */
export function seedRandom(seed: number): void {
  let state = seed >>> 0
  vi.spyOn(Math, 'random').mockImplementation(() => {
    state = (state + 0x6D2B79F5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  })
}
