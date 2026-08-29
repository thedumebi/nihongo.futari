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
      port: env.VITE_PORT
      // No dev proxy: the SPA calls VITE_API_URL (the backend) directly and the
      // backend's CORS allows the frontend origin (ALLOWED_ORIGINS).
    }
  }
})
