import { describe, expect, it } from 'vitest'

import type { GhostBossEntry, GhostPools, GhostSubject } from '@/types/games.js'

import { buildGhostRounds, KANA_LOOKALIKES } from './ghost-boss.js'

function seeded(seed = 1): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const pools: GhostPools = {
  words: [
    { text: '二つ', reading: 'ふたつ', meaning: 'two' },
    { text: '三つ', reading: 'みっつ', meaning: 'three' },
    { text: '猫', reading: 'ねこ', meaning: 'cat' },
    { text: '水', reading: 'みず', meaning: 'water' },
    { text: '山', reading: 'やま', meaning: 'mountain' }
  ],
  kana: [
    { character: 'ヲ', romaji: 'wo', script: 'katakana' },
    { character: 'フ', romaji: 'fu', script: 'katakana' },
    { character: 'ラ', romaji: 'ra', script: 'katakana' },
    { character: 'ヨ', romaji: 'yo', script: 'katakana' },
    { character: 'オ', romaji: 'o', script: 'katakana' },
    { character: 'を', romaji: 'wo', script: 'hiragana' }
  ]
}

function entry(over: Partial<GhostBossEntry>): GhostBossEntry {
  return { key: 'k', kind: 'word', facet: 'meaning', status: 'ghost', text: '一つ', reading: 'ひとつ', meaning: 'one', ref: 'w1', etymology: null, lookAlikes: [], grammar: null, ...over }
}

describe('buildGhostRounds', () => {
  it('asks a word missed English-to-Japanese the same way first', () => {
    const rounds = buildGhostRounds([{ entry: entry({ facet: 'production' }) }], pools, seeded())
    expect(rounds.map(r => r.kind)).toEqual(['production', 'meaning'])
    expect(rounds[0]).toMatchObject({ question: 'Which one is "one"?', answer: '一つ', script: 'ja' })
    expect(rounds[0]!.options).toHaveLength(4)
    expect(rounds[0]!.options).toContain('一つ')
  })

  it('asks a kana its reading against the readings of its look-alikes, then picks it out of them', () => {
    const subject: GhostSubject = { entry: entry({ kind: 'kana', facet: 'reading', text: 'ヲ', reading: 'wo', meaning: '', ref: '' }), script: 'katakana' }
    const [reading, writing] = buildGhostRounds([subject], pools, seeded())
    expect(reading).toMatchObject({ kind: 'kana-reading', answer: 'wo', script: 'en' })
    expect([...reading!.options].sort()).toEqual(['fu', 'ra', 'wo', 'yo'].sort())
    expect(writing).toMatchObject({ kind: 'kana-writing', question: 'Which one is "wo"?', answer: 'ヲ' })
    expect([...writing!.options].sort()).toEqual(['フ', 'ヨ', 'ラ', 'ヲ'].sort())
  })

  it('never offers "o" as a wrong reading of ヲ', () => {
    const kana = [{ character: 'ヲ', romaji: 'wo', script: 'katakana' as const }, { character: 'オ', romaji: 'o', script: 'katakana' as const }, { character: 'カ', romaji: 'ka', script: 'katakana' as const }, { character: 'キ', romaji: 'ki', script: 'katakana' as const }, { character: 'ク', romaji: 'ku', script: 'katakana' as const }]
    for (let seed = 1; seed < 20; seed++) {
      const subject: GhostSubject = { entry: entry({ kind: 'kana', facet: 'reading', text: 'ヲ', reading: 'wo', meaning: '', ref: '' }), script: 'katakana' }
      const [reading] = buildGhostRounds([subject], { words: [], kana }, seeded(seed))
      expect(reading!.options).not.toContain('o')
    }
  })

  it('asks a grammar point its reviewed meaning, and the pattern back from it', () => {
    const subject: GhostSubject = {
      entry: entry({ kind: 'grammar', facet: 'usage', text: '〜でしょう', reading: null, meaning: 'Probably: a guess.', ref: 'deshou' }),
      meaningQuestion: {
        answer: 'Probably: a guess.',
        wrong: [
          { meaning: 'Marks the thing compared against.', title: 'より' },
          { meaning: 'Marks a tool, method or material.', title: 'で (by means of)' },
          { meaning: 'Only, and not enough.', title: 'しか〜ない' }
        ]
      }
    }
    const rounds = buildGhostRounds([subject], pools, seeded())
    expect(rounds.map(r => [r.kind, r.answer])).toEqual([['pattern-reverse', '〜でしょう'], ['pattern', 'Probably: a guess.']])
    expect(rounds[0]!.options).toContain('しか〜ない')
  })

  it('leaves out a round it cannot ask honestly, and takes the next', () => {
    // A listening ghost with no current recording.
    const rounds = buildGhostRounds([{ entry: entry({ facet: 'listening' }), audio: null }], pools, seeded())
    expect(rounds.map(r => r.kind)).toEqual(['production', 'meaning'])
  })

  it('asks every ghost once before any is asked again', () => {
    const rounds = buildGhostRounds([
      { entry: entry({ key: 'a', facet: 'production' }) },
      { entry: entry({ key: 'b', text: '猫', reading: 'ねこ', meaning: 'cat', facet: 'meaning' }) }
    ], pools, seeded())
    expect(rounds.map(r => r.ghost)).toEqual(['a', 'b', 'a', 'b'])
  })

  it('has look-alikes that are themselves kana, and never the kana itself', () => {
    for (const [kana, alike] of Object.entries(KANA_LOOKALIKES)) {
      expect(alike).not.toContain(kana)
      expect(new Set(alike).size).toBe(3)
    }
  })
})
