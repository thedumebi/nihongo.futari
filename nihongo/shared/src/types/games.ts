import { z } from '@hono/zod-openapi'

/**
 * The games: short, grounded drills over real data. None of them writes a
 * review — they are practice beside the schedule, not answers to it. Each
 * finished game is recorded as an activity.
 */

export const gamesQuerySchema = z.object({
  languageCode: z.string().min(2).max(8).default('ja'),
  /** A JLPT level to draw from; every level the game supports when absent. */
  level: z.string().max(8).optional(),
  size: z.coerce.number().int().min(3).max(30).default(10)
})
export type GamesQuery = z.infer<typeof gamesQuerySchema>

// ============ Listening: minimal pairs ============

export const pairContrastSchema = z.enum(['long-vowel', 'small-tsu', 'n'])

export const listeningRoundSchema = z.object({
  contrast: pairContrastSchema,
  /** The word that is played. */
  audio: z.string(),
  /** The two words of the pair; `answer` is the index of the one played. */
  options: z.array(z.object({
    reading: z.string(),
    text: z.string(),
    meaning: z.string()
  })).length(2),
  answer: z.number().int().min(0).max(1)
}).openapi('ListeningRound')
export type ListeningRound = z.infer<typeof listeningRoundSchema>

export const listeningGameSchema = z.object({
  rounds: z.array(listeningRoundSchema)
}).openapi('ListeningGame')
export type ListeningGame = z.infer<typeof listeningGameSchema>

// ============ Build-a-kanji ============

export const kanjiBuildRoundSchema = z.discriminatedUnion('kind', [
  z.object({
    /** Pick the parts a kanji is built from, out of a few look-alike tiles. */
    kind: z.literal('assemble'),
    character: z.string(),
    meaning: z.string(),
    /** How the parts sit: ⿰ side by side, ⿱ stacked, … */
    layout: z.string(),
    parts: z.array(z.string()),
    tiles: z.array(z.string())
  }),
  z.object({
    /** Which reading does this kanji's sound part suggest? From a published phonetic series. */
    kind: z.literal('phonetic'),
    character: z.string(),
    meaning: z.string(),
    component: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
    /** The family's other members, shown after answering. */
    family: z.array(z.string()),
    /** Set when this member drifted from the family's reading. */
    follows: z.boolean()
  })
]).openapi('KanjiBuildRound')
export type KanjiBuildRound = z.infer<typeof kanjiBuildRoundSchema>

export const kanjiBuildGameSchema = z.object({
  rounds: z.array(kanjiBuildRoundSchema)
}).openapi('KanjiBuildGame')
export type KanjiBuildGame = z.infer<typeof kanjiBuildGameSchema>

// ============ Ghost boss ============

export const ghostBossEntrySchema = z.object({
  /** The study item behind the ghost card. */
  key: z.string(),
  kind: z.enum(['word', 'kanji']),
  text: z.string(),
  reading: z.string().nullable(),
  meaning: z.string(),
  /** For linking: the word's id, or the kanji itself. */
  ref: z.string(),
  /** The lead sourced explanation, when one is published. Never a mnemonic. */
  etymology: z.object({
    claim: z.string(),
    confidence: z.string(),
    isDisputed: z.boolean(),
    source: z.string().nullable()
  }).nullable(),
  lookAlikes: z.array(z.object({ character: z.string(), meaning: z.string() }))
}).openapi('GhostBossEntry')
export type GhostBossEntry = z.infer<typeof ghostBossEntrySchema>

export const ghostBossSchema = z.object({
  /** ISO week, e.g. 2026-W42 — the boss is weekly. */
  week: z.string(),
  ghosts: z.array(ghostBossEntrySchema),
  /**
   * Every ghost gets rounds: its meaning, its reading (when written in kanji),
   * and — where there are look-alikes — telling it from them.
   */
  rounds: z.array(z.object({
    kind: z.enum(['meaning', 'reading', 'look-alike']),
    /** The question, ready to show: "What does 一つ mean?" */
    question: z.string(),
    answer: z.string(),
    options: z.array(z.string())
  }))
}).openapi('GhostBoss')
export type GhostBoss = z.infer<typeof ghostBossSchema>
