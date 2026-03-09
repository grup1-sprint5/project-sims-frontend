import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import Vue3Toastify from 'vue3-toastify'
import 'vue3-toastify/dist/index.css'

const pinia = createPinia()

createApp(App)
	.use(pinia)
	.use(router)
	.use(Vue3Toastify)
	.mount('#app')
