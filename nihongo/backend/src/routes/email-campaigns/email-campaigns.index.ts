import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './email-campaigns.handlers.js'
import * as routes from './email-campaigns.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.EMAIL_CAMPAIGNS)

// Literal paths before /:id.
router.openapi(routes.preview, handlers.preview)
router.openapi(routes.list, handlers.list)
router.openapi(routes.create, handlers.create)
router.openapi(routes.test, handlers.test)
router.openapi(routes.send, handlers.send)
router.openapi(routes.get, handlers.get)
router.openapi(routes.update, handlers.update)
router.openapi(routes.remove, handlers.remove)

export default router
