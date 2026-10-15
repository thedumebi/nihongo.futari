<script setup lang="ts">
import { levelProgress } from '@nihongo/shared/lib'
import { ChevronDown, Flame, Globe, Menu, X } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { NavMenuItem } from '@/components/layout/nav-menu.vue'
import type { DropdownOption } from '@/components/ui/dropdown.vue'

import { markAchievementsSeen } from '@/api/progress'
import NavMenu from '@/components/layout/nav-menu.vue'
import SyncStatus from '@/components/layout/sync-status.vue'
import Dropdown from '@/components/ui/dropdown.vue'
import { useToast } from '@/composables/use-toast'
import { ROUTES } from '@/constants'
import { SITE_MARK, SITE_NAME } from '@/constants/site'
import { useAuthStore } from '@/store/auth'
import { useLanguageStore } from '@/store/language'
import { useTodayStore } from '@/store/today'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const lang = useLanguageStore()
const todayStore = useTodayStore()
const toast = useToast()

/**
 * An achievement unlocked since last time: said once, wherever the learner
 * happens to be, then marked seen so it is never said again.
 */
watch(() => todayStore.today?.unseenAchievements, (unseen) => {
  if (!unseen || unseen.length === 0)
    return
  const [first, ...rest] = unseen
  toast.success(rest.length === 0
    ? `Achievement unlocked: ${first!.title} — ${first!.description}`
    : `${unseen.length} achievements unlocked: ${unseen.map(a => a.title).join(', ')}`, 6000)
  void markAchievementsSeen(unseen.map(a => a.code)).catch(() => {})
  todayStore.today!.unseenAchievements = []
})
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

interface NavLink {
  label: string
  to: string
  /** A number to show beside the label — the due count on Review. */
  badge?: number
}

/**
 * The menu, grouped by what you came to do.
 *
 * It had grown to eight links and a second row of seven more — Course, Due,
 * Writing, Sounds, Games… — with no sense of which were for learning
 * something new and which for practising it, and the owner found it
 * confusing. Now: five places in one row. Today and Review are the daily
 * loop; Learn gathers everything that introduces something new; Practise
 * everything that uses what you know; Dictionary is the reference. Progress,
 * friends and settings live in your account menu.
 */
const dailyLinks = computed<NavLink[]>(() => {
  if (!auth.isAuthenticated)
    return []
  const due = todayStore.today?.due ?? 0
  return [
    { label: 'Today', to: ROUTES.TODAY },
    // Review opens the list of what is due; "Start reviewing" there starts the session.
    { label: 'Review', to: ROUTES.DUE, ...(due > 0 ? { badge: due } : {}) }
  ]
})

const learnMenu: NavMenuItem[] = [
  { label: 'New words', to: ROUTES.LEARN, hint: 'Today\'s new words, kanji and kana cards' },
  { label: 'Lessons', to: ROUTES.LESSONS, hint: 'Kana and grammar: learn one, then a quiz' },
  { label: 'Grammar', to: ROUTES.GRAMMAR, hint: 'Look up any pattern' },
  { label: 'Writing', to: ROUTES.WRITING, hint: 'Kana and kanji, stroke by stroke' },
  { label: 'Sounds', to: ROUTES.SOUND_SERIES, hint: 'Parts that tell you a kanji\'s reading' }
]

const practiseMenu: NavMenuItem[] = [
  { label: 'Speak', to: ROUTES.SPEAK, hint: 'Hear the English, say the Japanese' },
  { label: 'Recall', to: ROUTES.RECALL, hint: 'Your shaky words, hands-free' },
  { label: 'Conversations', to: ROUTES.CONVERSATIONS, hint: 'Short exchanges, and shadowing' },
  { label: 'Read', to: ROUTES.READ, hint: 'Speeches to read aloud' },
  { label: 'Games', to: ROUTES.GAMES, hint: 'Crossword, listening, build a kanji' }
]

const accountMenu = computed<NavMenuItem[]>(() => [
  { label: 'Progress', to: ROUTES.PROGRESS, hint: 'Your level, streak and course coverage' },
  { label: 'Achievements', to: ROUTES.ACHIEVEMENTS, hint: 'What you have earned, and what is next' },
  { label: 'Friends', to: ROUTES.FRIENDS, hint: 'Study alongside friends, if you turn it on' },
  { label: 'Settings', to: ROUTES.SETTINGS, hint: 'Reminders, reading aids, your account' },
  // An admin is an ordinary account with a role, so the admin entry is an
  // addition to the normal menu rather than a separate area you log into.
  ...(auth.isAdmin ? [{ label: 'Admin', to: ROUTES.ADMIN, hint: 'Review queue, invites, users' }] : [])
])

function groupActive(items: NavMenuItem[]): boolean {
  return items.some(i => isActive(i.to))
}

/**
 * The phone drawer's sections, each folded until opened — the flat list of
 * nineteen links was too much to scan. The section holding the current page
 * starts open, so the drawer still shows where you are.
 */
const drawerSections = computed(() => [
  { key: 'learn', title: 'Learn', items: learnMenu },
  { key: 'practise', title: 'Practise', items: practiseMenu },
  { key: 'account', title: auth.user?.name || 'You', items: accountMenu.value }
])
const drawerOpen = ref<Record<string, boolean>>({})

watch(menuOpen, (isOpen) => {
  if (isOpen)
    drawerOpen.value = Object.fromEntries(drawerSections.value.map(sec => [sec.key, groupActive(sec.items)]))
})

/**
 * Whether a nav link is the current page. Learn and Review are one path with
 * different `?mode=`, and the router ignores the query when it decides what
 * is active — both would light up — so this compares the mode itself.
 */
function isActive(to: string): boolean {
  // Review is the due list AND the review session it starts.
  if (to === ROUTES.DUE && route.path === ROUTES.STUDY && route.query.mode === 'due')
    return true
  const [path, query] = to.split('?')
  // A page inside a section (/games/listening) keeps the section lit.
  if (route.path !== path && !(path && path !== '/' && route.path.startsWith(`${path}/`)))
    return false
  const mode = new URLSearchParams(query ?? '').get('mode')
  return mode === null || route.query.mode === mode || (mode === 'new' && route.query.mode === undefined)
}

onMounted(() => {
  void lang.load()
  if (auth.isAuthenticated)
    void todayStore.refresh(lang.code)
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
  // Coming back from a session should move the badge and the streak.
  if (auth.isAuthenticated)
    void todayStore.refresh(lang.code)
})

async function signOut() {
  menuOpen.value = false
  todayStore.reset()
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
      <nav class="mx-auto max-w-5xl px-6 py-4">
        <div class="flex items-center gap-6">
          <!-- 語 is read "go" and means "language"; the name comes from it. -->
          <router-link
            :to="auth.isAuthenticated ? ROUTES.TODAY : ROUTES.HOME"
            class="flex items-baseline gap-1.5 font-semibold"
          >
            <span class="text-[var(--color-accent)]" style="font-family: var(--font-jp)">{{ SITE_MARK }}</span>
            <span>{{ SITE_NAME }}</span>
          </router-link>

          <template v-if="auth.isAuthenticated">
            <router-link
              v-for="item in dailyLinks"
              :key="item.to"
              :to="item.to"
              class="hidden items-center gap-1 whitespace-nowrap text-sm transition hover:text-[var(--color-text)] lg:inline-flex"
              :class="isActive(item.to) ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'"
            >
              {{ item.label }}
              <span
                v-if="item.badge"
                class="rounded-full bg-[var(--color-primary)] px-1.5 text-[0.65rem] font-semibold leading-4 text-[var(--color-bg)]"
                :aria-label="`${item.badge} due`"
              >{{ item.badge }}</span>
            </router-link>
            <NavMenu class="hidden lg:block" label="Learn" :items="learnMenu" :active="groupActive(learnMenu)" />
            <NavMenu class="hidden lg:block" label="Practise" :items="practiseMenu" :active="groupActive(practiseMenu)" />
            <router-link
              :to="ROUTES.DICTIONARY"
              class="hidden whitespace-nowrap text-sm transition hover:text-[var(--color-text)] lg:inline-flex"
              :class="isActive(ROUTES.DICTIONARY) ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'"
            >
              Dictionary
            </router-link>
          </template>

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
              <SyncStatus />
              <!-- The streak, and the level XP adds up to — always in sight, so a
                   day kept or lost is felt where it happens, not on Progress. -->
              <router-link
                v-if="todayStore.today"
                :to="ROUTES.PROGRESS"
                class="flex items-center gap-1 whitespace-nowrap tabular-nums transition hover:text-[var(--color-text)]"
                :class="todayStore.today.streak.studiedToday ? 'text-[var(--color-accent)]' : 'text-[var(--color-muted)]'"
                :title="`${todayStore.today.streak.current}-day streak${todayStore.today.streak.studiedToday ? ' — today counts' : ' — study today to keep it'} · level ${todayStore.today.xp.level}, ${levelProgress(todayStore.today.xp.total).toNext} XP to the next`"
              >
                <Flame class="h-4 w-4" />{{ todayStore.today.streak.current }}
                <span class="ml-1 hidden text-xs text-[var(--color-muted)] sm:inline">Lv {{ todayStore.today.xp.level }}</span>
              </router-link>
              <NavMenu
                class="hidden lg:block"
                :label="auth.user?.name || 'Account'"
                :items="accountMenu"
                :active="groupActive(accountMenu)"
                align-right
              >
                <template #footer>
                  <button
                    type="button"
                    class="mt-1 block w-full rounded-lg border-t border-[var(--color-border)] px-3 py-2 text-left text-sm text-[var(--color-muted)] transition hover:bg-[var(--color-card)] hover:text-[var(--color-text)]"
                    @click="signOut"
                  >
                    Sign out
                  </button>
                </template>
              </NavMenu>
              <button
                type="button"
                class="-mr-1 rounded p-1 text-[var(--color-muted)] transition hover:text-[var(--color-text)] lg:hidden"
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
            class="fixed inset-0 z-40 bg-black/40 lg:hidden"
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
            class="fixed inset-y-0 right-0 z-50 flex w-80 max-w-[85vw] flex-col overflow-y-auto border-l border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-4 lg:hidden"
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
              v-for="item in dailyLinks"
              :key="item.to"
              :to="item.to"
              class="flex items-center justify-between rounded-lg px-2 py-2 transition hover:text-[var(--color-text)]"
              :class="isActive(item.to) ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'"
            >
              {{ item.label }}
              <span
                v-if="item.badge"
                class="rounded-full bg-[var(--color-primary)] px-1.5 text-xs font-semibold text-[var(--color-bg)]"
              >{{ item.badge }}</span>
            </router-link>
            <router-link
              :to="ROUTES.DICTIONARY"
              class="rounded-lg px-2 py-2 transition hover:text-[var(--color-text)]"
              :class="isActive(ROUTES.DICTIONARY) ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'"
            >
              Dictionary
            </router-link>

            <div v-for="sec in drawerSections" :key="sec.key" class="mt-1 border-t border-[var(--color-border)] pt-1">
              <button
                type="button"
                class="flex w-full items-center justify-between rounded-lg px-2 py-2 text-left transition hover:text-[var(--color-text)]"
                :class="groupActive(sec.items) ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'"
                :aria-expanded="drawerOpen[sec.key] === true"
                @click="drawerOpen[sec.key] = !drawerOpen[sec.key]"
              >
                <span class="truncate">{{ sec.title }}</span>
                <ChevronDown class="h-4 w-4 shrink-0 transition" :class="drawerOpen[sec.key] ? 'rotate-180' : ''" />
              </button>
              <!-- Indented, with a rule down the side, so what belongs to the section is plain. -->
              <div v-if="drawerOpen[sec.key]" class="mb-2 ml-3 border-l-2 border-[var(--color-border)] pl-2">
                <router-link
                  v-for="item in sec.items"
                  :key="item.to"
                  :to="item.to"
                  class="block rounded-lg px-2 py-1.5 transition hover:text-[var(--color-text)]"
                  :class="isActive(item.to) ? 'text-[var(--color-text)]' : 'text-[var(--color-muted)]'"
                >
                  <span class="block text-sm" :class="isActive(item.to) ? 'font-medium' : ''">{{ item.label }}</span>
                  <span v-if="item.hint" class="block text-xs leading-snug text-[var(--color-muted)] opacity-80">{{ item.hint }}</span>
                </router-link>
                <button
                  v-if="sec.key === 'account'"
                  type="button"
                  class="block w-full rounded-lg px-2 py-1.5 text-left text-sm text-[var(--color-muted)] transition hover:text-[var(--color-text)]"
                  @click="signOut"
                >
                  Sign out
                </button>
              </div>
            </div>
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
