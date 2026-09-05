/**
 * Quiz questions for the last five topics, and a recut for 〜だろう.
 *
 * Requires the tokens from 137, which sorts first. The derivation is by
 * sentence, so rewriting 明日は寒いでしょう to 明日は寒いだろう gives that
 * topic's cloze, word-order and dictation new chips off the new tokens.
 */
import { deriveQuizPrompts } from './lib/derive-quiz-prompts.js'

export async function run(): Promise<void> {
  await deriveQuizPrompts()
}
