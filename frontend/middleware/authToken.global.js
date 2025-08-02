import { useMainStore } from '@/store/index'
import auth from '@/services/auth.js'
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return
  // Log the user out if their authorization token has expired
  const tokenExp = useMainStore().tokenExp
  if (tokenExp) {
    const expDate = new Date(tokenExp)
    const currentDate = new Date()
    if (currentDate >= expDate) {
      await auth.logout()
    }
  }
})
