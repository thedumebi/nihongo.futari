import { describe, expect, it } from 'vitest'

import { classifyPitch, countMorae, pitchShape } from './index.js'

describe('countMorae', () => {
  it('counts plain kana one to one', () => {
    expect(countMorae('みず')).toBe(2)
    expect(countMorae('たべる')).toBe(3)
  })

  it('treats yōon as a single mora', () => {
    // きょ is ONE mora. Counting characters would make きょう three and
    // misclassify every yōon word in the language.
    expect(countMorae('きょう')).toBe(2)
    expect(countMorae('とうきょう')).toBe(4)
    expect(countMorae('びょういん')).toBe(4)
  })

  it('counts っ, ん and ー as morae of their own', () => {
    expect(countMorae('きって')).toBe(3)
    expect(countMorae('にほん')).toBe(3)
    expect(countMorae('コーヒー')).toBe(4)
  })

  it('handles an empty reading', () => {
    expect(countMorae('')).toBe(0)
  })
})

describe('classifyPitch', () => {
  it('names the four patterns', () => {
    expect(classifyPitch(0, 3)).toBe('heiban')
    expect(classifyPitch(1, 3)).toBe('atamadaka')
    expect(classifyPitch(2, 3)).toBe('nakadaka')
    expect(classifyPitch(3, 3)).toBe('odaka')
  })

  it('classifies real words correctly', () => {
    // みず is heiban(0); やま is odaka(2); ねこ is atamadaka(1).
    expect(classifyPitch(0, countMorae('みず'))).toBe('heiban')
    expect(classifyPitch(2, countMorae('やま'))).toBe('odaka')
    expect(classifyPitch(1, countMorae('ねこ'))).toBe('atamadaka')
  })

  it('treats a position past the end as odaka rather than inventing a pattern', () => {
    expect(classifyPitch(5, 3)).toBe('odaka')
  })
})

describe('pitchShape', () => {
  it('is one entry per mora plus the following particle', () => {
    expect(pitchShape(0, 3)).toHaveLength(4)
  })

  it('draws heiban as low-high-high, staying high onto the particle', () => {
    expect(pitchShape(0, 3)).toEqual([false, true, true, true])
  })

  it('draws atamadaka as high then low', () => {
    expect(pitchShape(1, 3)).toEqual([true, false, false, false])
  })

  it('draws nakadaka with the drop in the middle', () => {
    expect(pitchShape(2, 3)).toEqual([false, true, false, false])
  })

  it('distinguishes odaka from heiban only on the particle', () => {
    // The two are identical across the word itself and differ only after it —
    // which is the entire reason the trailing entry exists.
    const odaka = pitchShape(3, 3)
    const heiban = pitchShape(0, 3)
    expect(odaka.slice(0, 3)).toEqual(heiban.slice(0, 3))
    expect(odaka[3]).toBe(false)
    expect(heiban[3]).toBe(true)
  })
})
