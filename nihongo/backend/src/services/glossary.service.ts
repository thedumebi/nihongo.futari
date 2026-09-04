import type { GlossedToken, WordGloss } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { grammarPoints, languageLevels, languages, wordForms, words, wordSenses } from '@nihongo/shared/db/schema'
import { buildTokenIndex, classifyVerb, conjugateAll, tokenise } from '@nihongo/shared/lib'
import { and, asc, eq } from 'drizzle-orm'

import { counterWords } from '../lib/counters.js'

/**
 * Turning a line of Japanese into words you can tap.
 *
 * The reader asked to point at a word in a conversation and be told what it
 * means. Everything needed is already in the database — 8,240 published words,
 * every written form of each, and JMdict's glosses — so this is a lookup, not
 * new content. Nothing here is invented: a token the dictionary does not cover
 * comes back plain and simply is not tappable.
 *
 * Computed per request rather than stored on the turn. Storing it would mean a
 * migration, an import step, and a second copy of every gloss that goes stale
 * the moment the dictionary grows. Tokenising ten short lines against a
 * prebuilt index costs microseconds, and the dictionary is the single source.
 */

/** JMdict part-of-speech codes, in words a beginner can use. */
const POS_LABELS: Record<string, string> = {
  'n': 'noun',
  'n-adv': 'noun',
  'n-t': 'noun',
  'pn': 'pronoun',
  'adj': 'adjective',
  'adj-i': 'i-adjective',
  'adj-na': 'na-adjective',
  'adj-no': 'adjective',
  'adj-pn': 'adjective',
  'adv': 'adverb',
  'adv-to': 'adverb',
  'conj': 'conjunction',
  'int': 'interjection',
  'prt': 'particle',
  'prefix': 'prefix',
  'suf': 'suffix',
  'pref': 'prefix',
  'ctr': 'counter',
  'exp': 'expression',
  'aux': 'auxiliary',
  'aux-v': 'auxiliary verb',
  'aux-adj': 'auxiliary adjective',
  'vs': 'suru verb',
  'vs-i': 'suru verb',
  'vs-s': 'suru verb',
  'vk': 'kuru verb',
  'v1': 'ichidan verb',
  'v1-s': 'ichidan verb',
  'vz': 'ichidan verb'
}

/**
 * The godan verbs, which JMdict spells as one code per final consonant —
 * `v5k`, `v5r-i`, `v5u-s` and a dozen more. Matching the family by prefix
 * beats listing every variant and then missing one.
 */
function posLabel(codes: string[]): string | null {
  for (const code of codes) {
    const known = POS_LABELS[code]
    if (known)
      return known
    if (code.startsWith('v5'))
      return 'godan verb'
    if (code.startsWith('v'))
      return 'verb'
  }
  return null
}

interface Glossary {
  /** First character to the dictionary forms starting with it, longest first. */
  index: Map<string, string[]>
  /** Every written form to the word it spells. */
  byForm: Map<string, WordGloss>
}

/**
 * Built once and kept.
 *
 * The dictionary only changes when a pipeline script runs, which means a
 * deploy or a restart, so there is nothing to invalidate against. A promise
 * rather than the value so concurrent first requests share one build instead
 * of racing to do it three times.
 */
let cached: Promise<Glossary> | null = null

/**
 * Spellings JMdict marks as not the normal way to write the word: rare or
 * irregular kanji, rare or irregular kana. Indexing them is how 行 ends up
 * glossed as 件 "paragraph" — a real entry, and never what the line means.
 */
/** Verbs whose KANA spelling conjugates too — see the note where it is used. */
const KANA_CONJUGATING = new Set(['有る', '居る', '成る'])

const JAPANESE_RUN = /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF\u3005]+/g

const RARE_TAGS = new Set(['oK', 'iK', 'rK', 'ok', 'ik', 'rk'])

/** Whether a spelling contains any kanji at all. */
const HAS_KANJI = /[\u3400-\u4DBF\u4E00-\u9FFF\u3005]/

async function build(languageCode: string): Promise<Glossary> {
  const rows = await db
    .select({
      wordId: words.id,
      form: wordForms.form,
      tags: wordForms.tags,
      primaryForm: words.primaryForm,
      reading: words.primaryReading,
      isCommon: words.isCommon,
      rank: words.frequencyRank,
      level: languageLevels.sortIndex
    })
    .from(wordForms)
    .innerJoin(words, eq(words.id, wordForms.wordId))
    .innerJoin(languages, eq(languages.id, words.languageId))
    .leftJoin(languageLevels, eq(languageLevels.id, words.levelId))
    .where(and(eq(languages.code, languageCode), eq(words.published, true)))

  const senses = await db
    .select({
      wordId: wordSenses.wordId,
      glosses: wordSenses.glosses,
      pos: wordSenses.pos,
      misc: wordSenses.misc,
      sortIndex: wordSenses.sortIndex
    })
    .from(wordSenses)
    .orderBy(asc(wordSenses.sortIndex))

  // The first sense only. A JMdict entry can carry a dozen, and a popover that
  // lists them all answers a question nobody asked — the reader wants to know
  // what the word is doing in THIS line, and the leading sense is the best
  // one-line guess available without a disambiguator.
  const firstSense = new Map<string, { glosses: Array<{ lang: string, text: string }>, pos: string[], misc: string[] }>()
  for (const sense of senses) {
    if (!firstSense.has(sense.wordId))
      firstSense.set(sense.wordId, { glosses: sense.glosses, pos: sense.pos, misc: sense.misc })
  }

  /**
   * Best claimant first, because several words can be spelled the same way and
   * without an order the winner is whatever the database happened to return.
   *
   * Level leads, and that is the important one. 行って is a real form of both
   * 行く and 行う, and frequency picks the WRONG one: 行う ranks 250 against
   * 行く's 25,000, because the ranks come from newspaper counts and newspapers
   * are full of formal "conduct". This is a learning app, so the word the
   * reader is more likely to be meeting wins — 行く is N5, 行う is N4.
   */
  const ordered = [...rows].sort((a, b) => {
    const levelDiff = (a.level ?? Number.MAX_SAFE_INTEGER) - (b.level ?? Number.MAX_SAFE_INTEGER)
    if (levelDiff !== 0)
      return levelDiff
    if (a.isCommon !== b.isCommon)
      return a.isCommon ? -1 : 1
    return (a.rank ?? Number.MAX_SAFE_INTEGER) - (b.rank ?? Number.MAX_SAFE_INTEGER)
  })

  const byForm = new Map<string, WordGloss>()

  /** Claim a spelling for a word, unless something better already has it. */
  const claim = (form: string, gloss: WordGloss) => {
    if (!byForm.has(form))
      byForm.set(form, gloss)
  }

  /** Conjugations, deferred to a second pass — see the loop below. */
  const inflections: Array<{ surface: string, gloss: WordGloss }> = []

  for (const row of ordered) {
    if (row.tags.some(tag => RARE_TAGS.has(tag)))
      continue

    // A single character is claimed only by the word actually WRITTEN that
    // way. Every kanji in the language appears as some obscure entry's
    // alternate spelling, and without this the commonest characters get the
    // strangest glosses in the dictionary — 行 as 件 "paragraph", け as 異.
    if ([...row.form].length === 1 && row.form !== row.primaryForm)
      continue

    const sense = firstSense.get(row.wordId)

    // Kana spellings are held to a higher bar, in two ways, because a kana
    // string collides with far more of the language than a kanji one does.
    if (!HAS_KANJI.test(row.form)) {
      // An alternate kana spelling is not a word you meet written that way —
      // it is the reading, listed so a lookup finds it. Index those and every
      // common kana string turns into a rare homophone: すみません became 隅
      // "corner" plus 千 "thousand", いい became 飯 "cooked rice", ます became
      // 増す "to increase". JMdict marks the genuinely usually-kana words with
      // `uk`, and those are kept.
      if (row.form !== row.primaryForm && !(sense?.misc ?? []).includes('uk'))
        continue

      // And a kana headword that the dictionary considers neither common nor
      // frequent enough to rank is almost always archaic or dialectal. These
      // are the entries that produced the worst glosses in the whole set:
      // どう as "whoa (command used to stop a horse)", これ as "hey", せん as
      // "will not do", しま as "will do" — every one of them uncommon and
      // unranked, and every one of them sitting on a string a beginner reads
      // several times a page.
      if (!row.isCommon && row.rank === null)
        continue
    }

    // The importer writes ISO 639-1 (`en`); JMdict itself uses 639-2 (`eng`).
    // Accept both, and an absent tag, rather than depend on which one wrote the
    // row — getting this wrong silently empties the whole glossary.
    const meanings = (sense?.glosses ?? [])
      .filter(g => !g.lang || g.lang === 'en' || g.lang === 'eng')
      .slice(0, 3)
      .map(g => g.text)

    if (meanings.length === 0)
      continue

    const gloss: WordGloss = {
      form: row.primaryForm,
      reading: row.reading,
      meanings,
      pos: posLabel(sense?.pos ?? [])
    }

    claim(row.form, gloss)

    // Every form the word can take, so a conjugated verb is an ordinary exact
    // match rather than a guess. This is what stops the tokeniser having to
    // reason about kana tails: 貸して is a real form of 貸す, indexed as such.
    //
    // Only from the primary spelling — conjugating an alternate one would
    // produce forms nobody writes.
    //
    // Except the kana spelling of ある and いる.
    //
    // 居る is tagged rK — a rare kanji — so that row is dropped as rare before
    // it can conjugate, and its kana form いる was then refused here for not
    // being the primary spelling. Between the two, います matched nothing and
    // 猫がいます。 came apart into 猫|が|い|ま|す, which makes the あります／います
    // lesson impossible to write.
    //
    // This was once every `uk` verb, and that was too much: kana collides with
    // far more of the language than kanji does, and conjugating all of them let
    // the wrong homograph claim common spellings first. いって was claimed by
    // 要る "to be needed" — so いってきます glossed as needing something —
    // かかります by 罹る "to contract a disease", and 居る claimed the います
    // inside ありがとうございます, on 342 lines. Every one of those was a real
    // word wrongly identified, which is worse than an unrecognised one.
    //
    // These three are named because they are unavoidable: ある and いる are the
    // existential verbs and なる is how anything becomes anything — 先生になります
    // is the pattern an N5 topic is built on, and it was coming apart as
    // な|り|ま|す. Naming them individually is what keeps the homographs out:
    // なる is also 鳴る "to sound" and 生る "to bear fruit", and only 成る is
    // listed here, so only 成る can claim なります.
    if (row.form !== row.primaryForm && !(KANA_CONJUGATING.has(row.primaryForm) && !HAS_KANJI.test(row.form)))
      continue

    // Verbs only. `conjugate` has no adjective branch — its switch covers the
    // five verb classes and nothing else — so handing it 寒い as an ichidan
    // would confidently produce 寒ます. Inflected adjectives are left to the
    // tokeniser's fallback, which matches 寒かった back to 寒い on the shared
    // stem without needing to know the rule.
    const verbClass = classifyVerb(sense?.pos ?? [])
    if (verbClass) {
      const forms = conjugateAll({ surface: row.form, reading: row.reading, verbClass })
      for (const c of forms)
        inflections.push({ surface: c.surface, gloss })

      // 〜たい, off the ます stem.
      //
      // Not in `CONJUGATION_FORMS`, which drives the conjugation drills and is
      // not the place to fix a tokenising problem. Without it 見たい cut as
      // 見た | い — the PAST tense plus a stray kana — so the lesson teaching
      // "want to" showed a chip meaning "saw". A single unmatched kana after a
      // real word is exactly the shape the sentence checker cannot see.
      const masu = forms.find(c => c.form === 'masu')
      if (masu?.surface.endsWith('ます'))
        inflections.push({ surface: `${masu.surface.slice(0, -2)}たい`, gloss })
    }
  }

  // Conjugations last, so a derived form can never outrank a word somebody
  // actually wrote: an obscure verb's causative-passive should not be able to
  // take a spelling that is some other word's plain dictionary entry.
  for (const { surface, gloss } of inflections)
    claim(surface, gloss)

  // Counted things, which the dictionary generates rather than lists.
  //
  // 三時 is a word everybody knows, with one reading, but JMdict holds 時 and it
  // holds 三. Claimed here, before the patterns and after everything real, so
  // the entries that DO exist — 一つ, 一人, 二人, 一時, 十分 — keep their own
  // glosses.
  for (const c of counterWords())
    claim(c.form, c)

  // Then the grammar patterns, which fill what is left.
  //
  // Japanese grammar is largely assembled from pieces that are not words, and
  // JMdict is a dictionary of words — so です, ます, てもいい, なければなりません,
  // でしょう, つもり and けど are in NONE of it. Every one of them shredded into
  // the kana it is spelled with: 学生です came apart as 学生 | で | す, and nine
  // N5 topics could not have example sentences written at all, because the
  // sentences that teach a pattern necessarily contain it.
  //
  // The patterns are already in the database — every lesson has a title, and a
  // title is the pattern. So they are read from there rather than invented, and
  // a topic added later is indexed without anybody remembering to.
  //
  // Claimed LAST, after even the conjugations, so this can only ever fill a
  // gap. Anything a real word or a real inflection already holds keeps it.
  for (const p of await patterns(languageCode)) {
    // Not if the pattern merely glues a particle onto a word that already
    // exists. The 〜が好き topic is titled with its particle attached, and
    // indexing it whole made 音楽が好きです cut as 音楽 | が好き | です — which
    // hides the が the lesson is about, and puts it inside a chip the reader
    // cannot place. A pattern is worth indexing when it is a unit the
    // dictionary lacks, not when it is a word with something stuck to it.
    const tail = [...p.form].slice(1).join('')
    if (tail.length > 1 && byForm.has(tail))
      continue
    claim(p.form, p)
  }

  return { index: buildTokenIndex(byForm.keys()), byForm }
}

export async function glossary(languageCode: string): Promise<Glossary> {
  cached ??= build(languageCode)
  return cached
}

/**
 * Split one line into tokens, attaching a gloss wherever the dictionary has one.
 *
 * `reading` is the line's own kana, which the authoring format already carries
 * with the particles spoken correctly — は as わ, を as お. Cutting it up along
 * the token boundaries is what lets romaji mode stay tappable: each token
 * renders its own romaji instead of the whole line being romanised as one
 * string, which also spaces the words apart for free.
 */
/**
 * Tokenisable fragments of every published lesson title.
 *
 * A title is written the way the pattern is written — 〜てもいい, これ・それ・
 * あれ・どれ, 〜から (because) — so the Japanese runs inside it ARE the forms to
 * index. The English, the 〜 and the separators fall out on their own.
 */
async function patterns(languageCode: string): Promise<WordGloss[]> {
  const rows = await db
    .select({ title: grammarPoints.title, pattern: grammarPoints.pattern, meaning: grammarPoints.meaningShort })
    .from(grammarPoints)
    .innerJoin(languages, eq(languages.id, grammarPoints.languageId))
    .where(and(eq(languages.code, languageCode), eq(grammarPoints.published, true)))

  const seen = new Set<string>()
  const out: WordGloss[] = []
  for (const row of rows) {
    // The `pattern` column as well as the title, because they cut differently
    // and both cuts are needed. The title of the 〜てもいい topic is 〜てもいい,
    // which can never match: the verb's own conjugation takes the て first, so
    // the string to look for is もいい — and that is what `pattern` holds,
    // "Verb-て + もいい".
    //
    // ・ is katakana-block punctuation, so it sits inside the run pattern and
    // これ・それ・あれ・どれ matched as ONE form. Split on it first.
    const source = `${row.title} ${row.pattern ?? ''}`.replace(/・/g, ' ')
    for (const raw of source.match(JAPANESE_RUN) ?? []) {
      // Trailing copula and particles come off, because they are indexed in
      // their own right and a pattern that keeps them swallows them: the 〜つもり
      // pattern is written "つもりです" and cut 行くつもりです as 行く | つもりです,
      // and a これは pattern hid the は the reader is meant to place.
      // Only when something substantial is left: the です topic is titled です,
      // and trimming that leaves nothing to index — which is how the copula
      // stopped being a word again.
      const trimmed = raw.replace(/(?:です|ます|でした)$/, '').replace(/[はをにがでもとやへか]$/, '')
      const form = [...trimmed].length >= 2 ? trimmed : raw
      // Single characters are left alone. They are particles the dictionary
      // already holds, and claiming the rest — い from an adjective pattern, た
      // from the past tense — told `check:examples` that a shredded run was
      // fine, because every piece of it now had a gloss. The check exists to
      // catch exactly that, and this blinded it.
      if ([...form].length < 2 || seen.has(form))
        continue
      seen.add(form)
      out.push({ form, reading: form, meanings: [row.meaning], pos: 'grammar' })
    }
  }
  // Longest first, so 〜てもいい is claimed before 〜て can take the front of it.
  return out.sort((a, b) => b.form.length - a.form.length)
}

export function glossLine(line: string, g: Glossary, reading?: string): GlossedToken[] {
  const tokens = tokenise(line, g.index)
  const readings = reading ? splitReading(line, reading, tokens.map(t => [...t.t].length)) : null

  return tokens.map((token, i) => {
    const word = token.key ? g.byForm.get(token.key) : undefined
    const r = readings?.[i]
    return {
      t: token.t,
      // An EMPTY reading is meaningful and must be kept: a run of kanji carries
      // its whole reading on the first character, so a token covering the rest
      // of the run legitimately reads as nothing. Dropping it as falsy made the
      // renderer fall back to the surface, which is how 千二百円です came out as
      // `sen nihyaku en二百円 desu`.
      ...(r === undefined ? {} : { r }),
      ...(word ? { w: word } : {})
    }
  })
}

/**
 * Cut a line's kana across token boundaries.
 *
 * Not `alignFurigana`, and the reason matters: these readings are SPOKEN
 * readings. The authoring format writes 傘を as かさ お and 私は as わたし わ,
 * because that is what the romaji has to say. The aligner anchors kana to
 * identical kana, so every particle in the corpus fails to anchor and the
 * whole line is abandoned.
 *
 * So the walk is done here with those three substitutions treated as matches.
 * Kana pair off one for one; a run of kanji takes whatever reading sits before
 * the next kana anchor. Anything that does not line up returns null and the
 * line falls back to being romanised whole — the reader gets no word spacing
 * rather than a word cut in the wrong place.
 */
function splitReading(line: string, reading: string, lengths: number[]): string[] | null {
  // Word boundaries first, earliest match second.
  //
  // Preferring a boundary is what lets 母 take はは rather than は, but it is a
  // preference and not a rule: consuming to a later boundary can desync the
  // rest of the walk and lose the line entirely. Trying it first and falling
  // back means a line can only ever gain a better cut, never lose the one it
  // already had.
  return walkReading(line, reading, lengths, true) ?? walkReading(line, reading, lengths, false)
}

function walkReading(line: string, reading: string, lengths: number[], preferBoundary: boolean): string[] | null {
  const surface = [...line]
  const kana = [...reading]

  /** は/を/へ read as わ/お/え when they are particles, and only then. */
  const spoken = (char: string): string =>
    char === 'は' ? 'わ' : char === 'を' ? 'お' : char === 'へ' ? 'え' : char

  /**
   * Surface positions where a TOKEN begins.
   *
   * A kanji run's anchor is the kana that follow it, and those kana are only a
   * word boundary if they start a new token. In 良い一日を the い is okurigana —
   * part of 良い — so the space in よい いちにち お falls INSIDE the token, and
   * preferring it cut 良い as よい+い and left 一日 reading ちにち.
   */
  const tokenStart = new Set<number>()
  let cursor = 0
  for (const len of lengths) {
    tokenStart.add(cursor)
    cursor += len
  }

  const perChar: string[] = []
  let i = 0
  let j = 0

  /**
   * Spaces the author put in the reading, waiting to be attached to whatever
   * comes next.
   *
   * `これ お おねがいします` is spaced at the word boundaries by the person who
   * wrote it, which is better information than anything this code could infer:
   * を is not in the dictionary, so guessing boundaries from what got a gloss
   * ran これを together as `koreo`. Carrying the spaces through means the romaji
   * breaks exactly where the author meant it to, and nowhere else — no space
   * before a full stop, and none inside すみません.
   */
  let pending = ''

  while (i < surface.length) {
    const char = surface[i]!

    while (j < kana.length && /\s/.test(kana[j]!)) {
      pending += ' '
      j += 1
    }

    if (!HAS_KANJI.test(char)) {
      if (j >= kana.length || spoken(char) !== spoken(kana[j]!))
        return null
      // The READING's character is kept, not the surface's: it is the one that
      // romanises correctly, which is the entire point of storing it.
      perChar.push(pending + kana[j]!)
      // Authors do not space after a comma — the kana is written 「すみません、
      // メニュー お ください」 — but romaji wants one, or the line reads as
      // `sumimasen,menyuu`.
      pending = /[、。！？]/.test(kana[j]!) ? ' ' : ''
      i += 1
      j += 1
      continue
    }

    // A run of kanji, and the kana that follow it up to the next kanji. That
    // following kana is the anchor: wherever it turns up in the reading is
    // where this run's reading ends.
    let end = i
    while (end < surface.length && HAS_KANJI.test(surface[end]!))
      end += 1

    let anchorEnd = end
    while (anchorEnd < surface.length && !HAS_KANJI.test(surface[anchorEnd]!))
      anchorEnd += 1
    const anchor = surface.slice(end, anchorEnd).map(spoken).join('')
    // Spaces are stripped for the anchor search only: they mark word
    // boundaries, and a boundary may fall anywhere inside the run's reading.
    //
    // Both sides are normalised, because a reading may be written either way:
    // authored lines transcribe the particle は as わ, while a reading rebuilt
    // from furigana keeps it as は.
    const rest = kana.slice(j).filter(c => !/\s/.test(c)).map(spoken).join('')

    // Which of those stripped characters START a word, according to the spaces
    // the author put in.
    //
    // The anchor is a single kana often enough that it turns up INSIDE the run's
    // own reading: 母は先生です。 reads はは わ せんせい です。, so the anchor わ
    // (は spoken) matches はは's first character as readily as the particle, and
    // 母 came out annotated は. The space after はは says where the word actually
    // ends — better information than any guess — so a match on a word boundary
    // wins over an earlier one that is not.
    const startsWord: boolean[] = []
    let atBoundary = true
    for (const c of kana.slice(j)) {
      if (/\s/.test(c)) {
        atBoundary = true
        continue
      }
      startsWord.push(atBoundary)
      atBoundary = false
    }

    // No anchor means the run reaches the end of the line, so it takes the
    // rest of the reading.
    let consumed: number
    if (!anchor) {
      consumed = rest.length
    } else {
      // At least one character must belong to the run itself, so the search
      // starts one past the run's first reading character.
      // Every place the anchor could sit, boundary matches preferred. With no
      // spaces in the reading — cloze contexts rebuilt from furigana carry
      // none — nothing starts a word past the first character, so this falls
      // back to the earliest match and behaves exactly as it always did.
      const hits: number[] = []
      for (let at = rest.indexOf(anchor, 1); at !== -1; at = rest.indexOf(anchor, at + 1))
        hits.push(at)
      if (hits.length === 0)
        return null
      consumed = (preferBoundary && tokenStart.has(end)
        ? hits.find(n => startsWord[n])
        : undefined) ?? hits[0]!
    }

    if (consumed <= 0)
      return null

    // Walk forward that many NON-space characters, keeping any spaces met on
    // the way inside the run's reading.
    let taken = 0
    let runEnd = j
    while (runEnd < kana.length && taken < consumed) {
      if (!/\s/.test(kana[runEnd]!))
        taken += 1
      runEnd += 1
    }
    if (taken < consumed)
      return null

    // The run's reading rides on its first character; the rest contribute
    // nothing, so slicing at any token boundary inside the run still works.
    perChar.push(pending + kana.slice(j, runEnd).join(''))
    pending = ''
    for (let k = i + 1; k < end; k += 1)
      perChar.push('')

    i = end
    j = runEnd
  }

  // Trailing whitespace in the reading is allowed; anything else left over
  // means the two never lined up.
  while (j < kana.length && /\s/.test(kana[j]!))
    j += 1
  if (j !== kana.length)
    return null

  const out: string[] = []
  let at = 0
  for (const length of lengths) {
    out.push(perChar.slice(at, at + length).join(''))
    at += length
  }
  return out
}

/**
 * The same, for the dialogue snapshot the study queue carries.
 *
 * The queue serves a pre-built jsonb prompt rather than the tables, so the
 * tokens have to be attached on the way out — the mirror of what
 * `withDialogueAudio` does for the clips. Anything that is not a dialogue
 * passes straight through.
 */
export function withDialogueTokens(prompt: Record<string, unknown>, g: Glossary): Record<string, unknown> {
  if (prompt.kind !== 'dialogue' || !Array.isArray(prompt.turns))
    return prompt

  const line = (row: Record<string, unknown>) => typeof row.text === 'string'
    ? { ...row, tokens: glossLine(row.text, g, typeof row.reading === 'string' ? row.reading : undefined) }
    : row

  const turns = prompt.turns.map((turn) => {
    if (typeof turn !== 'object' || turn === null)
      return turn
    const t = turn as Record<string, unknown>
    const replies = Array.isArray(t.replies)
      ? t.replies.map(reply =>
          typeof reply === 'object' && reply !== null ? line(reply as Record<string, unknown>) : reply)
      : t.replies
    return { ...line(t), replies }
  })

  return { ...prompt, turns }
}

/** A furigana segment as the prompt jsonb carries it. */
interface Segment { t: string, r?: string }

/** The kana a run of furigana segments spells out. */
function readingOf(segments: unknown): string | undefined {
  if (!Array.isArray(segments))
    return undefined
  return segments
    .map(seg => (typeof seg === 'object' && seg !== null
      ? ((seg as Segment).r ?? (seg as Segment).t ?? '')
      : ''))
    .join('')
}

/**
 * Attach tappable words to a study prompt.
 *
 * Only to the CONTEXT around a cloze blank. The word under test is deliberately
 * left alone: on a reading or meaning card the answer is exactly what a gloss
 * would reveal, so making it tappable would hand the card away. The sentence it
 * sits in is the opposite — it is there to be understood, and looking up a word
 * you do not know is the whole point.
 *
 * Readings come from the furigana the importer already computed, so no second
 * alignment pass is needed and the two can never disagree.
 */
export function withPromptTokens(prompt: Record<string, unknown>, g: Glossary): Record<string, unknown> {
  if (prompt.kind !== 'cloze')
    return prompt

  const out = { ...prompt }
  if (typeof prompt.before === 'string' && prompt.before)
    out.beforeTokens = glossLine(prompt.before, g, readingOf(prompt.beforeFurigana))
  if (typeof prompt.after === 'string' && prompt.after)
    out.afterTokens = glossLine(prompt.after, g, readingOf(prompt.afterFurigana))
  return out
}
