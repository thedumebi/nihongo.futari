import { describe, expect, it } from 'vitest'

import { pushDeviceLabel } from './index.js'

describe('pushDeviceLabel', () => {
  it('tells the iPhone Home Screen app from a Safari tab', () => {
    expect(pushDeviceLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148')).toBe('iPhone (Home Screen app)')
    expect(pushDeviceLabel('Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.6 Mobile/15E148 Safari/604.1')).toBe('iPhone (Safari)')
  })

  it('names the browser and system on a computer', () => {
    expect(pushDeviceLabel('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36')).toBe('Chrome on Mac')
    expect(pushDeviceLabel('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0.0.0 Safari/537.36 Edg/141.0.0.0')).toBe('Edge on Windows')
    expect(pushDeviceLabel('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Safari/605.1.15')).toBe('Safari on Mac')
  })

  it('says only "A device" for a subscription saved before browsers were recorded', () => {
    expect(pushDeviceLabel(null)).toBe('A device')
  })
})
