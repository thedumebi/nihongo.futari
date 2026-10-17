import { describe, expect, it } from 'vitest'

import { newBudget } from './budget.js'

describe('newBudget', () => {
  it('counts words, and the other cards started today as extras', () => {
    expect(newBudget({ dailyNewLimit: 20, moreNew: 0, extraPracticeMultiple: 2, newWordsToday: 5, newCardsToday: 9 })).toEqual({
      wordsLimit: 20,
      wordsToday: 5,
      wordsLeft: 15,
      extrasLimit: 40,
      extrasToday: 4,
      extrasLeft: 36
    })
  })

  it('lets extras go on once the words are done, until their own limit', () => {
    const b = newBudget({ dailyNewLimit: 10, moreNew: 0, extraPracticeMultiple: 1, newWordsToday: 10, newCardsToday: 18 })
    expect([b.wordsLeft, b.extrasLeft]).toEqual([0, 2])
  })

  it('grows both limits with "learn 5 more"', () => {
    const b = newBudget({ dailyNewLimit: 10, moreNew: 5, extraPracticeMultiple: 3, newWordsToday: 10, newCardsToday: 10 })
    expect([b.wordsLimit, b.wordsLeft, b.extrasLimit]).toEqual([15, 5, 45])
  })

  it('never goes below zero', () => {
    const b = newBudget({ dailyNewLimit: 5, moreNew: 0, extraPracticeMultiple: 1, newWordsToday: 9, newCardsToday: 30 })
    expect([b.wordsLeft, b.extrasLeft]).toEqual([0, 0])
  })
})
