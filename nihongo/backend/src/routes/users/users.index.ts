import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './users.handlers.js'
import * as routes from './users.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.USERS)

router.openapi(routes.settings, handlers.settings)
router.openapi(routes.updateSettings, handlers.updateSettings)

export default router
