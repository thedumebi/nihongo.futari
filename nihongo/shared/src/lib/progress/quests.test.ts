import { describe, expect, it } from 'vitest'

import { evaluateAchievements } from './achievements.js'
import { GAME_QUESTS, GAME_QUESTS_FROM, QUEST_POOL, questProgress, questsFor, REVIEW_QUEST_MIN } from './quests.js'

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

describe('questsFor — the review goal fits the day', () => {
  it('shrinks the review target to what today holds', () => {
    const [review] = questsFor('u1', '2026-10-14', 12)
    expect([review!.counts, review!.target, review!.title]).toEqual(['reviews', 12, 'Review 12 items'])
  })

  it('keeps the usual target when there is more than enough', () => {
    const plain = questsFor('u1', '2026-10-14')
    expect(questsFor('u1', '2026-10-14', 500)).toEqual(plain)
  })

  it('swaps the review goal for another quest on a day with almost nothing due', () => {
    const quests = questsFor('u1', '2026-10-14', REVIEW_QUEST_MIN - 1)
    expect(quests.filter(q => q.counts === 'reviews')).toHaveLength(0)
    expect(new Set(quests.map(q => q.code)).size).toBe(3)
  })
})

describe('questProgress', () => {
  it('counts today\'s reviews and activities of the right kinds, capped at the target', () => {
    const quests = QUEST_POOL.filter(q => ['reviews-20', 'speak-1', 'conversation-2'].includes(q.code))
    const progress = questProgress(quests, {
      reviews: 25,
      newWords: 0,
      activities: [{ kind: 'speak-listen' }, { kind: 'conversation' }, { kind: 'reading' }]
    })
    expect(progress.map(p => [p.code, p.progress, p.done])).toEqual([
      ['reviews-20', 20, true],
      ['speak-1', 1, true],
      ['conversation-2', 1, false]
    ])
  })
})

describe('questProgress — the newer quests', () => {
  it('counts new cards learned today, and a story but not a course session for the story quest', () => {
    const quests = QUEST_POOL.filter(q => ['new-5', 'story-1', 'kanji-build-1'].includes(q.code))
    const progress = questProgress(quests, {
      reviews: 0,
      newWords: 6,
      activities: [{ kind: 'speak' }, { kind: 'kanji-build' }]
    })
    expect(progress.map(p => [p.code, p.progress, p.done])).toEqual([
      ['new-5', 5, true],
      ['story-1', 0, false],
      ['kanji-build-1', 1, true]
    ])
  })

  it('rotates through the whole pool, every game included, over a few months', () => {
    const seen = new Set<string>()
    for (let d = 0; d < 120; d++)
      questsFor('u1', day(d), undefined, { ghosts: true }).forEach(q => seen.add(q.code))
    expect([...seen].sort()).toEqual(QUEST_POOL.map(q => q.code).sort())
  })
})

/** A study day from the first one with a quest per game. */
function day(offset: number): string {
  const d = new Date(`${GAME_QUESTS_FROM}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + offset)
  return d.toISOString().slice(0, 10)
}

const gameCodes = new Set(GAME_QUESTS.map(q => q.code))

describe('questsFor: the games', () => {
  it('never sets more than one game in a day, with or without a review goal', () => {
    for (let u = 0; u < 20; u++) {
      for (let d = 0; d < 60; d++) {
        for (const reviews of [undefined, REVIEW_QUEST_MIN - 1]) {
          const quests = questsFor(`user-${u}`, day(d), reviews, { ghosts: true })
          expect(quests.filter(q => gameCodes.has(q.code)).length).toBeLessThanOrEqual(1)
          expect(new Set(quests.map(q => q.code)).size).toBe(3)
        }
      }
    }
  })

  it('offers the ghost boss only in a week that has ghosts', () => {
    const codes = (ghosts: boolean) => Array.from({ length: 200 }, (_, d) => questsFor('u1', day(d), undefined, { ghosts }).map(q => q.code)).flat()
    expect(codes(false)).not.toContain('ghost-boss-1')
    expect(codes(true)).toContain('ghost-boss-1')
  })

  it('leaves the days before the change as they were', () => {
    const before = Array.from({ length: 30 }, (_, d) => questsFor('u1', `2026-09-${String(d + 1).padStart(2, '0')}`).map(q => q.code)).flat()
    expect(before).toContain('game-1')
    expect(before).not.toContain('particles-1')
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
