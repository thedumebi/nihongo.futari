import { AUTH_ROUTES } from '@nihongo/shared/constants'

import { auth } from '@/lib/auth.js'
import { createRouter } from '@/lib/create-app.js'
import { emailSendGuard } from '@/middlewares/email-send-guard.js'

const router = createRouter()

// better-auth's default basePath is /api/auth. The frontend reaches this
// same-origin: nginx (prod) and the Vite dev server both forward /api/auth/*
// to the backend with the prefix intact, so the path matches here directly.
//
// Anything that sends an email passes the guard first (Turnstile + caps); it
// lets every other request straight through.
router.use(`${AUTH_ROUTES.HANDLER}/*`, emailSendGuard)
router.on(['POST', 'GET'], `${AUTH_ROUTES.HANDLER}/*`, c => auth.handler(c.req.raw))

export default router
