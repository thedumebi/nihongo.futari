import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './words.handlers.js'
import * as routes from './words.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.WORDS)

router.openapi(routes.getById, handlers.getById)

export default router
