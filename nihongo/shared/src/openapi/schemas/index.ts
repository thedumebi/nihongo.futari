import { z } from 'zod'

export const ErrorSchema = z.object({
  message: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional()
})

export function createErrorSchema(_schema: z.ZodTypeAny) {
  return ErrorSchema
}
