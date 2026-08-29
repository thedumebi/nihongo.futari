import { serve } from '@hono/node-server'
import { pino } from '@nihongo/shared'
import { connection } from '@nihongo/shared/db'
import env from '@nihongo/shared/env'

import app from './app.js'
import testDatabaseConnection from './db/index.js'
import { initGeo } from './lib/geo.js'
import { runShutdownHooks } from './lib/shutdown.js'

const server = serve({
  fetch: app.fetch,
  port: env.PORT
}, async (info) => {
  await testDatabaseConnection()
  initGeo()
  pino.info(`Server is running on http://localhost:${info.port}`)
})

const SHUTDOWN_TIMEOUT_MS = 30_000
let shuttingDown = false

async function shutdown(signal: string) {
  if (shuttingDown)
    return
  shuttingDown = true
  pino.info(`Received ${signal}, starting graceful shutdown`)

  const forceExit = setTimeout(() => {
    pino.error('Graceful shutdown timed out, forcing exit')
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)
  forceExit.unref()

  await runShutdownHooks(signal)

  await new Promise<void>((resolve) => {
    server.close((err) => {
      if (err)
        pino.error({ err }, 'Error closing HTTP server')
      resolve()
    })
  })

  try {
    await connection.end()
    pino.info('Database pool drained')
  } catch (err) {
    pino.error({ err }, 'Error draining database pool')
  }

  clearTimeout(forceExit)
  process.exit(0)
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
process.on('unhandledRejection', (reason, promise) => {
  pino.error({ reason, promise }, 'Unhandled promise rejection')
})
process.on('uncaughtException', (err) => {
  pino.error({ err }, 'Uncaught exception, attempting graceful shutdown')
  void shutdown('uncaughtException')
})
