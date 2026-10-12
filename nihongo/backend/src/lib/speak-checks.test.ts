import type { WordGloss } from '@nihongo/shared/types'

import { describe, expect, it } from 'vitest'

import type { AuthoredSpeakSession } from '@/pipeline/data/speak/types.js'

import { patternsBeforeTaught, speakWellFormed, tooManyNewWords } from './speak-checks.js'

function session(over: Partial<AuthoredSpeakSession> = {}): AuthoredSpeakSession {
  return {
    code: 'n5-01-desu',
    level: 'N5',
    number: 1,
    title: 'です',
    titleEn: 'It is',
    patterns: ['です'],
    steps: [
      { x: '"It is" is {です}.' },
      { q: 'How would you say "it is a book"?', t: '本です。', r: 'ほん です。' }
    ],
    ...over
  }
}

const w = (form: string, pos: string | null = 'noun'): WordGloss => ({ form, reading: form, meanings: [form], pos })

describe('speakWellFormed', () => {
  it('passes a complete session', () => {
    expect(speakWellFormed([session()])).toEqual([])
  })

  it('wants a session to open by explaining and to contain a prompt', () => {
    expect(speakWellFormed([session({ steps: [{ q: 'Say it', t: '本です。', r: 'ほん です。' }] })]))
      .toEqual(['n5-01-desu: must open with the teacher explaining, not a prompt'])
    expect(speakWellFormed([session({ steps: [{ x: 'Hello.' }] })]))
      .toEqual(['n5-01-desu: no prompts — nothing to say'])
  })

  it('refuses unbalanced braces and kanji in a reading', () => {
    expect(speakWellFormed([session({
      steps: [{ x: '"It is" is {です.' }, { q: 'Say "book"', t: '本', r: '本' }]
    })])).toEqual([
      'n5-01-desu step 0: unbalanced {braces} in ""It is" is {です."',
      'n5-01-desu step 1: reading contains kanji — "本"'
    ])
  })

  it('refuses braces in a note, which is shown but never spoken', () => {
    expect(speakWellFormed([session({
      steps: [{ x: 'Hi.' }, { q: 'Say "book"', t: '本です。', r: 'ほん です。', n: 'Not {あなた}.' }]
    })])).toEqual(['n5-01-desu step 1: a note is shown as written — no {braces}'])
  })

  it('wants session numbers to run without gaps', () => {
    expect(speakWellFormed([session(), session({ code: 'n5-03-x', number: 3 })]))
      .toEqual(['N5: session numbers must run 1, 2, 3 … without gaps (found 1, 3)'])
  })

  it('refuses a one-character pattern', () => {
    expect(speakWellFormed([session({ patterns: ['は'] })]))
      .toEqual(['n5-01-desu: pattern "は" is too short to look for safely'])
  })
})

describe('patternsBeforeTaught', () => {
  it('reports a prompt that uses a pattern a later session teaches', () => {
    const first = session({ steps: [{ x: 'Hi.' }, { q: 'Say "I did not eat"', t: '食べませんでした。', r: 'たべませんでした。' }] })
    const later = session({ code: 'n5-02-past', number: 2, patterns: ['ませんでした'] })
    expect(patternsBeforeTaught([first, later]))
      .toEqual(['n5-01-desu step 1 「食べませんでした。」 uses 「ませんでした」 before the session that teaches it'])
  })

  it('allows a pattern from the same or an earlier session', () => {
    const first = session()
    const later = session({ code: 'n5-02-x', number: 2, patterns: ['ません'], steps: [{ x: 'Hi.' }, { q: 'Say it', t: '本です。', r: 'ほん です。' }] })
    expect(patternsBeforeTaught([first, later])).toEqual([])
  })
})

describe('tooManyNewWords', () => {
  it('flags a prompt that adds more than two words at once', () => {
    expect(tooManyNewWords([
      { index: 1, tokens: [{ t: '本', w: w('本') }, { t: 'です', w: w('です', 'grammar') }] },
      { index: 2, tokens: [{ t: '赤い', w: w('赤い') }, { t: '大きい', w: w('大きい') }, { t: '新しい', w: w('新しい') }, { t: '本', w: w('本') }] }
    ])).toEqual([{ index: 2, added: ['赤い', '大きい', '新しい'] }])
  })

  it('does not count particles or punctuation, or words the teacher already said', () => {
    expect(tooManyNewWords([
      { index: 1, tokens: [{ t: '本', w: w('本') }], said: [{ t: 'です', w: w('です', 'grammar') }] },
      { index: 2, tokens: [{ t: '本', w: w('本') }, { t: 'を', w: w('を', 'particle') }, { t: '読みます', w: w('読む') }, { t: '。' }] }
    ])).toEqual([])
  })

  it('lets the first prompt of a session introduce what it needs', () => {
    expect(tooManyNewWords([
      { index: 1, tokens: [{ t: '赤い', w: w('赤い') }, { t: '大きい', w: w('大きい') }, { t: '新しい', w: w('新しい') }] }
    ])).toEqual([])
  })
})
