import { describe, expect, it } from 'vitest'

import { isQuietHour, nextAllowedHour } from './quiet-hours.js'

describe('isQuietHour', () => {
  const overnight = { startHour: 22, endHour: 7 }
  const daytime = { startHour: 9, endHour: 17 }

  it('handles a window that wraps past midnight', () => {
    // The normal case, not the edge case: 22:00-07:00.
    for (const h of [22, 23, 0, 3, 6]) expect(isQuietHour(h, overnight), String(h)).toBe(true)
    for (const h of [7, 12, 18, 21]) expect(isQuietHour(h, overnight), String(h)).toBe(false)
  })

  it('handles a same-day window', () => {
    for (const h of [9, 12, 16]) expect(isQuietHour(h, daytime), String(h)).toBe(true)
    for (const h of [8, 17, 23]) expect(isQuietHour(h, daytime), String(h)).toBe(false)
  })

  it('treats the end hour as outside the window', () => {
    expect(isQuietHour(7, overnight)).toBe(false)
    expect(isQuietHour(17, daytime)).toBe(false)
  })

  it('is off when start equals end', () => {
    expect(isQuietHour(3, { startHour: 0, endHour: 0 })).toBe(false)
  })

  it('is off when there is no window at all', () => {
    expect(isQuietHour(3, null)).toBe(false)
    expect(isQuietHour(3, undefined)).toBe(false)
  })
})

describe('nextAllowedHour', () => {
  it('delays out of the window rather than dropping', () => {
    // A skipped reminder looks identical to a broken one, and the streak it
    // was protecting is still worth protecting an hour later.
    expect(nextAllowedHour(3, { startHour: 22, endHour: 7 })).toBe(7)
  })

  it('leaves an allowed hour alone', () => {
    expect(nextAllowedHour(19, { startHour: 22, endHour: 7 })).toBe(19)
  })
})
