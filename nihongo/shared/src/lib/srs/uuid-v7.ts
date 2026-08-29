/**
 * UUIDv7 — a time-ordered client id for review logs.
 *
 * v4 is random, so a set of logs has no inherent order and replay must fall
 * back to comparing timestamps with the id only as a tiebreak. v7 puts a
 * millisecond timestamp in the high bits, so lexicographic id order IS
 * chronological order — which is exactly what the replay fold wants, and it
 * makes the tiebreak meaningful rather than arbitrary.
 *
 * Layout (RFC 9562): 48 bits of Unix ms, 4 bits version, 12 bits random,
 * 2 bits variant, 62 bits random.
 */
export function uuidv7(now: number = Date.now(), random: () => number = Math.random): string {
  const bytes = new Uint8Array(16)

  // 48-bit big-endian timestamp.
  let ms = Math.floor(now)
  for (let i = 5; i >= 0; i--) {
    bytes[i] = ms & 0xFF
    ms = Math.floor(ms / 256)
  }

  for (let i = 6; i < 16; i++) bytes[i] = Math.floor(random() * 256) & 0xFF

  bytes[6] = (bytes[6]! & 0x0F) | 0x70 // version 7
  bytes[8] = (bytes[8]! & 0x3F) | 0x80 // variant 10

  const hex = [...bytes].map(b => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
