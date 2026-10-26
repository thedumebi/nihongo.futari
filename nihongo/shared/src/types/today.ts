import { z } from '@hono/zod-openapi'

import { lessonFirstSchema, stageCelebrationSchema, stageProgressSchema } from './study.js'

/**
 * The Today screen: one answer to "what should I do now?".
 *
 * Everything here exists elsewhere — the due count, the next lesson, the next
 * Speak session, the streak — but scattered over a dozen pages, so a learner
 * opening the app met a choice of destinations and no direction. Today puts
 * them in the order worth doing: reviews first, then something new.
 *
 * The app keeps the last one on the device to show while a fresh one loads.
 * Renaming or removing a field here: bump `VERSION` in the frontend's
 * `lib/last-today.ts`, so no screen is handed a copy from before the change.
 */
export const todaySchema = z.object({
  /** Items due now, as every other surface counts them. */
  due: z.number().int(),
  /** When the next not-yet-due card comes due, so the nav can refresh its badge right then. */
  nextDueAt: z.string().nullable(),
  /** New words the queue has introduced today, and today's limit. */
  newToday: z.number().int(),
  newLimit: z.number().int(),
  /**
   * Extra cards of words already met still to come today: what "Practising
   * words you've met" offers once the new words are done. Never more than
   * there are to give.
   */
  extrasLeft: z.number().int(),
  /**
   * New words the stage you are on still has to introduce. Today's count is the
   * smaller of this and what is left of the limit: once a stage's words are all
   * met, nothing new comes until most of the stage is learned, whatever the limit.
   */
  newAvailable: z.number().int(),
  /**
   * The stage new words are waiting on, when that is why none are left today:
   * every word in it met, and not enough of it learned yet. Null otherwise.
   */
  stageWait: stageProgressSchema.nullable(),
  /** A stage passed and not yet shown anywhere, as Study's queue carries it. */
  celebrate: stageCelebrationSchema.nullable(),
  nextLesson: z.object({ level: z.string(), slug: z.string(), title: z.string() }).nullable(),
  /** Today's lesson while today's new words wait on it; null once one is done or none is left. */
  lessonFirst: lessonFirstSchema.nullable(),
  nextSpeak: z.object({ code: z.string(), number: z.number().int(), level: z.string(), titleEn: z.string() }).nullable(),
  streak: z.object({
    current: z.number().int(),
    longest: z.number().int(),
    /** Whether today already counts — so the page can say "keep it going" or "done for today". */
    studiedToday: z.boolean()
  }),
  xp: z.object({ total: z.number().int(), level: z.number().int() }),
  /** Today's three small goals — the same all day. */
  quests: z.array(z.object({
    code: z.string(),
    title: z.string(),
    target: z.number().int(),
    progress: z.number().int(),
    done: z.boolean()
  })),
  /**
   * A speech to read: the unread one whose words the learner knows best — the
   * most within reach right now. Null when every speech has been read.
   */
  suggestedReading: z.object({ code: z.string(), title: z.string(), titleEn: z.string(), level: z.string(), coverage: z.number().nullable() }).nullable(),
  /** Achievements unlocked but not yet celebrated — shown once, then marked seen. */
  unseenAchievements: z.array(z.object({ code: z.string(), title: z.string(), description: z.string() })),
  /** Friend requests waiting for this learner to accept — the menu shows the count. */
  friendRequests: z.number().int()
}).openapi('Today')

export type Today = z.infer<typeof todaySchema>

export const todayQuerySchema = z.object({
  languageCode: z.string().min(2).default('ja'),
  /** Words granted past today's limit ("learn 5 more"), as the study page sends them. */
  moreNew: z.coerce.number().int().min(0).max(50).optional()
})
