/**
 * Quiz questions for the batch 13 example sentences.
 *
 * Requires the batch 13 tokens from 084, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
