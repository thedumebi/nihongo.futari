import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './friends.handlers.js'
import * as routes from './friends.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.FRIENDS)

// Literal paths before /:id.
router.openapi(routes.list, handlers.list)
router.openapi(routes.updateSettings, handlers.updateSettings)
router.openapi(routes.rotateCode, handlers.rotateCode)
router.openapi(routes.add, handlers.add)
router.openapi(routes.accept, handlers.accept)
router.openapi(routes.remove, handlers.remove)

export default router
