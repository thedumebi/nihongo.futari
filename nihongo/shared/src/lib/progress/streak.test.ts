import { describe, expect, it } from 'vitest'

import { computeStreak } from './streak.js'
import { daysBetween, nextDate, studyDateFor, studyDayRange } from './study-day.js'

describe('computeStreak — basics', () => {
  it('is zero with no study days', () => {
    expect(computeStreak([], { today: '2026-03-10' })).toMatchObject({
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null
    })
  })

  it('counts a consecutive run ending today', () => {
    const r = computeStreak(['2026-03-08', '2026-03-09', '2026-03-10'], { today: '2026-03-10' })
    expect(r.currentStreak).toBe(3)
    expect(r.longestStreak).toBe(3)
    expect(r.lastActiveDate).toBe('2026-03-10')
  })

  it('keeps the streak alive when today has not been studied yet', () => {
    // Studied through yesterday; today is still in progress, not a missed day.
    const r = computeStreak(['2026-03-08', '2026-03-09'], { today: '2026-03-10' })
    expect(r.currentStreak).toBe(2)
  })

  it('breaks once a full day passes with nothing in it', () => {
    const r = computeStreak(['2026-03-08', '2026-03-09'], { today: '2026-03-11' })
    expect(r.currentStreak).toBe(0)
    expect(r.longestStreak).toBe(2)
  })

  it('remembers the longest run even after a break', () => {
    const r = computeStreak(
      ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-04', '2026-03-09', '2026-03-10'],
      { today: '2026-03-10' }
    )
    expect(r.longestStreak).toBe(4)
    expect(r.currentStreak).toBe(2)
  })

  it('ignores duplicate dates', () => {
    const r = computeStreak(['2026-03-09', '2026-03-09', '2026-03-10'], { today: '2026-03-10' })
    expect(r.currentStreak).toBe(2)
  })

  it('does not care what order the dates arrive in', () => {
    const forwards = computeStreak(['2026-03-08', '2026-03-09', '2026-03-10'], { today: '2026-03-10' })
    const backwards = computeStreak(['2026-03-10', '2026-03-08', '2026-03-09'], { today: '2026-03-10' })
    expect(backwards).toEqual(forwards)
  })
})

describe('computeStreak — replay safety', () => {
  it('a replayed review that fills a gap JOINS two runs', () => {
    // This is precisely what an incrementing counter would miss: a phone that
    // was offline flushes the 5th, and two 2-day runs become one 5-day run.
    const before = computeStreak(
      ['2026-03-03', '2026-03-04', '2026-03-06', '2026-03-07'],
      { today: '2026-03-07' }
    )
    const after = computeStreak(
      ['2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06', '2026-03-07'],
      { today: '2026-03-07' }
    )
    expect(before.currentStreak).toBe(2)
    expect(after.currentStreak).toBe(5)
    expect(after.longestStreak).toBe(5)
  })

  it('recomputing from the same day set is idempotent', () => {
    const dates = ['2026-03-08', '2026-03-09', '2026-03-10']
    expect(computeStreak(dates, { today: '2026-03-10' }))
      .toEqual(computeStreak(dates, { today: '2026-03-10' }))
  })
})

describe('computeStreak — freezes', () => {
  it('bridges one missed day', () => {
    const r = computeStreak(
      ['2026-03-08', '2026-03-10'],
      { today: '2026-03-10', freezesAvailable: 1 }
    )
    expect(r.currentStreak).toBe(3) // 8th, bridged 9th, 10th
    expect(r.freezesUsed).toEqual(['2026-03-09'])
    expect(r.freezesRemaining).toBe(0)
  })

  it('does not bridge without a freeze', () => {
    const r = computeStreak(['2026-03-08', '2026-03-10'], { today: '2026-03-10', freezesAvailable: 0 })
    expect(r.currentStreak).toBe(1)
    expect(r.freezesUsed).toEqual([])
  })

  it('spends multiple freezes for a longer gap', () => {
    const r = computeStreak(
      ['2026-03-07', '2026-03-10'],
      { today: '2026-03-10', freezesAvailable: 2 }
    )
    expect(r.currentStreak).toBe(4)
    expect(r.freezesUsed).toEqual(['2026-03-08', '2026-03-09'])
  })

  it('does not partially bridge a gap it cannot afford', () => {
    const r = computeStreak(
      ['2026-03-07', '2026-03-10'],
      { today: '2026-03-10', freezesAvailable: 1 }
    )
    expect(r.currentStreak).toBe(1)
    expect(r.freezesRemaining).toBe(1)
  })

  it('bridges a trailing gap up to today', () => {
    const r = computeStreak(
      ['2026-03-08', '2026-03-09'],
      { today: '2026-03-11', freezesAvailable: 1 }
    )
    // Missed the 10th, freeze covers it, streak survives into today.
    expect(r.currentStreak).toBe(3)
    expect(r.freezesUsed).toEqual(['2026-03-10'])
  })

  it('lets the streak lapse when the trailing gap is unaffordable', () => {
    const r = computeStreak(['2026-03-08'], { today: '2026-03-14', freezesAvailable: 2 })
    expect(r.currentStreak).toBe(0)
  })
})

describe('studyDateFor', () => {
  it('maps an evening review to that same day', () => {
    expect(studyDateFor(new Date('2026-03-10T20:00:00Z'), 'Europe/London')).toBe('2026-03-10')
  })

  it('maps a 2am review to the previous day', () => {
    expect(studyDateFor(new Date('2026-03-11T02:00:00Z'), 'Europe/London')).toBe('2026-03-10')
  })

  it('is timezone-aware', () => {
    const instant = new Date('2026-03-10T22:00:00Z')
    expect(studyDateFor(instant, 'Europe/London')).toBe('2026-03-10')
    expect(studyDateFor(instant, 'Asia/Tokyo')).toBe('2026-03-11') // 07:00 next day
  })

  it('throws on an invalid zone', () => {
    expect(() => studyDateFor(new Date(), 'Mars/Olympus')).toThrow(/Invalid timezone/)
  })
})

describe('date helpers', () => {
  it('counts days between dates', () => {
    expect(daysBetween('2026-03-08', '2026-03-10')).toBe(2)
    expect(daysBetween('2026-03-10', '2026-03-10')).toBe(0)
  })

  it('counts across a month boundary', () => {
    expect(daysBetween('2026-02-27', '2026-03-02')).toBe(3)
  })

  it('advances a date', () => {
    expect(nextDate('2026-02-28')).toBe('2026-03-01')
    expect(nextDate('2026-12-31')).toBe('2027-01-01')
  })
})

describe('studyDayRange', () => {
  it('covers 4am-to-4am local', () => {
    const { start, end } = studyDayRange('2026-03-10', 'Europe/London')
    expect(start.toISOString()).toBe('2026-03-10T04:00:00.000Z')
    expect(end.toISOString()).toBe('2026-03-11T04:00:00.000Z')
  })

  it('contains an evening review and the following 2am, but not the prior 2am', () => {
    const { start, end } = studyDayRange('2026-03-10', 'Europe/London')
    const evening = new Date('2026-03-10T20:00:00Z')
    const after2am = new Date('2026-03-11T02:00:00Z')
    const before2am = new Date('2026-03-10T02:00:00Z')
    expect(evening >= start && evening < end).toBe(true)
    expect(after2am >= start && after2am < end).toBe(true)
    expect(before2am >= start && before2am < end).toBe(false)
  })

  it('agrees with studyDateFor at both edges', () => {
    const { start, end } = studyDayRange('2026-03-10', 'Europe/London')
    expect(studyDateFor(start, 'Europe/London')).toBe('2026-03-10')
    expect(studyDateFor(new Date(end.getTime() - 1), 'Europe/London')).toBe('2026-03-10')
    expect(studyDateFor(end, 'Europe/London')).toBe('2026-03-11')
  })

  it('shifts with the timezone', () => {
    expect(studyDayRange('2026-03-10', 'Asia/Tokyo').start.toISOString())
      .toBe('2026-03-09T19:00:00.000Z') // 04:00 JST = 19:00 UTC previous day
  })

  it('throws on an invalid zone', () => {
    expect(() => studyDayRange('2026-03-10', 'Mars/Olympus')).toThrow(/Invalid study date or timezone/)
  })
})
