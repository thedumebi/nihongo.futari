import { describe, expect, it } from 'vitest'

import { contrastOf, findMinimalPairs, shortenVowels } from './minimal-pairs.js'

describe('shortenVowels', () => {
  it('shortens doubled vowels, おう and えい, and drops ー', () => {
    expect(shortenVowels('おばあさん')).toBe('おばさん')
    expect(shortenVowels('こうこう')).toBe('ここ')
    expect(shortenVowels('せんせい')).toBe('せんせ')
    expect(shortenVowels('きょう')).toBe('きょ')
    expect(shortenVowels('びーる')).toBe('びる')
  })

  it('leaves a vowel that starts a new syllable', () => {
    expect(shortenVowels('かう')).toBe('かう')
    expect(shortenVowels('あお')).toBe('あお')
  })
})

describe('contrastOf', () => {
  it('names the one sound that differs', () => {
    expect(contrastOf('おばさん', 'おばあさん')).toBe('long-vowel')
    expect(contrastOf('きて', 'きって')).toBe('small-tsu')
    expect(contrastOf('びる', 'びいる')).toBe('long-vowel')
    expect(contrastOf('かに', 'かんに')).toBe('n')
  })

  it('is null for the same reading or for two differences at once', () => {
    expect(contrastOf('かみ', 'かみ')).toBeNull()
    expect(contrastOf('ねこ', 'いぬ')).toBeNull()
    expect(contrastOf('きて', 'きいって')).toBeNull()
  })

  it('refuses two of the same difference, and a leading っ', () => {
    expect(contrastOf('てい', 'てんいん')).toBeNull()
    expect(contrastOf('ここ', 'こうこう')).toBeNull()
    expect(contrastOf('て', 'って')).toBeNull()
  })
})

describe('findMinimalPairs', () => {
  it('pairs only words one contrast apart, once per pair of readings', () => {
    const words = [
      { id: '1', reading: 'おばさん' },
      { id: '2', reading: 'おばあさん' },
      { id: '3', reading: 'きて' },
      { id: '4', reading: 'きって' },
      { id: '5', reading: 'ねこ' },
      { id: '6', reading: 'きって' }
    ]
    const pairs = findMinimalPairs(words).map(p => [p.a.reading, p.b.reading, p.contrast])
    expect(pairs).toEqual([
      ['おばさん', 'おばあさん', 'long-vowel'],
      ['きて', 'きって', 'small-tsu']
    ])
  })
})
