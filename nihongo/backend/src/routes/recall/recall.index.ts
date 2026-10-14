import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './recall.handlers.js'
import * as routes from './recall.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.RECALL)

router.openapi(routes.get, handlers.get)

export default router
