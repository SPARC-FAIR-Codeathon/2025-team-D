import axios from "axios"
import { useMainStore } from "@/store"
import { ref } from 'vue'

function createClient(nuxtApp) {
  const store = useMainStore(nuxtApp.$pinia)
  let params = {}
  const accessToken = store.$state.userProfile?.token
  if (accessToken && accessToken !== '') {
    params.api_key = `${accessToken}`
  }
  return axios.create({
    params: params
  })
}

export default defineNuxtPlugin((nuxtApp) => {
  const apiClient = ref(createClient(nuxtApp))
  const updateApiClient = (client) => {
    apiClient.value = client
  }
  return {
    provide: {
      pennsieveApiClient: apiClient,
      updatePennsieveApiClient: updateApiClient
    },
  }
})
