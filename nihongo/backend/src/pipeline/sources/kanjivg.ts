import { readFile } from 'node:fs/promises'

/**
 * KanjiVG stroke data.
 *
 * Each `<kanji>` holds `<path>` elements in STROKE ORDER, drawn in a 109×109
 * box. We keep the raw `d` strings rather than sampling them here: the browser
 * can evaluate a path exactly with `getPointAtLength`, so sampling server-side
 * would mean writing a bezier evaluator for no gain.
 *
 * Parsed with regex rather than a streaming XML parser on purpose — the file is
 * 13 MB of extremely regular markup, and the two attributes we need sit on the
 * same element.
 */

export interface KanjiVgEntry {
  character: string
  strokes: Array<{ path: string, type: string | null, element: string | null }>
}

/** `kvg:kanji_065e5` → 日 */
function characterFromId(id: string): string | null {
  const hex = id.replace(/^kvg:kanji_/, '').split('-')[0]
  if (!hex || !/^[0-9a-f]+$/i.test(hex))
    return null
  const code = Number.parseInt(hex, 16)
  return Number.isFinite(code) ? String.fromCodePoint(code) : null
}

const KANJI_BLOCK = /<kanji id="(kvg:kanji_[0-9a-f]+)">([\s\S]*?)<\/kanji>/gi
const PATH_TAG = /<path\b([^>]*)>/gi
const ATTR_D = /\sd="([^"]+)"/i
const ATTR_TYPE = /kvg:type="([^"]+)"/i
const ATTR_ELEMENT = /kvg:element="([^"]+)"/i

export async function parseKanjiVg(filePath: string, keep?: Set<string>): Promise<KanjiVgEntry[]> {
  const xml = await readFile(filePath, 'utf8')
  const out: KanjiVgEntry[] = []

  for (const block of xml.matchAll(KANJI_BLOCK)) {
    const id = block[1]!
    // Variant ids carry a suffix (…-Kaisho); only the base glyph is wanted.
    if (/-/.test(id.replace('kvg:kanji_', '')))
      continue

    const character = characterFromId(id)
    if (!character || (keep && !keep.has(character)))
      continue

    const body = block[2]!
    const strokes: KanjiVgEntry['strokes'] = []
    for (const tag of body.matchAll(PATH_TAG)) {
      const attrs = tag[1]!
      const d = ATTR_D.exec(attrs)?.[1]
      if (!d)
        continue
      strokes.push({
        path: d,
        type: ATTR_TYPE.exec(attrs)?.[1] ?? null,
        element: ATTR_ELEMENT.exec(attrs)?.[1] ?? null
      })
    }

    if (strokes.length > 0)
      out.push({ character, strokes })
  }

  return out
}
