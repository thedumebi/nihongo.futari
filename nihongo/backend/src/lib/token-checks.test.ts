import { describe, expect, it } from 'vitest'

import { tokenProblems } from './token-checks.js'

const gloss = (form: string, meaning?: string, pos: string | null = 'noun') => ({ form, reading: form, meanings: [meaning ?? `${form}-meaning`], pos })

describe('tokenProblems', () => {
  it('passes a line whose every word has a gloss and a reading', () => {
    expect(tokenProblems([
      { t: '日本語', r: 'にほんご', w: gloss('日本語') },
      { t: 'を', r: 'お' },
      { t: '話します', r: 'はなします', w: gloss('話す', undefined, 'godan verb') }
    ], true)).toEqual({ problems: [], warnings: [] })
  })

  it('reports a word shredded into single kana', () => {
    expect(tokenProblems([{ t: 'き' }, { t: 'の' }, { t: 'う' }], false).problems)
      .toEqual(['shredded into single kana: き|の|う'])
  })

  it('does not count a run made only of particles as shredded', () => {
    expect(tokenProblems([{ t: 'の' }, { t: 'を' }], false).problems).toEqual([])
  })

  it('does not count です split into で|す as shredded', () => {
    expect(tokenProblems([{ t: '猫', w: gloss('猫') }, { t: 'で' }, { t: 'す' }], false).problems).toEqual([])
  })

  it('reports a particle swallowed into a dictionary word', () => {
    expect(tokenProblems([{ t: '語を', w: gloss('語る', undefined, 'godan verb') }], false).problems)
      .toEqual(['particle swallowed: "語を" glossed as "語る-meaning"'])
  })

  it('accepts a whole word that merely ends in particle kana', () => {
    expect(tokenProblems([{ t: 'ところが', w: gloss('ところが', 'however', 'conjunction') }], false).problems).toEqual([])
  })

  it('warns, without failing, on two single kanji side by side', () => {
    expect(tokenProblems([{ t: '田', w: gloss('田') }, { t: '中', w: gloss('中') }], false))
      .toEqual({ problems: [], warnings: ['two single kanji adjacent: a split compound, or just two words? 田|中'] })
  })

  it('reports a line glossed with a reading that produced no per-token readings', () => {
    expect(tokenProblems([{ t: '猫', w: gloss('猫') }], true).problems)
      .toEqual(['no per-token readings, so romaji mode cannot space the words'])
  })
})
