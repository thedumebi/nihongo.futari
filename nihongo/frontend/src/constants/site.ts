import { ROUTES } from './index'

/**
 * The product is `go` — from 語, the suffix that means "language" (日本語,
 * 英語, フランス語). The app is multi-language; a specific language is a course
 * inside it, never the brand.
 */
export const SITE_NAME = 'go'

/**
 * The kanji the name comes from, shown before it.
 *
 * 語 is read "go" and means "language" — it is the suffix in 日本語, 英語,
 * フランス語. Printing it beside the name makes the pun visible instead of
 * leaving it as a note in this file, and it reads as a mark rather than as
 * text the reader has to parse.
 */
export const SITE_MARK = '語'
export const SITE_TAGLINE = 'Learn a language, and learn why it works the way it does.'

export const NAV_LINKS = [
  { label: 'Study', to: ROUTES.STUDY },
  { label: 'Progress', to: ROUTES.PROGRESS },
  { label: 'Dictionary', to: ROUTES.DICTIONARY },
  { label: 'Grammar', to: ROUTES.GRAMMAR }
] as const

/**
 * JMdict/KANJIDIC, KanjiVG and Tatoeba are all attribution + share-alike.
 * This list is rendered on /attribution and is a licence obligation, not a
 * courtesy — keep it in step with the `import_sources` table.
 */
export const DATA_ATTRIBUTIONS = [
  {
    name: 'JMdict / KANJIDIC2',
    holder: 'Electronic Dictionary Research and Development Group',
    license: 'CC BY-SA 4.0',
    url: 'https://www.edrdg.org/edrdg/licence.html'
  },
  {
    name: 'KanjiVG',
    holder: 'Ulrich Apel',
    license: 'CC BY-SA 3.0',
    url: 'https://kanjivg.tagaini.net/'
  },
  {
    name: 'Tatoeba',
    holder: 'Tatoeba Project contributors',
    license: 'CC BY 2.0 FR',
    url: 'https://tatoeba.org/'
  }
] as const
