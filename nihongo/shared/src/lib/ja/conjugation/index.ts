/**
 * Japanese verb and adjective conjugation.
 *
 * Pure and self-contained, so it runs identically in the browser (for offline
 * drills) and on the server (for materialising prompts). Everything
 * Japanese-specific lives under lib/ja/ by design — nothing here should leak
 * into the language-agnostic scheduler.
 *
 * The central trick: a godan verb's dictionary form ends in the SAME kana in
 * both its written and its kana form — 書く and かく both end in く. So a
 * transformation applied to the tail works on both, and the kanji stem is left
 * untouched. That is why conjugate() takes the surface and the reading and
 * applies one rule to each.
 */

/**
 * The regular groups, the two irregulars, and the special classes JMdict marks
 * with their own codes, each of which breaks one rule of its group:
 *
 * - `honorific` (v5aru: くださる, いらっしゃる) takes い, not り, before ます and
 *   in the command: くださいます, ください.
 * - `godan-u` (v5u-s: 問う) keeps its う before て and た: 問うて, 問うた.
 * - `kureru` (v1-s: くれる) has the command くれ, not くれろ.
 * - `suru-special` (vs-s: 愛する, 達する) is a する verb fused to one kanji,
 *   and some of its forms differ word by word.
 * - `zuru` (vz: 信ずる) goes as the ichidan 信じる except in the dictionary
 *   form and before ば: 信じない, but 信ずれば.
 */
export const VERB_CLASSES = ['godan', 'ichidan', 'suru', 'kuru', 'aru', 'honorific', 'godan-u', 'kureru', 'suru-special', 'zuru'] as const
export type VerbClass = typeof VERB_CLASSES[number]

export const CONJUGATION_FORMS = [
  'dictionary',
  'masu',
  'masen',
  'mashita',
  'masen-deshita',
  'te',
  'ta',
  'nai',
  'nakatta',
  'potential',
  'volitional',
  'passive',
  'causative',
  'imperative',
  'conditional-ba',
  'conditional-tara'
] as const
export type ConjugationForm = typeof CONJUGATION_FORMS[number]

/**
 * Forms built on top of another one: ましょう and たい on the ます stem, ないで on
 * the negative, ている on the te-form. Kept out of `CONJUGATION_FORMS`, which
 * the glossary claims inflections from: claiming 食べている as one word would
 * re-cut every sentence that says it as 食べて | いる.
 */
export const COMPOUND_FORMS = ['mashou', 'tai', 'naide', 'teiru'] as const
export type CompoundForm = typeof COMPOUND_FORMS[number]

/** Every form `conjugate` can produce. */
export type VerbForm = ConjugationForm | CompoundForm

export interface Conjugated {
  form: VerbForm
  surface: string
  reading: string
}

/**
 * Map JMdict part-of-speech codes to a conjugation class.
 *
 * The irregulars are picked out FIRST: `v5k-s` is 行く, which looks like an
 * ordinary く-verb but takes って rather than いて, and `v5r-i` is ある, whose
 * negative is ない rather than あらない. Treating either as regular produces
 * confidently wrong output.
 */
export function classifyVerb(pos: readonly string[]): VerbClass | null {
  if (pos.includes('vs-s'))
    return 'suru-special'
  if (pos.includes('vz'))
    return 'zuru'
  if (pos.some(p => p === 'vs' || p === 'vs-i'))
    return 'suru'
  if (pos.includes('vk'))
    return 'kuru'
  if (pos.includes('v5r-i'))
    return 'aru'
  if (pos.includes('v5aru'))
    return 'honorific'
  if (pos.includes('v5u-s'))
    return 'godan-u'
  if (pos.includes('v5k-s'))
    return 'godan' // 行く: godan, with one te-form exception
  if (pos.includes('v1-s'))
    return 'kureru'
  if (pos.includes('v1') || pos.some(p => p.startsWith('v1-')))
    return 'ichidan'
  if (pos.some(p => /^v5[a-z]/.test(p)))
    return 'godan'
  return null
}

/**
 * A verb `conjugate` can be trusted with: every form it gives is right. A
 * form with no one right answer for the class (愛する's potential is 愛せる,
 * 達する's is 達せられる) it does not give at all, so a table leaves it out
 * and a game never asks it.
 */
export function conjugatesReliably(pos: readonly string[]): boolean {
  return classifyVerb(pos) !== null
}

/** い-adjectives, いい/良い (`adj-ix`, whose stem is よ) among them. */
export function isIAdjective(pos: readonly string[]): boolean {
  return pos.includes('adj-i') || pos.includes('adj-ix')
}

export function isNaAdjective(pos: readonly string[]): boolean {
  return pos.includes('adj-na')
}

/** Godan stem vowel shifts, keyed by the dictionary-form final kana. */
export const GODAN_ROWS: Record<string, { i: string, a: string, e: string, o: string }> = {
  う: { i: 'い', a: 'わ', e: 'え', o: 'お' }, // わ, not あ — a historical w that survives only here
  く: { i: 'き', a: 'か', e: 'け', o: 'こ' },
  ぐ: { i: 'ぎ', a: 'が', e: 'げ', o: 'ご' },
  す: { i: 'し', a: 'さ', e: 'せ', o: 'そ' },
  つ: { i: 'ち', a: 'た', e: 'て', o: 'と' },
  ぬ: { i: 'に', a: 'な', e: 'ね', o: 'の' },
  ぶ: { i: 'び', a: 'ば', e: 'べ', o: 'ぼ' },
  む: { i: 'み', a: 'ま', e: 'め', o: 'も' },
  る: { i: 'り', a: 'ら', e: 'れ', o: 'ろ' }
}

/** 音便 — the sound changes that produce the te/ta forms. */
const GODAN_TE: Record<string, string> = {
  う: 'って',
  つ: 'って',
  る: 'って',
  ぬ: 'んで',
  ぶ: 'んで',
  む: 'んで',
  く: 'いて',
  ぐ: 'いで',
  す: 'して'
}

function teToTa(te: string): string {
  return te.replace(/て$/, 'た').replace(/で$/, 'だ')
}

/** A form as the helpers below make it, before `conjugate` names it. */
type FormResult = Pick<Conjugated, 'surface' | 'reading'>

function tail(text: string): string {
  return text.slice(-1)
}

function trunk(text: string): string {
  return text.slice(0, -1)
}

/** Apply the same ending swap to both the written form and its reading. */
function swap(surface: string, reading: string, ending: string): FormResult {
  return { surface: trunk(surface) + ending, reading: trunk(reading) + ending }
}

function godanForm(surface: string, reading: string, form: ConjugationForm, dictionary: string): FormResult | null {
  const last = tail(reading)
  const row = GODAN_ROWS[last]
  if (!row)
    return null

  // 行く is the single te/ta exception: 行って, never 行いて.
  const isIku = /行く$|いく$/.test(dictionary)
  const te = isIku && last === 'く' ? 'って' : GODAN_TE[last]!

  switch (form) {
    case 'dictionary': return { surface, reading }
    case 'masu': return swap(surface, reading, `${row.i}ます`)
    case 'masen': return swap(surface, reading, `${row.i}ません`)
    case 'mashita': return swap(surface, reading, `${row.i}ました`)
    case 'masen-deshita': return swap(surface, reading, `${row.i}ませんでした`)
    case 'te': return swap(surface, reading, te)
    case 'ta': return swap(surface, reading, teToTa(te))
    case 'nai': return swap(surface, reading, `${row.a}ない`)
    case 'nakatta': return swap(surface, reading, `${row.a}なかった`)
    case 'potential': return swap(surface, reading, `${row.e}る`)
    case 'volitional': return swap(surface, reading, `${row.o}う`)
    case 'passive': return swap(surface, reading, `${row.a}れる`)
    case 'causative': return swap(surface, reading, `${row.a}せる`)
    case 'imperative': return swap(surface, reading, row.e)
    case 'conditional-ba': return swap(surface, reading, `${row.e}ば`)
    case 'conditional-tara': return swap(surface, reading, `${teToTa(te)}ら`)
  }
}

/** The ます forms, ましょう among them, which an honorific verb makes on い. */
export const MASU_FAMILY: ReadonlySet<VerbForm> = new Set(['masu', 'masen', 'mashita', 'masen-deshita', 'mashou'])

/** A godan ます form with the り after the stem made い. */
function riToI(form: string, dictionary: string): string {
  const stem = trunk(dictionary)
  return `${stem}い${form.slice(stem.length + 1)}`
}

/** くださる, いらっしゃる: godan, but い before ます and in the command. */
function honorificForm(surface: string, reading: string, form: ConjugationForm): FormResult | null {
  if (tail(reading) !== 'る')
    return null
  if (form === 'imperative')
    return swap(surface, reading, 'い')
  if (MASU_FAMILY.has(form)) {
    // The godan form with its り made い: くださります → くださいます.
    const regular = godanForm(surface, reading, form, reading)
    return regular && { surface: riToI(regular.surface, surface), reading: riToI(regular.reading, reading) }
  }
  return godanForm(surface, reading, form, reading)
}

/** 問う, 請う: godan, but the う stays before て and た. */
function godanUForm(surface: string, reading: string, form: ConjugationForm): FormResult | null {
  if (tail(reading) !== 'う')
    return null
  if (form === 'te' || form === 'ta' || form === 'conditional-tara') {
    const ending = { 'te': 'うて', 'ta': 'うた', 'conditional-tara': 'うたら' }[form]
    return swap(surface, reading, ending)
  }
  return godanForm(surface, reading, form, reading)
}

/**
 * くれる: ichidan, with the command くれ. Its potential, passive and causative
 * are not said, so none is given.
 */
function kureruForm(surface: string, reading: string, form: ConjugationForm): FormResult | null {
  if (form === 'imperative')
    return tail(reading) === 'る' ? swap(surface, reading, '') : null
  if (form === 'potential' || form === 'passive' || form === 'causative')
    return null
  return ichidanForm(surface, reading, form)
}

/** 信ずる: the ichidan 信じる, but ずる in the dictionary form and ずれば before ば. */
function zuruForm(surface: string, reading: string, form: ConjugationForm): FormResult | null {
  if (!reading.endsWith('ずる') || !surface.endsWith('ずる'))
    return null
  if (form === 'dictionary')
    return { surface, reading }
  if (form === 'conditional-ba')
    return swap(surface, reading, 'れば')
  // ずる → じる is one kana: る stays, ず becomes じ.
  const jiru = swap(trunk(surface), trunk(reading), 'じ')
  return ichidanForm(`${jiru.surface}る`, `${jiru.reading}る`, form)
}

function ichidanForm(surface: string, reading: string, form: ConjugationForm): FormResult | null {
  if (tail(reading) !== 'る')
    return null
  switch (form) {
    case 'dictionary': return { surface, reading }
    case 'masu': return swap(surface, reading, 'ます')
    case 'masen': return swap(surface, reading, 'ません')
    case 'mashita': return swap(surface, reading, 'ました')
    case 'masen-deshita': return swap(surface, reading, 'ませんでした')
    case 'te': return swap(surface, reading, 'て')
    case 'ta': return swap(surface, reading, 'た')
    case 'nai': return swap(surface, reading, 'ない')
    case 'nakatta': return swap(surface, reading, 'なかった')
    case 'potential': return swap(surface, reading, 'られる')
    case 'volitional': return swap(surface, reading, 'よう')
    case 'passive': return swap(surface, reading, 'られる')
    case 'causative': return swap(surface, reading, 'させる')
    case 'imperative': return swap(surface, reading, 'ろ')
    case 'conditional-ba': return swap(surface, reading, 'れば')
    case 'conditional-tara': return swap(surface, reading, 'たら')
  }
}

/**
 * The irregulars, spelled out.
 *
 * する and 来る are irregular in every slot, so a rule engine would be more
 * code than a table and wrong more often. 来る additionally changes its READING
 * while its kanji stays put — 来る/くる but 来ます/きます — which is exactly the
 * case a shared surface+reading transformation cannot express.
 */
const SURU: Record<ConjugationForm, [string, string]> = {
  'dictionary': ['する', 'する'],
  'masu': ['します', 'します'],
  'masen': ['しません', 'しません'],
  'mashita': ['しました', 'しました'],
  'masen-deshita': ['しませんでした', 'しませんでした'],
  'te': ['して', 'して'],
  'ta': ['した', 'した'],
  'nai': ['しない', 'しない'],
  'nakatta': ['しなかった', 'しなかった'],
  'potential': ['できる', 'できる'],
  'volitional': ['しよう', 'しよう'],
  'passive': ['される', 'される'],
  'causative': ['させる', 'させる'],
  'imperative': ['しろ', 'しろ'],
  'conditional-ba': ['すれば', 'すれば'],
  'conditional-tara': ['したら', 'したら']
}

const KURU: Record<ConjugationForm, [string, string]> = {
  'dictionary': ['来る', 'くる'],
  'masu': ['来ます', 'きます'],
  'masen': ['来ません', 'きません'],
  'mashita': ['来ました', 'きました'],
  'masen-deshita': ['来ませんでした', 'きませんでした'],
  'te': ['来て', 'きて'],
  'ta': ['来た', 'きた'],
  'nai': ['来ない', 'こない'],
  'nakatta': ['来なかった', 'こなかった'],
  'potential': ['来られる', 'こられる'],
  'volitional': ['来よう', 'こよう'],
  'passive': ['来られる', 'こられる'],
  'causative': ['来させる', 'こさせる'],
  'imperative': ['来い', 'こい'],
  'conditional-ba': ['来れば', 'くれば'],
  'conditional-tara': ['来たら', 'きたら']
}

/**
 * 来る keeps whatever comes before it (やって来る → やって来ます), and a くる
 * written in kana stays in kana (くる → こない). A surface and reading that do
 * not both end in it get the bare forms, as before: a prefix kept on one side
 * and not the other would misalign the furigana.
 */
function kuruForm(surface: string, reading: string, form: ConjugationForm): FormResult {
  const [s, r] = KURU[form]
  const ending = 'くる'.length
  if (!reading.endsWith('くる'))
    return { surface: s, reading: r }
  if (surface.endsWith('来る'))
    return { surface: surface.slice(0, -ending) + s, reading: reading.slice(0, -ending) + r }
  if (surface.endsWith('くる'))
    return { surface: surface.slice(0, -ending) + r, reading: reading.slice(0, -ending) + r }
  return { surface: s, reading: r }
}

/** ある is godan except in the negative, where it is ない, not あらない. */
function aruForm(surface: string, reading: string, form: ConjugationForm): FormResult | null {
  if (form === 'nai')
    return { surface: 'ない', reading: 'ない' }
  if (form === 'nakatta')
    return { surface: 'なかった', reading: 'なかった' }
  return godanForm(surface, reading, form, reading)
}

/**
 * The する verbs fused to one kanji whose negative is made on さ, as their
 * godan twin (愛す) makes it: 愛さない, not 愛しない. The rest (達する, 関する)
 * take しない like any する verb.
 */
const SA_NEGATIVE: ReadonlySet<string> = new Set(['あいする'])

/** The forms that differ from word to word among the fused する verbs. */
const SURU_SPECIAL_UNSHARED: ReadonlySet<ConjugationForm> = new Set(['potential', 'volitional', 'passive', 'causative', 'imperative'])

/**
 * 愛する, 達する, 関する: する's forms where every word of the class agrees.
 * The potential, volitional, passive, causative and command differ from word
 * to word (愛せる but 達せられる, 愛せ but 達しろ), so none is given.
 */
function suruSpecialForm(surface: string, reading: string, form: ConjugationForm): FormResult | null {
  if (!surface.endsWith('する') || !reading.endsWith('する'))
    return null
  if (SURU_SPECIAL_UNSHARED.has(form))
    return null
  // する is two kana: the stem is what comes before both.
  const stem = { surface: trunk(trunk(surface)), reading: trunk(trunk(reading)) }
  if ((form === 'nai' || form === 'nakatta') && SA_NEGATIVE.has(reading)) {
    const ending = form === 'nai' ? 'さない' : 'さなかった'
    return { surface: stem.surface + ending, reading: stem.reading + ending }
  }
  const [, r] = SURU[form]
  return { surface: stem.surface + r, reading: stem.reading + r }
}

export interface ConjugateInput {
  surface: string
  reading: string
  verbClass: VerbClass
}

/** The form a compound is built on, and what is put in place of its ending. */
const COMPOUND_BASE: Record<CompoundForm, { base: ConjugationForm, drop: string, add: string }> = {
  mashou: { base: 'masu', drop: 'ます', add: 'ましょう' },
  tai: { base: 'masu', drop: 'ます', add: 'たい' },
  naide: { base: 'nai', drop: '', add: 'で' },
  teiru: { base: 'te', drop: '', add: 'いる' }
}

function isCompound(form: VerbForm): form is CompoundForm {
  return (COMPOUND_FORMS as readonly string[]).includes(form)
}

function compound(input: ConjugateInput, form: CompoundForm): Conjugated | null {
  // ありたい and ありましょう are grammatical but nobody says them; asking
  // for them would teach a form the learner should not use.
  if (input.verbClass === 'aru' && (form === 'tai' || form === 'mashou'))
    return null
  // An honorific makes its ます forms and its command on い, so たい would come
  // out as くださいたい, which nobody says.
  if (input.verbClass === 'honorific' && form === 'tai')
    return null
  const { base, drop, add } = COMPOUND_BASE[form]
  const b = conjugate(input, base)
  if (!b || !b.surface.endsWith(drop) || !b.reading.endsWith(drop))
    return null
  const cut = (text: string) => text.slice(0, text.length - drop.length) + add
  return { form, surface: cut(b.surface), reading: cut(b.reading) }
}

export function conjugate(input: ConjugateInput, form: VerbForm): Conjugated | null {
  if (isCompound(form))
    return compound(input, form)
  const { surface, reading, verbClass } = input
  if (!surface || !reading)
    return null

  let result: FormResult | null

  switch (verbClass) {
    case 'godan':
      result = godanForm(surface, reading, form, reading)
      break
    case 'ichidan':
      result = ichidanForm(surface, reading, form)
      break
    case 'aru':
      result = aruForm(surface, reading, form)
      break
    case 'suru': {
      const [s, r] = SURU[form]
      // A compound like 勉強する keeps its noun and conjugates only the する.
      const prefixSurface = surface.replace(/する$/, '')
      const prefixReading = reading.replace(/する$/, '')
      result = { surface: prefixSurface + s, reading: prefixReading + r }
      break
    }
    case 'kuru':
      result = kuruForm(surface, reading, form)
      break
    case 'honorific':
      result = honorificForm(surface, reading, form)
      break
    case 'godan-u':
      result = godanUForm(surface, reading, form)
      break
    case 'kureru':
      result = kureruForm(surface, reading, form)
      break
    case 'suru-special':
      result = suruSpecialForm(surface, reading, form)
      break
    case 'zuru':
      result = zuruForm(surface, reading, form)
      break
    default: {
      // A class added without a case here is a compile error, not a silent null.
      const unhandled: never = verbClass
      return unhandled
    }
  }

  return result ? { form, ...result } : null
}

/** Every base form, for a conjugation table. Compound forms are asked for by name. */
export function conjugateAll(input: ConjugateInput): Conjugated[] {
  return CONJUGATION_FORMS
    .map(form => conjugate(input, form))
    .filter((c): c is Conjugated => c !== null)
}
export * from './adjective.js'
export * from './forms.js'
