/**
 * Quiz questions for the batch 4 example sentences.
 *
 * Requires the batch 4 tokens from 121, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
