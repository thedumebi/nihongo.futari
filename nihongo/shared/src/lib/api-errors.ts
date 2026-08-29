import * as HttpStatusCodes from '@/constants/http-status-codes.js'

export class ApiError extends Error {
  public readonly statusCode: number
  public readonly code?: string
  public readonly details?: unknown

  constructor(message: string, statusCode = HttpStatusCodes.INTERNAL_SERVER_ERROR, code?: string, details?: unknown) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export class NotFoundError extends ApiError {
  constructor(message = 'Not Found') { super(message, HttpStatusCodes.NOT_FOUND, 'not_found') }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'Unauthorized') { super(message, HttpStatusCodes.UNAUTHORIZED, 'unauthorized') }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Forbidden') { super(message, HttpStatusCodes.FORBIDDEN, 'forbidden') }
}

export class BadRequestError extends ApiError {
  constructor(message = 'Bad Request', details?: unknown) { super(message, HttpStatusCodes.BAD_REQUEST, 'bad_request', details) }
}

export class ConflictError extends ApiError {
  constructor(message = 'Conflict') { super(message, HttpStatusCodes.CONFLICT, 'conflict') }
}
