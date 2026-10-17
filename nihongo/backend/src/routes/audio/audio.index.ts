import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './audio.handlers.js'
import * as routes from './audio.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.AUDIO)

router.openapi(routes.status, handlers.status)

export default router
