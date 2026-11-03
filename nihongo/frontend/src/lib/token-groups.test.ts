import { describe, expect, it } from 'vitest'

import { tokenGroups } from './token-groups'

describe('tokenGroups', () => {
  it('keeps each word on its own when there is no punctuation', () => {
    expect(tokenGroups(['これ', 'は', 'ペン'])).toEqual([[0], [1], [2]])
  })

  it('carries a full stop and a comma with the word before them', () => {
    expect(tokenGroups(['はい', '、', 'そう', 'です', '。'])).toEqual([[0, 1], [2], [3, 4]])
  })

  it('carries an opening bracket with the word after it, and the closing one with the word before', () => {
    expect(tokenGroups(['彼', 'は', '「', 'はい', '」', 'と', '言った', '。'])).toEqual([[0], [1], [2, 3, 4], [5], [6, 7]])
  })

  it('carries a run of closing marks together', () => {
    expect(tokenGroups(['本当', '？', '」'])).toEqual([[0, 1, 2]])
  })

  it('leaves a line that opens with a closing mark as its own group', () => {
    expect(tokenGroups(['。', 'はい'])).toEqual([[0], [1]])
  })

  it('returns nothing for no tokens', () => {
    expect(tokenGroups([])).toEqual([])
  })
})
