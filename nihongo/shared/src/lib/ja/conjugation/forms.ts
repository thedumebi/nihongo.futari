import type { DrillForm } from '@/types/games.js'

import type { VerbClass, VerbForm } from './index.js'

/**
 * What each verb form is, in words a learner can use: a short label, one
 * sentence on what it does, a worked example, and the grammar points that
 * teach it.
 *
 * One set, read by the conjugation drill in Study and by the Verb forms game,
 * so a form is never explained two ways. `grammar` holds slugs of
 * `grammar_points`: a form is offered in the game once the learner has learned
 * any of them, the same rule seed 050 uses to hold back a drill.
 */
interface VerbFormInfo {
  /** For a chip or a prompt: the ending, then a name. */
  label: string
  what: string
  example: string
  grammar: readonly string[]
}

export const VERB_FORM_INFO = {
  'masu': {
    label: '〜ます polite',
    what: 'The polite form: how you would say it to someone you are not close to.',
    example: 'たべる → たべます',
    grammar: ['masu']
  },
  'masen': {
    label: '〜ません polite negative',
    what: 'The polite negative: it does not or will not happen, said politely.',
    example: 'たべる → たべません',
    grammar: ['masen']
  },
  'mashita': {
    label: '〜ました polite past',
    what: 'The polite past: it already happened, said politely.',
    example: 'たべる → たべました',
    grammar: ['mashita']
  },
  'masen-deshita': {
    label: '〜ませんでした polite past negative',
    what: 'The polite past negative: it did not happen, said politely.',
    example: 'たべる → たべませんでした',
    grammar: ['masen-deshita']
  },
  'mashou': {
    label: '〜ましょう let\'s',
    what: 'Let\'s do it, or shall I: a suggestion or an offer, said politely.',
    example: 'たべる → たべましょう',
    grammar: ['mashou']
  },
  'tai': {
    label: '〜たい want to',
    what: 'Want to do it. Said about yourself; for someone else Japanese uses other forms.',
    example: 'たべる → たべたい',
    grammar: ['tai']
  },
  'te': {
    label: '〜て te-form',
    what: 'The te-form. It does not mean anything on its own; it is the joint that lets a verb connect to what follows: asking, linking, continuing.',
    example: 'たべる → たべて',
    grammar: ['te-form']
  },
  'ta': {
    label: '〜た plain past',
    what: 'The plain past: it already happened, said casually. Add です・ます register only if you need to be polite.',
    example: 'たべる → たべた',
    grammar: ['ta-form']
  },
  'nai': {
    label: '〜ない plain negative',
    what: 'The plain negative: it does not or will not happen, said casually.',
    example: 'たべる → たべない',
    grammar: ['nai']
  },
  'nakatta': {
    label: '〜なかった plain past negative',
    what: 'The plain past negative: it did not happen, said casually.',
    example: 'たべる → たべなかった',
    grammar: ['nakatta']
  },
  'naide': {
    label: '〜ないで without, don\'t',
    what: 'Without doing it, or (with ください) please don\'t: the negative, joined on like a te-form.',
    example: 'たべる → たべないで',
    grammar: ['te-negative']
  },
  'teiru': {
    label: '〜ている ongoing',
    what: 'Doing it right now, or a state that holds: the te-form plus いる.',
    example: 'たべる → たべている',
    grammar: ['teiru']
  },
  'conditional-tara': {
    label: '〜たら if, when',
    what: 'If or when it happens: the plain past plus ら.',
    example: 'たべる → たべたら',
    grammar: ['tara', 'tara-conditional']
  },
  'potential': {
    label: '〜える can',
    what: 'The potential: being able to do it.',
    example: 'たべる → たべられる',
    grammar: ['potential']
  },
  'volitional': {
    label: '〜よう let\'s (casual)',
    what: 'The volitional: let\'s do it, said casually, or what you intend to do.',
    example: 'たべる → たべよう',
    grammar: ['volitional']
  },
  'passive': {
    label: '〜られる passive',
    what: 'The passive: it is done to someone, often to their cost.',
    example: 'たべる → たべられる',
    grammar: ['passive']
  },
  'causative': {
    label: '〜させる make, let',
    what: 'The causative: making or letting someone do it.',
    example: 'たべる → たべさせる',
    grammar: ['causative']
  },
  'imperative': {
    label: '命令形 command',
    what: 'The imperative: a blunt command. Heard on signs and in sport, rarely said to a person.',
    example: 'たべる → たべろ',
    grammar: ['meirei']
  },
  'conditional-ba': {
    label: '〜ば if',
    what: 'If it happens: the condition, with the result to follow.',
    example: 'たべる → たべれば',
    grammar: ['ba-conditional']
  }
} as const satisfies Partial<Record<VerbForm, VerbFormInfo>>

/** The forms a learner can be asked for, in the order they are taught. */
export const DRILL_FORMS = Object.keys(VERB_FORM_INFO) as DrillForm[]

/** What the bare dictionary form does not show about how a verb changes. */
export const VERB_CLASS_NOTE: Partial<Record<VerbClass, string>> = {
  suru: 'This is a suru-verb: it becomes a verb by taking する, and する is the part that changes.',
  kuru: 'くる is irregular: it does not follow either regular pattern.',
  aru: 'ある is irregular in the negative.'
}
