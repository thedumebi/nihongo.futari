import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getStudySettings } from './settings'

const get = vi.fn()
vi.mock('./client', () => ({ default: { get: (...args: unknown[]) => get(...args) } }))

describe('getStudySettings', () => {
  beforeEach(() => {
    get.mockReset()
  })

  it('shares one request between callers asking at once, and asks again after', async () => {
    get.mockResolvedValueOnce({ data: { studyLevel: 'N5' } }).mockResolvedValueOnce({ data: { studyLevel: 'N4' } })
    const [a, b] = await Promise.all([getStudySettings(), getStudySettings()])
    expect([a.studyLevel, b.studyLevel]).toEqual(['N5', 'N5'])
    expect(get).toHaveBeenCalledTimes(1)

    expect((await getStudySettings()).studyLevel).toBe('N4')
    expect(get).toHaveBeenCalledTimes(2)
  })

  it('lets the next caller try again after a failure', async () => {
    get.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: { studyLevel: 'N5' } })
    await expect(getStudySettings()).rejects.toThrow('offline')
    expect((await getStudySettings()).studyLevel).toBe('N5')
  })
})
