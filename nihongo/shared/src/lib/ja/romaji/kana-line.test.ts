import { describe, expect, it } from 'vitest'

import { kanaLineToRomaji } from './index.js'

describe('kanaLineToRomaji', () => {
  it('reads a plain line', () => {
    expect(kanaLineToRomaji('いらっしゃいませ')).toBe('irasshaimase')
  })

  it('turns Japanese punctuation into English, without a space before it', () => {
    expect(kanaLineToRomaji('はい、どうぞ。')).toBe('hai, douzo.')
  })

  it('transliterates particles as the author wrote them', () => {
    // The author stores を as お and は as わ, because nothing downstream can
    // tell a particle from the same kana inside a word.
    expect(kanaLineToRomaji('メニューおください。')).toBe('menyuuokudasai.')
    expect(kanaLineToRomaji('おべんとうわひとつですか。')).toBe('obentouwahitotsudesuka.')
  })

  it('keeps word breaks the author put in, and invents none', () => {
    // Splitting kana into words needs a tokeniser. A space in the input is
    // carried through; without one the line is unbroken rather than guessed.
    expect(kanaLineToRomaji('すみません、メニュー お ください。')).toBe('sumimasen, menyuu o kudasai.')
    expect(kanaLineToRomaji('すみません、メニューおください。')).toBe('sumimasen, menyuuokudasai.')
  })

  it('does not invent a reading for kanji left in the line', () => {
    // A line that still contains kanji is an authoring mistake, not something
    // to paper over — the kanji passes through so it is visible.
    expect(kanaLineToRomaji('お水')).toBe('o水')
  })

  it('handles an empty line', () => {
    expect(kanaLineToRomaji('')).toBe('')
  })
})
