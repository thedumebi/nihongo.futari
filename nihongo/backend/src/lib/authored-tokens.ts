import db from '@nihongo/shared/db'
import { words } from '@nihongo/shared/db/schema'
import { and, eq } from 'drizzle-orm'

import type { glossary } from '../services/glossary.service.js'

import { glossLine } from '../services/glossary.service.js'
import { readingFor } from './token-reading.js'

/**
 * Tokens for a sentence we wrote ourselves, cut by `glossLine`: the cutter
 * every page renders with, so the stored tokens match the words a learner can
 * tap. Used by `tokenise:authored` and by seeds that bring authored sentences
 * in (Particles).
 */

interface Row { sentenceId: string, index: number, surface: string, reading: string | null, wordId: string | null, wordForm: string | null, charStart: number, charEnd: number, furigana: Array<{ t: string, r?: string }> }

/**
 * Dictionary form -> word id.
 *
 * `glossLine` hands back a `WordGloss`, which carries the form, reading,
 * meanings and part of speech but deliberately no id — it exists to be rendered
 * in a popover, not to be joined against. `sentence_tokens.word_id` is what
 * makes a token tappable and what the cloze generator reads to find the target
 * word, so it has to be resolved here. Without this every token came back
 * unlinked: 0 of 155 on the first run, which would have produced tokens that
 * looked right and generated nothing.
 */
export async function wordIdsByForm(): Promise<Map<string, string>> {
  const rows = await db
    .select({ id: words.id, form: words.primaryForm })
    .from(words)
    .where(and(eq(words.languageId, 'lang-ja'), eq(words.published, true)))

  // First wins: `words` is ordered by nothing in particular and two entries can
  // share a spelling, but the glossary already picked ONE gloss per form, so
  // picking one id consistently is what keeps the two agreeing.
  const map = new Map<string, string>()
  for (const r of rows) {
    if (!map.has(r.form))
      map.set(r.form, r.id)
  }
  return map
}

export function tokenise(id: string, text: string, reading: string | null, g: Awaited<ReturnType<typeof glossary>>, ids: Map<string, string>): Row[] {
  const tokens = glossLine(text, g, reading ?? undefined)
  const rows: Row[] = []
  let cursor = 0

  tokens.forEach((token, index) => {
    // Located the same way `import-sentences` locates Tatoeba's: search from
    // where the last token ended, so a repeated word lands on its own position
    // rather than the first occurrence every time.
    const charStart = text.indexOf(token.t, cursor)
    if (charStart < 0)
      return
    cursor = charStart + token.t.length
    const { reading, furigana } = readingFor(token)
    rows.push({
      sentenceId: id,
      index,
      surface: token.t,
      reading,
      wordId: token.w ? ids.get(token.w.form) ?? null : null,
      wordForm: token.w && ids.has(token.w.form) ? token.w.form : null,
      charStart,
      charEnd: cursor,
      furigana
    })
  })

  return rows
}

const lit = (v: string) => `'${v.replace(/'/g, "''")}'`

/**
 * Idempotent SQL for these sentences' tokens, for a seed: production runs
 * migrations and seeds only, so a pipeline's output has to travel as SQL.
 */
export function tokensSql(sentenceIds: readonly string[], tokens: readonly Row[]): string {
  // Delete-then-insert rather than ON CONFLICT, because a REWORDED sentence
  // usually has a DIFFERENT number of tokens. An upsert updates the indexes
  // it has rows for and leaves any trailing ones from the longer old sentence
  // in place, so the sentence ends with words it no longer contains.
  //
  // (`sentence_tokens_unique (sentence_id, index)` does exist, so an upsert
  // would run — it would just be wrong here.)
  const out = [`DELETE FROM sentence_tokens WHERE sentence_id IN (${sentenceIds.map(lit).join(', ')});`]
  out.push('INSERT INTO sentence_tokens (id, sentence_id, index, surface, reading, word_id, char_start, char_end, furigana) VALUES')
  out.push(`${tokens.map(r =>
    `  (gen_random_uuid()::text, ${lit(r.sentenceId)}, ${r.index}, ${lit(r.surface)}, `
    // The word is looked up by SPELLING, not pasted in as an id.
    //
    // `words.id` is a uuid minted by whichever `import:vocab` run built the
    // table, so a seed carrying literal ids only applies to a database
    // descended from the same run — and `sentence_tokens.word_id` has a real
    // foreign key, so a fresh database aborts on the first token seed rather
    // than merely mislinking. Resolving the spelling makes the seed portable.
    + `${r.reading === null ? 'NULL' : lit(r.reading)}, ${r.wordForm === null ? 'NULL' : `(select id from words where primary_form = ${lit(r.wordForm)} and language_id = 'lang-ja' and published order by id limit 1)`}, `
    + `${r.charStart}, ${r.charEnd}, ${lit(JSON.stringify(r.furigana))}::jsonb)`
  ).join(',\n')};`)
  return out.join('\n')
}
