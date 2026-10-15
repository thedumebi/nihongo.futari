import { z } from '@hono/zod-openapi'

import { EXERCISE_TEMPLATE_CODES, STUDY_FACETS, STUDY_ITEM_KINDS } from '@/constants/endpoints.js'

import { recordActivitySchema } from './activities.js'
import { furiganaSegmentSchema } from './sentences.js'
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
/** One card of a due item — which skill it tests, and how that card is doing. */
export const dueFacetSchema = z.object({
  cardId: z.string(),
  facetId: z.string(),
  facet: z.string(),
  due: z.string(),
  ghost: z.boolean(),
  lapses: z.number().int()
}).openapi('DueFacet')

export type DueFacet = z.infer<typeof dueFacetSchema>

/**
 * One ITEM waiting, with the cards of it that are due.
 *
 * A row was a card, so 仕事 appeared up to four times in a list headed "26
 * cards" while the app's other surfaces said 5. Grouping by item makes the row
 * count and the headline the same number, and makes that number the one the
 * reader thinks in — words, not the three or four schedules behind each word.
 */
export const dueItemSchema = z.object({
  studyItemId: z.string(),
  kind: z.string(),
  /** What the item is: the word, the character, the pattern's name. */
  subject: z.string(),
  /** Reading or gloss, where the subject alone is not enough to recognise it. */
  detail: z.string().nullable(),
  /** The earliest due card of this item — what makes it wait at the front. */
  due: z.string(),
  /** True if ANY of its due cards is flagged as not sticking. */
  ghost: z.boolean(),
  /** The due cards themselves, earliest first. */
  facets: z.array(dueFacetSchema),
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
  /**
   * Everything due, not just this page — the count the list is headed with,
   * in ITEMS, matching `items.length` when the page holds it all.
   */
  total: z.number().int(),
  /** The same set in cards, for the secondary line. */
  totalCards: z.number().int(),
  /** How many ITEMS are due per kind, for the filter chips. */
  byKind: z.array(z.object({ kind: z.string(), count: z.number().int() })),
  serverTime: z.string(),
  /**
   * When the next card falls due, if none is due now.
   *
   * An empty due list said only "nothing due" and left the reader with no idea
   * whether that meant an hour or a week. Null when something IS due, or when
   * there is no scheduled card ahead at all.
   */
  nextDueAt: z.string().nullable().default(null)
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
  level: z.string().optional(),
  /**
   * New cards past today's limit, asked for on purpose — every "learn 5 more
   * anyway" pressed TODAY, added up. Raises today's limit by that much; the
   * page keeps the total for the day and sends it with every request, and a
   * new day starts from zero.
   */
  moreNew: z.coerce.number().int().min(0).max(50).optional()
}).openapi('StudyQueueQuery')

export type StudyQueueQuery = z.infer<typeof studyQueueQuerySchema>

/**
 * What a word means, for the tap-a-word popover in a conversation.
 *
 * Straight out of JMdict via the `words` tables — nothing here is authored, so
 * there is no review gate to satisfy. Leading sense only: an entry can carry a
 * dozen and a popover listing them all answers a question nobody asked.
 */
const wordGlossBaseSchema = z.object({
  /** The dictionary form, which differs from the token for anything inflected. */
  form: z.string(),
  reading: z.string(),
  meanings: z.array(z.string()),
  /** Humanised part of speech — "godan verb", "particle" — or null if unmapped. */
  pos: z.string().nullable(),
  /**
   * The `words` row, so a tapped word can be added to reviews. Absent for
   * glosses that are not dictionary words — grammar patterns, counters.
   */
  wordId: z.string().optional()
})

export const wordGlossSchema = wordGlossBaseSchema.extend({
  /**
   * The pieces of a word the dictionary only knows in parts.
   *
   * 山本 or 大黒柱 are one word to the author and several to the dictionary.
   * Rather than making the reader tap each piece, the word is one chip and its
   * sheet lists the pieces. `meanings` is empty when the dictionary has nothing
   * for the whole.
   */
  parts: z.array(wordGlossBaseSchema).optional()
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
  /**
   * The same reading aligned to the word: ruby over each kanji run, kana as
   * written. Computed on the server from the import's alignment or the
   * author's reading, so the page never has to guess where a reading goes.
   */
  f: z.array(z.object({ t: z.string(), r: z.string().optional() })).optional(),
  w: wordGlossSchema.optional()
}).openapi('GlossedToken')

export type GlossedToken = z.infer<typeof glossedTokenSchema>

/** An authored sentence demonstrating a grammar point. */
export const grammarExampleSchema = z.object({
  sentenceId: z.string(),
  text: z.string(),
  /** Kana with particles already spoken (は→わ), which romaji is built from. */
  reading: z.string().nullish(),
  translation: z.string().nullish(),
  audio: z.string().nullish(),
  /**
   * The sentence cut into tappable words.
   *
   * `GlossedToken` and not a shape of its own: `token-line.vue` already renders
   * these with ruby, romaji and a tap target, and a word tapped in a lesson
   * should teach exactly what the same word taught in a conversation.
   */
  tokens: z.array(glossedTokenSchema)
}).openapi('GrammarExample')

export type GrammarExample = z.infer<typeof grammarExampleSchema>

/**
 * A grammar point as the study loop needs it: enough to TEACH before asking.
 *
 * Deliberately not `GrammarPointView`. That is a reference page and carries
 * etymology and sources; this rides along on a queue row and is trimmed to what
 * a lesson card shows — one mistake rather than all of them, no sources, no
 * relations beyond the link out.
 */
export const studyLessonSchema = z.object({
  slug: z.string(),
  title: z.string(),
  titleFurigana: z.array(furiganaSegmentSchema),
  pattern: z.string(),
  meaningShort: z.string(),
  meaningLong: z.string().nullish(),
  nuance: z.string().nullish(),
  formations: z.array(z.object({
    ruleTemplate: z.string(),
    example: z.string().nullish()
  })),
  mistake: z.object({
    wrong: z.string(),
    right: z.string(),
    whyWrong: z.string()
  }).nullish(),
  examples: z.array(grammarExampleSchema),
  href: z.string()
}).openapi('StudyLesson')

export type StudyLesson = z.infer<typeof studyLessonSchema>

/**
 * What "Show Hints" reveals: the pattern and how it attaches, never the answer.
 *
 * Rides on every grammar card and not only new ones — a hint is wanted most on
 * the review three weeks later, which is exactly when the lesson is gone.
 */
export const studyHintSchema = z.object({
  pattern: z.string(),
  formations: z.array(z.object({
    ruleTemplate: z.string(),
    example: z.string().nullish()
  })),
  href: z.string()
}).openapi('StudyHint')

export type StudyHint = z.infer<typeof studyHintSchema>

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
  /**
   * This card has never been answered, though the item may have been taught
   * already — a known word's listening card, say. `isNew` is true only on the
   * one card that introduces the item; this marks the rest of its first times.
   */
  firstTime: z.boolean().optional(),
  ghost: z.boolean(),
  card: cardStateSchema.nullable(),
  /** The prompt being shown, so the answer can say which one it answered. */
  promptId: z.string(),
  templateCode: z.enum(EXERCISE_TEMPLATE_CODES),
  inputMode: z.string(),
  graderCode: z.string(),
  prompt: z.record(z.string(), z.unknown()),
  answer: z.object({
    primary: z.string(),
    accepted: z.array(z.string()),
    /**
     * Per-token alternatives, in order: each entry is the ways that one token
     * may be written. Dictation grading walks these so ANY mix of kanji and
     * kana passes, which the flat `accepted` list cannot express — it can only
     * offer the sentence all in kanji or all in kana.
     */
    tokens: z.array(z.array(z.string())).optional()
  }),
  distractors: z.array(z.unknown()),
  assets: z.record(z.string(), z.unknown()),
  /**
   * Teach before asking. Present only on a grammar card at first exposure —
   * every other card, and every review, carries null and pays nothing.
   */
  lesson: studyLessonSchema.nullish(),
  /** Present on every grammar card, new or not. See `studyHintSchema`. */
  hint: studyHintSchema.nullish()
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
    learned: z.boolean(),
    /** Share of its words this learner knows, 0–1 — null when it has none to know. */
    coverage: z.number().nullable(),
    /** Practised to the end at least once. */
    practised: z.boolean()
  }))
}).openapi('DialogueList')

export type DialogueListResponse = z.infer<typeof dialogueListResponseSchema>

export const courseStageSchema = z.object({
  stage: z.number().int(),
  total: z.number().int(),
  learned: z.number().int(),
  /** Cards met at least once; learned are those past the learning steps. */
  started: z.number().int(),
  /** What the stage is made of, so it can be described rather than numbered. */
  kinds: z.array(z.object({ kind: z.string(), count: z.number().int() })),
  /** A few of its subjects, for a one-line preview. */
  sample: z.array(z.string()),
  /**
   * False for stages the reader has not reached yet.
   *
   * Grammar topics are no longer counted here or listed under a stage: a topic
   * is admitted to review by reading its lesson, and Lessons is its own surface
   * with its own order. A stage is kana, words and kanji.
   */
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

/**
 * A stage genuinely passed, announced once per account rather than once per
 * device.
 *
 * Null on almost every request. Present only on the response that first sees a
 * level's stage exceed the highest ever reached, and the server records it in
 * the same breath — so opening the app on a second phone cannot replay it, and
 * a stage that dropped because new material landed in an earlier stage cannot
 * fire it on the way back up.
 */
export const stageCelebrationSchema = z.object({
  level: z.string(),
  from: z.number().int(),
  to: z.number().int(),
  stages: z.number().int()
}).openapi('StageCelebration')

export type StageCelebration = z.infer<typeof stageCelebrationSchema>

export const studyQueueResponseSchema = z.object({
  /** Set once, by the server, when a stage is genuinely passed. */
  celebrate: stageCelebrationSchema.nullish(),
  items: z.array(studyQueueItemSchema),
  counts: z.object({
    /**
     * ITEMS waiting — words, kanji, topics — not cards.
     *
     * A word is three or four cards (7,646 carry three, 594 carry four), so
     * counting cards told the reader "26 due" when 21 words were waiting, and
     * every surface counted a different set on top of that. One card per item
     * is served per queue, so this is also the number of questions that will
     * actually be asked.
     *
     * Learning and relearning states are INCLUDED. A card whose step has
     * elapsed is due to a person, whatever the scheduler calls it.
     */
    due: z.number().int(),
    /** The same set in cards, for the few places that genuinely mean cards. */
    dueCards: z.number().int(),
    /**
     * How many of those are still on FSRS's short learning steps, which come
     * back in minutes rather than days. Small print — printed as a peer number
     * it read as a separate backlog, which is how "5 due · 21 in learning"
     * came to sit beside a list showing 26.
     */
    learning: z.number().int(),
    /** Items never studied that the curriculum will release next. */
    newAvailable: z.number().int(),
    ghost: z.number().int(),
    /** New cards the queue has introduced in this study day (midnight to midnight in the learner's time, or their own boundary hour). */
    newToday: z.number().int(),
    /** The learner's daily new-card limit (Settings). */
    newLimit: z.number().int()
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
/**
 * A write queued on the device besides an answer — so finishing a
 * conversation on a train still counts once the phone is back online.
 *
 * A discriminated union rather than "replay this request later": each kind is
 * validated here, carries its own client id for idempotency, and keeps the
 * time it HAPPENED, not the time it finally synced.
 */
const queuedBase = {
  id: z.uuid(),
  /** When it happened on the device — kept, not replaced by when it synced. */
  occurredAt: z.iso.datetime()
}

export const syncActionSchema = z.discriminatedUnion('type', [
  recordActivitySchema.extend({
    type: z.literal('activity'),
    id: z.uuid(),
    languageCode: z.string().min(2)
  }),
  // The same fields as the online routes, inline rather than imported, so this
  // file does not import the domains that import it.
  z.object({
    ...queuedBase,
    type: z.literal('lessonComplete'),
    languageCode: z.string().min(2),
    slug: z.string().min(1),
    score: z.number().int().min(0).max(100),
    missedPromptIds: z.array(z.string()).default([])
  }),
  z.object({
    ...queuedBase,
    type: z.literal('speakComplete'),
    languageCode: z.string().min(2),
    code: z.string().min(1),
    gotIt: z.number().int().min(0),
    total: z.number().int().min(1)
  }),
  z.object({
    ...queuedBase,
    type: z.literal('speakMiss'),
    languageCode: z.string().min(2),
    code: z.string().min(1),
    index: z.number().int().min(0)
  }),
  z.object({
    ...queuedBase,
    type: z.literal('saveWord'),
    wordId: z.string().min(1)
  })
]).openapi('SyncAction')

export type SyncAction = z.infer<typeof syncActionSchema>

export const syncMutationsSchema = z.object({
  deviceId: z.string().min(1),
  mutations: z.array(submitAnswerSchema).max(200),
  /** Optional, so a client from before actions existed still syncs. */
  actions: z.array(syncActionSchema).max(200).optional()
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

/**
 * "I have read this lesson."
 *
 * Keyed on the study item rather than the grammar point, matching `lesson_views`
 * — the same record has to serve a kana or kanji lesson later without a second
 * table and a second endpoint.
 */
export const lessonSeenSchema = z.object({
  studyItemId: z.string()
}).openapi('LessonSeen')

export type LessonSeenInput = z.infer<typeof lessonSeenSchema>

export const lessonSeenResultSchema = z.object({
  studyItemId: z.string(),
  firstSeenAt: z.iso.datetime()
}).openapi('LessonSeenResult')

export type LessonSeenResult = z.infer<typeof lessonSeenResultSchema>

/** A word tapped while reading, to be put into review. */
export const saveWordSchema = z.object({
  wordId: z.string()
}).openapi('SaveWord')

export type SaveWordInput = z.infer<typeof saveWordSchema>

export const saveWordResultSchema = z.object({
  /** False when this word already had a card — nothing was changed. */
  added: z.boolean()
}).openapi('SaveWordResult')

export type SaveWordResult = z.infer<typeof saveWordResultSchema>

/** Where a word stands in this learner's reviews — for the word sheet and the dictionary. */
export const wordStatusSchema = z.object({
  /** False when the word has no study item, so it cannot be reviewed at all. */
  reviewable: z.boolean(),
  inReview: z.boolean(),
  /** The soonest any of its cards is due; null when not in review. */
  due: z.iso.datetime().nullable(),
  /** Past the learning steps on at least one card. */
  learned: z.boolean(),
  /** Keeps being forgotten. */
  ghost: z.boolean()
}).openapi('WordStatus')

export const wordStatusesQuerySchema = z.object({
  /** Comma-separated word ids, at most a page of results. */
  ids: z.string().min(1).transform(s => [...new Set(s.split(',').filter(Boolean))].slice(0, 100))
})

export const wordStatusesSchema = z.object({
  /** By word id: whether it can be reviewed, and whether it already is. */
  statuses: z.record(z.string(), wordStatusSchema.pick({ reviewable: true, inReview: true }))
}).openapi('WordStatuses')

export type WordStatuses = z.infer<typeof wordStatusesSchema>

export type WordStatus = z.infer<typeof wordStatusSchema>
