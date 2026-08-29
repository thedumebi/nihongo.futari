import { describe, expect, it } from 'vitest'

import type { EnrichmentDraft, GroundingPacket } from '../../types/enrichment.js'

import { validateDraft } from './validate.js'

const PASSAGE = 'The gerund -te derives from the infinitive of the perfective auxiliary tu, '
  + 'which marked completion in Old Japanese.'

const packet: GroundingPacket = {
  targetTable: 'grammar_points',
  targetId: 'gp-te-form',
  subject: '〜て',
  aspect: 'historical-grammar',
  facts: { level: 'N5' },
  sources: [
    { sourceId: 'src-frellesvig', label: 'Frellesvig 2010', locator: 'Ch. 4', passage: PASSAGE },
    { sourceId: 'src-wiktionary', label: 'Wiktionary', locator: 'て', passage: 'From Old Japanese つ.' }
  ]
}

function draft(overrides: Partial<EnrichmentDraft> = {}): EnrichmentDraft {
  return {
    claim: 'て comes from the perfective auxiliary つ.',
    body: 'The te-form is the infinitive of つ, which marked completion.',
    confidence: 'well-supported',
    isDisputed: false,
    period: 'Old Japanese',
    citations: [{
      sourceId: 'src-frellesvig',
      quote: 'The gerund -te derives from the infinitive of the perfective auxiliary tu',
      supports: 'supports'
    }],
    competingTheories: [],
    ...overrides
  }
}

describe('validateDraft', () => {
  it('accepts a draft whose quote is lifted verbatim from the packet', () => {
    const result = validateDraft(draft(), packet)
    expect(result.ok).toBe(true)
    expect(result.failures).toEqual([])
    expect(result.checkedQuotes).toBe(1)
  })

  it('rEJECTS a fabricated quote, however plausible', () => {
    // This is the check the whole layer rests on. The sentence below is
    // entirely reasonable, reads like Frellesvig, and is not in the passage.
    const result = validateDraft(draft({
      citations: [{
        sourceId: 'src-frellesvig',
        quote: 'The te-form originates in the Old Japanese perfective and marks sequence.',
        supports: 'supports'
      }]
    }), packet)
    expect(result.ok).toBe(false)
    expect(result.failures[0]).toMatch(/not a substring/)
  })

  it('rEJECTS a citation of a source that was never shown', () => {
    // A real work, a real-sounding locator, and not in the packet.
    const result = validateDraft(draft({
      citations: [{ sourceId: 'src-nikkoku', quote: 'anything', supports: 'supports' }]
    }), packet)
    expect(result.ok).toBe(false)
    expect(result.failures[0]).toMatch(/was not in the packet/)
  })

  it('drops an honest "the sources do not cover this" rather than failing it', () => {
    // Declining is the behaviour we WANT. It must be distinguishable from a
    // validation failure, or the prompt teaches the model to guess instead.
    const result = validateDraft(draft({ confidence: 'unknown', citations: [] }), packet)
    expect(result.dropped).toBe(true)
    expect(result.ok).toBe(false)
    expect(result.failures).toEqual([])
  })

  it('rejects a draft with no citations at all', () => {
    const result = validateDraft(draft({ citations: [] }), packet)
    expect(result.ok).toBe(false)
    expect(result.failures).toContain('no citations')
  })

  it('rejects when every citation only contradicts', () => {
    const result = validateDraft(draft({
      citations: [{
        sourceId: 'src-frellesvig',
        quote: 'which marked completion in Old Japanese',
        supports: 'contradicts'
      }]
    }), packet)
    expect(result.ok).toBe(false)
    expect(result.failures).toContain('no citation marked as supporting')
  })

  it('tolerates re-wrapped whitespace in a genuine quote', () => {
    // Models re-wrap text. A newline where the source had a space is not a
    // fabrication, and failing it would train us to ignore the check.
    const result = validateDraft(draft({
      citations: [{
        sourceId: 'src-frellesvig',
        quote: 'the infinitive of the\n  perfective   auxiliary tu',
        supports: 'supports'
      }]
    }), packet)
    expect(result.ok).toBe(true)
  })

  it('rejects an empty quote instead of counting it as checked', () => {
    const result = validateDraft(draft({
      citations: [{ sourceId: 'src-frellesvig', quote: '   ', supports: 'supports' }]
    }), packet)
    expect(result.ok).toBe(false)
    expect(result.checkedQuotes).toBe(0)
    expect(result.failures[0]).toMatch(/empty quote/)
  })

  it('checks each citation independently', () => {
    const result = validateDraft(draft({
      citations: [
        { sourceId: 'src-frellesvig', quote: 'which marked completion in Old Japanese', supports: 'supports' },
        { sourceId: 'src-wiktionary', quote: 'From Middle Chinese', supports: 'supports' }
      ]
    }), packet)
    expect(result.ok).toBe(false)
    expect(result.failures).toHaveLength(1)
    expect(result.failures[0]).toMatch(/src-wiktionary/)
  })

  it('rejects empty prose even when the citation is sound', () => {
    expect(validateDraft(draft({ claim: '  ' }), packet).failures).toContain('empty claim')
    expect(validateDraft(draft({ body: '' }), packet).failures).toContain('empty body')
  })

  it('accepts a quote from ANY passage when one source supplies several', () => {
    // Wiktionary gives a separate etymology per part of speech, so a packet can
    // hold two passages under one sourceId. Keyed by a plain Map only the last
    // survives, and a genuine quote from the first is rejected as fabricated.
    const multi: GroundingPacket = {
      ...packet,
      sources: [
        { sourceId: 'src-wiktionary', label: 'Wiktionary', locator: 'あう (verb)', passage: 'From Old Japanese あふ.' },
        { sourceId: 'src-wiktionary', label: 'Wiktionary', locator: 'あう (suffix)', passage: 'A suffix marking reciprocal action.' }
      ]
    }
    const first = validateDraft(draft({
      citations: [{ sourceId: 'src-wiktionary', quote: 'From Old Japanese', supports: 'supports' }]
    }), multi)
    expect(first.ok).toBe(true)

    const second = validateDraft(draft({
      citations: [{ sourceId: 'src-wiktionary', quote: 'marking reciprocal action', supports: 'supports' }]
    }), multi)
    expect(second.ok).toBe(true)
  })

  it('cannot be satisfied by an empty packet', () => {
    // No packet, no generation: with nothing to cite, nothing can validate.
    const empty: GroundingPacket = { ...packet, sources: [] }
    expect(validateDraft(draft(), empty).ok).toBe(false)
  })
})

describe('validateDraft — numbers', () => {
  const counted: GroundingPacket = {
    ...packet,
    sources: [{
      sourceId: 'src-kanjidic2',
      label: 'KANJIDIC2',
      locator: '青',
      passage: 'Across the 6 kanji that use 青 as a phonetic component, 6 share the reading セイ.'
    }]
  }
  const cite = { sourceId: 'src-kanjidic2', quote: '6 share the reading セイ', supports: 'supports' as const }

  it('accepts a number the passage states', () => {
    expect(validateDraft(draft({
      claim: 'All 6 members share セイ.',
      body: 'Across the 6 kanji, every one follows.',
      citations: [cite]
    }), counted).ok).toBe(true)
  })

  it('rEJECTS an inflated count even when the quote is verbatim', () => {
    // The dangerous case: the citation is genuine, the number is not, and a
    // wrong count does not look wrong to a reviewer skimming prose.
    const result = validateDraft(draft({
      claim: 'All 12 members share セイ.',
      body: 'Across the 12 kanji, every one follows.',
      citations: [cite]
    }), counted)
    expect(result.ok).toBe(false)
    expect(result.failures.some(f => f.includes('"12"'))).toBe(true)
  })

  it('rejects an invented percentage', () => {
    const result = validateDraft(draft({
      body: 'Roughly 80% of the series follows this reading.',
      citations: [cite]
    }), counted)
    expect(result.ok).toBe(false)
    expect(result.failures.some(f => f.includes('"80"'))).toBe(true)
  })

  it('does not object to prose with no numbers at all', () => {
    expect(validateDraft(draft({
      claim: 'Every member shares the reading.',
      body: 'The component predicts the reading throughout the series.',
      citations: [cite]
    }), counted).ok).toBe(true)
  })
})
