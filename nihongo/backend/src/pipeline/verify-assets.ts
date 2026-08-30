/* eslint-disable no-console */
import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'

import { listKeys } from './lib/bucket.js'

/**
 * Compare what is on disk with what the bucket holds.
 *
 * The point of this is to be run BEFORE deleting a local tree. The bucket is
 * the only copy once the files are gone, and the SVGs in particular are
 * hand-drawn — a missing object is not a re-run of `say`, it is redrawing the
 * picture. So this exists to make "everything is uploaded" something that was
 * checked rather than assumed.
 *
 *   pnpm -C nihongo/backend verify:assets
 *   pnpm -C nihongo/backend verify:assets images
 */

const PUBLIC = path.resolve(process.cwd(), '../frontend/public')

async function walk(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true }).catch(() => [])
  const out: string[] = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...await walk(full))
    else if (entry.isFile() && !entry.name.startsWith('.'))
      out.push(full)
  }
  return out
}

async function main() {
  const only = process.argv[2]
  const trees = only ? [only] : ['audio', 'images']
  let problems = 0

  for (const tree of trees) {
    const remote = await listKeys(`${tree}/`)
    const local = await walk(path.join(PUBLIC, tree))

    const missing: string[] = []
    const differing: string[] = []

    for (const file of local) {
      const key = path.relative(PUBLIC, file)
      const size = remote.get(key)
      if (size === undefined)
        missing.push(key)
      // Size is a weak comparison, but these are generated artefacts replaced
      // wholesale rather than edited, so a length match is a content match in
      // every way that has ever mattered here.
      else if (size !== (await stat(file)).size)
        differing.push(key)
    }

    console.log(`${tree}: ${local.length} local, ${remote.size} in bucket`)
    if (missing.length > 0) {
      console.log(`  NOT UPLOADED (${missing.length}):`)
      for (const key of missing.slice(0, 20))
        console.log(`    ${key}`)
      if (missing.length > 20)
        console.log(`    …and ${missing.length - 20} more`)
    }
    if (differing.length > 0) {
      console.log(`  SIZE DIFFERS (${differing.length}):`)
      for (const key of differing.slice(0, 20))
        console.log(`    ${key}`)
    }
    // Objects the bucket has and disk does not are not a problem — that is the
    // expected state once a tree has been cleared, and is the whole point.
    const extra = remote.size - (local.length - missing.length)
    if (extra > 0)
      console.log(`  ${extra} in bucket only (fine — disk is a staging area)`)
    if (missing.length === 0 && differing.length === 0)
      console.log(`  safe to delete locally: every file is in the bucket`)
    problems += missing.length + differing.length
  }

  if (problems > 0) {
    console.log(`\n${problems} file(s) are not safely in the bucket. Run upload:assets first.`)
    process.exitCode = 1
  }
}

main().catch((err) => {
  console.error('Verification failed:', err)
  process.exitCode = 1
})
