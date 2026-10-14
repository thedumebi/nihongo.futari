import { describe, expect, it } from 'vitest'

import { clozeFurigana, correctedAnswers, withLineReading } from './index.js'

describe('clozeFurigana', () => {
  const tokens = [
    { charStart: 0, charEnd: 2, furigana: [{ t: '五時', r: 'ごじ' }] },
    { charStart: 2, charEnd: 3, furigana: [{ t: 'に' }] },
    { charStart: 3, charEnd: 5, furigana: [{ t: '来', r: 'き' }, { t: 'た' }] }
  ]

  it('splits the sentence\'s furigana at the blank and reads the blank', () => {
    expect(clozeFurigana('五時に来た', '五時に', '', tokens)).toEqual({
      beforeFurigana: [{ t: '五時', r: 'ごじ' }, { t: 'に' }],
      afterFurigana: [],
      blankReading: 'きた'
    })
  })

  it('reads a blank in the middle, with context on both sides', () => {
    expect(clozeFurigana('五時に来た', '', 'に来た', tokens)).toEqual({
      beforeFurigana: [],
      afterFurigana: [{ t: 'に' }, { t: '来', r: 'き' }, { t: 'た' }],
      blankReading: 'ごじ'
    })
  })
})

describe('correctedAnswers', () => {
  it('replaces a wrong reading with the right one', () => {
    expect(correctedAnswers(['来た', '来る', 'くる', 'くた'], '来た', 'くた', 'きた')).toEqual(['来た', '来る', 'くる', 'きた'])
  })

  it('keeps the written answer when the old "reading" was the answer itself', () => {
    expect(correctedAnswers(['貼り', '張る', 'はる'], '貼り', '貼り', 'はり')).toEqual(['貼り', '張る', 'はる', 'はり'])
  })

  it('changes nothing when the blank reads the same', () => {
    expect(correctedAnswers(['猫', 'ねこ'], '猫', 'ねこ', 'ねこ')).toEqual(['猫', 'ねこ'])
  })
})

describe('withLineReading', () => {
  const snapshot = {
    kind: 'dialogue',
    turns: [
      { text: '使えます。', reading: 'つかえます よ。', replies: [] },
      { text: '使えますよ。', reading: 'つかえます よ。', replies: [{ text: '使えます。', reading: 'つかえます よ。' }] }
    ]
  }

  it('replaces the reading only on lines with the same text and the old reading', () => {
    expect(withLineReading(snapshot, '使えます。', 'つかえます よ。', 'つかえます。')).toEqual({
      kind: 'dialogue',
      turns: [
        { text: '使えます。', reading: 'つかえます。', replies: [] },
        { text: '使えますよ。', reading: 'つかえます よ。', replies: [{ text: '使えます。', reading: 'つかえます。' }] }
      ]
    })
  })

  it('returns null when no line matches', () => {
    expect(withLineReading(snapshot, '使えます。', 'ちがう', 'つかえます。')).toBeNull()
  })
})
