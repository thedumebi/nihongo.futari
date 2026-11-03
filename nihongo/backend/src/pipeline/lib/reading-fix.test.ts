import { describe, expect, it } from 'vitest'

import { applyWordFix, bracketed, parseBracketed } from './reading-fix.js'

describe('parseBracketed', () => {
  it('puts a reading over the kanji run before it, kana outside', () => {
    expect(parseBracketed('使役[しえき]')).toEqual([{ t: '使役', r: 'しえき' }])
    expect(parseBracketed('降[ふ]って')).toEqual([{ t: '降', r: 'ふ' }, { t: 'って' }])
    expect(parseBracketed('お茶[ちゃ]')).toEqual([{ t: 'お' }, { t: '茶', r: 'ちゃ' }])
  })
})

describe('applyWordFix', () => {
  it('replaces a compound the annotator split into wrong per-character readings', () => {
    const now = [{ t: '使', r: 'つか' }, { t: '役', r: 'えき' }, { t: '形', r: 'けい' }, { t: ' (causative)' }]
    const { segments, changes } = applyWordFix(now, { span: '使役', final: '使役[しえき]' })
    expect(bracketed(segments)).toBe('使役[しえき]形[けい] (causative)')
    expect(changes).toEqual([{ word: '使役', from: [{ t: '使', r: 'つか' }, { t: '役', r: 'えき' }], to: [{ t: '使役', r: 'しえき' }] }])
  })

  it('cuts plain text around the word, and fixes every place it appears', () => {
    const now = [{ t: '雨', r: 'あめ' }, { t: 'が' }, { t: '降', r: 'お' }, { t: 'っても、また' }, { t: '降', r: 'お' }, { t: 'って' }]
    const { segments, changes } = applyWordFix(now, { span: '降って', final: '降[ふ]って' })
    expect(bracketed(segments)).toBe('雨[あめ]が降[ふ]っても、また降[ふ]って')
    expect(changes).toHaveLength(2)
    expect(segments.map(s => s.t).join('')).toBe('雨が降っても、また降って')
  })

  it('leaves an occurrence inside a longer word read as a whole', () => {
    const now = [{ t: '場合分', r: 'ばあいわ' }, { t: 'け' }]
    expect(applyWordFix(now, { span: '場合', final: '場合[ばあい]' }).changes).toEqual([])
  })

  it('is not a change where the word already reads right', () => {
    const now = [{ t: '場合', r: 'ばあい' }]
    expect(applyWordFix(now, { span: '場合', final: '場合[ばあい]' }).changes).toEqual([])
  })

  it('refuses a fix whose readings do not spell the word', () => {
    expect(() => applyWordFix([], { span: '使役', final: '使[し]' })).toThrow('does not spell')
  })

  it('refuses a fix that would leave a kanji in the word without a reading', () => {
    expect(() => applyWordFix([], { span: '着き次第', final: '着[つ]き次第' })).toThrow('without a reading')
  })
})
