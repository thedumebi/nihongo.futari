import { z } from '@hono/zod-openapi'

import { glossedTokenSchema, grammarExampleSchema, studyLessonSchema } from './study.js'

/**
 * Lessons — the surface the app is organised around.
 *
 * A lesson is not a new kind of content. It is a PRESENTATION of a topic that
 * already exists in `grammar_points`: the explanation, the examples and the
 * questions all hang off that one row. Nothing here duplicates the study types;
 * the teach half reuses `StudyLesson` and its examples wholesale.
 */

/** Where a reader has got to with one topic. */
export const lessonStatusSchema = z.enum(['not-started', 'seen', 'learned', 'known'])

export type LessonStatus = z.infer<typeof lessonStatusSchema>

/** One row in the list. Deliberately small — the list loads a whole level. */
export const lessonSummarySchema = z.object({
  slug: z.string(),
  title: z.string(),
  meaningShort: z.string(),
  /**
   * How many example sentences the lesson has.
   *
   * Zero means a short lesson: the explanation and a single question, which is
   * most of N4-N1 until authoring catches up. The list says so rather than
   * letting the reader discover it by opening one.
   */
  exampleCount: z.number().int(),
  questionCount: z.number().int(),
  status: lessonStatusSchema,
  /** Percentage from the last run through the quiz, if there was one. */
  score: z.number().int().nullish()
}).openapi('LessonSummary')

export type LessonSummary = z.infer<typeof lessonSummarySchema>

/** A level's worth of lessons, grouped the way the course groups them. */
export const lessonLevelSchema = z.object({
  level: z.string(),
  total: z.number().int(),
  completed: z.number().int(),
  /** Units where the curriculum defines them; one unnamed group otherwise. */
  groups: z.array(z.object({
    code: z.string().nullable(),
    title: z.string().nullable(),
    imageUrl: z.string().nullable(),
    lessons: z.array(lessonSummarySchema)
  }))
}).openapi('LessonLevel')

export type LessonLevel = z.infer<typeof lessonLevelSchema>

export const lessonListResponseSchema = z.object({
  levels: z.array(lessonLevelSchema),
  /** The first unstarted lesson, for the "continue" card. */
  next: z.object({ level: z.string(), slug: z.string(), title: z.string() }).nullish()
}).openapi('LessonList')

export type LessonListResponse = z.infer<typeof lessonListResponseSchema>

/**
 * One question in a lesson quiz.
 *
 * The ANSWER ships to the client, because a lesson grades where it is asked.
 * That is deliberate and it is not the same decision as the study queue's:
 * there, answers ride along so reviews work offline. Here it is because a
 * lesson answer must never reach FSRS — a question answered thirty seconds
 * after reading the explanation is not evidence of memory, and writing it as
 * review history would inflate every interval that followed.
 */
export const lessonQuestionSchema = z.object({
  id: z.string(),
  templateCode: z.string(),
  inputMode: z.string(),
  graderCode: z.string(),
  prompt: z.record(z.string(), z.unknown()),
  answer: z.object({ primary: z.string(), accepted: z.array(z.string()) }),
  distractors: z.array(z.unknown()),
  assets: z.record(z.string(), z.unknown())
}).openapi('LessonQuestion')

export type LessonQuestion = z.infer<typeof lessonQuestionSchema>

/**
 * A writing-system lesson: one row of the syllabary.
 *
 * Present INSTEAD of `lesson` when the slug names a kana row. The two teach
 * decks have nothing in common — a grammar topic is one pattern explained at
 * length, a kana row is five characters and their sounds — so they are separate
 * fields rather than one shape bent to cover both.
 */
export const kanaLessonSchema = z.object({
  script: z.string(),
  /** "あ行", the row as a Japanese learner names it. */
  rowLabel: z.string(),
  characters: z.array(z.object({
    character: z.string(),
    romaji: z.string(),
    audio: z.string().nullish()
  }))
}).openapi('KanaLesson')

export const lessonDetailSchema = z.object({
  /**
   * Everything the teach deck renders, shared with the study introduction.
   *
   * Absent for a writing-system lesson, which carries `kana` instead.
   */
  lesson: studyLessonSchema.nullish(),
  kana: kanaLessonSchema.nullish(),
  /** The full list, where the study card takes only one. */
  mistakes: z.array(z.object({
    wrong: z.string(),
    right: z.string(),
    whyWrong: z.string(),
    explanation: z.string().nullish()
  })),
  /**
   * Readings for the Japanese embedded in the explanation, keyed by the run.
   *
   * An explanation is English with Japanese dropped into it — 食べる → 食べます —
   * and it was rendered as plain text, so the reader's furigana or romaji
   * setting never reached it. Keyed by the run itself so the page can look up
   * any Japanese it meets without the server needing to know what markup
   * surrounds it.
   */
  prose: z.record(z.string(), z.object({
    text: z.string(),
    reading: z.string(),
    tokens: z.array(glossedTokenSchema)
  })),
  examples: z.array(grammarExampleSchema),
  questions: z.array(lessonQuestionSchema),
  status: lessonStatusSchema,
  studyItemId: z.string()
}).openapi('LessonDetail')

export type LessonDetail = z.infer<typeof lessonDetailSchema>

export const completeLessonSchema = z.object({
  /** 0-100, how much of the quiz was right first time. */
  score: z.number().int().min(0).max(100),
  /** Prompts answered wrongly, to be served first when the topic comes back. */
  missedPromptIds: z.array(z.string()).default([])
}).openapi('CompleteLesson')

export type CompleteLessonInput = z.infer<typeof completeLessonSchema>

export const completeLessonResultSchema = z.object({
  studyItemId: z.string(),
  completedAt: z.iso.datetime(),
  score: z.number().int(),
  /** True when this completion is what admitted the topic to review. */
  addedToReview: z.boolean()
}).openapi('CompleteLessonResult')

export type CompleteLessonResult = z.infer<typeof completeLessonResultSchema>
