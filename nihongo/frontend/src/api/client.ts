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

// On 401, drop the session and bounce to login — UNLESS the call opted out via
// `skipAuthRedirect`. Background/optional calls (e.g. the favorite indicator on
// a public page) set that flag so a stale session can't kick you off a public
// page like a project or article.
api.interceptors.response.use(
  response => response,
  async (error) => {
    const skip = (error.config as { skipAuthRedirect?: boolean } | undefined)?.skipAuthRedirect
    if (error.response?.status === 401 && !skip) {
      const authStore = useAuthStore()
      await authStore.logout()
      router.push('/admin/login')
    }
    return Promise.reject(error)
  }
)

export default api
