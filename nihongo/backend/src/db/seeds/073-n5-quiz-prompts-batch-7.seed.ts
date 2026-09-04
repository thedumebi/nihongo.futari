/**
 * Quiz questions for the batch 7 example sentences.
 *
 * Requires the batch 7 tokens from 072, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
