import { describe, expect, it } from 'vitest'

import { gradeAnswer } from './index.js'

/**
 * The reported failure: ご飯を食べてテレビをみます was marked wrong against
 * ご飯を食べて、テレビを見ます。 — a mix of kanji and kana that the flat
 * `accepted` list cannot express, since it holds only all-kanji and all-kana.
 */
describe('dictation grading', () => {
  const answer = {
    primary: 'ご飯を食べて、テレビを見ます。',
    accepted: [
      'ご飯を食べて、テレビを見ます。',
      'ご飯を食べてテレビを見ます',
      'ごはんをたべて、テレビをみます。',
      'ごはんをたべてテレビをみます'
    ],
    tokens: [
      ['ご飯', 'ごはん'],
      ['を'],
      ['食べて', 'たべて'],
      ['、'],
      ['テレビ'],
      ['を'],
      ['見ます', 'みます'],
      ['。']
    ]
  }

  it('accepts the sentence exactly as written', () => {
    expect(gradeAnswer('normalised-jp', 'ご飯を食べて、テレビを見ます。', answer).correct).toBe(true)
  })

  it('accepts it written entirely in kana', () => {
    expect(gradeAnswer('normalised-jp', 'ごはんをたべて、テレビをみます。', answer).correct).toBe(true)
  })

  it('accepts a mix of kanji and kana — the reported failure', () => {
    expect(gradeAnswer('normalised-jp', 'ご飯を食べてテレビをみます', answer).correct).toBe(true)
  })

  it('accepts the other mix too', () => {
    expect(gradeAnswer('normalised-jp', 'ごはんをたべてテレビを見ます', answer).correct).toBe(true)
  })

  it('does not care about punctuation, which cannot be heard', () => {
    expect(gradeAnswer('normalised-jp', 'ご飯を食べて、テレビをみます', answer).correct).toBe(true)
    expect(gradeAnswer('normalised-jp', 'ご飯を食べてテレビを見ます。', answer).correct).toBe(true)
  })

  it('still rejects a genuinely wrong transcription', () => {
    // The first screenshot: たべって, with a doubled consonant that is not there.
    expect(gradeAnswer('normalised-jp', 'ご飯をたべっててれびをみます', answer).correct).toBe(false)
  })

  it('rejects a missing word', () => {
    expect(gradeAnswer('normalised-jp', 'ご飯を食べます', answer).correct).toBe(false)
  })

  it('rejects extra text on the end', () => {
    expect(gradeAnswer('normalised-jp', 'ご飯を食べてテレビをみますね', answer).correct).toBe(false)
  })

  it('falls back to the flat list when a prompt carries no tokens', () => {
    const legacy = { primary: answer.primary, accepted: answer.accepted }
    expect(gradeAnswer('normalised-jp', 'ごはんをたべてテレビをみます', legacy).correct).toBe(true)
    expect(gradeAnswer('normalised-jp', 'ご飯を食べてテレビをみます', legacy).correct).toBe(false)
  })
})
