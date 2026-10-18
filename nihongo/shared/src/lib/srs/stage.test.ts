import { describe, expect, it } from 'vitest'

import { cardsToPassStage } from './stage.js'

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
