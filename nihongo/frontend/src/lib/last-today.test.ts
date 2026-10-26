import type { Today } from '@nihongo/shared/types'

import { beforeEach, describe, expect, it } from 'vitest'

import { forgetLastToday, readLastToday, saveLastToday } from './last-today'

// Only the fields the helper reads or rewrites matter here.
const today = {
  due: 12,
  newToday: 3,
  streak: { current: 4, studiedToday: true },
  celebrate: { stage: 'n5-1' },
  unseenAchievements: [{ code: 'first-review', title: 'First review', description: 'You did one' }],
  friendRequests: 2
} as unknown as Today

describe('last Today', () => {
  beforeEach(() => localStorage.clear())

  it('gives back what was saved for the same learner and language', () => {
    saveLastToday('user-1', 'ja', today)
    expect(readLastToday('user-1', 'ja')).toMatchObject({ due: 12, newToday: 3 })
  })

  it('drops what is shown once, so reopening does not celebrate it again', () => {
    saveLastToday('user-1', 'ja', today)
    expect(readLastToday('user-1', 'ja')).toMatchObject({ celebrate: null, unseenAchievements: [], friendRequests: 0 })
  })

  it('ignores a saved value that is not a Today', () => {
    saveLastToday('user-1', 'ja', today)
    const key = Object.keys(localStorage).find(k => k.startsWith('go-today:'))!
    localStorage.setItem(key, '"half a write"')
    expect(readLastToday('user-1', 'ja')).toBeNull()
  })

  it('keeps one learner and one language apart from another', () => {
    saveLastToday('user-1', 'ja', today)
    expect(readLastToday('user-2', 'ja')).toBeNull()
    expect(readLastToday('user-1', 'fr')).toBeNull()
  })

  it('forgets every learner on sign-out and leaves other settings alone', () => {
    localStorage.setItem('go-theme', 'dark')
    saveLastToday('user-1', 'ja', today)
    saveLastToday('user-2', 'fr', today)
    forgetLastToday()
    expect(readLastToday('user-1', 'ja')).toBeNull()
    expect(readLastToday('user-2', 'fr')).toBeNull()
    expect(localStorage.getItem('go-theme')).toBe('dark')
  })
})
