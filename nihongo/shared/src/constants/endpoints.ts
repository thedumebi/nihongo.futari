/**
 * API endpoint constants — single source of truth shared by backend routes,
 * the frontend API layer, and any external clients.
 *
 * - `ROUTE_BASE_PATHS`  : the mount prefix for each domain router.
 * - `*_ROUTES`          : RELATIVE paths (relative to the domain base) used by
 *                          the backend `createRoute` configs.
 * - `API_ENDPOINTS`     : fully-compiled client paths. Static routes are plain
 *                          strings; parameterised routes are substitution
 *                          functions.
 *
 * Domains are declared here ahead of their implementation phase so the shape
 * is settled once. See the plan's phase table for what actually ships when.
 */

export const ROUTE_BASE_PATHS = {
  AUTH: '/auth',
  USERS: '/users',
  ADMIN: '/admin',
  UPLOADS: '/uploads',
  LANGUAGES: '/languages',
  KANA: '/kana',
  KANJI: '/kanji',
  PHONETICS: '/sound-series',
  WRITING: '/writing',
  WORDS: '/words',
  GRAMMAR: '/grammar',
  LESSONS: '/lessons',
  SENTENCES: '/sentences',
  DIALOGUES: '/dialogues',
  STUDY: '/study',
  SYNC: '/sync',
  PROGRESS: '/progress',
  DICTIONARY: '/dictionary',
  NOTIFICATIONS: '/notifications',
  REVIEW_QUEUE: '/review-queue',
  INVITES: '/invites',
  IMPORTS: '/imports',
  ATTRIBUTION: '/attribution'
} as const

export const USER_ROLES = ['user', 'admin'] as const
export type UserRole = typeof USER_ROLES[number]

// ---------------------------------------------------------------------------
// Domain vocabularies. These are the discriminants the schema and the exercise
// engine key off, so they live beside the routes rather than in the schema
// files — the frontend needs them too.
// ---------------------------------------------------------------------------

/** Content kinds a `study_items` row can point at (one arc arm each). */
export const STUDY_ITEM_KINDS = ['kana', 'kanji', 'word', 'grammar', 'sentence', 'phonetic-series', 'dialogue'] as const
export type StudyItemKind = typeof STUDY_ITEM_KINDS[number]

/** The SRS unit. One study item is drilled along several independent facets. */
export const STUDY_FACETS = ['meaning', 'production', 'reading', 'listening', 'writing', 'usage', 'pitch'] as const
export type StudyFacet = typeof STUDY_FACETS[number]

/** Exercise templates. `typed-cloze` is the default; `mcq` is first-exposure only. */
export const EXERCISE_TEMPLATE_CODES = [
  'typed-cloze',
  'mcq',
  'word-order',
  'dictation',
  'listening',
  'handwriting',
  'reading-input',
  'kana-romaji',
  'conjugation-drill',
  'sound-series-pick',
  'dialogue-reply'
] as const
export type ExerciseTemplateCode = typeof EXERCISE_TEMPLATE_CODES[number]

/** FSRS ratings. */
export const REVIEW_RATINGS = { AGAIN: 1, HARD: 2, GOOD: 3, EASY: 4 } as const
export type ReviewRating = typeof REVIEW_RATINGS[keyof typeof REVIEW_RATINGS]

/**
 * How confident we are in a sourced explanation. `unknown` exists so the
 * enrichment pass has something honest to return when the grounding packet
 * doesn't support a claim — nothing at `unknown` is ever published.
 */
export const ETYMOLOGY_CONFIDENCE = [
  'attested',
  'well-supported',
  'plausible',
  'disputed',
  'folk-etymology',
  'unknown'
] as const
export type EtymologyConfidence = typeof ETYMOLOGY_CONFIDENCE[number]

/** What an explanation is explaining. */
export const ETYMOLOGY_ASPECTS = [
  'glyph-origin',
  'phonetic-series',
  'component-semantics',
  'word-formation',
  'loan-origin',
  'reading-layer',
  'rendaku',
  'sound-change',
  'historical-grammar',
  'semantic-drift'
] as const
export type EtymologyAspect = typeof ETYMOLOGY_ASPECTS[number]

/** Editorial lifecycle. AI output enters at `ai-drafted` and cannot skip review. */
export const CONTENT_STATUSES = ['draft', 'ai-drafted', 'in-review', 'published', 'rejected', 'needs-source'] as const
export type ContentStatus = typeof CONTENT_STATUSES[number]

/** Native / Sino-Japanese / loan / hybrid — drives the word-origin explanation. */
export const WORD_ORIGINS = ['wago', 'kango', 'gairaigo', 'konshugo', 'wasei-eigo'] as const
export type WordOrigin = typeof WORD_ORIGINS[number]

// 'romaji' shows the reading in latin letters instead of kana. It is for the
// first weeks, when the kana themselves are still being learned and furigana
// is one unknown script explaining another.
export const FURIGANA_MODES = ['off', 'always', 'unknown-only', 'romaji'] as const
export type FuriganaMode = typeof FURIGANA_MODES[number]

// ---------------------------------------------------------------------------
// Relative route paths.
// ---------------------------------------------------------------------------

export const USER_ROUTES = {
  ME: '/me',
  UPDATE_ME: '/me',
  SETTINGS: '/me/settings',
  UPDATE_SETTINGS: '/me/settings'
} as const

export const LANGUAGE_ROUTES = {
  LIST: '/',
  GET_BY_CODE: '/:code',
  LEVELS: '/:code/levels'
} as const

export const KANA_ROUTES = {
  LIST: '/',
  GET_BY_CHARACTER: '/:character'
} as const

export const KANJI_ROUTES = {
  LIST: '/',
  GET_BY_CHARACTER: '/:character',
  COMPONENTS: '/:character/components',
  WORDS: '/:character/words',
  PHONETIC_SERIES: '/:character/phonetic-series',
  CREATE: '/',
  UPDATE: '/:id',
  DELETE: '/:id'
} as const

export const ATTRIBUTION_ROUTES = {
  LIST: '/'
} as const

export const WRITING_ROUTES = {
  QUEUE: '/queue',
  GET_BY_CHARACTER: '/:character'
} as const

export const PHONETIC_ROUTES = {
  LIST: '/',
  GET_BY_COMPONENT: '/:component'
} as const

export const WORD_ROUTES = {
  LIST: '/',
  GET_BY_ID: '/:id',
  SENTENCES: '/:id/sentences',
  CREATE: '/',
  UPDATE: '/:id',
  DELETE: '/:id'
} as const

export const LESSONS_ROUTES = {
  LIST: '/',
  GET: '/:slug',
  COMPLETE: '/:slug/complete'
} as const

export const GRAMMAR_ROUTES = {
  LIST: '/',
  GET_BY_SLUG: '/:slug',
  GET_BY_ID: '/by-id/:id',
  RELATED: '/:slug/related',
  CREATE: '/',
  UPDATE: '/:id',
  DELETE: '/:id',
  PUBLISH: '/:id/publish'
} as const

export const SENTENCE_ROUTES = {
  LIST: '/',
  GET_BY_ID: '/:id',
  CREATE: '/',
  UPDATE: '/:id',
  DELETE: '/:id'
} as const

export const DIALOGUE_ROUTES = {
  LIST: '/',
  GET_BY_CODE: '/:code'
} as const

export const STUDY_ROUTES = {
  COURSE: '/course',
  DUE: '/due',
  DECKS: '/decks',
  QUEUE: '/queue',
  LESSON_SEEN: '/lesson-seen',
  BUNDLE: '/bundle',
  ANSWER: '/answer',
  UNDO: '/undo',
  SESSION_START: '/session',
  SESSION_END: '/session/:id/end'
} as const

export const SYNC_ROUTES = {
  MUTATIONS: '/mutations',
  STATE: '/state'
} as const

export const PROGRESS_ROUTES = {
  SUMMARY: '/',
  DAILY: '/daily',
  STREAK: '/streak',
  FORECAST: '/forecast',
  READINESS: '/readiness/:levelCode',
  KNOWN_KANJI: '/known-kanji'
} as const

export const DICTIONARY_ROUTES = {
  SEARCH: '/search'
} as const

export const NOTIFICATION_ROUTES = {
  /** The reader's IANA timezone, detected by the browser. */
  TIMEZONE: '/timezone',
  SUBSCRIBE: '/push',
  UNSUBSCRIBE: '/push/:endpointId',
  VAPID_KEY: '/push/vapid-key',
  PREFERENCES: '/preferences',
  RUN_REMINDERS: '/run-reminders'
} as const

export const REVIEW_QUEUE_ROUTES = {
  LIST: '/',
  GET_BY_ID: '/:id',
  CLAIM: '/:id/claim',
  APPROVE: '/:id/approve',
  BULK_APPROVE: '/bulk/approve',
  BULK_REJECT: '/bulk/reject',
  REJECT: '/:id/reject'
} as const

export const IMPORT_ROUTES = {
  LIST_RUNS: '/runs',
  GET_RUN: '/runs/:id',
  TRIGGER: '/runs',
  CONFLICTS: '/conflicts',
  RESOLVE_CONFLICT: '/conflicts/:id'
} as const

export const INVITE_ROUTES = {
  /** Public: tells the signup page whether a code is required. */
  SIGNUP_MODE: '/signup-mode',
  /** Public: claim a code for an email before creating the account. */
  RESERVE: '/reserve',
  LIST: '/',
  CREATE: '/',
  REVOKE: '/:id/revoke'
} as const

export const UPLOAD_ROUTES = {
  IMAGEKIT_AUTH: '/imagekit-auth'
} as const

export const ADMIN_ROUTES = {
  DASHBOARD: '/dashboard'
} as const

// better-auth mounts its own handler; the effective base is /api/auth.
export const AUTH_ROUTES = {
  HANDLER: '/api/auth'
} as const

// ---------------------------------------------------------------------------
// Fully-compiled client endpoints. Static → string, parameterised → function.
// ---------------------------------------------------------------------------

export const API_ENDPOINTS = {
  USERS: {
    ME: `${ROUTE_BASE_PATHS.USERS}${USER_ROUTES.ME}`,
    UPDATE_ME: `${ROUTE_BASE_PATHS.USERS}${USER_ROUTES.UPDATE_ME}`,
    SETTINGS: `${ROUTE_BASE_PATHS.USERS}${USER_ROUTES.SETTINGS}`,
    UPDATE_SETTINGS: `${ROUTE_BASE_PATHS.USERS}${USER_ROUTES.UPDATE_SETTINGS}`
  },

  LANGUAGES: {
    LIST: ROUTE_BASE_PATHS.LANGUAGES,
    GET_BY_CODE: (code: string) => `${ROUTE_BASE_PATHS.LANGUAGES}${LANGUAGE_ROUTES.GET_BY_CODE.replace(':code', code)}`,
    LEVELS: (code: string) => `${ROUTE_BASE_PATHS.LANGUAGES}${LANGUAGE_ROUTES.LEVELS.replace(':code', code)}`
  },

  KANA: {
    LIST: ROUTE_BASE_PATHS.KANA,
    GET_BY_CHARACTER: (character: string) =>
      `${ROUTE_BASE_PATHS.KANA}${KANA_ROUTES.GET_BY_CHARACTER.replace(':character', encodeURIComponent(character))}`
  },

  ATTRIBUTION: {
    LIST: ROUTE_BASE_PATHS.ATTRIBUTION
  },
  WRITING: {
    QUEUE: `${ROUTE_BASE_PATHS.WRITING}${WRITING_ROUTES.QUEUE}`,
    GET_BY_CHARACTER: (character: string) =>
      `${ROUTE_BASE_PATHS.WRITING}${WRITING_ROUTES.GET_BY_CHARACTER.replace(':character', encodeURIComponent(character))}`
  },
  KANJI: {
    LIST: ROUTE_BASE_PATHS.KANJI,
    CREATE: ROUTE_BASE_PATHS.KANJI,
    GET_BY_CHARACTER: (character: string) =>
      `${ROUTE_BASE_PATHS.KANJI}${KANJI_ROUTES.GET_BY_CHARACTER.replace(':character', encodeURIComponent(character))}`,
    COMPONENTS: (character: string) =>
      `${ROUTE_BASE_PATHS.KANJI}${KANJI_ROUTES.COMPONENTS.replace(':character', encodeURIComponent(character))}`,
    WORDS: (character: string) =>
      `${ROUTE_BASE_PATHS.KANJI}${KANJI_ROUTES.WORDS.replace(':character', encodeURIComponent(character))}`,
    PHONETIC_SERIES: (character: string) =>
      `${ROUTE_BASE_PATHS.KANJI}${KANJI_ROUTES.PHONETIC_SERIES.replace(':character', encodeURIComponent(character))}`,
    UPDATE: (id: string) => `${ROUTE_BASE_PATHS.KANJI}${KANJI_ROUTES.UPDATE.replace(':id', id)}`,
    DELETE: (id: string) => `${ROUTE_BASE_PATHS.KANJI}${KANJI_ROUTES.DELETE.replace(':id', id)}`
  },

  PHONETICS: {
    LIST: ROUTE_BASE_PATHS.PHONETICS,
    GET_BY_COMPONENT: (component: string) =>
      `${ROUTE_BASE_PATHS.PHONETICS}${PHONETIC_ROUTES.GET_BY_COMPONENT.replace(':component', encodeURIComponent(component))}`
  },

  WORDS: {
    LIST: ROUTE_BASE_PATHS.WORDS,
    CREATE: ROUTE_BASE_PATHS.WORDS,
    GET_BY_ID: (id: string) => `${ROUTE_BASE_PATHS.WORDS}${WORD_ROUTES.GET_BY_ID.replace(':id', id)}`,
    SENTENCES: (id: string) => `${ROUTE_BASE_PATHS.WORDS}${WORD_ROUTES.SENTENCES.replace(':id', id)}`,
    UPDATE: (id: string) => `${ROUTE_BASE_PATHS.WORDS}${WORD_ROUTES.UPDATE.replace(':id', id)}`,
    DELETE: (id: string) => `${ROUTE_BASE_PATHS.WORDS}${WORD_ROUTES.DELETE.replace(':id', id)}`
  },

  LESSONS: {
    LIST: ROUTE_BASE_PATHS.LESSONS,
    GET: (slug: string) => `${ROUTE_BASE_PATHS.LESSONS}/${slug}`,
    COMPLETE: (slug: string) => `${ROUTE_BASE_PATHS.LESSONS}/${slug}/complete`
  },

  GRAMMAR: {
    LIST: ROUTE_BASE_PATHS.GRAMMAR,
    CREATE: ROUTE_BASE_PATHS.GRAMMAR,
    GET_BY_SLUG: (slug: string) => `${ROUTE_BASE_PATHS.GRAMMAR}${GRAMMAR_ROUTES.GET_BY_SLUG.replace(':slug', slug)}`,
    GET_BY_ID: (id: string) => `${ROUTE_BASE_PATHS.GRAMMAR}${GRAMMAR_ROUTES.GET_BY_ID.replace(':id', id)}`,
    RELATED: (slug: string) => `${ROUTE_BASE_PATHS.GRAMMAR}${GRAMMAR_ROUTES.RELATED.replace(':slug', slug)}`,
    UPDATE: (id: string) => `${ROUTE_BASE_PATHS.GRAMMAR}${GRAMMAR_ROUTES.UPDATE.replace(':id', id)}`,
    DELETE: (id: string) => `${ROUTE_BASE_PATHS.GRAMMAR}${GRAMMAR_ROUTES.DELETE.replace(':id', id)}`,
    PUBLISH: (id: string) => `${ROUTE_BASE_PATHS.GRAMMAR}${GRAMMAR_ROUTES.PUBLISH.replace(':id', id)}`
  },

  SENTENCES: {
    LIST: ROUTE_BASE_PATHS.SENTENCES,
    CREATE: ROUTE_BASE_PATHS.SENTENCES,
    GET_BY_ID: (id: string) => `${ROUTE_BASE_PATHS.SENTENCES}${SENTENCE_ROUTES.GET_BY_ID.replace(':id', id)}`,
    UPDATE: (id: string) => `${ROUTE_BASE_PATHS.SENTENCES}${SENTENCE_ROUTES.UPDATE.replace(':id', id)}`,
    DELETE: (id: string) => `${ROUTE_BASE_PATHS.SENTENCES}${SENTENCE_ROUTES.DELETE.replace(':id', id)}`
  },

  DIALOGUES: {
    LIST: ROUTE_BASE_PATHS.DIALOGUES,
    GET_BY_CODE: (code: string) => `${ROUTE_BASE_PATHS.DIALOGUES}/${encodeURIComponent(code)}`
  },
  STUDY: {
    DECKS: `${ROUTE_BASE_PATHS.STUDY}${STUDY_ROUTES.DECKS}`,
    QUEUE: `${ROUTE_BASE_PATHS.STUDY}${STUDY_ROUTES.QUEUE}`,
    LESSON_SEEN: `${ROUTE_BASE_PATHS.STUDY}${STUDY_ROUTES.LESSON_SEEN}`,
    DUE: `${ROUTE_BASE_PATHS.STUDY}${STUDY_ROUTES.DUE}`,
    COURSE: `${ROUTE_BASE_PATHS.STUDY}${STUDY_ROUTES.COURSE}`,
    BUNDLE: `${ROUTE_BASE_PATHS.STUDY}${STUDY_ROUTES.BUNDLE}`,
    ANSWER: `${ROUTE_BASE_PATHS.STUDY}${STUDY_ROUTES.ANSWER}`,
    UNDO: `${ROUTE_BASE_PATHS.STUDY}${STUDY_ROUTES.UNDO}`,
    SESSION_START: `${ROUTE_BASE_PATHS.STUDY}${STUDY_ROUTES.SESSION_START}`,
    SESSION_END: (id: string) => `${ROUTE_BASE_PATHS.STUDY}${STUDY_ROUTES.SESSION_END.replace(':id', id)}`
  },

  SYNC: {
    MUTATIONS: `${ROUTE_BASE_PATHS.SYNC}${SYNC_ROUTES.MUTATIONS}`,
    STATE: `${ROUTE_BASE_PATHS.SYNC}${SYNC_ROUTES.STATE}`
  },

  PROGRESS: {
    SUMMARY: ROUTE_BASE_PATHS.PROGRESS,
    DAILY: `${ROUTE_BASE_PATHS.PROGRESS}${PROGRESS_ROUTES.DAILY}`,
    STREAK: `${ROUTE_BASE_PATHS.PROGRESS}${PROGRESS_ROUTES.STREAK}`,
    FORECAST: `${ROUTE_BASE_PATHS.PROGRESS}${PROGRESS_ROUTES.FORECAST}`,
    READINESS: (levelCode: string) =>
      `${ROUTE_BASE_PATHS.PROGRESS}${PROGRESS_ROUTES.READINESS.replace(':levelCode', levelCode)}`,
    KNOWN_KANJI: `${ROUTE_BASE_PATHS.PROGRESS}${PROGRESS_ROUTES.KNOWN_KANJI}`
  },

  DICTIONARY: {
    SEARCH: `${ROUTE_BASE_PATHS.DICTIONARY}${DICTIONARY_ROUTES.SEARCH}`
  },

  NOTIFICATIONS: {
    SUBSCRIBE: `${ROUTE_BASE_PATHS.NOTIFICATIONS}${NOTIFICATION_ROUTES.SUBSCRIBE}`,
    VAPID_KEY: `${ROUTE_BASE_PATHS.NOTIFICATIONS}${NOTIFICATION_ROUTES.VAPID_KEY}`,
    PREFERENCES: `${ROUTE_BASE_PATHS.NOTIFICATIONS}${NOTIFICATION_ROUTES.PREFERENCES}`,
    RUN_REMINDERS: `${ROUTE_BASE_PATHS.NOTIFICATIONS}${NOTIFICATION_ROUTES.RUN_REMINDERS}`,
    TIMEZONE: `${ROUTE_BASE_PATHS.NOTIFICATIONS}${NOTIFICATION_ROUTES.TIMEZONE}`,
    UNSUBSCRIBE: (endpointId: string) =>
      `${ROUTE_BASE_PATHS.NOTIFICATIONS}${NOTIFICATION_ROUTES.UNSUBSCRIBE.replace(':endpointId', endpointId)}`
  },

  REVIEW_QUEUE: {
    LIST: ROUTE_BASE_PATHS.REVIEW_QUEUE,
    GET_BY_ID: (id: string) => `${ROUTE_BASE_PATHS.REVIEW_QUEUE}${REVIEW_QUEUE_ROUTES.GET_BY_ID.replace(':id', id)}`,
    CLAIM: (id: string) => `${ROUTE_BASE_PATHS.REVIEW_QUEUE}${REVIEW_QUEUE_ROUTES.CLAIM.replace(':id', id)}`,
    BULK_APPROVE: `${ROUTE_BASE_PATHS.REVIEW_QUEUE}${REVIEW_QUEUE_ROUTES.BULK_APPROVE}`,
    BULK_REJECT: `${ROUTE_BASE_PATHS.REVIEW_QUEUE}${REVIEW_QUEUE_ROUTES.BULK_REJECT}`,
    APPROVE: (id: string) => `${ROUTE_BASE_PATHS.REVIEW_QUEUE}${REVIEW_QUEUE_ROUTES.APPROVE.replace(':id', id)}`,
    REJECT: (id: string) => `${ROUTE_BASE_PATHS.REVIEW_QUEUE}${REVIEW_QUEUE_ROUTES.REJECT.replace(':id', id)}`
  },

  IMPORTS: {
    LIST_RUNS: `${ROUTE_BASE_PATHS.IMPORTS}${IMPORT_ROUTES.LIST_RUNS}`,
    TRIGGER: `${ROUTE_BASE_PATHS.IMPORTS}${IMPORT_ROUTES.TRIGGER}`,
    CONFLICTS: `${ROUTE_BASE_PATHS.IMPORTS}${IMPORT_ROUTES.CONFLICTS}`,
    GET_RUN: (id: string) => `${ROUTE_BASE_PATHS.IMPORTS}${IMPORT_ROUTES.GET_RUN.replace(':id', id)}`,
    RESOLVE_CONFLICT: (id: string) =>
      `${ROUTE_BASE_PATHS.IMPORTS}${IMPORT_ROUTES.RESOLVE_CONFLICT.replace(':id', id)}`
  },

  INVITES: {
    SIGNUP_MODE: `${ROUTE_BASE_PATHS.INVITES}${INVITE_ROUTES.SIGNUP_MODE}`,
    RESERVE: `${ROUTE_BASE_PATHS.INVITES}${INVITE_ROUTES.RESERVE}`,
    LIST: ROUTE_BASE_PATHS.INVITES,
    CREATE: ROUTE_BASE_PATHS.INVITES,
    REVOKE: (id: string) => `${ROUTE_BASE_PATHS.INVITES}${INVITE_ROUTES.REVOKE.replace(':id', id)}`
  },

  UPLOADS: {
    IMAGEKIT_AUTH: `${ROUTE_BASE_PATHS.UPLOADS}${UPLOAD_ROUTES.IMAGEKIT_AUTH}`
  },

  ADMIN: {
    DASHBOARD: `${ROUTE_BASE_PATHS.ADMIN}${ADMIN_ROUTES.DASHBOARD}`
  }
} as const

/**
 * How a writing-system lesson's slug begins.
 *
 * Shared because both sides test for it: the service dispatches on it and the
 * list suppresses the "short" marker for it. Two copies of a magic string is
 * one copy too many.
 */
export const KANA_LESSON_PREFIX = 'kana-'
