import type { WordGloss } from '@nihongo/shared/types'

import { describe, expect, it } from 'vitest'

import { glueAuthorWords, regroupKana } from './author-segments.js'

const gloss = (form: string, meaning: string): WordGloss => ({ form, reading: form, meanings: [meaning], pos: 'noun' })

const WORDS: Record<string, WordGloss> = {
  わたし: gloss('私', 'I'),
  くだもの: gloss('果物', 'fruit'),
  と: gloss('と', 'and'),
  ねます: gloss('寝る', 'to sleep')
}
const lookup = (kana: string) => WORDS[kana]

/** Words and readings only; the aligned furigana is checked on its own below. */
const regroup = (...args: Parameters<typeof regroupKana>) => regroupKana(...args).map(({ f: _f, ...token }) => token)

describe('regroupKana', () => {
  it('gives a re-cut kana word furigana that is just itself', () => {
    const [first] = regroupKana([
      { t: 'わた', r: 'わた', w: gloss('綿', 'cotton') },
      { t: 'し', r: 'し', w: gloss('し', 'and') }
    ], lookup)
    expect(first).toEqual({ t: 'わたし', r: 'わたし', f: [{ t: 'わたし' }], w: WORDS.わたし })
  })

  it('rejoins a kana word the dictionary cut in two', () => {
    expect(regroup([
      { t: 'わた', r: 'わた', w: gloss('綿', 'cotton') },
      { t: 'し', r: 'し', w: gloss('し', 'and') },
      { t: 'の', r: ' の' }
    ], lookup)).toEqual([
      { t: 'わたし', r: 'わたし', w: WORDS.わたし },
      { t: 'の', r: ' の' }
    ])
  })

  it('re-cuts a token that runs across a word break', () => {
    expect(regroup([
      { t: 'パン', r: 'パン', w: gloss('パン', 'bread') },
      { t: 'とく', r: ' と く', w: gloss('とく', 'in readiness') },
      { t: 'だもの', r: 'だもの' },
      { t: 'を', r: ' お' }
    ], lookup)).toEqual([
      { t: 'パン', r: 'パン', w: gloss('パン', 'bread') },
      { t: 'と', r: ' と', w: WORDS.と },
      { t: 'くだもの', r: ' くだもの', w: WORDS.くだもの },
      { t: 'を', r: ' お' }
    ])
  })

  it('rejoins a kana verb after a kanji token', () => {
    expect(regroup([
      { t: '時', r: 'じ', w: gloss('時', 'o\'clock') },
      { t: 'に', r: ' に' },
      { t: 'ね', r: ' ね' },
      { t: 'ます', r: 'ます' }
    ], lookup)).toEqual([
      { t: '時', r: 'じ', w: gloss('時', 'o\'clock') },
      { t: 'に', r: ' に' },
      { t: 'ねます', r: ' ねます', w: WORDS.ねます }
    ])
  })

  it('keeps a run whose other words were already cut correctly', () => {
    expect(regroup([
      { t: 'こ', r: 'こ' },
      { t: 'ない', r: 'ない', w: gloss('ない', 'not') },
      { t: 'んです', r: ' ん です', w: { ...gloss('んです', 'explaining'), pos: 'grammar' } }
    ], kana => kana === 'こない' ? gloss('来る', 'to come') : undefined)).toEqual([
      { t: 'こない', r: 'こない', w: gloss('来る', 'to come') },
      { t: 'んです', r: ' ん です', w: { ...gloss('んです', 'explaining'), pos: 'grammar' } }
    ])
  })

  it('makes a word the dictionary lacks one plain token rather than wrong glosses', () => {
    expect(regroup([
      { t: 'それ', r: 'それ', w: gloss('それ', 'that') },
      { t: 'から', r: 'から', w: gloss('から', 'from') },
      { t: '、', r: '、' }
    ], lookup)).toEqual([
      { t: 'それから', r: 'それから' },
      { t: '、', r: '、' }
    ])
  })

  it('re-cuts a multi-word cluster on the author\'s breaks, leaving unknown words plain', () => {
    expect(regroup([{ t: 'とく', r: 'と く' }, { t: 'ふわ', r: 'ふわ' }], lookup))
      .toEqual([{ t: 'と', r: 'と', w: WORDS.と }, { t: 'くふわ', r: ' くふわ' }])
  })

  it('re-cuts two particles the dictionary glued into a word across a break', () => {
    const lookupParticles = (kana: string) => ({ で: gloss('で', 'at'), は: gloss('は', 'topic') } as Record<string, ReturnType<typeof gloss>>)[kana]
    expect(regroup([
      { t: 'では', r: ' で わ', w: gloss('では', 'then') },
      { t: 'ありません', r: ' ありません', w: gloss('ありません', 'is not') }
    ], lookupParticles)).toEqual([
      { t: 'で', r: ' で', w: gloss('で', 'at') },
      { t: 'は', r: ' わ', w: gloss('は', 'topic') },
      { t: 'ありません', r: ' ありません', w: gloss('ありません', 'is not') }
    ])
  })

  it('leaves a run alone when no token starts mid-word', () => {
    const tokens = [
      { t: 'ありがとうございました', r: 'ありがとう ございました', w: gloss('ありがとうございました', 'thank you') },
      { t: 'わたし', r: ' わたし', w: WORDS.わたし }
    ]
    expect(regroupKana(tokens, lookup)).toEqual(tokens)
  })

  it('leaves tokens without readings alone', () => {
    const tokens = [{ t: 'わた', w: gloss('綿', 'cotton') }, { t: 'し' }]
    expect(regroupKana(tokens, lookup)).toEqual(tokens)
  })
})

describe('glueAuthorWords', () => {
  const none = () => undefined

  it('glues a compound the dictionary split, listing its parts', () => {
    expect(glueAuthorWords([
      { t: 'の', r: ' の' },
      { t: '山', r: ' やまもと', w: gloss('山', 'mountain') },
      { t: '本', r: '', w: gloss('本', 'book') },
      { t: 'です', r: ' です' }
    ], none)).toEqual([
      { t: 'の', r: ' の' },
      {
        t: '山本',
        r: ' やまもと',
        w: { form: '山本', reading: 'やまもと', meanings: [], pos: null, parts: [gloss('山', 'mountain'), gloss('本', 'book')] }
      },
      { t: 'です', r: ' です' }
    ])
  })

  it('uses the whole word\'s own gloss when the dictionary has it', () => {
    const whole = gloss('大黒柱', 'mainstay')
    const [token] = glueAuthorWords([
      { t: '大', r: 'だいこくばしら', w: gloss('大', 'big') },
      { t: '黒', r: '', w: gloss('黒', 'black') },
      { t: '柱', r: '', w: gloss('柱', 'pillar') }
    ], kana => kana === '大黒柱' ? whole : undefined)
    expect(token).toEqual({
      t: '大黒柱',
      r: 'だいこくばしら',
      w: { ...whole, parts: [gloss('大', 'big'), gloss('黒', 'black'), gloss('柱', 'pillar')] }
    })
  })

  it('leaves a word and its one-kana ending alone', () => {
    const tokens = [{ t: '大切', r: 'たいせつ', w: gloss('大切', 'important') }, { t: 'な', r: 'な', w: gloss('な', 'don\'t') }]
    expect(glueAuthorWords(tokens, none)).toEqual(tokens)
  })

  it('never glues across the author\'s word break or punctuation', () => {
    const tokens = [
      { t: '日本', r: 'にほん', w: gloss('日本', 'Japan') },
      { t: '語', r: ' ご', w: gloss('語', 'language') },
      { t: '、', r: '、' },
      { t: '人', r: 'ひと', w: gloss('人', 'person') }
    ]
    expect(glueAuthorWords(tokens, none)).toEqual(tokens)
  })

  it('leaves kana-only pieces to regroupKana', () => {
    const tokens = [{ t: 'それ', r: 'それ', w: gloss('それ', 'that') }, { t: 'から', r: 'から', w: gloss('から', 'from') }]
    expect(glueAuthorWords(tokens, none)).toEqual(tokens)
  })
})
