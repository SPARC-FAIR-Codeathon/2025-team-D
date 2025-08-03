import { defineNuxtPlugin } from '#app'
import { useMainStore } from '~/store/index'

export default defineNuxtPlugin(async (nuxtApp) => {
  const store = useMainStore(nuxtApp.$pinia)
  await store.init()
  return {
    provide: {
      store: store
    }
  }
})
