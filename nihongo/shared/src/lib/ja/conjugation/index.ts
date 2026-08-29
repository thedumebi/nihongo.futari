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

export const VERB_CLASSES = ['godan', 'ichidan', 'suru', 'kuru', 'aru'] as const
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

export interface Conjugated {
  form: ConjugationForm
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
  if (pos.some(p => p === 'vs' || p === 'vs-i' || p === 'vs-s'))
    return 'suru'
  if (pos.includes('vk'))
    return 'kuru'
  if (pos.includes('v5r-i'))
    return 'aru'
  if (pos.includes('v5k-s'))
    return 'godan' // 行く: godan, with one te-form exception
  if (pos.includes('v1') || pos.some(p => p.startsWith('v1-')))
    return 'ichidan'
  if (pos.some(p => /^v5[a-z]/.test(p)))
    return 'godan'
  return null
}

export function isIAdjective(pos: readonly string[]): boolean {
  return pos.includes('adj-i')
}

export function isNaAdjective(pos: readonly string[]): boolean {
  return pos.includes('adj-na')
}

/** Godan stem vowel shifts, keyed by the dictionary-form final kana. */
const GODAN_ROWS: Record<string, { i: string, a: string, e: string, o: string }> = {
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

function tail(text: string): string {
  return text.slice(-1)
}

function trunk(text: string): string {
  return text.slice(0, -1)
}

/** Apply the same ending swap to both the written form and its reading. */
function swap(surface: string, reading: string, ending: string): { surface: string, reading: string } {
  return { surface: trunk(surface) + ending, reading: trunk(reading) + ending }
}

function godanForm(surface: string, reading: string, form: ConjugationForm, dictionary: string): { surface: string, reading: string } | null {
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

function ichidanForm(surface: string, reading: string, form: ConjugationForm): { surface: string, reading: string } | null {
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

/** ある is godan except in the negative, where it is ない, not あらない. */
function aruForm(surface: string, reading: string, form: ConjugationForm): { surface: string, reading: string } | null {
  if (form === 'nai')
    return { surface: 'ない', reading: 'ない' }
  if (form === 'nakatta')
    return { surface: 'なかった', reading: 'なかった' }
  return godanForm(surface, reading, form, reading)
}

export interface ConjugateInput {
  surface: string
  reading: string
  verbClass: VerbClass
}

export function conjugate(input: ConjugateInput, form: ConjugationForm): Conjugated | null {
  const { surface, reading, verbClass } = input
  if (!surface || !reading)
    return null

  let result: { surface: string, reading: string } | null = null

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
    case 'kuru': {
      const [s, r] = KURU[form]
      result = { surface: s, reading: r }
      break
    }
  }

  return result ? { form, ...result } : null
}

/** Every form, for a conjugation table. */
export function conjugateAll(input: ConjugateInput): Conjugated[] {
  return CONJUGATION_FORMS
    .map(form => conjugate(input, form))
    .filter((c): c is Conjugated => c !== null)
}
