import { describe, expect, it } from 'vitest'

import type { AggregateEvent, SrsRating } from '@/types/progress.js'

import { aggregateReviews } from './aggregate.js'

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function shuffle<T>(items: readonly T[], rand: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1))
    ;[out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

const TZ = 'Europe/London'

function ev(id: string, iso: string, rating: SrsRating, stateBefore = 2, lapsed = false, durationMs = 1000): AggregateEvent {
  return { logId: id, reviewedAt: new Date(iso), rating, stateBefore, lapsed, durationMs }
}

const HISTORY: AggregateEvent[] = [
  ev('a', '2026-03-01T09:00:00Z', 3, 0),
  ev('b', '2026-03-01T09:05:00Z', 3),
  ev('c', '2026-03-01T21:30:00Z', 1, 2, true),
  ev('d', '2026-03-02T08:00:00Z', 4),
  ev('e', '2026-03-02T08:10:00Z', 3, 0),
  ev('f', '2026-03-04T12:00:00Z', 2),
  ev('g', '2026-03-04T12:01:00Z', 1, 2, true),
  ev('h', '2026-03-05T07:00:00Z', 4, 0)
]

describe('aggregateReviews — replay safety', () => {
  it('is invariant under ANY ordering of the same event set', () => {
    const canonical = aggregateReviews(HISTORY, { timezone: TZ })
    const rand = mulberry32(0xBEEF)
    for (let i = 0; i < 200; i++) {
      expect(aggregateReviews(shuffle(HISTORY, rand), { timezone: TZ }), `permutation ${i}`).toEqual(canonical)
    }
  })

  it('gives the same answer whether events arrive together or in fragments', () => {
    const whole = aggregateReviews(HISTORY, { timezone: TZ })
    // A device that was offline flushes the middle of history last.
    const fragments = [...HISTORY.slice(5), ...HISTORY.slice(0, 2), ...HISTORY.slice(2, 5)]
    expect(aggregateReviews(fragments, { timezone: TZ })).toEqual(whole)
  })

  it('never double-counts when the same event set is aggregated twice', () => {
    const once = aggregateReviews(HISTORY, { timezone: TZ })
    const twice = aggregateReviews(HISTORY, { timezone: TZ })
    expect(twice.totalXp).toBe(once.totalXp)
    expect(twice.daily).toEqual(once.daily)
  })

  it('emits one XP award per review, keyed by log id', () => {
    const result = aggregateReviews(HISTORY, { timezone: TZ })
    expect(result.xp).toHaveLength(HISTORY.length)
    expect(new Set(result.xp.map(x => x.refId)).size).toBe(HISTORY.length)
  })

  it('adding a late review changes the totals (the fold is doing real work)', () => {
    const extra = [...HISTORY, ev('z', '2026-03-01T10:00:00Z', 3)]
    expect(aggregateReviews(extra, { timezone: TZ }).totalXp)
      .toBeGreaterThan(aggregateReviews(HISTORY, { timezone: TZ }).totalXp)
  })
})

describe('aggregateReviews — day bucketing', () => {
  it('buckets by local study day', () => {
    const result = aggregateReviews(HISTORY, { timezone: TZ })
    expect(result.affectedDates).toEqual(['2026-03-01', '2026-03-02', '2026-03-04', '2026-03-05'])
  })

  it('counts a late-night review as the PREVIOUS day (4am boundary)', () => {
    // 01:30 local on the 6th is still the 5th's study session.
    const late = [ev('n', '2026-03-06T01:30:00Z', 3)]
    expect(aggregateReviews(late, { timezone: TZ }).daily[0]!.localDate).toBe('2026-03-05')
  })

  it('rolls over at 4am, not midnight', () => {
    const before = aggregateReviews([ev('n', '2026-03-06T03:59:00Z', 3)], { timezone: TZ })
    const after = aggregateReviews([ev('n', '2026-03-06T04:01:00Z', 3)], { timezone: TZ })
    expect(before.daily[0]!.localDate).toBe('2026-03-05')
    expect(after.daily[0]!.localDate).toBe('2026-03-06')
  })

  it('honours a custom boundary hour', () => {
    const r = aggregateReviews([ev('n', '2026-03-06T01:30:00Z', 3)], { timezone: TZ, dayBoundaryHour: 0 })
    expect(r.daily[0]!.localDate).toBe('2026-03-06')
  })

  it('respects the user timezone, not the server', () => {
    // 23:00 UTC on the 5th is already the 6th in Tokyo (08:00 local).
    const e = [ev('n', '2026-03-05T23:00:00Z', 3)]
    expect(aggregateReviews(e, { timezone: 'Asia/Tokyo' }).daily[0]!.localDate).toBe('2026-03-06')
    expect(aggregateReviews(e, { timezone: 'Europe/London' }).daily[0]!.localDate).toBe('2026-03-05')
  })

  it('survives a DST transition', () => {
    // Europe/London springs forward 2026-03-29 at 01:00.
    const around = [
      ev('p', '2026-03-29T00:30:00Z', 3),
      ev('q', '2026-03-29T02:30:00Z', 3)
    ]
    expect(() => aggregateReviews(around, { timezone: TZ })).not.toThrow()
    expect(aggregateReviews(around, { timezone: TZ }).daily.length).toBeGreaterThan(0)
  })

  it('rejects an invalid timezone rather than silently using UTC', () => {
    expect(() => aggregateReviews(HISTORY, { timezone: 'Not/AZone' })).toThrow(/Invalid timezone/)
  })
})

describe('aggregateReviews — counting', () => {
  const result = aggregateReviews(HISTORY, { timezone: TZ })
  const day1 = result.daily.find(d => d.localDate === '2026-03-01')!

  it('counts reviews, new items, correct answers and lapses', () => {
    expect(day1.reviewCount).toBe(3)
    expect(day1.newCount).toBe(1)
    expect(day1.correctCount).toBe(2) // one Again
    expect(day1.lapseCount).toBe(1)
  })

  it('sums time spent', () => {
    expect(day1.timeMs).toBe(3000)
  })

  it('awards more XP for a new item than a routine correct review', () => {
    const newItem = aggregateReviews([ev('x', '2026-03-01T09:00:00Z', 3, 0)], { timezone: TZ })
    const routine = aggregateReviews([ev('y', '2026-03-01T09:00:00Z', 3, 2)], { timezone: TZ })
    expect(newItem.totalXp).toBeGreaterThan(routine.totalXp)
  })

  it('still awards something for a wrong answer', () => {
    const wrong = aggregateReviews([ev('w', '2026-03-01T09:00:00Z', 1, 2, true)], { timezone: TZ })
    expect(wrong.totalXp).toBeGreaterThan(0)
  })

  it('returns nothing for no events', () => {
    const empty = aggregateReviews([], { timezone: TZ })
    expect(empty).toEqual({ daily: [], xp: [], totalXp: 0, affectedDates: [] })
  })

  it('xP is a pure function of the review, not of when it was submitted', () => {
    // Same review, aggregated at different "times" — there is no clock input at
    // all, so a replayed review is always worth exactly what it was worth.
    const a = aggregateReviews([ev('same', '2026-03-01T09:00:00Z', 4, 2)], { timezone: TZ })
    const b = aggregateReviews([ev('same', '2026-03-01T09:00:00Z', 4, 2)], { timezone: TZ })
    expect(a.xp).toEqual(b.xp)
  })
})
