import { describe, expect, it } from 'vitest'

import { ART_DIRECTION, ASPECT_RATIO, NEGATIVE_PROMPT } from './art-direction.js'
import { buildGrammarImagePrompt, buildVocabImagePrompt } from './prompts.js'

describe('image prompts', () => {
  const vocab = buildVocabImagePrompt({ word: '家', gloss: 'house' }).combined
  const grammar = buildGrammarImagePrompt({ meaning: 'must do something', situation: 'someone hurrying to catch a train' }).combined

  it('exposes the negative prompt separately for providers that take one', () => {
    // FLUX and SD weight a real negative_prompt field far more heavily than the
    // same words buried in the positive text; OpenAI has no such field at all.
    const split = buildVocabImagePrompt({ word: '家', gloss: 'house' })
    expect(split.negativePrompt).toContain('No gradients.')
    expect(split.prompt).not.toContain('No gradients.')
    expect(split.combined).toContain('No gradients.')
    expect(split.aspectRatio).toBe(ASPECT_RATIO)
  })

  it('is square, not the poster ratio', () => {
    expect(vocab).toContain(ASPECT_RATIO)
    expect(vocab).not.toContain('3:4')
  })

  it('carries the full art direction in both kinds', () => {
    for (const line of ART_DIRECTION) {
      expect(vocab, line).toContain(line)
      expect(grammar, line).toContain(line)
    }
  })

  it('carries every negative rule', () => {
    for (const rule of NEGATIVE_PROMPT) expect(vocab, rule).toContain(rule)
  })

  it('bans text — the app draws the word, not the generator', () => {
    // The single most likely defect: a generator helpfully lettering 家 into the
    // artwork, where it cannot be styled, translated or given furigana.
    expect(vocab).toContain('No text.')
    expect(vocab).toContain('No kanji.')
    expect(vocab.toLowerCase()).toContain('no text of any kind')
  })

  it('never puts the Japanese word itself in the prompt body', () => {
    // Naming the character invites the generator to draw it.
    expect(vocab).not.toContain('家')
  })

  it('asks for cultural specificity rather than a Western default', () => {
    expect(vocab).toContain('as it would appear in Japan')
  })

  it('keeps the powder-blue palette and the dusty rose accent rule', () => {
    expect(vocab).toContain('pale powder blue')
    expect(vocab).toContain('dusty rose')
    expect(vocab).toContain('only for tiny visual accents')
  })

  it('bans gradients, shadows and texture', () => {
    for (const rule of ['No gradients.', 'No heavy shadows.', 'No paper texture.']) {
      expect(vocab, rule).toContain(rule)
    }
  })

  it('asks a vocabulary card for one object and a grammar card for a scene', () => {
    expect(vocab).toContain('One object, one concept')
    expect(grammar).toContain('small, quiet everyday scene')
    expect(grammar).toContain('At most two small-scale figures')
  })

  it('includes an optional grounding note only when given', () => {
    const note = 'A Japanese-style house with a tiled roof, not a Western one.'
    expect(buildVocabImagePrompt({ word: '家', gloss: 'house', note }).combined).toContain(note)
    expect(vocab).not.toContain('tiled roof')
  })
})
