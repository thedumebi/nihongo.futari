import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './invites.handlers.js'
import * as routes from './invites.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.INVITES)

// Literal paths first; `/:id/revoke` is registered last.
router.openapi(routes.signupMode, handlers.signupMode)
router.openapi(routes.reserve, handlers.reserve)
router.openapi(routes.list, handlers.list)
router.openapi(routes.create, handlers.create)
router.openapi(routes.revoke, handlers.revoke)

export default router
