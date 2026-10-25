import type { LessonFirst } from '@nihongo/shared/types'

import { useLocalStorage } from '@vueuse/core'

/**
 * Lesson first, then words: until a lesson is done today, today's new words
 * wait on it (the server says which lesson, as `lessonFirst`). "Learn words
 * anyway" opens them for the rest of that study day on this device, and only
 * that day: tomorrow the lesson comes first again.
 */
const anywayDay = useLocalStorage('go-words-anyway', '')

export function useLessonFirst() {
  /** Whether today's new words are open: no lesson waiting, or the learner chose to go on anyway today. */
  function wordsOpen(first: LessonFirst | null | undefined): boolean {
    return !first || anywayDay.value === first.day
  }

  function learnWordsAnyway(first: LessonFirst): void {
    anywayDay.value = first.day
  }

  return { wordsOpen, learnWordsAnyway }
}
