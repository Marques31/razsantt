import { createApp } from 'vue'
import App from './App.vue'
import { i18n } from '@/i18n'

// Import Global Stylesheets
import '@/assets/styles/base.css'
import '@/assets/styles/layout.css'
import '@/assets/styles/print.css'

const app = createApp(App)
app.use(i18n)
app.mount('#app')
