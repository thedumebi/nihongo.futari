import { createRoute } from '@hono/zod-openapi'

import * as HttpStatusCodes from '@/constants/http-status-codes.js'

import { ErrorSchema } from '../schemas/index.js'
import { jsonContent } from './index.js'

/**
 * Route helpers that wrap `createRoute` from @hono/zod-openapi and inject the
 * standard error responses for docs/type generation. These mirror the auth
 * requirements enforced by the router middleware:
 *
 *   - createPublicRoute  : 422 validation only
 *   - createSecuredRoute : 401 (auth) + 422
 *   - createAdminRoute   : 401 (auth) + 403 (admin) + 422
 *
 * Error bodies are rendered at runtime by the shared `onError` handler
 * (`{ message, stack? }`), which `ErrorSchema` describes. Responses are NOT
 * validated at runtime — these entries exist purely for the OpenAPI document
 * and handler typing. Per-route `responses` are spread last so a route can
 * override or add to the defaults.
 */

const validationResponse = {
  [HttpStatusCodes.UNPROCESSABLE_ENTITY]: jsonContent(ErrorSchema, 'Validation error')
}

const unauthorizedResponse = {
  [HttpStatusCodes.UNAUTHORIZED]: jsonContent(ErrorSchema, 'Unauthorized')
}

const forbiddenResponse = {
  [HttpStatusCodes.FORBIDDEN]: jsonContent(ErrorSchema, 'Forbidden — admin access required')
}

type RouteConfig = Parameters<typeof createRoute>[0]

/** Public route — adds only the 422 validation response. */
export function createPublicRoute<T extends RouteConfig>(config: T) {
  return createRoute({
    ...config,
    responses: {
      ...validationResponse,
      ...config.responses
    }
  })
}

/** Authenticated route — adds 401 + 422 responses. */
export function createSecuredRoute<T extends RouteConfig>(config: T) {
  return createRoute({
    ...config,
    responses: {
      ...validationResponse,
      ...unauthorizedResponse,
      ...config.responses
    }
  })
}

/** Admin-only route — adds 401 + 403 + 422 responses. */
export function createAdminRoute<T extends RouteConfig>(config: T) {
  return createRoute({
    ...config,
    responses: {
      ...validationResponse,
      ...unauthorizedResponse,
      ...forbiddenResponse,
      ...config.responses
    }
  })
}
