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
  /** What counts: today's reviews, new words learned today, or activities of these kinds. */
  counts: 'reviews' | 'new' | ActivityKind[]
}

/** The everyday quests: not reviews, not games. */
const EVERYDAY: readonly QuestDef[] = [
  { code: 'speak-1', title: 'Do a Speak session', target: 1, counts: ['speak', 'speak-listen', 'story'] },
  { code: 'lesson-1', title: 'Finish a lesson', target: 1, counts: ['lesson', 'kana-lesson'] },
  { code: 'conversation-2', title: 'Practise two conversations', target: 2, counts: ['conversation'] },
  { code: 'reading-1', title: 'Read a speech aloud', target: 1, counts: ['reading'] },
  { code: 'new-5', title: 'Learn 5 new words', target: 5, counts: 'new' },
  { code: 'recall-1', title: 'Do a Recall session', target: 1, counts: ['recall'] },
  { code: 'shadowing-1', title: 'Shadow a conversation', target: 1, counts: ['shadowing'] },
  { code: 'story-1', title: 'Say a Speak story', target: 1, counts: ['story'] }
]

const REVIEW_QUESTS: readonly QuestDef[] = [
  { code: 'reviews-20', title: 'Review 20 items', target: 20, counts: 'reviews' },
  { code: 'reviews-50', title: 'Review 50 items', target: 50, counts: 'reviews' }
]

/**
 * One quest per game. A day has at most one of them: together they fill a
 * single place in the draw, so a game comes up about as often as the other
 * quests do, and which game rotates.
 */
export const GAME_QUESTS: readonly QuestDef[] = [
  { code: 'crossword-1', title: 'Solve a crossword', target: 1, counts: ['crossword'] },
  { code: 'listening-1', title: 'Play Listening', target: 1, counts: ['listening-game'] },
  { code: 'kanji-build-1', title: 'Play Build a kanji', target: 1, counts: ['kanji-build'] },
  { code: 'verb-forms-1', title: 'Play Verb forms', target: 1, counts: ['verb-forms'] },
  { code: 'particles-1', title: 'Play Particles', target: 1, counts: ['particles'] },
  { code: 'ghost-boss-1', title: 'Take on the ghost boss', target: 1, counts: ['ghost-boss'] }
]

/** The ghost boss is weekly and can be empty: offered only when it has ghosts. */
const GHOST_BOSS_QUEST = 'ghost-boss-1'

/**
 * Before the games had a quest each: one quest for most games and another for
 * the crossword, which could land on the same day. Days before
 * `GAME_QUESTS_FROM` keep that draw, so a deploy does not change a day's
 * quests halfway through it.
 */
const LEGACY_OTHERS: readonly QuestDef[] = [
  EVERYDAY[0]!,
  EVERYDAY[1]!,
  EVERYDAY[2]!,
  EVERYDAY[3]!,
  GAME_QUESTS[0]!,
  EVERYDAY[4]!,
  EVERYDAY[5]!,
  EVERYDAY[6]!,
  { code: 'game-1', title: 'Play a listening, kanji, verb or particle game', target: 1, counts: ['listening-game', 'kanji-build', 'verb-forms', 'particles'] },
  EVERYDAY[7]!
]
export const GAME_QUESTS_FROM = '2026-10-21'

/** Every quest that can be drawn today or later. */
export const QUEST_POOL: readonly QuestDef[] = [...REVIEW_QUESTS, ...EVERYDAY, ...GAME_QUESTS]

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

/** Fewer reviews than this on offer today, and the review quest makes way for another. */
export const REVIEW_QUEST_MIN = 5

/** Stands in the draw for "one of the games", resolved once drawn. */
const GAME_SLOT: QuestDef = { code: 'game', title: '', target: 1, counts: [] }

/**
 * Today's three quests: one review goal and two others, stable for the day,
 * at most one of them a game.
 *
 * `reviewsAvailable` is how many reviews today actually holds: done so far
 * plus still due before the day ends. A fixed "Review 50" on a day with 12
 * due could never be finished, so the target shrinks to what is there, and a
 * day with almost nothing due swaps the review goal for something else.
 *
 * `ghosts`: whether this week's ghost boss has anyone to fight.
 */
export function questsFor(userId: string, localDate: string, reviewsAvailable?: number, opts: { ghosts?: boolean } = {}): QuestDef[] {
  const seed = hash(`${userId}|${localDate}`)
  const legacy = localDate < GAME_QUESTS_FROM
  const others = legacy ? LEGACY_OTHERS : [...EVERYDAY, GAME_SLOT]
  const games = GAME_QUESTS.filter(q => opts.ghosts || q.code !== GHOST_BOSS_QUEST)
  const resolve = (q: QuestDef) => q === GAME_SLOT ? games[hash(`${userId}|${localDate}|game`) % games.length]! : q

  const first = others[seed % others.length]!
  const rest = others.filter(q => q !== first)
  const second = rest[(seed >>> 8) % rest.length]!
  let review = REVIEW_QUESTS[(seed >>> 16) % REVIEW_QUESTS.length]!
  if (reviewsAvailable !== undefined) {
    if (reviewsAvailable < REVIEW_QUEST_MIN) {
      const spare = rest.filter(q => q !== second)
      return [spare[(seed >>> 24) % spare.length]!, first, second].map(resolve)
    }
    if (reviewsAvailable < review.target) {
      const target = reviewsAvailable
      review = { ...review, title: `Review ${target} items`, target }
    }
  }
  return [review, resolve(first), resolve(second)]
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
  today: { reviews: number, newWords: number, activities: ReadonlyArray<{ kind: ActivityKind }> }
): QuestProgress[] {
  return quests.map((q) => {
    const counted = q.counts === 'reviews'
      ? today.reviews
      : q.counts === 'new'
        ? today.newWords
        : today.activities.filter(a => (q.counts as ActivityKind[]).includes(a.kind)).length
    return { code: q.code, title: q.title, target: q.target, progress: Math.min(counted, q.target), done: counted >= q.target }
  })
}
