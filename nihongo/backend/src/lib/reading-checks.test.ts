import { describe, expect, it } from 'vitest'

import type { AuthoredReading } from '@/pipeline/data/readings/types.js'

import { kanjiAboveLevel, lineFurigana, recycledText, unspacedParticles, wellFormed } from './reading-checks.js'

const RANKS = new Map<string, number | null>([
  ['日', 1],
  ['本', 1],
  ['語', 1],
  ['話', 1],
  ['夢', 3],
  ['挑', 4],
  ['麒', null]
])

function speech(code: string, lines: string[], level: AuthoredReading['level'] = 'N5'): AuthoredReading {
  return {
    code,
    level,
    title: 'ゆめ',
    titleEn: 'Dream',
    stanzas: [lines.map(t => ({ t, r: 'かな', e: 'English' }))]
  }
}

describe('kanjiAboveLevel', () => {
  it('accepts a line using only kanji at the speech level', () => {
    expect(kanjiAboveLevel('日本語を話します。', 'N5', RANKS)).toEqual([])
  })

  it('reports each kanji above the level once', () => {
    expect(kanjiAboveLevel('夢は夢です。日本の夢。', 'N5', RANKS)).toEqual(['夢'])
  })

  it('allows a higher kanji once the speech reaches its level', () => {
    expect(kanjiAboveLevel('夢があります。', 'N3', RANKS)).toEqual([])
    expect(kanjiAboveLevel('挑みます。', 'N3', RANKS)).toEqual(['挑'])
  })

  it('refuses a kanji outside the JLPT lists below N1 and allows it at N1', () => {
    expect(kanjiAboveLevel('麒', 'N2', RANKS)).toEqual(['麒'])
    expect(kanjiAboveLevel('麒', 'N1', RANKS)).toEqual([])
  })

  it('treats a kanji missing from the table as unknown, not as easy', () => {
    expect(kanjiAboveLevel('鬱', 'N4', RANKS)).toEqual(['鬱'])
  })

  it('ignores the iteration mark', () => {
    expect(kanjiAboveLevel('日々', 'N5', RANKS)).toEqual([])
  })
})

describe('recycledText', () => {
  it('reports a line copied into a second speech', () => {
    const { lines } = recycledText([
      speech('a', ['わたしの ゆめは かんたんです。', 'まいにち れんしゅうします。']),
      speech('b', ['わたしの ゆめは かんたんです。', 'あしたも がんばります。'])
    ])
    expect(lines).toEqual([{ text: 'わたしのゆめはかんたんです。', codes: ['a', 'b'] }])
  })

  it('lets allowlisted stock lines repeat', () => {
    const { lines, pairs } = recycledText([
      speech('a', ['みなさん、こんにちは。', 'いぬが すきです。']),
      speech('b', ['みなさん、こんにちは。', 'ねこが すきです。'])
    ])
    expect(lines).toEqual([])
    expect(pairs).toEqual([])
  })

  it('flags two speeches sharing more than a fifth of their lines', () => {
    const { pairs } = recycledText([
      speech('a', ['一。', '二。', '三。', '四。']),
      speech('b', ['一。', '二。', '五。', '六。'])
    ])
    expect(pairs).toEqual([{ a: 'a', b: 'b', ratio: 0.5 }])
  })

  it('does not flag a pair at or under the threshold', () => {
    const { pairs } = recycledText([
      speech('a', ['一。', '二。', '三。', '四。', '五。']),
      speech('b', ['一。', '六。', '七。', '八。', '九。'])
    ])
    expect(pairs).toEqual([])
  })
})

describe('wellFormed', () => {
  it('passes a complete speech', () => {
    expect(wellFormed([speech('my-dream', ['ゆめです。'])])).toEqual([])
  })

  it('reports duplicate codes, bad codes and empty fields', () => {
    const broken = speech('My_Dream', ['ゆめです。'])
    broken.stanzas[0]![0]!.e = ' '
    expect(wellFormed([broken, speech('My_Dream', ['ほかです。'])])).toEqual([
      'My_Dream: code must be kebab-case',
      'My_Dream 0.0: empty English',
      'My_Dream: duplicate code',
      'My_Dream: code must be kebab-case'
    ])
  })

  it('refuses kanji in the spoken reading', () => {
    const s = speech('a', ['日本'])
    s.stanzas[0]![0]!.r = '日ほん'
    expect(wellFormed([s])).toEqual(['a 0.0: reading contains kanji — "日ほん"'])
  })
})

describe('lineFurigana', () => {
  it('places ruby over each kanji token from its own reading', () => {
    const result = lineFurigana([
      { t: '日本語', r: 'にほんご ' },
      { t: 'を', r: 'お ' },
      { t: '話します', r: 'はなします' },
      { t: '。' }
    ])
    expect(result).toEqual({
      segments: [
        { t: '日本語', r: 'にほんご' },
        { t: 'を' },
        { t: '話', r: 'はな' },
        { t: 'します' },
        { t: '。' }
      ],
      problems: []
    })
  })

  it('reports a kanji token with no reading at all', () => {
    expect(lineFurigana([{ t: '夢' }]).problems).toEqual(['no reading for "夢"'])
  })

  it('reports a reading that does not fit the surface', () => {
    expect(lineFurigana([{ t: '話します', r: 'たべます' }]).problems)
      .toEqual(['"話します" does not fit the reading "たべます"'])
  })

  it('accepts an empty reading on the tail of a split kanji run', () => {
    expect(lineFurigana([{ t: '千', r: 'せんにひゃく' }, { t: '二百', r: '' }])).toEqual({
      segments: [{ t: '千', r: 'せんにひゃく' }, { t: '二百' }],
      problems: []
    })
  })
})

describe('unspacedParticles', () => {
  it('reports a particle run into the word before it', () => {
    expect(unspacedParticles([
      { t: 'ホテル', r: 'ホテル', w: { form: 'ホテル', reading: 'ほてる', meanings: ['hotel'], pos: 'noun' } },
      { t: 'の', r: 'の' },
      { t: '予約', r: ' よやく' }
    ])).toEqual(['"ホテルの": put a space before 「の」 in the reading'])
  })

  it('accepts a particle the author spaced off', () => {
    expect(unspacedParticles([{ t: 'ホテル', r: 'ホテル' }, { t: 'の', r: ' の' }])).toEqual([])
  })

  it('leaves a conjunction that merely ends in particle kana', () => {
    expect(unspacedParticles([{ t: 'それ', r: ' それ' }, { t: 'で', r: 'で' }, { t: '、', r: '、' }])).toEqual([])
  })

  it('reports a particle run into a kanji word', () => {
    expect(unspacedParticles([
      { t: '本', r: 'ほん', w: { form: '本', reading: 'ほん', meanings: ['book'], pos: 'noun' } },
      { t: 'を', r: 'お' }
    ])).toEqual(['"本を": put a space before 「を」 in the reading'])
  })

  it('ignores particle-shaped kana in the middle of a word the dictionary cut', () => {
    expect(unspacedParticles([
      { t: '分', r: 'わ', w: { form: '分', reading: 'ふん', meanings: ['minute'], pos: 'noun' } },
      { t: 'から', r: 'から' },
      { t: 'なくて', r: 'なくて' }
    ])).toEqual([])
  })

  it('ignores kana after a kanji token the dictionary does not know', () => {
    expect(unspacedParticles([{ t: '鬱', r: 'うつ' }, { t: 'に', r: 'に' }])).toEqual([])
  })

  it('does not mistake the middle of a kana word for a particle', () => {
    expect(unspacedParticles([{ t: 'やっ', r: 'やっ' }, { t: 'と', r: 'と' }])).toEqual([])
  })
})
