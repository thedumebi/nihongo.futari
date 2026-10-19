import type { DrillForm, VerbFormsGameVerb, VerbFormsRound } from '@/types/games.js'

import type { ConjugateInput, VerbForm } from '../ja/conjugation/index.js'

import { conjugate, DRILL_FORMS, GODAN_ROWS } from '../ja/conjugation/index.js'
import { spellingsOf } from '../ja/spelling/index.js'

/**
 * Verb forms: a verb you know, a form to put it in, four answers to pick from.
 *
 * The wrong answers are the mistakes a learner actually makes, so picking the
 * right one means knowing the rule rather than spotting the odd one out:
 * conjugating a verb as the other group (帰る as 帰て), the wrong sound change
 * before て (書って), the wrong vowel before ます or ない (書かます), and, last,
 * another real form of the same verb (書いた when て was asked).
 *
 * Everything is worked out from the kana reading, which is also what the
 * buttons show: the kanji would be the same on every button.
 */

/** Forms whose ending starts with the te-form's sound change. */
const TE_FAMILY: ReadonlySet<VerbForm> = new Set(['te', 'ta', 'conditional-tara', 'teiru'])
const TE_SOUNDS = ['って', 'いて', 'んで', 'して', 'いで']
const TA_SOUNDS = ['った', 'いた', 'んだ', 'した', 'いだ']

/** The forms most easily confused with each, for the last wrong answers. */
const NEIGHBOURS: Record<DrillForm, DrillForm[]> = {
  'masu': ['masen', 'mashita', 'tai'],
  'masen': ['masu', 'masen-deshita', 'nai'],
  'mashita': ['masu', 'ta', 'masen-deshita'],
  'masen-deshita': ['masen', 'mashita', 'nakatta'],
  'mashou': ['masu', 'volitional', 'tai'],
  'tai': ['masu', 'mashou', 'te'],
  'te': ['ta', 'teiru', 'conditional-tara'],
  'ta': ['te', 'mashita', 'conditional-tara'],
  'nai': ['nakatta', 'naide', 'masen'],
  'nakatta': ['nai', 'ta', 'masen-deshita'],
  'naide': ['nai', 'te', 'nakatta'],
  'teiru': ['te', 'ta', 'masu'],
  'conditional-tara': ['ta', 'conditional-ba', 'te'],
  'potential': ['passive', 'causative', 'conditional-ba'],
  'volitional': ['mashou', 'imperative', 'potential'],
  'passive': ['potential', 'causative', 'masu'],
  'causative': ['passive', 'potential', 'nai'],
  'imperative': ['volitional', 'conditional-ba', 'te'],
  'conditional-ba': ['conditional-tara', 'potential', 'imperative']
}

function kanaOf(verb: Pick<VerbFormsGameVerb, 'reading' | 'verbClass'>): ConjugateInput {
  return { surface: verb.reading, reading: verb.reading, verbClass: verb.verbClass }
}

/** The same form, made as if the verb were in another group. */
function wrongGroup(input: ConjugateInput, form: DrillForm): string[] {
  const others: Array<ConjugateInput['verbClass']> = {
    godan: ['ichidan'],
    ichidan: ['godan'],
    kuru: ['ichidan', 'godan'],
    suru: ['godan'],
    aru: ['godan']
  }[input.verbClass] as Array<ConjugateInput['verbClass']>
  return others
    .map(verbClass => conjugate({ ...input, verbClass }, form)?.reading)
    .filter((r): r is string => Boolean(r))
}

/** A godan verb with another of the sound changes before て or た. */
function wrongSound(input: ConjugateInput, form: DrillForm, correct: string): string[] {
  if (!TE_FAMILY.has(form) || (input.verbClass !== 'godan' && input.verbClass !== 'aru'))
    return []
  const stem = input.reading.slice(0, -1)
  if (!correct.startsWith(stem))
    return []
  const sounds = form === 'te' || form === 'teiru' ? TE_SOUNDS : TA_SOUNDS
  const rest = correct.slice(stem.length + 2)
  return sounds.map(s => stem + s + rest)
}

/** A godan verb with the wrong vowel where the ending joins on: 書かます, 書きない. */
function wrongRow(input: ConjugateInput, form: DrillForm, correct: string): string[] {
  if (TE_FAMILY.has(form) || (input.verbClass !== 'godan' && input.verbClass !== 'aru'))
    return []
  const last = input.reading.slice(-1)
  const row = GODAN_ROWS[last]
  const at = input.reading.length - 1
  // ある's negative is ない: no stem to put the wrong vowel on.
  if (!row || correct.length <= at || !correct.startsWith(input.reading.slice(0, at)))
    return []
  return [row.a, row.i, row.e, row.o, last].map(k => correct.slice(0, at) + k + correct.slice(at + 1))
}

/** The forms most like this one, then every other, for a verb where they coincide (食べられる). */
function neighbours(input: ConjugateInput, form: DrillForm): string[] {
  return [...NEIGHBOURS[form], ...DRILL_FORMS]
    .map(f => conjugate(input, f)?.reading)
    .filter((r): r is string => Boolean(r))
}

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!]
  }
  return out
}

/**
 * Three wrong answers for a verb in a form, most telling first: one from each
 * kind of mistake in turn, then other forms of the verb to fill.
 */
export function verbFormDistractors(verb: Pick<VerbFormsGameVerb, 'reading' | 'verbClass'>, form: DrillForm, count = 3): string[] {
  const input = kanaOf(verb)
  const correct = conjugate(input, form)?.reading
  if (!correct)
    return []
  const mistakes = [wrongGroup(input, form), wrongSound(input, form, correct), wrongRow(input, form, correct)]
  const out: string[] = []
  const add = (r: string | undefined) => {
    if (r && r !== correct && r !== input.reading && !out.includes(r) && out.length < count)
      out.push(r)
  }
  for (let i = 0; mistakes.some(m => i < m.length); i++) {
    for (const m of mistakes)
      add(m[i])
  }
  // At most two made-up forms: the third answer is a real form of the verb,
  // so the choice is between what each form looks like, not real versus fake.
  out.splice(2)
  for (const r of neighbours(input, form))
    add(r)
  return out
}

/** How this verb makes this form, in one line: "Godan verb: く becomes いて". */
export function verbFormRule(verb: Pick<VerbFormsGameVerb, 'reading' | 'verbClass'>, form: DrillForm): string {
  const input = kanaOf(verb)
  const answer = conjugate(input, form)?.reading
  if (!answer)
    return ''
  const d = input.reading
  switch (input.verbClass) {
    case 'ichidan':
      return `Ichidan verb: drop る, add ${answer.slice(d.length - 1)}.`
    case 'suru':
      return `する verb: する becomes ${answer.slice(d.length - 2)}.`
    case 'kuru':
      return `くる is irregular: くる becomes ${answer}.`
    case 'aru':
      if (form === 'nai' || form === 'nakatta' || form === 'naide')
        return `ある is irregular in the negative: ある becomes ${answer}, never あら〜.`
      break
    case 'godan':
      break
  }
  const rule = `Godan verb: ${d.slice(-1)} becomes ${answer.slice(d.length - 1)}.`
  if (d.endsWith('いく') && TE_FAMILY.has(form))
    return `${rule} 行く is the one exception: って, not いて.`
  return rule
}

/** Everything a typed answer may be: the spelling, the kana, and the dictionary's other spellings. */
export function verbFormAccepted(verb: VerbFormsGameVerb, answer: { surface: string, reading: string }): string[] {
  return [...new Set([answer.surface, answer.reading, ...spellingsOf(answer.reading, verb.spellings)])]
}

/**
 * A game's questions: the chosen forms taken in turn, so a mixed game asks each
 * about as often, each on a verb that can take it, never the same verb twice
 * running. Known verbs come first; the level's are only a top-up.
 */
export function buildVerbFormRounds(
  verbs: readonly VerbFormsGameVerb[],
  forms: readonly DrillForm[],
  size: number,
  random: () => number = Math.random
): VerbFormsRound[] {
  if (!verbs.length || !forms.length)
    return []
  const pool = [
    ...shuffled(verbs.filter(v => v.known), random),
    ...shuffled(verbs.filter(v => !v.known), random)
  ]
  const used = new Map<string, number>()
  const rounds: VerbFormsRound[] = []
  let order: DrillForm[] = []
  let previous = ''
  for (let tries = 0; rounds.length < size && tries < size * 4; tries++) {
    if (!order.length)
      order = shuffled(forms, random)
    const form = order.shift()!
    // The least used verb that can take this form and was not just asked.
    const verb = pool
      .filter(v => v.wordId !== previous && conjugate(v, form))
      .sort((a, b) => (used.get(a.wordId) ?? 0) - (used.get(b.wordId) ?? 0))[0]
    if (!verb)
      continue
    const answer = conjugate(verb, form)!
    used.set(verb.wordId, (used.get(verb.wordId) ?? 0) + 1)
    previous = verb.wordId
    rounds.push({
      verb,
      form,
      answer,
      options: shuffled([answer.reading, ...verbFormDistractors(verb, form)], random),
      accepted: verbFormAccepted(verb, answer),
      rule: verbFormRule(verb, form)
    })
  }
  return rounds
}
