import { describe, expect, it } from 'vitest'

import { grammarLookupKey, isGlyphPos, isGrammaticalPos, pickGlyphEntry, pickGrammarEntry } from './grammar-source.js'

describe('isGrammaticalPos', () => {
  it('accepts parts of speech that describe a grammatical function', () => {
    for (const pos of ['particle', 'suffix', 'verb', 'auxiliary', 'conjunction']) {
      expect(isGrammaticalPos(pos), pos).toBe(true)
    }
  })

  it('rEJECTS entries about the writing system', () => {
    // The whole point. Wiktionary's `syllable` entry for は describes the kana
    // glyph's descent from 波 — nothing to do with the topic particle.
    for (const pos of ['syllable', 'character', 'letter', 'romanization']) {
      expect(isGrammaticalPos(pos), pos).toBe(false)
    }
  })

  it('is case and whitespace insensitive', () => {
    expect(isGrammaticalPos('  Particle ')).toBe(true)
    expect(isGrammaticalPos('SYLLABLE')).toBe(false)
  })

  it('rejects anything it does not recognise rather than letting it through', () => {
    expect(isGrammaticalPos('proverb')).toBe(false)
    expect(isGrammaticalPos('')).toBe(false)
  })
})

describe('grammarLookupKey', () => {
  it('strips the decoration titles carry for readers', () => {
    expect(grammarLookupKey('〜ます')).toBe('ます')
    expect(grammarLookupKey('は (topic)')).toBe('は')
    expect(grammarLookupKey('〜て form')).toBe('て')
    expect(grammarLookupKey('〜たことがある')).toBe('たことがある')
  })

  it('handles the full-width tilde as well as the wave dash', () => {
    expect(grammarLookupKey('～ない')).toBe('ない')
  })

  it('leaves a bare title alone', () => {
    expect(grammarLookupKey('です')).toBe('です')
  })
})

describe('pickGrammarEntry', () => {
  const syllable = { pos: 'syllable', text: 'Derived in the Heian period from the man\'yōgana kanji 波.' }
  const particle = { pos: 'particle', text: 'From Old Japanese, originally marking topic.' }

  it('returns null when only script entries exist', () => {
    // Better no packet than a packet that grounds a particle in calligraphy.
    expect(pickGrammarEntry([syllable])).toBeNull()
  })

  it('picks the grammatical entry over the script one regardless of order', () => {
    expect(pickGrammarEntry([syllable, particle])).toBe(particle)
    expect(pickGrammarEntry([particle, syllable])).toBe(particle)
  })

  it('prefers the fuller passage among grammatical entries', () => {
    const stub = { pos: 'suffix', text: 'See ます.' }
    const full = { pos: 'suffix', text: 'From 参らす (mairasu), via まらす and まっす, originally a humble verb.' }
    expect(pickGrammarEntry([stub, full])).toBe(full)
  })

  it('returns null for an empty list', () => {
    expect(pickGrammarEntry([])).toBeNull()
  })
})

describe('isGlyphPos / pickGlyphEntry', () => {
  const character = { pos: 'character', text: 'Japanese shinjitai, simplified from 戰 (單 → 単).' }
  const noun = { pos: 'noun', text: 'From Old Japanese, from Proto-Japonic *pitə.' }

  it('accepts character entries — the inverse of the grammar filter', () => {
    // `character` is precisely what isGrammaticalPos rejects. For a glyph
    // origin it is the only right answer.
    expect(isGlyphPos('character')).toBe(true)
    expect(isGrammaticalPos('character')).toBe(false)
  })

  it('rejects the word entry for a kanji', () => {
    // 人's noun entry explains ひと, not the shape of the character.
    expect(isGlyphPos('noun')).toBe(false)
    expect(pickGlyphEntry([noun])).toBeNull()
  })

  it('picks the glyph entry when both are present', () => {
    expect(pickGlyphEntry([noun, character])).toBe(character)
  })

  it('returns null for an empty list', () => {
    expect(pickGlyphEntry([])).toBeNull()
  })
})
