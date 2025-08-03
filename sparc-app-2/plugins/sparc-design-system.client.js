import { defineNuxtPlugin } from '#app'
import DesignSystemComponentsPlugin from 'sparc-design-system-components-2'

export default defineNuxtPlugin(async (nuxtApp) => {
  nuxtApp.vueApp.use(DesignSystemComponentsPlugin)
})
