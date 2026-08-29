import env from '@nihongo/shared/env'

/**
 * Where media is served from.
 *
 * The database stores ROOT-RELATIVE paths — `/audio/words/1234.m4a` — written
 * by the importers and the kana seed. This turns one into a URL at the moment
 * it is served.
 *
 * Storing the path rather than an absolute URL is what makes the bucket
 * movable: changing host is an env change and a redeploy, not a migration
 * across four importers and a seed file.
 *
 * The bucket is the ONLY source. Neither tree is in the frontend image any
 * more (`.dockerignore` excludes both), so there is no origin fallback to fall
 * back to — development reads from the bucket exactly as production does, and
 * the two cannot drift. An unset base is therefore a misconfiguration rather
 * than a mode, which is what the check below is for.
 */
const base = (env.R2_PUBLIC_BASE_URL ?? '').replace(/\/$/, '')

if (!base) {
  const message = 'R2_PUBLIC_BASE_URL is not set — audio and images have no origin to be served from. See DEPLOY.md step 7a.'
  // Fatal in production, where a silent miss means every clip and illustration
  // 404s while the pages around them keep working — the worst kind of failure
  // to notice. Loud but survivable elsewhere, so a test run or a pipeline
  // script that never touches media still starts.
  if (env.NODE_ENV === 'production')
    throw new Error(message)
  console.warn(`[assets] ${message}`)
}

export function assetUrl(path: string): string {
  // Anything already absolute is left alone: a future importer may store a
  // full URL, and rewriting one would corrupt it.
  if (!base || !path.startsWith('/'))
    return path
  return `${base}${path}`
}

/**
 * The same, for the loosely-typed `exercise_prompts.assets` jsonb.
 *
 * Only string values that look like paths are touched; anything else in the
 * bag — `sentenceId`, the stroke arrays, `viewBox` — passes through untouched.
 */
export function withAssetUrls(assets: Record<string, unknown>): Record<string, unknown> {
  let changed = false
  const out: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(assets)) {
    if (typeof value === 'string' && value.startsWith('/')) {
      const url = assetUrl(value)
      changed ||= url !== value
      out[key] = url
      continue
    }
    out[key] = value
  }

  // Hand back the original object when nothing moved, so the common
  // no-bucket case allocates nothing.
  return changed ? out : assets
}

/**
 * The same again, for the dialogue snapshot's nested lines.
 *
 * `withAssetUrls` only reaches the flat `assets` bag; a conversation carries a
 * clip per turn and per reply, one level further in. Rather than teach the
 * generic walker about prompt shapes, this knows the one shape it has to.
 */
export function withDialogueAudio(prompt: Record<string, unknown>): Record<string, unknown> {
  if (prompt.kind !== 'dialogue' || !Array.isArray(prompt.turns))
    return prompt

  const turns = prompt.turns.map((turn) => {
    if (typeof turn !== 'object' || turn === null)
      return turn
    const t = turn as Record<string, unknown>
    const replies = Array.isArray(t.replies)
      ? t.replies.map((reply) => {
          if (typeof reply !== 'object' || reply === null)
            return reply
          const r = reply as Record<string, unknown>
          return typeof r.audio === 'string' ? { ...r, audio: assetUrl(r.audio) } : r
        })
      : t.replies
    return typeof t.audio === 'string' ? { ...t, audio: assetUrl(t.audio), replies } : { ...t, replies }
  })

  return { ...prompt, turns }
}
