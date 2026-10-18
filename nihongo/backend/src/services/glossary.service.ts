import type { FuriganaSegment } from '@nihongo/shared/lib'
import type { GlossedToken, WordGloss } from '@nihongo/shared/types'

import db from '@nihongo/shared/db'
import { grammarPoints, languageLevels, languages, wordForms, words, wordSenses } from '@nihongo/shared/db/schema'
import { buildTokenIndex, classifyVerb, conjugateAll, readLine, splitAround, toHiragana, tokenise } from '@nihongo/shared/lib'
import { and, asc, eq } from 'drizzle-orm'

import { glueAuthorWords, regroupKana } from '../lib/author-segments.js'
import { counterWords } from '../lib/counters.js'
import { posLabel } from '../lib/pos.js'
import { setPhrases } from '../lib/set-phrases.js'

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

interface Glossary {
  /** First character to the dictionary forms starting with it, longest first. */
  index: Map<string, string[]>
  /** Every written form to the word it spells. */
  byForm: Map<string, WordGloss>
  /**
   * The kana spellings in `KANA_SPELLED`, with their inflections, to the word.
   *
   * NOT used to tokenise: kana collides with far more of the language than
   * kanji does. Consulted only by `regroupKana`, for a kana word an author
   * marked as one word and the dictionary cut inside.
   */
  byReading: Map<string, WordGloss>
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
/**
 * Words a learner meets written in kana, as `<primary form>:<reading>`.
 *
 * A word normally written in kanji is indexed by its kanji, so the same word
 * written in kana — because its kanji is above the reader's level — is not
 * found, and longest-match cuts it into whatever kana words do exist: わたし
 * became わた "cotton" | し "and", ねます became ね | ます.
 *
 * Named one by one rather than indexing every reading, because that was tried:
 * kana is ambiguous, and the reading index glossed いい as 飯 "rice", どうか as
 * 銅貨 "copper coin" and また as 股. Keyed on the reading as well as the form
 * because 私 alone has a dozen readings, and し is not one to hand out.
 *
 * Consulted only through `regroupKana`, where the author's own word breaks say
 * the kana IS one word. Add to it when `check:readings` reports a cut word
 * that the dictionary has under its kanji.
 */
const KANA_SPELLED = new Set([
  '私:わたし',
  '皆さん:みなさん',
  '果物:くだもの',
  '寝る:ねる',
  '怖い:こわい',
  '机:つくえ',
  '壁:かべ',
  '掃除:そうじ',
  '言葉:ことば',
  '美味しい:おいしい',
  '飛ぶ:とぶ',
  '濡れる:ぬれる',
  '寂しい:さびしい',
  '嫌:いや',
  '初めに:はじめに',
  '歳:さい',
  '静か:しずか',
  '寿司:すし'
])

/** Verbs whose KANA spelling conjugates too — see the note where it is used. */
const KANA_CONJUGATING = new Set(['有る', '居る', '成る', '為る', '分かる', '掛ける', '参る'])

/**
 * Pattern forms that are right for the topic that produced them and wrong
 * everywhere else.
 *
 * かった is the i-adjective past, but the first topic to claim it was 〜なかった,
 * so every 楽しかった was glossed "plain negative past". とて and がち are real N1
 * patterns that sit on the front of far commoner words — とても, がちょうど.
 *
 * まい was here and came off: 参る is published, so 参ります is indexed as its
 * own conjugation and wins on length, and excluding まい only shredded the
 * 〜まい topic's own sentences into ま|い.
 *
 * Deliberately short. Excluding a form makes it SHRED instead, which is its own
 * harm: なさい and かけ were here and came out as な|さ|い and か|け|て, so they
 * went back and their verbs were taught to conjugate in kana instead. いつ was
 * here too and shredded the question-word topic's own いつ来ますか, and かった is
 * listed in `set-phrases.ts` with the right meaning rather than excluded.
 */
/**
 * The verb class of a pattern that ends in one, or null if it does not.
 *
 * Read off the ending rather than from JMdict, because a pattern is not a
 * dictionary entry and has no part of speech to look up. Only the endings whose
 * class is settled are here. る is the only ambiguous ending, so only the る
 * endings that can only be ichidan are listed; everything else that ends in a
 * verb vowel is godan, because an ichidan verb ends in る and nothing else.
 * An ending that settles nothing is left alone rather than guessed — a wrong
 * class produces confident nonsense (寒い as ichidan gives 寒ます).
 */
/**
 * Whether a form can be built greedily out of entries the index already holds.
 *
 * The question a pattern's inflections hang on: if the pieces are all there,
 * the reader is better served seeing them.
 */
function decomposable(form: string, byForm: Map<string, WordGloss>): boolean {
  const chars = [...form]
  let i = 0
  while (i < chars.length) {
    let matched = 0
    for (let len = chars.length - i; len > 0; len--) {
      if (byForm.has(chars.slice(i, i + len).join(''))) {
        matched = len
        break
      }
    }
    if (matched === 0)
      return false
    i += matched
  }
  return true
}

function PATTERN_VERB_CLASS(form: string): 'ichidan' | 'suru' | 'godan' | null {
  // A pattern already in a polite form is not a plain verb to conjugate.
  // ことができます ends in す, and conjugating it as a godan verb produced
  // ことができませ — which then claimed the front of ことができません and left
  // the ん stranded as a chip of its own.
  if (/(?:ます|ませ|ません|ました|です|でした)$/.test(form))
    return null
  if (form.endsWith('する'))
    return 'suru'
  if (/(?:れる|せる|える|ける|てる|でる|める|ねる)$/.test(form))
    return 'ichidan'
  // Every other verb ending is godan without exception — an ichidan verb ends
  // in る and nothing else, so う, く, ぐ, す, つ, ぬ, ぶ and む settle it.
  if (/[うくぐすつぬぶむ]$/.test(form))
    return 'godan'
  if (form.endsWith('なる'))
    return 'godan'
  return null
}

const PATTERN_STOPLIST = new Set(['とて', 'がち', 'の中', 'なり', 'たま', 'あり'])

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
  const byReading = new Map<string, WordGloss>()

  /** Same first-wins rule as `claim`, on the reading index. */
  const claimReading = (kana: string, gloss: WordGloss) => {
    const key = toHiragana(kana)
    if (!byReading.has(key))
      byReading.set(key, gloss)
  }

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
      pos: posLabel(sense?.pos ?? []),
      wordId: row.wordId
    }

    // A kana-only word outside the JLPT lists is never matched by longest-match.
    // These come in for the speeches — それで, もし, ところが, かつて — and each
    // is also an ordinary run of kana in someone else's sentence: もし swallowed
    // the middle of かもしれません and 乾燥もします, and ところが took 最後の
    // ところが "the last part" for "however". They are found only where an
    // author's reading marks them as one word, through the reading index.
    if (row.level === null && !HAS_KANJI.test(row.primaryForm)) {
      if (row.form === row.primaryForm)
        claimReading(row.form, gloss)
      continue
    }

    claim(row.form, gloss)
    const kanaSpelled = row.form === row.primaryForm && KANA_SPELLED.has(`${row.primaryForm}:${row.reading}`)
    if (kanaSpelled) {
      claimReading(row.reading, gloss)
      // The plain i-adjective inflections, for the reading index only — こわかった
      // and おいしく written in kana have no other way to be found whole.
      if ((sense?.pos ?? []).includes('adj-i') && row.reading.endsWith('い')) {
        const stem = row.reading.slice(0, -1)
        for (const tail of ['く', 'くて', 'かった', 'くない', 'くなかった', 'ければ'])
          claimReading(`${stem}${tail}`, gloss)
      }
    }

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
    // Named individually because each is unavoidable and each has homographs
    // that must NOT take its spelling: ある and いる are the existential verbs,
    // なる is how anything becomes anything, する is how a noun becomes a verb,
    // 分かる is the commonest acknowledgment in the language, and 掛ける is
    // everywhere. なる is also 鳴る "to sound" and 生る "to bear fruit"; only 成る
    // is listed, so only 成る can claim なります.
    //
    // The first version of this rule admitted every `uk` verb and let the wrong
    // homograph win — いってきます glossed as 要る "to be needed". The version
    // after it was too tight and lost する on 461 lines and 分かる on 151, so
    // わかりました was read as two particles and a stem.
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
      // The same forms spelled in kana — ねます for 寝る — for the reading index.
      if (kanaSpelled) {
        for (const c of conjugateAll({ surface: row.reading, reading: row.reading, verbClass }))
          claimReading(c.surface, gloss)
      }

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

  // Fixed expressions, for the same reason: ありがとうございます is one thing to
  // a learner and 有り難う + ございます to a dictionary.
  for (const p of setPhrases())
    claim(p.form, p)

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
  for (const p of await patterns(languageCode, byForm)) {
    // Not if the pattern merely glues a particle onto a word that already
    // exists. The 〜が好き topic is titled with its particle attached, and
    // indexing it whole made 音楽が好きです cut as 音楽 | が好き | です — which
    // hides the が the lesson is about, and puts it inside a chip the reader
    // cannot place. A pattern is worth indexing when it is a unit the
    // dictionary lacks, not when it is a word with something stuck to it.
    const tail = [...p.form].slice(1).join('')
    if (tail.length > 1 && byForm.has(tail))
      continue
    // Asked BEFORE the claim, or the pattern would find itself and every
    // pattern would look decomposable.
    const builds = decomposable(p.form, byForm)
    claim(p.form, p)

    // A pattern that ends in a verb conjugates like one — but only if the
    // dictionary cannot already build it out of pieces.
    //
    // 〜を余儀なくされる is written in the dictionary form, and no sentence
    // teaching it is: 中止を余儀なくされました is what the pattern is FOR. The
    // plain form alone left every example shredding into 余 | 儀 | な | く |
    // さ | れ | ました, which is the topic pulling its own lesson apart.
    //
    // The gate is decomposability, and it is doing real work. ことにする,
    // ようになる, てくれる and 食べられる are all assembled from things already
    // in the index, and conjugating them glued こと | に | しました into one
    // chip — hiding the に that lesson is entirely about, which is the same
    // mistake the が好き rule above exists to prevent. 余儀なくされる cannot be
    // assembled from anything: 余 and 儀 are unclaimed single kanji.
    const verbClass = builds ? null : PATTERN_VERB_CLASS(p.form)
    if (verbClass) {
      for (const c of conjugateAll({ surface: p.form, reading: p.form, verbClass }))
        claim(c.surface, { ...p, form: c.surface, reading: c.surface })
    }
  }

  return { index: buildTokenIndex(byForm.keys()), byForm, byReading }
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
async function patterns(languageCode: string, claimed: Map<string, WordGloss>): Promise<WordGloss[]> {
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
      // Trimmed only when what remains is ALREADY A WORD.
      //
      // The trim exists because a pattern written with its copula or its
      // particle attached swallows them — "つもりです" cut 行くつもりです as
      // 行く | つもりです. But applied blindly it mangles the pattern instead:
      // とても ends with も and became とて, もっと became もっ, and
      // をお願いします became をお願いし — a truncated verb stem with a particle
      // stuck on the front, which then claimed 93 lines and put the kanji 願
      // inside answers that were supposed to be kana.
      //
      // Requiring the remainder to be something already claimed keeps the
      // cases the trim was for (つもりです → つもり, これは → これ) and drops
      // the ones it was breaking.
      const trim = (r: RegExp): string => {
        const cut = raw.replace(r, '')
        return cut !== raw && [...cut].length >= 2 && claimed.has(cut) ? cut : raw
      }
      const copula = trim(/(?:です|ます|でした)$/)
      const form = copula !== raw ? copula : trim(/[はをにがでもとやへか]$/)
      // Single characters are left alone. They are particles the dictionary
      // already holds, and claiming the rest — い from an adjective pattern, た
      // from the past tense — told `check:examples` that a shredded run was
      // fine, because every piece of it now had a gloss. The check exists to
      // catch exactly that, and this blinded it.
      // を and へ never begin a pattern — they are the frame it attaches to,
      // so they come OFF rather than taking the pattern down with them.
      //
      // Skipping the whole form was the first attempt, and it lost the patterns
      // written with their particle attached: をものともせず and を余儀なくされる
      // are how those topics state themselves, and both then shredded, taking
      // their own lessons with them — a topic cannot teach a pattern its
      // example sentences pull apart.
      //
      // Only those two particles. An earlier version used every particle
      // character and knocked out です, which begins with で, and とても, which
      // begins with と: the copula stopped being a word for the second time.
      const stripped = form.replace(/^[をへ]/, '')
      if ([...stripped].length < 2)
        continue
      // Forms that are correct for the topic that produced them and wrong
      // everywhere else. かった is the i-adjective past, but the FIRST topic to
      // claim it was 〜なかった, so every 楽しかった was glossed "plain negative
      // past"; とて and がち are real N1 patterns that sit on the front of far
      // commoner words (とても, がちょうど).
      if (PATTERN_STOPLIST.has(stripped) || seen.has(stripped))
        continue
      seen.add(stripped)
      out.push({ form: stripped, reading: stripped, meanings: [row.meaning], pos: 'grammar' })
    }
  }
  // Longest first, so 〜てもいい is claimed before 〜て can take the front of it.
  return out.sort((a, b) => b.form.length - a.form.length)
}

export function glossLine(
  line: string,
  g: Glossary,
  reading?: string | readonly FuriganaSegment[],
  opts: { regroupKana?: boolean } = {}
): GlossedToken[] {
  const tokens = tokenise(line, g.index)
  // The dictionary entry behind each word as the tokeniser matched it.
  const keys = new Map(tokens.map(t => [t.t, t.key]))
  const glossOf = (t: string) => {
    const key = keys.get(t)
    return key ? g.byForm.get(key) : undefined
  }
  const plainTokens: GlossedToken[] = tokens.map((token) => {
    const word = token.key ? g.byForm.get(token.key) : undefined
    return { t: token.t, ...(word ? { w: word } : {}) }
  })
  if (reading === undefined || reading.length === 0)
    return plainTokens

  // Each word's reading, from the import's alignment where there is one and
  // from the author's reading otherwise — see readLine for why it is never a
  // single left-to-right guess. Null: the reading does not fit the line, which
  // the content checker reports; the words are still shown and tappable.
  const groups = readLine(
    tokens.map(t => t.t),
    typeof reading === 'string' ? { reading } : { segments: reading },
    surface => glossOf(surface)
  )
  if (!groups)
    return plainTokens

  const glossed: GlossedToken[] = groups.map((group) => {
    const members = plainTokens.slice(group.from, group.to)
    if (members.length === 1)
      return { ...members[0]!, r: group.r, f: group.f }
    // Words whose shared reading cannot be divided — shown as one, the way a
    // compound the dictionary split is: the whole word's gloss if there is one,
    // and its pieces either way.
    const parts = members.map(m => m.w
      ? (({ parts: _parts, ...rest }) => rest)(m.w)
      : { form: m.t, reading: '', meanings: [], pos: null })
    const whole = g.byForm.get(group.t)
    return {
      t: group.t,
      r: group.r,
      f: group.f,
      w: whole ? { ...whole, parts } : { form: group.t, reading: group.r.trim(), meanings: [], pos: null, parts }
    }
  })

  // Opt-in, and only with the author's reading: its spaces are what say where
  // the words are. On for read-aloud speeches, which are written in kana up to
  // their level and need it; off elsewhere until each corpus has been checked,
  // because kana is ambiguous and a regrouped homophone is a wrong gloss.
  //
  // A word written in kana is looked up as written first — それから, よろしく —
  // and only hiragana falls back to the reading of a word usually written in
  // kanji. Katakana is a loanword spelled as itself; ホット is not ほっと.
  if (typeof reading !== 'string' || !opts.regroupKana)
    return glossed
  const kana = regroupKana(glossed, word => g.byForm.get(word)
    ?? (/^[\u3041-\u309F]+$/.test(word) ? g.byReading.get(toHiragana(word)) : undefined))
  // Then words with kanji in them that the dictionary split — 山|本 — glued
  // back into one chip that lists its pieces.
  return glueAuthorWords(kana, word => g.byForm.get(word))
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

/**
 * The furigana the importer aligned, kept as segments. It used to be joined
 * into one string and cut again here, which threw the alignment away and
 * re-guessed it — the guess was where 一日に read as いちに.
 */
function segmentsOf(segments: unknown): FuriganaSegment[] | undefined {
  if (!Array.isArray(segments))
    return undefined
  return segments.filter((seg): seg is Segment => typeof seg === 'object' && seg !== null && typeof (seg as Segment).t === 'string')
}

/**
 * Attach tappable words to a study prompt.
 *
 * And to a Speak answer, which is only shown once it has been said aloud.
 *
 * Only to the CONTEXT around a cloze blank. The word under test is deliberately
 * left alone: on a reading or meaning card the answer is exactly what a gloss
 * would reveal, so making it tappable would hand the card away. The sentence it
 * sits in is the opposite — it is there to be understood, and looking up a word
 * you do not know is the whole point.
 *
 * Readings come from the furigana the importer already computed, used as
 * aligned, so the two can never disagree.
 */
export function withPromptTokens(prompt: Record<string, unknown>, g: Glossary, answer?: unknown): Record<string, unknown> {
  // A Speak answer, cut exactly as the session cuts it — the author's reading
  // guides the kana — so a word reads the same in both places.
  if (prompt.kind === 'speak' && typeof prompt.text === 'string' && typeof prompt.reading === 'string')
    return { ...prompt, tokens: glossLine(prompt.text, g, prompt.reading, { regroupKana: true }) }
  // A grammar cloze stores one sentence with its blank, and the reading of the
  // whole sentence with the answer filled in. Read whole through the same
  // aligner as every other line, then cut at the blank — so each half shows
  // furigana in the reader's mode. Without a reading the words are still cut
  // and tappable, but carry no reading rather than a guessed one.
  if (prompt.kind === 'grammar' && typeof prompt.sentence === 'string' && prompt.sentence.includes('＿')) {
    const sentence = prompt.sentence
    const from = [...sentence.slice(0, sentence.indexOf('＿'))].length
    const primary = (answer as { primary?: unknown } | undefined)?.primary
    const filled = typeof primary === 'string' ? primary : null
    const reading = typeof prompt.reading === 'string' ? prompt.reading : undefined
    const blank = /＿+/.exec(sentence)![0]
    const full = filled ? sentence.replace(blank, filled) : null
    if (full && reading) {
      const { before, after } = splitAround(glossLine(full, g, reading, { regroupKana: true }), from, from + [...filled!].length)
      // The reading spells the answer out, so it is used here and not sent on.
      const { reading: _answerInside, ...rest } = prompt
      return { ...rest, beforeTokens: before, afterTokens: after }
    }
    return {
      ...prompt,
      beforeTokens: glossLine(sentence.slice(0, sentence.indexOf('＿')), g),
      afterTokens: glossLine(sentence.slice(sentence.lastIndexOf('＿') + 1), g)
    }
  }
  if (prompt.kind !== 'cloze')
    return prompt

  const out = { ...prompt }
  if (typeof prompt.before === 'string' && prompt.before)
    out.beforeTokens = glossLine(prompt.before, g, segmentsOf(prompt.beforeFurigana))
  if (typeof prompt.after === 'string' && prompt.after)
    out.afterTokens = glossLine(prompt.after, g, segmentsOf(prompt.afterFurigana))
  return out
}
