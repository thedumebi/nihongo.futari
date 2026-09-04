import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './lessons.handlers.js'
import * as routes from './lessons.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.LESSONS)

// The literal path first, so `/:slug` cannot swallow it.
router.openapi(routes.list, handlers.list)
router.openapi(routes.complete, handlers.complete)
router.openapi(routes.get, handlers.get)

export default router
