import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './progress.handlers.js'
import * as routes from './progress.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.PROGRESS)

router.openapi(routes.summary, handlers.summary)

router.openapi(routes.knownKanji, handlers.knownKanji)

router.openapi(routes.readiness, handlers.readiness)

export default router
