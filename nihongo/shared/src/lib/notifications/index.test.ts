import { describe, expect, it } from 'vitest'

import { shouldSendDueAlert } from './index.js'

const base = { hour: 14, minute: 0, reminder: { hour: 19, minute: 0 }, due: 12, minutesSinceStudy: 300, nudgesToday: 0 }

describe('shouldSendDueAlert', () => {
  it('sends in the daytime when enough is waiting and nothing else is near', () => {
    expect(shouldSendDueAlert(base)).toBe(true)
  })

  it('stays quiet at night, and with too little waiting', () => {
    expect(shouldSendDueAlert({ ...base, hour: 7 })).toBe(false)
    expect(shouldSendDueAlert({ ...base, hour: 21 })).toBe(false)
    expect(shouldSendDueAlert({ ...base, due: 9 })).toBe(false)
  })

  it('does not interrupt someone who has just studied', () => {
    expect(shouldSendDueAlert({ ...base, minutesSinceStudy: 30 })).toBe(false)
    expect(shouldSendDueAlert({ ...base, minutesSinceStudy: null })).toBe(true)
  })

  it('leaves it to the daily reminder when that is within two hours', () => {
    expect(shouldSendDueAlert({ ...base, hour: 17, minute: 30 })).toBe(false)
    expect(shouldSendDueAlert({ ...base, hour: 20, minute: 15, reminder: { hour: 19, minute: 0 } })).toBe(false)
    expect(shouldSendDueAlert({ ...base, reminder: null, hour: 18 })).toBe(true)
  })

  it('respects the day\'s cap on nudges', () => {
    expect(shouldSendDueAlert({ ...base, nudgesToday: 3 })).toBe(false)
  })
})
