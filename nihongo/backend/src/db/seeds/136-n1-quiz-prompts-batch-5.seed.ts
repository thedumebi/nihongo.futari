/**
 * Quiz questions for the batch 5 example sentences.
 *
 * Requires the batch 5 tokens from 135, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
