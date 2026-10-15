import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './unsubscribe.handlers.js'
import * as routes from './unsubscribe.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.UNSUBSCRIBE)

router.openapi(routes.productUpdates, handlers.productUpdates)

export default router
