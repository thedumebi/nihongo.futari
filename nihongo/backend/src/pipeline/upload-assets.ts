/* eslint-disable no-console */
import { HeadObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import env from '@nihongo/shared/env'
import { readdir, readFile, stat } from 'node:fs/promises'
import path from 'node:path'

/**
 * Push generated media to the assets bucket.
 *
 * The audio is ~33 MB of `say` output and the SVGs another 252 KB, and both
 * were baked into the frontend image — carried by every build and shipped
 * again on every deploy. This puts them in object storage instead, where
 * Cloudflare charges nothing for egress.
 *
 * Deliberately a bulk server-side sync rather than the browser-push ImageKit
 * flow the sibling repo uses: these files are produced by a CLI on a laptop,
 * not pasted into an editor by an admin.
 *
 * Idempotent. An object whose size already matches is skipped, so re-running
 * after generating more audio only uploads what is new. Size is a weak
 * comparison — a file edited to the same length would not re-upload — but
 * these are generated artefacts that are replaced wholesale, never edited.
 *
 *   pnpm -C nihongo/backend upload:assets            # everything
 *   pnpm -C nihongo/backend upload:assets audio      # just one tree
 */

const PUBLIC = path.resolve(process.cwd(), '../frontend/public')

/**
 * How many objects to move at once.
 *
 * There are thousands of small files and each round trip is mostly latency, so
 * one at a time turns a two-minute sync into an hour. Twelve is comfortably
 * inside R2's limits and keeps the laptop's uplink busy without saturating it.
 */
const CONCURRENCY = 12

/** Which trees to sync, and the content type each carries. */
const TREES: Record<string, string> = {
  audio: 'audio/mp4',
  images: 'image/svg+xml'
}

interface Plan {
  key: string
  file: string
  size: number
  contentType: string
}

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const out: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await walk(full))
    // Ignore the noise a Mac leaves in every directory it has ever opened.
    else if (entry.isFile() && !entry.name.startsWith('.'))
      out.push(full)
  }
  return out
}

function client(): S3Client {
  const missing = (['R2_ENDPOINT', 'R2_BUCKET', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY'] as const)
    .filter(key => !env[key])
  if (missing.length > 0)
    throw new Error(`Missing ${missing.join(', ')} — see DEPLOY.md for the bucket setup.`)

  return new S3Client({
    // R2 ignores the region but the SDK insists on one.
    region: 'auto',
    endpoint: env.R2_ENDPOINT,
    credentials: {
      accessKeyId: env.R2_ACCESS_KEY_ID!,
      secretAccessKey: env.R2_SECRET_ACCESS_KEY!
    }
  })
}

/** Whether the bucket already holds this object at this size. */
async function isCurrent(s3: S3Client, key: string, size: number): Promise<boolean> {
  try {
    const head = await s3.send(new HeadObjectCommand({ Bucket: env.R2_BUCKET, Key: key }))
    return head.ContentLength === size
  } catch {
    // Anything that is not a clean hit — missing, forbidden, transient — is
    // treated as "upload it". A redundant PUT is cheap; a skipped one is a 404
    // in the app.
    return false
  }
}

async function main() {
  const only = process.argv[2]
  const trees = only ? { [only]: TREES[only] } : TREES
  if (only && !TREES[only])
    throw new Error(`Unknown tree "${only}". Known: ${Object.keys(TREES).join(', ')}`)

  const s3 = client()
  const plans: Plan[] = []

  for (const [tree, contentType] of Object.entries(trees)) {
    for (const file of await walk(path.join(PUBLIC, tree))) {
      const { size } = await stat(file)
      // The key mirrors the path the database already stores, minus the
      // leading slash: /audio/words/1234.m4a -> audio/words/1234.m4a
      plans.push({ key: path.relative(PUBLIC, file), file, size, contentType: contentType! })
    }
  }

  console.log(`Found ${plans.length} files locally`)

  let uploaded = 0
  let skipped = 0
  let bytes = 0
  let cursor = 0

  // Workers pull from one shared cursor rather than taking a slice each, so a
  // run of large files does not leave eleven workers idle waiting for one.
  async function worker() {
    for (;;) {
      const plan = plans[cursor++]
      if (!plan)
        return

      if (await isCurrent(s3, plan.key, plan.size)) {
        skipped++
        continue
      }

      await s3.send(new PutObjectCommand({
        Bucket: env.R2_BUCKET,
        Key: plan.key,
        Body: await readFile(plan.file),
        ContentType: plan.contentType,
        // A year, immutable: every filename is derived from a stable id, so a
        // given key's contents never change. Regenerating audio for a word
        // reuses its ent_seq, so bump the key, not the cache header, if a clip
        // ever has to be replaced.
        CacheControl: 'public, max-age=31536000, immutable'
      }))

      uploaded++
      bytes += plan.size
      if (uploaded % 500 === 0)
        console.log(`  ${uploaded} uploaded, ${skipped} already current…`)
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, worker))

  console.log(`\nUploaded ${uploaded} (${(bytes / 1024 / 1024).toFixed(1)} MB)`)
  console.log(`Already current: ${skipped}`)
  if (uploaded > 0)
    console.log(`\nServe them by setting R2_PUBLIC_BASE_URL to the bucket's public URL.`)
}

main().catch((err) => {
  console.error('Failed:', err instanceof Error ? err.message : err)
  process.exitCode = 1
})
