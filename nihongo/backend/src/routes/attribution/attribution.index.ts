import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './attribution.handlers.js'
import * as routes from './attribution.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.ATTRIBUTION)

router.openapi(routes.list, handlers.list)

export default router
