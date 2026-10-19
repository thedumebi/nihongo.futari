import { z } from '@hono/zod-openapi'

import type { Conjugated, VERB_FORM_INFO } from '@/lib/ja/conjugation/index.js'

import { DRILL_FORMS, VERB_CLASSES } from '@/lib/ja/conjugation/index.js'

import { wordPitchSchema } from './words.js'

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

/**
 * long-vowel, small-tsu, n — hear one of two words and pick it. pitch — two
 * words that differ only in pitch, shown as drawings (no audio: a synthetic
 * voice's pitch is not reliable enough to test by ear); pick the one with the
 * meaning asked.
 */
export const pairContrastSchema = z.enum(['long-vowel', 'small-tsu', 'n', 'pitch'])

export const listeningRoundSchema = z.object({
  contrast: pairContrastSchema,
  /** The word that is played. Null on a pitch round, which is read, not heard. */
  audio: z.string().nullable(),
  /** The two words of the pair; `answer` is the index of the one played (or asked for). */
  options: z.array(z.object({
    reading: z.string(),
    text: z.string(),
    meaning: z.string(),
    /** Pitch rounds only: the shape to tell the two apart by. */
    pitch: wordPitchSchema.optional()
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

// ============ Verb forms ============

/** A form the Verb forms game can ask for: the keys of `VERB_FORM_INFO`. */
export type DrillForm = keyof typeof VERB_FORM_INFO

export const drillFormSchema = z.enum(DRILL_FORMS as [DrillForm, ...DrillForm[]])

export const verbFormsGameVerbSchema = z.object({
  wordId: z.string(),
  surface: z.string(),
  reading: z.string(),
  verbClass: z.enum(VERB_CLASSES),
  meaning: z.string(),
  /** False for a verb added from the level because too few are known yet. */
  known: z.boolean(),
  /** Common dictionary spellings, so a typed 分かって counts for わかって. */
  spellings: z.array(z.object({ form: z.string(), reading: z.string() }))
}).openapi('VerbFormsGameVerb')
export type VerbFormsGameVerb = z.infer<typeof verbFormsGameVerbSchema>

export const verbFormsGameSchema = z.object({
  verbs: z.array(verbFormsGameVerbSchema),
  /** Every form, and whether the learner has learned the grammar that teaches it. */
  forms: z.array(z.object({
    form: drillFormSchema,
    unlocked: z.boolean(),
    /** The grammar point to learn first, for a locked form. */
    lesson: z.object({ slug: z.string(), title: z.string() }).nullable()
  }))
}).openapi('VerbFormsGame')
export type VerbFormsGame = z.infer<typeof verbFormsGameSchema>

/** One question, built on the device from a verb and a form. */
export interface VerbFormsRound {
  verb: VerbFormsGameVerb
  form: DrillForm
  answer: Conjugated
  /** Four readings to pick from, the answer among them. */
  options: string[]
  /** Every typed answer that counts: the spelling, the kana, the dictionary's other spellings. */
  accepted: string[]
  /** How the form is made from this verb, in one line. */
  rule: string
}
