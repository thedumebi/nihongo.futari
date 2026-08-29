import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './writing.handlers.js'
import * as routes from './writing.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.WRITING)

// Literal `/queue` before the `/:character` catch-all.
router.openapi(routes.queue, handlers.queue)
router.openapi(routes.getByCharacter, handlers.getByCharacter)

export default router
