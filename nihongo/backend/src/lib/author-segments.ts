import type { GlossedToken, WordGloss } from '@nihongo/shared/types'

import { hasKanji } from '@nihongo/shared/lib'

/**
 * Re-cut kana the dictionary split inside a word, along the author's own breaks.
 *
 * Longest-match tokenising needs the word in the index, and a word normally
 * written in kanji is indexed by its kanji. So kana text a beginner reads —
 * わたし, ねます, くだもの, written in kana because 私, 寝 and 果 are above
 * their level — falls apart into whatever kana words DO exist: わた "cotton"
 * | し "and", と | く | だもの. Every piece glosses, so nothing looks broken.
 *
 * Authored lines carry the fix already. Their reading puts a space at every
 * word break, and each token holds its slice of it, so tokens and author words
 * can be laid side by side. Where they disagree inside a run of kana, the
 * author's words are looked up whole.
 *
 * Deliberately narrow, because kana is ambiguous — いい is also 飯 "rice" and
 * きます is also 着る "to wear":
 *   - only clusters the dictionary cut INSIDE an author word are touched;
 *   - one token covering several author words is a phrase on purpose
 *     (ありがとう ございました, ん です) and is kept;
 *   - a single author word the dictionary does not hold becomes ONE plain,
 *     untappable token. Its pieces glossed — わた "cotton" | し "and" — but as
 *     the wrong words, and a gloss that is wrong is worse than none;
 *   - a cluster spanning several author words is re-cut on the author's
 *     breaks, each word glossed if the dictionary has it and plain if not.
 */

const KANA_ONLY = /^[\u3041-\u309F\u30A0-\u30FF]+$/

/** Looks a kana word up whole. */
type KanaLookup = (kana: string) => WordGloss | undefined

interface Span { start: number, end: number }

function isKana(token: GlossedToken): boolean {
  return KANA_ONLY.test(token.t) && token.r !== undefined
}

const length = (s: string) => [...s].length

/**
 * A run of kana tokens cut into the author's words.
 *
 * Kana reading and kana surface are the same length character for character —
 * a spoken particle swaps は for わ, it does not add or drop one — so the
 * reading's spaces map straight onto surface positions.
 */
function authorWords(run: GlossedToken[]): Array<{ t: string, r: string } & Span> | null {
  const surface = [...run.map(t => t.t).join('')]
  const reading = run.map(t => t.r).join('')
  const words: Array<{ t: string, r: string } & Span> = []
  let cursor = 0
  // Each word keeps its leading space, as token readings do.
  for (const match of reading.matchAll(/\s*\S+/gu)) {
    const r = match[0]
    const end = cursor + length(r.trim())
    words.push({ t: surface.slice(cursor, end).join(''), r, start: cursor, end })
    cursor = end
  }
  return cursor === surface.length ? words : null
}

/**
 * A match that is a fixed phrase on purpose, even across the author's spaces:
 * a whole dictionary word of four kana or more, or a grammar pattern of three.
 */
export function isPhrase(token: GlossedToken): boolean {
  const length = [...token.t].length
  if (!token.w)
    return length >= 3
  if (token.w.pos === 'grammar')
    return length >= 3
  return token.w.form === token.t && length >= 4
}

function regroupRun(run: GlossedToken[], lookup: KanaLookup): GlossedToken[] {
  const words = authorWords(run)
  if (!words)
    return run

  let cursor = 0
  const spans: Span[] = run.map((t) => {
    const span = { start: cursor, end: cursor + length(t.t) }
    cursor = span.end
    return span
  })

  const out: GlossedToken[] = []
  let w = 0
  let k = 0
  // Walk clusters: the smallest groups of words and tokens whose edges agree.
  while (k < run.length) {
    const firstToken = k
    const firstWord = w
    let end = Math.max(spans[k]!.end, words[w]!.end)
    k++
    w++
    for (;;) {
      if (k < run.length && spans[k]!.start < end) {
        end = Math.max(end, spans[k]!.end)
        k++
      } else if (w < words.length && words[w]!.start < end) {
        end = Math.max(end, words[w]!.end)
        w++
      } else {
        break
      }
    }

    const tokens = run.slice(firstToken, k)
    const cluster = words.slice(firstWord, w)
    // One token over one word: aligned. One token over several is a phrase
    // kept whole only when it really is one — ありがとうございました, ですから,
    // ん です. A short match across a break is the dictionary gluing two
    // particles into a word: で わ read as では "then", に も as a grammar
    // pattern. Those are re-cut below when every piece is known.
    if (tokens.length === 1 && (cluster.length === 1 || isPhrase(tokens[0]!))) {
      out.push(...tokens)
      continue
    }
    const found = cluster.map(word => lookup(word.t))
    if (cluster.length === 1) {
      const [word] = cluster
      out.push(found[0] ? { t: word!.t, r: word!.r, w: found[0] } : { t: word!.t, r: word!.r })
    } else {
      // Several words the dictionary cut differently: the author's breaks win.
      // Each word gets its gloss if the dictionary has it and none if not — a
      // particle such as も is not in a dictionary of words, and plain is
      // honest where the old cut glossed に も as a grammar pattern.
      out.push(...cluster.map((word, i) => found[i] ? { t: word.t, r: word.r, w: found[i] } : { t: word.t, r: word.r }))
    }
  }

  return out
}

export function regroupKana(tokens: GlossedToken[], lookup: KanaLookup): GlossedToken[] {
  const out: GlossedToken[] = []
  let i = 0
  while (i < tokens.length) {
    if (!isKana(tokens[i]!)) {
      out.push(tokens[i]!)
      i++
      continue
    }
    let end = i
    while (end + 1 < tokens.length && isKana(tokens[end + 1]!))
      end++
    out.push(...regroupRun(tokens.slice(i, end + 1), lookup))
    i = end + 1
  }
  return out
}

/** A token that is all letters — kana or kanji — with its slice of the reading. */
const WORD_TOKEN = /^\p{L}+$/u
const HAS_KANJI = { test: hasKanji }

/** A piece's own gloss, or a bare entry so the split is complete. */
function asPart(token: GlossedToken): Omit<WordGloss, 'parts'> {
  if (token.w) {
    const { parts: _parts, ...gloss } = token.w
    return gloss
  }
  return { form: token.t, reading: (token.r ?? '').trim(), meanings: [], pos: null }
}

/** Counts toward a split worth showing: a glossed piece longer than one kana. */
function meaningful(token: GlossedToken): boolean {
  return Boolean(token.w) && (HAS_KANJI.test(token.t) || [...token.t].length > 1)
}

/**
 * Glue a word with kanji in it that the dictionary cut into pieces.
 *
 * 山本 came out as 山 "mountain" | 本 "book", 大黒柱 as three single kanji, and
 * each piece was its own chip — tap one, learn a third of the word. The
 * author's reading says where the word ends, so the pieces are glued back into
 * one chip, and the sheet lists them: the whole word's meaning if the
 * dictionary has it, and what it is made of either way.
 *
 * Only when at least two pieces mean something on their own. 大切 | な is a
 * word and its ending, not a compound, and gluing it would bury 大切 behind a
 * chip for 大切な that the dictionary does not hold. A kana word the dictionary
 * cut is left to `regroupKana`: its pieces — わた "cotton" | し "and" — are
 * accidents, not parts, and listing them would teach nonsense.
 */
export function glueAuthorWords(tokens: GlossedToken[], lookup: KanaLookup): GlossedToken[] {
  const out: GlossedToken[] = []
  let i = 0
  while (i < tokens.length) {
    const first = tokens[i]!
    let j = i + 1
    if (WORD_TOKEN.test(first.t) && first.r !== undefined) {
      while (j < tokens.length) {
        const next = tokens[j]!
        if (!WORD_TOKEN.test(next.t) || next.r === undefined || /^\s/u.test(next.r))
          break
        j++
      }
    }
    const group = tokens.slice(i, j)
    i = j

    const glue = group.length > 1
      && group.some(t => HAS_KANJI.test(t.t))
      && group.filter(meaningful).length >= 2
      && group.every(t => !/\s/u.test((t.r ?? '').trim()))
    if (!glue) {
      out.push(...group)
      continue
    }

    const t = group.map(g => g.t).join('')
    const r = group.map(g => g.r ?? '').join('')
    const parts = group.map(asPart)
    const whole = lookup(t)
    out.push({
      t,
      r,
      w: whole
        ? { ...whole, parts }
        : { form: t, reading: r.trim(), meanings: [], pos: null, parts }
    })
  }
  return out
}
