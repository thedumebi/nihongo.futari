import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { createVfm } from 'vue-final-modal'
import 'vue-final-modal/style.css'

import router from '@/router/index'

import App from './app.vue'
import './style.css'

const app = createApp(App)
app.use(router)
app.use(createPinia())
app.use(createVfm())
app.mount('#app')
