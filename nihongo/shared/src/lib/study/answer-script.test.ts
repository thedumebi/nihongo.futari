import { describe, expect, it } from 'vitest'

import { answerScriptFor, takesRomaji } from './answer-script.js'

function card(inputMode: string, graderCode: string, primary: string, accepted: string[] = [primary]) {
  return { inputMode, graderCode, answer: { primary, accepted } }
}

describe('answerScriptFor', () => {
  it('names romaji for a kana-romaji card', () => {
    expect(answerScriptFor(card('text', 'fuzzy-romaji', 'shi', ['shi', 'si']))).toBe('romaji')
  })

  it('names kana for a reading card, whatever the word is written in', () => {
    expect(answerScriptFor(card('text', 'exact-kana', 'たべる', ['たべる', '食べる']))).toBe('kana')
  })

  it('names katakana for a reading card whose word is katakana', () => {
    expect(answerScriptFor(card('text', 'exact-kana', 'テレビ'))).toBe('katakana')
  })

  it('names English when every accepted form is English', () => {
    expect(answerScriptFor(card('text', 'normalised-jp', 'to eat', ['to eat', 'eat']))).toBe('english')
  })

  it('names kanji when the fill-in only takes the kanji', () => {
    expect(answerScriptFor(card('text', 'normalised-jp', '車'))).toBe('kanji')
  })

  it('names hiragana when the fill-in only takes hiragana', () => {
    expect(answerScriptFor(card('text', 'normalised-jp', 'を'))).toBe('hiragana')
  })

  it('names Japanese for kanji with okurigana', () => {
    expect(answerScriptFor(card('text', 'normalised-jp', '食べて'))).toBe('japanese')
  })

  it('names Japanese when the fill-in takes either script', () => {
    expect(answerScriptFor(card('text', 'normalised-jp', '車', ['車', 'くるま']))).toBe('japanese')
  })

  it('names the way of answering for cards that are not typed', () => {
    expect(answerScriptFor(card('canvas', 'stroke-match', '日'))).toBe('write')
    expect(answerScriptFor(card('choice', 'choice-id', 'to eat'))).toBe('choose')
    expect(answerScriptFor(card('ordering', 'sequence', '私は学生です'))).toBe('order')
    expect(answerScriptFor(card('none', 'self-check', 'こんにちは'))).toBe('say')
  })
})

describe('takesRomaji', () => {
  it('is true only where romaji is read as kana', () => {
    expect(takesRomaji('kana')).toBe(true)
    expect(takesRomaji('hiragana')).toBe(true)
    expect(takesRomaji('kanji')).toBe(false)
    expect(takesRomaji('romaji')).toBe(false)
    expect(takesRomaji('english')).toBe(false)
  })
})
