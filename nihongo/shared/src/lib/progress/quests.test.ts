import { describe, expect, it } from 'vitest'

import { evaluateAchievements } from './achievements.js'
import { QUEST_POOL, questProgress, questsFor } from './quests.js'

describe('questsFor', () => {
  it('gives the same three quests all day, and others on another day', () => {
    const a = questsFor('u1', '2026-10-14')
    expect(questsFor('u1', '2026-10-14')).toEqual(a)
    expect(a).toHaveLength(3)
    expect(new Set(a.map(q => q.code)).size).toBe(3)
    const days = Array.from({ length: 14 }, (_, i) => questsFor('u1', `2026-10-${String(i + 1).padStart(2, '0')}`).map(q => q.code).join())
    expect(new Set(days).size).toBeGreaterThan(3)
  })

  it('always includes one review goal, and two that are not reviews', () => {
    for (let i = 1; i <= 28; i++) {
      const quests = questsFor(`user-${i}`, '2026-10-14')
      expect(quests.filter(q => q.counts === 'reviews')).toHaveLength(1)
    }
  })
})

describe('questProgress', () => {
  it('counts today\'s reviews and activities of the right kinds, capped at the target', () => {
    const quests = QUEST_POOL.filter(q => ['reviews-20', 'speak-1', 'conversation-2'].includes(q.code))
    const progress = questProgress(quests, {
      reviews: 25,
      activities: [{ kind: 'speak-listen' }, { kind: 'conversation' }, { kind: 'reading' }]
    })
    expect(progress.map(p => [p.code, p.progress, p.done])).toEqual([
      ['reviews-20', 20, true],
      ['speak-1', 1, true],
      ['conversation-2', 1, false]
    ])
  })
})

describe('evaluateAchievements', () => {
  const defs = [
    { id: 'a', thresholdKind: 'reviews', threshold: 100 },
    { id: 'b', thresholdKind: 'streak', threshold: 7 },
    { id: 'c', thresholdKind: 'speak-sessions', threshold: 1 }
  ]

  it('sets progress from the counts, capped at the threshold, and unlocks at it', () => {
    expect(evaluateAchievements({ 'reviews': 37, 'streak': 9, 'speak-sessions': 0 }, defs)).toEqual([
      { achievementId: 'a', progress: 37, unlocked: false },
      { achievementId: 'b', progress: 7, unlocked: true },
      { achievementId: 'c', progress: 0, unlocked: false }
    ])
  })

  it('is the same however often it runs', () => {
    const stats = { reviews: 120 }
    expect(evaluateAchievements(stats, defs)).toEqual(evaluateAchievements(stats, defs))
  })
})
