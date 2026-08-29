export const ROUTES = {
  HOME: '/',

  // Study — the daily loop
  /** The course: where you are and what comes next. */
  COURSE: '/course',
  STUDY: '/study',
  /** Scripted conversations, browsable rather than only scheduled. */
  CONVERSATIONS: '/conversations',
  CONVERSATION_DETAIL: (code: string) => `/conversations/${encodeURIComponent(code)}`,
  STUDY_SESSION: '/study/session',
  /** The list of what is due, as opposed to a session that hands it over one card at a time. */
  DUE: '/due',
  PROGRESS: '/progress',

  // Browse / reference, decoupled from the study path
  DICTIONARY: '/dictionary',
  KANJI: '/kanji',
  KANJI_DETAIL: (character: string) => `/kanji/${encodeURIComponent(character)}`,
  WORDS: '/words',
  WORD_DETAIL: (id: string) => `/words/${id}`,
  GRAMMAR: '/grammar',
  GRAMMAR_DETAIL: (slug: string) => `/grammar/${slug}`,
  WRITING: '/writing',
  SOUND_SERIES: '/sound-series',
  SOUND_SERIES_DETAIL: (character: string) => `/sound-series/${encodeURIComponent(character)}`,

  // Account
  LOGIN: '/login',
  SIGNUP: '/signup',
  SETTINGS: '/settings',

  // Attribution — a CC BY-SA obligation, not a nicety. Linked from the footer.
  ATTRIBUTION: '/attribution',

  // Admin
  ADMIN: '/admin',
  ADMIN_INVITES: '/admin/invites',
  ADMIN_REVIEW_QUEUE: '/admin/review-queue',
  ADMIN_GRAMMAR: '/admin/grammar',
  ADMIN_GRAMMAR_EDIT: (id: string) => `/admin/grammar/${id}/edit`,
  ADMIN_WORDS: '/admin/words',
  ADMIN_IMPORTS: '/admin/imports',
  ADMIN_USERS: '/admin/users',

  NOT_FOUND: '/:catchAll(.*)'
} as const
