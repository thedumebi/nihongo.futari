import { z } from '@hono/zod-openapi'

import type { CrosswordDirection } from '@/constants/endpoints.js'
import type { crosswordResults } from '@/db/schema/crossword.js'

import { CROSSWORD_DIRECTIONS, CROSSWORD_SCRIPTS, CROSSWORD_SOURCES } from '@/constants/endpoints.js'

import { wordGlossSchema } from './study.js'

/**
 * The kana crossword.
 *
 * The generator's own shapes are plain interfaces — it is pure code, never
 * validated at a boundary. The API's are Zod, and a puzzle's entries extend
 * `WordGloss`, so the meaning sheet takes one as it is.
 */

export type CrosswordResult = typeof crosswordResults.$inferSelect
export type NewCrosswordResult = typeof crosswordResults.$inferInsert

/** A word the generator may place. */
export interface CrosswordCandidate {
  /** `words.id`. */
  id: string
  /** One kana per cell, small kana full size — see `crosswordCells`. */
  cells: string[]
  /** Two entries in one puzzle never share a clue. */
  clue: string
}

/** A word as placed, numbered the way a printed crossword is. */
export interface CrosswordPlacement {
  id: string
  row: number
  col: number
  dir: CrosswordDirection
  length: number
  number: number
}

export interface CrosswordGrid {
  size: number
  /** Kana, or null for a blacked-out cell. */
  cells: Array<Array<string | null>>
  placements: CrosswordPlacement[]
  /** The hidden word: its kana's cells, in order (labelled A, B, C…). */
  bonus: { id: string, cells: Array<[number, number]> } | null
}

export interface CrosswordOptions {
  seed: number
  size?: number
  /** Seeded tries; the best-interlocked grid wins. */
  attempts?: number
  /** Fewer words than this is not a puzzle. */
  minWords?: number
  /** Two-kana words cross too easily to be interesting; cap them. */
  maxShortWords?: number
  /** Word ids to place only when nothing else fits — the ones played lately. */
  avoid?: Set<string>
  /** Word ids to place first when they fit — known words in a mixed puzzle. */
  prefer?: Set<string>
  /** Bonus word candidates in tiers; the first tier with a fit wins. */
  bonusCandidates?: CrosswordCandidate[][]
}

// ---------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------

export const crosswordQuerySchema = z.object({
  languageCode: z.string().min(2).default('ja'),
  /** `language_levels.code` — N5 … N1. */
  level: z.string().min(2).max(4),
  source: z.enum(CROSSWORD_SOURCES).default('daily')
})

export type CrosswordQuery = z.infer<typeof crosswordQuerySchema>

/** A word in the puzzle, as the meaning sheet and the finish screen need it. */
const crosswordWordSchema = wordGlossSchema.extend({
  /** The kana to type, one per cell, in the puzzle's script. */
  answer: z.array(z.string()),
  clue: z.string(),
  /** Where to hear it; null if no clip was made. */
  audio: z.string().nullable()
})

export const crosswordEntrySchema = crosswordWordSchema.extend({
  number: z.number().int(),
  direction: z.enum(CROSSWORD_DIRECTIONS),
  row: z.number().int(),
  col: z.number().int()
}).openapi('CrosswordEntry')

export type CrosswordEntry = z.infer<typeof crosswordEntrySchema>

export const crosswordBonusSchema = crosswordWordSchema.extend({
  /** [row, col] for A, B, C… in order. */
  cells: z.array(z.tuple([z.number().int(), z.number().int()]))
}).openapi('CrosswordBonus')

export type CrosswordBonus = z.infer<typeof crosswordBonusSchema>

export const crosswordPuzzleSchema = z.object({
  /** Names the grid actually sent, for resuming and for the result. */
  puzzleKey: z.string(),
  level: z.string(),
  /** What was asked for — or `mix` when "known" had to be topped up. */
  source: z.enum(CROSSWORD_SOURCES),
  script: z.enum(CROSSWORD_SCRIPTS),
  size: z.number().int(),
  /** The solution: kana, or null for a black cell. */
  cells: z.array(z.array(z.string().nullable())),
  entries: z.array(crosswordEntrySchema),
  bonus: crosswordBonusSchema.nullable(),
  /** How many known words at this level could go in a puzzle; null unless asked for known words. */
  knownCount: z.number().int().nullable(),
  /** Anything worth saying about how the puzzle was made — "topped up with new words". */
  note: z.string().nullable()
}).openapi('Crossword')

export type CrosswordPuzzle = z.infer<typeof crosswordPuzzleSchema>

export const crosswordResultInputSchema = z.object({
  puzzleKey: z.string().min(8).max(80),
  level: z.string().min(2).max(4),
  source: z.enum(CROSSWORD_SOURCES),
  /** Clamped server-side as well; a day is generous for a 5×5. */
  seconds: z.number().int().min(0).max(86_400),
  hintsUsed: z.number().int().min(0).max(100),
  wordIds: z.array(z.string()).max(30)
}).openapi('CrosswordResultInput')

export type CrosswordResultInput = z.infer<typeof crosswordResultInputSchema>

export const crosswordResultResponseSchema = z.object({
  bestSeconds: z.number().int(),
  lastSeconds: z.number().int(),
  /** True when this run beat (or set) the best time. */
  best: z.boolean()
}).openapi('CrosswordResultResponse')

export type CrosswordResultResponse = z.infer<typeof crosswordResultResponseSchema>
