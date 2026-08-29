import { describe, expect, it } from 'vitest'

import { collapseLongVowels, looksLikeRomaji, romajiToHiragana, toKatakana } from './index.js'

describe('romajiToHiragana', () => {
  it('converts the case that started this', () => {
    // "yama" previously matched only glosses containing "Yamato".
    expect(romajiToHiragana('yama')).toBe('やま')
  })

  it('treats multi-letter morae as one unit', () => {
    // Longest-match: "shi" is one mora, not "s" + "hi".
    expect(romajiToHiragana('shinbun')).toBe('しんぶん')
    expect(romajiToHiragana('chikatetsu')).toBe('ちかてつ')
  })

  it('accepts both Hepburn and kunrei', () => {
    // Learners type whichever they were taught.
    expect(romajiToHiragana('shi')).toBe(romajiToHiragana('si'))
    expect(romajiToHiragana('tsu')).toBe(romajiToHiragana('tu'))
    expect(romajiToHiragana('fu')).toBe(romajiToHiragana('hu'))
  })

  it('handles yōon as a single mora', () => {
    expect(romajiToHiragana('tokyo')).toBe('ときょ')
    expect(romajiToHiragana('kyou')).toBe('きょう')
  })

  it('turns a doubled consonant into the sokuon', () => {
    expect(romajiToHiragana('kitte')).toBe('きって')
    expect(romajiToHiragana('gakkou')).toBe('がっこう')
  })

  it('reads n before a consonant as ん, not the start of na', () => {
    expect(romajiToHiragana('nihon')).toBe('にほん')
    expect(romajiToHiragana('sensei')).toBe('せんせい')
    // But n before a vowel IS na/ni/nu/ne/no.
    expect(romajiToHiragana('nani')).toBe('なに')
  })

  it('keeps characters it cannot convert rather than dropping them', () => {
    // A partial match should still search for something.
    expect(romajiToHiragana('ya?')).toContain('や')
  })

  it('is case insensitive', () => {
    expect(romajiToHiragana('YAMA')).toBe('やま')
  })
})

describe('looksLikeRomaji', () => {
  it('accepts plain ASCII', () => {
    expect(looksLikeRomaji('yama')).toBe(true)
    expect(looksLikeRomaji('Tokyo')).toBe(true)
  })

  it('rejects text that is already Japanese', () => {
    // Converting 山 would be nonsense, and the plain search already handles it.
    expect(looksLikeRomaji('山')).toBe(false)
    expect(looksLikeRomaji('やま')).toBe(false)
  })

  it('rejects mixed or spaced input', () => {
    expect(looksLikeRomaji('to eat')).toBe(false)
  })
})

describe('toKatakana', () => {
  it('converts hiragana', () => {
    expect(toKatakana('ぐらす')).toBe('グラス')
    expect(toKatakana('てれび')).toBe('テレビ')
  })

  it('passes the long-vowel mark through', () => {
    // ー is shared by both scripts. Shifting it would corrupt コーヒー.
    expect(toKatakana(romajiToHiragana('ko-hi-'))).toBe('コーヒー')
  })

  it('leaves kanji and latin alone', () => {
    expect(toKatakana('山abc')).toBe('山abc')
  })

  it('round-trips a loan word from romaji', () => {
    // The case that was broken: gurasu had to reach グラス.
    expect(toKatakana(romajiToHiragana('gurasu'))).toBe('グラス')
    expect(toKatakana(romajiToHiragana('pan'))).toBe('パン')
  })
})

describe('collapseLongVowels', () => {
  it('turns a doubled vowel into the long mark', () => {
    // People type "koohii"; the word is コーヒー. Without this it becomes
    // コオヒイ and matches nothing.
    expect(collapseLongVowels(toKatakana(romajiToHiragana('koohii')))).toBe('コーヒー')
    expect(collapseLongVowels(toKatakana(romajiToHiragana('raamen')))).toBe('ラーメン')
  })

  it('handles the ou and ei spellings', () => {
    expect(collapseLongVowels(toKatakana(romajiToHiragana('nooto')))).toBe('ノート')
    expect(collapseLongVowels(toKatakana(romajiToHiragana('keeki')))).toBe('ケーキ')
  })

  it('leaves a short word untouched', () => {
    expect(collapseLongVowels(toKatakana(romajiToHiragana('pan')))).toBe('パン')
    expect(collapseLongVowels(toKatakana(romajiToHiragana('gurasu')))).toBe('グラス')
  })
})
