import { pino } from '@nihongo/shared'

interface ShutdownHook {
  name: string
  fn: () => Promise<void>
}

const hooks: ShutdownHook[] = []
let hooksRan = false

export function registerShutdownHook(name: string, fn: () => Promise<void>): void {
  hooks.push({ name, fn })
}

export async function runShutdownHooks(signal: string): Promise<void> {
  if (hooksRan) {
    pino.info({ signal }, 'Shutdown hooks already ran, skipping')
    return
  }
  hooksRan = true

  pino.info({ signal, hookCount: hooks.length }, 'Running shutdown hooks')
  for (const hook of hooks) {
    try {
      await hook.fn()
      pino.info({ hook: hook.name }, '✓ Shutdown hook completed')
    } catch (err) {
      pino.error({ err, hook: hook.name }, 'Shutdown hook failed')
    }
  }
}
