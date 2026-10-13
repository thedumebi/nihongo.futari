import { describe, expect, it } from 'vitest'

import { crosswordClue } from './crossword-clues.js'

function entry(over: Partial<Parameters<typeof crosswordClue>[0]> = {}) {
  return crosswordClue({
    reading: 'のむ',
    form: '飲む',
    glosses: ['to drink', 'to gulp', 'to swallow'],
    pos: ['v5m', 'vt'],
    misc: [],
    ...over
  })
}

describe('crosswordClue', () => {
  it('uses the first two meanings and the broad kind of word', () => {
    expect(entry()).toBe('to drink; to gulp (verb)')
    expect(entry({ reading: 'あおい', form: '青い', glosses: ['blue', 'azure'], pos: ['adj-i'] })).toBe('blue; azure (adjective)')
    expect(entry({ reading: 'あお', form: '青', glosses: ['blue', 'azure'], pos: ['n'] })).toBe('blue; azure (noun)')
  })

  it('leaves out numerals, counters, particles, suffixes and set expressions', () => {
    expect(entry({ reading: 'いち', form: '一', glosses: ['one', '1'], pos: ['num'] })).toBeNull()
    expect(entry({ reading: 'こ', form: '戸', glosses: ['counter for houses'], pos: ['ctr'] })).toBeNull()
    expect(entry({ reading: 'は', form: 'は', glosses: ['indicates sentence topic'], pos: ['prt'] })).toBeNull()
    expect(entry({ reading: 'さん', form: 'さん', glosses: ['Mr.', 'Mrs.'], pos: ['suf'] })).toBeNull()
    expect(entry({ reading: 'せん', form: 'せん', glosses: ['will not do'], pos: ['exp'] })).toBeNull()
  })

  it('leaves out archaic, rare and dated senses', () => {
    expect(entry({ reading: 'わらわ', form: '妾', glosses: ['I', 'me'], pos: ['pn'], misc: ['arch'] })).toBeNull()
    expect(entry({ misc: ['rare'] })).toBeNull()
  })

  it('leaves out meanings that give the answer away', () => {
    expect(entry({ reading: 'ペン', form: 'ペン', glosses: ['pen'], pos: ['n'] })).toBeNull()
    expect(entry({ reading: 'かんじ', form: '漢字', glosses: ['kanji', 'Chinese character'], pos: ['n'] })).toBeNull()
    expect(entry({ reading: 'はん', form: '半', glosses: ['half (e.g. にじはん)'], pos: ['n'] })).toBeNull()
  })

  it('keeps a meaning that merely contains the romaji letters inside a longer word', () => {
    // い is "i"; "kite" contains it, and that is no giveaway.
    expect(entry({ reading: 'たこ', form: '凧', glosses: ['kite'], pos: ['n'] })).toBe('kite (noun)')
  })

  it('drops long asides but keeps short ones', () => {
    expect(entry({ reading: 'カップ', form: 'カップ', glosses: ['cup (drinking vessel, measure, brassiere, prize, etc.)'], pos: ['n'] }))
      .toBe('cup (noun)')
    expect(entry({ reading: 'えき', form: '駅', glosses: ['station (train, bus)'], pos: ['n'] })).toBe('station (train, bus) (noun)')
  })
})
