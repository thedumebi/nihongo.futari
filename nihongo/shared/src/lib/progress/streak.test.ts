import { describe, expect, it } from 'vitest'

import { computeStreak, dayLongestReached } from './streak.js'
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

describe('dayLongestReached', () => {
  it('finds the day the longest run first reached the length, not a later run', () => {
    const days = ['2026-03-01', '2026-03-02', '2026-03-03', '2026-03-10', '2026-03-11', '2026-03-12', '2026-03-13']
    expect(dayLongestReached(days, 3)).toBe('2026-03-03')
    expect(dayLongestReached(days, 4)).toBe('2026-03-13')
    expect(dayLongestReached(days, 5)).toBeNull()
  })

  it('counts a day bridged by a freeze, as the streak itself does', () => {
    const days = ['2026-03-01', '2026-03-02', '2026-03-04']
    expect(computeStreak(days, { today: '2026-03-04', freezesAvailable: 1 }).longestStreak).toBe(4)
    expect(dayLongestReached(days, 4, { freezesAvailable: 1 })).toBe('2026-03-04')
    expect(dayLongestReached(days, 4)).toBeNull()
  })

  it('ignores order and repeats', () => {
    expect(dayLongestReached(['2026-03-02', '2026-03-01', '2026-03-02'], 2)).toBe('2026-03-02')
  })
})

describe('studyDateFor', () => {
  it('maps an evening review to that same day', () => {
    expect(studyDateFor(new Date('2026-03-10T20:00:00Z'), 'Europe/London')).toBe('2026-03-10')
  })

  it('puts a 2am review on its own calendar day by default', () => {
    expect(studyDateFor(new Date('2026-03-11T02:00:00Z'), 'Europe/London')).toBe('2026-03-11')
  })

  it('maps a 2am review to the previous day for a learner with a 4am boundary', () => {
    expect(studyDateFor(new Date('2026-03-11T02:00:00Z'), 'Europe/London', 4)).toBe('2026-03-10')
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
  it('covers midnight to midnight local by default', () => {
    const { start, end } = studyDayRange('2026-03-10', 'Europe/London')
    expect(start.toISOString()).toBe('2026-03-10T00:00:00.000Z')
    expect(end.toISOString()).toBe('2026-03-11T00:00:00.000Z')
  })

  it('with a 4am boundary, contains an evening review and the following 2am, but not the prior 2am', () => {
    const { start, end } = studyDayRange('2026-03-10', 'Europe/London', 4)
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
      .toBe('2026-03-09T15:00:00.000Z') // 00:00 JST = 15:00 UTC previous day
  })

  it('throws on an invalid zone', () => {
    expect(() => studyDayRange('2026-03-10', 'Mars/Olympus')).toThrow(/Invalid study date or timezone/)
  })
})

describe('computeStreak — earned freezes', () => {
  /** Consecutive study dates starting at `from`. */
  const run = (from: string, n: number) => Array.from({ length: n }, (_, i) => nextN(from, i))
  function nextN(date: string, n: number): string {
    let d = date
    for (let i = 0; i < n; i++) d = nextDate(d)
    return d
  }

  it('earns one freeze after seven study days and spends it on the next gap', () => {
    const days = [...run('2026-03-01', 7), ...run('2026-03-09', 3)] // 03-08 missed
    const s = computeStreak(days, { today: '2026-03-11' })
    expect(s.currentStreak).toBe(11)
    expect(s.freezes).toEqual([{ earnedOn: '2026-03-07', usedOn: '2026-03-08' }])
    expect(s.freezesRemaining).toBe(0)
  })

  it('never bridges a gap that comes before the freeze was earned', () => {
    const days = ['2026-03-01', ...run('2026-03-03', 7)] // 03-02 missed, then a week
    const s = computeStreak(days, { today: '2026-03-09' })
    expect(s.freezesUsed).toEqual([])
    expect(s.currentStreak).toBe(7)
    expect(s.freezesRemaining).toBe(1)
  })

  it('holds at most two', () => {
    const s = computeStreak(run('2026-03-01', 30), { today: '2026-03-30' })
    expect(s.freezes.map(f => f.earnedOn)).toEqual(['2026-03-07', '2026-03-14'])
    expect(s.freezesRemaining).toBe(2)
  })

  it('does not count bridged days toward the next freeze', () => {
    // 6 real days, a gap a granted freeze bridges, then 1 more: 7 real days earn one.
    const days = [...run('2026-03-01', 6), '2026-03-08']
    const s = computeStreak(days, { today: '2026-03-08', freezesAvailable: 1 })
    expect(s.freezesUsed).toEqual(['2026-03-07'])
    expect(s.freezes).toEqual([{ earnedOn: '2026-03-08', usedOn: null }])
  })

  it('lands on the same answer whatever order the days arrive in', () => {
    const days = [...run('2026-03-01', 7), ...run('2026-03-09', 9), ...run('2026-03-20', 4)]
    const expected = computeStreak(days, { today: '2026-03-23' })
    for (let i = 0; i < 20; i++) {
      const shuffled = [...days].sort(() => (i * 7919 % 13) - 6)
      expect(computeStreak(shuffled.reverse(), { today: '2026-03-23' })).toEqual(expected)
    }
  })

  it('a past day filled in later can release a freeze it no longer needs', () => {
    const gappy = [...run('2026-03-01', 7), ...run('2026-03-09', 2)]
    const filled = [...gappy, '2026-03-08']
    expect(computeStreak(gappy, { today: '2026-03-10' }).freezesRemaining).toBe(0)
    expect(computeStreak(filled, { today: '2026-03-10' }).freezesRemaining).toBe(1)
  })
})
