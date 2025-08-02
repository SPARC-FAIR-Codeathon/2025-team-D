import axios from "axios";
export default defineNuxtPlugin(async (nuxtApp) => {
  return {
    provide: {
      axios: axios.create({}),
    },
  }
})
