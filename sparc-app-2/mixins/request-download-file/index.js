import { propOr } from 'ramda'
import FileDownload from 'js-file-download'

export default {
  methods: {
    /**
     * Request download file via axios. This will file will be saved on the users computer with file name "fileName"
     */
    requestDownloadFile: function(downloadInfo) {
      const fileName = propOr('', 'name', downloadInfo)
      const version = propOr('', 'version', downloadInfo)
      //S3 Bucket is now dynamic but we do not have to catch it here as the 
      //zipit api seems to handle it internally.
      const datasetVersionRegexp = /s3:\/\/.*\/(?<datasetId>\d*)\/(?<filePath>.*)/
      const matches = downloadInfo.uri.match(datasetVersionRegexp)
      const payload = {
        data: {
          paths: [matches.groups.filePath],
          datasetId: matches.groups.datasetId,
          version: version
        }
      }
      this.$axios.post(this.$config.public.zipit_api_host, payload).then(({ data }) => {
        FileDownload(data, fileName)
      })
    },
    /**
     * Request file contents via axios. This returns a promise which resolves to the contents of the file to then be used withing sparc-app (ie to display markdown)
     */
    requestFileContent(downloadInfo) {
      const version = propOr('', 'version', downloadInfo)
      return new Promise(resolve => {
        const datasetVersionRegexp = /s3:\/\/.*\/(?<datasetId>\d*)\/(?<filePath>.*)/
        //S3 Bucket is now dynamic but we do not have to catch it here as the 
        //zipit api seems to handle it internally.
        const matches = downloadInfo.uri.match(datasetVersionRegexp)
        const payload = {
          data: {
            paths: [matches.groups.filePath],
            datasetId: matches.groups.datasetId,
            version: version
          }
        }
        this.$axios
          .post(this.$config.public.zipit_api_host, payload)
          .then(({ data }) => {
            resolve(data)
          })
      })
    }
  }
}
