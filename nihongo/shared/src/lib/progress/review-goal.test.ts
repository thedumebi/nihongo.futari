import { describe, expect, it } from 'vitest'

import type { ReviewGoalCard } from './review-goal.js'

import { reviewGoal } from './review-goal.js'

const day = { start: new Date('2026-10-20T00:00:00Z'), end: new Date('2026-10-21T00:00:00Z') }
const earlier = new Date('2026-10-01T00:00:00Z')
const morning = new Date('2026-10-20T08:00:00Z')
const tonight = new Date('2026-10-20T22:00:00Z')
const nextWeek = new Date('2026-10-27T00:00:00Z')

function due(at = morning): ReviewGoalCard {
  return { state: 2, due: at, createdAt: earlier, firstToday: null }
}

describe('reviewGoal', () => {
  it('counts the cards due before the day ends, none reviewed yet', () => {
    expect(reviewGoal([due(), due(tonight), { ...due(), due: nextWeek }], day)).toEqual({ available: 2, reviewed: 0 })
  })

  it('stays the same once a card is reviewed and moves to next week', () => {
    const reviewed = { state: 2, due: nextWeek, createdAt: earlier, firstToday: { stateBefore: 2, dueBefore: morning } }
    expect(reviewGoal([reviewed, due()], day)).toEqual({ available: 2, reviewed: 1 })
  })

  it('stays the same when a missed card comes back later today', () => {
    const missed = { state: 3, due: tonight, createdAt: earlier, firstToday: { stateBefore: 2, dueBefore: morning } }
    expect(reviewGoal([missed, due()], day)).toEqual({ available: 2, reviewed: 1 })
  })

  it('leaves out words learned today, though they come due tonight', () => {
    const learnedToday = { state: 1, due: tonight, createdAt: earlier, firstToday: { stateBefore: 0, dueBefore: morning } }
    expect(reviewGoal([learnedToday, due()], day)).toEqual({ available: 1, reviewed: 0 })
  })

  it('leaves out a card made today, and one reviewed early that was not due', () => {
    const madeToday = { ...due(), createdAt: morning }
    const early = { state: 2, due: nextWeek, createdAt: earlier, firstToday: { stateBefore: 2, dueBefore: nextWeek } }
    expect(reviewGoal([madeToday, early], day)).toEqual({ available: 0, reviewed: 0 })
  })
})
