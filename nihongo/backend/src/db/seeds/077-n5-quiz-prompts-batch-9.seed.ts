/**
 * Quiz questions for the batch 9 example sentences.
 *
 * Requires the batch 9 tokens from 076, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
