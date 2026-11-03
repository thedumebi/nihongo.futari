import type { MnemonicList } from '@nihongo/shared/types'

import { API_ENDPOINTS } from '@nihongo/shared/constants'

import client from './client'

/** Published memory aids for a kanji. Invented, never etymology. */
export async function mnemonicsForKanji(character: string, languageCode = 'ja'): Promise<MnemonicList> {
  const { data } = await client.get<MnemonicList>(API_ENDPOINTS.MNEMONICS.FOR_KANJI(character), {
    params: { languageCode }
  })
  return data
}

/** Published memory aids for a word. Invented, never etymology. */
export async function mnemonicsForWord(wordId: string): Promise<MnemonicList> {
  const { data } = await client.get<MnemonicList>(API_ENDPOINTS.MNEMONICS.FOR_WORD(wordId))
  return data
}
