import { pino } from '@nihongo/shared'
import db from '@nihongo/shared/db'
import { users } from '@nihongo/shared/db/schema'
import SendMail from '@nihongo/shared/emails'
import env from '@nihongo/shared/env'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { APIError } from 'better-auth/api'
import { emailOTP } from 'better-auth/plugins'
import { eq } from 'drizzle-orm'

import { consumeReservation, findReservation, isDomainAllowed } from '@/services/invites.service.js'

/**
 * Authentication.
 *
 * ONE login for everyone. `admin` is a role on an ordinary account, not a
 * separate door — an admin has to sign in exactly like a learner before they
 * can reach the admin surface, and the admin UI is gated by `user.role`
 * (re-read from the database on every admin request, see middlewares/admin.ts).
 *
 * The primary sign-in path is a **one-time code by email**. Learners should not
 * have to invent and store a password to practise vocabulary. Email+password
 * stays available for people who prefer a password manager, but nothing
 * requires it.
 *
 * Signup is gated by `SIGNUP_MODE`:
 *   closed — no self-signup at all; an admin creates accounts
 *   invite — a code must be reserved against the address first (default)
 *   open   — anyone with an email address
 *
 * The gate lives in the `user.create.before` database hook, which is the ONE
 * place both signup paths converge — OTP verification and password signup both
 * create a user through it, so neither can slip past.
 */

const signupMode = env.SIGNUP_MODE

/** Both halves or nothing — a client id without its secret cannot sign anybody in. */
export const googleEnabled = Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)

async function assertMayCreateAccount(email: string): Promise<{ role: string, reservationId?: string }> {
  if (!isDomainAllowed(email)) {
    throw new APIError('FORBIDDEN', { message: 'That email domain is not allowed to register.' })
  }

  if (signupMode === 'closed') {
    throw new APIError('FORBIDDEN', {
      message: 'Sign-ups are closed. Ask an administrator to create your account.'
    })
  }

  if (signupMode === 'open')
    return { role: 'user' }

  const reservation = await findReservation(email)
  if (!reservation) {
    throw new APIError('FORBIDDEN', {
      message: 'You need a valid invite code to sign up. Enter it on the sign-up page first.'
    })
  }

  return { role: reservation.role, reservationId: reservation.id }
}

/**
 * Whether an emailed code could actually be used by this address.
 *
 * True for an existing account (an ordinary sign-in) and for an address with a
 * live invite reservation (a first sign-in). False otherwise, which is when
 * sending would be pure abuse surface.
 *
 * In `open` mode anyone may register, so anyone may receive a code.
 */
async function mayReceiveCode(email: string): Promise<boolean> {
  if (signupMode === 'open')
    return true

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1)
  if (existing)
    return true

  if (signupMode === 'closed')
    return false

  return Boolean(await findReservation(email))
}

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: 'pg' }),
  user: {
    modelName: 'users',
    // Extra columns surfaced on the session so the client can gate admin UI and
    // render in the user's own timezone. input:false = not settable through the
    // auth client; role is managed in the DB, profile fields via /users/me.
    additionalFields: {
      username: { type: 'string', required: false, input: false },
      role: { type: 'string', required: false, input: false, defaultValue: 'user' },
      active: { type: 'boolean', required: false, input: false, defaultValue: true },
      timezone: { type: 'string', required: false, input: false, defaultValue: 'UTC' },
      locale: { type: 'string', required: false, input: false, defaultValue: 'en' },
      activeLanguageId: { type: 'string', required: false, input: false }
    }
  },
  session: {
    modelName: 'sessions',
    /**
     * Thirty days, refreshed daily.
     *
     * Stated rather than left to the library default so the lifetime is a
     * decision in the repo instead of whatever the dependency happens to ship.
     * This is a study app people open in short bursts; being signed out
     * between sessions is the fastest way to stop someone keeping a streak.
     *
     * `updateAge` slides the expiry when a session is used, so a daily user is
     * never signed out, while an abandoned session still ages out in a month.
     */
    expiresIn: 60 * 60 * 24 * 30,
    updateAge: 60 * 60 * 24
  },
  account: {
    modelName: 'accounts',
    /**
     * A Google sign-in on an address that already has an account joins it.
     *
     * Without this, somebody who signed up by emailed code and later presses
     * "Continue with Google" is told the address is taken — by their own
     * account. Trusted because Google verifies the address before it tells us,
     * which is the same assurance our own emailed code gives.
     */
    accountLinking: { enabled: true, trustedProviders: ['google'] }
  },

  /**
   * Google, only when it has been configured.
   *
   * The invite gate needs no changes to cover this: better-auth funnels social
   * sign-up through `internalAdapter.createUser`, which runs the
   * `databaseHooks.user.create.before` above — the same hook the emailed code
   * and the password path go through. A rejection there surfaces as the
   * APIError it throws, because the OAuth callback re-throws API errors rather
   * than swallowing them.
   */
  ...(googleEnabled
    ? {
        socialProviders: {
          google: {
            clientId: env.GOOGLE_CLIENT_ID!,
            clientSecret: env.GOOGLE_CLIENT_SECRET!,
            disableSignUp: signupMode === 'closed'
          }
        }
      }
    : {}),
  verification: { modelName: 'verifications' },
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.ALLOWED_ORIGINS,

  databaseHooks: {
    user: {
      create: {
        // Both signup paths funnel through here.
        before: async (user) => {
          const { role } = await assertMayCreateAccount(user.email)
          return { data: { ...user, role } }
        },
        // Spend the invite only once the account actually exists, so an
        // abandoned signup returns the code to circulation.
        after: async (user) => {
          if (signupMode !== 'invite')
            return
          const reservation = await findReservation(user.email)
          if (reservation)
            await consumeReservation(reservation, user.id, user.email)
        }
      }
    }
  },

  emailAndPassword: {
    // Optional, not required — OTP is the primary path.
    enabled: true,
    // Off unless signups are genuinely open. The invite hook already refuses
    // to create the account, but better-auth answered the sign-up request with
    // 200 and a full user object anyway, so the caller was told it had worked
    // and only found out at the next sign-in. Refusing at the door says the
    // true thing at the time it is asked.
    //
    // Invited people never sign up with a password: they arrive by emailed
    // code and set one afterwards in Settings.
    disableSignUp: signupMode !== 'open',
    requireEmailVerification: true,
    minPasswordLength: 8,
    autoSignIn: false,
    revokeSessionsOnPasswordReset: true,
    async sendResetPassword({ user, url }) {
      await SendMail.sendResetPassword({ email: user.email, name: user.name || user.email, url })
    }
  },

  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      await SendMail.sendVerifyEmail({ email: user.email, name: user.name || user.email, url })
    }
  },

  advanced: {
    cookiePrefix: 'nihongo',
    crossSubDomainCookies: env.COOKIE_DOMAIN
      ? { enabled: true, domain: env.COOKIE_DOMAIN }
      : undefined
  },

  plugins: [
    emailOTP({
      // The passwordless path. Sign-up through OTP is allowed unless signups
      // are closed entirely — the invite gate above still applies, so this
      // cannot be used to bypass it.
      disableSignUp: signupMode === 'closed',
      sendVerificationOnSignUp: false,
      async sendVerificationOTP({ email, otp, type }) {
        // Never mail a code to someone who could not use it. The endpoint is
        // unauthenticated, so without this anyone who knows the URL can make
        // the app send mail to any address they like — an abuse vector and a
        // bill. An address is eligible if it already has an account, or has a
        // live invite reservation waiting.
        if (!await mayReceiveCode(email)) {
          pino.warn(`[AUTH] ${type} code withheld — no account or invite for that address`)
          return
        }

        // The code is NEVER logged. It is a bearer credential: anyone who
        // reads the log — a shoulder-surfer, a shipped log file, a screen
        // share — can sign in as that user. Dev convenience is not worth
        // building the habit of printing secrets; the Ethereal preview URL
        // is enough to retrieve it locally.
        if (env.NODE_ENV === 'development') {
          pino.info(`[AUTH] ${type} code sent to ${email}`)
        }
        // Each purpose gets its own words. `type` is one of three, and the
        // `else` used to sweep two of them into the verify-your-email template
        // — so asking to set a password produced "use the code below to verify
        // your email and activate your go account", which is wrong twice: the
        // account is already active, and no email is being verified.
        if (type === 'sign-in')
          await SendMail.sendSignInOtp({ email, name: email, otp })
        else if (type === 'forget-password')
          await SendMail.sendPasswordOtp({ email, name: email, otp })
        else
          await SendMail.sendVerifyOtp({ email, name: email, otp })
      },
      otpLength: 6,
      expiresIn: 10 * 60,
      allowedAttempts: 5
    })
  ]
})
