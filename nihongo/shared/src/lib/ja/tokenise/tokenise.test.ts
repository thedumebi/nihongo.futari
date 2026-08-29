import { describe, expect, it } from 'vitest'

import { buildTokenIndex, tokenise } from './index.js'

/**
 * A stand-in dictionary. Small on purpose: every entry here is one the tests
 * below actually reason about, so a failure names the rule it broke.
 */
const INDEX = buildTokenIndex([
  '傘',
  '食べる',
  '行く',
  '学校',
  '学',
  '校長',
  '本',
  '持つ',
  '大きい',
  'ください',
  'すみません'
])

describe('tokenise', () => {
  it('takes the longest exact match, not the first', () => {
    // 学校 must beat 学, or every compound is eaten by its first character.
    expect(tokenise('学校', INDEX)).toEqual([{ t: '学校', key: '学校' }])
  })

  it('keeps particles as their own tokens', () => {
    // They are what a beginner asks about most; merged into a run they would
    // stop being tappable.
    expect(tokenise('傘を', INDEX)).toEqual([
      { t: '傘', key: '傘' },
      { t: 'を' }
    ])
  })

  it('resolves an inflected form to its dictionary entry', () => {
    expect(tokenise('食べて', INDEX)).toEqual([{ t: '食べて', key: '食べる' }])
    expect(tokenise('行った', INDEX)).toEqual([{ t: '行った', key: '行く' }])
  })

  it('keeps the whole inflected run in one token', () => {
    // 食べたい is one thing the reader wants to tap, not 食べ plus たい.
    expect(tokenise('食べたい', INDEX)).toEqual([{ t: '食べたい', key: '食べる' }])
  })

  it('does not claim a kanji on one character of agreement', () => {
    // 校長 shares only 校 with nothing in reach; a single shared kanji is not
    // evidence, so the character is left bare rather than mis-glossed.
    expect(tokenise('校', INDEX)).toEqual([{ t: '校' }])
  })

  it('still matches genuine one-character words', () => {
    expect(tokenise('本', INDEX)).toEqual([{ t: '本', key: '本' }])
  })

  it('groups non-Japanese runs into a single token', () => {
    const tokens = tokenise('傘、ABC。', INDEX)
    expect(tokens).toEqual([
      { t: '傘', key: '傘' },
      { t: '、ABC。' }
    ])
  })

  it('rebuilds the original line exactly', () => {
    const line = 'すみません、傘を持っていますか。'
    expect(tokenise(line, INDEX).map(t => t.t).join('')).toBe(line)
  })

  it('matches kana-only dictionary words', () => {
    expect(tokenise('ください', INDEX)).toEqual([{ t: 'ください', key: 'ください' }])
  })

  it('returns nothing for an empty line', () => {
    expect(tokenise('', INDEX)).toEqual([])
  })
})
