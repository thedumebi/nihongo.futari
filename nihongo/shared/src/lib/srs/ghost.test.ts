import { describe, expect, it } from 'vitest'

import type { GhostPolicy, SrsRating } from '@/types/srs.js'

import { applyGhostInterval, evaluateGhost } from './ghost.js'

const POLICY: GhostPolicy = {
  threshold: 4,
  intervalFactor: 0.5,
  recentWindow: 10,
  recentAccuracyFloor: 0.6,
  clearAfterCorrect: 3,
  clearMinIntervalDays: 7,
  maxGhostIntervalDays: 21
}

const base = {
  ghost: false,
  lapses: 0,
  consecutiveCorrect: 0,
  scheduledDays: 1,
  recentRatings: [] as SrsRating[]
}

describe('evaluateGhost — flagging', () => {
  it('leaves a healthy card alone', () => {
    const d = evaluateGhost({ ...base, lapses: 1, recentRatings: [3, 3, 4, 3] }, POLICY)
    expect(d.ghost).toBe(false)
    expect(d.event).toBeNull()
    expect(d.intervalFactor).toBe(1)
  })

  it('flags on the lapse threshold', () => {
    const d = evaluateGhost({ ...base, lapses: 4 }, POLICY)
    expect(d).toMatchObject({ ghost: true, event: 'flagged', reason: 'lapse-threshold' })
  })

  it('flags the half-remembered card that lapse counting alone would miss', () => {
    // Below the lapse threshold, but failing more often than not lately.
    const d = evaluateGhost({ ...base, lapses: 3, recentRatings: [1, 3, 1, 1, 3, 1] }, POLICY)
    expect(d).toMatchObject({ ghost: true, event: 'flagged', reason: 'low-recent-accuracy' })
  })

  it('does not flag on low accuracy alone when lapses are few', () => {
    expect(evaluateGhost({ ...base, lapses: 1, recentRatings: [1, 1, 1] }, POLICY).ghost).toBe(false)
  })

  it('only considers the recent window', () => {
    // Ten good answers push the old failures out of view.
    const recentRatings: SrsRating[] = [1, 1, 1, 1, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3]
    expect(evaluateGhost({ ...base, lapses: 3, recentRatings }, POLICY).ghost).toBe(false)
  })

  it('does not flag on a tiny sample', () => {
    expect(evaluateGhost({ ...base, lapses: 3, recentRatings: [1, 1] }, POLICY).ghost).toBe(false)
  })
})

describe('evaluateGhost — recovery', () => {
  const ghosted = { ...base, ghost: true, lapses: 5 }

  it('clears after sustained correct answers at a real interval', () => {
    const d = evaluateGhost({ ...ghosted, consecutiveCorrect: 3, scheduledDays: 10 }, POLICY)
    expect(d).toMatchObject({ ghost: false, event: 'cleared', reason: 'recovered' })
  })

  it('does not clear on correct answers at a still-short interval', () => {
    // Three right in a row at one-day spacing is not evidence of recall.
    const d = evaluateGhost({ ...ghosted, consecutiveCorrect: 3, scheduledDays: 2 }, POLICY)
    expect(d.ghost).toBe(true)
    expect(d.event).toBeNull()
  })

  it('does not clear on too few correct answers', () => {
    expect(evaluateGhost({ ...ghosted, consecutiveCorrect: 2, scheduledDays: 30 }, POLICY).ghost).toBe(true)
  })

  it('escalates when lapses double the threshold', () => {
    const d = evaluateGhost({ ...ghosted, lapses: 8 }, POLICY)
    expect(d).toMatchObject({ ghost: true, event: 'escalated', reason: 'lapses-doubled' })
  })

  it('keeps the shortened interval while ghosted', () => {
    expect(evaluateGhost(ghosted, POLICY).intervalFactor).toBe(0.5)
  })
})

describe('applyGhostInterval', () => {
  const ghosted = evaluateGhost({ ...base, ghost: true, lapses: 5 }, POLICY)

  it('halves a ghosted interval', () => {
    expect(applyGhostInterval(10, ghosted, POLICY)).toBe(5)
  })

  it('never drops below one day', () => {
    expect(applyGhostInterval(1, ghosted, POLICY)).toBe(1)
  })

  it('caps a long interval so a ghost cannot drift out of sight', () => {
    expect(applyGhostInterval(200, ghosted, POLICY)).toBe(POLICY.maxGhostIntervalDays)
  })

  it('leaves a healthy card untouched', () => {
    const healthy = evaluateGhost(base, POLICY)
    expect(applyGhostInterval(30, healthy, POLICY)).toBe(30)
  })
})
