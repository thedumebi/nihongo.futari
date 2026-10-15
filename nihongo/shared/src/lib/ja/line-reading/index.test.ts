import { describe, expect, it } from 'vitest'

import { readLine, readTokenProblems, splitAround } from './index.js'

const DICT: Record<string, { form: string, reading: string }> = {
  時間: { form: '時間', reading: 'じかん' },
  英語: { form: '英語', reading: 'えいご' },
  今: { form: '今', reading: 'いま' },
  起きた: { form: '起きる', reading: 'おきる' },
  一日: { form: '一日', reading: 'いちにち' },
  三回: { form: '三回', reading: 'さんかい' },
  食べます: { form: '食べる', reading: 'たべる' },
  母: { form: '母', reading: 'はは' },
  先生: { form: '先生', reading: 'せんせい' },
  良い: { form: '良い', reading: 'よい' },
  勉強する: { form: '勉強', reading: 'べんきょう' }
}
const dict = (t: string) => DICT[t]

/** Each shown word as `surface=reading`, merged words joined by +. */
function shown(tokens: string[], source: Parameters<typeof readLine>[1]) {
  const groups = readLine(tokens, source, dict)
  return groups?.map(g => `${tokens.slice(g.from, g.to).join('+')}=${g.r}`)
}

describe('readLine with an authored reading', () => {
  it('gives each word of a run of kanji its own reading', () => {
    expect(shown(['時間', '英語', 'を'], { reading: 'じかんえいご お' }))
      .toEqual(['時間=じかん', '英語=えいご', 'を= お'])
  })

  it('keeps the front of a word\'s reading on that word', () => {
    expect(shown(['今', '起きた'], { reading: 'いま おきた' }))
      .toEqual(['今=いま', '起きた= おきた'])
    expect(shown(['今', '起きた'], { reading: 'いまおきた' }))
      .toEqual(['今=いま', '起きた=おきた'])
  })

  it('does not take a particle from inside a word\'s reading', () => {
    expect(shown(['一日', 'に', '三回', '食べます'], { reading: 'いちにちにさんかいたべます' }))
      .toEqual(['一日=いちにち', 'に=に', '三回=さんかい', '食べます=たべます'])
  })

  it('reads a particle as spoken but keeps it written as it is', () => {
    const groups = readLine(['母', 'は', '先生', 'です', '。'], { reading: 'はは わ せんせい です。' }, dict)!
    expect(groups.map(g => g.r)).toEqual(['はは', ' わ', ' せんせい', ' です', '。'])
    expect(groups[1]!.f).toEqual([{ t: 'は' }])
  })

  it('keeps okurigana with the word it belongs to', () => {
    expect(shown(['良い', '一日', 'を'], { reading: 'よい いちにち お' }))
      .toEqual(['良い=よい', '一日= いちにち', 'を= お'])
  })

  it('shows two words as one when nothing says where their reading divides', () => {
    expect(shown(['山', '本'], { reading: 'やまもと' })).toEqual(['山+本=やまもと'])
  })

  it('leaves katakana as written and needs no reading for it', () => {
    const groups = readLine(['コーヒー', 'を', '飲む'], { reading: 'コーヒー お のむ' }, dict)!
    expect(groups.map(g => g.f)).toEqual([[{ t: 'コーヒー' }], [{ t: 'を' }], [{ t: '飲', r: 'の' }, { t: 'む' }]])
  })

  it('reads numerals and ヶ like kanji', () => {
    expect(shown(['一ヶ月'], { reading: 'いっかげつ' })).toEqual(['一ヶ月=いっかげつ'])
    expect(shown(['１０', '時'], { reading: 'じゅう じ' })).toEqual(['１０=じゅう', '時= じ'])
  })

  it('returns null when the reading does not fit the text', () => {
    expect(readLine(['猫', 'です'], { reading: 'いぬだ' }, dict)).toBeNull()
  })
})

describe('readLine and romaji', () => {
  it('keeps punctuation, with a space after it, so romaji reads hai, hitotsu', () => {
    const groups = readLine(['はい', '、', '一つ', 'です', '。'], { reading: 'はい、ひとつ です。' }, dict)!
    expect(groups.map(g => g.r)).toEqual(['はい', '、', ' ひとつ', ' です', '。'])
  })
})

describe('readLine with furigana aligned at import', () => {
  it('uses the alignment as it stands', () => {
    const segments = [{ t: '毎日', r: 'まいにち' }, { t: '三', r: 'さん' }, { t: '時間', r: 'じかん' }, { t: '英語', r: 'えいご' }, { t: 'を' }]
    expect(shown(['毎日', '三時間', '英語', 'を'], { segments }))
      .toEqual(['毎日=まいにち', '三時間=さんじかん', '英語=えいご', 'を=を'])
  })

  it('splits an imported segment that spans two words only by the dictionary', () => {
    expect(shown(['時間', '英語'], { segments: [{ t: '時間英語', r: 'じかんえいご' }] }))
      .toEqual(['時間=じかん', '英語=えいご'])
  })
})

describe('readLine on lines that used to drift', () => {
  const more = (t: string) => ({ 人: { form: '人', reading: 'ひと' }, 黄色い: { form: '黄色い', reading: 'きいろい' }, 点字: { form: '点字', reading: 'てんじ' }, 危険: { form: '危険', reading: 'きけん' }, 物: { form: '物', reading: 'もの' }, 二日: { form: '二日', reading: 'ふつか' }, 十: { form: '十', reading: 'じゅう' }, 駅: { form: '駅', reading: 'えき' } } as Record<string, { form: string, reading: string }>)[t]
  const read = (tokens: string[], reading: string) => readLine(tokens, { reading }, more)?.map(g => `${tokens.slice(g.from, g.to).join('+')}=${g.r.trim()}`)

  it('keeps an author\'s word break between two words, not inside one', () => {
    expect(read(['人', 'と', '人', 'と', 'の'], 'ひと と ひと と の')).toEqual(['人=ひと', 'と=と', '人=ひと', 'と=と', 'の=の'])
  })

  it('finds the right alignment on a long line', () => {
    const tokens = ['危ない', 'です', 'から', '、', '黄色い', '点字', 'ブロック', 'まで', 'お', '下がり', 'ください', '。']
    expect(read(tokens, 'あぶない です から、きいろい てんじ ブロック まで おさがり ください。')?.slice(4, 6))
      .toEqual(['黄色い=きいろい', '点字=てんじ'])
  })

  it('reads は as わ only as a particle at the end of a word', () => {
    expect(read(['危険', '物', 'は'], 'きけんぶつ わ')).toEqual(['危険+物=きけんぶつ', 'は=わ'])
  })

  it('does not follow the author\'s spaces where the dictionary says otherwise', () => {
    expect(read(['十', '二日'], 'じゅうに にち')).toEqual(['十+二日=じゅうに にち'])
  })

  it('lets a placeholder symbol carry its own reading', () => {
    expect(read(['△△', '駅'], 'さんかくさんかく えき')).toEqual(['△△=さんかくさんかく', '駅=えき'])
  })
})

describe('readTokenProblems', () => {
  it('passes a word whose every kanji has a reading', () => {
    expect(readTokenProblems({ t: '食べる', r: 'たべる', f: [{ t: '食', r: 'た' }, { t: 'べる' }] })).toEqual([])
  })

  it('reports a kanji word with no reading', () => {
    expect(readTokenProblems({ t: '英語', r: '' })).toEqual(['英語: no reading'])
    expect(readTokenProblems({ t: '英語', r: '', f: [{ t: '英語' }] })).toEqual(['英語: 英語 has no reading'])
  })

  it('needs nothing for a kana word', () => {
    expect(readTokenProblems({ t: 'です' })).toEqual([])
  })
})

describe('splitAround', () => {
  const tokens = [
    { t: 'もう', r: 'もう', f: [{ t: 'もう' }] },
    { t: '言って', r: ' いって', f: [{ t: '言', r: 'い' }, { t: 'って' }] },
    { t: 'ください', r: ' ください', f: [{ t: 'ください' }] }
  ]

  it('splits the word the blank cuts through, keeping its reading on the kanji', () => {
    // もう言って|ください with て (position 4) blanked.
    const { before, after } = splitAround(tokens, 4, 5)
    expect(before.map(t => [t.t, t.f])).toEqual([['もう', [{ t: 'もう' }]], ['言っ', [{ t: '言', r: 'い' }, { t: 'っ' }]]])
    expect(after.map(t => t.t)).toEqual(['ください'])
    // 言って began a word, so its front keeps the word break.
    expect(before[1]!.r).toBe(' いっ')
  })

  it('keeps whole words on each side when the blank falls between them', () => {
    const { before, after } = splitAround(tokens, 2, 2)
    expect(before.map(t => t.t)).toEqual(['もう'])
    expect(after.map(t => t.t)).toEqual(['言って', 'ください'])
  })
})
