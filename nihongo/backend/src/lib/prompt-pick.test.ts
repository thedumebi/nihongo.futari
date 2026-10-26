import type { PromptContext, PromptOption } from '@nihongo/shared/types'

import { describe, expect, it } from 'vitest'

import { pickPrompt, promptOrderKey } from './prompt-pick.js'

function option(id: string, rules: Partial<PromptOption> = {}): PromptOption {
  return { id, facetId: 'f1', requiresGrammarPointId: null, firstExposureOnly: false, minState: null, maxReps: null, ...rules }
}

const base: PromptContext = { state: 2, reps: 5, knownGrammar: new Set(), missed: new Set(), salt: 'salt' }

/** Ids in the order the salt alone would pick them. */
function bySalt(ids: string[], salt = base.salt): string[] {
  return [...ids].sort((a, b) => promptOrderKey(a, salt) < promptOrderKey(b, salt) ? -1 : 1)
}

describe('promptOrderKey', () => {
  it('is the md5 hex of the id followed by the salt, as Postgres computes it', () => {
    expect(promptOrderKey('p1', 'abc')).toBe('b326753eb064ddd56301ba901ee4848c')
    expect(promptOrderKey('', '')).toBe('d41d8cd98f00b204e9800998ecf8427e')
  })
})

describe('pickPrompt', () => {
  it('returns null when the facet has no prompts', () => {
    expect(pickPrompt([], base)).toBeNull()
  })

  it('breaks ties by the salted hash, so the salt changes the pick', () => {
    const ids = ['a', 'b', 'c', 'd', 'e', 'f']
    const options = ids.map(id => option(id))
    expect(pickPrompt(options, base)).toBe(bySalt(ids)[0])
    const picks = new Set(['s1', 's2', 's3', 's4', 's5', 's6', 's7', 's8'].map(salt => pickPrompt(options, { ...base, salt })))
    expect(picks.size).toBeGreaterThan(1)
  })

  it('withholds a drill until its grammar is learned', () => {
    const options = [option('drill', { requiresGrammarPointId: 'te-form' })]
    expect(pickPrompt(options, base)).toBeNull()
    expect(pickPrompt(options, { ...base, knownGrammar: new Set(['te-form']) })).toBe('drill')
  })

  it('applies the kind\'s minimum state and maximum reps', () => {
    expect(pickPrompt([option('late', { minState: 2 })], { ...base, state: 1 })).toBeNull()
    expect(pickPrompt([option('late', { minState: 2 })], { ...base, state: 2 })).toBe('late')
    expect(pickPrompt([option('early', { maxReps: 3 })], { ...base, reps: 4 })).toBeNull()
    expect(pickPrompt([option('early', { maxReps: 3 })], { ...base, reps: 3 })).toBe('early')
  })

  it('puts the introduction first on first exposure and last afterwards, without dropping it', () => {
    const [first, second] = bySalt(['intro', 'drill'])
    // Whichever the salt prefers, the exposure rule decides.
    const options = [option(first!, { firstExposureOnly: first === 'intro' }), option(second!, { firstExposureOnly: second === 'intro' })]
    expect(pickPrompt(options, { ...base, state: 0 })).toBe('intro')
    expect(pickPrompt(options, { ...base, state: 2 })).toBe('drill')
    // The only prompt there is still shows.
    expect(pickPrompt([option('intro', { firstExposureOnly: true })], { ...base, state: 2 })).toBe('intro')
  })

  it('brings a question missed in its lesson back before anything else', () => {
    const options = [option('intro', { firstExposureOnly: true }), option('a'), option('b'), option('c')]
    for (const missed of ['a', 'b', 'c', 'intro'])
      expect(pickPrompt(options, { ...base, state: 0, missed: new Set([missed]) })).toBe(missed)
  })

  it('does not bring back a missed question the learner may not see yet', () => {
    const options = [option('locked', { requiresGrammarPointId: 'g' }), option('open')]
    expect(pickPrompt(options, { ...base, missed: new Set(['locked']) })).toBe('open')
  })
})
