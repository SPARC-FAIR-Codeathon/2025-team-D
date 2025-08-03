<template>
  <div class="file-detail-page">
    <div class="container">
      <h1 hidden>{{ title }} timeseries</h1>
      <content-tab-card
        v-if="hasTimeseriesViewer"
        class="tabs p-32 pt-48"
        :tabs="tabs"
        :active-tab-id="activeTabId"
      >
        <ts-viewer
          v-if="userToken"
          v-show="activeTabId === 'timeseriesViewer'"
          :user-token="userToken"
          :package-id="sourcePackageId"
          :package-type="packageType"
        />
        <div v-else>
          <b>Sign in</b> to the SPARC Portal to view timeseries data
        </div>
      </content-tab-card>
      <div class="subpage pt-0 pb-16">
        <div class="file-detail">
          <strong class="file-detail__column_1">Dataset</strong>
          <div class="file-detail__column_2">
            <nuxt-link
              :to="{
                name: 'datasets-datasetId',
                params: {
                  datasetId,
                  datasetVersion
                }
              }"
            >
              {{ title }}
            </nuxt-link>
          </div>
        </div>
        <div class="file-detail">
          <strong class="file-detail__column_1">Filename</strong>
          <div class="file-detail__column_2">
            {{ fileName }}
          </div>
        </div>
        <div v-if="filePath" class="file-detail">
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
        <div v-if="filePath" class="pt-16">
          <el-button @click="requestDownloadFile({...file, version: datasetVersion})">
            Download file
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useMainStore } from '../../../store'
import { mapState } from 'pinia'
import { propOr } from 'ramda'

import DatasetInfo from '@/mixins/dataset-info'
import RequestDownloadFile from '@/mixins/request-download-file'
import FetchPennsieveFile from '@/mixins/fetch-pennsieve-file'
import FileDetails from '@/mixins/file-details'

export default {
  name: 'TimeseriesViewerPage',

  mixins: [DatasetInfo, FileDetails, RequestDownloadFile, FetchPennsieveFile],

  async setup() {
    const route = useRoute()
    const { $pennsieveApiClient } = useNuxtApp()
    const config = useRuntimeConfig()
    const url = `${config.public.discover_api_host}/datasets/${route.query.dataset_id}`
    var datasetUrl = route.query.dataset_version ? `${url}/versions/${route.query.dataset_version}` : url
    let datasetInfo = {}
    await $pennsieveApiClient.value.get(datasetUrl).catch(e => {
      console.log(`Could not get the dataset's info: ${e}`)
    }).then(({ data }) => {
      datasetInfo = data
    })

    const file = await FetchPennsieveFile.methods.fetchPennsieveFile(
      route.query.file_path,
      route.query.dataset_id,
      route.query.dataset_version
    )
    const sourcePackageId = file.sourcePackageId
    let packageType = "None"
    if (sourcePackageId !== 'details') {
      packageType = file.packageType
    }
    const hasTimeseriesViewer = packageType === 'TimeSeries' && config.public.SHOW_TIMESERIES_VIEWER == 'true'

    return {
      datasetInfo,
      file,
      sourcePackageId,
      packageType,
      hasTimeseriesViewer
    }
  },

  data: function() {
    return {
      tabs: [
        {
          label: 'Timeseries Viewer',
          id: 'timeseriesViewer'
        }
      ],
      activeTabId: 'timeseriesViewer',
    }
  },

  computed: {
    ...mapState(useMainStore, ['userToken']),
    title: function() {
      return propOr(undefined, 'name', this.datasetInfo)
    },
    datasetId: function() {
      return this.$route.query.dataset_id
    },
    datasetVersion: function() {
      return this.$route.query.dataset_version
    },
    filePath: function() {
      return this.$route.query.file_path
    },
  },
}
</script>

<style scoped lang="scss">
@import '@/assets/_viewer.scss';
</style>
