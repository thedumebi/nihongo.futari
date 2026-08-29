// Known non-human user-agents. Anything matching here must never be recorded as
// a view (see articles.handlers.ts `recordView`).
//
// Why this exists on top of nginx: the `$prerender_bot` map in
// nihongo/frontend/nginx.conf answers a DIFFERENT question, "who gets server-rendered
// HTML instead of the SPA?". This answers "who is not a person?". The two lists
// overlap but are not the same, and nginx only guards the SPA route: a client
// that runs JS with a browser-like agent, or one that POSTs the view endpoint
// directly, never passes through that map at all.
//
// Deliberately an explicit list rather than a bare /bot/ substring match. "bot"
// as a substring also matches real phones (CUBOT builds an Android handset), and
// silently dropping a real reader's view is worse than missing a novel crawler.
// The standalone `bot` token below is boundary-guarded for the same reason.
const BOT_PATTERNS = [
  // Search engines. Match the CRAWLER token, never the brand: DuckDuckGo, Naver
  // and Sogou all ship real browsers that real people read articles in, and
  // their crawlers announce themselves as DuckDuckBot / Yeti / "Sogou web spider".
  'googlebot',
  'google-inspectiontool',
  'storebot-google',
  'bingbot',
  'bingpreview',
  'slurp',
  'duckduckbot',
  'baiduspider',
  'yandexbot',
  'yandex\\.com',
  'yeti/',
  'exabot',
  'ia_archiver',
  'applebot',
  'qwantify',
  'seznambot',
  'petalbot',
  'coccocbot',

  // AI crawlers and assistants
  'gptbot',
  'chatgpt-user',
  'oai-searchbot',
  'openai',
  'claudebot',
  'claude-web',
  'claude-user',
  'claude-searchbot',
  'anthropic-ai',
  'perplexitybot',
  'perplexity-user',
  'ccbot',
  'google-extended',
  // (Applebot-Extended, Apple's AI-training agent, is already caught by 'applebot')
  'bytespider',
  'amazonbot',
  'meta-externalagent',
  'meta-externalfetcher',
  'facebookbot',
  'cohere-ai',
  'cohere-training-data-crawler',
  'diffbot',
  'omgili', // also catches omgilibot
  'timpibot',
  'youbot',
  'ai2bot',
  'imagesiftbot',
  'firecrawl',

  // Social / link-preview scrapers
  'facebookexternalhit',
  'facebot',
  'twitterbot',
  'linkedinbot',
  'slackbot',
  'slack-imgproxy',
  'whatsapp',
  'telegrambot',
  'discordbot',
  'pinterest',
  'redditbot',
  'skypeuripreview',
  'vkshare',
  'embedly',
  'iframely',
  'nuzzel',
  'mastodon',
  'bluesky',
  'flipboard',
  'tumblr',

  // SEO / monitoring / analytics
  'ahrefsbot',
  'semrushbot',
  'mj12bot',
  'dotbot',
  'rogerbot',
  'screaming frog',
  'dataforseo',
  'serpstat',
  'sitebulb',
  'blexbot',
  'linkdexbot',
  'chrome-lighthouse',
  'pingdom',
  'uptimerobot',
  'statuscake',
  'gtmetrix',
  'pagespeed',
  'newrelicpinger',
  'better uptime',
  'site24x7',

  // Headless browsers and automation
  'headlesschrome',
  'phantomjs',
  'puppeteer',
  'playwright',
  'selenium',
  'webdriver',
  'cypress',
  'electron',

  // Plain HTTP clients and libraries
  'curl',
  'wget',
  'python-requests',
  'python-urllib',
  'aiohttp',
  'httpx',
  'httpie',
  'axios',
  'node-fetch',
  'got \\(',
  'undici',
  'go-http-client',
  'okhttp',
  'java/',
  'jakarta',
  'libwww-perl',
  'lwp::simple',
  'ruby',
  'guzzlehttp',
  'php',
  'apache-httpclient',
  'restsharp',
  'postmanruntime',
  'insomnia',
  'scrapy',

  // Generic tokens. `bot` is boundary-guarded (see the note above); the rest are
  // distinctive enough to match as substrings.
  'crawler',
  'crawling',
  'spider',
  'scraper',
  'harvest',
  'feedfetcher',
  'archive\\.org',
  'headless',
  '(?<![a-z])bot(?![a-z])'
]

const BOT_UA = new RegExp(BOT_PATTERNS.join('|'), 'i')

/**
 * True when the user-agent is a bot, a script, or absent.
 *
 * A missing or blank agent counts as a bot: every real browser sends one, and a
 * request reaching the view endpoint without it did not come from the SPA.
 */
export function isBotUserAgent(ua: string | null | undefined): boolean {
  if (!ua || !ua.trim())
    return true
  return BOT_UA.test(ua)
}
