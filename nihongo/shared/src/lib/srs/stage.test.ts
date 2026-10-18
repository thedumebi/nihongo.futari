import { describe, expect, it } from 'vitest'

import { cardsToPassStage, nextCelebration } from './stage.js'

describe('cardsToPassStage', () => {
  it('counts the cards still to learn at 85%', () => {
    // 0.85 × 172 = 146.2, so 147 learned passes.
    expect(cardsToPassStage(132, 172)).toBe(15)
    expect(cardsToPassStage(146, 172)).toBe(1)
    expect(cardsToPassStage(147, 172)).toBe(0)
  })

  it('is not thrown by floating point at an exact share', () => {
    // 0.85 × 20 is 17.000000000000004; 17 of 20 is exactly 85% and passes.
    expect(cardsToPassStage(16, 20)).toBe(1)
    expect(cardsToPassStage(17, 20)).toBe(0)
  })

  it('never goes below zero, and an empty stage needs nothing', () => {
    expect(cardsToPassStage(30, 20)).toBe(0)
    expect(cardsToPassStage(0, 0)).toBe(0)
  })
})

describe('nextCelebration', () => {
  const at = (highest: number, last: number, pendingFrom: number | null = null, pendingTo: number | null = null) =>
    ({ highestStageSeen: highest, lastStageSeen: last, pendingFrom, pendingTo })

  it('records a level on first sight and says nothing', () => {
    expect(nextCelebration(null, 3)).toEqual({ marks: at(3, 3), claimed: false })
  })

  it('celebrates a pass once, from where they were', () => {
    const passed = nextCelebration(at(4, 4), 5)
    expect(passed).toEqual({ marks: at(5, 5, 4, 5), claimed: true })
    // Seen again on the same stage: nothing new.
    expect(nextCelebration(passed.marks, 5).claimed).toBe(false)
  })

  it('follows a content push-back silently and does not re-fire on the way back', () => {
    const pushed = nextCelebration(at(5, 5), 3)
    expect(pushed).toEqual({ marks: at(5, 3), claimed: false })
    expect(nextCelebration(pushed.marks, 5)).toEqual({ marks: at(5, 5), claimed: false })
  })

  it('celebrates a real pass after a push-back, from the stage they were on', () => {
    expect(nextCelebration(at(5, 3), 6)).toEqual({ marks: at(6, 6, 3, 6), claimed: true })
  })

  it('keeps the first starting point when a second pass comes before the first is shown', () => {
    expect(nextCelebration(at(5, 5, 4, 5), 6)).toEqual({ marks: at(6, 6, 4, 6), claimed: true })
  })

  it('stays silent under a stale high mark', () => {
    // The owner's N5 row: 39 from a backfill, while really on stage 5.
    expect(nextCelebration(at(39, 39), 5).claimed).toBe(false)
  })
})
