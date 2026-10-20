/**
 * The day's review goal, fixed for the whole study day.
 *
 * It counts the reviews that were waiting when the day began: cards in
 * review or relearning, due before the day ends. Worked out from the review
 * log, which records each card's state and due date before every answer, so
 * it reads the same at breakfast and at bedtime. What happens during the day
 * leaves it alone: a missed card coming back in ten minutes, words learned
 * today coming due tonight, a card added by a Speak miss.
 *
 * Progress is how many of those cards have been reviewed today, each once.
 * Repeats of a missed card and first looks at new words are not reviews owed.
 */
export interface ReviewGoalCard {
  /** The card's state and due date now. */
  state: number
  due: Date
  /** When the card was made: one made today was not waiting at the start. */
  createdAt: Date
  /** The first answer today, if any: the card as it stood before it. */
  firstToday: { stateBefore: number | null, dueBefore: Date | null } | null
}

/** States a card is reviewed from: learning, review, relearning. New (0) is not a review owed. */
const REVIEWABLE = new Set([1, 2, 3])

export function reviewGoal(cards: readonly ReviewGoalCard[], day: { start: Date, end: Date }): { available: number, reviewed: number } {
  let available = 0
  let reviewed = 0
  for (const card of cards) {
    if (card.createdAt >= day.start)
      continue
    const before = card.firstToday
      ? { state: card.firstToday.stateBefore, due: card.firstToday.dueBefore }
      : { state: card.state, due: card.due }
    if (before.state === null || before.due === null || !REVIEWABLE.has(before.state) || before.due >= day.end)
      continue
    available++
    if (card.firstToday)
      reviewed++
  }
  return { available, reviewed }
}
