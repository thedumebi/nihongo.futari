import { createRouter, createWebHistory } from 'vue-router'

import { ROUTES } from '@/constants'
import { useAuthStore } from '@/store/auth'

const router = createRouter({
  history: createWebHistory(),
  scrollBehavior(_to, _from, saved) {
    return saved ?? { top: 0 }
  },
  routes: [
    {
      path: ROUTES.HOME,
      name: 'home',
      component: () => import('@/views/home.vue')
    },
    {
      path: ROUTES.STUDY,
      name: 'study',
      component: () => import('@/views/study.vue'),
      meta: { requiresAuth: true }
    },
    {
      // One sign-in for everyone. `admin` is a role on an ordinary account,
      // not a separate door — so there is deliberately no /admin/login.
      path: ROUTES.LOGIN,
      name: 'login',
      component: () => import('@/views/login.vue')
    },
    {
      path: ROUTES.SIGNUP,
      name: 'signup',
      component: () => import('@/views/signup.vue')
    },
    {
      path: ROUTES.CONVERSATIONS,
      name: 'conversations',
      component: () => import('@/views/conversations.vue'),
      meta: { requiresAuth: true }
    },
    {
      // Literal, for the reason spelled out on the kanji route below: the
      // builder encodes its argument, so ':code' becomes '%3Acode' and the
      // route matches nothing.
      path: '/conversations/:code',
      name: 'conversation-detail',
      component: () => import('@/views/conversation-detail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.COURSE,
      name: 'course',
      component: () => import('@/views/course.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.DUE,
      name: 'due',
      component: () => import('@/views/due.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.PROGRESS,
      name: 'progress',
      component: () => import('@/views/progress.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.ADMIN,
      name: 'admin',
      component: () => import('@/views/admin/dashboard.vue'),
      meta: { requiresAuth: true, isAdmin: true }
    },
    {
      path: ROUTES.ADMIN_INVITES,
      name: 'admin-invites',
      component: () => import('@/views/admin/invites.vue'),
      meta: { requiresAuth: true, isAdmin: true }
    },
    {
      path: ROUTES.LESSONS,
      name: 'lessons',
      component: () => import('@/views/lessons.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.LESSON_DETAIL(':slug'),
      name: 'lesson-detail',
      component: () => import('@/views/lesson-session.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.GRAMMAR,
      name: 'grammar',
      component: () => import('@/views/grammar.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.GRAMMAR_DETAIL(':slug'),
      name: 'grammar-detail',
      component: () => import('@/views/grammar-detail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.ADMIN_REVIEW_QUEUE,
      name: 'admin-review-queue',
      component: () => import('@/views/admin/review-queue.vue'),
      meta: { requiresAuth: true, isAdmin: true }
    },
    {
      path: ROUTES.SETTINGS,
      name: 'settings',
      component: () => import('@/views/settings.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.ATTRIBUTION,
      name: 'attribution',
      // Public: a licence notice nobody can read without an account is not a
      // licence notice.
      component: () => import('@/views/attribution.vue')
    },
    {
      path: ROUTES.DICTIONARY,
      name: 'dictionary',
      component: () => import('@/views/dictionary.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.WORD_DETAIL(':id'),
      name: 'word-detail',
      component: () => import('@/views/word-detail.vue'),
      meta: { requiresAuth: true }
    },
    {
      // Literal, NOT ROUTES.KANJI_DETAIL(':character'): that builder runs
      // encodeURIComponent, which turns ':character' into '%3Acharacter' and
      // registers a path nothing can ever match. The builder is for navigating
      // TO a page, where encoding 交 is exactly what you want.
      path: '/kanji/:character',
      name: 'kanji-detail',
      component: () => import('@/views/kanji-detail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.WRITING,
      name: 'writing',
      component: () => import('@/views/writing.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.SOUND_SERIES,
      name: 'sound-series',
      component: () => import('@/views/sound-series.vue'),
      meta: { requiresAuth: true }
    },
    {
      // Literal for the same reason as /kanji/:character above.
      path: '/sound-series/:component',
      name: 'sound-series-detail',
      component: () => import('@/views/sound-series-detail.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: ROUTES.NOT_FOUND,
      name: 'not-found',
      component: () => import('@/views/not-found.vue')
    }
  ]
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  // Ask on EVERY route, public ones included. This used to return early for
  // anything without `requiresAuth`, which meant the landing page never found
  // out whether you were signed in: its call to action read "Sign in" and sent
  // an already-authenticated reader to the login form. The session cookie was
  // there the whole time — nothing had asked about it.
  //
  // Cheap after the first call: the store caches the answer for the page load.
  await auth.syncSession()

  // Nobody signed in needs the login or sign-up form. Landing on one is
  // either a stale bookmark or the browser restoring a tab, and showing a
  // sign-in box to someone already signed in reads as being logged out.
  if (auth.isAuthenticated && (to.name === 'login' || to.name === 'signup'))
    return { name: 'progress' }

  if (!to.meta.requiresAuth && !to.meta.isAdmin)
    return true

  if (!auth.isAuthenticated)
    return { name: 'login', query: { redirect: to.fullPath } }
  if (to.meta.isAdmin && !auth.isAdmin)
    return { name: 'home' }

  return true
})

export default router
