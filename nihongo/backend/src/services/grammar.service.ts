import type { GrammarListResponse, GrammarPointView } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import {
  etymologyEntries,
  etymologySources,
  grammarFormations,
  grammarMistakes,
  grammarPointRelationships,
  grammarPoints,
  languageLevels,
  languages,
  sources
} from '@nihongo/shared/db/schema'
import { annotate } from '@nihongo/shared/lib'
import { and, asc, eq, inArray } from 'drizzle-orm'

import { getLexicon } from './lexicon.service.js'

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

  return {
    ...point,
    inReview: point.status !== 'published',
    formations,
    mistakes,
    related,
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
