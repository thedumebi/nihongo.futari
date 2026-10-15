import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './onboarding.handlers.js'
import * as routes from './onboarding.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.ONBOARDING)

// Literal paths before the base one.
router.openapi(routes.skip, handlers.skip)
router.openapi(routes.dismissGuide, handlers.dismissGuide)
router.openapi(routes.placement, handlers.placement)
router.openapi(routes.get, handlers.get)
router.openapi(routes.submit, handlers.submit)

export default router
