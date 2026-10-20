import { z } from '@hono/zod-openapi'

import type { Conjugated, VERB_FORM_INFO } from '@/lib/ja/conjugation/index.js'

import { DRILL_FORMS, VERB_CLASSES } from '@/lib/ja/conjugation/index.js'

import { furiganaSegmentSchema } from './sentences.js'
import { glossedTokenSchema } from './study.js'
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

/** What a ghost can be: the kinds the boss knows how to ask about. */
export const GHOST_KINDS = ['word', 'kanji', 'grammar', 'kana'] as const

export const ghostBossEntrySchema = z.object({
  /** The study item behind the ghost card. */
  key: z.string(),
  kind: z.enum(GHOST_KINDS),
  /** The side of it that keeps slipping: meaning, reading, production, listening, writing or usage. */
  facet: z.string(),
  /** A ghost, or nearly one: answered Again or Hard at least twice in two weeks. */
  status: z.enum(['ghost', 'nearly']),
  text: z.string(),
  reading: z.string().nullable(),
  meaning: z.string(),
  /** For linking: the word's id, the kanji itself, the grammar point's slug; empty for kana. */
  ref: z.string(),
  /** The lead sourced explanation, when one is published. Never a mnemonic. */
  etymology: z.object({
    claim: z.string(),
    confidence: z.string(),
    isDisputed: z.boolean(),
    source: z.string().nullable()
  }).nullable(),
  /** Look-alikes: kanji with their meanings, kana with their readings. */
  lookAlikes: z.array(z.object({ character: z.string(), meaning: z.string() })),
  /** Grammar only: how it is formed, and one example from its lesson. */
  grammar: z.object({
    pattern: z.string().nullable(),
    example: z.object({ text: z.string(), translation: z.string().nullable() }).nullable()
  }).nullable()
}).openapi('GhostBossEntry')
export type GhostBossEntry = z.infer<typeof ghostBossEntrySchema>

export const GHOST_ROUND_KINDS = ['meaning', 'reading', 'production', 'listening', 'look-alike', 'pattern', 'pattern-reverse', 'kana-reading', 'kana-writing'] as const

export const ghostRoundSchema = z.object({
  /** The ghost this round is about (its `key`). */
  ghost: z.string(),
  kind: z.enum(GHOST_ROUND_KINDS),
  /** The question, ready to show: "What does 一つ mean?" */
  question: z.string(),
  answer: z.string(),
  options: z.array(z.string()),
  /** Whether the options are Japanese, set in the Japanese face, or English. */
  script: z.enum(['ja', 'en']),
  /** A listening round's clip. */
  audio: z.string().nullable()
}).openapi('GhostRound')
export type GhostRound = z.infer<typeof ghostRoundSchema>

export const ghostBossSchema = z.object({
  /** ISO week, e.g. 2026-W42: the boss is weekly. */
  week: z.string(),
  ghosts: z.array(ghostBossEntrySchema),
  /**
   * Two rounds per ghost: the side that keeps slipping first, then one other.
   * The page brings a missed round back once at the end.
   */
  rounds: z.array(ghostRoundSchema)
}).openapi('GhostBoss')
export type GhostBoss = z.infer<typeof ghostBossSchema>

/**
 * A ghost as the round builder needs it: the entry, plus what its questions
 * are made from. Built on the server from the database; never sent.
 */
export interface GhostSubject {
  entry: GhostBossEntry
  /** Word: its recording, for a listening round. */
  audio?: string | null
  /** Kanji: its readings, on in katakana and kun in hiragana as stored. */
  kanjiReadings?: string[]
  /** Word or kanji: the same spelling with one kanji swapped for a look-alike. */
  misspellings?: string[]
  /** Grammar: its reviewed meaning question, and the patterns behind the wrong meanings. */
  meaningQuestion?: { answer: string, wrong: Array<{ meaning: string, title: string | null }> }
  /** Kana: its script, for picking look-alikes from the same one. */
  script?: 'hiragana' | 'katakana'
}

/** What wrong answers are drawn from. */
export interface GhostPools {
  /** Common N5 and N4 words. */
  words: Array<{ text: string, reading: string, meaning: string }>
  /** Every kana with its reading. */
  kana: Array<{ character: string, romaji: string, script: 'hiragana' | 'katakana' }>
}

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

// ============ Particles ============

/** One question: a published sentence with its particle taken out. */
export const particleQuestionSchema = z.object({
  id: z.string(),
  /** Two gaps in one sentence are two questions; a game asks the sentence once. */
  sentenceId: z.string(),
  /** The sentence either side of the gap, as written. */
  before: z.string(),
  after: z.string(),
  /** Each half cut into tappable words, with readings for the reader's furigana. */
  beforeTokens: z.array(glossedTokenSchema),
  afterTokens: z.array(glossedTokenSchema),
  beforeSegments: z.array(furiganaSegmentSchema),
  afterSegments: z.array(furiganaSegmentSchema),
  answer: z.string(),
  /** Three particles that are wrong in this sentence; never one that would also do. */
  wrong: z.array(z.string()).length(3),
  /** Why the answer, in one line. */
  note: z.string(),
  translation: z.string().nullable(),
  /** The whole sentence spoken, played once it is answered. */
  audio: z.string().nullable(),
  /** The lesson that teaches this use of the particle. */
  lesson: z.object({ slug: z.string(), title: z.string() }),
  /** How much of the sentence's vocabulary the learner knows, 0 to 1. Familiar sentences come first. */
  familiar: z.number().min(0).max(1)
}).openapi('ParticleQuestion')
export type ParticleQuestion = z.infer<typeof particleQuestionSchema>

export const particlesGameSchema = z.object({
  questions: z.array(particleQuestionSchema)
}).openapi('ParticlesGame')
export type ParticlesGame = z.infer<typeof particlesGameSchema>

/** One question as asked: the four boxes, in the order shown. */
export interface ParticlesRound {
  question: ParticleQuestion
  options: string[]
}
