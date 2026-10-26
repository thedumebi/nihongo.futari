import { beforeEach, describe, expect, it, vi } from 'vitest'

import { recomputeHabit, recomputeProgress } from './progress.service.js'
import { deferHabit, deferProgress, deferRecompute, runDeferred } from './recompute.service.js'

vi.mock('@nihongo/shared', () => ({ pino: { error: vi.fn() } }))
vi.mock('./progress.service.js', () => ({ recomputeProgress: vi.fn(), recomputeHabit: vi.fn() }))

function day(iso: string) {
  return new Date(`${iso}T00:00:00.000Z`)
}

describe('deferProgress', () => {
  it('keeps the earliest day any item asked for', () => {
    const deferred = deferRecompute()
    deferProgress(deferred, 'ja', day('2026-10-20'))
    deferProgress(deferred, 'ja', day('2026-10-18'))
    deferProgress(deferred, 'ja', day('2026-10-22'))
    expect(deferred.progress.get('ja')).toEqual(day('2026-10-18'))
  })

  it('escalates to the whole history once any item asks for it, whatever came before', () => {
    const deferred = deferRecompute()
    deferProgress(deferred, 'ja', day('2026-10-20'))
    deferProgress(deferred, 'ja', undefined)
    expect(deferred.progress.get('ja')).toBeNull()
  })

  it('does not narrow a whole-history rebuild back to a date', () => {
    const deferred = deferRecompute()
    deferProgress(deferred, 'ja', undefined)
    deferProgress(deferred, 'ja', day('2026-10-01'))
    expect(deferred.progress.get('ja')).toBeNull()
  })
})

describe('runDeferred', () => {
  beforeEach(() => {
    vi.mocked(recomputeProgress).mockReset()
    vi.mocked(recomputeHabit).mockReset()
  })

  it('rebuilds each language once, from its earliest day or wholly', async () => {
    const deferred = deferRecompute()
    deferProgress(deferred, 'ja', day('2026-10-20'))
    deferProgress(deferred, 'ja', day('2026-10-19'))
    deferProgress(deferred, 'fr', undefined)

    await runDeferred('user-1', deferred)

    expect(vi.mocked(recomputeProgress).mock.calls).toEqual([
      ['user-1', 'ja', day('2026-10-19')],
      ['user-1', 'fr', undefined]
    ])
    expect(recomputeHabit).not.toHaveBeenCalled()
  })

  it('gives a language touched only by actions one habit rebuild, and none to a language whose progress rebuild covers it', async () => {
    const deferred = deferRecompute()
    deferProgress(deferred, 'ja', day('2026-10-20'))
    deferHabit(deferred, 'ja')
    deferHabit(deferred, 'fr')
    deferHabit(deferred, 'fr')

    await runDeferred('user-1', deferred)

    expect(vi.mocked(recomputeProgress).mock.calls).toEqual([['user-1', 'ja', day('2026-10-20')]])
    expect(vi.mocked(recomputeHabit).mock.calls).toEqual([['user-1', 'fr']])
  })

  it('keeps going after one language fails, and does not throw', async () => {
    vi.mocked(recomputeProgress).mockImplementation(async (_userId, languageId) => {
      if (languageId === 'ja')
        throw new Error('connection reset')
      return { currentStreak: 1, longestStreak: 1 } as never
    })
    const deferred = deferRecompute()
    deferProgress(deferred, 'ja', undefined)
    deferProgress(deferred, 'fr', undefined)
    deferHabit(deferred, 'de')

    await expect(runDeferred('user-1', deferred)).resolves.toBeUndefined()

    expect(vi.mocked(recomputeProgress).mock.calls.map(call => call[1])).toEqual(['ja', 'fr'])
    expect(vi.mocked(recomputeHabit).mock.calls).toEqual([['user-1', 'de']])
  })
})
