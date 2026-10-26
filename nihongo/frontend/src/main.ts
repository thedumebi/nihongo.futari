import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVfm } from 'vue-final-modal'
import 'vue-final-modal/style.css'

import { armAudioUnlock } from '@/composables/use-audio'
import router from '@/router/index'

import App from './app.vue'
import './style.css'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(createVfm())
app.mount('#app')

// iOS refuses to play audio from an element it has never seen a gesture
// against. One listener, once, unlocks the shared player for the session.
armAudioUnlock()

// Today is where a signed-in learner opens; fetch its code alongside the
// session check rather than after it.
// Offline, or a deploy renamed it: the route loads it when it is needed.
import('@/views/today.vue').catch(() => {})
