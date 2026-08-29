import { pino } from '@nihongo/shared'
import env from '@nihongo/shared/env'
import { Redis } from 'ioredis'

// Single shared Redis client (ofuma-style host/port/password). Used by the
// rate limiter. Callers tolerate Redis being unavailable — the rate limiter
// has an in-memory insurance limiter.
//
// In production nihongo shares dmb's Redis instance. Isolation is handled at the
// consumer: the rate limiter namespaces its keys with `nihongo-rl` (dmb uses
// `dmb-rl`), so the two sites never collide. NOTE: don't set an ioredis
// `keyPrefix` here — rate-limiter-flexible runs a Lua `eval` whose KEYS are
// NOT prefixed by ioredis, so a client-level prefix would be inconsistent.
// Any future Redis usage should carry its own `nihongo`-scoped key prefix.
const redis = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableOfflineQueue: false
})

redis.on('error', (err) => {
  pino.error({ err: err.message }, '[REDIS] connection error')
})

redis.on('connect', () => {
  pino.info('[REDIS] connected')
})

export default redis
