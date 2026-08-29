import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './review-queue.handlers.js'
import * as routes from './review-queue.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.REVIEW_QUEUE)

// Literal /bulk/* paths BEFORE the /:id/* ones, or /bulk is read as an id.
router.openapi(routes.list, handlers.list)
router.openapi(routes.bulkApprove, handlers.bulkApprove)
router.openapi(routes.bulkReject, handlers.bulkReject)
router.openapi(routes.approve, handlers.approve)
router.openapi(routes.reject, handlers.reject)

export default router
