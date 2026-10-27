import { beforeEach, describe, expect, it, vi } from 'vitest'

const get = vi.fn()
vi.mock('@/api/client', () => ({ default: { get: (...args: unknown[]) => get(...args), patch: vi.fn() } }))
vi.mock('@/api/settings', () => ({ getStudySettings: vi.fn() }))
vi.mock('@/composables/use-answer-streak', () => ({ setStreakCelebrations: vi.fn() }))

/** A fresh copy of the module, since what it has loaded is shared module state. */
async function furigana() {
  vi.resetModules()
  return import('./use-furigana')
}

describe('known kanji', () => {
  beforeEach(() => {
    get.mockReset()
  })

  it('lets a page join the refresh already on its way, not ask again', async () => {
    get.mockResolvedValue({ data: { characters: ['日', '本'] } })
    const { refreshKnownKanji, useFurigana } = await furigana()
    const refreshing = refreshKnownKanji('ja')
    const { knownKanji, loadKnownKanji } = useFurigana()
    await Promise.all([refreshing, loadKnownKanji('ja')])
    expect(get).toHaveBeenCalledTimes(1)
    expect([...knownKanji.value]).toEqual(['日', '本'])
  })

  it('leaves the next page free to ask after a refresh that failed', async () => {
    get.mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce({ data: { characters: ['日'] } })
    const { refreshKnownKanji, useFurigana } = await furigana()
    await refreshKnownKanji('ja')
    const { knownKanji, loadKnownKanji } = useFurigana()
    await loadKnownKanji('ja')
    expect(get).toHaveBeenCalledTimes(2)
    expect([...knownKanji.value]).toEqual(['日'])
  })
})
