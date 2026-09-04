/**
 * Quiz questions for the batch 10 example sentences.
 *
 * Requires the batch 10 tokens from 078, which sorts first.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
