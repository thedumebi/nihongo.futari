import type { AuthoredParticleSet } from './types.js'

import { N5_PARTICLES } from './n5.js'

/** Every authored Particles set, in the order the review queue lists them. */
export const PARTICLE_SETS: AuthoredParticleSet[] = [...N5_PARTICLES]
