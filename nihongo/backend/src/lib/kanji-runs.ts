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
 * Two shapes, both put right with the dictionary reading of a word:
 *
 *  - Every later word is all kanji (時間|英語): their readings are taken from
 *    the END of the run's reading; what is left belongs to the first.
 *  - The run ends inside a word with kana in it (今|起きた): the walk gave 今
 *    いまお and 起きた きた. 今 is all kanji, so its dictionary reading いま is
 *    peeled off the front and the お moves on to 起きた.
 *
 * Every cut must match the dictionary exactly. If any piece does not, the run
 * is left as it was — a reading on the wrong word beats a reading cut in the
 * wrong place.
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

  for (let i = 0; i + 1 < out.length; i += 1) {
    const head = out[i]!
    const next = out[i + 1]!
    if (!head.r || next.r === undefined || !allKanji(head.t) || !hasKanji([...next.t][0]!) || allKanji(next.t))
      continue
    const dict = readingOf(head.t)
    if (!dict)
      continue
    const lead = /^\s*/.exec(head.r)![0]
    const body = head.r.slice(lead.length).replace(/\s+/g, '')
    const own = toHiragana(dict)
    if (body.length <= own.length || !toHiragana(body).startsWith(own))
      continue
    head.r = lead + body.slice(0, own.length)
    next.r = body.slice(own.length) + next.r.trimStart()
  }
  return out
}
