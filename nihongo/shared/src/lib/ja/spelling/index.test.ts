import { describe, expect, it } from 'vitest'

import { gradeAnswer } from '../../grading/index.js'
import { readingFits, spellingsOf, widenOptions } from './index.js'

const 友達 = [{ form: '友達', reading: 'ともだち' }, { form: '友だち', reading: 'ともだち' }]
const 子供 = [{ form: '子供', reading: 'こども' }, { form: '子ども', reading: 'こども' }]
const 来る = [{ form: '来る', reading: 'くる' }, { form: '來る', reading: 'くる' }]

describe('spellingsOf', () => {
  it('gives a noun in its dictionary spelling, its mixed spelling and kana', () => {
    expect(spellingsOf('ともだち', 友達).sort()).toEqual(['ともだち', '友だち', '友達'].sort())
    expect(spellingsOf('こども', 子供).sort()).toEqual(['こども', '子ども', '子供'].sort())
  })

  it('keeps an inflected ending', () => {
    expect(spellingsOf('みて', [{ form: '見る', reading: 'みる' }])).toEqual(['みて', '見て'])
    expect(spellingsOf('たかかった', [{ form: '高い', reading: 'たかい' }])).toEqual(['たかかった', '高かった'])
    expect(spellingsOf('ください', [{ form: '下さい', reading: 'ください' }])).toEqual(['ください', '下さい'])
  })

  it('offers every kanji a keyboard would', () => {
    expect(spellingsOf('あります', [{ form: '有る', reading: 'ある' }, { form: '在る', reading: 'ある' }]))
      .toEqual(['あります', '有ります', '在ります'])
    expect(spellingsOf('きいた', [{ form: '聞く', reading: 'きく' }, { form: '聴く', reading: 'きく' }]))
      .toEqual(['きいた', '聞いた', '聴いた'])
  })

  it('does not respell an irregular stem it cannot match', () => {
    // こない does not start with く, so there is no くない and no 来ない from this.
    expect(spellingsOf('こない', 来る)).toEqual(['こない'])
  })

  it('never drops a verb ending', () => {
    expect(spellingsOf('きた', [{ form: '来る', reading: 'きたる' }])).toEqual(['きた'])
  })

  it('does not respell a longer word that only starts like a noun', () => {
    expect(spellingsOf('しゃしんか', [{ form: '写真', reading: 'しゃしん' }])).toEqual(['しゃしんか'])
  })

  it('folds katakana readings', () => {
    expect(spellingsOf('トモダチ', 友達)).toContain('友達')
  })
})

describe('readingFits', () => {
  it('accepts how the spelling is said', () => {
    expect(readingFits('見ました', 'みました')).toBe(true)
    expect(readingFits('友だち', 'ともだち')).toBe(true)
    expect(readingFits('います', 'います')).toBe(true)
  })

  it('refuses a dictionary-form reading that does not fit', () => {
    expect(readingFits('見ました', 'みる')).toBe(false)
    expect(readingFits('います', 'いる')).toBe(false)
  })
})

describe('widenOptions', () => {
  it('keeps the options it had first and adds no duplicates', () => {
    expect(widenOptions('友だち', ['友だち', 'ともだち'], ['ともだち'], 友達)).toEqual(['友だち', 'ともだち', '友達'])
  })

  it('is stable when run again, katakana included', () => {
    const jet = [{ form: 'ジェット機', reading: 'ジェットき' }]
    const once = widenOptions('ジェットき', ['ジェットき', 'ジェット機'], ['ジェットき'], jet)
    expect(once).toEqual(['ジェットき', 'ジェット機'])
    expect(widenOptions('ジェットき', once, ['ジェットき'], jet)).toEqual(once)
  })

  it('ignores a reading that is not how the word is said', () => {
    expect(widenOptions('います', ['います'], ['いる'], [{ form: '要る', reading: 'いる' }])).toEqual(['います'])
  })

  it('adds nothing when the word is linked to the wrong dictionary entry', () => {
    // 来た linked to 来 (きた, "next"): 来 would be offered for 来た.
    expect(widenOptions('来た', ['来た', 'きた'], ['きた'], [{ form: '来', reading: 'きた' }])).toEqual(['来た', 'きた'])
  })
})

describe('a dictation answer widened from the dictionary', () => {
  const tokens = [
    widenOptions('友だち', ['友だち', 'ともだち'], ['ともだち'], 友達),
    ['が'],
    widenOptions('来る', ['来る', 'くる'], ['くる'], 来る),
    ['。']
  ]
  const answer = { primary: '友だちが来る。', accepted: ['友だちが来る。', 'ともだちがくる。'], tokens }

  it('accepts the dictionary spelling of a word the sentence wrote another way', () => {
    expect(gradeAnswer('normalised-jp', '友達がくる', answer).correct).toBe(true)
    expect(gradeAnswer('normalised-jp', '友達が来る', answer).correct).toBe(true)
  })

  it('still accepts the sentence typed in romaji', () => {
    expect(gradeAnswer('normalised-jp', 'tomodachigakuru', answer).correct).toBe(true)
  })

  it('still refuses a different sentence', () => {
    expect(gradeAnswer('normalised-jp', '友達がいる', answer).correct).toBe(false)
  })
})
