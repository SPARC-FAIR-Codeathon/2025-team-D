import { useMainStore } from '@/store/index'
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return
  const user = useMainStore().userProfile
  // Re-direct the user to the home page if they are not logged in
  if (user == null) {
    return navigateTo('/')
  }
})
