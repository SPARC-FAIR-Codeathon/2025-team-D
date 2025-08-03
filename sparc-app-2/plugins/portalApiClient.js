import axios from "axios";
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const apiClient = axios.create({
    baseURL: config.public.portal_api,
    withCredentials: false,
    timeout: 30000
  })
  return {
    provide: {
      portalApiClient: apiClient
    },
  }
})