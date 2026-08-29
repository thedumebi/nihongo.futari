import { describe, expect, it } from 'vitest'

import { gradeAnswer, normaliseJapanese, normaliseRomaji } from './index.js'

const ka = { primary: 'ka', accepted: ['ka'] }
const shi = { primary: 'shi', accepted: ['shi', 'si'] }

describe('fuzzy-romaji', () => {
  it('accepts the exact answer', () => {
    expect(gradeAnswer('fuzzy-romaji', 'ka', ka).correct).toBe(true)
  })

  it('ignores case and surrounding space', () => {
    expect(gradeAnswer('fuzzy-romaji', '  KA ', ka).correct).toBe(true)
  })

  it('accepts either romanisation of し', () => {
    expect(gradeAnswer('fuzzy-romaji', 'shi', shi).correct).toBe(true)
    expect(gradeAnswer('fuzzy-romaji', 'si', shi).correct).toBe(true)
  })

  it('accepts kunrei spellings the accepted list never mentions', () => {
    // Marking these wrong would test transliteration trivia, not Japanese.
    expect(gradeAnswer('fuzzy-romaji', 'tu', { primary: 'tsu', accepted: [] }).correct).toBe(true)
    expect(gradeAnswer('fuzzy-romaji', 'hu', { primary: 'fu', accepted: [] }).correct).toBe(true)
    expect(gradeAnswer('fuzzy-romaji', 'zi', { primary: 'ji', accepted: [] }).correct).toBe(true)
    expect(gradeAnswer('fuzzy-romaji', 'ti', { primary: 'chi', accepted: [] }).correct).toBe(true)
  })

  it('accepts a macron for a long vowel', () => {
    expect(gradeAnswer('fuzzy-romaji', 'ō', { primary: 'o', accepted: [] }).correct).toBe(true)
  })

  it('still rejects a genuinely wrong answer', () => {
    expect(gradeAnswer('fuzzy-romaji', 'ki', ka).correct).toBe(false)
    expect(gradeAnswer('fuzzy-romaji', '', ka).correct).toBe(false)
  })

  it('reports the canonical answer', () => {
    expect(gradeAnswer('fuzzy-romaji', 'nope', shi).expected).toBe('shi')
  })
})

describe('normalised-jp', () => {
  it('folds katakana to hiragana so either script is accepted', () => {
    expect(gradeAnswer('normalised-jp', 'カタカナ', { primary: 'かたかな', accepted: [] }).correct).toBe(true)
  })

  it('ignores spacing', () => {
    expect(gradeAnswer('normalised-jp', ' たべ る ', { primary: 'たべる', accepted: [] }).correct).toBe(true)
  })

  it('rejects a different word', () => {
    expect(gradeAnswer('normalised-jp', 'のむ', { primary: 'たべる', accepted: [] }).correct).toBe(false)
  })
})

describe('normalisers', () => {
  it('romaji folding is idempotent', () => {
    expect(normaliseRomaji(normaliseRomaji('shi'))).toBe(normaliseRomaji('shi'))
  })

  it('katakana folding leaves hiragana alone', () => {
    expect(normaliseJapanese('ひらがな')).toBe('ひらがな')
  })
})

describe('sequence grader', () => {
  const answer = { primary: '父は家にいる', accepted: ['父は家にいる', '父は家にいる。'] }

  it('accepts the correct arrangement', () => {
    expect(gradeAnswer('sequence', '父は家にいる', answer).correct).toBe(true)
  })

  it('rejects a wrong arrangement', () => {
    expect(gradeAnswer('sequence', '家は父にいる', answer).correct).toBe(false)
  })

  it('tolerates trailing punctuation and spacing', () => {
    expect(gradeAnswer('sequence', ' 父は家にいる。 ', answer).correct).toBe(true)
  })
})

describe('romaji answers on Japanese cards', () => {
  const gohan = { primary: 'ご飯', accepted: ['ごはん', 'ご飯'] }

  it('accepts the reading typed in romaji', () => {
    // The app will render the whole sentence in romaji if asked; refusing
    // romaji back is the app contradicting itself.
    expect(gradeAnswer('normalised-jp', 'gohan', gohan).correct).toBe(true)
  })

  it('still accepts the kana and the kanji', () => {
    expect(gradeAnswer('normalised-jp', 'ごはん', gohan).correct).toBe(true)
    expect(gradeAnswer('normalised-jp', 'ご飯', gohan).correct).toBe(true)
  })

  it('still rejects a wrong answer', () => {
    expect(gradeAnswer('normalised-jp', 'sushi', gohan).correct).toBe(false)
    expect(gradeAnswer('normalised-jp', 'おちゃ', gohan).correct).toBe(false)
  })

  it('does not put a kana answer through the romaji converter', () => {
    // ん + い must stay ん + い, not become に.
    const kani = { primary: 'かに', accepted: ['かに'] }
    expect(gradeAnswer('normalised-jp', 'かんい', kani).correct).toBe(false)
  })

  it('handles katakana words typed in romaji', () => {
    const terebi = { primary: 'テレビ', accepted: ['テレビ', 'てれび'] }
    expect(gradeAnswer('normalised-jp', 'terebi', terebi).correct).toBe(true)
  })

  it('accepts romaji for a word-order answer', () => {
    const line = { primary: 'これはペンです', accepted: ['これはペンです'] }
    expect(gradeAnswer('sequence', 'korehapendesu', line).correct).toBe(true)
  })
})
