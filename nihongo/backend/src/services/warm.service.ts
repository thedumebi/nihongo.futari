import { pino } from '@nihongo/shared'

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
