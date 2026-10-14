import type { GlossedToken } from '@nihongo/shared/types'

import { hasKanji, toHiragana } from '@nihongo/shared/lib'

/** Only kanji: a token that sits wholly inside a run. */
const allKanji = (text: string) => [...text].every(c => hasKanji(c))

/**
 * Give each word in a run of kanji its own reading.
 *
 * The reading walk cuts at kana anchors, so a run like 時間英語 gets its whole
 * reading on 時間 and nothing on 英語. Every mode then went wrong: kana mode
 * printed `じかんえいご英語`, furigana sat じかんえいご over two characters.
 *
 * The words after the first are taken from the END of the run's reading using
 * their dictionary reading; whatever is left belongs to the first. If any piece
 * fails to match, the run is left as it was — a reading on the wrong word
 * beats a reading cut in the wrong place.
 */
export function splitKanjiRuns(
  tokens: GlossedToken[],
  readingOf: (surface: string) => string | undefined
): GlossedToken[] {
  const out = tokens.map(t => ({ ...t }))
  for (let i = 0; i < out.length; i += 1) {
    const head = out[i]!
    if (!head.r)
      continue
    let end = i + 1
    while (end < out.length && out[end]!.r === '' && allKanji(out[end]!.t))
      end += 1
    if (end === i + 1)
      continue

    const lead = /^\s*/.exec(head.r)![0]
    let body = head.r.slice(lead.length).replace(/\s+/g, '')
    const pieces: string[] = []
    let ok = true
    for (let k = end - 1; k > i; k -= 1) {
      const dict = readingOf(out[k]!.t)
      const tail = dict ? toHiragana(dict) : ''
      if (!tail || !toHiragana(body).endsWith(tail) || body.length <= tail.length) {
        ok = false
        break
      }
      pieces.unshift(body.slice(body.length - tail.length))
      body = body.slice(0, body.length - tail.length)
    }
    if (!ok)
      continue
    head.r = lead + body
    pieces.forEach((r, k) => {
      out[i + 1 + k]!.r = r
    })
    i = end - 1
  }
  return out
}
