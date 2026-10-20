import { describe, expect, it } from 'vitest'

import { duplicateGaps, gapFitsTokens, parseGap, particleQuestionProblems } from './particle-checks.js'

describe('parseGap', () => {
  it('finds the gap in code points and strips the brackets', () => {
    expect(parseGap('学校[で]勉強します。')).toEqual({ text: '学校で勉強します。', start: 2, end: 3, answer: 'で' })
  })

  it('refuses a sentence with no gap or two', () => {
    expect(parseGap('学校で勉強します。')).toBeNull()
    expect(parseGap('部屋[で]音楽[を]聞きます。')).toBeNull()
  })
})

describe('particleQuestionProblems', () => {
  it('passes a well-formed question', () => {
    expect(particleQuestionProblems({ s: '学校[で]勉強します。', wrong: ['を', 'が', 'へ'], why: 'で marks where the action happens.' })).toEqual([])
  })

  it('refuses a wrong option that is also right, or is the answer', () => {
    const problems = particleQuestionProblems({ s: '学校[に]行きます。', also: ['へ'], wrong: ['へ', 'に', 'を'], why: 'Where you go.' })
    expect(problems).toContain('へ is listed as both wrong and also right')
    expect(problems).toContain('the answer に is listed as wrong')
  })

  it('refuses options that are not particles, and dashes in the why', () => {
    const problems = particleQuestionProblems({ s: '猫[が]います。', wrong: ['を', 'だ', 'で'], why: 'が marks it — the subject.' })
    expect(problems).toContain('"だ" is not a game particle')
    expect(problems).toContain('uses a dash; write it with a comma, colon or full stop')
  })
})

describe('gapFitsTokens', () => {
  it('lets には lose its に, but not はい its は', () => {
    const niwa = parseGap('冬[に]は寒い。')!
    expect(gapFitsTokens(niwa, [{ surface: '冬', charStart: 0 }, { surface: 'には', charStart: 1 }, { surface: '寒い', charStart: 3 }])).toBe(true)
    const hai = parseGap('[は]い、そうです。')!
    expect(gapFitsTokens(hai, [{ surface: 'はい', charStart: 0 }])).toBe(false)
  })

  it('refuses a gap that starts inside a word', () => {
    const gap = parseGap('静か[に]話す。')!
    expect(gapFitsTokens(gap, [{ surface: '静かに', charStart: 0 }, { surface: '話す', charStart: 3 }])).toBe(false)
  })
})

describe('duplicateGaps', () => {
  it('reports the same gap authored in two sets', () => {
    const q = { s: '学校[で]勉強します。', wrong: ['を', 'が', 'へ'] as [string, string, string], why: 'Place of action.' }
    expect(duplicateGaps([{ point: 'de-location', questions: [q] }, { point: 'de-means', questions: [q] }]))
      .toEqual(['de-means: 学校[で]勉強します。 is already a question in de-location'])
  })
})
