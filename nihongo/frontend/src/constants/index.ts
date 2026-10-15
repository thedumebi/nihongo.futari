export const ROUTES = {
  HOME: '/',

  // Study — the daily loop
  /** The course: where you are and what comes next. */
  COURSE: '/course',
  STUDY: '/study',
  TODAY: '/today',
  WELCOME: '/welcome',
  LEARN: '/study?mode=new',
  REVIEW: '/study?mode=due',
  /** Scripted conversations, browsable rather than only scheduled. */
  CONVERSATIONS: '/conversations',
  CONVERSATION_DETAIL: (code: string) => `/conversations/${encodeURIComponent(code)}`,
  /** Short speeches to read aloud, scrolling like a teleprompter. */
  READ: '/read',
  READING_DETAIL: (code: string) => `/read/${encodeURIComponent(code)}`,
  /** The build-up course: hear the English, say the Japanese. */
  SPEAK: '/speak',
  /** Hands-free, Pimsleur style: hear the English, say the Japanese, over what is shaky. */
  RECALL: '/recall',
  CROSSWORD: '/crossword',
  /** Listening, build-a-kanji, the ghost boss and the crossword, together. */
  GAMES: '/games',
  GAME_LISTENING: '/games/listening',
  GAME_KANJI_BUILD: '/games/kanji-build',
  GAME_GHOST_BOSS: '/games/ghost-boss',
  SPEAK_SESSION: (code: string) => `/speak/${encodeURIComponent(code)}`,
  STUDY_SESSION: '/study/session',
  /** The list of what is due, as opposed to a session that hands it over one card at a time. */
  DUE: '/due',
  PROGRESS: '/progress',
  /** Opt-in, turned on in Settings. `?code=` from a friend's link fills in the add box. */
  FRIENDS: '/friends',
  ACHIEVEMENTS: '/achievements',

  // Browse / reference, decoupled from the study path
  DICTIONARY: '/dictionary',
  KANJI: '/kanji',
  KANJI_DETAIL: (character: string) => `/kanji/${encodeURIComponent(character)}`,
  WORDS: '/words',
  WORD_DETAIL: (id: string) => `/words/${id}`,
  LESSONS: '/lessons',
  LESSON_DETAIL: (slug: string) => `/lessons/${slug}`,
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
  ADMIN_EMAILS: '/admin/emails',
  ADMIN_EMAIL_EDIT: (id: string) => `/admin/emails/${id}`,
  UNSUBSCRIBE: '/unsubscribe',
  ADMIN_REVIEW_QUEUE: '/admin/review-queue',
  ADMIN_GRAMMAR: '/admin/grammar',
  ADMIN_GRAMMAR_EDIT: (id: string) => `/admin/grammar/${id}/edit`,
  ADMIN_WORDS: '/admin/words',
  ADMIN_USERS: '/admin/users',

  NOT_FOUND: '/:catchAll(.*)'
} as const
