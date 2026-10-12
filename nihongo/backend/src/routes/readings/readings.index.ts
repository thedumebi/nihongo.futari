import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './readings.handlers.js'
import * as routes from './readings.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.READINGS)

// Literal path first, `/:code` last.
router.openapi(routes.list, handlers.list)
router.openapi(routes.getByCode, handlers.getByCode)

export default router
