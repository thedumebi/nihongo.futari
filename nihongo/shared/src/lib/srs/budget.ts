import type { NewBudget } from '@/types/study.js'

/**
 * Today's new material: new WORDS, and extra cards of words already met.
 *
 * A word is several cards (meaning, reading, listening…). The limit used to
 * count cards, so "20 a day" meant twenty cards, some of them a second way to
 * practise a word met before. Now it counts words: the day's limit is that many
 * words never seen, and the other cards of words already met come beside them,
 * up to a multiple of it (Settings → Extra practice).
 *
 * "Learn 5 more anyway" adds five words, and the extras grow with them.
 */
export function newBudget(input: {
  /** Settings: new words a day. */
  dailyNewLimit: number
  /** Words granted past it today ("Learn 5 more anyway"). */
  moreNew: number
  /** Settings: extra practice as a multiple of new words. */
  extraPracticeMultiple: number
  /** Words the queue introduced today. */
  newWordsToday: number
  /** Every card the queue started today: each new word's first card, plus the extras. */
  newCardsToday: number
}): NewBudget {
  const wordsLimit = Math.max(0, input.dailyNewLimit + input.moreNew)
  const wordsToday = Math.max(0, input.newWordsToday)
  const extrasLimit = wordsLimit * Math.max(0, input.extraPracticeMultiple)
  // A new word's first card is not an extra; every other card started today is.
  const extrasToday = Math.max(0, input.newCardsToday - wordsToday)
  return {
    wordsLimit,
    wordsToday,
    wordsLeft: Math.max(0, wordsLimit - wordsToday),
    extrasLimit,
    extrasToday,
    extrasLeft: Math.max(0, extrasLimit - extrasToday)
  }
}
