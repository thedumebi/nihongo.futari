/**
 * Quiz questions for the batch 6 example sentences.
 *
 * Requires the batch 6 tokens from 070, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
