import { describe, expect, it } from 'vitest'

import { audioKeyFor, englishVoiceFor, VOICES_ENGLISH } from './audio-key.js'

describe('englishVoiceFor', () => {
  it('alternates the teacher by session, Zoe on odd sessions and Nathan on even', () => {
    expect([1, 2, 3, 4, 19, 20].map(englishVoiceFor)).toEqual([
      'Zoe (Premium)',
      'Nathan (Enhanced)',
      'Zoe (Premium)',
      'Nathan (Enhanced)',
      'Zoe (Premium)',
      'Nathan (Enhanced)'
    ])
  })

  it('gives the same line a different clip in each voice', () => {
    const [zoe, nathan] = VOICES_ENGLISH
    expect(audioKeyFor('How would you say "This is a book"?', zoe)).not.toBe(audioKeyFor('How would you say "This is a book"?', nathan))
  })
})
