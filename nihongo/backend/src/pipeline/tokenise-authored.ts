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

import db from '@nihongo/shared/db'
import { sentences, sentenceTokens } from '@nihongo/shared/db/schema'
import { eq, inArray, notExists, sql } from 'drizzle-orm'

import { tokenise, tokensSql, wordIdsByForm } from '../lib/authored-tokens.js'
import { glossary } from '../services/glossary.service.js'

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

  if (emitSql) {
    console.log('-- Tokens for the authored sentences in this batch.')
    console.log('-- Produced by `pnpm -C nihongo/backend tokenise:authored -- --emit-sql`.')
    console.log(tokensSql(pending.map(s => s.id), tokens))
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
    await db.insert(sentenceTokens).values(tokens.slice(i, i + 500).map(({ wordForm: _drop, ...t }) => t)).onConflictDoNothing()

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
