<script setup lang="ts">
import { Globe, Menu, X } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { DropdownOption } from '@/components/ui/dropdown.vue'

import Dropdown from '@/components/ui/dropdown.vue'
import { ROUTES } from '@/constants'
import { SITE_MARK, SITE_NAME } from '@/constants/site'
import { useAuthStore } from '@/store/auth'
import { useLanguageStore } from '@/store/language'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const lang = useLanguageStore()
const languageIcon = Globe

/**
 * The small-screen nav drawer.
 *
 * The header used to be a single unwrapped flex row: seven links, the language
 * dropdown, the account name and Sign out. On a phone there is nowhere for that
 * to go, so it either overflowed the viewport or crushed every label. Below
 * `md` the links now live in a drawer that slides in from the right — narrow
 * enough that the page stays visible behind it. From `md` up the original row
 * is unchanged.
 */
const menuOpen = ref(false)

const languageOptions = computed<DropdownOption[]>(() => lang.languages.map(l => ({
  value: l.code,
  label: l.nativeName,
  hint: l.itemCount === 0 ? 'empty' : `${l.itemCount}`,
  tooltip: l.itemCount === 0
    ? `${l.name} — no content imported yet`
    : `${l.name} — ${l.itemCount} items, ${l.levels.map(v => v.code).join(' · ')}`,
  tooltipPosition: 'bottom' as const,
  // Nothing to study means nothing to switch to.
  disabled: l.itemCount === 0
})))

// Only surface routes that exist — a nav that 404s is worse than a short nav.
const links = computed(() => {
  if (!auth.isAuthenticated)
    return []
  const base: Array<{ label: string, to: string }> = [
    // Lessons first, because it is the answer to "where do I start" and the
    // thing the app is now organised around: learn a topic, then it comes back.
    //
    // Eight tabs became five. Grammar was a reference list sitting in the main
    // nav while the lessons that teach the same material were buried inside it
    // — "I dont want grammer. I want study lessons!!" — so it moves into
    // Dictionary, which is where you go to look something up. Writing and
    // Sounds are drills you reach from Review rather than destinations.
    { label: 'Lessons', to: ROUTES.LESSONS },
    { label: 'Review', to: ROUTES.STUDY },
    { label: 'Conversations', to: ROUTES.CONVERSATIONS },
    { label: 'Progress', to: ROUTES.PROGRESS },
    { label: 'Dictionary', to: ROUTES.DICTIONARY }
  ]
  // An admin is an ordinary account with a role, so the admin entry is an
  // addition to the normal nav rather than a separate area you log into.
  if (auth.isAdmin)
    base.push({ label: 'Admin', to: ROUTES.ADMIN })
  return base
})

/**
 * The rest, reachable without cluttering the main five.
 *
 * Course, Due, Writing and Sounds left the primary nav when it went from eight
 * tabs to five, but nothing about them was retired — losing a route because a
 * tab moved would be a regression dressed as a tidy-up. On a phone they sit in
 * the same drawer; on a desk they are a quieter second row.
 */
const secondary = computed(() => {
  if (!auth.isAuthenticated)
    return []
  return [
    { label: 'Course', to: ROUTES.COURSE },
    { label: 'Due', to: ROUTES.DUE },
    { label: 'Writing', to: ROUTES.WRITING },
    { label: 'Sounds', to: ROUTES.SOUND_SERIES },
    { label: 'Grammar', to: ROUTES.GRAMMAR }
  ]
})

onMounted(() => {
  void lang.load()
})

watch(() => route.fullPath, () => {
  // The WINDOW scrolls, not <main>. main is a plain flex child with no overflow
  // of its own, so scrollTo on it silently did nothing and every navigation
  // landed at the previous page's scroll offset — arriving halfway down a page
  // you had never seen. Harmless-looking, and invisible until you look for it.
  window.scrollTo({ top: 0 })
  // Tapping a link must dismiss the panel, or the destination arrives hidden
  // behind it.
  menuOpen.value = false
})

async function signOut() {
  menuOpen.value = false
  await auth.logout()
  router.push(ROUTES.HOME)
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)]">
    <!--
      Pinned to the top rather than scrolling away with the page.

      The menu is the only way out of a screen on mobile, and it was leaving with
      the header — so getting anywhere from halfway down a long conversation or
      the dictionary meant scrolling back to the top first. A navigation control
      you have to go and find is one that stops being used.

      `sticky` rather than `fixed`: it keeps the header in the document flow, so
      the content below starts underneath it without a hand-maintained top
      offset that would drift the moment the header's height changed.

      The z-index sits below the mobile drawer's overlay (z-40) and panel
      (z-50), so an open menu still covers the header rather than fighting it.
    -->
    <header class="sticky top-0 z-30 border-b border-[var(--color-border)] bg-[var(--color-bg)]">
      <nav class="mx-auto max-w-4xl px-6 py-4">
        <div class="flex items-center gap-6">
          <!-- 語 is read "go" and means "language"; the name comes from it. -->
          <router-link
            :to="auth.isAuthenticated ? ROUTES.LESSONS : ROUTES.HOME"
            class="flex items-baseline gap-1.5 font-semibold"
          >
            <span class="text-[var(--color-accent)]" style="font-family: var(--font-jp)">{{ SITE_MARK }}</span>
            <span>{{ SITE_NAME }}</span>
          </router-link>

          <router-link
            v-for="item in links"
            :key="item.to"
            :to="item.to"
            class="hidden text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)] md:inline"
            active-class="!text-[var(--color-text)]"
          >
            {{ item.label }}
          </router-link>

          <div class="ml-auto flex items-center gap-4 text-sm">
            <Dropdown
              v-if="auth.isAuthenticated && lang.languages.length > 0"
              :model-value="lang.code"
              :options="languageOptions"
              :icon="languageIcon"
              header="Language"
              width-class="w-40"
              @update:model-value="lang.select"
            />

            <template v-if="auth.isAuthenticated">
              <router-link :to="ROUTES.SETTINGS" class="hidden text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-text)] lg:inline">
                {{ auth.user?.name || auth.user?.email }}
              </router-link>
              <button type="button" class="hidden whitespace-nowrap text-[var(--color-muted)] underline underline-offset-4 hover:text-[var(--color-text)] md:inline" @click="signOut">
                Sign out
              </button>
              <button
                type="button"
                class="-mr-1 rounded p-1 text-[var(--color-muted)] transition hover:text-[var(--color-text)] md:hidden"
                :aria-expanded="menuOpen"
                aria-controls="mobile-nav"
                :aria-label="menuOpen ? 'Close menu' : 'Open menu'"
                @click="menuOpen = !menuOpen"
              >
                <component :is="menuOpen ? X : Menu" class="h-5 w-5" />
              </button>
            </template>
            <router-link v-else :to="ROUTES.LOGIN" class="underline underline-offset-4">
              Sign in
            </router-link>
          </div>
        </div>

        <!--
          The quieter row. Course, Due, Writing, Sounds and Grammar left the
          main nav when it went from eight tabs to five, but they are still
          whole pages — without this they were reachable on a desktop only by
          typing the URL, while a comment claimed otherwise.
        -->
        <div v-if="secondary.length" class="mt-2 hidden flex-wrap gap-4 md:flex">
          <router-link
            v-for="item in secondary"
            :key="item.to"
            :to="item.to"
            class="text-xs text-[var(--color-muted)] opacity-80 transition hover:text-[var(--color-text)] hover:opacity-100"
            active-class="!text-[var(--color-text)] !opacity-100"
          >
            {{ item.label }}
          </router-link>
        </div>
      </nav>

      <!--
        Mobile drawer. Teleported to <body> so the fixed positioning is measured
        against the viewport rather than any transformed ancestor of the header,
        and so it paints above page content.
      -->
      <Teleport to="body">
        <Transition
          enter-active-class="transition-opacity duration-200"
          leave-active-class="transition-opacity duration-200"
          enter-from-class="opacity-0"
          leave-to-class="opacity-0"
        >
          <div
            v-if="menuOpen && auth.isAuthenticated"
            class="fixed inset-0 z-40 bg-black/40 md:hidden"
            @click="menuOpen = false"
          />
        </Transition>
        <Transition
          enter-active-class="transition-transform duration-200 ease-out"
          leave-active-class="transition-transform duration-200 ease-in"
          enter-from-class="translate-x-full"
          leave-to-class="translate-x-full"
        >
          <aside
            v-if="menuOpen && auth.isAuthenticated"
            id="mobile-nav"
            class="fixed inset-y-0 right-0 z-50 flex w-56 max-w-[70vw] flex-col overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 md:hidden"
          >
            <button
              type="button"
              class="mb-2 self-end rounded p-1 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
              aria-label="Close menu"
              @click="menuOpen = false"
            >
              <X class="h-5 w-5" />
            </button>
            <router-link
              v-for="item in links"
              :key="item.to"
              :to="item.to"
              class="rounded-lg px-2 py-2 text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
              active-class="!text-[var(--color-text)]"
            >
              {{ item.label }}
            </router-link>
            <router-link
              v-for="item in secondary"
              :key="item.to"
              :to="item.to"
              class="rounded-lg px-2 py-1.5 text-sm text-[var(--color-muted)] opacity-80 transition hover:text-[var(--color-text)] hover:opacity-100"
              active-class="!text-[var(--color-text)]"
            >
              {{ item.label }}
            </router-link>
            <router-link
              :to="ROUTES.SETTINGS"
              class="mt-2 truncate border-t border-[var(--color-border)] px-2 pt-4 text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
            >
              {{ auth.user?.name || auth.user?.email }}
            </router-link>
            <button
              type="button"
              class="px-2 py-2 text-left text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
              @click="signOut"
            >
              Sign out
            </button>
          </aside>
        </Transition>
      </Teleport>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-[var(--color-border)]">
      <div class="mx-auto max-w-4xl px-6 py-6 text-sm text-[var(--color-muted)]">
        <!-- Attribution is a CC BY-SA obligation for JMdict/KanjiVG/Tatoeba. -->
        <router-link :to="ROUTES.ATTRIBUTION" class="underline underline-offset-4">
          Data sources &amp; licences
        </router-link>
      </div>
    </footer>
  </div>
</template>
