/**
 * Quiz questions for the batch 11 example sentences.
 *
 * Requires the batch 11 tokens from 080, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
