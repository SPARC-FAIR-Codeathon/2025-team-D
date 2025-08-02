<template>
  <div class="file-detail-page">
    <div class="page-wrap container">
      <h1 hidden>Image viewer</h1>
      <client-only>
        <content-tab-card
          class="mt-24"
          :tabs="tabs"
          :active-tab-id="activeTabId"
        >
          <img
            v-show="activeTab === 'imageViewer'"
            ref="img"
            :src="imageSrc"
            class="image-viewer"
            @load="imageLoaded"
          />
        </content-tab-card>
      </client-only>
      <div class="subpage">
        <div class="page-heading">
          <h2>{{ fileName }}</h2>
        </div>
        <div class="file-detail">
          <strong class="file-detail__column_1">Type</strong>
          <div class="file-detail__column_2">
            {{ imageType }}
          </div>
        </div>
        <div class="file-detail">
          <strong class="file-detail__column_1">Size</strong>
          <div class="file-detail__column_2">
            {{ imageSize }}
          </div>
        </div>
        <div class="file-detail">
          <strong class="file-detail__column_1">Dataset</strong>
          <div class="file-detail__column_2">
            <nuxt-link
              :to="{
                name: 'datasets-datasetId',
                params: {
                  datasetId
                }
              }"
            >
              {{ datasetTitle }}
            </nuxt-link>
          </div>
        </div>
        <div class="file-detail">
          <strong class="file-detail__column_1">File location</strong>
          <div class="file-detail__column_2">
            <nuxt-link
              :to="{
                name: `datasets-datasetId`,
                params: {
                  datasetId: datasetId
                },
                query: {
                  datasetDetailsTab: 'files',
                  path: fileFolderLocation
                }
              }"
            >
              {{ filePath }}
            </nuxt-link>
          </div>
        </div>
        <div class="pt-16">
          <el-button @click="requestDownloadFile({...file, version: versionNumber})">
            Download file
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import discover from '@/services/discover'

import DatasetInfo from '@/mixins/dataset-info'
import FetchPennsieveFile from '@/mixins/fetch-pennsieve-file'
import RequestDownloadFile from '@/mixins/request-download-file'
import FileDetails from '@/mixins/file-details'

import { baseName, extractS3BucketName } from '@/utils/common'

export default {
  name: 'ImageViewerPage',

  mixins: [DatasetInfo, FileDetails, RequestDownloadFile, FetchPennsieveFile],

  async setup() {
    const route = useRoute()
    const { $pennsieveApiClient } = useNuxtApp()
    const config = useRuntimeConfig()
    const url = `${config.public.discover_api_host}/datasets/${route.params.dataset_id}`
    var datasetUrl = route.params.dataset_version ? `${url}/versions/${route.params.dataset_version}` : url
    let datasetInfo = {}
    await $pennsieveApiClient.value.get(datasetUrl).catch(e => {
      console.log(`Could not get the dataset's info: ${e}`)
    }).then(({ data }) => {
      datasetInfo = data
    })
    const s3Bucket = datasetInfo ? extractS3BucketName(datasetInfo.uri) : undefined

    const response = await discover.fetch(
      route.query.dataset_id,
      route.query.dataset_version,
      route.query.file_path,
      true, 
      s3Bucket
    )

    const imageInfo = {
      description: 'image description',
      name: baseName(route.query.file_path),
      src: `data:${route.query.mimetype};base64,${response.data}`,
      size: 'XxY',
      location: `files/${route.query.file_path}`
    }

    const filePath = imageInfo.location
    const file = await FetchPennsieveFile.methods.fetchPennsieveFile(
      filePath,
      route.query.dataset_id,
      route.query.dataset_version
    )

    return {
      imageInfo,
      file,
      datasetInfo
    }
  },

  data: () => {
    return {
      tabs: [
        {
          label: 'Image Viewer',
          id: 'imageViewer'
        }
      ],
      activeTab: 'imageViewer'
    }
  },

  computed: {
    /**
     * Return the dataset id from the route query.
     * @returns String
     */
    datasetId: function() {
      return this.$route.query.dataset_id
    },

    /**
     * Return the version number from the route query.
     * @returns String
     */
    versionNumber: function() {
      return this.$route.query.dataset_version
    },

    /**
     * Return the type of an image.
     * @returns String
     */
    imageType: function() {
      return this.file.fileType
    },

    /**
     * Return a string that descripes the size of the image.
     * @returns String
     */
    imageSize: function() {
      return this.imageInfo.size
    },

    /**
     * Return the image src as a base64 description.
     * @returns String
     */
    imageSrc: function() {
      return this.imageInfo.src
    },
    /**
     * Return the dataset's name.
     * @returns String
     */
    datasetTitle: function() {
      return this.datasetInfo ? this.datasetInfo.name : 'Go to dataset'
    }
  },
  methods: {
    imageLoaded() {
      this.imageInfo.size = `${this.$refs.img.naturalWidth}x${this.$refs.img.naturalHeight}`
    }
  }
}
</script>

<style scoped lang="scss">
@import '@/assets/_viewer.scss';

.image-viewer {
  max-height: 100%;
  max-width: 100%;
}
.page-heading {
  margin-bottom: 1.375rem;
}
</style>
