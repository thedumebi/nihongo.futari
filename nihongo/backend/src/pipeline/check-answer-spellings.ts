/* eslint-disable no-console */
/**
 * Every typed answer already accepts every common spelling of its words.
 *
 *   pnpm -C nihongo/backend exec dotenvx run -f .env -- tsx src/pipeline/check-answer-spellings.ts [--list]
 *
 * Runs the same widening as seed 180 without writing, and fails if it would
 * change anything: a prompt made since (an import, a new batch) that never had
 * its spellings added, so 友達 would be refused where the sentence wrote 友だち.
 * The fix is to run `widenAnswerSpellings` (lib/answer-spellings.ts) from the
 * seed that made the prompts.
 */
import { connection } from '@nihongo/shared/db'

import { answerSpellingChanges } from '../db/seeds/lib/answer-spellings.js'

const LIST = process.argv.includes('--list')

async function main() {
  const { sentences, words } = await answerSpellingChanges()
  console.log(`sentence answers missing a spelling: ${sentences.length}`)
  console.log(`word answers missing a spelling: ${words.length}`)
  if (LIST) {
    for (const p of [...sentences, ...words].slice(0, 50))
      console.log(`  ${p.id}  ${JSON.stringify(p.answer)}`)
  }
  await connection.end()
  process.exit(sentences.length + words.length === 0 ? 0 : 1)
}

void main()
