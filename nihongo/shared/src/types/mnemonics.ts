import { z } from '@hono/zod-openapi'

import { MNEMONIC_KINDS } from '@/constants/endpoints.js'

/**
 * Invented memory aids, as a learner sees them.
 *
 * Deliberately NOT the etymology shape: no claim, no citations, no confidence,
 * no period. A mnemonic is made up to help you remember, and every surface that
 * shows one says so. Shares nothing with `etymology.ts` on purpose. The row
 * types (`Mnemonic`, `NewMnemonic`) live beside the table's other derivations.
 */
export const mnemonicViewSchema = z.object({
  id: z.string(),
  /** The memory aid itself. */
  text: z.string(),
  /** A picture to hold in mind, when the aid has one. */
  imagery: z.string().nullable(),
  kind: z.enum(MNEMONIC_KINDS)
}).openapi('MnemonicView')

export type MnemonicView = z.infer<typeof mnemonicViewSchema>

/** Published mnemonics for one kanji or word: an empty list when there are none. */
export const mnemonicListSchema = z.object({
  mnemonics: z.array(mnemonicViewSchema)
}).openapi('MnemonicList')

export type MnemonicList = z.infer<typeof mnemonicListSchema>

/**
 * An admin's new mnemonic. It goes in as `in-review` and lands in the review
 * queue; nothing reaches a learner until it is approved there.
 *
 * Exactly one target: a kanji by its character, or a word by its id.
 */
export const mnemonicCreateSchema = z.object({
  languageCode: z.string().min(2).default('ja'),
  kanji: z.string().min(1).optional(),
  wordId: z.string().min(1).optional(),
  text: z.string().trim().min(1).max(2000),
  imagery: z.string().trim().max(1000).optional(),
  kind: z.enum(MNEMONIC_KINDS).default('story'),
  /** Who wrote it. Either way it is reviewed before anyone sees it. */
  generatedBy: z.enum(['human', 'ai']).default('human')
}).refine(v => (v.kanji === undefined) !== (v.wordId === undefined), {
  message: 'Give exactly one of kanji or wordId'
}).openapi('MnemonicCreate')

export type MnemonicCreateInput = z.infer<typeof mnemonicCreateSchema>

export const mnemonicCreatedSchema = z.object({
  id: z.string(),
  /** The review-queue row it is waiting in. */
  reviewId: z.string()
}).openapi('MnemonicCreated')

export type MnemonicCreated = z.infer<typeof mnemonicCreatedSchema>

/** What a reviewer reads for a mnemonic in the queue: the aid, and what it is for. */
export const mnemonicReviewSchema = mnemonicViewSchema.omit({ id: true }).extend({
  /** The kanji character or the word's written form. */
  subject: z.string().nullable()
})

export type MnemonicReview = z.infer<typeof mnemonicReviewSchema>
