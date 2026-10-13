import type { CrosswordPuzzle, CrosswordQuery, CrosswordResultInput, CrosswordResultResponse } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

/** A crossword: the puzzle of the day, or a new one from the words chosen. */
export async function getCrossword(query: CrosswordQuery): Promise<CrosswordPuzzle> {
  const { data } = await client.get<CrosswordPuzzle>(API_ENDPOINTS.CROSSWORD.GET, { params: query })
  return data
}

/** Record a finished puzzle. */
export async function saveCrosswordResult(input: CrosswordResultInput, languageCode = 'ja'): Promise<CrosswordResultResponse> {
  const { data } = await client.post<CrosswordResultResponse>(API_ENDPOINTS.CROSSWORD.RESULT, input, { params: { languageCode } })
  return data
}
