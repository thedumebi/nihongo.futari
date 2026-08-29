import type { Hook } from '@hono/zod-openapi'

import { HttpStatusCodes } from '@nihongo/shared/constants'

const defaultHook: Hook<any, any, any, any> = (result, c) => {
  if (!result.success) {
    return c.json({
      message: 'Validation failed',
      errors: result.error.issues
    }, HttpStatusCodes.UNPROCESSABLE_ENTITY)
  }
}

export default defaultHook
