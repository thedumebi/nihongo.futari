/**
 * Quiz questions for the batch 3 example sentences.
 *
 * Requires the batch 3 tokens from 131, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
