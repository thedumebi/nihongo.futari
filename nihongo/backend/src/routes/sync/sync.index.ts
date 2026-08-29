import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './sync.handlers.js'
import * as routes from './sync.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.SYNC)

router.openapi(routes.mutations, handlers.mutations)

export default router
