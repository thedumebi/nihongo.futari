import { describe, expect, it } from 'vitest'

import type { ReviewEvent, SrsRating } from '@/types/srs.js'

import { canFastForward, compareEvents, replay } from './replay.js'

// Deterministic PRNG so a failing permutation is reproducible from the seed
// rather than "it went red once on CI".
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

const BASE = new Date('2026-01-01T09:00:00.000Z').getTime()
const DAY = 24 * 60 * 60 * 1000

/** UUIDv7-shaped ids: time-ordered prefix, so sorting by id is chronological. */
function makeEvents(ratings: readonly SrsRating[], gapDays = 1): ReviewEvent[] {
  return ratings.map((rating, i) => ({
    id: `0194${String(i).padStart(4, '0')}-0000-7000-8000-00000000${String(i).padStart(4, '0')}`,
    rating,
    reviewedAt: new Date(BASE + i * gapDays * DAY)
  }))
}

const MIXED: SrsRating[] = [3, 3, 1, 2, 3, 4, 1, 3, 3, 2, 4, 1, 3, 3, 4]

describe('replay — determinism under permutation', () => {
  it('produces byte-identical state for ANY ordering of the same log set', () => {
    const events = makeEvents(MIXED)
    const canonical = replay(events)

    // 200 shuffles from a fixed seed. This is the property the entire offline
    // sync design rests on: the log set is a G-Set and the fold over it is
    // deterministic, so two devices that both went offline converge on the
    // same card state regardless of which one syncs first.
    const rand = mulberry32(0xC0FFEE)
    for (let i = 0; i < 200; i++) {
      const permuted = replay(shuffle(events, rand))
      expect(permuted.state, `permutation ${i} diverged`).toEqual(canonical.state)
      expect(permuted.snapshots, `permutation ${i} snapshots diverged`).toEqual(canonical.snapshots)
    }
  })

  it('is stable across separate invocations (no hidden clock or RNG dependency)', () => {
    const events = makeEvents(MIXED)
    expect(replay(events).state).toEqual(replay(events).state)
  })

  it('stays deterministic with fuzz explicitly enabled', () => {
    // ts-fsrs has no Math.random; its fuzz seed derives from review_time, reps
    // and difficulty*stability. If that ever changes upstream, this fails and
    // we learn about it here instead of through corrupted user schedules.
    const events = makeEvents(MIXED)
    const a = replay(events, { enableFuzz: true })
    const rand = mulberry32(42)
    for (let i = 0; i < 50; i++) {
      expect(replay(shuffle(events, rand), { enableFuzz: true }).state).toEqual(a.state)
    }
  })

  it('reaches the same state whether events arrive together or in fragments', () => {
    const events = makeEvents(MIXED)
    const whole = replay(events)
    // Simulate three offline devices flushing disjoint slices in a silly order.
    const fragmented = replay([...events.slice(10), ...events.slice(0, 4), ...events.slice(4, 10)])
    expect(fragmented.state).toEqual(whole.state)
  })

  it('a late-arriving early review changes the outcome (replay is doing real work)', () => {
    const events = makeEvents([3, 3, 3, 3])
    const withLapse: ReviewEvent[] = [
      ...events,
      { id: '01940000-0000-7000-8000-0000000000ff', rating: 1, reviewedAt: new Date(BASE + 1.5 * DAY) }
    ]
    // Inserting an "Again" into the middle must not be a no-op — otherwise the
    // permutation test above would pass trivially.
    expect(replay(withLapse).state).not.toEqual(replay(events).state)
    expect(replay(withLapse).state.lapses).toBeGreaterThan(replay(events).state.lapses)
  })
})

describe('replay — ordering', () => {
  it('breaks reviewedAt ties by id so the order is total, not partial', () => {
    const at = new Date(BASE)
    const a: ReviewEvent = { id: 'aaa', rating: 3, reviewedAt: at }
    const b: ReviewEvent = { id: 'bbb', rating: 1, reviewedAt: at }
    expect(compareEvents(a, b)).toBeLessThan(0)
    expect(compareEvents(b, a)).toBeGreaterThan(0)
    expect(replay([a, b]).state).toEqual(replay([b, a]).state)
  })

  it('anchors the first card at the first review, not at wall-clock now', () => {
    const events = makeEvents([3, 3])
    expect(replay(events).snapshots[0]!.dueBefore.getTime()).toBe(BASE)
  })
})

describe('replay — edge cases', () => {
  it('returns an empty card for an empty log', () => {
    const result = replay([])
    expect(result.appliedCount).toBe(0)
    expect(result.state.reps).toBe(0)
    expect(result.snapshots).toEqual([])
  })

  it('folds a single review', () => {
    const result = replay(makeEvents([3]))
    expect(result.appliedCount).toBe(1)
    expect(result.state.reps).toBe(1)
  })

  it('truncates very long histories to the tail and flags it', () => {
    const many = makeEvents(Array.from({ length: 40 }, () => 3 as SrsRating))
    const result = replay(many, {}, { maxEvents: 10, tailEvents: 5 })
    expect(result.truncated).toBe(true)
    expect(result.appliedCount).toBe(5)
  })

  it('does not flag truncation when history fits', () => {
    expect(replay(makeEvents([3, 3, 3])).truncated).toBe(false)
  })
})

describe('replay — double-review guard', () => {
  const at = new Date(BASE)

  it('supersedes a near-simultaneous review from a DIFFERENT device', () => {
    const events: ReviewEvent[] = [
      { id: 'a', rating: 3, reviewedAt: at, clientId: 'phone' },
      { id: 'b', rating: 3, reviewedAt: new Date(BASE + 500), clientId: 'laptop' }
    ]
    const result = replay(events)
    expect(result.supersededIds).toEqual(['b'])
    expect(result.appliedCount).toBe(1)
  })

  it('keeps two quick reviews from the SAME device — that is just fast answering', () => {
    const events: ReviewEvent[] = [
      { id: 'a', rating: 3, reviewedAt: at, clientId: 'phone' },
      { id: 'b', rating: 3, reviewedAt: new Date(BASE + 500), clientId: 'phone' }
    ]
    expect(replay(events).supersededIds).toEqual([])
    expect(replay(events).appliedCount).toBe(2)
  })

  it('keeps cross-device reviews that are genuinely far apart', () => {
    const events: ReviewEvent[] = [
      { id: 'a', rating: 3, reviewedAt: at, clientId: 'phone' },
      { id: 'b', rating: 3, reviewedAt: new Date(BASE + DAY), clientId: 'laptop' }
    ]
    expect(replay(events).supersededIds).toEqual([])
  })

  it('stays deterministic under permutation even with supersessions', () => {
    const events: ReviewEvent[] = [
      { id: 'a', rating: 3, reviewedAt: at, clientId: 'phone' },
      { id: 'b', rating: 1, reviewedAt: new Date(BASE + 400), clientId: 'laptop' },
      { id: 'c', rating: 3, reviewedAt: new Date(BASE + DAY), clientId: 'phone' }
    ]
    const canonical = replay(events)
    const rand = mulberry32(7)
    for (let i = 0; i < 50; i++) {
      const p = replay(shuffle(events, rand))
      expect(p.state).toEqual(canonical.state)
      expect(p.supersededIds).toEqual(canonical.supersededIds)
    }
  })
})

describe('canFastForward', () => {
  const events = makeEvents([3, 3, 3])
  const state = replay(events).state

  it('allows the cheap path when every incoming review is newer', () => {
    const incoming: ReviewEvent[] = [{ id: 'z', rating: 3, reviewedAt: new Date(BASE + 10 * DAY) }]
    expect(canFastForward(state, incoming)).toBe(true)
  })

  it('forces a full replay when anything lands before the cached last review', () => {
    const incoming: ReviewEvent[] = [{ id: 'z', rating: 3, reviewedAt: new Date(BASE + 1 * DAY) }]
    expect(canFastForward(state, incoming)).toBe(false)
  })

  it('treats a never-reviewed card as fast-forwardable', () => {
    expect(canFastForward(replay([]).state, makeEvents([3]))).toBe(true)
  })
})
