/**
 * Quiz questions for the batch 1 example sentences.
 *
 * Requires the batch 1 tokens from 091, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
