import { describe, expect, it } from 'vitest'

import { isBotUserAgent } from './bots.js'

describe('isBotUserAgent', () => {
  it('catches search engine crawlers', () => {
    for (const ua of [
      'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
      'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)',
      'Mozilla/5.0 (compatible; DuckDuckBot-Https/1.1; https://duckduckgo.com/duckduckbot)',
      'Mozilla/5.0 (compatible; Baiduspider/2.0; +http://www.baidu.com/search/spider.html)',
      'Mozilla/5.0 (compatible; YandexBot/3.0; +http://yandex.com/bots)'
    ])
      expect(isBotUserAgent(ua), ua).toBe(true)
  })

  it('catches AI crawlers', () => {
    for (const ua of [
      'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot',
      'Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)',
      'Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)',
      'CCBot/2.0 (https://commoncrawl.org/faq/)',
      'Mozilla/5.0 (compatible; Bytespider; spider-feedback@bytedance.com)',
      'meta-externalagent/1.1',
      'Mozilla/5.0 (compatible; anthropic-ai/1.0)'
    ])
      expect(isBotUserAgent(ua), ua).toBe(true)
  })

  it('catches social and link-preview scrapers', () => {
    for (const ua of [
      'facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)',
      'Twitterbot/1.0',
      'LinkedInBot/1.0 (compatible; Mozilla/5.0; Jakarta Commons-HttpClient/3.1)',
      'Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)',
      'WhatsApp/2.19.81 A'
    ])
      expect(isBotUserAgent(ua), ua).toBe(true)
  })

  it('catches scripts, HTTP clients and headless browsers', () => {
    for (const ua of [
      'curl/8.4.0',
      'Wget/1.21.3',
      'python-requests/2.31.0',
      'Go-http-client/2.0',
      'axios/1.6.2',
      'node-fetch/1.0',
      'PostmanRuntime/7.36.0',
      'Scrapy/2.11.0 (+https://scrapy.org)',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/120.0.0.0 Safari/537.36'
    ])
      expect(isBotUserAgent(ua), ua).toBe(true)
  })

  it('treats a missing or blank agent as a bot', () => {
    // Every real browser sends one; the SPA cannot POST without it.
    expect(isBotUserAgent(undefined)).toBe(true)
    expect(isBotUserAgent(null)).toBe(true)
    expect(isBotUserAgent('')).toBe(true)
    expect(isBotUserAgent('   ')).toBe(true)
  })

  it('does NOT flag real browsers', () => {
    for (const ua of [
      // Chrome on macOS
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      // Safari on iPhone
      'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
      // Firefox on Windows
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      // Chrome on Android
      'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      // Edge
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
      // Samsung Internet
      'Mozilla/5.0 (Linux; Android 12; SAMSUNG SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/19.0 Chrome/102.0.0.0 Mobile Safari/537.36'
    ])
      expect(isBotUserAgent(ua), ua).toBe(false)
  })

  it('does NOT flag a real phone whose model name ends in "bot"', () => {
    // CUBOT ship Android handsets. A bare /bot/ substring match would drop these
    // readers silently, which is why the generic `bot` token is boundary-guarded.
    for (const ua of [
      'Mozilla/5.0 (Linux; Android 10; CUBOT_X30) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.101 Mobile Safari/537.36',
      'Mozilla/5.0 (Linux; Android 9; CUBOT KING KONG 3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3809.111 Mobile Safari/537.36'
    ])
      expect(isBotUserAgent(ua), ua).toBe(false)
  })

  it('does NOT flag search-brand browsers that real people read in', () => {
    // Each of these brands ships a browser AND a crawler. Matching the brand
    // would drop the reader; only the crawler token should match.
    for (const ua of [
      // DuckDuckGo's browser app (its crawler is DuckDuckBot)
      'Mozilla/5.0 (Linux; Android 13; SM-S901B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile DuckDuckGo/5 Safari/537.36',
      // Naver's in-app browser (its crawler is Yeti)
      'Mozilla/5.0 (Linux; Android 12; SM-G991N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Mobile Safari/537.36 NAVER(inapp; search; 1000; 12.4.5)',
      // Sogou's mobile browser (its crawler says "Sogou web spider")
      'Mozilla/5.0 (Linux; Android 11) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/89.0.4389.72 Mobile Safari/537.36 SogouMobileBrowser/5.28.3'
    ])
      expect(isBotUserAgent(ua), ua).toBe(false)
  })

  it('still catches those brands\' actual crawlers', () => {
    for (const ua of [
      'Mozilla/5.0 (compatible; DuckDuckBot-Https/1.1; https://duckduckgo.com/duckduckbot)',
      'Mozilla/5.0 (compatible; Yeti/1.1; +https://naver.me/spd)',
      'Sogou web spider/4.0(+http://www.sogou.com/docs/help/webmasters.htm#07)'
    ])
      expect(isBotUserAgent(ua), ua).toBe(true)
  })

  it('catches a standalone bot token', () => {
    expect(isBotUserAgent('bot/1.0')).toBe(true)
    expect(isBotUserAgent('Mozilla/5.0 (compatible; bot)')).toBe(true)
  })
})
