import { describe, expect, it } from 'vitest'

import { activityCounts, boardNudge, daysThisWeek, friendCodeFrom, normaliseFriendCode, pairStreak, rankBoard } from './index.js'

describe('friendCodeFrom', () => {
  it('makes eight unambiguous characters', () => {
    const code = friendCodeFrom([0, 1, 2, 3, 4, 5, 6, 7])
    expect(code).toBe('ABCDEFGH')
    expect(friendCodeFrom(Array.from({ length: 8 }, (_, i) => 200 + i))).toMatch(/^[A-HJKMNP-Z2-9]{8}$/)
  })
})

describe('normaliseFriendCode', () => {
  it('forgives case, spaces and dashes', () => {
    expect(normaliseFriendCode(' abcd-efgh ')).toBe('ABCDEFGH')
  })
})

describe('pairStreak', () => {
  it('counts the days both studied, back from today', () => {
    const a = ['2026-10-10', '2026-10-11', '2026-10-12', '2026-10-13', '2026-10-14']
    const b = ['2026-10-12', '2026-10-13', '2026-10-14']
    expect(pairStreak(a, b, '2026-10-14')).toBe(3)
  })

  it('keeps yesterday\'s streak alive until today is done', () => {
    expect(pairStreak(['2026-10-12', '2026-10-13'], ['2026-10-12', '2026-10-13'], '2026-10-14')).toBe(2)
  })

  it('breaks on a day only one of them studied', () => {
    expect(pairStreak(['2026-10-12', '2026-10-13', '2026-10-14'], ['2026-10-12', '2026-10-14'], '2026-10-14')).toBe(1)
  })

  it('is zero when the last shared day is two days gone', () => {
    expect(pairStreak(['2026-10-11'], ['2026-10-11'], '2026-10-14')).toBe(0)
  })
})

describe('daysThisWeek', () => {
  it('counts distinct days in the seven ending today', () => {
    expect(daysThisWeek(['2026-10-07', '2026-10-08', '2026-10-14', '2026-10-14', '2026-10-15'], '2026-10-14')).toBe(2)
  })
})

describe('activityCounts', () => {
  it('adds the review totals and groups activities as the menu does', () => {
    const out = activityCounts(
      [{ reviews: 30, newWords: 5 }, { reviews: 12, newWords: 0 }],
      [
        { kind: 'lesson', count: 1 },
        { kind: 'kana-lesson', count: 2 },
        { kind: 'speak-listen', count: 1 },
        { kind: 'story', count: 1 },
        { kind: 'crossword', count: 1 },
        { kind: 'ghost-boss', count: 1 },
        { kind: 'reading', count: 3 }
      ]
    )
    expect(out).toEqual({ reviews: 42, newWords: 5, lessons: 3, conversations: 0, reads: 3, speak: 2, recall: 0, shadowing: 0, games: 2 })
  })

  it('leaves out a kind it does not know rather than guessing', () => {
    expect(activityCounts([], [{ kind: 'something-new', count: 4 }])).toEqual(activityCounts([], []))
  })
})

describe('rankBoard', () => {
  it('ranks by days, then by XP, then puts you first on a full tie', () => {
    const rows = [
      { name: 'a', days: 4, xp: 100, isMe: false },
      { name: 'b', days: 4, xp: 300, isMe: false },
      { name: 'me', days: 2, xp: 900, isMe: true },
      { name: 'c', days: 2, xp: 900, isMe: false }
    ]
    expect(rankBoard(rows).map(r => r.name)).toEqual(['b', 'a', 'me', 'c'])
  })
})

describe('boardNudge', () => {
  const at = (meDays: number, meXp: number, fDays: number, fXp: number) => ({ me: { days: meDays, xp: meXp }, friend: { days: fDays, xp: fXp } })

  it('says passed when a friend who was behind goes ahead by studying', () => {
    expect(boardNudge(at(4, 300, 4, 280), at(4, 300, 4, 320))).toBe('passed')
    expect(boardNudge(at(4, 300, 3, 900), at(4, 300, 5, 900))).toBe('passed')
  })

  it('does not say passed when you fell back but they did nothing', () => {
    // One of your days left the seven: they lead now, but they did not move.
    expect(boardNudge(at(4, 300, 4, 280), at(3, 300, 4, 280))).toBeNull()
  })

  it('says close when they move up level on days and within reach', () => {
    expect(boardNudge(at(4, 300, 4, 200), at(4, 300, 4, 280))).toBe('close')
  })

  it('stays quiet when they are still far behind, or already ahead', () => {
    expect(boardNudge(at(4, 300, 3, 200), at(4, 300, 3, 299))).toBeNull()
    expect(boardNudge(at(4, 300, 5, 400), at(4, 300, 5, 450))).toBeNull()
  })

  it('needs an earlier look to compare against', () => {
    expect(boardNudge(null, at(4, 300, 5, 900))).toBeNull()
  })
})
