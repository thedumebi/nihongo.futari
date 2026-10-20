import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './games.handlers.js'
import * as routes from './games.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.GAMES)

router.openapi(routes.listening, handlers.listening)
router.openapi(routes.kanjiBuild, handlers.kanjiBuild)
router.openapi(routes.ghostBoss, handlers.ghostBoss)
router.openapi(routes.verbForms, handlers.verbForms)
router.openapi(routes.particles, handlers.particles)

export default router
