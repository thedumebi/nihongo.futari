import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './phonetics.handlers.js'
import * as routes from './phonetics.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.PHONETICS)

// Literal `/` before the `/:component` catch-all.
router.openapi(routes.list, handlers.list)
router.openapi(routes.getByComponent, handlers.getByComponent)

export default router
