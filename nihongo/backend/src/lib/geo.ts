import type { CountryResponse, Reader } from 'maxmind'

import { pino } from '@nihongo/shared'
import env from '@nihongo/shared/env'
import { GeoIpDbName, open as openGeoDb } from 'geolite2-redist'
import maxmind from 'maxmind'

import { isPublicIp } from './ip.js'
import { registerShutdownHook } from './shutdown.js'

// Offline IP -> country lookup, backed by MaxMind's GeoLite2-Country database
// (redistributed keyless by geolite2-redist). The .mmdb is baked into the image
// at build time and read in-process, so a lookup is an in-memory tree walk: no
// network call per view, and the visitor's IP never leaves the server.
//
// geolite2-redist keeps a background auto-updater running (a licence
// requirement) that refreshes the file periodically; the shutdown hook stops it
// cleanly. If that updater can't reach its mirror, the baked file keeps serving.
//
// The pure IP guards live in ./ip.ts; this module is the reader lifecycle.

// maxmind's reader is synchronous once open; only opening is async. WrappedReader
// adds close() (which also stops the auto-updater).
type CountryReader = Reader<CountryResponse> & { close: () => void }

let readerPromise: Promise<CountryReader> | null = null

function openReader(): Promise<CountryReader> {
  return openGeoDb(
    GeoIpDbName.Country,
    (path: string) => maxmind.open<CountryResponse>(path),
    env.GEOLITE_DB_DIR
  )
    .then((reader): CountryReader => {
      registerShutdownHook('geolite2-country-reader', async () => reader.close())
      return reader as CountryReader
    })
    .catch((err: unknown) => {
      // Reset so a later call can retry (e.g. the DB downloads after startup).
      readerPromise = null
      pino.error({ err }, '[geo] failed to open GeoLite2 country database; lookups return null')
      throw err
    })
}

function getReader(): Promise<CountryReader> {
  if (!readerPromise)
    readerPromise = openReader()
  return readerPromise
}

// Open the database at startup so the first visitor doesn't pay the open cost
// and a broken/missing DB surfaces in the logs immediately. Never throws.
export function initGeo(): void {
  void getReader().catch(() => { /* already logged in openReader */ })
}

// Resolve an IP to an ISO 3166-1 alpha-2 country code, or null when it can't be
// determined (private/invalid IP, DB miss, or any error). Never throws — a geo
// failure must not disturb the view-recording path that calls it.
export async function lookupCountry(ip: string | null | undefined): Promise<string | null> {
  if (!isPublicIp(ip))
    return null
  try {
    const reader = await getReader()
    const result = reader.get(ip!)
    return result?.country?.iso_code ?? null
  } catch {
    return null
  }
}
