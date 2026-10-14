import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './today.handlers.js'
import * as routes from './today.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.TODAY)

router.openapi(routes.get, handlers.get)

export default router
