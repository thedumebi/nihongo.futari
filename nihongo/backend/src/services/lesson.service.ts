import type {
  CompleteLessonInput,
  CompleteLessonResult,
  LessonDetail,
  LessonListResponse,
  LessonStatus,
  LessonSummary
} from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  curriculumUnitItems,
  curriculumUnits,
  exercisePrompts,
  exerciseTemplates,
  grammarMistakes,
  grammarPoints,
  languageLevels,
  languages,
  lessonMisses,
  lessonViews,
  srsCards,
  studyItemFacets,
  studyItems
} from '@nihongo/shared/db/schema'
import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm'

import { loadExamples, loadLessons } from './grammar.service.js'

/**
 * Lessons.
 *
 * The app's main surface, and the thing the owner asked for twice: "Bunpo has
 * this thing where in course you learn things and after learning you get a quiz
 * from what you learnt. There is nothing like that here!"
 *
 * A lesson is one topic — a `grammar_points` row — presented as a swipe deck
 * and then a quiz on the same material. It is NOT a new content type, and
 * nothing here writes prose: everything shown is already authored, and was
 * previously reachable only from a reference page nothing linked to.
 */

/**
 * How far a reader has got with a topic, strongest first.
 *
 * `known` beats `learned` because the SRS is the better witness: having sat the
 * quiz says you met it, having the card at review state says you kept it.
 */
function statusOf(row: { seen: boolean, completedAt: Date | null, cardState: number | null }): LessonStatus {
  if (row.cardState !== null && row.cardState >= 2)
    return 'known'
  if (row.completedAt !== null)
    return 'learned'
  return row.seen ? 'seen' : 'not-started'
}

export async function listLessons(userId: string, languageCode: string): Promise<LessonListResponse> {
  const [language] = await db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, languageCode))
    .limit(1)
  if (!language)
    return { levels: [], next: null }

  const rows = await db
    .select({
      level: languageLevels.code,
      levelSort: languageLevels.sortIndex,
      slug: grammarPoints.slug,
      title: grammarPoints.title,
      meaningShort: grammarPoints.meaningShort,
      sortIndex: grammarPoints.sortIndex,
      studyItemId: studyItems.id,
      unitCode: curriculumUnits.code,
      unitTitle: curriculumUnits.title,
      unitImage: curriculumUnits.imageUrl,
      unitSort: curriculumUnits.sortIndex,
      seen: sql<boolean>`${lessonViews.userId} is not null`,
      completedAt: lessonViews.completedAt,
      quizScore: lessonViews.quizScore,
      cardState: sql<number | null>`max(${srsCards.state})`,
      exampleCount: sql<number>`(
        select count(*) from grammar_point_sentences gps
        join sentences s on s.id = gps.sentence_id
        where gps.grammar_point_id = ${grammarPoints.id} and gps.role = 'example' and s.published
      )`.mapWith(Number),
      questionCount: sql<number>`(
        select count(*) from exercise_prompts p
        join study_item_facets f on f.id = p.facet_id
        where f.study_item_id = ${studyItems.id} and p.status = 'published'
      )`.mapWith(Number)
    })
    .from(grammarPoints)
    .innerJoin(studyItems, eq(studyItems.grammarPointId, grammarPoints.id))
    .innerJoin(languageLevels, eq(languageLevels.id, grammarPoints.levelId))
    .leftJoin(lessonViews, and(eq(lessonViews.studyItemId, studyItems.id), eq(lessonViews.userId, userId)))
    .leftJoin(studyItemFacets, eq(studyItemFacets.studyItemId, studyItems.id))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .leftJoin(curriculumUnitItems, eq(curriculumUnitItems.studyItemId, studyItems.id))
    .leftJoin(curriculumUnits, eq(curriculumUnits.id, curriculumUnitItems.unitId))
    .where(and(
      eq(grammarPoints.languageId, language.id),
      eq(grammarPoints.published, true),
      eq(studyItems.published, true),
      eq(studyItems.active, true)
    ))
    .groupBy(
      languageLevels.code,
      languageLevels.sortIndex,
      grammarPoints.id,
      grammarPoints.slug,
      grammarPoints.title,
      grammarPoints.meaningShort,
      grammarPoints.sortIndex,
      studyItems.id,
      curriculumUnits.code,
      curriculumUnits.title,
      curriculumUnits.imageUrl,
      curriculumUnits.sortIndex,
      lessonViews.userId,
      lessonViews.completedAt,
      lessonViews.quizScore
    )
    .orderBy(asc(languageLevels.sortIndex), asc(curriculumUnits.sortIndex), asc(grammarPoints.sortIndex))

  // Group by level, then by unit within it. A topic belonging to no unit lands
  // in an unnamed group rather than being hidden.
  const levels = new Map<string, {
    level: string
    sort: number
    groups: Map<string, { code: string | null, title: string | null, imageUrl: string | null, lessons: LessonSummary[] }>
  }>()

  let next: LessonListResponse['next'] = null

  for (const r of rows) {
    const status = statusOf(r)
    const level = levels.get(r.level) ?? { level: r.level, sort: r.levelSort ?? 0, groups: new Map() }
    const key = r.unitCode ?? ''
    const group = level.groups.get(key)
      ?? { code: r.unitCode, title: r.unitTitle, imageUrl: r.unitImage, lessons: [] }

    group.lessons.push({
      slug: r.slug,
      title: r.title,
      meaningShort: r.meaningShort,
      exampleCount: r.exampleCount,
      questionCount: r.questionCount,
      status,
      score: r.quizScore
    })
    level.groups.set(key, group)
    levels.set(r.level, level)

    if (next === null && status === 'not-started')
      next = { level: r.level, slug: r.slug, title: r.title }
  }

  return {
    levels: [...levels.values()]
      .sort((a, b) => a.sort - b.sort)
      .map(l => ({
        level: l.level,
        total: [...l.groups.values()].reduce((n, g) => n + g.lessons.length, 0),
        completed: [...l.groups.values()]
          .reduce((n, g) => n + g.lessons.filter(x => x.status === 'learned' || x.status === 'known').length, 0),
        groups: [...l.groups.values()]
      })),
    next
  }
}

export async function getLesson(userId: string, languageCode: string, slug: string): Promise<LessonDetail | null> {
  const [point] = await db
    .select({
      id: grammarPoints.id,
      studyItemId: studyItems.id,
      seen: sql<boolean>`${lessonViews.userId} is not null`,
      completedAt: lessonViews.completedAt,
      cardState: sql<number | null>`max(${srsCards.state})`
    })
    .from(grammarPoints)
    .innerJoin(languages, eq(languages.id, grammarPoints.languageId))
    .innerJoin(studyItems, eq(studyItems.grammarPointId, grammarPoints.id))
    .leftJoin(lessonViews, and(eq(lessonViews.studyItemId, studyItems.id), eq(lessonViews.userId, userId)))
    .leftJoin(studyItemFacets, eq(studyItemFacets.studyItemId, studyItems.id))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(and(eq(languages.code, languageCode), eq(grammarPoints.slug, slug), eq(grammarPoints.published, true)))
    .groupBy(grammarPoints.id, studyItems.id, lessonViews.userId, lessonViews.completedAt)
    .limit(1)

  if (!point)
    return null

  const [lessons, examples, mistakes, questions] = await Promise.all([
    loadLessons(languageCode, [point.id], true),
    loadExamples(languageCode, [point.id]),
    db.select({
      wrong: grammarMistakes.wrong,
      right: grammarMistakes.right,
      whyWrong: grammarMistakes.whyWrong,
      explanation: grammarMistakes.explanation
    })
      .from(grammarMistakes)
      .where(eq(grammarMistakes.grammarPointId, point.id))
      .orderBy(asc(grammarMistakes.sortIndex)),
    // EVERY published prompt on the topic, not the one-per-facet the review
    // queue picks: a lesson quiz asks the whole set in one sitting.
    db.select({
      id: exercisePrompts.id,
      templateCode: exerciseTemplates.code,
      inputMode: exerciseTemplates.inputMode,
      graderCode: exerciseTemplates.graderCode,
      prompt: exercisePrompts.prompt,
      answer: exercisePrompts.answer,
      distractors: exercisePrompts.distractors,
      assets: exercisePrompts.assets,
      firstExposureOnly: exerciseTemplates.firstExposureOnly
    })
      .from(exercisePrompts)
      .innerJoin(studyItemFacets, eq(studyItemFacets.id, exercisePrompts.facetId))
      .innerJoin(exerciseTemplates, eq(exerciseTemplates.id, exercisePrompts.templateId))
      .where(and(
        eq(studyItemFacets.studyItemId, point.studyItemId),
        eq(exercisePrompts.status, 'published')
      ))
  ])

  const lesson = lessons.get(point.id)
  if (!lesson)
    return null

  // Easiest first: the meaning question introduces, the rest build on it.
  const ordered = [...questions].sort((a, b) => Number(b.firstExposureOnly) - Number(a.firstExposureOnly))

  return {
    lesson,
    mistakes,
    examples: examples.get(point.id) ?? [],
    questions: ordered.map(({ firstExposureOnly: _drop, ...q }) => q),
    status: statusOf(point),
    studyItemId: point.studyItemId
  }
}

/**
 * Finishing a lesson.
 *
 * Two things happen and a third deliberately does not.
 *
 * It records the completion, which is what the list shows and what admits the
 * topic to review — `getQueue` will not offer a grammar item until a
 * `lesson_views` row exists for it, so reading the lesson IS how a topic enters
 * the schedule.
 *
 * It records the questions that were missed, so the next time the topic comes
 * round in review the reader meets the one they got wrong rather than a random
 * sibling of it. That was the owner's ask: "if I do a lesson I can review the
 * questions later."
 *
 * What it does NOT do is write review history. A question answered thirty
 * seconds after reading the explanation is not evidence you will remember it in
 * a week, and `srs_cards` is a fold over `srs_review_logs` — a fabricated entry
 * would inflate every interval after it, permanently.
 */
export async function completeLesson(
  userId: string,
  languageCode: string,
  slug: string,
  input: CompleteLessonInput
): Promise<CompleteLessonResult | null> {
  const [point] = await db
    .select({ studyItemId: studyItems.id })
    .from(grammarPoints)
    .innerJoin(languages, eq(languages.id, grammarPoints.languageId))
    .innerJoin(studyItems, eq(studyItems.grammarPointId, grammarPoints.id))
    .where(and(eq(languages.code, languageCode), eq(grammarPoints.slug, slug)))
    .limit(1)

  if (!point)
    return null

  const [existing] = await db
    .select({ completedAt: lessonViews.completedAt })
    .from(lessonViews)
    .where(and(eq(lessonViews.userId, userId), eq(lessonViews.studyItemId, point.studyItemId)))
    .limit(1)

  const now = new Date()
  const [row] = await db
    .insert(lessonViews)
    .values({ userId, studyItemId: point.studyItemId, completedAt: now, quizScore: input.score })
    .onConflictDoUpdate({
      target: [lessonViews.userId, lessonViews.studyItemId],
      // `first_seen_at` is never touched: the interesting fact is when the
      // topic was FIRST met, and re-taking a quiz does not change that.
      set: { completedAt: now, quizScore: input.score, updatedAt: now }
    })
    .returning({ completedAt: lessonViews.completedAt, studyItemId: lessonViews.studyItemId })

  if (input.missedPromptIds.length > 0) {
    await db
      .insert(lessonMisses)
      .values(input.missedPromptIds.map(promptId => ({ userId, promptId, missedAt: now })))
      .onConflictDoUpdate({
        target: [lessonMisses.userId, lessonMisses.promptId],
        // Missing it again re-opens it, even if a previous miss was cleared.
        set: { missedAt: now, clearedAt: null, updatedAt: now }
      })
  }

  return {
    studyItemId: row!.studyItemId,
    completedAt: row!.completedAt!.toISOString(),
    score: input.score,
    addedToReview: existing === undefined
  }
}

/** Clear a miss once it has been answered correctly in review. */
export async function clearMiss(userId: string, promptIds: string[]): Promise<void> {
  if (promptIds.length === 0)
    return
  await db
    .update(lessonMisses)
    .set({ clearedAt: new Date(), updatedAt: new Date() })
    .where(and(
      eq(lessonMisses.userId, userId),
      inArray(lessonMisses.promptId, promptIds),
      isNull(lessonMisses.clearedAt)
    ))
}
