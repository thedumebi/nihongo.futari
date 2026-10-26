/* eslint-disable no-console */
import db, { connection } from '@nihongo/shared/db'
import { sql } from 'drizzle-orm'

import { unseenAchievements } from '../services/achievements.service.js'
import { getCrossword } from '../services/crossword.service.js'
import { listDialogues } from '../services/dialogues.service.js'
import { listLessons } from '../services/lesson.service.js'
import { getKnownKanji, getSummary, studiedToday, todayQuests } from '../services/progress.service.js'
import { listReadings } from '../services/readings.service.js'
import { listSpeak } from '../services/speak.service.js'
import { countDue, getCourse, getDecks, getQueue, newLeftToday, nextDueAfter, stageCeilings, stageProgress } from '../services/srs.service.js'
import { getToday } from '../services/today.service.js'
import { afterFixture, LANGUAGE_ID, LEARNERS } from './learner-specs.js'

/**
 * How long each learner-facing read takes, locally, for a golden learner.
 *
 * Run `pnpm test:db` first (it builds the learners), then
 * `pnpm bench:reads [learner]` (default mid-n5). The database clock is put at
 * the learner's golden moment and left there; the next test run resets it.
 * Each read runs once to warm up, then three times timed.
 */
const name = process.argv[2] ?? 'mid-n5'
const spec = LEARNERS[name]
if (!spec)
  throw new Error(`No learner "${name}": one of ${Object.keys(LEARNERS).join(', ')}`)
const userId = spec.id

const reads: Array<[string, () => Promise<unknown>]> = [
  ['getToday', () => getToday(userId, 'ja')],
  ['  countDue', () => countDue(userId, LANGUAGE_ID)],
  ['  nextDueAfter', () => nextDueAfter(userId, LANGUAGE_ID, new Date())],
  ['  newLeftToday', () => newLeftToday(userId, LANGUAGE_ID, new Date())],
  ['  listLessons', () => listLessons(userId, 'ja')],
  ['  listSpeak', () => listSpeak(userId, 'ja')],
  ['  getSummary', () => getSummary(userId, 'ja')],
  ['  studiedToday', () => studiedToday(userId, LANGUAGE_ID)],
  ['  todayQuests', () => todayQuests(userId, LANGUAGE_ID)],
  ['  unseenAchievements', () => unseenAchievements(userId)],
  ['  listReadings', () => listReadings('ja', undefined, userId)],
  ['  stageProgress', () => stageProgress(userId, LANGUAGE_ID)],
  ['stageCeilings', () => stageCeilings(userId, LANGUAGE_ID)],
  ['getQueue mixed', () => getQueue(userId, { languageCode: 'ja', limit: 20, horizonDays: 0, mode: 'mixed' })],
  ['getQueue new', () => getQueue(userId, { languageCode: 'ja', limit: 20, horizonDays: 0, mode: 'new' })],
  ['getCourse', () => getCourse(userId, 'ja')],
  ['getDecks', () => getDecks(userId, 'ja')],
  ['getKnownKanji', () => getKnownKanji(userId, 'ja')],
  ['listDialogues', () => listDialogues('ja', userId)],
  ['getCrossword', () => getCrossword(userId, { languageCode: 'ja', level: 'N5', source: 'daily' })]
]

await db.execute(sql`update public.test_clock set at = ${afterFixture(spec).toISOString()}::timestamptz`)
for (const [label, read] of reads) {
  await read()
  const started = performance.now()
  for (let i = 0; i < 3; i++)
    await read()
  console.log(`${label.padEnd(22)} ${((performance.now() - started) / 3).toFixed(0).padStart(6)} ms`)
}
await connection.end()
