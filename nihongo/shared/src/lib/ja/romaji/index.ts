/**
 * Romaji to hiragana.
 *
 * Needed because the dictionary stores readings in kana and people type
 * romaji. Without it "yama" matched only glosses that happened to contain the
 * letters — "Yamato court" — and never 山 itself.
 *
 * Longest-match-first, so "shi" is one mora and not "s"+"hi", and "kyo" beats
 * "ki"+"yo". Handles both Hepburn and kunrei spellings because learners type
 * whichever they were taught: si and shi both give し.
 */

const TABLE: Array<[string, string]> = [
  // Three-letter first — the order of this list IS the matching precedence.
  ['kya', 'きゃ'],
  ['kyu', 'きゅ'],
  ['kyo', 'きょ'],
  ['gya', 'ぎゃ'],
  ['gyu', 'ぎゅ'],
  ['gyo', 'ぎょ'],
  ['sha', 'しゃ'],
  ['shu', 'しゅ'],
  ['sho', 'しょ'],
  ['shi', 'し'],
  ['sya', 'しゃ'],
  ['syu', 'しゅ'],
  ['syo', 'しょ'],
  ['ja', 'じゃ'],
  ['ju', 'じゅ'],
  ['jo', 'じょ'],
  ['ji', 'じ'],
  ['jya', 'じゃ'],
  ['jyu', 'じゅ'],
  ['jyo', 'じょ'],
  ['zya', 'じゃ'],
  ['zyu', 'じゅ'],
  ['zyo', 'じょ'],
  ['cha', 'ちゃ'],
  ['chu', 'ちゅ'],
  ['cho', 'ちょ'],
  ['chi', 'ち'],
  ['tya', 'ちゃ'],
  ['tyu', 'ちゅ'],
  ['tyo', 'ちょ'],
  ['tsu', 'つ'],
  ['tu', 'つ'],
  ['nya', 'にゃ'],
  ['nyu', 'にゅ'],
  ['nyo', 'にょ'],
  ['hya', 'ひゃ'],
  ['hyu', 'ひゅ'],
  ['hyo', 'ひょ'],
  ['bya', 'びゃ'],
  ['byu', 'びゅ'],
  ['byo', 'びょ'],
  ['pya', 'ぴゃ'],
  ['pyu', 'ぴゅ'],
  ['pyo', 'ぴょ'],
  ['mya', 'みゃ'],
  ['myu', 'みゅ'],
  ['myo', 'みょ'],
  ['rya', 'りゃ'],
  ['ryu', 'りゅ'],
  ['ryo', 'りょ'],
  ['fu', 'ふ'],
  ['hu', 'ふ'],
  ['ka', 'か'],
  ['ki', 'き'],
  ['ku', 'く'],
  ['ke', 'け'],
  ['ko', 'こ'],
  ['ga', 'が'],
  ['gi', 'ぎ'],
  ['gu', 'ぐ'],
  ['ge', 'げ'],
  ['go', 'ご'],
  ['sa', 'さ'],
  ['su', 'す'],
  ['se', 'せ'],
  ['so', 'そ'],
  ['si', 'し'],
  ['za', 'ざ'],
  ['zi', 'じ'],
  ['zu', 'ず'],
  ['ze', 'ぜ'],
  ['zo', 'ぞ'],
  ['ta', 'た'],
  ['ti', 'ち'],
  ['te', 'て'],
  ['to', 'と'],
  ['da', 'だ'],
  ['di', 'ぢ'],
  ['du', 'づ'],
  ['de', 'で'],
  ['do', 'ど'],
  ['na', 'な'],
  ['ni', 'に'],
  ['nu', 'ぬ'],
  ['ne', 'ね'],
  ['no', 'の'],
  ['ha', 'は'],
  ['hi', 'ひ'],
  ['he', 'へ'],
  ['ho', 'ほ'],
  ['ba', 'ば'],
  ['bi', 'び'],
  ['bu', 'ぶ'],
  ['be', 'べ'],
  ['bo', 'ぼ'],
  ['pa', 'ぱ'],
  ['pi', 'ぴ'],
  ['pu', 'ぷ'],
  ['pe', 'ぺ'],
  ['po', 'ぽ'],
  ['ma', 'ま'],
  ['mi', 'み'],
  ['mu', 'む'],
  ['me', 'め'],
  ['mo', 'も'],
  ['ya', 'や'],
  ['yu', 'ゆ'],
  ['yo', 'よ'],
  ['ra', 'ら'],
  ['ri', 'り'],
  ['ru', 'る'],
  ['re', 'れ'],
  ['ro', 'ろ'],
  ['wa', 'わ'],
  ['wo', 'を'],
  ['a', 'あ'],
  ['i', 'い'],
  ['u', 'う'],
  ['e', 'え'],
  ['o', 'お'],
  ['-', 'ー']
]

/** Only ASCII letters can be romaji; anything else is already Japanese. */
export function looksLikeRomaji(text: string): boolean {
  return /^[a-z-]+$/i.test(text.trim())
}

export function romajiToHiragana(input: string): string {
  const text = input.toLowerCase().trim()
  let out = ''
  let i = 0

  while (i < text.length) {
    const rest = text.slice(i)

    // A doubled consonant is the sokuon: "kitte" -> きって. Checked before the
    // table so "tt" does not fall through as a failed match.
    const a = rest[0]!
    const b = rest[1]
    if (b && a === b && /[bcdfghjkmp-tv-z]/.test(a)) {
      out += 'っ'
      i += 1
      continue
    }

    // "n" before a consonant (or at the end) is ん, not the start of "na".
    if (a === 'n' && (!b || !/[aiueoy]/.test(b))) {
      out += 'ん'
      i += 1
      continue
    }

    const match = TABLE.find(([romaji]) => rest.startsWith(romaji))
    if (match) {
      out += match[1]
      i += match[0].length
      continue
    }

    // Unconvertible character: keep it so a partial match still searches for
    // something rather than silently vanishing.
    out += a
    i += 1
  }

  return out
}

const HIRAGANA_START = 0x3041
const HIRAGANA_END = 0x3096

/**
 * Hiragana to katakana.
 *
 * Loan words store their reading in KATAKANA — グラス, not ぐらす — so romaji
 * converted to hiragana alone never matches them. Searching both forms is the
 * only way "gurasu" finds グラス.
 *
 * The long-vowel mark ー is shared by both scripts and passes through, which
 * matters: コーヒー would otherwise lose its ー.
 */
/**
 * Collapse a doubled vowel to the katakana long mark.
 *
 * People type "koohii" and "raamen"; the words are コーヒー and ラーメン. Without
 * this the conversion gives コオヒイ and matches nothing — which is worse than
 * useless, because the word is obviously right there.
 *
 * Applied only to the KATAKANA candidate: おおきい is genuinely spelled with
 * two お in hiragana, and collapsing it there would break real words.
 */
export function collapseLongVowels(katakana: string): string {
  // Which vowel each katakana ends on. A long vowel is a vowel kana following
  // a kana that ALREADY ends in that same vowel — comparing the characters
  // themselves does not work, because コ and オ are different characters that
  // share the o sound.
  const ROWS: Record<string, string> = {
    a: 'アカサタナハマヤラワガザダバパャ',
    i: 'イキシチニヒミリギジヂビピ',
    u: 'ウクスツヌフムユルグズヅブプュ',
    e: 'エケセテネヘメレゲゼデベペ',
    o: 'オコソトノホモヨロゴゾドボポョ'
  }
  const vowelOf = (kana: string): string | null => {
    for (const [vowel, chars] of Object.entries(ROWS)) {
      if (chars.includes(kana))
        return vowel
    }
    return null
  }

  let out = ''
  for (const char of katakana) {
    const prev = out[out.length - 1]
    const prevVowel = prev ? vowelOf(prev) : null
    const thisVowel = 'アイウエオ'.includes(char) ? vowelOf(char) : null

    if (prevVowel && thisVowel && prevVowel === thisVowel) {
      out += 'ー'
      continue
    }
    // The ou and ei conventions: コウ is コー, ケイ is ケー.
    if (prevVowel === 'o' && char === 'ウ') {
      out += 'ー'
      continue
    }
    if (prevVowel === 'e' && char === 'イ') {
      out += 'ー'
      continue
    }
    out += char
  }
  return out
}

export function toKatakana(text: string): string {
  let out = ''
  for (const char of text) {
    const code = char.codePointAt(0)!
    out += code >= HIRAGANA_START && code <= HIRAGANA_END
      ? String.fromCodePoint(code + 0x60)
      : char
  }
  return out
}

/**
 * Kana to romaji — the other direction.
 *
 * `romajiToHiragana` exists so people can TYPE; this exists so people can
 * READ. A learner three weeks in can sound out ひらがな but stalls on 静か,
 * and furigana only helps once the kana themselves are fluent.
 *
 * Built by inverting TABLE rather than by keeping a second list, so the two
 * directions cannot drift apart. Where several spellings map to one kana
 * (shi/si → し) the FIRST wins, which is why the table is Hepburn-first:
 * Hepburn is what a beginner has seen on a station sign.
 */
const TO_ROMAJI: Map<string, string> = (() => {
  const map = new Map<string, string>()
  for (const [romaji, kana] of TABLE) {
    if (!map.has(kana))
      map.set(kana, romaji)
  }
  return map
})()

/** Longest kana key first, so ちゃ beats ち. */
const KANA_KEYS = [...TO_ROMAJI.keys()].sort((a, b) => b.length - a.length)

const SMALL_TSU = new Set(['っ', 'ッ'])

/** Katakana long vowel: ー repeats whatever vowel came before it. */
const LONG_VOWEL = 'ー'

export function kanaToRomaji(input: string): string {
  // Katakana and hiragana share the table through one normalisation step.
  const text = toHiraganaLocal(input)
  let out = ''
  let i = 0

  while (i < text.length) {
    const char = text[i]!

    // ん before a vowel or y would read as na/ni/…, so Hepburn writes n'.
    if (char === 'ん') {
      const next = text[i + 1]
      out += next && /[あいうえおやゆよ]/.test(next) ? "n'" : 'n'
      i += 1
      continue
    }

    // っ doubles the consonant that follows it.
    if (SMALL_TSU.has(char)) {
      const rest = readOne(text, i + 1)
      if (rest) {
        const first = rest.romaji[0]!
        out += first === 'c' ? 't' : first
      }
      i += 1
      continue
    }

    if (char === LONG_VOWEL) {
      // Repeat the last vowel written, which is what ー means.
      const lastVowel = /[aiueo](?=[^aiueo]*$)/.exec(out)?.[0]
      out += lastVowel ?? ''
      i += 1
      continue
    }

    const match = readOne(text, i)
    if (match) {
      out += match.romaji
      i += match.length
      continue
    }

    // Punctuation, latin, kanji that never got a reading — pass it through
    // rather than dropping it, so the output still lines up with the input.
    out += char
    i += 1
  }

  return out
}

function readOne(text: string, at: number): { romaji: string, length: number } | null {
  for (const kana of KANA_KEYS) {
    if (text.startsWith(kana, at))
      return { romaji: TO_ROMAJI.get(kana)!, length: kana.length }
  }
  return null
}

/** Katakana to hiragana, so one table serves both scripts. */
function toHiraganaLocal(text: string): string {
  let out = ''
  for (const char of text) {
    const code = char.codePointAt(0)!
    // The two blocks are offset by exactly 0x60 across their shared range.
    out += code >= 0x30A1 && code <= 0x30F6 ? String.fromCodePoint(code - 0x60) : char
  }
  return out
}

/**
 * A whole line of kana as romaji, for a surface that REPLACES the Japanese
 * rather than sitting above it — what a conversation looks like to someone who
 * does not read kana yet.
 *
 * Two things this deliberately does NOT do, because neither can be worked out
 * from kana alone:
 *
 * - **Word boundaries.** Japanese is written without spaces, and splitting it
 *   needs a tokeniser; there is none here, and `sentence_tokens.pos` is empty
 *   on every row. A space in the INPUT is preserved in the output, so an
 *   author who wants "sumimasen, menyuu o kudasai" writes the reading with
 *   those breaks. Without them the line comes out unbroken, which is honest
 *   rather than guessed.
 * - **Particles.** は is わ and を is お when they are particles, and telling a
 *   particle は from the は inside はい needs part-of-speech too. The author
 *   writes the spoken form.
 *
 * In both cases the author knows and no heuristic does.
 *
 * Japanese punctuation becomes its English counterpart, since a reader who
 * wants romaji is not reading 。either.
 */
const PUNCTUATION: Record<string, string> = {
  '。': '.',
  '、': ',',
  '？': '?',
  '！': '!',
  '　': ' '
}

export function kanaLineToRomaji(line: string): string {
  let out = ''

  for (const chunk of splitOnPunctuation(line)) {
    const mapped = PUNCTUATION[chunk]
    if (mapped !== undefined) {
      // No space before punctuation, one after — the English convention,
      // which is the one the reader is bringing.
      out = `${out.trimEnd()}${mapped} `
      continue
    }
    out += `${kanaToRomaji(chunk)} `
  }

  return out.trim()
}

/** Break a line into runs of text and single punctuation marks. */
function splitOnPunctuation(line: string): string[] {
  const parts: string[] = []
  let current = ''

  for (const char of line) {
    if (char in PUNCTUATION) {
      if (current)
        parts.push(current)
      parts.push(char)
      current = ''
      continue
    }
    current += char
  }

  if (current)
    parts.push(current)
  return parts
}
