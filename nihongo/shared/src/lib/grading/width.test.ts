import { describe, expect, it } from 'vitest'

import { gradeAnswer } from './index.js'

/**
 * Width folding. The corpus writes numbers full-width and keyboards do not,
 * and the two are visually identical — so a wrong verdict here looks like the
 * app is simply broken.
 */
describe('grading across character widths', () => {
  const answer = { primary: '１つ', accepted: ['１つ', 'ひとつ'] }

  it('accepts a half-width digit for a full-width one', () => {
    expect(gradeAnswer('normalised-jp', '1つ', answer).correct).toBe(true)
  })

  it('still accepts the exact form', () => {
    expect(gradeAnswer('normalised-jp', '１つ', answer).correct).toBe(true)
  })

  it('accepts the reading in romaji', () => {
    expect(gradeAnswer('normalised-jp', 'hitotsu', answer).correct).toBe(true)
  })

  it('accepts half-width katakana', () => {
    const kata = { primary: 'ケーキ', accepted: ['ケーキ'] }
    expect(gradeAnswer('normalised-jp', 'ｹｰｷ', kata).correct).toBe(true)
  })

  it('does not make everything correct', () => {
    expect(gradeAnswer('normalised-jp', '2つ', answer).correct).toBe(false)
  })
})
