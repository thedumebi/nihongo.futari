/**
 * Every typed answer accepts every common spelling of its words: 友達 where
 * the sentence wrote 友だち, 在ります, 聴いた. See lib/answer-spellings.ts.
 */
import { widenAnswerSpellings } from './lib/answer-spellings.js'

export async function run(): Promise<void> {
  await widenAnswerSpellings()
}
