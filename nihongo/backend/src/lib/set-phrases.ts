/**
 * Fixed expressions, which are words to a learner and not to a dictionary.
 *
 * ありがとうございます came apart as あり | が | と | う | ご | ざ | います —
 * seven pieces, one of them the verb 居る, for the first phrase anybody learns.
 * JMdict is not wrong to leave it out: it is 有り難う plus ございます, each with
 * its own entry, and the polite form is generated rather than listed. But a
 * beginner meets it as one thing, and the greetings lesson is about the phrase,
 * not about its etymology.
 *
 * These are the expressions where the pieces are less useful than the whole.
 * Everything else stays decomposed: 手を洗ってください is a request built out of
 * parts a reader should learn to see, and gluing it together would teach less.
 *
 * Claimed after the real words, so anything JMdict does hold keeps its own
 * gloss — すみません is already an entry and stays one.
 */
import type { WordGloss } from '@nihongo/shared/types'

const PHRASES: Array<[form: string, reading: string, meaning: string]> = [
  // Greetings and partings.
  ['おはよう', 'おはよう', 'good morning (casual)'],
  ['おはようございます', 'おはようございます', 'good morning'],
  ['こんにちは', 'こんにちは', 'hello, good afternoon'],
  ['こんばんは', 'こんばんは', 'good evening'],
  ['さようなら', 'さようなら', 'goodbye'],
  ['おやすみ', 'おやすみ', 'good night (casual)'],
  ['おやすみなさい', 'おやすみなさい', 'good night'],
  ['はじめまして', 'はじめまして', 'how do you do — on first meeting'],

  // Thanks and apologies.
  ['ありがとう', 'ありがとう', 'thank you (casual)'],
  ['ありがとうございます', 'ありがとうございます', 'thank you'],
  ['ありがとうございました', 'ありがとうございました', 'thank you — for something now finished'],
  ['どうもありがとうございます', 'どうもありがとうございます', 'thank you very much'],
  ['どういたしまして', 'どういたしまして', "you're welcome"],
  ['ごめんなさい', 'ごめんなさい', 'sorry'],
  ['失礼します', 'しつれいします', 'excuse me — on entering or leaving'],

  // Coming and going.
  ['いってきます', 'いってきます', "I'm off — said when leaving home"],
  ['いってらっしゃい', 'いってらっしゃい', 'see you — said to someone leaving'],
  ['ただいま', 'ただいま', "I'm home"],
  ['おかえりなさい', 'おかえりなさい', 'welcome back'],

  // At the table.
  ['いただきます', 'いただきます', 'said before eating'],
  ['ごちそうさま', 'ごちそうさま', 'said after eating'],
  ['ごちそうさまでした', 'ごちそうさまでした', 'said after eating (polite)'],

  // The polite verb the rest are built on, so a phrase this list does not hold
  // still comes apart into two pieces rather than seven.
  ['ございます', 'ございます', 'to be — polite'],
  ['ございました', 'ございました', 'was — polite'],

  // The polite tails.
  //
  // Listed rather than left to the pattern indexer, which reads them off the
  // lesson titles and lost ました somewhere between extraction and the index —
  // 246 lines went from き|ました to き|ま|した. They are too common to be
  // subject to that: every polite sentence in the corpus ends in one.
  ['ます', 'ます', 'makes a verb polite'],
  ['ました', 'ました', 'polite past'],
  ['ません', 'ません', 'polite negative'],
  ['ませんでした', 'ませんでした', 'polite negative past'],
  ['ましょう', 'ましょう', "let's — polite"],
  ['でした', 'でした', 'was — polite'],
  // The i-adjective past, with the meaning it actually has.
  //
  // The pattern indexer takes this off whichever topic reaches it first, and
  // that was 〜なかった — so 楽しかった and よかった were glossed "plain negative
  // past", the opposite of what they say.
  ['かった', 'かった', 'past tense of an i-adjective'],

  // Everyday exchanges.
  ['そうですか', 'そうですか', 'I see, is that so'],
  ['そうですね', 'そうですね', "that's right, let me think"],
  ['お願いします', 'おねがいします', 'please'],
  ['よろしくお願いします', 'よろしくおねがいします', 'please — on making a request or an introduction']
]

/** Every phrase, longest first so the fuller form is claimed before its start. */
export function setPhrases(): WordGloss[] {
  return PHRASES
    .map(([form, reading, meaning]) => ({ form, reading, meanings: [meaning], pos: 'expression' }))
    .sort((a, b) => b.form.length - a.form.length)
}
