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
const KANJI = /^[\u4E00-\u9FFF]+$/

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
  const problems: string[] = []
  const warnings: string[] = []

  // A run of bare single kana means a word the index does not hold.
  //
  // です and the polite tails are exempt: the index holds neither, so EVERY
  // sentence in the app splits です into で|す, conversations included. That is
  // a gap in the tokeniser rather than in this corpus, and failing every
  // polite sentence over it would make the check useless.
  const EXEMPT = new Set(['です', 'ます', 'ました', 'ません', 'でした'])
  // A run made only of particles is not shredded text.
  //
  // を, へ and の are not in the dictionary — it holds words — so they carry no
  // gloss and count as bare kana. Alone that is invisible, because the check
  // wants a run of two; but 安いのを買います puts two of them together and the
  // sentence was rejected for being ordinary Japanese.
  const PARTICLE = new Set([...'はがをにでもとやへかのねよ'])
  let run: string[] = []
  for (const t of [...tokens, { t: '', w: undefined }]) {
    if (KANA.test(t.t) && !t.w) {
      run.push(t.t)
      continue
    }
    if (run.length >= 2 && !EXEMPT.has(run.join('')) && !run.every(c => PARTICLE.has(c)))
      problems.push(`shredded into single kana: ${run.join('|')}`)
    run = []
  }

  // Two single kanji side by side: a compound split into its characters.
  //
  // The kana check above cannot see this, because each half is often a real
  // published word on its own — 田中 tokenises as 田 + 中, 七時 as 七 + 時, and
  // both halves gloss fine. It only shows up as a word-order question asking
  // the reader to assemble a name from two characters.
  //
  // A WARNING and not a failure, because the same shape occurs in correct
  // Japanese: 今雨が降っている and 今何を食べる put two unrelated single-kanji
  // words side by side and are both fine. There is no way to tell those from
  // 田中 without knowing the compound, so this asks a human to look rather than
  // refusing the sentence — a hard gate here would block valid writing.
  for (let i = 1; i < tokens.length; i++) {
    const a = tokens[i - 1]!
    const b = tokens[i]!
    if (KANJI.test(a.t) && KANJI.test(b.t) && [...a.t].length === 1 && [...b.t].length === 1)
      warnings.push(`two single kanji adjacent — a split compound, or just two words? ${a.t}|${b.t}`)
  }

  // A particle glued to the end of a longer token: the gloss is then for a
  // word that is not there.
  //
  // Except when the token IS a grammar pattern, because a good many of them end
  // in a particle — ところを, 〜をもとに, 〜が早いか. The gloss there is for
  // exactly what is on the screen, which is the opposite of the fault this rule
  // looks for, and it was failing five topics whose sentences were correct.
  for (const t of tokens) {
    if (t.t.length > 1 && PARTICLES.has(t.t.slice(-1)) && t.w && t.w.pos !== 'grammar')
      problems.push(`particle swallowed: "${t.t}" glossed as "${t.w.meanings[0]}"`)
  }

  // Romaji falls back to the whole line unless every token has a reading.
  if (r.reading && !tokens.some(t => t.r))
    problems.push('no per-token readings — romaji mode cannot space the words')

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
