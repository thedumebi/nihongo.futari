import type { Dialogue } from './types.js'

import { CHECKOUT } from './checkout.js'
import { COOKING } from './cooking.js'
import { COUNTERS } from './counters.js'
import { DAILY } from './daily.js'
import { DINING } from './dining.js'
import { ERRANDS } from './errands.js'
import { HEALTH } from './health.js'
import { HOME } from './home.js'
import { HOME2 } from './home2.js'
import { LIFE } from './life.js'
import { MORE } from './more.js'
import { ORIGINAL } from './original.js'
import { OUT } from './out.js'
import { PEOPLE } from './people.js'

/**
 * Every conversation, in the order they are introduced.
 *
 * `import-dialogues.ts` uses the array position as `sort_index`, and
 * `build:curriculum` then places them within the level — so the order here is
 * a rough teaching sequence, not the final one.
 */
export const DIALOGUES: Dialogue[] = [
  ...ORIGINAL,
  ...HOME,
  ...HOME2,
  ...COOKING,
  ...OUT,
  ...PEOPLE,
  ...HEALTH,
  ...MORE,
  ...DAILY,
  ...ERRANDS,
  ...LIFE,
  // Added last, so they land late in the sequence: these walk a whole
  // transaction end to end rather than drilling one exchange, which only pays
  // off once the pieces are individually familiar.
  ...CHECKOUT,
  ...DINING,
  ...COUNTERS
]
