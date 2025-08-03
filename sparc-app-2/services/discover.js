const browse = async (id, version, path = undefined) => {
  const { $portalApiClient } = useNuxtApp()

  let config = {}
  if (path) {
    config = {
      params: {
        path: path,
        limit: 253
      }
    }
  }
  return $portalApiClient.get(`/${id}/versions/${version}/files/browse`, config)
}

const fetch = async (id, path, encode_base_64, s3Bucket) => {
  const { $portalApiClient } = useNuxtApp()

  const config = {
    params: {
      encodeBase64: encode_base_64
    }
  }
  if (s3Bucket) {
    config.params.s3BucketName = s3Bucket
  }
  return await $portalApiClient.get(
    `/s3-resource/${id}/files/${path}`,
    config
  )
}

const fetchEmbeddedThumbnail = async (id, path, s3Bucket) => {
  const { $portalApiClient } = useNuxtApp()

  const config = {
    params: {
      path: `${id}/files/${path}`
    }
  }
  if (s3Bucket) {
    config.params.s3BucketName = s3Bucket
  }
  return await $portalApiClient.get('/thumbnail/segmentation', config)
}

const getSegmentationInfo = async (id, path, s3Bucket) => {
  const { $portalApiClient } = useNuxtApp()

  const config = {
    params: {
      dataset_path: `${id}/${path}`
    }
  }
  if (s3Bucket) {
    config.params.s3BucketName = s3Bucket
  }
  return $portalApiClient.get('/segmentation_info', config)
}

const downloadLink = async (file_path, s3Bucket) => {
  const { $portalApiClient } = useNuxtApp()

  const config = {
    params: {
      key: file_path
    }
  }
  if (s3Bucket) {
    config.params.s3BucketName = s3Bucket
  }
  return await $portalApiClient.get('/download', config)
}

const getDiscoverPath = (source_identifier) => {
  const { $portalApiClient } = useNuxtApp()
  
  const config = {
    params: {
      uri: source_identifier
    }
  }
  const response = $portalApiClient.get('/s3-resource/discover_path', config)
  return response
}

export default {
  browse,
  downloadLink,
  fetch,
  fetchEmbeddedThumbnail,
  getDiscoverPath,
  getSegmentationInfo
}
