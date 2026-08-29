import { createReadStream } from 'node:fs'
import { createInterface } from 'node:readline'

/**
 * Etymology prose from wiktextract.
 *
 * Streamed line by line: the file is ~330 MB of JSONL and reading it whole
 * would cost more memory than the rest of the pipeline combined.
 *
 * Only `etymology_text` is taken. It is the single prose source available, so
 * it is what grounding packets quote from — and because the validator checks
 * returned quotes against it verbatim, the text is passed through completely
 * unedited.
 */

export interface WiktionaryEtymology {
  word: string
  pos: string
  text: string
}

/**
 * Collect etymology prose for a set of words.
 *
 * `wanted` keeps the scan cheap: only entries for words actually in the
 * curriculum are retained, so a 330 MB file yields a few thousand rows rather
 * than a hundred thousand.
 */
export async function loadEtymologies(
  filePath: string,
  wanted: Set<string>
): Promise<Map<string, WiktionaryEtymology[]>> {
  const out = new Map<string, WiktionaryEtymology[]>()

  const reader = createInterface({
    input: createReadStream(filePath, { encoding: 'utf8' }),
    crlfDelay: Number.POSITIVE_INFINITY
  })

  for await (const line of reader) {
    if (!line)
      continue
    // A cheap prefilter before JSON.parse: parsing every one of ~450,000 lines
    // costs far more than a substring test that rejects most of them.
    if (!line.includes('"etymology_text"'))
      continue

    let entry: { word?: string, pos?: string, etymology_text?: string }
    try {
      entry = JSON.parse(line)
    } catch {
      continue
    }

    const word = entry.word
    const text = entry.etymology_text
    if (!word || !text || !wanted.has(word))
      continue

    const list = out.get(word) ?? []
    // Wiktionary repeats the same etymology across parts of speech; one copy is
    // enough, and duplicates would let a model "corroborate" itself.
    if (!list.some(e => e.text === text)) {
      list.push({ word, pos: entry.pos ?? '', text })
    }
    out.set(word, list)
  }

  return out
}
