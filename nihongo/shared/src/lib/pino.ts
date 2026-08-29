import { pino } from 'pino'
import pretty from 'pino-pretty'

import env from '@/env.js'

const logger = pino({
  level: env.LOG_LEVEL || 'info'
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
