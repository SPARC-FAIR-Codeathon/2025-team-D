import { clone } from 'ramda'
export default defineNuxtRouteMiddleware(async (to, from) => {
  if (process.server) return
  // Re-direct the user back to the page they logged out from
  const redirectUrl = useCookie('sign-out-redirect-url')
  if (redirectUrl.value != null) {
    const url = clone(redirectUrl.value)
    redirectUrl.value = null
    return navigateTo(url)
  }
})
