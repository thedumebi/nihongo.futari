/**
 * Lessons for the writing system itself.
 *
 * Every other lesson assumes you can read kana: furigana IS kana, so a reader
 * who has not met あ cannot use the ruby that the rest of the app leans on to
 * make kanji readable. Lessons is the surface the app is organised around, and
 * it began at です — there was nowhere to learn the alphabet at all. The kana
 * were in the app the whole time, as 142 study items with their own cards and
 * questions, but only ever reachable by drilling them in Review.
 *
 * A lesson is one ROW of the syllabary — あいうえお, かきくけこ — because that is
 * the unit the rows are taught in and five characters is a sitting. Hiragana
 * first, then katakana, and within each the plain rows before the dakuten and
 * combination ones.
 *
 * Nothing here is new content. The characters, their audio and their questions
 * already existed; this gives them a door.
 */
import type { LessonDetail, LessonStatus, LessonSummary } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { exercisePrompts, exerciseTemplates, kana, lessonViews, srsCards, studyItemFacets, studyItems } from '@nihongo/shared/db/schema'
import { and, asc, eq, inArray, sql } from 'drizzle-orm'

import { assetUrl, withAssetUrls } from '../lib/assets.js'

/** `kana-hiragana-base-k`, and the vowel row has no consonant to name it by. */
export const KANA_SLUG_PREFIX = 'kana-'

function slugFor(script: string, variant: string, row: string): string {
  return `${KANA_SLUG_PREFIX}${script}-${variant}-${row || 'vowel'}`
}

/**
 * How a Japanese learner names a row: か行, "the か line".
 *
 * The vowel row is 母音 rather than a consonant line, and ん belongs to no row
 * at all — it is its own lesson because it behaves like nothing else.
 */
function rowLabel(characters: string[], row: string): string {
  if (!row)
    return '母音'
  if (characters.length === 1)
    return characters[0]!
  return `${characters[0]}行`
}

interface KanaRow {
  script: string
  variant: string
  row: string
  order: number
  members: Array<{ studyItemId: string, character: string, romaji: string }>
}

async function kanaRows(languageId: string): Promise<KanaRow[]> {
  const rows = await db
    .select({
      studyItemId: studyItems.id,
      script: kana.script,
      variant: kana.variant,
      row: kana.row,
      character: kana.character,
      romaji: kana.romaji,
      order: kana.orderIndex
    })
    .from(kana)
    .innerJoin(studyItems, eq(studyItems.kanaId, kana.id))
    .where(and(
      eq(kana.languageId, languageId),
      eq(studyItems.published, true),
      eq(studyItems.active, true)
    ))
    .orderBy(asc(kana.script), asc(kana.orderIndex))

  const grouped = new Map<string, KanaRow>()
  for (const r of rows) {
    const key = slugFor(r.script, r.variant, r.row)
    const group = grouped.get(key)
      ?? { script: r.script, variant: r.variant, row: r.row, order: r.order, members: [] }
    group.members.push({ studyItemId: r.studyItemId, character: r.character, romaji: r.romaji })
    grouped.set(key, group)
  }

  // Hiragana before katakana, and within a script the order the table already
  // carries — plain rows, then dakuten, then the combinations.
  return [...grouped.values()].sort((a, b) =>
    a.script === b.script ? a.order - b.order : (a.script === 'hiragana' ? -1 : 1))
}

/**
 * A row's status, taken from its WEAKEST character.
 *
 * Knowing four of かきくけこ is not knowing the row, and a lesson that reports
 * itself finished while one of its characters is still unseen would be lying in
 * the direction that matters.
 */
function weakest(statuses: LessonStatus[]): LessonStatus {
  const rank: Record<LessonStatus, number> = { 'not-started': 0, 'seen': 1, 'learned': 2, 'known': 3 }
  return statuses.reduce((worst, s) => (rank[s] < rank[worst] ? s : worst), 'known' as LessonStatus)
}

async function statusByItem(userId: string, studyItemIds: string[]): Promise<Map<string, LessonStatus>> {
  if (studyItemIds.length === 0)
    return new Map()

  const rows = await db
    .select({
      studyItemId: studyItems.id,
      seen: sql<boolean>`${lessonViews.userId} is not null`,
      completedAt: lessonViews.completedAt,
      cardState: sql<number | null>`max(${srsCards.state})`
    })
    .from(studyItems)
    .leftJoin(lessonViews, and(eq(lessonViews.studyItemId, studyItems.id), eq(lessonViews.userId, userId)))
    .leftJoin(studyItemFacets, eq(studyItemFacets.studyItemId, studyItems.id))
    .leftJoin(srsCards, and(eq(srsCards.facetId, studyItemFacets.id), eq(srsCards.userId, userId)))
    .where(inArray(studyItems.id, studyItemIds))
    .groupBy(studyItems.id, lessonViews.userId, lessonViews.completedAt)

  const out = new Map<string, LessonStatus>()
  for (const r of rows) {
    out.set(r.studyItemId, (r.cardState ?? 0) >= 2
      ? 'known'
      : r.completedAt
        ? 'learned'
        : r.seen ? 'seen' : 'not-started')
  }
  return out
}

/** The writing-system lessons, in teaching order. */
export async function kanaLessonSummaries(userId: string, languageId: string): Promise<LessonSummary[]> {
  const rows = await kanaRows(languageId)
  const statuses = await statusByItem(userId, rows.flatMap(r => r.members.map(m => m.studyItemId)))

  return rows.map((r) => {
    const characters = r.members.map(m => m.character)
    return {
      slug: slugFor(r.script, r.variant, r.row),
      title: characters.join(''),
      meaningShort: `${r.script === 'hiragana' ? 'Hiragana' : 'Katakana'} — ${rowLabel(characters, r.row)}`,
      exampleCount: 0,
      questionCount: r.members.length,
      status: weakest(r.members.map(m => statuses.get(m.studyItemId) ?? 'not-started')),
      score: null
    }
  })
}

/** The study items a writing-system lesson covers, or null if the slug is not one. */
export async function kanaLessonItems(languageId: string, slug: string): Promise<string[] | null> {
  if (!slug.startsWith(KANA_SLUG_PREFIX))
    return null
  const row = (await kanaRows(languageId)).find(r => slugFor(r.script, r.variant, r.row) === slug)
  return row ? row.members.map(m => m.studyItemId) : null
}

export async function getKanaLesson(userId: string, languageId: string, slug: string): Promise<LessonDetail | null> {
  const row = (await kanaRows(languageId)).find(r => slugFor(r.script, r.variant, r.row) === slug)
  if (!row)
    return null

  const itemIds = row.members.map(m => m.studyItemId)
  const statuses = await statusByItem(userId, itemIds)

  // The questions these characters already have. `kana-romaji` asks which sound
  // a character makes, which is exactly what the lesson just taught; handwriting
  // is excluded because it needs a canvas the quiz does not have.
  const questions = await db
    .select({
      id: exercisePrompts.id,
      templateCode: exerciseTemplates.code,
      inputMode: exerciseTemplates.inputMode,
      graderCode: exerciseTemplates.graderCode,
      prompt: exercisePrompts.prompt,
      answer: exercisePrompts.answer,
      distractors: exercisePrompts.distractors,
      assets: exercisePrompts.assets
    })
    .from(exercisePrompts)
    .innerJoin(studyItemFacets, eq(studyItemFacets.id, exercisePrompts.facetId))
    .innerJoin(exerciseTemplates, eq(exerciseTemplates.id, exercisePrompts.templateId))
    .where(and(
      inArray(studyItemFacets.studyItemId, itemIds),
      eq(exercisePrompts.status, 'published'),
      eq(exerciseTemplates.code, 'kana-romaji')
    ))
    // In the row's own order, so the quiz asks あ い う え お rather than
    // whatever the planner returned — a lesson that shuffles itself between
    // visits is harder to come back to.
    .orderBy(asc(exercisePrompts.id))

  return {
    lesson: null,
    kana: {
      script: row.script,
      rowLabel: rowLabel(row.members.map(m => m.character), row.row),
      characters: row.members.map(m => ({
        character: m.character,
        romaji: m.romaji,
        audio: assetUrl(`/audio/kana/${row.script}-${m.romaji}.m4a`)
      }))
    },
    mistakes: [],
    prose: {},
    examples: [],
    questions: questions.map(q => ({ ...q, assets: withAssetUrls(q.assets) })),
    status: weakest(itemIds.map(id => statuses.get(id) ?? 'not-started')),
    // The first character stands for the row wherever a single id is wanted.
    studyItemId: itemIds[0]!
  }
}
