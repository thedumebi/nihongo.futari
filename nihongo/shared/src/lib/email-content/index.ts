/**
 * The body of an admin email: made safe, made personal, and given a plain-text
 * twin.
 *
 * The body comes from the editor, or is pasted in as HTML that was drafted
 * elsewhere. Either way it is wrapped in the branded template, personalised per
 * recipient, and sent with a plain-text part — mail without one looks like
 * spam to filters, and some readers prefer it.
 */

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' }
const escapeHtml = (text: string) => text.replace(/[&<>"']/g, c => ESCAPES[c]!)

/** The personal fields an email may use. */
export interface EmailFields {
  name: string
  appUrl: string
}

/**
 * Fill in {{name}} and {{appUrl}}. Values are escaped — a learner's display
 * name is their own text and must not become markup. Unknown fields are left
 * as written, so a typo shows in the preview instead of vanishing.
 */
export function personalise(html: string, fields: EmailFields): string {
  return html.replace(/\{\{\s*(name|appUrl)\s*\}\}/g, (_, key: keyof EmailFields) => escapeHtml(fields[key]))
}

/**
 * Strip what has no place in an email: scripts, forms, embeds, event handlers
 * and javascript: links. Mail clients drop most of it anyway; removing it here
 * means the preview shows what will actually arrive.
 */
export function sanitizeEmailHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed|form)\b[^>]*>[\s\S]*?<\/\1\s*>/gi, '')
    .replace(/<(script|iframe|object|embed|input|button|form|link|meta)\b[^>]*>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/(href|src)\s*=\s*(["'])\s*javascript:[^"']*\2/gi, '$1="#"')
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: '\'', nbsp: ' ', mdash: '—', ndash: '–', hellip: '…' }

/**
 * The plain-text part, from the HTML body: paragraphs and headings become
 * blank-line-separated blocks, list items become "- " lines, and a link keeps
 * its address beside its text so it can still be followed.
 */
export function htmlToText(html: string): string {
  return html
    .replace(/<a\s[^>]*?href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi, (_, href: string, text: string) => {
      const label = text.replace(/<[^>]+>/g, '').trim()
      return label && label !== href ? `${label} (${href})` : href
    })
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li\b[^>]*>/gi, '\n- ')
    .replace(/<\/(p|h[1-6]|ul|ol|blockquote|div)>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|[a-z]+);/gi, (whole, code: string) => code.startsWith('#')
      ? String.fromCodePoint(Number(code.slice(1)))
      : ENTITIES[code.toLowerCase()] ?? whole)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** House styles, written onto each tag: many mail clients ignore stylesheets. */
const INLINE_STYLES: Record<string, string> = {
  h1: 'margin: 0 0 16px; color: #2f4858; font-size: 24px; line-height: 1.3;',
  h2: 'margin: 24px 0 12px; color: #2f4858; font-size: 20px; line-height: 1.3;',
  h3: 'margin: 20px 0 8px; color: #2f4858; font-size: 17px;',
  p: 'margin: 0 0 16px;',
  a: 'color: #2f4858; text-decoration: underline;',
  ul: 'margin: 0 0 16px; padding-left: 24px;',
  ol: 'margin: 0 0 16px; padding-left: 24px;',
  li: 'margin: 0 0 6px;',
  blockquote: 'margin: 0 0 16px; padding-left: 16px; border-left: 3px solid #d0d7dd; color: #555555;',
  img: 'max-width: 100%; height: auto; border-radius: 8px;',
  hr: 'border: none; border-top: 1px solid #e3e8ec; margin: 24px 0;'
}

/**
 * Give each tag the house style, unless it already has a style of its own —
 * imported HTML that styled a button keeps its button.
 */
export function inlineEmailStyles(html: string): string {
  // The editor puts a paragraph inside every list item; in an email each one
  // would carry a paragraph's gap and the list would read double-spaced.
  const lists = html.replace(/<li([^>]*)>\s*<p[^>]*>([\s\S]*?)<\/p>\s*<\/li>/gi, '<li$1>$2</li>')
  return lists.replace(/<(h[1-3]|p|a|ul|ol|li|blockquote|img|hr)\b([^>]*)>/gi, (whole, tag: string, attrs: string) => {
    if (/\sstyle\s*=/i.test(attrs))
      return whole
    return `<${tag}${attrs} style="${INLINE_STYLES[tag.toLowerCase()]}">`
  })
}
