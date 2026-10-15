import { z } from '@hono/zod-openapi'

/**
 * A Recall session: the learner's own shaky words, said hands-free — the
 * English, a pause to say the Japanese, then the Japanese.
 */
export const recallItemSchema = z.object({
  /** The word id, or the Speak step's — what a repeat refers back to. */
  key: z.string(),
  kind: z.enum(['word', 'speak']),
  /** What is asked, in English, for the screen. */
  prompt: z.string(),
  /** The clips that ask it, in order — the first sound's clip last, when there is a hint. */
  promptAudio: z.array(z.string()),
  /**
   * The answer's first sound (ひ), when the English could mean more than one
   * word the learner has — "one" is いち or ひとつ. Null when it cannot.
   */
  hint: z.string().nullable(),
  /** The answer as written, and in kana for sizing the pause. */
  text: z.string(),
  reading: z.string(),
  answerAudio: z.string()
}).openapi('RecallItem')

export type RecallItem = z.infer<typeof recallItemSchema>

export const recallSessionSchema = z.object({
  items: z.array(recallItemSchema),
  /** Indices into `items`, in the order to ask them — repeats included. */
  order: z.array(z.number().int())
}).openapi('RecallSession')

export type RecallSession = z.infer<typeof recallSessionSchema>

export const recallQuerySchema = z.object({
  languageCode: z.string().min(2).default('ja'),
  /** How many different things to practise. */
  size: z.coerce.number().int().min(3).max(30).default(12)
})
