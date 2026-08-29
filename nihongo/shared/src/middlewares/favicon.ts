import type { MiddlewareHandler } from 'hono'

export function serveEmojiFavicon(emoji: string): MiddlewareHandler {
  return async (ctx, next) => {
    if (ctx.req.path === '/favicon.ico') {
      ctx.res.headers.set('content-type', 'image/svg+xml')
      return ctx.body(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" x="-0.1em" font-size="90">${emoji}</text></svg>`)
    }
    return next()
  }
}
