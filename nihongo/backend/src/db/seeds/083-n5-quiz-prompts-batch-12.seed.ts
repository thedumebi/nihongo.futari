/**
 * Quiz questions for the batch 12 example sentences.
 *
 * Requires the batch 12 tokens from 082, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
