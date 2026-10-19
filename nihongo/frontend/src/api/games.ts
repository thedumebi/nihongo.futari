import type { GhostBoss, KanjiBuildGame, ListeningGame, VerbFormsGame } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

/** Minimal pairs: hear a word, pick which of two it was. */
export async function getListeningGame(languageCode = 'ja', level?: string): Promise<ListeningGame> {
  const { data } = await client.get<ListeningGame>(API_ENDPOINTS.GAMES.LISTENING, { params: { languageCode, level, size: 10 } })
  return data
}

/** Build kanji from their parts; guess readings from sound families. */
export async function getKanjiBuildGame(languageCode = 'ja', level?: string): Promise<KanjiBuildGame> {
  const { data } = await client.get<KanjiBuildGame>(API_ENDPOINTS.GAMES.KANJI_BUILD, { params: { languageCode, level, size: 9 } })
  return data
}

/** This week's ghost boss. */
export async function getGhostBoss(languageCode = 'ja'): Promise<GhostBoss> {
  const { data } = await client.get<GhostBoss>(API_ENDPOINTS.GAMES.GHOST_BOSS, { params: { languageCode } })
  return data
}

/** Verb forms: the verbs to conjugate and the forms open to the learner. */
export async function getVerbFormsGame(languageCode = 'ja'): Promise<VerbFormsGame> {
  const { data } = await client.get<VerbFormsGame>(API_ENDPOINTS.GAMES.VERB_FORMS, { params: { languageCode, size: 15 } })
  return data
}
