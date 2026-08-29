import { readFile } from 'node:fs/promises'

/**
 * CHISE / CJKVI Ideographic Description Sequences.
 *
 * Each line is `U+XXXX<TAB>character<TAB>sequence[region]...`, where the
 * sequence uses IDC operators (⿰ ⿱ ⿲ …) to describe layout:
 *
 *   U+6674  晴  ⿰日青[GTJV]  ⿰日靑[K]
 *
 * Regional variants are common — a character can decompose differently in
 * Japan and Korea — so the first (unmarked or J-tagged) sequence is preferred.
 */

/** Ideographic Description Characters (⿰ ⿱ ⿲ …): structure, not components. */
const IDC = /[\u2FF0-\u2FFB]/u
/** CJK Unified Ideographs, plus Extension A. */
const CJK = /[\u3400-\u4DBF\u4E00-\u9FFF]/u

export interface IdsEntry {
  character: string
  /** The raw sequence, kept for display. */
  sequence: string
  /** Direct components, IDC operators stripped. */
  components: string[]
}

function preferJapanese(variants: string[]): string | null {
  // A [J]-tagged variant is the Japanese form; otherwise take the untagged one.
  const tagged = variants.find(v => /\[[A-IK-Z]*J[A-Z]*\]/.test(v))
  const untagged = variants.find(v => !v.includes('['))
  return (tagged ?? untagged ?? variants[0])?.replace(/\[[^\]]*\]/g, '') ?? null
}

export async function parseIds(filePath: string, keep?: Set<string>): Promise<IdsEntry[]> {
  const text = await readFile(filePath, 'utf8')
  const out: IdsEntry[] = []

  for (const line of text.split('\n')) {
    if (!line || line.startsWith('#'))
      continue
    const parts = line.split('\t')
    const character = parts[1]
    if (!character || (keep && !keep.has(character)))
      continue

    const sequence = preferJapanese(parts.slice(2).filter(Boolean))
    if (!sequence)
      continue

    const components = [...sequence]
      .filter(ch => !IDC.test(ch) && CJK.test(ch))
      // A character listed as its own component tells us nothing.
      .filter(ch => ch !== character)

    out.push({ character, sequence, components: [...new Set(components)] })
  }

  return out
}
