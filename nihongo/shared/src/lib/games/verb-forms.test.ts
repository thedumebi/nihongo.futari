import { describe, expect, it } from 'vitest'

import type { VerbFormsGameVerb } from '@/types/games.js'

import { gradeAnswer } from '../grading/index.js'
import { DRILL_FORMS, VERB_FORM_INFO } from '../ja/conjugation/index.js'
import { buildVerbFormRounds, verbFormAccepted, verbFormDistractors, verbFormRule } from './verb-forms.js'

function verb(surface: string, reading: string, verbClass: VerbFormsGameVerb['verbClass'], extra: Partial<VerbFormsGameVerb> = {}): VerbFormsGameVerb {
  return { wordId: surface, surface, reading, verbClass, meaning: 'to do', known: true, spellings: [{ form: surface, reading }], ...extra }
}

/** A fixed sequence, so a shuffle is the same every run. */
function seeded(seed = 1): () => number {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
}

const 書く = verb('書く', 'かく', 'godan')
const 帰る = verb('帰る', 'かえる', 'godan')
const 食べる = verb('食べる', 'たべる', 'ichidan')
const 来る = verb('来る', 'くる', 'kuru')
const 行く = verb('行く', 'いく', 'godan')
const ある = verb('ある', 'ある', 'aru')

describe('verbFormDistractors', () => {
  it('offers the mistakes learners make, never the answer', () => {
    const wrong = verbFormDistractors(帰る, 'te')
    expect(wrong).toHaveLength(3)
    expect(wrong).toContain('かえて') // as if ichidan
    expect(wrong).not.toContain('かえって')
  })

  it('gives a godan te-form another sound change', () => {
    expect(verbFormDistractors(書く, 'te')).toContain('かって')
  })

  it('gives a ます form the wrong vowel', () => {
    const wrong = verbFormDistractors(書く, 'masu')
    expect(wrong).not.toContain('かきます')
    expect(wrong.some(w => /^か[かけこく]ます$/.test(w))).toBe(true)
  })

  it('treats 行く as an ordinary く-verb for its trap', () => {
    expect(verbFormDistractors(行く, 'te')).toContain('いいて')
  })

  it('regularises the irregulars for theirs', () => {
    expect(verbFormDistractors(来る, 'nai')).toContain('くない')
    expect(verbFormDistractors(ある, 'nai')).toContain('あらない')
    // No wrong vowel on a stem ない does not have.
    expect(verbFormDistractors(ある, 'nai')).not.toContain('なら')
  })

  it('always has three for every verb type and every form it can take', () => {
    for (const v of [書く, 帰る, 食べる, 来る, 行く, ある, verb('勉強する', 'べんきょうする', 'suru')]) {
      for (const f of DRILL_FORMS) {
        const wrong = verbFormDistractors(v, f)
        if (wrong.length === 0)
          continue // a form the verb does not take (ある has no たい)
        expect(new Set(wrong).size, `${v.surface} ${f}`).toBe(3)
      }
    }
  })
})

describe('verbFormRule', () => {
  it('says what changes, by verb group', () => {
    expect(verbFormRule(書く, 'te')).toBe('Godan verb: く becomes いて.')
    expect(verbFormRule(食べる, 'tai')).toBe('Ichidan verb: drop る, add たい.')
    expect(verbFormRule(verb('勉強する', 'べんきょうする', 'suru'), 'potential')).toBe('する verb: する becomes できる.')
    expect(verbFormRule(来る, 'nai')).toBe('くる is irregular: くる becomes こない.')
  })

  it('names the exceptions', () => {
    expect(verbFormRule(行く, 'ta')).toContain('行く is the one exception')
    expect(verbFormRule(ある, 'nai')).toContain('ある is irregular in the negative')
  })
})

describe('typed answers', () => {
  const 分かる = verb('分かる', 'わかる', 'godan', { spellings: [{ form: '分かる', reading: 'わかる' }, { form: '判る', reading: 'わかる' }] })

  it('accept kanji, kana, the dictionary\'s other spellings and romaji', () => {
    const accepted = verbFormAccepted(分かる, { surface: '分かって', reading: 'わかって' })
    expect(accepted).toEqual(expect.arrayContaining(['分かって', 'わかって', '判って']))
    const answer = { primary: '分かって', accepted }
    for (const typed of ['分かって', 'わかって', 'wakatte', 'ワカッテ'])
      expect(gradeAnswer('normalised-jp', typed, answer).correct, typed).toBe(true)
    expect(gradeAnswer('normalised-jp', 'wakaite', answer).correct).toBe(false)
  })
})

describe('buildVerbFormRounds', () => {
  const verbs = [書く, 帰る, 食べる, 来る, 行く, ある]

  it('asks each chosen form in turn, on verbs that can take it', () => {
    const rounds = buildVerbFormRounds(verbs, ['te', 'tai'], 10, seeded())
    expect(rounds).toHaveLength(10)
    expect(rounds.filter(r => r.form === 'te')).toHaveLength(5)
    expect(rounds.some(r => r.form === 'tai' && r.verb.verbClass === 'aru')).toBe(false)
  })

  it('never asks the same verb twice running', () => {
    const rounds = buildVerbFormRounds(verbs, ['masu'], 15, seeded(7))
    for (let i = 1; i < rounds.length; i++)
      expect(rounds[i]!.verb.wordId).not.toBe(rounds[i - 1]!.verb.wordId)
  })

  it('puts the answer among four options', () => {
    for (const r of buildVerbFormRounds(verbs, DRILL_FORMS, 30, seeded(3))) {
      expect(r.options).toHaveLength(4)
      expect(r.options).toContain(r.answer.reading)
    }
  })

  it('uses known verbs before the level\'s top-up', () => {
    const unknown = verb('泳ぐ', 'およぐ', 'godan', { known: false })
    const rounds = buildVerbFormRounds([unknown, 書く, 食べる], ['masu'], 2, seeded())
    expect(rounds.map(r => r.verb.wordId).sort()).toEqual(['書く', '食べる'])
  })
})

describe('form descriptions', () => {
  it('name a grammar point for every form the game can ask', () => {
    for (const f of DRILL_FORMS)
      expect(VERB_FORM_INFO[f].grammar.length, f).toBeGreaterThan(0)
  })
})
