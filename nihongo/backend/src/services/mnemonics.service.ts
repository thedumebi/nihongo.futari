import type { MnemonicKind } from '@nihongo/shared/constants'
import type { MnemonicCreated, MnemonicCreateInput, MnemonicList, MnemonicReview, MnemonicView } from '@nihongo/shared/types'
import type { SQL } from 'drizzle-orm'

import { pino } from '@nihongo/shared'
import { MNEMONIC_KINDS } from '@nihongo/shared/constants'
import db from '@nihongo/shared/db'
import { contentReviewQueue, kanji, mnemonics, words } from '@nihongo/shared/db/schema'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'

import { languageByCode } from './catalogue.service.js'

/**
 * Invented memory aids.
 *
 * Kept apart from etymology on purpose, down to the service: a mnemonic is
 * made up to help a learner remember, sourced history is not, and nothing
 * here reads or writes an etymology table. The flow mirrors etymology's only
 * in its gate: a mnemonic is written `in-review`, waits in the content review
 * queue, and is published by an approval that records the reviewer, which the
 * table's CHECK requires.
 */

/** The table name review-queue rows point at for a mnemonic. */
export const MNEMONIC_TABLE = 'mnemonics'

/**
 * What a learner may see: published, and meant for everyone. A private
 * mnemonic belongs to the learner who wrote it, never to a public list.
 */
export function visibleToLearners(): SQL {
  return and(
    eq(mnemonics.status, 'published'),
    inArray(mnemonics.visibility, ['system', 'shared'])
  )!
}

/**
 * `kind` is a plain text column. A value outside the known kinds is shown as a
 * story, the column's default, and logged so the drift is seen, not hidden.
 */
function kindOf(kind: string): MnemonicKind {
  if ((MNEMONIC_KINDS as readonly string[]).includes(kind))
    return kind as MnemonicKind
  pino.warn({ kind }, 'Unknown mnemonic kind, shown as a story')
  return 'story'
}

function view(row: { id: string, text: string, imagery: string | null, kind: string }): MnemonicView {
  return { id: row.id, text: row.text, imagery: row.imagery, kind: kindOf(row.kind) }
}

const viewColumns = { id: mnemonics.id, text: mnemonics.text, imagery: mnemonics.imagery, kind: mnemonics.kind }
/** Official first, then the most liked, then the oldest: a stable order. */
const order = [desc(mnemonics.isOfficial), desc(mnemonics.upvotes), mnemonics.createdAt] as const

/** Published mnemonics for one kanji, by its character. */
export async function listForKanji(languageCode: string, character: string): Promise<MnemonicList> {
  const language = await languageByCode(languageCode)
  if (!language)
    return { mnemonics: [] }
  const rows = await db
    .select(viewColumns)
    .from(mnemonics)
    .innerJoin(kanji, eq(kanji.id, mnemonics.kanjiId))
    .where(and(eq(kanji.languageId, language.id), eq(kanji.character, character), visibleToLearners()))
    .orderBy(...order)
  return { mnemonics: rows.map(view) }
}

/** Published mnemonics for one word. */
export async function listForWord(wordId: string): Promise<MnemonicList> {
  const rows = await db
    .select(viewColumns)
    .from(mnemonics)
    .where(and(eq(mnemonics.wordId, wordId), visibleToLearners()))
    .orderBy(...order)
  return { mnemonics: rows.map(view) }
}

/**
 * A new mnemonic, in review. Written and queued in one transaction, so there
 * is never a draft the queue does not know about. Null when the language or
 * the target does not exist.
 */
export async function createForReview(input: MnemonicCreateInput, authorUserId: string): Promise<MnemonicCreated | null> {
  const language = await languageByCode(input.languageCode)
  if (!language)
    return null

  const target = input.kanji !== undefined
    ? await db.select({ id: kanji.id }).from(kanji).where(and(eq(kanji.languageId, language.id), eq(kanji.character, input.kanji))).limit(1)
    : await db.select({ id: words.id }).from(words).where(and(eq(words.languageId, language.id), eq(words.id, input.wordId!))).limit(1)
  const targetId = target[0]?.id
  if (!targetId)
    return null

  return db.transaction(async (tx) => {
    const [row] = await tx.insert(mnemonics).values({
      languageId: language.id,
      kanjiId: input.kanji !== undefined ? targetId : null,
      wordId: input.wordId !== undefined ? targetId : null,
      text: input.text,
      imagery: input.imagery ?? null,
      kind: input.kind,
      authorUserId,
      visibility: 'system',
      generatedBy: input.generatedBy,
      status: 'in-review'
    }).returning({ id: mnemonics.id })
    const [queued] = await tx.insert(contentReviewQueue).values({
      languageId: language.id,
      targetTable: MNEMONIC_TABLE,
      targetId: row!.id,
      changeType: 'create',
      proposed: { text: input.text, imagery: input.imagery ?? null, kind: input.kind },
      origin: input.generatedBy === 'ai' ? 'ai' : 'human'
    }).returning({ id: contentReviewQueue.id })
    return { id: row!.id, reviewId: queued!.id }
  })
}

/**
 * Publish an approved mnemonic, recording who signed it off. Called by the
 * review queue inside its approval transaction; the CHECK on the table refuses
 * a publish without a reviewer, so there is no path that skips one.
 */
export async function publishReviewed(tx: Pick<typeof db, 'update'>, id: string, reviewerId: string, now = new Date()): Promise<void> {
  await tx
    .update(mnemonics)
    .set({ status: 'published', reviewedBy: reviewerId, reviewedAt: now, updatedAt: now })
    .where(eq(mnemonics.id, id))
}

/** What the reviewer reads for each mnemonic on a queue page, by mnemonic id. */
export async function forReview(ids: string[]): Promise<Map<string, MnemonicReview>> {
  if (ids.length === 0)
    return new Map()
  const rows = await db
    .select({
      id: mnemonics.id,
      text: mnemonics.text,
      imagery: mnemonics.imagery,
      kind: mnemonics.kind,
      subject: sql<string | null>`coalesce(${kanji.character}, ${words.primaryForm})`
    })
    .from(mnemonics)
    .leftJoin(kanji, eq(kanji.id, mnemonics.kanjiId))
    .leftJoin(words, eq(words.id, mnemonics.wordId))
    .where(inArray(mnemonics.id, ids))
  return new Map(rows.map(r => [r.id, { text: r.text, imagery: r.imagery, kind: kindOf(r.kind), subject: r.subject }]))
}
