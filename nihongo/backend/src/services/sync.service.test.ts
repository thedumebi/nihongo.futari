import type { DeferredRecompute } from '@nihongo/shared/types'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { recordActivityFor } from './activities.service.js'
import { completeLesson } from './lesson.service.js'
import { runDeferred } from './recompute.service.js'
import { submitAnswer } from './srs.service.js'
import { applyMutations } from './sync.service.js'

vi.mock('@nihongo/shared/db', () => ({
  default: { select: () => ({ from: () => ({ where: async () => [] }) }) }
}))
vi.mock('./srs.service.js', () => ({ submitAnswer: vi.fn(), saveWord: vi.fn() }))
vi.mock('./activities.service.js', () => ({ recordActivityFor: vi.fn() }))
vi.mock('./lesson.service.js', () => ({ completeLesson: vi.fn() }))
vi.mock('./speak.service.js', () => ({ completeSpeakSession: vi.fn(), missSpeakStep: vi.fn() }))
vi.mock('./recompute.service.js', () => ({
  deferRecompute: (): DeferredRecompute => ({ progress: new Map(), habit: new Set() }),
  runDeferred: vi.fn()
}))

function answer(id: string, reviewedAt: string) {
  return {
    id,
    cardId: `card-${id}`,
    facetId: `facet-${id}`,
    rating: 3 as const,
    reviewedAt,
    durationMs: 1000
  }
}

describe('applyMutations', () => {
  beforeEach(() => {
    vi.mocked(submitAnswer).mockReset()
    vi.mocked(recordActivityFor).mockReset()
    vi.mocked(completeLesson).mockReset()
    vi.mocked(runDeferred).mockReset()
  })

  it('hands every answer and action the same collector, then rebuilds once', async () => {
    vi.mocked(submitAnswer).mockImplementation(async (_userId, input) => ({ applied: true, cardId: `card-${input.id}` }) as never)
    vi.mocked(recordActivityFor).mockResolvedValue({ recorded: true, xp: 5 })
    vi.mocked(completeLesson).mockResolvedValue({ studyItemId: 'si', completedAt: '2026-10-26T10:00:00.000Z', score: 90, addedToReview: false })

    await applyMutations('user-1', {
      deviceId: 'phone',
      mutations: [answer('a', '2026-10-26T10:00:00.000Z'), answer('b', '2026-10-26T09:00:00.000Z')] as never,
      actions: [
        { type: 'activity', id: '01900000-0000-7000-8000-000000000001', languageCode: 'ja', kind: 'crossword', refId: 'daily' },
        { type: 'lessonComplete', id: '01900000-0000-7000-8000-000000000002', occurredAt: '2026-10-26T10:00:00.000Z', languageCode: 'ja', slug: 'teiru', score: 90, missedPromptIds: [] }
      ] as never
    })

    const collectors = [
      ...vi.mocked(submitAnswer).mock.calls.map(call => call[2]),
      vi.mocked(recordActivityFor).mock.calls[0]![3],
      vi.mocked(completeLesson).mock.calls[0]![4]
    ]
    expect(collectors).toHaveLength(4)
    expect(new Set(collectors).size).toBe(1)
    expect(vi.mocked(runDeferred)).toHaveBeenCalledTimes(1)
    expect(vi.mocked(runDeferred)).toHaveBeenCalledWith('user-1', collectors[0])
  })

  it('applies answers oldest first', async () => {
    vi.mocked(submitAnswer).mockImplementation(async (_userId, input) => ({ applied: true, cardId: `card-${input.id}` }) as never)

    await applyMutations('user-1', {
      deviceId: 'phone',
      mutations: [answer('late', '2026-10-26T10:00:00.000Z'), answer('early', '2026-10-26T08:00:00.000Z')] as never
    })

    expect(vi.mocked(submitAnswer).mock.calls.map(call => call[1].id)).toEqual(['early', 'late'])
  })
})
