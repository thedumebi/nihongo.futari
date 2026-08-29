import { describe, expect, it } from 'vitest'

import { alignFurigana, alignInflected, furiganaToText, sentenceFurigana, toHiragana } from './index.js'

describe('toHiragana', () => {
  it('converts katakana and leaves everything else alone', () => {
    expect(toHiragana('コーヒー')).toBe('こーひー')
    expect(toHiragana('食べるabc')).toBe('食べるabc')
  })
})

describe('alignFurigana', () => {
  it('places ruby over the kanji only', () => {
    const { segments, confidence } = alignFurigana('食べる', 'たべる')
    expect(segments).toEqual([{ t: '食', r: 'た' }, { t: 'べる' }])
    expect(confidence).toBe(1)
  })

  it('uses interior kana as anchors', () => {
    expect(alignFurigana('食べ物', 'たべもの').segments).toEqual([
      { t: '食', r: 'た' },
      { t: 'べ' },
      { t: '物', r: 'もの' }
    ])
  })

  it('splits adjacent kanji when kana separate them', () => {
    expect(alignFurigana('読み書き', 'よみかき').segments).toEqual([
      { t: '読', r: 'よ' },
      { t: 'み' },
      { t: '書', r: 'か' },
      { t: 'き' }
    ])
  })

  it('keeps a multi-kanji run whole rather than guessing a split', () => {
    // 大人 = おとな has NO per-character split — と does not belong to 大 or to
    // 人. Rendering a guess here is the exact failure this function exists to
    // avoid, so the reading covers the run and the confidence says it is coarse.
    const { segments, confidence } = alignFurigana('大人', 'おとな')
    expect(segments).toEqual([{ t: '大人', r: 'おとな' }])
    expect(confidence).toBe(0.6)
  })

  it('handles a word that is all kanji with a clean per-run reading', () => {
    const { segments } = alignFurigana('先生', 'せんせい')
    expect(segments).toEqual([{ t: '先生', r: 'せんせい' }])
  })

  it('returns no ruby for text with no kanji', () => {
    const { segments, confidence } = alignFurigana('ください', 'ください')
    expect(segments).toEqual([{ t: 'ください' }])
    expect(confidence).toBe(1)
  })

  it('anchors through katakana in the surface', () => {
    expect(alignFurigana('コーヒー屋', 'こーひーや').segments).toEqual([
      { t: 'コーヒー' },
      { t: '屋', r: 'や' }
    ])
  })

  it('falls back to whole-token ruby when the kana anchors do not line up', () => {
    // The surface ends in べる but the reading does not, so there is no valid
    // split at all. Better one honest ruby over the whole word than a wrong one
    // over part of it.
    const { segments, confidence } = alignFurigana('食べる', 'たべた')
    expect(segments).toEqual([{ t: '食べる', r: 'たべた' }])
    expect(confidence).toBe(0)
  })

  it('gives a single all-kanji run the whole reading, flagged coarse', () => {
    // 今日 = きょう cannot be split per character either; same treatment as 大人.
    const { segments, confidence } = alignFurigana('今日', 'きょう')
    expect(segments).toEqual([{ t: '今日', r: 'きょう' }])
    expect(confidence).toBe(0.6)
  })

  it('never drops or invents surface characters', () => {
    for (const [surface, reading] of [
      ['食べる', 'たべる'],
      ['大人', 'おとな'],
      ['読み書き', 'よみかき'],
      ['お茶', 'おちゃ'],
      ['ください', 'ください'],
      ['今日', 'きょう']
    ] as const) {
      expect(furiganaToText(alignFurigana(surface, reading).segments), surface).toBe(surface)
    }
  })

  it('treats the iteration mark as a kanji', () => {
    expect(alignFurigana('人々', 'ひとびと').segments).toEqual([{ t: '人々', r: 'ひとびと' }])
  })

  it('survives empty input', () => {
    expect(alignFurigana('', '').segments).toEqual([{ t: '' }])
    expect(alignFurigana('本', '').segments).toEqual([{ t: '本' }])
  })
})

describe('alignInflected', () => {
  it('carries the lemma reading onto an inflected form', () => {
    // The trap this exists for: 会えない aligned against あう fails outright,
    // and the fallback would print 会えない[あう] — a wrong reading over text
    // the learner is trying to read.
    expect(alignInflected('会えない', '会う', 'あう').segments).toEqual([
      { t: '会', r: 'あ' },
      { t: 'えない' }
    ])
  })

  it('handles a past tense tail', () => {
    expect(alignInflected('思った', '思う', 'おもう').segments).toEqual([
      { t: '思', r: 'おも' },
      { t: 'った' }
    ])
  })

  it('is identical to plain alignment when the form is the lemma', () => {
    expect(alignInflected('食べる', '食べる', 'たべる')).toEqual(alignFurigana('食べる', 'たべる'))
  })

  it('adds no ruby to a kana-only surface', () => {
    // 取れる written as とれない — the kanji is gone, so there is nothing to mark.
    const { segments, confidence } = alignInflected('とれない', '取れる', 'とれる')
    expect(segments).toEqual([{ t: 'とれない' }])
    expect(confidence).toBe(1)
  })

  it('refuses to guess when the kanji themselves differ', () => {
    const { segments, confidence } = alignInflected('食う', '飲む', 'のむ')
    expect(segments).toEqual([{ t: '食う' }])
    expect(confidence).toBe(0)
  })

  it('never drops or invents surface characters', () => {
    for (const [surface, lemma, reading] of [
      ['会えない', '会う', 'あう'],
      ['思った', '思う', 'おもう'],
      ['食べます', '食べる', 'たべる'],
      ['とれない', '取れる', 'とれる']
    ] as const) {
      expect(furiganaToText(alignInflected(surface, lemma, reading).segments), surface).toBe(surface)
    }
  })
})

describe('sentenceFurigana', () => {
  it('keeps punctuation the tokens do not cover', () => {
    // 。 has no reading and so has no token. Concatenating token furigana would
    // drop it from every sentence in the app.
    const segments = sentenceFurigana('父は家にいる。', [
      { charStart: 0, charEnd: 1, furigana: [{ t: '父', r: 'ちち' }] },
      { charStart: 1, charEnd: 2, furigana: [{ t: 'は' }] },
      { charStart: 2, charEnd: 3, furigana: [{ t: '家', r: 'いえ' }] },
      { charStart: 3, charEnd: 6, furigana: [{ t: 'にいる' }] }
    ])
    expect(furiganaToText(segments)).toBe('父は家にいる。')
    expect(segments.at(-1)).toEqual({ t: '。' })
  })

  it('reconstructs the text exactly when tokens cover everything', () => {
    const segments = sentenceFurigana('本を読む', [
      { charStart: 0, charEnd: 1, furigana: [{ t: '本', r: 'ほん' }] },
      { charStart: 1, charEnd: 2, furigana: [{ t: 'を' }] },
      { charStart: 2, charEnd: 4, furigana: [{ t: '読', r: 'よ' }, { t: 'む' }] }
    ])
    expect(furiganaToText(segments)).toBe('本を読む')
  })

  it('emits the raw text when there are no tokens at all', () => {
    expect(sentenceFurigana('こんにちは', [])).toEqual([{ t: 'こんにちは' }])
  })

  it('skips overlapping tokens rather than duplicating characters', () => {
    const segments = sentenceFurigana('本本', [
      { charStart: 0, charEnd: 2, furigana: [{ t: '本本', r: 'ほんほん' }] },
      { charStart: 1, charEnd: 2, furigana: [{ t: '本', r: 'ほん' }] }
    ])
    expect(furiganaToText(segments)).toBe('本本')
  })

  it('sorts tokens by position rather than trusting input order', () => {
    const segments = sentenceFurigana('本を', [
      { charStart: 1, charEnd: 2, furigana: [{ t: 'を' }] },
      { charStart: 0, charEnd: 1, furigana: [{ t: '本', r: 'ほん' }] }
    ])
    expect(furiganaToText(segments)).toBe('本を')
  })
})
