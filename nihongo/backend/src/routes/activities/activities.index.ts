import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './activities.handlers.js'
import * as routes from './activities.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.ACTIVITIES)

router.openapi(routes.record, handlers.record)

export default router
