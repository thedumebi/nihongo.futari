import type { Lexicon } from '@nihongo/shared/lib'

import db from '@nihongo/shared/db'
import { languages, words } from '@nihongo/shared/db/schema'
import { buildLexicon } from '@nihongo/shared/lib'
import { and, eq, isNotNull } from 'drizzle-orm'

/**
 * The reading lexicon, built once per process.
 *
 * ~8,000 rows and a furigana alignment each, so it is far too much work to do
 * per request and far too little to be worth a table. Built lazily on the
 * first page that needs it and kept for the life of the process.
 *
 * Not invalidated: the word list changes only when an importer runs, and an
 * importer run is followed by a deploy. A stale lexicon would at worst miss
 * readings for words added since boot.
 */
const cache = new Map<string, Promise<Lexicon>>()

export function getLexicon(languageCode: string): Promise<Lexicon> {
  const existing = cache.get(languageCode)
  if (existing)
    return existing

  const built = load(languageCode)
  cache.set(languageCode, built)
  // A failure must not be cached, or the process never recovers.
  built.catch(() => cache.delete(languageCode))
  return built
}

async function load(languageCode: string): Promise<Lexicon> {
  const [language] = await db
    .select({ id: languages.id })
    .from(languages)
    .where(eq(languages.code, languageCode))
    .limit(1)
  if (!language)
    return buildLexicon([])

  const rows = await db
    .select({ form: words.primaryForm, reading: words.primaryReading })
    .from(words)
    .where(and(
      eq(words.languageId, language.id),
      eq(words.published, true),
      isNotNull(words.primaryReading)
    ))

  return buildLexicon(rows.map(r => [r.form, r.reading ?? '']))
}
