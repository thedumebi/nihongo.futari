import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './crossword.handlers.js'
import * as routes from './crossword.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.CROSSWORD)

router.openapi(routes.result, handlers.result)
router.openapi(routes.get, handlers.get)

export default router
