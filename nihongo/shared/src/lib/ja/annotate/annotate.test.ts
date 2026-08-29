import { describe, expect, it } from 'vitest'

import { annotate, buildLexicon } from './index.js'

const LEXICON = buildLexicon([
  ['食べる', 'たべる'],
  ['書く', 'かく'],
  ['行く', 'いく'],
  ['連用形', 'れんようけい'],
  ['安い', 'やすい'],
  ['山', 'やま']
])

/** The rendered shape, for readable assertions. */
function render(text: string): string {
  return annotate(text, LEXICON)
    .map(s => (s.r ? `${s.t}[${s.r}]` : s.t))
    .join('')
}

describe('annotate', () => {
  it('leaves text with no Japanese alone', () => {
    expect(render('The te-form joins actions.')).toBe('The te-form joins actions.')
  })

  it('reads a word the dictionary lists', () => {
    expect(render('食べる')).toBe('食[た]べる')
  })

  it('keeps okurigana outside the ruby', () => {
    // 食べる is 食[た] + べる, not 食[たべる].
    expect(render('安い')).toBe('安[やす]い')
  })

  it('reads an inflected form the dictionary does not list', () => {
    // 食べて is not an entry; 食 is known from 食べる.
    expect(render('食べて')).toBe('食[た]べて')
    expect(render('行った')).toBe('行[い]った')
  })

  it('handles a mixed English and Japanese sentence', () => {
    expect(render('Formation: 書く → 書いて.')).toBe('Formation: 書[か]く → 書[か]いて.')
  })

  it('prefers the longer word, and rubies an all-kanji compound whole', () => {
    // 連用形 must win over any shorter match. The reading spans the whole run
    // rather than splitting per character: nothing in the data says which of
    // れん / よう / けい belongs to which kanji, and a whole-run ruby is right
    // for a compound anyway.
    expect(render('連用形')).toBe('連用形[れんようけい]')
  })

  it('leaves an unattested kanji bare rather than guessing', () => {
    // 鬱 appears in no entry, so there is no evidence for any reading.
    expect(render('鬱')).toBe('鬱')
  })

  it('merges adjacent plain text into one segment', () => {
    const segments = annotate('abc def', LEXICON)
    expect(segments).toHaveLength(1)
  })

  it('derives per-kanji readings from the entries it was given', () => {
    expect(LEXICON.kanji.get('食')).toBe('た')
    expect(LEXICON.kanji.get('行')).toBe('い')
  })
})

describe('annotate script boundaries', () => {
  const lex = buildLexicon([['食べる', 'たべる']])

  it('does not merge Japanese into a run of English', () => {
    // One segment spanning both would romanise as a single string, putting
    // ruby over the English as well as the kana.
    const segments = annotate('the base for ている, and more', lex)
    expect(segments.map(s => s.t)).toEqual(['the base for ', 'ている', ', and more'])
  })

  it('keeps kana in a segment of their own even with no reading', () => {
    const segments = annotate('abc てください', lex)
    expect(segments).toHaveLength(2)
    expect(segments[1]!.t).toBe('てください')
    expect(segments[1]!.r).toBeUndefined()
  })
})

describe('annotate inflection fallback', () => {
  // 食 reads く in 食う and た in 食べる. 食う is the shorter, commoner entry,
  // so a bare frequency count picks く — and 食べて then reads くべて.
  const lex = buildLexicon([
    ['食う', 'くう'],
    ['食い物', 'くいもの'],
    ['食べる', 'たべる']
  ])

  it('prefers the reading from the word sharing the most text', () => {
    const segments = annotate('食べて', lex)
    expect(segments[0]).toEqual({ t: '食', r: 'た' })
  })

  it('still falls back to the commonest reading with nothing better', () => {
    // 食 alone shares no okurigana with anything, so the tally decides.
    expect(annotate('食', lex)[0]!.r).toBe('く')
  })
})
