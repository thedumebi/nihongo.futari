import { beforeEach, describe, expect, it } from 'vitest'

import { useLessonFirst } from './use-lesson-first'

const lesson = (day: string) => ({ level: 'N5', slug: 'kana-hiragana-a', title: 'Hiragana あ row', day })

describe('lesson first, then words', () => {
  beforeEach(() => localStorage.clear())

  it('opens words when no lesson is waiting', () => {
    expect(useLessonFirst().wordsOpen(null)).toBe(true)
  })

  it('keeps words waiting on today\'s lesson until the learner goes on anyway', () => {
    const { wordsOpen, learnWordsAnyway } = useLessonFirst()
    expect(wordsOpen(lesson('2026-10-25'))).toBe(false)
    learnWordsAnyway(lesson('2026-10-25'))
    expect(wordsOpen(lesson('2026-10-25'))).toBe(true)
  })

  it('"anyway" lasts one study day: the next day the lesson comes first again', () => {
    const { wordsOpen, learnWordsAnyway } = useLessonFirst()
    learnWordsAnyway(lesson('2026-10-25'))
    expect(wordsOpen(lesson('2026-10-26'))).toBe(false)
  })
})
