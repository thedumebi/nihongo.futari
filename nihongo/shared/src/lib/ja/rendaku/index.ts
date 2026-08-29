/**
 * Rendaku (連濁) — sequential voicing.
 *
 * When two words compound, the second one's initial consonant often voices:
 * 花 (はな) + 火 (ひ) becomes 花火 (はなび). Learners meet this as a pile of
 * unpredictable readings; it is actually a rule with a well-known blocker.
 *
 * LYMAN'S LAW: rendaku does not happen if the second element ALREADY contains
 * a voiced obstruent. 山 (やま) + 風 (かぜ) stays やまかぜ, never やまがぜ,
 * because かぜ already has ぜ. One law removes most of the apparent chaos, which
 * is exactly the kind of thing this app exists to say out loud.
 */

/** Voiced kana mapped back to their voiceless base. */
const VOICED_TO_VOICELESS: Record<string, string> = {
  が: 'か',
  ぎ: 'き',
  ぐ: 'く',
  げ: 'け',
  ご: 'こ',
  ざ: 'さ',
  じ: 'し',
  ず: 'す',
  ぜ: 'せ',
  ぞ: 'そ',
  だ: 'た',
  ぢ: 'ち',
  づ: 'つ',
  で: 'て',
  ど: 'と',
  ば: 'は',
  び: 'ひ',
  ぶ: 'ふ',
  べ: 'へ',
  ぼ: 'ほ'
}

/** Handaku (p-) also counts as derived from the h-row for rendaku purposes. */
const HANDAKU_TO_VOICELESS: Record<string, string> = {
  ぱ: 'は',
  ぴ: 'ひ',
  ぷ: 'ふ',
  ぺ: 'へ',
  ぽ: 'ほ'
}

/** Every voiced obstruent, for Lyman's Law. Note that ん is NOT one. */
const VOICED_OBSTRUENTS = new Set(Object.keys(VOICED_TO_VOICELESS))

export function isVoiced(kana: string): boolean {
  return VOICED_OBSTRUENTS.has(kana)
}

/** The voiceless form of a kana, or the kana itself if it has none. */
export function devoiceKana(kana: string): string {
  return VOICED_TO_VOICELESS[kana] ?? HANDAKU_TO_VOICELESS[kana] ?? kana
}

/**
 * Does this element already contain a voiced obstruent?
 *
 * The whole of Lyman's Law. Checked across the WHOLE element, not just the
 * first mora — かぜ blocks because of its second character.
 */
export function hasVoicedObstruent(reading: string): boolean {
  return [...reading].some(isVoiced)
}

export interface RendakuAnalysis {
  /** The element as it appears in the compound. */
  observed: string
  /** The element on its own. */
  base: string
  /** True when the compound form is the voiced version of the base. */
  isRendaku: boolean
  /**
   * True when Lyman's Law predicts rendaku CANNOT apply here — the base
   * already contains a voiced obstruent.
   */
  lymanBlocks: boolean
  /**
   * Set when observation and the law disagree: rendaku happened despite a
   * voiced obstruent. These are real and worth showing rather than hiding —
   * a rule presented without its exceptions costs more than it saves.
   */
  violatesLyman: boolean
}

/**
 * Compare a compound element against its standalone reading.
 *
 * `observed` is how the element sounds inside the compound (び in 花火);
 * `base` is how it sounds alone (ひ).
 */
export function analyseRendaku(observed: string, base: string): RendakuAnalysis {
  const lymanBlocks = hasVoicedObstruent(base)
  if (observed === base) {
    return { observed, base, isRendaku: false, lymanBlocks, violatesLyman: false }
  }

  const first = observed[0] ?? ''
  const baseFirst = base[0] ?? ''
  // Rendaku only ever changes the FIRST mora; a difference anywhere else is a
  // different phenomenon (okurigana, a separate reading) and not this.
  const isRendaku = devoiceKana(first) === baseFirst && observed.slice(1) === base.slice(1)

  return {
    observed,
    base,
    isRendaku,
    lymanBlocks,
    violatesLyman: isRendaku && lymanBlocks
  }
}
