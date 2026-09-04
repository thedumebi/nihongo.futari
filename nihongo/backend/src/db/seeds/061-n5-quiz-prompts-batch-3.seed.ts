/**
 * Quiz questions for the batch 3 example sentences.
 *
 * Three lines instead of a fourth verbatim copy of the derivation — 055, 057
 * and 059 are the first three, which is where that stopped being tolerable.
 * The SQL now lives in `lib/derive-quiz-prompts.ts`; every later batch is a
 * file like this one.
 *
 * Requires the batch 3 tokens from 060, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
