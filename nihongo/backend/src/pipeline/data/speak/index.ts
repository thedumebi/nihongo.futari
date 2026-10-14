import type { AuthoredSpeakSession } from './types.js'

import { N4 } from './n4.js'
import { N5_MORE } from './n5-more.js'
import { N5_STORIES } from './n5-stories.js'
import { N5_THIRD } from './n5-third.js'
import { N5 } from './n5.js'

/** Every Speak session, in course order. */
export const SPEAK: AuthoredSpeakSession[] = [...N5, ...N5_MORE, ...N5_THIRD, ...N4, ...N5_STORIES]
