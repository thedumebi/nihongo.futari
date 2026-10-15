import { describe, expect, it } from 'vitest'

import { exampleWord, kanjiParts, orderMembers, seriesReading } from './index.js'

describe('kanjiParts', () => {
  it('splits a kanji into its parts from its IDS', () => {
    expect(kanjiParts('⿰亻共')).toEqual(['亻', '共'])
    expect(kanjiParts('⿱木且')).toEqual(['木', '且'])
  })

  it('gives nothing for an unknown or malformed description', () => {
    expect(kanjiParts(null)).toEqual([])
    expect(kanjiParts('共')).toEqual([])
  })
})

describe('exampleWord', () => {
  const words = [
    { form: '子供', reading: 'こども', meaning: 'child', frequencyRank: 250 },
    { form: '提供', reading: 'ていきょう', meaning: 'offer', frequencyRank: 1250 },
    { form: '供給', reading: 'きょうきゅう', meaning: 'supply', frequencyRank: 1250 },
    { form: '供', reading: 'とも', meaning: 'attendant', frequencyRank: 9250 }
  ]

  it('prefers the commonest word that uses the series reading', () => {
    expect(exampleWord(words, '供', 'キョウ')?.form).toBe('提供')
  })

  it('falls back to the commonest word when none uses the reading', () => {
    expect(exampleWord(words, '供', 'ソ')?.form).toBe('子供')
  })

  it('offers nothing for a kanji that follows the series when no word uses the reading', () => {
    expect(exampleWord(words, '供', 'ソ', true)).toBeNull()
  })

  it('never offers the kanji on its own, or a word without it', () => {
    expect(exampleWord([{ form: '供', reading: 'とも', meaning: null, frequencyRank: 1 }], '供', 'キョウ')).toBeNull()
    expect(exampleWord(words, '恭', 'キョウ')).toBeNull()
  })
})

describe('orderMembers', () => {
  const members = [
    { character: '洪', followsSeries: false },
    { character: '恭', followsSeries: true },
    { character: '供', followsSeries: true },
    { character: '異', followsSeries: false }
  ]

  it('puts followers before exceptions, and known kanji first within each', () => {
    expect(orderMembers(members, new Set(['供', '異'])).map(m => m.character)).toEqual(['供', '恭', '異', '洪'])
  })
})

describe('seriesReading', () => {
  it('writes the reading in the reader\'s script', () => {
    expect(seriesReading('キョウ', 'kana')).toEqual({ main: 'きょう', sub: '' })
    expect(seriesReading('キョウ', 'romaji')).toEqual({ main: 'kyou', sub: '' })
    expect(seriesReading('キョウ', 'always')).toEqual({ main: 'キョウ', sub: 'きょう' })
  })
})
