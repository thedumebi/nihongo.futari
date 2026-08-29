/**
 * The house style for every generated image.
 *
 * These blocks are Dumebi's travel-poster prompt, kept as close to verbatim as
 * the change of subject allows. They are the reason the images look like one
 * family rather than a pile of stock art, so they live in ONE place and every
 * generator composes from here — never its own inline copy.
 *
 * What is deliberately CHANGED from the poster prompt, and why:
 *
 *  - No text in the artwork. The poster sets the city name INTO the image; for
 *    a flashcard that is exactly wrong. The word is rendered by the app so it
 *    stays selectable, furigana-able, and translatable.
 *  - 1:1, not 3:4. A flashcard is square.
 *  - One concrete concept, not a scene. A poster earns a composition; a
 *    vocabulary card has to read at a glance.
 *  - Culturally specific. The poster's "city identity" instinct carries over as
 *    "render a Japanese house for 家, not a generic Western default".
 */

/** Style spine. Verbatim from the ART DIRECTION block. */
export const ART_DIRECTION = [
  'Japanese stationery-inspired aesthetic',
  'luxury sticker illustration',
  'premium commercial vector artwork',
  'modern editorial branding',
  'clean delicate outlines',
  'uniform line weight',
  'simple geometric forms',
  'flat-color illustration',
  'soft shapes',
  'balanced visual rhythm',
  'high-end minimalist design'
] as const

/** Verbatim from the COLOR SYSTEM block. */
export const COLOR_SYSTEM = `Build the atmosphere primarily with:
pale powder blue, soft sky blue, mist blue, and cool airy blues.

Balance these with:
warm ivory, cream, soft beige, muted sage, gray-green, and understated neutrals.

Use dusty rose or muted blush only for tiny visual accents such as flowers, clothing details, small signs, awnings, or decorative objects.

Colors should remain soft, sophisticated, slightly desaturated, and cohesive.`

/** Verbatim from the MOOD block. */
export const MOOD = 'Fresh, airy, peaceful, refined, contemporary, elegant.'

/**
 * Verbatim from the NEGATIVE PROMPT block, minus the city-specific lines that
 * cannot apply to a flashcard, plus the rules that keep text out of the image.
 */
export const NEGATIVE_PROMPT = [
  'No photorealism.',
  'No realism.',
  'No watercolor.',
  'No painterly brushwork.',
  'No gradients.',
  'No heavy shadows.',
  'No dramatic cinematic lighting.',
  'No paper texture.',
  'No excessive detail.',
  'No cluttered background.',
  'No crowded scenes.',
  'No oversized characters.',
  'No dominant hero character.',
  'No unnecessary decorative elements.',
  // Added for flashcards: the app draws the word, not the image generator.
  'No text.',
  'No letters.',
  'No words.',
  'No Japanese characters.',
  'No kanji.',
  'No kana.',
  'No labels.',
  'No captions.',
  'No watermarks.'
] as const

/** Square. A flashcard is not a poster. */
export const ASPECT_RATIO = '1:1'
