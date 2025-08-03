import { install } from 'sparc-dashboard-beta/dist/index.js'
import 'sparc-dashboard-beta/dist/style.css'

export default defineNuxtPlugin((nuxtApp) => {
    install(nuxtApp.vueApp, nuxtApp.$pinia)
})
