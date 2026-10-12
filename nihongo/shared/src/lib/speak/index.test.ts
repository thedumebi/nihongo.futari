import { describe, expect, it } from 'vitest'

import { moraCount, speakBracesBalanced, speakPlainText, speakSegments, thinkingTimeMs } from './index.js'

describe('speakSegments', () => {
  it('cuts a line into English and Japanese runs in order', () => {
    expect(speakSegments('"Is" is {です}, and "is not" is {じゃありません}.')).toEqual([
      { lang: 'en', text: '"Is" is' },
      { lang: 'ja', text: 'です' },
      { lang: 'en', text: ', and "is not" is' },
      { lang: 'ja', text: 'じゃありません' },
      { lang: 'en', text: '.' }
    ])
  })

  it('returns a single English run for a line with no Japanese', () => {
    expect(speakSegments('How would you say "I eat"?')).toEqual([{ lang: 'en', text: 'How would you say "I eat"?' }])
  })

  it('drops empty runs', () => {
    expect(speakSegments('{です}')).toEqual([{ lang: 'ja', text: 'です' }])
  })
})

describe('speakPlainText', () => {
  it('removes the braces', () => {
    expect(speakPlainText('"Is" is {です}.')).toBe('"Is" is です .')
  })
})

describe('speakBracesBalanced', () => {
  it('accepts closed, unnested braces', () => {
    expect(speakBracesBalanced('{です} and {ます}')).toBe(true)
  })

  it('refuses an unclosed or nested brace', () => {
    expect(speakBracesBalanced('{です and')).toBe(false)
    expect(speakBracesBalanced('{a {b}}')).toBe(false)
    expect(speakBracesBalanced('です}')).toBe(false)
  })
})

describe('moraCount', () => {
  it('counts each kana as a beat, small kana sharing the one before', () => {
    expect(moraCount('きょう わ')).toBe(3)
    expect(moraCount('がっこう')).toBe(4)
    expect(moraCount('コーヒー')).toBe(4)
  })

  it('ignores spaces and punctuation', () => {
    expect(moraCount('はい、 そう です。')).toBe(6)
  })
})

describe('thinkingTimeMs', () => {
  it('grows with the answer and scales with the setting', () => {
    expect(thinkingTimeMs('たべます')).toBe(3700)
    expect(thinkingTimeMs('たべます', 1.5)).toBe(5550)
  })
})
