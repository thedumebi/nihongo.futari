import { emailOTPClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/vue'

import env from '@/env'

// Mirror ofuma: point the auth client at the FULL better-auth base path.
// better-auth's basePath is /api/auth, so when VITE_API_URL already ends with
// /api we append /auth; otherwise (pointing at the backend root) /api/auth.
// apiUrl is read from env directly (not imported from api/client) to avoid a
// circular import — api/client imports the auth store.
const apiUrl = env.VITE_API_URL

export const authClient = createAuthClient({
  baseURL: apiUrl.endsWith('/api') ? `${apiUrl}/auth` : `${apiUrl}/api/auth`,
  plugins: [emailOTPClient()]
})
