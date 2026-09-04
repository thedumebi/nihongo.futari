/**
 * Numbers with their counters, which the dictionary does not list.
 *
 * 三時 is a word — everybody who speaks Japanese knows it, and it has one
 * reading — but JMdict holds 時 and it holds 三, and a count is generated on
 * demand rather than listed. So 三時に帰ります came apart as 三 | 時, and six N5
 * topics could not have example sentences: 〜時／分, 〜枚, 〜本, 〜歳, ごろ and
 * ずつ all need a counted thing to say anything at all.
 *
 * The readings are why this is a table and not a rule. A counter changes the
 * number in front of it and the number changes the counter back: 一分 is いっぷん
 * and 二分 is にふん and 三分 is さんぷん — three different consonants across three
 * consecutive numbers. 一人 is ひとり and 二人 is ふたり, from a counting system
 * that predates the borrowed one, and then 三人 is さんにん from the borrowed one.
 * Any rule general enough to cover that is longer and more fragile than writing
 * the readings out.
 *
 * Only where the dictionary is silent: 一つ, 一人, 二人, 一時 and 十分 ARE
 * entries, and those keep their own glosses because the index claims a spelling
 * once and the first claim wins.
 */
import type { WordGloss } from '@nihongo/shared/types'

const DIGITS = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

interface Counter {
  /** The counter's kanji, appended to the digit. */
  suffix: string
  /** Reading for 1-10, in order. An empty string means the form is not used. */
  readings: string[]
  /** What it counts, for the gloss. */
  counts: string
  /** Anything that does not follow the digit + suffix shape. */
  extra?: Array<{ form: string, reading: string, meaning: string }>
}

const COUNTERS: Counter[] = [
  {
    suffix: '時',
    counts: "o'clock",
    readings: ['いちじ', 'にじ', 'さんじ', 'よじ', 'ごじ', 'ろくじ', 'しちじ', 'はちじ', 'くじ', 'じゅうじ'],
    extra: [
      { form: '十一時', reading: 'じゅういちじ', meaning: "eleven o'clock" },
      { form: '十二時', reading: 'じゅうにじ', meaning: "twelve o'clock" }
    ]
  },
  {
    suffix: '分',
    counts: 'minutes',
    readings: ['いっぷん', 'にふん', 'さんぷん', 'よんぷん', 'ごふん', 'ろっぷん', 'ななふん', 'はっぷん', 'きゅうふん', 'じゅっぷん']
  },
  {
    suffix: '人',
    counts: 'people',
    readings: ['ひとり', 'ふたり', 'さんにん', 'よにん', 'ごにん', 'ろくにん', 'しちにん', 'はちにん', 'きゅうにん', 'じゅうにん']
  },
  {
    suffix: 'つ',
    counts: 'things',
    // The native series, which stops at nine — ten is 十 (とお) on its own.
    readings: ['ひとつ', 'ふたつ', 'みっつ', 'よっつ', 'いつつ', 'むっつ', 'ななつ', 'やっつ', 'ここのつ', '']
  },
  {
    suffix: '枚',
    counts: 'flat things',
    readings: ['いちまい', 'にまい', 'さんまい', 'よんまい', 'ごまい', 'ろくまい', 'ななまい', 'はちまい', 'きゅうまい', 'じゅうまい']
  },
  {
    suffix: '本',
    counts: 'long thin things',
    readings: ['いっぽん', 'にほん', 'さんぼん', 'よんほん', 'ごほん', 'ろっぽん', 'ななほん', 'はっぽん', 'きゅうほん', 'じゅっぽん']
  },
  {
    suffix: '歳',
    counts: 'years old',
    readings: ['いっさい', 'にさい', 'さんさい', 'よんさい', 'ごさい', 'ろくさい', 'ななさい', 'はっさい', 'きゅうさい', 'じゅっさい'],
    // はたち is not 二十 + 歳 read in any regular way; it is its own word.
    extra: [{ form: '二十歳', reading: 'はたち', meaning: 'twenty years old' }]
  },
  {
    suffix: '回',
    counts: 'times',
    readings: ['いっかい', 'にかい', 'さんかい', 'よんかい', 'ごかい', 'ろっかい', 'ななかい', 'はちかい', 'きゅうかい', 'じゅっかい']
  }
]

/** Every counted form, for the glossary to claim after the real words. */
export function counterWords(): WordGloss[] {
  const out: WordGloss[] = []

  for (const counter of COUNTERS) {
    counter.readings.forEach((reading, i) => {
      if (!reading)
        return
      out.push({
        form: `${DIGITS[i]}${counter.suffix}`,
        reading,
        meanings: [`${i + 1} ${counter.counts}`],
        pos: 'counter'
      })
    })

    for (const e of counter.extra ?? [])
      out.push({ form: e.form, reading: e.reading, meanings: [e.meaning], pos: 'counter' })
  }

  // Longest first, so 十一時 is claimed before 一時 could take the end of it.
  return out.sort((a, b) => b.form.length - a.form.length)
}
