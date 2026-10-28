import { describe, expect, it } from 'vitest'

import { distinguishingStart, gradeWithTwins, typedTwin } from './twins.js'

describe('distinguishingStart', () => {
  it('needs only the first sound when that tells the words apart', () => {
    expect(distinguishingStart('じどうしゃ', ['くるま'])).toBe('じ')
    expect(distinguishingStart('くるま', ['じどうしゃ'])).toBe('く')
  })

  it('takes more sounds when the first is shared', () => {
    expect(distinguishingStart('しつもん', ['しごと', 'もんだい'])).toBe('しつ')
  })

  it('keeps a small kana with the sound before it', () => {
    expect(distinguishingStart('きょう', ['きのう'])).toBe('きょ')
  })

  it('gives up when one reading is the start of the other', () => {
    expect(distinguishingStart('はし', ['はしら', 'はし'])).toBeNull()
  })
})

describe('typedTwin', () => {
  const twins = [{ form: '車', reading: 'くるま' }]

  it('recognises the twin typed in romaji, kana or kanji', () => {
    expect(typedTwin('normalised-jp', 'kuruma', twins)).toEqual(twins[0])
    expect(typedTwin('normalised-jp', 'くるま', twins)).toEqual(twins[0])
    expect(typedTwin('normalised-jp', '車', twins)).toEqual(twins[0])
  })

  it('is null for anything else', () => {
    expect(typedTwin('normalised-jp', 'jidousha', twins)).toBeNull()
    expect(typedTwin('normalised-jp', '', twins)).toBeNull()
  })
})

describe('gradeWithTwins', () => {
  const answer = { primary: '自動車', accepted: ['じどうしゃ'] }
  const twins = [{ form: '車', reading: 'くるま' }]

  it('counts a twin as right, and says which twin it was', () => {
    expect(gradeWithTwins('normalised-jp', 'kuruma', answer, twins)).toEqual({ correct: true, expected: '自動車', twin: twins[0] })
    expect(gradeWithTwins('normalised-jp', '車', answer, twins)).toEqual({ correct: true, expected: '自動車', twin: twins[0] })
  })

  it('counts the card\'s own word as right, with no twin', () => {
    expect(gradeWithTwins('normalised-jp', 'jidousha', answer, twins)).toEqual({ correct: true, expected: '自動車', twin: null })
  })

  it('marks anything else wrong', () => {
    expect(gradeWithTwins('normalised-jp', 'densha', answer, twins)).toEqual({ correct: false, expected: '自動車', twin: null })
    expect(gradeWithTwins('normalised-jp', 'kuruma', answer, [])).toEqual({ correct: false, expected: '自動車', twin: null })
  })
})
