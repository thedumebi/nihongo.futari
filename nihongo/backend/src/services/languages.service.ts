import type { LanguageSummary } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { languageLevels, languages, studyItems } from '@nihongo/shared/db/schema'
import { and, asc, eq, sql } from 'drizzle-orm'

/**
 * Languages available to study.
 *
 * `itemCount` matters to the picker: the schema is multi-language from day one,
 * so a language can exist with no content yet. Showing that plainly beats
 * letting someone pick French and land on an empty queue.
 */
export async function listLanguages(): Promise<LanguageSummary[]> {
  const rows = await db
    .select({
      id: languages.id,
      code: languages.code,
      name: languages.name,
      nativeName: languages.nativeName,
      sortIndex: languages.sortIndex
    })
    .from(languages)
    .where(eq(languages.active, true))
    .orderBy(asc(languages.sortIndex))

  if (rows.length === 0)
    return []

  const levels = await db
    .select({
      id: languageLevels.id,
      languageId: languageLevels.languageId,
      code: languageLevels.code,
      name: languageLevels.name,
      rank: languageLevels.rank
    })
    .from(languageLevels)
    .orderBy(asc(languageLevels.rank))

  const counts = await db
    .select({
      languageId: studyItems.languageId,
      total: sql<number>`count(*)`.mapWith(Number)
    })
    .from(studyItems)
    .where(and(eq(studyItems.published, true), eq(studyItems.active, true)))
    .groupBy(studyItems.languageId)

  const countBy = new Map(counts.map(c => [c.languageId, c.total]))

  return rows.map(r => ({
    id: r.id,
    code: r.code,
    name: r.name,
    nativeName: r.nativeName,
    levels: levels
      .filter(l => l.languageId === r.id)
      .map(({ id, code, name, rank }) => ({ id, code, name, rank })),
    itemCount: countBy.get(r.id) ?? 0
  }))
}
