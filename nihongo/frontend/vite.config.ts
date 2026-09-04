import vue from '@vitejs/plugin-vue'
import path from 'node:path'
import { defineConfig, loadEnv } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

import { FrontendEnvSchema } from './src/types/env'

export default defineConfig(({ mode }) => {
  const viteEnv = loadEnv(mode, __dirname, '')
  const env = viteEnv.DOCKER_BUILD === '1'
    ? (viteEnv as any)
    : FrontendEnvSchema.parse(viteEnv)

  return {
    plugins: [
      vue(),
      VitePWA({
        // injectManifest, not generateSW: the worker carries custom caching.
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        registerType: 'prompt',
        injectManifest: {
          // Media is cached at runtime, not precached. Audio because precaching
          // ~90 MB of kana, word, sentence and dialogue clips on first load
          // would be hostile on mobile data; images because they are served
          // from the R2 bucket and excluded from the deployed image, so a
          // precache entry for them would 404 the install.
          //
          // Both trees still sit in `public/` on a developer's machine — that
          // is where `audio:all` writes and where the SVGs are authored — so
          // without these ignores a local build would precache files the
          // deployed one cannot, and the two service workers would differ.
          globPatterns: ['**/*.{js,css,html,svg,png,woff2}', 'manifest.json'],
          globIgnores: ['**/audio/**', '**/images/**']
        },
        manifest: false, // public/manifest.json is the source of truth
        devOptions: { enabled: false }
      })
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') }
    },
    define: { __VUE_PROD_DEVTOOLS__: false },
    esbuild: { drop: mode === 'production' ? ['console', 'debugger'] : [] },
    server: {
      hmr: { overlay: true },
      port: env.VITE_PORT,
      /**
       * The same two rules `nginx.conf` applies in production.
       *
       * Dev used to call the backend directly on its own port, which made the
       * two environments differently shaped: production is same-origin with
       * /api proxied, dev was cross-origin. Anything that depends on where the
       * app thinks it lives then works in one and not the other — and one did.
       * better-auth builds its OAuth redirect from BETTER_AUTH_URL, so Google
       * came back to the frontend origin, which had no such route, and the
       * reader got a 404 with a valid authorisation code in the URL bar.
       *
       * Order matters: /api/auth is matched before /api, because the first
       * keeps the prefix and the second strips it.
       */
      proxy: {
        // better-auth's basePath IS /api/auth, so the prefix stays.
        '/api/auth': {
          target: `http://localhost:${env.VITE_BACKEND_PORT || '3008'}`,
          changeOrigin: true
        },
        // Everything else maps to the backend's root routes:
        // /api/study/queue -> /study/queue.
        '/api': {
          target: `http://localhost:${env.VITE_BACKEND_PORT || '3008'}`,
          changeOrigin: true,
          rewrite: p => p.replace(/^\/api/, '')
        }
      }
    }
  }
})
