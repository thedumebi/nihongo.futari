/**
 * The palette, straight from the COLOR SYSTEM block.
 *
 * Every illustration draws from these and nothing else. That constraint is what
 * makes a set of three hundred separate drawings read as one family — the
 * moment a drawing reaches for a colour outside this list, it stops belonging.
 *
 * `dustyRose` is deliberately last and deliberately alone: the direction allows
 * it "only for tiny visual accents", so it is never a fill for a main shape.
 */
export const PALETTE = {
  /** Outline colour. One weight, one colour, every drawing. */
  ink: '#2F4858',

  // Primary atmosphere — the cool airy blues.
  powderBlue: '#C7DAE8',
  skyBlue: '#A9C6DC',
  mistBlue: '#DCE6EC',
  deepBlue: '#7FA5C0',

  // The warm balance.
  ivory: '#FBFAF7',
  cream: '#F2EBDD',
  beige: '#E3D8C6',

  // Greens.
  sage: '#B7C5AE',
  grayGreen: '#8FA394',

  // Understated neutrals.
  neutral: '#CFD6D9',
  shadowNeutral: '#B3BEC4',

  /** Accent ONLY. Never a main fill. */
  dustyRose: '#D8A7A0'
} as const

export type PaletteColor = keyof typeof PALETTE

/** One line weight everywhere, per "uniform line weight". */
export const STROKE_WIDTH = 2.5

/** Every illustration is drawn in this box and scaled by the page. */
export const VIEW_BOX = 120
