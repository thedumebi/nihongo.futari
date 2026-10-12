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

import { tokenProblems } from '../lib/token-checks.js'
import { glossary, glossLine } from '../services/glossary.service.js'

// Candidate sentences can be checked BEFORE they are seeded:
//
//   pnpm -C nihongo/backend check:examples '毎朝早く起きる。|まいあさ はやく おきる。'
//
// Authoring a sentence, seeding it, and only then discovering the tokeniser
// shreds it means unpicking a seed that has already run. Text before the pipe,
// spoken reading after it (optional).
// `--` survives `pnpm run check:examples -- '…'` and would otherwise be
// checked as a sentence of its own, and counted as one that passed.
const argv = process.argv.slice(2).filter(a => a !== '--')
const rows = argv.length
  ? argv.map((arg, i) => {
      const [text, reading] = arg.split('|')
      return { id: `arg-${i + 1}`, text: text!, reading: reading ?? null }
    })
  : await db
      .select({ id: sentences.id, text: sentences.text, reading: sentences.readingKana })
      .from(sentences)
      .innerJoin(grammarPointSentences, eq(grammarPointSentences.sentenceId, sentences.id))
      .where(eq(sentences.source, 'authored'))

const g = await glossary('ja')
let bad = 0
let warned = 0

for (const r of rows) {
  const tokens = glossLine(r.text, g, r.reading ?? undefined)
  const { problems, warnings } = tokenProblems(tokens, Boolean(r.reading))

  if (problems.length > 0 || warnings.length > 0) {
    if (problems.length > 0)
      bad += 1
    else warned += 1
    console.log(`\n${problems.length > 0 ? '✗' : '⚠'} ${r.id}  ${r.text}`)
    console.log(`   ${tokens.map(t => t.t).join(' | ')}`)
    for (const p of problems) console.log(`   → ${p}`)
    for (const w of warnings) console.log(`   ? ${w}`)
  }
}

console.log(`\n${rows.length - bad}/${rows.length} sentences tokenise cleanly.`)
if (warned > 0)
  console.log(`${warned} to look over — marked ⚠, not counted as failures.`)
process.exit(bad > 0 ? 1 : 0)
