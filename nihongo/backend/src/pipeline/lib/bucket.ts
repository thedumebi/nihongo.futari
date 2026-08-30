import type { Buffer } from 'node:buffer'

import { ListObjectsV2Command, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import env from '@nihongo/shared/env'

/**
 * The assets bucket, as the pipeline sees it.
 *
 * Media used to live in `frontend/public` and the generators asked the
 * filesystem whether a clip existed. Once the trees came off disk — 103 MB of
 * audio and growing — that question started returning "no" for every file that
 * was in fact already generated and uploaded, so a re-run would have
 * regenerated all eleven thousand clips and re-uploaded them over the top.
 *
 * The bucket is the source of truth, so the bucket is what gets asked. This is
 * the one place that knows how to reach it; every pipeline script goes through
 * here rather than building its own client.
 */

/** A run may ask about several prefixes; the client is worth keeping. */
let cached: S3Client | null = null

export function bucket(): S3Client {
  if (cached)
    return cached

  const missing = (['R2_ENDPOINT', 'R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'] as const)
    .filter(key => !env[key])
  if (missing.length > 0)
    throw new Error(`Missing ${missing.join(', ')} — see DEPLOY.md for the bucket setup.`)

  cached = new S3Client({
    // R2 ignores the region but the SDK insists on one.
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!
    }
  })
  return cached
}

export const BUCKET_NAME = (): string => env.R2_BUCKET!

/**
 * Every key under a prefix, with its size.
 *
 * ONE listing rather than a HEAD per file. The difference is not cosmetic: at
 * eleven thousand clips, a HEAD each is eleven thousand round trips and takes
 * the better part of an hour, while a paged listing is a few dozen and takes
 * seconds. Callers hold the result and ask it about each candidate.
 */
export async function listKeys(prefix: string): Promise<Map<string, number>> {
  const s3 = bucket()
  const out = new Map<string, number>()
  let token: string | undefined

  do {
    const page = await s3.send(new ListObjectsV2Command({
      Bucket: BUCKET_NAME(),
      Prefix: prefix,
      ContinuationToken: token
    }))
    for (const object of page.Contents ?? []) {
      if (object.Key)
        out.set(object.Key, object.Size ?? 0)
    }
    // `IsTruncated` rather than the token being present: a final page carries
    // no token, and treating that as "keep going" loops forever.
    token = page.IsTruncated ? page.NextContinuationToken : undefined
  } while (token)

  return out
}

/**
 * Store one object.
 *
 * A year, immutable: every key is derived from a stable id, so a given key's
 * contents never change. Regenerating a word's audio reuses its ent_seq, so if
 * a clip ever has to be replaced, bump the key rather than the cache header.
 */
export async function putAsset(key: string, body: Buffer, contentType: string): Promise<void> {
  await bucket().send(new PutObjectCommand({
    Bucket: BUCKET_NAME(),
    Key: key,
    Body: body,
    ContentType: contentType,
    CacheControl: 'public, max-age=31536000, immutable'
  }))
}

/** What each tree holds, so a caller does not have to remember. */
export const CONTENT_TYPES: Record<string, string> = {
  audio: 'audio/mp4',
  images: 'image/svg+xml'
}
