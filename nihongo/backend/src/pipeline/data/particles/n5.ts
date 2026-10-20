import type { AuthoredParticleSet } from './types.js'

import { N5_G1 } from './n5-g1.js'
import { N5_G2 } from './n5-g2.js'
import { N5_G3 } from './n5-g3.js'
import { N5_G4 } from './n5-g4.js'

/**
 * N5 particle lessons, in four files so they can be drafted side by side.
 * Checked by check:particles; seeded by seed:particles.
 */
export const N5_PARTICLES: AuthoredParticleSet[] = [...N5_G1, ...N5_G2, ...N5_G3, ...N5_G4]
