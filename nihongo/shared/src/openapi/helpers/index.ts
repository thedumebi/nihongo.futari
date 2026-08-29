import type { z } from 'zod'

export function jsonContent<T extends z.ZodTypeAny>(schema: T, description: string) {
  return {
    content: { 'application/json': { schema } },
    description
  }
}

export function jsonContentRequired<T extends z.ZodTypeAny>(schema: T, description: string) {
  return { ...jsonContent(schema, description), required: true }
}

export function createMessageObjectSchema(message: string) {
  return {
    type: 'object' as const,
    properties: {
      message: { type: 'string' as const, example: message }
    },
    required: ['message']
  }
}
