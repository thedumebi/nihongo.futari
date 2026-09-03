import type { GrammarExample, GrammarListResponse, GrammarPointView, StudyHint, StudyLesson } from '@nihongo/shared/types'

import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import {
  etymologyEntries,
  etymologySources,
  grammarFormations,
  grammarMistakes,
  grammarPointRelationships,
  grammarPoints,
  grammarPointSentences,
  languageLevels,
  languages,
  sentences,
  sentenceTranslations,
  sources
} from '@nihongo/shared/db/schema'
import { annotate } from '@nihongo/shared/lib'
import { and, asc, eq, inArray } from 'drizzle-orm'

import { assetUrl } from '../lib/assets.js'
import { glossary, glossLine } from './glossary.service.js'
import { getLexicon } from './lexicon.service.js'

/**
 * The example sentences for a set of grammar points, ready to render.
 *
 * One loader for both readers — the reference page and the study lesson — so
 * an example cannot look different depending on where you meet it.
 *
 * Tokens come back with `wordId` and a gloss attached, which is what makes a
 * word tappable. The gloss is the first English sense, chosen the same way
 * `import-listening` and the dictionary already choose one; a particle or a
 * punctuation token has no `wordId` and simply is not tappable.
 */
export async function loadExamples(
  languageCode: string,
  pointIds: string[]
): Promise<Map<string, GrammarExample[]>> {
  const out = new Map<string, GrammarExample[]>()
  if (pointIds.length === 0)
    return out

  const rows = await db
    .select({
      pointId: grammarPointSentences.grammarPointId,
      sentenceId: sentences.id,
      text: sentences.text,
      reading: sentences.readingKana,
      translation: sentenceTranslations.text
    })
    .from(grammarPointSentences)
    .innerJoin(sentences, eq(sentences.id, grammarPointSentences.sentenceId))
    .leftJoin(sentenceTranslations, and(
      eq(sentenceTranslations.sentenceId, sentences.id),
      eq(sentenceTranslations.lang, 'en')
    ))
    .where(and(
      inArray(grammarPointSentences.grammarPointId, pointIds),
      eq(grammarPointSentences.role, 'example'),
      eq(sentences.published, true)
    ))
    .orderBy(asc(grammarPointSentences.grammarPointId), asc(grammarPointSentences.sortIndex))

  if (rows.length === 0)
    return out

  // The same cutter conversations and cloze cards use, so a word tapped in a
  // lesson teaches exactly what the same word taught anywhere else — and so
  // that は/を/へ romanise as wa/o/e here too, which is the one thing a
  // hand-rolled tokeniser gets wrong every time.
  const g = await glossary(languageCode)

  for (const row of rows) {
    const list = out.get(row.pointId) ?? []
    list.push({
      sentenceId: row.sentenceId,
      text: row.text,
      reading: row.reading,
      translation: row.translation,
      audio: assetUrl(`/audio/sentences/${row.sentenceId}.m4a`),
      tokens: glossLine(row.text, g, row.reading ?? undefined)
    })
    out.set(row.pointId, list)
  }

  return out
}

/**
 * Grammar points shaped for the study loop — the lesson shown before the first
 * question, and the hint available on every one after it.
 *
 * `withExamples` is false for hints: a hint is the pattern and how it attaches,
 * and loading four sentences per card to render two lines would be waste.
 */
export async function loadLessons(
  languageCode: string,
  pointIds: string[],
  withExamples: boolean
): Promise<Map<string, StudyLesson>> {
  const out = new Map<string, StudyLesson>()
  if (pointIds.length === 0)
    return out

  const points = await db
    .select({
      id: grammarPoints.id,
      slug: grammarPoints.slug,
      title: grammarPoints.title,
      pattern: grammarPoints.pattern,
      meaningShort: grammarPoints.meaningShort,
      meaningLong: grammarPoints.meaningLong,
      nuance: grammarPoints.nuance
    })
    .from(grammarPoints)
    .where(inArray(grammarPoints.id, pointIds))

  if (points.length === 0)
    return out

  const formations = await db
    .select({
      grammarPointId: grammarFormations.grammarPointId,
      ruleTemplate: grammarFormations.ruleTemplate,
      example: grammarFormations.example
    })
    .from(grammarFormations)
    .where(inArray(grammarFormations.grammarPointId, points.map(p => p.id)))
    .orderBy(asc(grammarFormations.sortIndex))

  // One mistake, not all of them. A lesson card is read once before a question;
  // the full list belongs on the reference page.
  const mistakes = await db
    .select({
      grammarPointId: grammarMistakes.grammarPointId,
      wrong: grammarMistakes.wrong,
      right: grammarMistakes.right,
      whyWrong: grammarMistakes.whyWrong
    })
    .from(grammarMistakes)
    .where(inArray(grammarMistakes.grammarPointId, points.map(p => p.id)))
    .orderBy(asc(grammarMistakes.sortIndex))

  const examples = withExamples ? await loadExamples(languageCode, points.map(p => p.id)) : new Map()
  const lexicon = await getLexicon(languageCode)

  for (const p of points) {
    out.set(p.id, {
      slug: p.slug,
      title: p.title,
      titleFurigana: annotate(p.title, lexicon),
      pattern: p.pattern,
      meaningShort: p.meaningShort,
      meaningLong: p.meaningLong,
      nuance: p.nuance,
      formations: formations.filter(f => f.grammarPointId === p.id).map(({ grammarPointId: _d, ...r }) => r),
      mistake: mistakes.find(m => m.grammarPointId === p.id)
        ? (({ grammarPointId: _d, ...r }) => r)(mistakes.find(m => m.grammarPointId === p.id)!)
        : null,
      examples: examples.get(p.id) ?? [],
      href: `${ROUTE_BASE_PATHS.GRAMMAR}/${encodeURIComponent(p.slug)}`
    })
  }

  return out
}

/** The Show Hints payload: the pattern and how it attaches, never the answer. */
export function hintFromLesson(lesson: StudyLesson): StudyHint {
  return { pattern: lesson.pattern, formations: lesson.formations, href: lesson.href }
}

/**
 * Grammar reference.
 *
 * Only PUBLISHED etymology is returned. An entry sitting at 'in-review' is
 * invisible to readers — that is the whole point of the review gate, and it is
 * enforced here as well as by the CHECK constraints on the table.
 */

export async function listGrammar(languageCode: string): Promise<GrammarListResponse> {
  const rows = await db
    .select({
      slug: grammarPoints.slug,
      title: grammarPoints.title,
      pattern: grammarPoints.pattern,
      meaningShort: grammarPoints.meaningShort,
      category: grammarPoints.category,
      level: languageLevels.code,
      etymologyId: etymologyEntries.id
    })
    .from(grammarPoints)
    .innerJoin(languages, eq(languages.id, grammarPoints.languageId))
    .leftJoin(languageLevels, eq(languageLevels.id, grammarPoints.levelId))
    .leftJoin(etymologyEntries, and(
      eq(etymologyEntries.grammarPointId, grammarPoints.id),
      eq(etymologyEntries.status, 'published')
    ))
    .where(and(eq(languages.code, languageCode), eq(grammarPoints.published, true)))
    .orderBy(asc(grammarPoints.sortIndex))

  const lexicon = await getLexicon(languageCode)

  return {
    points: rows.map(r => ({
      slug: r.slug,
      title: r.title,
      titleFurigana: annotate(r.title, lexicon),
      pattern: r.pattern,
      meaningShort: r.meaningShort,
      category: r.category,
      level: r.level,
      hasEtymology: r.etymologyId !== null
    }))
  }
}

export async function getGrammarPoint(languageCode: string, slug: string): Promise<GrammarPointView | null> {
  const [point] = await db
    .select({
      id: grammarPoints.id,
      slug: grammarPoints.slug,
      title: grammarPoints.title,
      pattern: grammarPoints.pattern,
      category: grammarPoints.category,
      register: grammarPoints.register,
      level: languageLevels.code,
      meaningShort: grammarPoints.meaningShort,
      meaningLong: grammarPoints.meaningLong,
      nuance: grammarPoints.nuance,
      status: grammarPoints.status
    })
    .from(grammarPoints)
    .innerJoin(languages, eq(languages.id, grammarPoints.languageId))
    .leftJoin(languageLevels, eq(languageLevels.id, grammarPoints.levelId))
    .where(and(
      eq(languages.code, languageCode),
      eq(grammarPoints.slug, slug),
      eq(grammarPoints.published, true)
    ))
    .limit(1)

  if (!point)
    return null

  const formations = await db
    .select({
      attachesTo: grammarFormations.attachesTo,
      ruleTemplate: grammarFormations.ruleTemplate,
      example: grammarFormations.example,
      notes: grammarFormations.notes
    })
    .from(grammarFormations)
    .where(eq(grammarFormations.grammarPointId, point.id))
    .orderBy(asc(grammarFormations.sortIndex))

  const mistakes = await db
    .select({
      wrong: grammarMistakes.wrong,
      right: grammarMistakes.right,
      whyWrong: grammarMistakes.whyWrong,
      explanation: grammarMistakes.explanation
    })
    .from(grammarMistakes)
    .where(eq(grammarMistakes.grammarPointId, point.id))
    .orderBy(asc(grammarMistakes.sortIndex))

  const entries = await db
    .select({
      id: etymologyEntries.id,
      aspect: etymologyEntries.aspect,
      claim: etymologyEntries.claim,
      body: etymologyEntries.body,
      period: etymologyEntries.period,
      confidence: etymologyEntries.confidence,
      isDisputed: etymologyEntries.isDisputed
    })
    .from(etymologyEntries)
    .where(and(
      eq(etymologyEntries.grammarPointId, point.id),
      eq(etymologyEntries.status, 'published')
    ))
    .orderBy(asc(etymologyEntries.isPrimary))

  const citations = entries.length === 0
    ? []
    : await db
        .select({
          etymologyId: etymologySources.etymologyId,
          source: sources.title,
          abbreviation: sources.abbreviation,
          url: sources.url,
          locator: etymologySources.locator,
          quote: etymologySources.quote,
          reliabilityTier: sources.reliabilityTier
        })
        .from(etymologySources)
        .innerJoin(sources, eq(sources.id, etymologySources.sourceId))
        .where(inArray(etymologySources.etymologyId, entries.map(e => e.id)))
        .orderBy(asc(sources.reliabilityTier), asc(etymologySources.sortIndex))

  // Contrasts, resolved to the other point's slug so the page can link across.
  const related = await db
    .select({
      slug: grammarPoints.slug,
      title: grammarPoints.title,
      kind: grammarPointRelationships.kind,
      note: grammarPointRelationships.note
    })
    .from(grammarPointRelationships)
    .innerJoin(grammarPoints, eq(grammarPoints.id, grammarPointRelationships.toId))
    .where(eq(grammarPointRelationships.fromId, point.id))

  const resolved = entries.map(e => ({
    ...e,
    citations: citations
      .filter(c => c.etymologyId === e.id)
      .map(({ etymologyId: _drop, ...rest }) => rest)
  }))

  // Ruby for the prose. Every explanation on this page is written in mixed
  // English and Japanese, and the Japanese half carried no readings at all —
  // which made the pages that explain the language the least readable thing in
  // the app.
  const lexicon = await getLexicon(languageCode)
  const ruby = (text: string | null) => annotate(text ?? '', lexicon)

  const examples = (await loadExamples(languageCode, [point.id])).get(point.id) ?? []

  return {
    ...point,
    inReview: point.status !== 'published',
    formations,
    mistakes,
    related,
    examples,
    etymology: resolved,
    furigana: {
      pattern: ruby(point.pattern),
      meaningLong: ruby(point.meaningLong),
      nuance: ruby(point.nuance),
      formations: formations.map(f => ({
        ruleTemplate: ruby(f.ruleTemplate),
        example: ruby(f.example),
        notes: ruby(f.notes)
      })),
      mistakes: mistakes.map(m => ({
        wrong: ruby(m.wrong),
        right: ruby(m.right),
        whyWrong: ruby(m.whyWrong),
        explanation: ruby(m.explanation)
      })),
      etymology: resolved.map(e => ({
        claim: ruby(e.claim),
        body: ruby(e.body)
      }))
    }
  }
}
