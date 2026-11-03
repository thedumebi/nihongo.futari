import { describe, expect, it, vi } from 'vitest'

import { needsReading, proseKey, readingsFor } from './grammar-furigana.service.js'

// The helpers here are pure; no connection is needed.
vi.mock('@nihongo/shared/db', () => ({ default: {} }))
vi.mock('@nihongo/shared', () => ({ pino: { warn: vi.fn() } }))

describe('readingsFor', () => {
  const readings = new Map([['分ける', [{ t: '分', r: 'わ' }, { t: 'ける' }]]])

  it('gives the stored segments for a text that has them', () => {
    expect(readingsFor(readings, '分ける')).toEqual([{ t: '分', r: 'わ' }, { t: 'ける' }])
  })

  it('never guesses a reading the seed did not store', () => {
    expect(readingsFor(readings, '分かる').some(s => s.r)).toBe(false)
    expect(readingsFor(readings, '分かる').map(s => s.t).join('')).toBe('分かる')
  })

  it('still splits English from Japanese, which the page romanises apart', () => {
    expect(readingsFor(readings, 'Vて + しまう').map(s => s.t)).toEqual(['V', 'て', ' + ', 'しまう'])
  })

  it('gives nothing for an empty or missing text', () => {
    expect(readingsFor(readings, null)).toEqual([])
    expect(readingsFor(readings, '')).toEqual([])
  })
})

describe('needsReading', () => {
  it('is true only for text with a kanji in it', () => {
    expect(needsReading('Vて + しまう')).toBe(false)
    expect(needsReading('Noun + が + 分かる')).toBe(true)
  })
})

describe('proseKey', () => {
  it('is the sha256 of the text, so an edit is a new key', () => {
    expect(proseKey('分け')).toMatch(/^[0-9a-f]{64}$/)
    expect(proseKey('分け')).not.toBe(proseKey('分け。'))
  })
})
