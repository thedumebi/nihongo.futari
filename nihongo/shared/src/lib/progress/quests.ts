import type { ActivityKind } from '@/constants/endpoints.js'

/**
 * Daily quests: up to three small goals for the day, different each day.
 *
 * Chosen by a hash of the learner and the date, so they are the same all day
 * and on every device without being stored. Progress is a function of what
 * happened today — reviews and activities — never a counter, so it is safe to
 * recompute at any moment. They exist to nudge VARIETY: a day of nothing but
 * flashcards is the easy rut, and speaking and listening are what it skips.
 */
export interface QuestDef {
  code: string
  title: string
  target: number
  /** What counts: today's reviews, or activities of these kinds. */
  counts: 'reviews' | ActivityKind[]
}

export const QUEST_POOL: readonly QuestDef[] = [
  { code: 'reviews-20', title: 'Review 20 items', target: 20, counts: 'reviews' },
  { code: 'reviews-50', title: 'Review 50 items', target: 50, counts: 'reviews' },
  { code: 'speak-1', title: 'Do a Speak session', target: 1, counts: ['speak', 'speak-listen'] },
  { code: 'lesson-1', title: 'Finish a lesson', target: 1, counts: ['lesson', 'kana-lesson'] },
  { code: 'conversation-2', title: 'Practise two conversations', target: 2, counts: ['conversation'] },
  { code: 'reading-1', title: 'Read a speech aloud', target: 1, counts: ['reading'] },
  { code: 'crossword-1', title: 'Solve a crossword', target: 1, counts: ['crossword'] }
]

/** XP for finishing a quest — enough to notice, not enough to chase instead of learning. */
export const QUEST_XP = 15

function hash(text: string): number {
  let h = 2166136261
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Today's three quests: one review goal and two others, stable for the day. */
export function questsFor(userId: string, localDate: string): QuestDef[] {
  const reviews = QUEST_POOL.filter(q => q.counts === 'reviews')
  const others = QUEST_POOL.filter(q => q.counts !== 'reviews')
  const seed = hash(`${userId}|${localDate}`)
  const first = others[seed % others.length]!
  const rest = others.filter(q => q !== first)
  const second = rest[(seed >>> 8) % rest.length]!
  return [reviews[(seed >>> 16) % reviews.length]!, first, second]
}

export interface QuestProgress {
  code: string
  title: string
  target: number
  progress: number
  done: boolean
}

/** How far each quest has got, from today's review count and activities. */
export function questProgress(
  quests: readonly QuestDef[],
  today: { reviews: number, activities: ReadonlyArray<{ kind: ActivityKind }> }
): QuestProgress[] {
  return quests.map((q) => {
    const counted = q.counts === 'reviews'
      ? today.reviews
      : today.activities.filter(a => (q.counts as ActivityKind[]).includes(a.kind)).length
    return { code: q.code, title: q.title, target: q.target, progress: Math.min(counted, q.target), done: counted >= q.target }
  })
}
