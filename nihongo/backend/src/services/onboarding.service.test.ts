import type { OnboardingAnswers } from '@nihongo/shared/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getPrefs, setPrefs } from './notifications.service.js'
import { submitOnboarding } from './onboarding.service.js'

// Only the reminder write is under test; the settings rows are not.
vi.mock('@nihongo/shared/db', () => {
  const chain: Record<string, unknown> = {}
  for (const name of ['select', 'from', 'where', 'insert', 'values', 'onConflictDoUpdate'])
    chain[name] = () => chain
  chain.limit = async () => []
  chain.then = (resolve: (value: unknown) => void) => resolve([])
  return { default: chain }
})
vi.mock('./users.service.js', () => ({ updateSettings: vi.fn(async () => undefined) }))
vi.mock('./notifications.service.js', () => ({ getPrefs: vi.fn(), setPrefs: vi.fn(async () => undefined) }))

const STORED = { reminderHour: 19, reminderMinute: 0, reminderEmailEnabled: true, reminderPushEnabled: true, timezone: 'Asia/Tokyo' }

const ANSWERS: OnboardingAnswers = {
  start: 'new',
  goals: [],
  minutes: 15,
  furiganaMode: 'always',
  level: null,
  reminder: null
}

describe('submitOnboarding reminders', () => {
  beforeEach(() => {
    vi.mocked(getPrefs).mockResolvedValue(STORED as unknown as Awaited<ReturnType<typeof getPrefs>>)
    vi.mocked(setPrefs).mockClear()
  })

  it('turns every reminder off when the learner chose none', async () => {
    await submitOnboarding('u1', ANSWERS)
    expect(setPrefs).toHaveBeenCalledWith('u1', { ...STORED, reminderEmailEnabled: false, reminderPushEnabled: false })
  })

  it('keeps the time and channels the learner chose', async () => {
    await submitOnboarding('u1', { ...ANSWERS, reminder: { hour: 8, minute: 30, email: false, push: true } })
    expect(setPrefs).toHaveBeenCalledWith('u1', { ...STORED, reminderHour: 8, reminderMinute: 30, reminderEmailEnabled: false, reminderPushEnabled: true })
  })
})
