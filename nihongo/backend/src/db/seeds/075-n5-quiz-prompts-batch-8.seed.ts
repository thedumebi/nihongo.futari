/**
 * Quiz questions for the batch 8 example sentences.
 *
 * Requires the batch 8 tokens from 074, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
