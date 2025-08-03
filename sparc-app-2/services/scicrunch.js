let uberonOrganPairs = undefined

const search = async (query) => {
  const { $portalApiClient } = useNuxtApp()
  return $portalApiClient.get('search/' + query)
}

const getDatasetInfoFromObjectIdentifier = async (identifier) => {
  const { $portalApiClient } = useNuxtApp()
  const config = {
    params: {
      identifier
    }
  }
  return $portalApiClient.get('dataset_info/using_object_identifier', config)
}
const getDatasetInfoFromPennsieveIdentifier = async (identifier) => {
  const { $portalApiClient } = useNuxtApp()
  const config = {
    params: {
      identifier
    }
  }
  return $portalApiClient.get('dataset_info/using_pennsieve_identifier', config)
}

const getDatasetInfoFromDOI = async (doi) => {
  const { $portalApiClient } = useNuxtApp()
  const config = {
    params: {
      doi
    }
  }
  return $portalApiClient.get('/dataset_info/using_doi', config)
}

const getImageInfo = async (id) => {
  const { $portalApiClient } = useNuxtApp()
  return $portalApiClient.get('image/' + id)
}

const getCollectionInfo = async (id) => {
  return $portalApiClient.get('collections/' + id)
}

/**
 * Get the uberon organ pairs array.
 *
 * @returns {String} Array containing organ, uberon id pair
 */
const getUberonOrganPairs = async () => {
  const { $portalApiClient } = useNuxtApp()
  if (uberonOrganPairs) return uberonOrganPairs
  else {
    return $portalApiClient.get('get-organ-curies/').then(res => {
      uberonOrganPairs = res.data['uberon']['array']
      return uberonOrganPairs
    })
  }
}

/**
 * Get the organ name from the uberon id using a
 * organ - uberon id map from SciCrunch
 * @param {id} The uberon id
 * @returns {String} the organ name
 */
const getOrganFromUberonId = async (id) => {
  const { $portalApiClient } = useNuxtApp()
  return getUberonOrganPairs($portalApiClient).then(pairs => {
    if (pairs) {
      for (let i = 0; i < pairs.length; i++) {
        if (pairs[i]['id'] === id) {
          return pairs[i]['name']
        }
      }
    }
  })
}

export default {
  getDatasetInfoFromObjectIdentifier,
  getDatasetInfoFromDOI,
  getDatasetInfoFromPennsieveIdentifier,
  search,
  getImageInfo,
  getCollectionInfo,
  getOrganFromUberonId
}
