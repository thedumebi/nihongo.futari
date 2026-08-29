import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './kanji.handlers.js'
import * as routes from './kanji.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.KANJI)

router.openapi(routes.getByCharacter, handlers.getByCharacter)

export default router
