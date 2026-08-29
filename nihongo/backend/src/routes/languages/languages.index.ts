import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './languages.handlers.js'
import * as routes from './languages.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.LANGUAGES)

router.openapi(routes.list, handlers.list)

export default router
