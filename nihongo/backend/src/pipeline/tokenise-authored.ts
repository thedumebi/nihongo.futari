/* eslint-disable no-console */
/**
 * Give authored sentences the tokens the quiz generators read.
 *
 *   pnpm -C nihongo/backend tokenise:authored
 *   pnpm -C nihongo/backend tokenise:authored -- --emit-sql
 *
 * The blocker this exists for: `import-cloze` takes its blank span from
 * `sentence_tokens.char_start/char_end` and `import-word-order` takes its chips
 * and their ruby from the same table, but NOTHING in this repo can tokenise a
 * sentence we wrote ourselves. Tatoeba's tokens arrive pre-made in the corpus
 * (`import-sentences.ts` just copies them); a grep for kuromoji returns
 * nothing. So authored sentences had 0 token rows against Tatoeba's 8,613, and
 * every quiz derived from them would have been empty.
 *
 * Tokens come from `glossLine` — the same cutter the lesson deck, the study
 * card and the conversation lines already render with. That matters more than
 * it sounds: `check:examples` already REFUSES any authored sentence glossLine
 * cannot cut cleanly, so the checker becomes the guarantee that these rows are
 * right. Adding a second tokeniser (kuromoji) would have segmented differently,
 * and the word-order chips would stop matching the words you can tap in the
 * lesson above them.
 *
 * `--emit-sql` prints idempotent INSERTs for the batch, because production runs
 * migrations and seeds only — a pipeline script's output has to travel as SQL.
 */
import type { GlossedToken } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { sentences, sentenceTokens, words } from '@nihongo/shared/db/schema'
import { alignFurigana, alignInflected } from '@nihongo/shared/lib'
import { and, eq, inArray, notExists, sql } from 'drizzle-orm'

import { glossary, glossLine } from '../services/glossary.service.js'

interface Row { sentenceId: string, index: number, surface: string, reading: string | null, wordId: string | null, charStart: number, charEnd: number, furigana: Array<{ t: string, r?: string }> }

/**
 * This token's reading and its ruby, or neither.
 *
 * The DICTIONARY reading is tried first and the line's own cut second.
 *
 * `glossLine`'s per-token reading comes from `splitReading`, which exists to
 * space romaji: inside a run of kanji it puts the whole run's reading on the
 * first character, because slicing anywhere in the run still romanises
 * correctly. That is right for its purpose and wrong for ruby — 毎朝早く came
 * back with 毎朝 annotated まいあさ はや, carrying 早's reading into the word
 * before it. The dictionary knows 毎朝 is まいあさ and has no such problem.
 *
 * The line's cut is still needed for anything inflected: the dictionary holds
 * 行く/いく, and only the sentence knows this one says 行きます/いきます.
 *
 * If neither aligns, the token gets no reading at all. A word shown with no
 * furigana is a gap; a word shown with the wrong furigana teaches the wrong
 * thing, and 早く annotated く is worse than 早く annotated nothing.
 */
function readingFor(token: GlossedToken): { reading: string | null, furigana: Array<{ t: string, r?: string }> } {
  // Whitespace stripped, not trimmed: a token is ONE word, so no space belongs
  // inside its reading. The authoring format spaces words apart — 電話 して —
  // and those spaces ride through onto the token as ' でんわ して'.
  const clean = (r: unknown) => (typeof r === 'string' ? r.replace(/\s+/g, '') : '')

  for (const r of [clean(token.w?.reading), clean(token.r)]) {
    if (!r || r === token.t)
      continue
    const aligned = alignFurigana(token.t, r)
    if (aligned.confidence > 0)
      return { reading: r, furigana: aligned.segments }
  }

  // The word INFLECTED, which is neither its dictionary reading nor a reading
  // the line could supply.
  //
  // 早く is 早い bent into an adverb: the dictionary says はやい, which does not
  // align with 早く, and the line's own cut gave just く. It ended up with no
  // reading at all — and a chip with no ruby renders as the bare kanji, so the
  // word-order question showed 早く with "早 ku" over it in romaji mode. A
  // beginner cannot read that, which is the whole reason furigana exists.
  //
  // `alignInflected` knows the trick: align the LEMMA, keep the reading of its
  // kanji stem, and let the okurigana differ.
  const w = token.w
  if (w?.form && w.reading) {
    const aligned = alignInflected(token.t, w.form, clean(w.reading))
    if (aligned.confidence > 0) {
      const reading = aligned.segments.map(seg => seg.r ?? seg.t).join('')
      return { reading, furigana: aligned.segments }
    }
  }

  return { reading: null, furigana: [{ t: token.t }] }
}

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
async function wordIdsByForm(): Promise<Map<string, string>> {
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

function tokenise(id: string, text: string, reading: string | null, g: Awaited<ReturnType<typeof glossary>>, ids: Map<string, string>): Row[] {
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
      charStart,
      charEnd: cursor,
      furigana
    })
  })

  return rows
}

const emitSql = process.argv.includes('--emit-sql')
// `--all` re-reads sentences that already have tokens. Needed when a sentence
// is REWORDED: its old tokens still exist, so the default query skips it and
// the emitted SQL would describe the sentence as it used to be.
const all = process.argv.includes('--all')

async function main(): Promise<void> {
  // Only sentences with no tokens at all, so a re-run is free and a partially
  // tokenised sentence is never half-rewritten.
  const pending = await db
    .select({ id: sentences.id, text: sentences.text, reading: sentences.readingKana })
    .from(sentences)
    .where(all
      ? sql`${sentences.source} = 'authored'`
      : sql`${sentences.source} = 'authored' and ${notExists(
        db.select({ one: sql`1` }).from(sentenceTokens).where(eq(sentenceTokens.sentenceId, sentences.id))
      )}`)

  if (pending.length === 0) {
    console.log('Every authored sentence already has tokens.')
    return
  }

  const g = await glossary('ja')
  const ids = await wordIdsByForm()
  const tokens = pending.flatMap(s => tokenise(s.id, s.text, s.reading, g, ids))

  const lit = (v: string) => `'${v.replace(/'/g, "''")}'`

  if (emitSql) {
    console.log('-- Tokens for the authored sentences in this batch.')
    console.log('-- Produced by `pnpm -C nihongo/backend tokenise:authored -- --emit-sql`.')
    // Delete-then-insert rather than ON CONFLICT, because a REWORDED sentence
    // usually has a DIFFERENT number of tokens. An upsert updates the indexes
    // it has rows for and leaves any trailing ones from the longer old sentence
    // in place, so the sentence ends with words it no longer contains.
    //
    // (`sentence_tokens_unique (sentence_id, index)` does exist, so an upsert
    // would run — it would just be wrong here.)
    console.log(`DELETE FROM sentence_tokens WHERE sentence_id IN (${pending.map(s => lit(s.id)).join(', ')});`)
    console.log('INSERT INTO sentence_tokens (id, sentence_id, index, surface, reading, word_id, char_start, char_end, furigana) VALUES')
    console.log(`${tokens.map(r =>
      `  (gen_random_uuid()::text, ${lit(r.sentenceId)}, ${r.index}, ${lit(r.surface)}, `
      + `${r.reading === null ? 'NULL' : lit(r.reading)}, ${r.wordId === null ? 'NULL' : lit(r.wordId)}, `
      + `${r.charStart}, ${r.charEnd}, ${lit(JSON.stringify(r.furigana))}::jsonb)`
    ).join(',\n')};`)
    return
  }

  // The same delete-then-insert the emitted SQL does, and for the same reason.
  //
  // `onConflictDoNothing` alone made `--all` a no-op that reported success:
  // every row conflicted on (sentence_id, index), nothing was written, and the
  // script still printed "150 tokens written". The one thing the flag exists
  // for — refreshing a sentence that changed — silently did not happen.
  if (all) {
    await db.delete(sentenceTokens).where(inArray(sentenceTokens.sentenceId, pending.map(s => s.id)))
  }

  for (let i = 0; i < tokens.length; i += 500)
    await db.insert(sentenceTokens).values(tokens.slice(i, i + 500)).onConflictDoNothing()

  console.log(`${pending.length} sentences tokenised, ${tokens.length} tokens written.`)
  const tappable = tokens.filter(r => r.wordId !== null).length
  console.log(`  ${tappable}/${tokens.length} tokens link to a dictionary word (the tappable ones).`)
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Tokenising failed:', err)
    process.exit(1)
  })
