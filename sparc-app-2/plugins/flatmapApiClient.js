import axios from "axios";
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const apiClient = axios.create({
    baseURL: config.public.flatmap_api,
    withCredentials: false,
    timeout: 10000
  })
  return {
    provide: {
      flatmapApiClient: apiClient
    },
  }
})