import env from '@nihongo/shared/env'
import { hooks } from '@nihongo/shared/middlewares'
import { cors } from 'hono/cors'

import configureOpenAPI from './lib/configure-open-api.js'
import createApp from './lib/create-app.js'
import { standardLimiter } from './middlewares/rate-limit.js'
import attribution from './routes/attribution/attribution.index.js'
import auth from './routes/auth.js'
import dialogues from './routes/dialogues/dialogues.index.js'
import dictionary from './routes/dictionary/dictionary.index.js'
import grammar from './routes/grammar/grammar.index.js'
import index from './routes/index/index.route.js'
import invites from './routes/invites/invites.index.js'
import kanjiRoutes from './routes/kanji/kanji.index.js'
import languages from './routes/languages/languages.index.js'
import notifications from './routes/notifications/notifications.index.js'
import phonetics from './routes/phonetics/phonetics.index.js'
import progress from './routes/progress/progress.index.js'
import reviewQueue from './routes/review-queue/review-queue.index.js'
import study from './routes/study/study.index.js'
import sync from './routes/sync/sync.index.js'
import usersRoutes from './routes/users/users.index.js'
import wordsRoutes from './routes/words/words.index.js'
import writing from './routes/writing/writing.index.js'

const app = createApp()

app.use('*', hooks)

const allowedOrigins = env.ALLOWED_ORIGINS.filter(origin => origin.length > 0)

if (env.NODE_ENV === 'production' && allowedOrigins.length === 0) {
  throw new Error('ALLOWED_ORIGINS must be set in production')
}

app.use('*', cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}))

app.use('*', standardLimiter)

app.get('/healthcheck', c => c.json({ status: 'ok', timestamp: new Date().toISOString() }))

/**
 * Domain routers. Each is a three-file trio under routes/<domain>/ and is
 * added here as it lands — see the phase plan. Order matters only within a
 * router (literal paths before /:id), not between them.
 */
const routes = [
  index,
  auth,
  dialogues,
  grammar,
  invites,
  languages,
  notifications,
  attribution,
  dictionary,
  wordsRoutes,
  kanjiRoutes,
  usersRoutes,
  phonetics,
  writing,
  progress,
  reviewQueue,
  study,
  sync
] as const

configureOpenAPI(app)

routes.forEach((route) => {
  app.route('/', route)
})

export type AppType = typeof routes[number]
export default app
