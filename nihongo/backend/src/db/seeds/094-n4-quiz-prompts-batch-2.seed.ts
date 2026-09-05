/**
 * Quiz questions for the batch 2 example sentences.
 *
 * Requires the batch 2 tokens from 093, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
