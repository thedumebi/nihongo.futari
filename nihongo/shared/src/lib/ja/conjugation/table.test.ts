import { describe, expect, it } from 'vitest'

import { conjugateAdjective } from './adjective.js'
import { conjugate } from './index.js'
import { conjugationTables } from './table.js'

/** The grid as `tense: polite / plain`, readable in a failure. */
function gridOf(form: string, reading: string, pos: string[][]) {
  return conjugationTables({ form, reading, pos }).map(t => ({
    kind: t.kind,
    grid: t.grid.map(r => `${r.tense}: ${r.polite?.surface} / ${r.plain?.surface}`)
  }))
}

describe('conjugationTables', () => {
  it('gives an ichidan verb its polite and plain tenses', () => {
    expect(gridOf('食べる', 'たべる', [['v1', 'vt']])).toEqual([{
      kind: 'verb',
      grid: ['Present: 食べます / 食べる', 'Negative: 食べません / 食べない', 'Past: 食べました / 食べた', 'Past negative: 食べませんでした / 食べなかった']
    }])
  })

  it('names the other forms from the shared form info', () => {
    const [table] = conjugationTables({ form: '書く', reading: 'かく', pos: [['v5k']] })
    const te = table?.others.find(o => o.surface === '書いて')
    expect(te).toMatchObject({ reading: 'かいて', label: '〜て te-form' })
    expect(table?.others.map(o => o.surface)).toContain('書ける')
  })

  it('reads every sense, so a verb sense listed second still gets a table', () => {
    expect(gridOf('掛ける', 'かける', [['n'], ['v1']])[0]?.kind).toBe('verb')
  })

  it('conjugates a する-noun with する, and says so', () => {
    const [table] = conjugationTables({ form: '勉強', reading: 'べんきょう', pos: [['n', 'vs']] })
    expect(table?.grid[0]).toEqual({
      tense: 'Present',
      polite: { surface: '勉強します', reading: 'べんきょうします' },
      plain: { surface: '勉強する', reading: 'べんきょうする' }
    })
    expect(table?.note).toBe('Used as a verb with する: 勉強する.')
  })

  it('gives no table for a verb the engine would get wrong', () => {
    expect(conjugationTables({ form: '下さる', reading: 'くださる', pos: [['v5aru']] })).toEqual([])
  })

  it('gives no table for a plain noun', () => {
    expect(conjugationTables({ form: '本', reading: 'ほん', pos: [['n']] })).toEqual([])
  })

  it('conjugates an い-adjective', () => {
    expect(gridOf('高い', 'たかい', [['adj-i']])).toEqual([{
      kind: 'i-adjective',
      grid: ['Present: 高いです / 高い', 'Negative: 高くないです / 高くない', 'Past: 高かったです / 高かった', 'Past negative: 高くなかったです / 高くなかった']
    }])
  })

  it('conjugates a な-adjective with the copula, and gives it な before a noun', () => {
    const [table] = conjugationTables({ form: '静か', reading: 'しずか', pos: [['adj-na']] })
    expect(table?.grid.map(r => r.plain?.surface)).toEqual(['静かだ', '静かじゃない', '静かだった', '静かじゃなかった'])
    expect(table?.others[0]).toMatchObject({ surface: '静かな', label: '〜な before a noun' })
  })

  it('gives a word that is both a な-adjective and a する-verb both tables', () => {
    expect(conjugationTables({ form: '心配', reading: 'しんぱい', pos: [['adj-na', 'n', 'vs']] }).map(t => t.kind))
      .toEqual(['verb', 'na-adjective'])
  })
})

describe('conjugateAdjective', () => {
  it('takes いい on よ, never いくない', () => {
    expect(conjugateAdjective({ surface: 'いい', reading: 'いい', kind: 'ix' }, 'negative')).toEqual({ surface: 'よくない', reading: 'よくない' })
    expect(conjugateAdjective({ surface: 'いい', reading: 'いい', kind: 'ix' }, 'present')).toEqual({ surface: 'いい', reading: 'いい' })
  })

  it('keeps the kanji of 良い', () => {
    expect(conjugateAdjective({ surface: '良い', reading: 'よい', kind: 'ix' }, 'past')).toEqual({ surface: '良かった', reading: 'よかった' })
  })

  it('takes the よ stem inside a compound like かっこいい', () => {
    expect(conjugateAdjective({ surface: 'かっこいい', reading: 'かっこいい', kind: 'ix' }, 'past')?.surface).toBe('かっこよかった')
  })

  it('refuses an い-adjective that does not end in い', () => {
    expect(conjugateAdjective({ surface: '綺麗', reading: 'きれい', kind: 'i' }, 'past')).toBeNull()
  })
})

describe('conjugate 来る', () => {
  it('keeps what comes before 来る in a compound', () => {
    expect(conjugate({ surface: 'やって来る', reading: 'やってくる', verbClass: 'kuru' }, 'masu'))
      .toEqual({ form: 'masu', surface: 'やって来ます', reading: 'やってきます' })
  })

  it('keeps a くる written in kana in kana', () => {
    expect(conjugate({ surface: 'くる', reading: 'くる', verbClass: 'kuru' }, 'nai'))
      .toEqual({ form: 'nai', surface: 'こない', reading: 'こない' })
  })
})
