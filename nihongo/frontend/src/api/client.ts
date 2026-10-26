import axios from 'axios'

import env from '@/env'
import router from '@/router/index'
import { useAuthStore } from '@/store/auth'

// Same origin as the app, with /api proxied to the backend — nginx does it in
// production and the Vite dev server does it in dev, with the same two rules.
// So this is <site>/api in both, and the backend's own port is an
// implementation detail neither the browser nor better-auth needs to know.
export const apiUrl = env.VITE_API_URL

export const api = axios.create({
  baseURL: apiUrl,
  timeout: 30000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

// On 401, drop the session and go to sign in — UNLESS the call opted out via
// `skipAuthRedirect`. Background/optional calls (e.g. the favorite indicator on
// a public page) set that flag so a stale session can't kick you off a public
// page like a project or article.
api.interceptors.response.use(
  response => response,
  async (error) => {
    const skip = (error.config as { skipAuthRedirect?: boolean } | undefined)?.skipAuthRedirect
    if (error.response?.status === 401 && !skip) {
      const authStore = useAuthStore()
      // Neither the sign-out nor the redirect may replace the 401 the caller
      // is waiting to see.
      await authStore.logout().catch(() => {})
      // One sign-in for everyone: there is no /admin/login, and sending an
      // expired session there landed on Not found.
      const here = router.currentRoute.value
      if (here.name !== 'login')
        await router.push({ name: 'login', query: { redirect: here.fullPath } }).catch(() => {})
    }
    return Promise.reject(error)
  }
)

export default api
