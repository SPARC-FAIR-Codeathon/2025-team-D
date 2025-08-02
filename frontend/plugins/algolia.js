import algoliasearch from 'algoliasearch'

export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  const client = algoliasearch(
    config.public.ALGOLIA_APP_ID,
    config.public.ALGOLIA_API_KEY
  )

  return {
    provide: {
      algoliaClient: client,
    },
  }
})

