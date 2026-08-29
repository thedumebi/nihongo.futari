import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './dialogues.handlers.js'
import * as routes from './dialogues.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.DIALOGUES)

// Literal path first, `/:code` last — the convention this repo keeps.
router.openapi(routes.list, handlers.list)
router.openapi(routes.getByCode, handlers.getByCode)

export default router
