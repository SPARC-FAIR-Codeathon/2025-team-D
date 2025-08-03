const lookupOntoTerm = async (term) => {
  const { $portalApiClient } = useNuxtApp()
  const config = {
    params: {
      term
    }
  }
  const response = await $portalApiClient.get('/onto_term_lookup', config)
  return response.data
}

export default {
  lookupOntoTerm
}
