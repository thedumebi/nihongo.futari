import type { RecallSession } from '@/types/recall.js'
import type { SpeakStepView } from '@/types/speak.js'

/**
 * Recall: a hands-free session over the learner's own words, Pimsleur style.
 *
 * The English is spoken, a pause leaves time to say the Japanese, then the
 * Japanese is heard. A word comes back within the session at growing gaps —
 * after one other word, then three, then seven — which is the graduated
 * interval that makes a new word stick before the session ends.
 */

/**
 * The English said for a word: its first meaning, asides removed.
 *
 * Shared by the generator that records the clip and the server that names it,
 * so the two always agree on the text — the clip's key is a hash of it.
 */
export function recallGloss(glosses: readonly string[]): string {
  const first = glosses.find(g => g.trim()) ?? ''
  const gloss = first.replace(/\s*\([^)]*\)/g, '').replace(/\s+/g, ' ').trim()
  // A suffix ("-ness", "-ian") cannot be said on its own, so it is no prompt
  // to answer aloud — and \`say\` reads the leading hyphen as an option and
  // fails. Empty means "not a Recall word".
  return gloss.startsWith('-') ? '' : gloss
}

/** How many other items come between one asking of a word and the next. */
export const RECALL_GAPS = [1, 3, 7] as const

/**
 * The order to ask `count` words in, as indices into the list: every word
 * first asked in order, then asked again after each gap in `RECALL_GAPS`.
 * Pure, so the same list always plays the same way.
 *
 * Gaps hold while there are new words to put between the repeats. At the
 * very end there are none, and the last repeats close up — but a word is never
 * asked twice in a row.
 */
export function recallSchedule(count: number, gaps: readonly number[] = RECALL_GAPS): number[] {
  // Each word is asked 1 + gaps.length times. Place them greedily: at every
  // slot, the earliest-due repeat whose gap has elapsed, else the next new word.
  const pending: Array<{ index: number, dueAt: number, round: number }> = []
  const out: number[] = []
  let next = 0
  while (next < count || pending.length > 0) {
    const position = out.length
    pending.sort((a, b) => a.dueAt - b.dueAt || a.index - b.index)
    const ready = pending[0] && pending[0].dueAt <= position ? pending.shift()! : null
    const last = out[out.length - 1]
    // Out of new words: the earliest repeat that is not the word just asked.
    const fallback = () => {
      const at = pending.findIndex(p => p.index !== last)
      return pending.splice(at === -1 ? 0 : at, 1)[0]!
    }
    const item = ready ?? (next < count ? { index: next++, dueAt: position, round: -1 } : fallback())
    out.push(item.index)
    const round = item.round + 1
    if (round < gaps.length)
      pending.push({ index: item.index, dueAt: out.length + gaps[round]!, round })
  }
  return out
}

/** Small kana that join the one before into a single sound: きょ, しゃ, ティ. */
const SMALL = new Set([...'ゃゅょぁぃぅぇぉャュョァィゥェォ'])

/**
 * The first sound of a reading — き in きって, きょ in きょう, ひ in ひとつ.
 *
 * The hint when an English prompt could mean more than one word the learner
 * has: "one" is いち or ひとつ, and "one … ひ" says which is wanted. A leading
 * small っ or long-vowel mark is not a sound to start on, so none is offered.
 */
export function firstMora(reading: string): string {
  const chars = [...reading.trim()]
  const first = chars[0]
  if (!first || first === 'っ' || first === 'ッ' || first === 'ー')
    return ''
  return chars[1] && SMALL.has(chars[1]) ? first + chars[1] : first
}

/**
 * Which English prompts are ambiguous for this learner: said for two or more
 * different words they are learning. Compared as said — case and spacing
 * aside — since that is what the learner hears.
 */
export function ambiguousPrompts(prompts: ReadonlyArray<{ word: string, prompt: string }>): Set<string> {
  const said = (p: string) => p.toLowerCase().replace(/\s+/g, ' ').trim()
  const words = new Map<string, Set<string>>()
  for (const { word, prompt } of prompts) {
    if (!prompt)
      continue
    const key = said(prompt)
    words.set(key, (words.get(key) ?? new Set()).add(word))
  }
  return new Set([...words].filter(([, ws]) => ws.size > 1).map(([key]) => key))
}

/**
 * A Recall session as the steps of the hands-free player Speak uses, so both
 * play, pause, go back and pace the same way.
 *
 * Each asking is one step, repeats included, in `order`. The English is said
 * first; a hint's clip comes after it, shown as "starts with ひ". `tags`
 * marks a word asked before in the session, which comes back on purpose.
 */
export function recallSteps(session: RecallSession): { steps: SpeakStepView[], tags: Array<string | null> } {
  const steps: SpeakStepView[] = []
  const tags: Array<string | null> = []
  const asked = new Set<number>()
  session.order.forEach((at, index) => {
    const item = session.items[at]
    if (!item)
      return
    const [first = null, ...rest] = item.promptAudio
    const hintClip = item.hint ? rest.pop() ?? null : null
    steps.push({
      index,
      kind: 'prompt',
      say: [
        { lang: 'en', text: item.prompt, audio: first },
        // A Speak prompt's English may come in several clips; they play in turn.
        ...rest.map(audio => ({ lang: 'en' as const, text: '', audio })),
        ...(item.hint ? [{ lang: 'en' as const, text: '(starts with', audio: null }, { lang: 'ja' as const, text: `${item.hint})`, audio: hintClip }] : [])
      ],
      text: item.text,
      reading: item.reading,
      note: null,
      tokens: [],
      answerAudio: item.answerAudio
    })
    tags.push(asked.has(at) ? 'again' : null)
    asked.add(at)
  })
  return { steps, tags }
}
