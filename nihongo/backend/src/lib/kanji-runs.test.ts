import { describe, expect, it } from 'vitest'

import { splitKanjiRuns } from './kanji-runs.js'

const DICT: Record<string, string> = { 時間: 'じかん', 英語: 'えいご', 日本: 'にほん', 語: 'ご', 今: 'いま', 一日: 'いちにち' }
const lookup = (t: string) => DICT[t]

describe('splitKanjiRuns', () => {
  it('splits a run of two kanji words at the dictionary reading', () => {
    expect(splitKanjiRuns([
      { t: '時間', r: 'じかんえいご' },
      { t: '英語', r: '' },
      { t: 'を', r: 'お' }
    ], lookup)).toEqual([
      { t: '時間', r: 'じかん' },
      { t: '英語', r: 'えいご' },
      { t: 'を', r: 'お' }
    ])
  })

  it('keeps the author\'s leading space on the first word', () => {
    expect(splitKanjiRuns([{ t: '日本', r: ' にほんご' }, { t: '語', r: '' }], lookup))
      .toEqual([{ t: '日本', r: ' にほん' }, { t: '語', r: 'ご' }])
  })

  it('leaves the run alone when a dictionary reading does not fit', () => {
    const tokens = [{ t: '時間', r: 'じかんにほんご' }, { t: '英語', r: '' }]
    expect(splitKanjiRuns(tokens, lookup)).toEqual(tokens)
  })

  it('leaves the run alone when a word has no dictionary reading', () => {
    const tokens = [{ t: '時間', r: 'じかんかんじ' }, { t: '漢字', r: '' }]
    expect(splitKanjiRuns(tokens, lookup)).toEqual(tokens)
  })

  it('moves the front of a word with kana in it back where it belongs', () => {
    expect(splitKanjiRuns([{ t: '今', r: 'いまお' }, { t: '起きた', r: 'きた' }], lookup))
      .toEqual([{ t: '今', r: 'いま' }, { t: '起きた', r: 'おきた' }])
  })

  it('does not move anything when the first word does not start with its dictionary reading', () => {
    const tokens = [{ t: '一日', r: 'ついたちや' }, { t: '休み', r: 'すみ' }]
    expect(splitKanjiRuns(tokens, lookup)).toEqual(tokens)
  })

  it('does not move anything when the reading is already the dictionary one', () => {
    const tokens = [{ t: '今', r: 'いま' }, { t: '起きた', r: 'おきた' }]
    expect(splitKanjiRuns(tokens, lookup)).toEqual(tokens)
  })
})
