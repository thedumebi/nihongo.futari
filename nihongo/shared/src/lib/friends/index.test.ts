import { describe, expect, it } from 'vitest'

import { daysThisWeek, friendCodeFrom, normaliseFriendCode, pairStreak } from './index.js'

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
