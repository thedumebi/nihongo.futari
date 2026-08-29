import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './grammar.handlers.js'
import * as routes from './grammar.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.GRAMMAR)

// Literal `/` before the `/:slug` catch-all.
router.openapi(routes.list, handlers.list)
router.openapi(routes.getBySlug, handlers.getBySlug)

export default router
