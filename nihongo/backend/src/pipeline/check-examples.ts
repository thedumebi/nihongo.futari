/* eslint-disable no-console */
/**
 * Check every authored example tokenises cleanly.
 *
 *   pnpm -C nihongo/backend check:examples
 *
 * `glossLine` matches longest-first against the dictionary index, so a word it
 * does not hold is shredded into single kana (きのう → き|の|う) and a particle
 * can be swallowed into the token before it (日本語を → 日本 | 語を, glossed as
 * 語る "to talk about"). Both render as nonsense and both are silent.
 *
 * Cheaper to check than to fix the tokeniser, and it makes authoring the rest
 * of the corpus safe: a sentence that fails here gets reworded, not shipped.
 */
import db from '@nihongo/shared/db'
import { grammarPointSentences, sentences } from '@nihongo/shared/db/schema'
import { eq } from 'drizzle-orm'

import { glossary, glossLine } from '../services/glossary.service.js'

// Only を and が. The others double as verb endings — 読んで, 死んで, 飛んだ —
// so flagging them would reject every て-form sentence in the corpus.
const PARTICLES = new Set(['を', 'が'])
// Explicit code points: the literal ranges are unreadable, and eslint rejects
// them for exactly that reason.
const KANA = /^[\u3041-\u309F\u30A0-\u30FF]$/

const rows = await db
  .select({ id: sentences.id, text: sentences.text, reading: sentences.readingKana })
  .from(sentences)
  .innerJoin(grammarPointSentences, eq(grammarPointSentences.sentenceId, sentences.id))
  .where(eq(sentences.source, 'authored'))

const g = await glossary('ja')
let bad = 0

for (const r of rows) {
  const tokens = glossLine(r.text, g, r.reading ?? undefined)
  const problems: string[] = []

  // A run of bare single kana means a word the index does not hold.
  //
  // です and the polite tails are exempt: the index holds neither, so EVERY
  // sentence in the app splits です into で|す, conversations included. That is
  // a gap in the tokeniser rather than in this corpus, and failing every
  // polite sentence over it would make the check useless.
  const EXEMPT = new Set(['です', 'ます', 'ました', 'ません', 'でした'])
  let run: string[] = []
  for (const t of [...tokens, { t: '', w: undefined }]) {
    if (KANA.test(t.t) && !t.w) {
      run.push(t.t)
      continue
    }
    if (run.length >= 2 && !EXEMPT.has(run.join('')))
      problems.push(`shredded into single kana: ${run.join('|')}`)
    run = []
  }

  // A particle glued to the end of a longer token: the gloss is then for a
  // word that is not there.
  for (const t of tokens) {
    if (t.t.length > 1 && PARTICLES.has(t.t.slice(-1)) && t.w)
      problems.push(`particle swallowed: "${t.t}" glossed as "${t.w.meanings[0]}"`)
  }

  // Romaji falls back to the whole line unless every token has a reading.
  if (r.reading && !tokens.some(t => t.r))
    problems.push('no per-token readings — romaji mode cannot space the words')

  if (problems.length > 0) {
    bad += 1
    console.log(`\n✗ ${r.id}  ${r.text}`)
    console.log(`   ${tokens.map(t => t.t).join(' | ')}`)
    for (const p of problems) console.log(`   → ${p}`)
  }
}

console.log(`\n${rows.length - bad}/${rows.length} authored examples tokenise cleanly.`)
process.exit(bad > 0 ? 1 : 0)
