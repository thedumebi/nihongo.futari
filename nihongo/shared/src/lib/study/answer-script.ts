import type { AnswerScript } from '@/constants/endpoints.js'
import type { StudyQueueItem } from '@/types/study.js'

import { scriptOf } from '../ja/script/index.js'

/**
 * What a card wants typed, drawn or picked, named so the cue above the answer
 * can say it out loud.
 *
 * The placeholder used to be the only place this was said, and it vanished on
 * the first keystroke: a kana card after a romaji card looked identical until
 * the answer came back wrong. Decided from the grader and the accepted forms
 * rather than the instruction text, so it says what is actually checked.
 *
 * Also takes a lesson question, which has the same three fields.
 */
export function answerScriptFor(card: Pick<StudyQueueItem, 'inputMode' | 'graderCode' | 'answer'>): AnswerScript {
  switch (card.inputMode) {
    case 'canvas':
      return 'write'
    case 'choice':
      return 'choose'
    case 'ordering':
      return 'order'
    case 'none':
    case 'audio':
      return 'say'
    default:
      // 'text', and any mode added later: a typed answer, named below.
      break
  }
  if (card.graderCode === 'fuzzy-romaji')
    return 'romaji'

  const forms = [card.answer.primary, ...card.answer.accepted].filter(Boolean)
  const scripts = new Set(forms.map(scriptOf))
  if (scripts.size === 0 || (scripts.size === 1 && scripts.has('other')))
    return 'english'
  scripts.delete('other')

  if (card.graderCode === 'exact-kana')
    return scripts.size === 1 && scripts.has('katakana') ? 'katakana' : 'kana'
  if (scripts.size > 1)
    return 'japanese'
  const [only] = scripts
  if (only === 'kanji' || only === 'hiragana' || only === 'katakana')
    return only
  return 'japanese'
}

/** Whether romaji typed on this card is read as kana and counts. */
export function takesRomaji(script: AnswerScript): boolean {
  return script === 'kana' || script === 'hiragana' || script === 'katakana'
}

interface AnswerScriptInfo {
  /** Short and visual: what the chip shows. */
  glyph: string
  label: string
  /** For the input box, under three words. */
  placeholder: string
}

/**
 * How each answer type is shown. One set, read by Study's cue, the lesson quiz
 * and the Study tour, so a type is never described two ways.
 */
export const ANSWER_SCRIPT_INFO: Record<AnswerScript, AnswerScriptInfo> = {
  romaji: { glyph: 'Aa', label: 'Answer in romaji', placeholder: 'Type in romaji' },
  kana: { glyph: 'かな', label: 'Answer in kana', placeholder: 'Type in kana' },
  hiragana: { glyph: 'あ', label: 'Answer in hiragana', placeholder: 'Type in hiragana' },
  katakana: { glyph: 'ア', label: 'Answer in katakana', placeholder: 'Type in katakana' },
  kanji: { glyph: '漢', label: 'Answer in kanji', placeholder: 'Type in kanji' },
  japanese: { glyph: '日本', label: 'Answer in Japanese', placeholder: 'Type in Japanese' },
  english: { glyph: 'EN', label: 'Answer in English', placeholder: 'Type in English' },
  write: { glyph: '✎', label: 'Write it', placeholder: '' },
  choose: { glyph: '☰', label: 'Pick one', placeholder: '' },
  order: { glyph: '⇄', label: 'Put it in order', placeholder: '' },
  say: { glyph: '♪', label: 'Say it aloud', placeholder: '' }
}
