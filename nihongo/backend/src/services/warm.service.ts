import { pino } from '@nihongo/shared'
import db, { connection } from '@nihongo/shared/db'
import { friendships, learningActivities, lessonViews, speakProgress, srsCards, srsDailyStats, srsReviewLogs, stageCelebrations, userAchievements, users, userSettings, userStreaks, userXp } from '@nihongo/shared/db/schema'
import { sql } from 'drizzle-orm'

import { catalogue, catalogueUnits, facetFacts, itemCharacters, languageByCode, languageCodes } from './catalogue.service.js'
import { warmDialogues } from './dialogues.service.js'
import { listLanguages } from './languages.service.js'
import { warmReadings } from './readings.service.js'
import { warmSpeak } from './speak.service.js'

/**
 * Fill the content caches once the server is up, so the first learner after a
 * deploy is not the one who pays for them. Unwarmed, that learner's Today made
 * 80 queries and glossed every speech; warmed, it makes its usual handful.
 *
 * Every piece is what a request would have loaded anyway, through the same
 * cached functions, so a request that arrives mid-warm shares the load rather
 * than starting its own. A failure is logged and left for the first request to
 * retry.
 */
export async function warmContent(): Promise<void> {
  await warmConnections()
  const started = performance.now()
  try {
    // One language after another: each builds its own glossary, and a box
    // with two cores serving requests meanwhile need not build them at once.
    // The language list is warmed beside them, and failing alone: the first
    // GET /languages can retry it, and the rest need not wait on it.
    void listLanguages().catch(err => pino.warn({ err }, 'Warming the language list failed; the first request will load it'))
    const codes = await languageCodes()
    for (const code of codes) {
      const language = await languageByCode(code)
      if (language)
        await Promise.all([catalogue(language.id), catalogueUnits(language.id), facetFacts(language.id), itemCharacters(language.id), warmReadings(code), warmDialogues(code), warmSpeak(language.id)])
    }
    pino.info({ ms: Math.round(performance.now() - started), languages: codes.length }, 'Content caches warmed')
  } catch (err) {
    pino.warn({ err }, 'Warming the content caches failed; the first requests will load them')
  }
}

// The learner tables Today reads. Planning a read of each loads what a
// connection holds about a table and its indexes, which a new one's first
// real query would otherwise pay for.
const TODAY_TABLES = [users, userSettings, srsCards, srsReviewLogs, srsDailyStats, lessonViews, learningActivities, speakProgress, stageCelebrations, userXp, userStreaks, userAchievements, friendships]

/**
 * Open the connections the pool keeps (`DB_POOL_MIN`) and ready each one. The
 * pool keeps that many once it has them but does not open them itself, so
 * the first Today after a deploy waited ~350 ms on handshakes, and a new
 * connection's first query cost 110-155 ms more. All at once (the sleep keeps
 * them overlapping), so each takes a connection of its own. A failure is
 * logged: requests open their own, as before.
 */
export async function warmConnections(): Promise<void> {
  const count = connection.options.min ?? 0
  const reads = sql.join(TODAY_TABLES.map(t => sql`(select 1 from ${t} limit 0)`), sql` union all `)
  try {
    await Promise.all(Array.from({ length: count }, () => db.execute(sql`select pg_sleep(0.05) from (${reads}) r right join (select 1) one on true`)))
  } catch (err) {
    pino.warn({ err }, 'Opening the pool\'s connections failed; requests will open their own')
  }
}
