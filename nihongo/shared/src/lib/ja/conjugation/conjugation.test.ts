import { describe, expect, it } from 'vitest'

import type { ConjugationForm, VerbClass } from './index.js'

import { classifyVerb, conjugate, conjugateAll, CONJUGATION_FORMS, isIAdjective } from './index.js'

/**
 * Known-answer tests against forms a textbook would print.
 *
 * A conjugation engine that is confidently wrong is worse than none — the
 * learner has no way to tell. So the coverage here is deliberately concrete:
 * one verb per godan row, both irregulars, and every documented exception.
 */

function form(surface: string, reading: string, verbClass: VerbClass, f: ConjugationForm) {
  return conjugate({ surface, reading, verbClass }, f)?.reading
}

describe('classifyVerb', () => {
  it('reads the JMdict codes', () => {
    expect(classifyVerb(['v5k'])).toBe('godan')
    expect(classifyVerb(['v1'])).toBe('ichidan')
    expect(classifyVerb(['vs-i'])).toBe('suru')
    expect(classifyVerb(['vk'])).toBe('kuru')
  })

  it('picks the irregulars out BEFORE the general godan rule', () => {
    // v5r-i is ある, v5k-s is 行く. Both match /^v5[a-z]/ too, so order matters.
    expect(classifyVerb(['v5r-i'])).toBe('aru')
    expect(classifyVerb(['v5k-s'])).toBe('godan')
  })

  it('ignores transitivity markers, which say nothing about conjugation', () => {
    expect(classifyVerb(['v5r', 'vt'])).toBe('godan')
    expect(classifyVerb(['v1', 'vi'])).toBe('ichidan')
  })

  it('returns null for a non-verb', () => {
    expect(classifyVerb(['n'])).toBeNull()
    expect(classifyVerb(['adj-i'])).toBeNull()
    expect(isIAdjective(['adj-i'])).toBe(true)
  })
})

describe('godan — one verb per row', () => {
  const cases: Array<[string, string, Partial<Record<ConjugationForm, string>>]> = [
    ['会う', 'あう', { masu: 'あいます', te: 'あって', ta: 'あった', nai: 'あわない', potential: 'あえる', volitional: 'あおう' }],
    ['書く', 'かく', { masu: 'かきます', te: 'かいて', ta: 'かいた', nai: 'かかない', potential: 'かける', volitional: 'かこう' }],
    ['泳ぐ', 'およぐ', { masu: 'およぎます', te: 'およいで', ta: 'およいだ', nai: 'およがない' }],
    ['話す', 'はなす', { masu: 'はなします', te: 'はなして', ta: 'はなした', nai: 'はなさない' }],
    ['待つ', 'まつ', { masu: 'まちます', te: 'まって', ta: 'まった', nai: 'またない' }],
    ['死ぬ', 'しぬ', { masu: 'しにます', te: 'しんで', ta: 'しんだ', nai: 'しなない' }],
    ['遊ぶ', 'あそぶ', { masu: 'あそびます', te: 'あそんで', ta: 'あそんだ', nai: 'あそばない' }],
    ['飲む', 'のむ', { masu: 'のみます', te: 'のんで', ta: 'のんだ', nai: 'のまない' }],
    ['取る', 'とる', { masu: 'とります', te: 'とって', ta: 'とった', nai: 'とらない' }]
  ]

  for (const [surface, reading, expected] of cases) {
    it(`conjugates ${surface}`, () => {
      for (const [f, want] of Object.entries(expected)) {
        expect(form(surface, reading, 'godan', f as ConjugationForm), `${surface} ${f}`).toBe(want)
      }
    })
  }

  it('uses わ, not あ, for the negative stem of う-verbs', () => {
    // A historical /w/ that survives only in this slot.
    expect(form('会う', 'あう', 'godan', 'nai')).toBe('あわない')
    expect(form('会う', 'あう', 'godan', 'passive')).toBe('あわれる')
  })

  it('keeps the kanji stem and changes only the okurigana', () => {
    expect(conjugate({ surface: '書く', reading: 'かく', verbClass: 'godan' }, 'te')?.surface).toBe('書いて')
    expect(conjugate({ surface: '飲む', reading: 'のむ', verbClass: 'godan' }, 'masu')?.surface).toBe('飲みます')
  })
})

describe('行く — the te-form exception', () => {
  it('takes って, not いて', () => {
    // The one case where a く-verb breaks the rule. Getting this wrong is the
    // classic engine bug.
    expect(form('行く', 'いく', 'godan', 'te')).toBe('いって')
    expect(form('行く', 'いく', 'godan', 'ta')).toBe('いった')
    expect(form('行く', 'いく', 'godan', 'conditional-tara')).toBe('いったら')
  })

  it('is otherwise an ordinary く-verb', () => {
    expect(form('行く', 'いく', 'godan', 'masu')).toBe('いきます')
    expect(form('行く', 'いく', 'godan', 'nai')).toBe('いかない')
  })

  it('does not contaminate other く-verbs', () => {
    expect(form('書く', 'かく', 'godan', 'te')).toBe('かいて')
  })
})

describe('ichidan', () => {
  it('drops る and appends', () => {
    expect(form('食べる', 'たべる', 'ichidan', 'masu')).toBe('たべます')
    expect(form('食べる', 'たべる', 'ichidan', 'te')).toBe('たべて')
    expect(form('食べる', 'たべる', 'ichidan', 'ta')).toBe('たべた')
    expect(form('食べる', 'たべる', 'ichidan', 'nai')).toBe('たべない')
    expect(form('食べる', 'たべる', 'ichidan', 'potential')).toBe('たべられる')
    expect(form('食べる', 'たべる', 'ichidan', 'volitional')).toBe('たべよう')
    expect(form('食べる', 'たべる', 'ichidan', 'imperative')).toBe('たべろ')
  })

  it('keeps the kanji stem', () => {
    expect(conjugate({ surface: '見る', reading: 'みる', verbClass: 'ichidan' }, 'masu')?.surface).toBe('見ます')
  })
})

describe('irregulars', () => {
  it('conjugates する', () => {
    expect(form('する', 'する', 'suru', 'masu')).toBe('します')
    expect(form('する', 'する', 'suru', 'te')).toBe('して')
    expect(form('する', 'する', 'suru', 'nai')).toBe('しない')
    expect(form('する', 'する', 'suru', 'potential')).toBe('できる')
  })

  it('conjugates a する compound, keeping the noun', () => {
    const r = conjugate({ surface: '勉強する', reading: 'べんきょうする', verbClass: 'suru' }, 'masu')
    expect(r?.surface).toBe('勉強します')
    expect(r?.reading).toBe('べんきょうします')
  })

  it('conjugates 来る, whose READING changes while the kanji does not', () => {
    const masu = conjugate({ surface: '来る', reading: 'くる', verbClass: 'kuru' }, 'masu')
    expect(masu?.surface).toBe('来ます')
    expect(masu?.reading).toBe('きます')

    const nai = conjugate({ surface: '来る', reading: 'くる', verbClass: 'kuru' }, 'nai')
    expect(nai?.surface).toBe('来ない')
    expect(nai?.reading).toBe('こない')
  })

  it('gives ある the negative ない, not あらない', () => {
    expect(form('ある', 'ある', 'aru', 'nai')).toBe('ない')
    expect(form('ある', 'ある', 'aru', 'nakatta')).toBe('なかった')
  })

  it('conjugates ある regularly everywhere else', () => {
    expect(form('ある', 'ある', 'aru', 'masu')).toBe('あります')
    expect(form('ある', 'ある', 'aru', 'te')).toBe('あって')
  })
})

describe('conjugateAll', () => {
  it('produces every form for a regular verb', () => {
    const all = conjugateAll({ surface: '書く', reading: 'かく', verbClass: 'godan' })
    expect(all).toHaveLength(CONJUGATION_FORMS.length)
    expect(new Set(all.map(c => c.form)).size).toBe(CONJUGATION_FORMS.length)
  })

  it('never returns an empty or unchanged-where-it-should-change form', () => {
    for (const c of conjugateAll({ surface: '食べる', reading: 'たべる', verbClass: 'ichidan' })) {
      expect(c.surface.length, c.form).toBeGreaterThan(0)
      expect(c.reading.length, c.form).toBeGreaterThan(0)
      if (c.form !== 'dictionary')
        expect(c.reading, c.form).not.toBe('たべる')
    }
  })

  it('is deterministic', () => {
    const a = conjugateAll({ surface: '飲む', reading: 'のむ', verbClass: 'godan' })
    const b = conjugateAll({ surface: '飲む', reading: 'のむ', verbClass: 'godan' })
    expect(b).toEqual(a)
  })
})

describe('bad input', () => {
  it('returns null rather than guessing', () => {
    expect(conjugate({ surface: '', reading: '', verbClass: 'godan' }, 'masu')).toBeNull()
    // Not an う-row ending, so no godan rule applies.
    expect(conjugate({ surface: 'ねこ', reading: 'ねこ', verbClass: 'godan' }, 'masu')).toBeNull()
    // Ichidan requires a final る.
    expect(conjugate({ surface: 'かく', reading: 'かく', verbClass: 'ichidan' }, 'masu')).toBeNull()
  })
})
