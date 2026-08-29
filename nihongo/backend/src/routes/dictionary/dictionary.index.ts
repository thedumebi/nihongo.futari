import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './dictionary.handlers.js'
import * as routes from './dictionary.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.DICTIONARY)

router.openapi(routes.searchRoute, handlers.searchHandler)

export default router
