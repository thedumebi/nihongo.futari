import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './speak.handlers.js'
import * as routes from './speak.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.SPEAK)

// Literal paths first; `/:code/complete` before `/:code`.
router.openapi(routes.list, handlers.list)
router.openapi(routes.complete, handlers.complete)
router.openapi(routes.getByCode, handlers.getByCode)

export default router
