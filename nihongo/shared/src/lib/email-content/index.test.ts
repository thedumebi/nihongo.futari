import { describe, expect, it } from 'vitest'

import { htmlToText, inlineEmailStyles, personalise, sanitizeEmailHtml } from './index.js'

describe('personalise', () => {
  it('fills in the personal fields, escaping them', () => {
    expect(personalise('<p>Hi {{name}}, open {{ appUrl }}</p>', { name: 'Ada <3', appUrl: 'https://go.example' }))
      .toBe('<p>Hi Ada &lt;3, open https://go.example</p>')
  })

  it('leaves an unknown field as written, so the preview shows it', () => {
    expect(personalise('{{nmae}}', { name: 'Ada', appUrl: '' })).toBe('{{nmae}}')
  })
})

describe('sanitizeEmailHtml', () => {
  it('removes scripts, embeds, event handlers and javascript: links', () => {
    expect(sanitizeEmailHtml('<p onclick="x()">Hi<script>alert(1)</script></p><iframe src="x"></iframe><a href="javascript:evil()">a</a>'))
      .toBe('<p>Hi</p><a href="#">a</a>')
  })

  it('keeps ordinary formatting and links', () => {
    const html = '<h2>New</h2><p><strong>Big</strong> <a href="https://go.example">news</a></p><ul><li>One</li></ul>'
    expect(sanitizeEmailHtml(html)).toBe(html)
  })
})

describe('htmlToText', () => {
  it('turns blocks into paragraphs, items into lines, and keeps link addresses', () => {
    expect(htmlToText('<h2>What&#39;s new</h2><p>Read <a href="https://go.example/today">Today</a>&nbsp;now.</p><ul><li>One</li><li>Two</li></ul>'))
      .toBe('What\'s new\n\nRead Today (https://go.example/today) now.\n\n- One\n- Two')
  })
})

describe('inlineEmailStyles', () => {
  it('writes the house style onto plain tags', () => {
    expect(inlineEmailStyles('<p>Hi</p>')).toBe('<p style="margin: 0 0 16px;">Hi</p>')
  })

  it('leaves a tag that already has its own style alone', () => {
    const button = '<a href="https://go.example" style="background: #2f4858; color: #fff;">Open go</a>'
    expect(inlineEmailStyles(button)).toBe(button)
  })
})

describe('inlineEmailStyles on the editor\'s lists', () => {
  it('takes the paragraph out of each list item, so the list is not double-spaced', () => {
    expect(inlineEmailStyles('<ul><li><p>One</p></li></ul>'))
      .toBe('<ul style="margin: 0 0 16px; padding-left: 24px;"><li style="margin: 0 0 6px;">One</li></ul>')
  })
})
