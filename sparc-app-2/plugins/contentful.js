import { createClient } from "contentful";
import contentful from 'contentful'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()

  const createClientFunc = process.env.NODE_ENV === 'development' ? createClient : contentful.createClient

  const client = createClientFunc({
    space: config.public.CTF_SPACE_ID,
    accessToken: config.public.CTF_CDA_ACCESS_TOKEN,
    host: config.public.CTF_API_HOST
  })

  return {
    provide: {
      contentfulClient: client,
    },
  }
})
