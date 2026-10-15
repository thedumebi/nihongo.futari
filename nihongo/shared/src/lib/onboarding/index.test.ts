import { describe, expect, it } from 'vitest'

import { GUIDE_MAX, guideDone, guideFor, paceFor, placedLevel, studyLevelFor, suggestedFurigana } from './index.js'

describe('suggestedFurigana', () => {
  it('starts a beginner on romaji, a kana reader on hiragana, and anyone further on unknown-only', () => {
    expect(suggestedFurigana('new')).toBe('romaji')
    expect(suggestedFurigana('some-kana')).toBe('kana')
    expect(suggestedFurigana('kana')).toBe('kana')
    expect(suggestedFurigana('studied')).toBe('unknown-only')
  })
})

describe('paceFor', () => {
  it('turns minutes a day into new cards and session length', () => {
    expect(paceFor(5)).toEqual({ dailyNewLimit: 5, sessionLength: 10 })
    expect(paceFor(60)).toEqual({ dailyNewLimit: 25, sessionLength: 50 })
  })
})

describe('studyLevelFor', () => {
  it('uses the placed level only for someone who has studied before', () => {
    expect(studyLevelFor({ start: 'studied', level: 'N3' })).toBe('N3')
    expect(studyLevelFor({ start: 'kana', level: 'N3' })).toBe('N5')
    expect(studyLevelFor({ start: 'studied', level: null })).toBe('N5')
  })
})

describe('guideFor', () => {
  it('starts a beginner with the kana and ends with coming back tomorrow', () => {
    expect(guideFor({ start: 'new', goals: [] }).map(s => s.code)).toEqual(['kana', 'words', 'grammar', 'speak', 'review'])
  })

  it('adds what a goal needs before the last step, without repeating a step', () => {
    expect(guideFor({ start: 'kana', goals: ['travel', 'family'] }).map(s => s.code))
      .toEqual(['words', 'grammar', 'speak', 'conversation', 'story', 'review'])
  })

  it('never runs past the cap, and always keeps the review step last', () => {
    const steps = guideFor({ start: 'new', goals: ['travel', 'media', 'family', 'living'] })
    expect(steps).toHaveLength(GUIDE_MAX)
    expect(steps.at(-1)!.code).toBe('review')
  })
})

describe('placedLevel', () => {
  it('starts at the first level not passed', () => {
    expect(placedLevel({ N5: 4, N4: 3, N3: 1 })).toBe('N3')
    expect(placedLevel({ N5: 2 })).toBe('N5')
  })

  it('places someone who passes everything at N1', () => {
    expect(placedLevel({ N5: 4, N4: 4, N3: 4, N2: 3, N1: 3 })).toBe('N1')
  })
})

describe('guideDone', () => {
  const none = { activities: {}, words: 0, reviewDays: 0 }

  it('ticks steps off from what was actually done', () => {
    expect(guideDone('speak', { ...none, activities: { 'speak-listen': 1 } })).toBe(true)
    expect(guideDone('kana', { ...none, activities: { 'kana-lesson': 4 } })).toBe(false)
    expect(guideDone('kana', { ...none, activities: { 'kana-lesson': 5 } })).toBe(true)
    expect(guideDone('words', { ...none, words: 10 })).toBe(true)
  })

  it('counts coming back as a second day of reviews, not the first', () => {
    expect(guideDone('review', { ...none, reviewDays: 1 })).toBe(false)
    expect(guideDone('review', { ...none, reviewDays: 2 })).toBe(true)
  })
})
