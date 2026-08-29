import { auth } from '@/lib/auth.js'
import { createRouter } from '@/lib/create-app.js'

const router = createRouter()

// better-auth's default basePath is /api/auth. The frontend reaches this
// same-origin: nginx (prod) and the Vite dev server both forward /api/auth/*
// to the backend with the prefix intact, so the path matches here directly.
router.on(['POST', 'GET'], '/api/auth/*', c => auth.handler(c.req.raw))

export default router
