import { pino } from 'pino'
import pretty from 'pino-pretty'

import env from '@/env.js'

const logger = pino({
  level: env.LOG_LEVEL || 'info',
  // A request line logs its headers, and these two sign a request in: a copy
  // in the logs would be a working session for anyone who can read them.
  redact: { paths: ['req.headers.cookie', 'req.headers.authorization'], censor: '[redacted]' }
}, env.NODE_ENV === 'production'
  ? undefined
  : pretty({
      colorize: true,
      ignore: 'pid,hostname',
      translateTime: 'SYS:standard',
      singleLine: false,
      errorLikeObjectKeys: ['err', 'error'],
      levelFirst: true,
      messageKey: 'msg',
      hideObject: false
    }))

export default logger
