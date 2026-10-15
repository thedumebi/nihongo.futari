import { beforeEach, describe, expect, it, vi } from 'vitest'

// The transport is the boundary: nothing here should reach a mail server.
const sendMail = vi.fn(async () => ({ messageId: 'test' }))
vi.mock('@/helpers/emails.js', () => ({
  sendMail,
  renderTemplate: vi.fn(async () => '<p>rendered</p>')
}))

// The messages read site settings from the environment; none are needed here.
vi.mock('@/env.js', () => ({ default: { EMAIL_FROM: 'go@example.com', EMAIL_FROM_NAME: 'go', FRONTEND_URL: 'https://go.example' } }))

const { default: SendMail } = await import('./index.js')

describe('sendMail.sendCampaign', () => {
  beforeEach(() => sendMail.mockClear())

  it('sends an admin email exactly as the caller rendered it, headers included', async () => {
    const message = {
      to: 'learner@example.com',
      subject: 'What is new in go',
      html: '<p>Hi</p>',
      text: 'Hi',
      headers: { 'List-Unsubscribe': '<https://go.example/api/unsubscribe/product-updates?u=1&t=x>' }
    }
    await SendMail.sendCampaign(message)
    expect(sendMail).toHaveBeenCalledWith(message)
  })
})
