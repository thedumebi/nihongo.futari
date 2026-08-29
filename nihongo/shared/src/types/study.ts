import { z } from '@hono/zod-openapi'

import { EXERCISE_TEMPLATE_CODES, STUDY_FACETS, STUDY_ITEM_KINDS } from '@/constants/endpoints.js'

import { cardStateSchema } from './srs.js'

/**
 * The study API contract.
 *
 * Everything here crosses a trust boundary (and, for the queue, gets cached in
 * IndexedDB for offline use), so it is Zod first and the types come from
 * z.infer. Nothing restates a shape defined in `srs.ts`.
 */

/**
 * One line on the "what's due" list.
 *
 * Deliberately NOT a StudyQueueItem: this is a list you read, not a card you
 * answer, so it carries the subject and the schedule and none of the prompt or
 * answer payload.
 */
export const dueItemSchema = z.object({
  cardId: z.string(),
  facetId: z.string(),
  studyItemId: z.string(),
  kind: z.string(),
  facet: z.string(),
  /** What the card is about: the word, the character, the pattern's name. */
  subject: z.string(),
  /** Reading or gloss, where the subject alone is not enough to recognise it. */
  detail: z.string().nullable(),
  due: z.string(),
  ghost: z.boolean(),
  lapses: z.number().int(),
  /** Where to read more about this item, or null if it has no page. */
  href: z.string().nullable()
}).openapi('DueItem')

export type DueItem = z.infer<typeof dueItemSchema>

export const dueListQuerySchema = z.object({
  languageCode: z.string().min(2).default('ja'),
  limit: z.coerce.number().int().min(1).max(200).default(50),
  offset: z.coerce.number().int().min(0).default(0),
  kind: z.string().optional()
}).openapi('DueListQuery')

export type DueListQuery = z.infer<typeof dueListQuerySchema>

export const dueListResponseSchema = z.object({
  items: z.array(dueItemSchema),
  /** Everything due, not just this page — the count the list is headed with. */
  total: z.number().int(),
  /** How many are due per kind, for the filter chips. */
  byKind: z.array(z.object({ kind: z.string(), count: z.number().int() })),
  serverTime: z.string()
}).openapi('DueList')

export type DueListResponse = z.infer<typeof dueListResponseSchema>

export const studyQueueQuerySchema = z.object({
  languageCode: z.string().min(2).default('ja'),
  limit: z.coerce.number().int().min(1).max(200).default(20),
  /** How many days ahead to pull. >0 fills an offline bundle. */
  horizonDays: z.coerce.number().int().min(0).max(14).default(0),
  mode: z.enum(['due', 'new', 'ghost', 'mixed']).default('mixed'),
  /** Narrow to one content kind — kana, word, kanji, grammar. Empty = all. */
  kind: z.string().optional(),
  /** Narrow to a curriculum unit: a script (hiragana) or a scenario (restaurant). */
  unit: z.string().optional(),
  /**
   * Narrow to a JLPT level by code (N5 … N1). Empty means every level.
   *
   * Without it a beginner's queue served whatever the corpus held — N1
   * vocabulary in among the kana — because the importers level everything but
   * nothing was filtering on it.
   */
  level: z.string().optional()
}).openapi('StudyQueueQuery')

export type StudyQueueQuery = z.infer<typeof studyQueueQuerySchema>

/**
 * One renderable prompt.
 *
 * `answer` ships to the client on purpose: reviews are graded offline, so the
 * device needs it. This is a learning tool — the only person a peeker cheats is
 * themselves — and the alternative is no offline mode at all.
 */
export const studyQueueItemSchema = z.object({
  /** Null for an item never studied — the card is created by the first answer. */
  cardId: z.string().nullable(),
  facetId: z.string(),
  studyItemId: z.string(),
  kind: z.enum(STUDY_ITEM_KINDS),
  facet: z.enum(STUDY_FACETS),
  due: z.iso.datetime(),
  isNew: z.boolean(),
  ghost: z.boolean(),
  card: cardStateSchema.nullable(),
  templateCode: z.enum(EXERCISE_TEMPLATE_CODES),
  inputMode: z.string(),
  graderCode: z.string(),
  prompt: z.record(z.string(), z.unknown()),
  answer: z.object({ primary: z.string(), accepted: z.array(z.string()) }),
  distractors: z.array(z.unknown()),
  assets: z.record(z.string(), z.unknown())
}).openapi('StudyQueueItem')

export type StudyQueueItem = z.infer<typeof studyQueueItemSchema>

/**
 * Where the reader has reached in a level's curriculum.
 *
 * New material is introduced a stage at a time and the next opens when this
 * one is mostly retained, so without this the gate is invisible: the queue
 * simply runs out of new cards and nothing says why.
 */
/**
 * One stage of a level: a block of material introduced together.
 */
/**
 * What a word means, for the tap-a-word popover in a conversation.
 *
 * Straight out of JMdict via the `words` tables — nothing here is authored, so
 * there is no review gate to satisfy. Leading sense only: an entry can carry a
 * dozen and a popover listing them all answers a question nobody asked.
 */
export const wordGlossSchema = z.object({
  /** The dictionary form, which differs from the token for anything inflected. */
  form: z.string(),
  reading: z.string(),
  meanings: z.array(z.string()),
  /** Humanised part of speech — "godan verb", "particle" — or null if unmapped. */
  pos: z.string().nullable()
}).openapi('WordGloss')

export type WordGloss = z.infer<typeof wordGlossSchema>

/** One tappable piece of a line. `w` is absent where the dictionary has nothing. */
export const glossedTokenSchema = z.object({
  t: z.string(),
  /**
   * This token's own kana, cut from the line's reading.
   *
   * Absent when the line could not be aligned confidently — romaji mode then
   * falls back to romanising the whole line rather than showing a word the
   * wrong way round.
   */
  r: z.string().optional(),
  w: wordGlossSchema.optional()
}).openapi('GlossedToken')

export type GlossedToken = z.infer<typeof glossedTokenSchema>

/** One line of a scripted conversation. */
export const dialogueTurnSchema = z.object({
  index: z.number().int(),
  speaker: z.string(),
  text: z.string(),
  reading: z.string(),
  translation: z.string(),
  /**
   * Where to hear this line spoken.
   *
   * Derived from the row id rather than stored, the same as sentence audio —
   * every published turn is generated, so there is nothing to be null about.
   */
  audio: z.string(),
  /** The line cut into tappable words. Joining every `t` rebuilds `text`. */
  tokens: z.array(glossedTokenSchema),
  replies: z.array(z.object({
    id: z.string(),
    text: z.string(),
    reading: z.string(),
    translation: z.string().nullable(),
    isCorrect: z.boolean(),
    whyWrong: z.string().nullable(),
    /** Where to hear this reply spoken. Derived from the id, as above. */
    audio: z.string(),
    /** The reply cut into tappable words, as on the turn above. */
    tokens: z.array(glossedTokenSchema)
  }))
}).openapi('DialogueTurn')

export type DialogueTurn = z.infer<typeof dialogueTurnSchema>

export const dialogueViewSchema = z.object({
  code: z.string(),
  title: z.string(),
  situation: z.string(),
  level: z.string().nullable(),
  unit: z.string().nullable(),
  unitTitle: z.string().nullable(),
  /**
   * This conversation's illustration.
   *
   * Its own drawing, falling back to its unit's scene only if it has none.
   * Sharing the unit's art was tried and was wrong: the four restaurant
   * conversations all showed the same restaurant, so the picture repeated the
   * group heading instead of saying which moment this is — ordering, paying,
   * mentioning an allergy, splitting the bill.
   */
  image: z.string().nullable(),
  turns: z.array(dialogueTurnSchema)
}).openapi('Dialogue')

export type DialogueView = z.infer<typeof dialogueViewSchema>

export const dialogueListResponseSchema = z.object({
  dialogues: z.array(dialogueViewSchema.omit({ turns: true }).extend({
    turnCount: z.number().int(),
    /**
     * Every line of the conversation, flattened, so the list page can search
     * what is actually SAID in it and not just its title. A reader hunting for
     * the conversation with itterasshai in it knows the phrase, not the label.
     */
    keywords: z.string(),
    /** How many of its learner turns you have already met, for the list. */
    learned: z.boolean()
  }))
}).openapi('DialogueList')

export type DialogueListResponse = z.infer<typeof dialogueListResponseSchema>

export const courseStageSchema = z.object({
  stage: z.number().int(),
  total: z.number().int(),
  learned: z.number().int(),
  /** What the stage is made of, so it can be described rather than numbered. */
  kinds: z.array(z.object({ kind: z.string(), count: z.number().int() })),
  /** A few of its subjects, for a one-line preview. */
  sample: z.array(z.string()),
  /** False for stages the reader has not reached yet. */
  open: z.boolean()
}).openapi('CourseStage')

export type CourseStage = z.infer<typeof courseStageSchema>

/**
 * A level as a course: how far through it you are, and its stages.
 */
export const courseLevelSchema = z.object({
  level: z.string(),
  title: z.string(),
  total: z.number().int(),
  learned: z.number().int(),
  /** 1-based; null once every stage is finished. */
  currentStage: z.number().int().nullable(),
  stages: z.array(courseStageSchema)
}).openapi('CourseLevel')

export type CourseLevel = z.infer<typeof courseLevelSchema>

export const courseResponseSchema = z.object({
  levels: z.array(courseLevelSchema)
}).openapi('Course')

export type CourseResponse = z.infer<typeof courseResponseSchema>

export const stageProgressSchema = z.object({
  level: z.string(),
  /** 1-based. The stage new cards are currently drawn from. */
  stage: z.number().int(),
  /** How many stages this level has in total. */
  stages: z.number().int(),
  /** Facets in the current stage, and how many have been retained. */
  learned: z.number().int(),
  total: z.number().int()
}).openapi('StageProgress')

export type StageProgress = z.infer<typeof stageProgressSchema>

export const studyQueueResponseSchema = z.object({
  items: z.array(studyQueueItemSchema),
  counts: z.object({
    /** Cards in Review state whose interval has elapsed — real reviews. */
    due: z.number().int(),
    /**
     * Cards still on FSRS's short learning steps, which come back in minutes
     * rather than days. Counted separately: showing "6 due" moments after you
     * studied them reads as a bug, when it is the algorithm working.
     */
    learning: z.number().int(),
    newAvailable: z.number().int(),
    ghost: z.number().int()
  }),
  /**
   * Curriculum position, one row per level that still has a stage open.
   * Empty once every level is finished.
   */
  progress: z.array(stageProgressSchema),
  /**
   * Set when this deck has new material that the curriculum has not reached.
   *
   * Without it the page says "nothing due" and offers a Refresh button, which
   * is wrong twice over: there IS material, and refreshing will never produce
   * it. The reader needs to know it is a stage boundary, not an empty deck.
   */
  gate: z.object({
    /** How many facets in this deck are waiting behind the gate. */
    waiting: z.number().int(),
    /** The stage at which the first of them opens. */
    opensAtStage: z.number().int()
  }).nullable(),
  /** Server clock, so the client can track its offset for review stamping. */
  serverTime: z.iso.datetime()
}).openapi('StudyQueueResponse')

export type StudyQueueResponse = z.infer<typeof studyQueueResponseSchema>

/**
 * A submitted answer.
 *
 * `id` is minted BY THE CLIENT as a UUIDv7 before the answer is queued, so a
 * retried or duplicated flush is a no-op rather than a double review.
 */
export const submitAnswerSchema = z.object({
  id: z.uuid(),
  facetId: z.string().min(1),
  rating: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  reviewedAt: z.iso.datetime(),
  durationMs: z.number().int().nonnegative().optional(),
  templateId: z.string().optional(),
  promptId: z.string().optional(),
  answerGiven: z.string().optional(),
  isCorrect: z.boolean().optional(),
  hintsUsed: z.number().int().nonnegative().default(0),
  sessionId: z.string().optional(),
  clientId: z.string().optional(),
  clientSeq: z.number().int().nonnegative().optional(),
  offline: z.boolean().default(false)
}).openapi('SubmitAnswer')

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>

export const answerResultSchema = z.object({
  /** False when this id had already been recorded — the write was a no-op. */
  applied: z.boolean(),
  cardId: z.string(),
  card: cardStateSchema,
  ghost: z.boolean(),
  /** True when the card's whole history had to be re-folded. */
  replayed: z.boolean(),
  /** Set when the client's clock was corrected. */
  clockAdjusted: z.boolean(),
  serverTime: z.iso.datetime()
}).openapi('AnswerResult')

export type AnswerResult = z.infer<typeof answerResultSchema>

/** Batch form used by the offline sync endpoint. */
export const syncMutationsSchema = z.object({
  deviceId: z.string().min(1),
  mutations: z.array(submitAnswerSchema).max(200)
}).openapi('SyncMutations')

export type SyncMutationsInput = z.infer<typeof syncMutationsSchema>

export const syncResultSchema = z.object({
  accepted: z.array(z.string()),
  duplicates: z.array(z.string()),
  rejected: z.array(z.object({ id: z.string(), reason: z.string() })),
  cards: z.array(z.object({ cardId: z.string(), card: cardStateSchema, ghost: z.boolean() })),
  serverTime: z.iso.datetime()
}).openapi('SyncResult')

export type SyncResult = z.infer<typeof syncResultSchema>

/**
 * A selectable deck.
 *
 * Both the broad kinds (kana, vocabulary) and the topical units (hiragana,
 * "at a restaurant") are decks, so the picker is one list rather than two
 * parallel concepts. `group` is only for visual grouping in the menu.
 */
export const studyDeckSchema = z.object({
  id: z.string(),
  group: z.enum(['kind', 'script', 'scenario']),
  label: z.string(),
  description: z.string().nullable(),
  /** Filter to apply: one of these is set. */
  kind: z.string().nullable(),
  unit: z.string().nullable(),
  /**
   * Scene illustration for a scenario unit, where one has been drawn.
   * Null for every kind deck and for units with no drawing yet — the card
   * must render without it rather than leaving an empty frame.
   */
  imageUrl: z.string().nullable(),
  total: z.number().int(),
  due: z.number().int(),
  learning: z.number().int(),
  /** Available to start now — already bounded by the curriculum. */
  unseen: z.number().int(),
  /**
   * Cards in this deck the curriculum has not reached yet.
   *
   * Without it a gated deck is indistinguishable from a finished one: both
   * report 0 due and 0 unseen, and the picker labelled both "done".
   */
  locked: z.number().int()
}).openapi('StudyDeck')

export type StudyDeck = z.infer<typeof studyDeckSchema>

export const studyDecksResponseSchema = z.object({
  decks: z.array(studyDeckSchema)
}).openapi('StudyDecks')

export type StudyDecksResponse = z.infer<typeof studyDecksResponseSchema>
