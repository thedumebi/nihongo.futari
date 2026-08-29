import { z } from 'zod'

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  keyword: z.string().optional(),
  tagId: z.string().optional()
})

export const IdParamSchema = z.object({
  id: z.string().min(1)
})

export const SlugParamSchema = z.object({
  slug: z.string().min(1)
})

export const MessageResponseSchema = z.object({
  message: z.string()
})

export const ImageRefSchema = z.object({
  url: z.string(),
  fileId: z.string().optional(),
  thumbnailUrl: z.string().optional()
}).nullable()

export type PaginationQuery = z.infer<typeof PaginationQuerySchema>
export type ImageRef = z.infer<typeof ImageRefSchema>
