import { ART_DIRECTION, ASPECT_RATIO, COLOR_SYSTEM, MOOD, NEGATIVE_PROMPT } from './art-direction.js'

/**
 * Compose image prompts from the one house style.
 *
 * Two subjects, one look: a vocabulary card shows a single concrete thing, a
 * grammar card shows a small situational scene. Everything below the SUBJECT
 * block is identical between them, which is what makes the set cohere.
 *
 * NOTE — nothing calls these yet, and no image API is configured. Every
 * illustration in the app so far was hand-authored as SVG against
 * `art-direction.ts` and `palette.ts` directly. This file exists for the day a
 * generator is wired up; do not read it as evidence that one already is. The
 * process that actually produces artwork is documented in
 * `.claude/rules/media.md`.
 */

export interface VocabImageSubject {
  /** The Japanese word, for the generator's understanding only — never drawn. */
  word: string
  /** English gloss: the thing to depict. */
  gloss: string
  /** Extra grounding, e.g. "a Japanese-style house, not a Western one". */
  note?: string
}

export interface GrammarImageSubject {
  /** What the pattern does, in plain English. */
  meaning: string
  /** The situation that shows it, e.g. "someone offering a seat on a train". */
  situation: string
}

/**
 * A prompt split the way image APIs actually take it.
 *
 * Providers differ: FLUX and Stable Diffusion take a real `negative_prompt`
 * field, where exclusions carry far more weight than the same words buried in
 * the positive text. OpenAI's image models have no such field and need
 * everything inline. Returning both means the house style is expressed once and
 * each provider is fed the shape it actually honours.
 */
export interface ImagePrompt {
  prompt: string
  negativePrompt: string
  aspectRatio: string
  /** Positive and negative concatenated, for providers with no negative field. */
  combined: string
}

function frame(subject: string, extra: string[] = []): ImagePrompt {
  const positive = [
    `Premium minimalist flat-vector illustration, ${ASPECT_RATIO} square format.`,
    '',
    'SUBJECT',
    '',
    subject,
    ...extra,
    '',
    'COMPOSITION',
    '',
    'Centre the subject with generous breathing room. Keep the background plain'
    + ' or near-plain — a single soft ground tone, no scenery competing for'
    + ' attention. The image must read instantly at thumbnail size.',
    '',
    'ART DIRECTION',
    '',
    `${ART_DIRECTION.join(',\n')}.`,
    '',
    'COLOR SYSTEM',
    '',
    COLOR_SYSTEM,
    '',
    'MOOD',
    '',
    MOOD,
    '',
    'IMPORTANT',
    '',
    'The artwork must contain NO text of any kind. The word is displayed by the'
    + ' app beside the image, so any lettering in the artwork is a defect.'
  ].join('\n')

  const negative = NEGATIVE_PROMPT.join('\n')

  return {
    prompt: positive,
    negativePrompt: negative,
    aspectRatio: ASPECT_RATIO,
    combined: `${positive}\n\nNEGATIVE PROMPT\n\n${negative}`
  }
}

/**
 * A vocabulary card: one concrete thing, culturally specific.
 *
 * The cultural note matters more than it looks. 家 rendered as a suburban
 * American house teaches the wrong thing about the word, and a generator with
 * no instruction will default to exactly that.
 */
export function buildVocabImagePrompt(subject: VocabImageSubject): ImagePrompt {
  return frame(
    `A single ${subject.gloss}. One object, one concept, nothing else in the frame.`,
    [
      '',
      'Render it as it would appear in Japan — Japanese architecture, packaging,'
      + ' signage shapes, plants and everyday objects rather than a generic'
      + ' Western default.',
      ...(subject.note ? ['', subject.note] : [])
    ]
  )
}

/** A grammar card: the smallest scene that shows the pattern in use. */
export function buildGrammarImagePrompt(subject: GrammarImageSubject): ImagePrompt {
  return frame(
    `A small, quiet everyday scene showing ${subject.situation}.`,
    [
      '',
      `The scene should make "${subject.meaning}" understandable without words.`,
      '',
      'At most two small-scale figures, integrated naturally. No single person'
      + ' dominates. Keep the setting recognisably Japanese.'
    ]
  )
}
