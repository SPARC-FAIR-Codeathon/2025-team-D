export default {
  methods: {
    /**
     * Fetch dataset information from discover api with dataset id and version
     */
    getDatasetInfo: async function(datasetId, datasetVersion) {
      const url = `${this.$config.public.discover_api_host}/datasets/${datasetId}`
      var datasetUrl = datasetVersion ? `${url}/versions/${datasetVersion}` : url
      let datasetInfo = {}
      await this.$pennsieveApiClient.value.get(datasetUrl).catch(error => {
        console.log(`Could not get the dataset's info: ${error}`)
      }).then(({ data }) => {
        datasetInfo = data
      })
      return datasetInfo
    }
  }
}
