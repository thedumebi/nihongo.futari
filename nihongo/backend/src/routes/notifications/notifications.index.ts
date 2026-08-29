import { ROUTE_BASE_PATHS } from '@nihongo/shared/constants'

import { createRouter } from '@/lib/create-app.js'

import * as handlers from './notifications.handlers.js'
import * as routes from './notifications.routes.js'

const router = createRouter().basePath(ROUTE_BASE_PATHS.NOTIFICATIONS)

router.openapi(routes.vapidKey, handlers.vapidKey)
router.openapi(routes.subscribe, handlers.subscribe)
router.openapi(routes.preferences, handlers.preferences)
router.openapi(routes.updatePreferences, handlers.updatePreferences)
router.openapi(routes.setTimezone, handlers.setTimezone)
router.openapi(routes.runReminders, handlers.runReminders)

export default router
