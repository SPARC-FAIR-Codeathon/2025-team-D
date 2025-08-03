import axios from "axios";
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const apiClient = axios.create({
    baseURL: config.public.MBF_SPARC_API,
    withCredentials: false,
    timeout: 10000
  })
  return {
    provide: {
      mbfSparcApiClient: apiClient
    },
  }
})