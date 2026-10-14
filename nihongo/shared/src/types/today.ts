import { z } from '@hono/zod-openapi'

/**
 * The Today screen: one answer to "what should I do now?".
 *
 * Everything here exists elsewhere — the due count, the next lesson, the next
 * Speak session, the streak — but scattered over a dozen pages, so a learner
 * opening the app met a choice of destinations and no direction. Today puts
 * them in the order worth doing: reviews first, then something new.
 */
export const todaySchema = z.object({
  /** Items due now, as every other surface counts them. */
  due: z.number().int(),
  /** New cards the queue has introduced today, and the daily limit. */
  newToday: z.number().int(),
  newLimit: z.number().int(),
  nextLesson: z.object({ level: z.string(), slug: z.string(), title: z.string() }).nullable(),
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
  /** Achievements unlocked but not yet celebrated — shown once, then marked seen. */
  unseenAchievements: z.array(z.object({ code: z.string(), title: z.string(), description: z.string() }))
}).openapi('Today')

export type Today = z.infer<typeof todaySchema>

export const todayQuerySchema = z.object({
  languageCode: z.string().min(2).default('ja')
})
