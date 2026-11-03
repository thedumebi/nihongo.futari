import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './mnemonics.handlers.js'
import * as routes from './mnemonics.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.MNEMONICS)

// All literal prefixes (`/`, `/kanji/`, `/words/`): no catch-all to order around.
router.openapi(routes.create, handlers.create)
router.openapi(routes.forKanji, handlers.forKanji)
router.openapi(routes.forWord, handlers.forWord)

export default router
