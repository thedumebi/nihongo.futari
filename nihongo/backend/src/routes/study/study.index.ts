import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './study.handlers.js'
import * as routes from './study.routes.js'

// Per-route auth/rate-limit middleware is declared in the route configs
// (routes.<name>.middleware) and applied by `router.openapi`.
const router = createRouter().basePath(ROUTE_BASE_PATHS.STUDY)

// Literal paths only in this domain, so ordering is not load-bearing yet.
// Keep any future `/:id` route registered LAST.
router.openapi(routes.decks, handlers.decks)
router.openapi(routes.queue, handlers.queue)
router.openapi(routes.due, handlers.due)
router.openapi(routes.course, handlers.course)
router.openapi(routes.answer, handlers.answer)
router.openapi(routes.lessonSeen, handlers.lessonSeen)

export default router
