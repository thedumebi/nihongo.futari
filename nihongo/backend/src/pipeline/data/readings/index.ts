import type { AuthoredReading } from './types.js'

import { N1 } from './n1.js'
import { N2 } from './n2.js'
import { N3 } from './n3.js'
import { N4 } from './n4.js'
import { N5_MORE } from './n5-more.js'
import { N5 } from './n5.js'

/** Every authored speech, easiest level first. */
export const READINGS: AuthoredReading[] = [...N5, ...N5_MORE, ...N4, ...N3, ...N2, ...N1]
