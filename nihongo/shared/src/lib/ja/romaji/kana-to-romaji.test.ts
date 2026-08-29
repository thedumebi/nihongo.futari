import { describe, expect, it } from 'vitest'

import { kanaToRomaji, romajiToHiragana } from './index.js'

describe('kanaToRomaji', () => {
  it('reads plain hiragana', () => {
    expect(kanaToRomaji('やま')).toBe('yama')
    expect(kanaToRomaji('しずか')).toBe('shizuka')
  })

  it('reads katakana through the same table', () => {
    expect(kanaToRomaji('テレビ')).toBe('terebi')
  })

  it('keeps digraphs as one mora', () => {
    expect(kanaToRomaji('ちゃ')).toBe('cha')
    expect(kanaToRomaji('きょう')).toBe('kyou')
  })

  it('doubles the consonant after っ', () => {
    expect(kanaToRomaji('きって')).toBe('kitte')
    // ch is written tch, not cch — the sokuon takes t before an affricate.
    expect(kanaToRomaji('まっちゃ')).toBe('matcha')
  })

  it("writes n' where plain n would be misread", () => {
    // Without the apostrophe this reads as "kanin", a different word.
    expect(kanaToRomaji('きんいろ')).toBe("kin'iro")
    expect(kanaToRomaji('こんばん')).toBe('konban')
  })

  it('repeats the vowel a katakana long mark stands for', () => {
    expect(kanaToRomaji('コーヒー')).toBe('koohii')
  })

  it('passes through what it cannot read', () => {
    // A kanji has no reading of its own here; dropping it would silently
    // shorten the string and misalign anything positional.
    expect(kanaToRomaji('静か')).toBe('静ka')
    expect(kanaToRomaji('やま。')).toBe('yama。')
  })

  it('round-trips the spellings romajiToHiragana produces', () => {
    for (const word of ['やま', 'しずか', 'きょう', 'きって', 'テレビ'])
      expect(romajiToHiragana(kanaToRomaji(word))).toBe(word.replace(/[\u30A1-\u30F6]/gu, c => String.fromCodePoint(c.codePointAt(0)! - 0x60)))
  })
})
