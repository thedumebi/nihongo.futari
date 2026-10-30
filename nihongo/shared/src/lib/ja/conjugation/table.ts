import type { ConjugationGridRow, ConjugationOther, ConjugationTable, ConjugationText, ConjugationWord } from '@/types/conjugation.js'

import type { AdjectiveForm, AdjectiveKind } from './adjective.js'
import type { VerbForm } from './index.js'

import { adjectiveKind, conjugateAdjective } from './adjective.js'
import { VERB_FORM_INFO } from './forms.js'
import { classifyVerb, conjugate, conjugatesReliably } from './index.js'

/**
 * How a dictionary word changes: a polite/plain grid of present, negative,
 * past and past negative, then the other forms, each named and explained.
 *
 * Takes every sense's part of speech together, so a word whose verb sense is
 * second still gets its table, and returns one table per thing the word can
 * be: 心配 is a noun, a な-adjective and, with する, a verb.
 *
 * A verb `conjugate` would get wrong (くださる, 問う) gets no table at all.
 * A confidently wrong form is worse than none.
 */

/** Polite and plain, for each tense. */
interface GridEntry<F> {
  tense: 'Present' | 'Negative' | 'Past' | 'Past negative'
  polite: F
  plain: F
}

const VERB_GRID: ReadonlyArray<GridEntry<VerbForm>> = [
  { tense: 'Present', polite: 'masu', plain: 'dictionary' },
  { tense: 'Negative', polite: 'masen', plain: 'nai' },
  { tense: 'Past', polite: 'mashita', plain: 'ta' },
  { tense: 'Past negative', polite: 'masen-deshita', plain: 'nakatta' }
]

const VERB_OTHERS = [
  'te',
  'teiru',
  'tai',
  'mashou',
  'volitional',
  'potential',
  'passive',
  'causative',
  'imperative',
  'conditional-ba',
  'conditional-tara',
  'naide'
] as const satisfies ReadonlyArray<keyof typeof VERB_FORM_INFO>

const ADJECTIVE_GRID: ReadonlyArray<GridEntry<AdjectiveForm>> = [
  { tense: 'Present', polite: 'polite-present', plain: 'present' },
  { tense: 'Negative', polite: 'polite-negative', plain: 'negative' },
  { tense: 'Past', polite: 'polite-past', plain: 'past' },
  { tense: 'Past negative', polite: 'polite-past-negative', plain: 'past-negative' }
]

/**
 * The forms outside the grid, with a label for each kind of adjective that has
 * the form. い-adjectives have no separate form before a noun, so no label.
 */
const ADJECTIVE_OTHERS: ReadonlyArray<{ form: AdjectiveForm, iLabel?: string, naLabel: string, what: string }> = [
  { form: 'attributive', naLabel: '〜な before a noun', what: 'Before a noun a な-adjective takes な: 静かな部屋, a quiet room.' },
  { form: 'te', iLabel: '〜くて te-form', naLabel: '〜で te-form', what: 'Joins it to what follows: cheap and good, quiet and clean.' },
  { form: 'adverb', iLabel: '〜く adverb', naLabel: '〜に adverb', what: 'Says how something is done: early, quietly.' },
  { form: 'conditional-ba', iLabel: '〜ければ if', naLabel: '〜なら if', what: 'If it is so, with what follows from it.' },
  { form: 'conditional-tara', iLabel: '〜かったら if, when', naLabel: '〜だったら if, when', what: 'If or when it is so.' }
]

function grid<F>(entries: ReadonlyArray<GridEntry<F>>, make: (form: F) => ConjugationText | null): ConjugationGridRow[] {
  return entries.map(e => ({ tense: e.tense, polite: make(e.polite), plain: make(e.plain) }))
}

function verbTable(word: ConjugationWord, pos: readonly string[]): ConjugationTable | null {
  const verbClass = classifyVerb(pos)
  if (!verbClass || !conjugatesReliably(pos))
    return null
  // する written 為る is left alone: the engine only takes the kana spelling.
  if (verbClass === 'suru' && word.form.endsWith('為る'))
    return null
  // A noun that is a verb with する (勉強) conjugates as 勉強する.
  const withSuru = verbClass === 'suru' && !word.form.endsWith('する')
  const input = {
    surface: withSuru ? `${word.form}する` : word.form,
    reading: withSuru ? `${word.reading}する` : word.reading,
    verbClass
  }
  const make = (form: VerbForm): ConjugationText | null => {
    const done = conjugate(input, form)
    return done ? { surface: done.surface, reading: done.reading } : null
  }
  const rows = grid(VERB_GRID, make)
  if (rows.every(row => !row.polite && !row.plain))
    return null
  const others: ConjugationOther[] = []
  for (const form of VERB_OTHERS) {
    const done = make(form)
    if (done)
      others.push({ ...done, label: VERB_FORM_INFO[form].label, what: VERB_FORM_INFO[form].what })
  }
  return {
    kind: 'verb',
    note: withSuru ? `Used as a verb with する: ${word.form}する.` : null,
    grid: rows,
    others
  }
}

function adjectiveTable(word: ConjugationWord, kind: AdjectiveKind): ConjugationTable | null {
  const input = { surface: word.form, reading: word.reading, kind }
  const rows = grid(ADJECTIVE_GRID, form => conjugateAdjective(input, form))
  if (rows.every(row => !row.polite && !row.plain))
    return null
  const na = kind === 'na'
  const others: ConjugationOther[] = []
  for (const other of ADJECTIVE_OTHERS) {
    const label = na ? other.naLabel : other.iLabel
    const done = label ? conjugateAdjective(input, other.form) : null
    if (label && done)
      others.push({ ...done, label, what: other.what })
  }
  return {
    kind: na ? 'na-adjective' : 'i-adjective',
    note: kind === 'ix' ? 'いい changes on よい: よくない, よかった.' : null,
    grid: rows,
    others
  }
}

export function conjugationTables(word: ConjugationWord): ConjugationTable[] {
  const pos = [...new Set(word.pos.flat())]
  const tables: ConjugationTable[] = []
  const verb = verbTable(word, pos)
  if (verb)
    tables.push(verb)
  const adjective = adjectiveKind(pos)
  const adj = adjective ? adjectiveTable(word, adjective) : null
  if (adj)
    tables.push(adj)
  return tables
}
