import { describe, expect, it } from 'vitest'

import { RECALL_GAPS, recallGloss, recallSchedule } from './index.js'

describe('recallGloss', () => {
  it('takes the first meaning without its asides', () => {
    expect(recallGloss(['to drink', 'to gulp'])).toBe('to drink')
    expect(recallGloss(['station (train, bus)'])).toBe('station')
    expect(recallGloss(['', 'cat'])).toBe('cat')
  })

  it('leaves out suffixes, which cannot be said on their own', () => {
    expect(recallGloss(['-ness'])).toBe('')
    expect(recallGloss(['-like nature'])).toBe('')
  })
})

describe('recallSchedule', () => {
  it('asks every word 1 + gaps times', () => {
    const order = recallSchedule(5)
    for (let i = 0; i < 5; i++)
      expect(order.filter(x => x === i)).toHaveLength(1 + RECALL_GAPS.length)
  })

  it('keeps each gap while there are new words to put between the repeats', () => {
    const order = recallSchedule(20)
    // The first ten words are fully spaced: twenty new words cover every gap.
    for (let i = 0; i < 10; i++) {
      const at = order.flatMap((x, p) => x === i ? [p] : [])
      at.slice(1).forEach((p, round) => {
        expect(p - at[round]! - 1, `word ${i} round ${round}`).toBeGreaterThanOrEqual(RECALL_GAPS[round]!)
      })
    }
  })

  it('never asks the same word twice in a row, even at the end', () => {
    for (const n of [1, 2, 3, 6]) {
      const order = recallSchedule(n)
      const twice = order.some((x, p) => p > 0 && order[p - 1] === x)
      expect(twice, `${n} words`).toBe(n === 1)
    }
  })

  it('is the same every time', () => {
    expect(recallSchedule(6)).toEqual(recallSchedule(6))
    expect(recallSchedule(0)).toEqual([])
  })
})
