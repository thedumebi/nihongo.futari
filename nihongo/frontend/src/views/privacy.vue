<script setup lang="ts">
import AppShell from '@/components/layout/app-shell.vue'
import { CONTACT_EMAIL, ROUTES, SUPPORT_URL } from '@/constants'

/**
 * About go and your data, in plain words.
 *
 * Public, because it has to be read before signing up. Every claim here is a
 * fact about the code and the servers; when one of those changes (a new
 * service that sees personal data, a new kind of thing stored), this page
 * changes in the same commit.
 */
</script>

<template>
  <AppShell>
    <div class="mx-auto max-w-2xl px-4 py-10">
      <h1 class="text-2xl font-semibold text-[var(--color-heading)]">
        About go and your data
      </h1>

      <section class="mt-8">
        <h2 class="text-lg font-semibold text-[var(--color-heading)]">
          A personal project
        </h2>
        <p class="mt-2 text-[var(--color-muted)]">
          go is free to use and built and run by one person. It is a work in progress: features will change,
          things will occasionally break, and there is no promise that it runs forever. Your progress is saved
          on the server and backed up. If go ever closes, I will try to tell you by email first.
        </p>
      </section>

      <section class="mt-8">
        <h2 class="text-lg font-semibold text-[var(--color-heading)]">
          What is stored about you
        </h2>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-[var(--color-muted)]">
          <li>Your email address and name, and your password if you set one (stored only as a secure hash).</li>
          <li>If you sign in with Google, the link to your Google account. Nothing else from Google.</li>
          <li>Your studying: answers, reviews, progress, streaks and the settings you choose.</li>
          <li>Your timezone and when your day starts, so streaks and reminders follow your own day.</li>
          <li>Your reminder choices, and for push notifications, an address for each device you turn them on for.</li>
          <li>Friends, only if you turn them on, and only what you choose to share with them.</li>
        </ul>
        <p class="mt-3 text-[var(--color-muted)]">
          It is used to run go for you and nothing else. There are no ads, no tracking scripts, and nothing is
          sold or shared for marketing.
        </p>
      </section>

      <section class="mt-8">
        <h2 class="text-lg font-semibold text-[var(--color-heading)]">
          Who else handles it
        </h2>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-[var(--color-muted)]">
          <li><span class="text-[var(--color-text)]">netcup</span>: the rented server where go and its database run.</li>
          <li>
            <span class="text-[var(--color-text)]">Cloudflare</span>: every visit passes through its network, and it runs
            the check that keeps bots off the sign-up form.
          </li>
          <li><span class="text-[var(--color-text)]">Brevo</span>: sends go's emails, such as sign-in codes and reminders.</li>
          <li><span class="text-[var(--color-text)]">Google</span>: only if you choose to sign in with Google.</li>
        </ul>
      </section>

      <section class="mt-8">
        <h2 class="text-lg font-semibold text-[var(--color-heading)]">
          Your choices
        </h2>
        <ul class="mt-2 list-disc space-y-1 pl-5 text-[var(--color-muted)]">
          <li>
            Delete your account at any time in
            <router-link :to="ROUTES.SETTINGS" class="underline underline-offset-4">
              Settings
            </router-link>
            and everything stored with it goes too.
          </li>
          <li>Turn reminders and update emails off in Settings, or with the link at the bottom of any email.</li>
          <li>
            For anything else about your data, write to
            <a :href="`mailto:${CONTACT_EMAIL}`" class="underline underline-offset-4">{{ CONTACT_EMAIL }}</a>.
          </li>
        </ul>
      </section>

      <section class="mt-8">
        <h2 class="text-lg font-semibold text-[var(--color-heading)]">
          Supporting go
        </h2>
        <p class="mt-2 text-[var(--color-muted)]">
          go stays free. If you would like to help with the server costs, you can
          <a :href="SUPPORT_URL" target="_blank" rel="noopener" class="underline underline-offset-4">leave a tip on Ko-fi</a>.
          It is entirely optional and unlocks nothing.
        </p>
      </section>
    </div>
  </AppShell>
</template>
