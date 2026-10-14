/**
 * Minimal pairs: two words whose readings differ by one sound a learner's ear
 * does not yet hear — a long vowel (おばさん / おばあさん), a small っ
 * (きて / きって) or an ん. Hearing one and picking which it was trains the
 * distinction directly, with real words and their recorded audio.
 */

export type PairContrast = 'long-vowel' | 'small-tsu' | 'n'

const VOWEL_ROWS: Record<string, string> = {
  a: 'あかさたなはまやらわがざだばぱゃぁ',
  i: 'いきしちにひみりぎじぢびぴぃ',
  u: 'うくすつぬふむゆるぐずづぶぷゅぅ',
  e: 'えけせてねへめれげぜでべぺぇ',
  o: 'おこそとのほもよろをごぞどぼぽょぉ'
}
const VOWEL_OF = new Map<string, string>()
for (const [vowel, row] of Object.entries(VOWEL_ROWS)) {
  for (const ch of row)
    VOWEL_OF.set(ch, vowel)
}
const PLAIN_VOWELS = new Map([['あ', 'a'], ['い', 'i'], ['う', 'u'], ['え', 'e'], ['お', 'o']])

/** The vowel a kana ends on, or null for ん, っ and anything not hiragana. */
export function vowelOf(kana: string): string | null {
  return VOWEL_OF.get(kana) ?? null
}

/**
 * A reading with every long vowel shortened: おばあさん → おばさん,
 * こうこう → ここ, せんせい → せんせ. おう and えい count as long, as they are
 * said. A ー is dropped the same way.
 */
export function shortenVowels(reading: string): string {
  const out: string[] = []
  for (const ch of reading) {
    if (ch === 'ー')
      continue
    const prev = out.at(-1)
    const plain = PLAIN_VOWELS.get(ch)
    const before = prev ? vowelOf(prev) : null
    if (plain && before && (plain === before || (plain === 'u' && before === 'o') || (plain === 'i' && before === 'e')))
      continue
    out.push(ch)
  }
  return out.join('')
}

/**
 * What separates two readings, if it is exactly ONE sound of one of the three
 * contrasts — one kana longer, and that kana the only difference. Two
 * differences (てい / てんいん) is not a pair a learner can hear as one thing.
 * A word cannot start with っ, so nothing pairs with one that does.
 */
export function contrastOf(a: string, b: string): PairContrast | null {
  const [short, long] = a.length < b.length ? [a, b] : [b, a]
  if (long.length - short.length !== 1 || long.startsWith('っ'))
    return null
  if (short.replaceAll('っ', '') === long.replaceAll('っ', ''))
    return 'small-tsu'
  if (shortenVowels(short) === shortenVowels(long))
    return 'long-vowel'
  if (short.replaceAll('ん', '') === long.replaceAll('ん', ''))
    return 'n'
  return null
}

export interface PairCandidate {
  id: string
  reading: string
}

export interface MinimalPair<T extends PairCandidate> {
  a: T
  b: T
  contrast: PairContrast
}

/**
 * Every minimal pair in a word list. Words are grouped by a key that ignores
 * all three contrasts, so only words that could pair are ever compared.
 * Homophones (same reading) are not pairs — there is nothing to hear.
 */
export function findMinimalPairs<T extends PairCandidate>(words: readonly T[]): Array<MinimalPair<T>> {
  const groups = new Map<string, T[]>()
  for (const w of words) {
    const key = shortenVowels(w.reading.replaceAll('っ', '').replaceAll('ん', ''))
    groups.set(key, [...(groups.get(key) ?? []), w])
  }
  const pairs: Array<MinimalPair<T>> = []
  const seen = new Set<string>()
  for (const group of groups.values()) {
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]!
        const b = group[j]!
        const contrast = contrastOf(a.reading, b.reading)
        // One pair per pair of READINGS — two spellings of かみ are one sound.
        const key = [a.reading, b.reading].sort().join('|')
        if (contrast && !seen.has(key)) {
          seen.add(key)
          pairs.push({ a, b, contrast })
        }
      }
    }
  }
  return pairs
}

export interface PitchCandidate {
  id: string
  reading: string
  /** The downstep position: 0 for heiban, 1 for atamadaka, and so on. */
  position: number
}

/**
 * Words that sound alike but for their pitch — 箸 and 橋, 着る and 切る. Same
 * reading, different downstep. One pair per pair of patterns for a reading,
 * so three spellings of one pattern do not make three pairs.
 */
export function findPitchPairs<T extends PitchCandidate>(words: readonly T[]): Array<{ a: T, b: T }> {
  const byReading = new Map<string, T[]>()
  for (const w of words)
    byReading.set(w.reading, [...(byReading.get(w.reading) ?? []), w])
  const pairs: Array<{ a: T, b: T }> = []
  for (const group of byReading.values()) {
    const seen = new Set<string>()
    for (let i = 0; i < group.length; i++) {
      for (let j = i + 1; j < group.length; j++) {
        const a = group[i]!
        const b = group[j]!
        const key = [a.position, b.position].sort().join('|')
        if (a.position !== b.position && !seen.has(key)) {
          seen.add(key)
          pairs.push({ a, b })
        }
      }
    }
  }
  return pairs
}
