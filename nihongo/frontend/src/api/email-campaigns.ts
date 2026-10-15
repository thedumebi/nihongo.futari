import type { EmailCampaignInput, EmailCampaignList, EmailCampaignView, EmailPreview } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

export async function listCampaigns(): Promise<EmailCampaignList> {
  const { data } = await client.get<EmailCampaignList>(API_ENDPOINTS.EMAIL_CAMPAIGNS.LIST)
  return data
}

export async function getCampaign(id: string): Promise<EmailCampaignView> {
  const { data } = await client.get<EmailCampaignView>(API_ENDPOINTS.EMAIL_CAMPAIGNS.GET(id))
  return data
}

export async function createCampaign(input: EmailCampaignInput): Promise<EmailCampaignView> {
  const { data } = await client.post<EmailCampaignView>(API_ENDPOINTS.EMAIL_CAMPAIGNS.CREATE, input)
  return data
}

export async function updateCampaign(id: string, input: EmailCampaignInput): Promise<EmailCampaignView> {
  const { data } = await client.put<EmailCampaignView>(API_ENDPOINTS.EMAIL_CAMPAIGNS.UPDATE(id), input)
  return data
}

export async function deleteCampaign(id: string): Promise<void> {
  await client.delete(API_ENDPOINTS.EMAIL_CAMPAIGNS.DELETE(id))
}

export async function previewCampaign(input: EmailCampaignInput): Promise<EmailPreview> {
  const { data } = await client.post<EmailPreview>(API_ENDPOINTS.EMAIL_CAMPAIGNS.PREVIEW, input)
  return data
}

export async function sendTestCampaign(id: string): Promise<void> {
  await client.post(API_ENDPOINTS.EMAIL_CAMPAIGNS.TEST(id))
}

export async function sendCampaign(id: string): Promise<EmailCampaignView> {
  const { data } = await client.post<EmailCampaignView>(API_ENDPOINTS.EMAIL_CAMPAIGNS.SEND(id))
  return data
}

export async function unsubscribeProductUpdates(u: string, t: string): Promise<void> {
  await client.post(API_ENDPOINTS.UNSUBSCRIBE.PRODUCT_UPDATES, null, { params: { u, t } })
}
