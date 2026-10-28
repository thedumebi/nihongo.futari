import { describe, expect, it } from 'vitest'

import { ambiguousPrompts, firstMora, RECALL_GAPS, recallGloss, recallSchedule, recallSteps } from './index.js'

describe('recallGloss', () => {
  it('takes the first meaning without its asides', () => {
    expect(recallGloss(['to drink', 'to gulp'])).toBe('to drink')
    expect(recallGloss(['station (train, bus)'])).toBe('station')
    expect(recallGloss(['', 'cat'])).toBe('cat')
  })

  it('leaves out suffixes, which cannot be said on their own', () => {
    expect(recallGloss(['-ness'])).toBe('')
    expect(recallGloss(['-like nature'])).toBe('')
  })
})

describe('recallSchedule', () => {
  it('asks every word 1 + gaps times', () => {
    const order = recallSchedule(5)
    for (let i = 0; i < 5; i++)
      expect(order.filter(x => x === i)).toHaveLength(1 + RECALL_GAPS.length)
  })

  it('keeps each gap while there are new words to put between the repeats', () => {
    const order = recallSchedule(20)
    // The first ten words are fully spaced: twenty new words cover every gap.
    for (let i = 0; i < 10; i++) {
      const at = order.flatMap((x, p) => x === i ? [p] : [])
      at.slice(1).forEach((p, round) => {
        expect(p - at[round]! - 1, `word ${i} round ${round}`).toBeGreaterThanOrEqual(RECALL_GAPS[round]!)
      })
    }
  })

  it('never asks the same word twice in a row, even at the end', () => {
    for (const n of [1, 2, 3, 6]) {
      const order = recallSchedule(n)
      const twice = order.some((x, p) => p > 0 && order[p - 1] === x)
      expect(twice, `${n} words`).toBe(n === 1)
    }
  })

  it('is the same every time', () => {
    expect(recallSchedule(6)).toEqual(recallSchedule(6))
    expect(recallSchedule(0)).toEqual([])
  })
})

describe('firstMora', () => {
  it('gives the first sound, joining a small kana to the one before', () => {
    expect(firstMora('ひとつ')).toBe('ひ')
    expect(firstMora('きょう')).toBe('きょ')
    expect(firstMora('シャツ')).toBe('シャ')
  })

  it('offers nothing a word cannot start on', () => {
    expect(firstMora('っと')).toBe('')
    expect(firstMora('')).toBe('')
  })
})

describe('ambiguousPrompts', () => {
  it('finds the English said for two different words, and only those', () => {
    expect(ambiguousPrompts([
      { word: '一', prompt: 'one' },
      { word: '一つ', prompt: 'One' },
      { word: '一つ', prompt: 'one' },
      { word: '猫', prompt: 'cat' }
    ])).toEqual(new Set(['one']))
  })
})

describe('recallSteps', () => {
  const session = {
    items: [
      { key: 'w1', kind: 'word' as const, prompt: 'one', promptAudio: ['en/one.mp3', 'ja/hi.mp3'], hint: 'ひ', also: [{ text: '一', reading: 'いち' }], text: '一つ', reading: 'ひとつ', answerAudio: 'ja/hitotsu.mp3' },
      { key: 'w2', kind: 'word' as const, prompt: 'cat', promptAudio: ['en/cat.mp3'], hint: null, also: [], text: '猫', reading: 'ねこ', answerAudio: 'ja/neko.mp3' }
    ],
    order: [0, 1, 0]
  }

  it('makes one prompt per asking, repeats included, tagging the repeats', () => {
    const { steps, tags } = recallSteps(session)
    expect(steps.map(s => s.text)).toEqual(['一つ', '猫', '一つ'])
    expect(steps.map(s => s.index)).toEqual([0, 1, 2])
    expect(tags).toEqual([null, null, 'again'])
    expect(steps[1]).toMatchObject({ kind: 'prompt', reading: 'ねこ', answerAudio: 'ja/neko.mp3' })
  })

  it('names the other words the English asks for, on every asking of the word', () => {
    expect(recallSteps(session).also).toEqual(['Also 一 (いち)', null, 'Also 一 (いち)'])
  })

  it('says the English, then the hint, each with its own clip', () => {
    const [first] = recallSteps(session).steps
    expect(first!.say).toEqual([
      { lang: 'en', text: 'one', audio: 'en/one.mp3' },
      { lang: 'en', text: '(starts with', audio: null },
      { lang: 'ja', text: 'ひ)', audio: 'ja/hi.mp3' }
    ])
  })
})
