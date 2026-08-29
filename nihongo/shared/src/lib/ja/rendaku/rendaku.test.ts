import { describe, expect, it } from 'vitest'

import { analyseRendaku, devoiceKana, hasVoicedObstruent, isVoiced } from './index.js'

describe('devoiceKana', () => {
  it('maps voiced kana back to their base', () => {
    expect(devoiceKana('び')).toBe('ひ')
    expect(devoiceKana('が')).toBe('か')
    expect(devoiceKana('ぢ')).toBe('ち')
  })

  it('treats handaku as derived from the h-row', () => {
    // ぱ comes from は too, so 日本 ほん -> ぽん is still rendaku's territory.
    expect(devoiceKana('ぽ')).toBe('ほ')
  })

  it('leaves an already-voiceless kana alone', () => {
    expect(devoiceKana('か')).toBe('か')
    expect(devoiceKana('ん')).toBe('ん')
  })
})

describe('hasVoicedObstruent', () => {
  it('finds a voiced obstruent anywhere in the element', () => {
    // Lyman's Law looks at the WHOLE element: かぜ blocks on its second mora.
    expect(hasVoicedObstruent('かぜ')).toBe(true)
    expect(hasVoicedObstruent('とかげ')).toBe(true)
  })

  it('is false for a fully voiceless element', () => {
    expect(hasVoicedObstruent('ひ')).toBe(false)
    expect(hasVoicedObstruent('やま')).toBe(false)
  })

  it('does NOT count ん as a voiced obstruent', () => {
    // ん is a nasal, not an obstruent, and does not block rendaku —
    // 本箱 (ほんばこ) voices despite the ん.
    expect(isVoiced('ん')).toBe(false)
    expect(hasVoicedObstruent('はこ')).toBe(false)
  })
})

describe('analyseRendaku', () => {
  it('recognises plain rendaku', () => {
    // 花火: 火 ひ -> び
    const r = analyseRendaku('び', 'ひ')
    expect(r.isRendaku).toBe(true)
    expect(r.lymanBlocks).toBe(false)
    expect(r.violatesLyman).toBe(false)
  })

  it('recognises an unchanged element as not rendaku', () => {
    expect(analyseRendaku('かぜ', 'かぜ').isRendaku).toBe(false)
  })

  it("reports Lyman's Law blocking", () => {
    // 山風 stays やまかぜ because かぜ already has ぜ.
    const r = analyseRendaku('かぜ', 'かぜ')
    expect(r.isRendaku).toBe(false)
    expect(r.lymanBlocks).toBe(true)
    expect(r.violatesLyman).toBe(false)
  })

  it('flags a real violation rather than hiding it', () => {
    // Voicing happening despite a voiced obstruent is genuinely attested.
    // Showing it keeps the rule honest instead of overselling it.
    const r = analyseRendaku('ぞえ', 'そえ')
    expect(r.isRendaku).toBe(true)
    expect(r.lymanBlocks).toBe(false)

    const violating = analyseRendaku('がぜ', 'かぜ')
    expect(violating.isRendaku).toBe(true)
    expect(violating.lymanBlocks).toBe(true)
    expect(violating.violatesLyman).toBe(true)
  })

  it('does not call a mid-word difference rendaku', () => {
    // Rendaku only ever touches the FIRST mora. A change elsewhere is a
    // different reading, not sequential voicing.
    expect(analyseRendaku('はだ', 'はた').isRendaku).toBe(false)
  })

  it('handles multi-mora elements', () => {
    // 手紙: 紙 かみ -> がみ
    const r = analyseRendaku('がみ', 'かみ')
    expect(r.isRendaku).toBe(true)
  })

  it('survives empty input', () => {
    expect(analyseRendaku('', '').isRendaku).toBe(false)
  })
})
