import { readFile } from 'node:fs/promises'

/**
 * The Tanaka Corpus, in EDRDG's indexed "examples" format.
 *
 * Sentences come in pairs of lines:
 *
 *   A: 彼は忙しい。<TAB>He is busy.#ID=303697_100000
 *   B: 彼(かれ)[01] は 忙しい(いそがしい)
 *
 * The B line is a HUMAN-CHECKED word index, which is the whole reason this
 * source was chosen: it gives lemma, reading and surface form per token, so the
 * pipeline needs no Japanese morphological analyser and no 15 MB dictionary.
 *
 * Token grammar: `lemma(reading)[sense]{surface}~`
 *   (reading)  disambiguating reading, or `(#1234567)` — a JMdict ent_seq
 *   [01]       JMdict sense number
 *   {surface}  the inflected form as it appears, when it differs from the lemma
 *   ~          marks the token the example was chosen to illustrate
 */

export interface TanakaToken {
  lemma: string
  reading: string | null
  entSeq: number | null
  sense: number | null
  /** The form as it appears in the sentence; falls back to the lemma. */
  surface: string
  /** True for the word this example was picked to illustrate. */
  isExemplar: boolean
}

export interface TanakaSentence {
  id: string
  japanese: string
  english: string
  tokens: TanakaToken[]
}

// lemma, then optional (reading) / [sense] / {surface} / ~ in that order.
const TOKEN = /^([^([{~]+)(?:\(([^)]*)\))?(?:\[(\d+)\])?(?:\{([^}]*)\})?(~)?$/

function parseToken(raw: string): TanakaToken | null {
  const match = TOKEN.exec(raw)
  if (!match)
    return null

  const [, lemma, readingRaw, sense, surface, exemplar] = match
  if (!lemma)
    return null

  // A parenthesised group is either a reading or `#1234567`, an ent_seq.
  let reading: string | null = null
  let entSeq: number | null = null
  if (readingRaw) {
    if (readingRaw.startsWith('#'))
      entSeq = Number.parseInt(readingRaw.slice(1), 10) || null
    else reading = readingRaw
  }

  return {
    lemma,
    reading,
    entSeq,
    sense: sense ? Number.parseInt(sense, 10) : null,
    surface: surface || lemma,
    isExemplar: Boolean(exemplar)
  }
}

export async function parseTanaka(filePath: string): Promise<TanakaSentence[]> {
  const text = await readFile(filePath, 'utf8')
  const lines = text.split('\n')
  const out: TanakaSentence[] = []

  for (let i = 0; i < lines.length - 1; i++) {
    const a = lines[i]!
    if (!a.startsWith('A: '))
      continue
    const b = lines[i + 1]!
    if (!b.startsWith('B: '))
      continue

    const [pair, idPart] = a.slice(3).split('#ID=')
    const [japanese, english] = (pair ?? '').split('\t')
    if (!japanese || !english || !idPart)
      continue

    const tokens = b.slice(3).trim().split(/\s+/).map(parseToken).filter((t): t is TanakaToken => t !== null)
    if (tokens.length === 0)
      continue

    out.push({ id: idPart.trim(), japanese: japanese.trim(), english: english.trim(), tokens })
    i++
  }

  return out
}
