import { z } from '@hono/zod-openapi'
import { HttpStatusCodes, MNEMONIC_ROUTES } from '@nihongo/shared/constants'
import { createAdminRoute, createPublicRoute, ErrorSchema, jsonContent, jsonContentRequired } from '@nihongo/shared/openapi'
import { mnemonicCreatedSchema, mnemonicCreateSchema, mnemonicListSchema } from '@nihongo/shared/types'

import adminMiddleware from '@/middlewares/admin.js'
import authMiddleware from '@/middlewares/auth.js'

const tags = ['Mnemonics']

export const create = createAdminRoute({
  tags,
  path: MNEMONIC_ROUTES.CREATE,
  method: 'post',
  summary: 'Add a mnemonic for review',
  description: 'Written as in-review and queued in the content review queue. Nothing is shown to a learner until a reviewer approves it there.',
  middleware: [authMiddleware, adminMiddleware],
  request: { body: jsonContentRequired(mnemonicCreateSchema, 'The memory aid and what it is for') },
  responses: {
    [HttpStatusCodes.CREATED]: jsonContent(mnemonicCreatedSchema, 'Queued for review'),
    [HttpStatusCodes.NOT_FOUND]: jsonContent(ErrorSchema, 'No such kanji, word or language')
  }
})
export type CreateRoute = typeof create

export const forKanji = createPublicRoute({
  tags,
  path: MNEMONIC_ROUTES.FOR_KANJI,
  method: 'get',
  summary: 'Published mnemonics for a kanji',
  description: 'Invented memory aids, reviewed and published. Not etymology: an empty list when there are none.',
  request: {
    params: z.object({ character: z.string().min(1) }),
    query: z.object({ languageCode: z.string().min(2).default('ja') })
  },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(mnemonicListSchema, 'Mnemonics')
  }
})
export type ForKanjiRoute = typeof forKanji

export const forWord = createPublicRoute({
  tags,
  path: MNEMONIC_ROUTES.FOR_WORD,
  method: 'get',
  summary: 'Published mnemonics for a word',
  description: 'Invented memory aids, reviewed and published. Not etymology: an empty list when there are none.',
  request: { params: z.object({ wordId: z.string().min(1) }) },
  responses: {
    [HttpStatusCodes.OK]: jsonContent(mnemonicListSchema, 'Mnemonics')
  }
})
export type ForWordRoute = typeof forWord
