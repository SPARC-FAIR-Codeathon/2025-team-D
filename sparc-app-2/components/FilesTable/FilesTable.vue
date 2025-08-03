<template>
  <div class="files-table">
    <div class="files-table-header">
      <div class="breadcrumb-list">
        <div v-for="(item, idx) in breadcrumbs" :key="idx" class="breadcrumb">
          <nuxt-link
            class="breadcrumb-link"
            :to="{
              query: { ...$route.query, path: breadcrumbNavigation(idx) }
            }"
          >
            {{ item }}
          </nuxt-link>
          <span v-if="breadcrumbs.length > 1 && idx !== breadcrumbs.length - 1" class="breadcrumb-separator"> / </span>
        </div>
      </div>
    </div>

    <div class="files-table-table">
      <div v-if="hasError" class="error-wrap">
        <p>Sorry, an error has occurred</p>
        <el-button type="primary" @click="getFiles"> Try again </el-button>
      </div>
      <el-table
        v-else
        ref="table"
        :data="data"
        @selection-change="handleSelectionChange"
        @filter-change="handleFilterChange"
      >
        <el-table-column type="selection" fixed width="45" />
        <el-table-column
          fixed
          prop="name"
          label="Name"
          min-width="150"
          sortable
          :sort-method="(a, b) => sortWithCaseInsensitive(a.name, b.name)"
        >
          <template v-slot="scope">
            <div class="file-name-wrap">
              <template v-if="scope.row.type === 'Directory'">
                <el-icon class="file-icon"><Folder /></el-icon>
                <sparc-tooltip placement="left-center" :content="scope.row.name" is-repeating-item-content>
                  <template #item>
                    <nuxt-link class="file-name truncated" :to="{ query: { ...$route.query, path: scope.row.path } }">
                      {{ scope.row.name }}
                    </nuxt-link>
                  </template>
                </sparc-tooltip>
              </template>

              <template v-else>
                <el-icon v-if="isImage(scope.row.fileType)" class="file-icon"><Picture /></el-icon>
                <el-icon v-else class="file-icon"><Document /></el-icon>
                <div v-if="isFileOpenable(scope)" class="truncated">
                  <sparc-tooltip placement="left-center" :content="scope.row.name" is-repeating-item-content>
                    <template #item>
                      <div class="truncated">
                        <a href="#" @click.prevent="openFile(scope)">
                          {{ scope.row.name }}
                        </a>
                      </div>
                    </template>
                  </sparc-tooltip>
                </div>
                <div v-else-if="isScaffoldMetaFile(scope.row.path)" class="truncated">
                  <sparc-tooltip placement="left-center" :content="scope.row.name" is-repeating-item-content>
                    <template #item>
                      <div class="truncated">
                        <nuxt-link :to="getScaffoldLink(scope.row.path)">
                          {{ scope.row.name }}
                        </nuxt-link>
                      </div>
                    </template>
                  </sparc-tooltip>
                </div>
                <div v-else-if="scope.row.path && isScaffoldViewFile(scope.row.path)" class="truncated">
                  <sparc-tooltip placement="left-center" :content="scope.row.name" is-repeating-item-content>
                    <template #item>
                      <div class="truncated">
                        <nuxt-link :to="getScaffoldViewLink(scope.row.path, scope.row.name)">
                          {{ scope.row.name }}
                        </nuxt-link>
                      </div>
                    </template>
                  </sparc-tooltip>
                </div>
                <div v-else class="truncated">
                  <sparc-tooltip placement="left-center" :content="scope.row.name" is-repeating-item-content>
                    <template #item>
                      <div class="truncated">
                        <nuxt-link
                          :to="{
                            name: 'datasets-file-datasetId-datasetVersion',
                            params: {
                              datasetId: datasetInfo.id,
                              datasetVersion: datasetInfo.version
                            },
                            query: {
                              path: s3Path(scope.row)
                            }
                          }"
                        >
                          {{ scope.row.name }}
                        </nuxt-link>
                      </div>
                    </template>
                  </sparc-tooltip>
                </div>
              </template>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="fileType"
          label="File type"
          width="280"
          columnKey="fileType"
          sortable
          :filters="getFileTypeFilters(data)"
          :filter-method="fileTypeFilterStatus"
          filter-placement="top-start"
          filter-class-name="file-type-filter"
        >
          <template #header="{ column }">
            <span class="custom-header">
              {{ column.label }}
              <el-button v-if="isFilterApplied" class="custom-button" @click="handleResetFilters('fileType')">
                Reset filter
              </el-button>
            </span>
          </template>
          <template v-slot="scope">
            <template v-if="scope.row.type === 'Directory'"> Folder </template>

            <template v-else>
              {{ scope.row.fileType }}
            </template>
          </template>
        </el-table-column>
        <el-table-column prop="size" label="Size" width="220" :formatter="formatStorage" sortable />
        <el-table-column label="Action" width="200">
          <template v-slot="scope">
            <template v-if="scope.row.type === 'File'">
              <div v-if="!isFileTooLarge(scope.row)" class="circle" @click="executeDownload(scope.row)">
                <form id="zipForm" ref="zipForm" method="POST" :action="zipitUrl">
                  <input v-model="zipData" type="hidden" name="data" />
                </form>
                <sparc-tooltip placement="bottom-center" content="Download file">
                  <template #item>
                    <svgo-icon-download class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div v-else class="circle disabled">
                <sparc-tooltip placement="bottom-center" content="Files over 5GB in size must be downloaded via AWS">
                  <template #item>
                    <svgo-icon-download class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div v-if="isFileOpenable(scope)" class="circle" @click="openFile(scope)">
                <sparc-tooltip placement="bottom-center" content="View file in web viewer">
                  <template #item>
                    <svgo-icon-open class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div v-if="isScaffoldMetaFile(scope.row.path)" class="circle" @click="openScaffold(scope.row.path)">
                <sparc-tooltip placement="bottom-center" content="Open as 3d scaffold">
                  <template #item>
                    <svgo-icon-view class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div
                v-if="isScaffoldViewFile(scope.row.path)"
                class="circle"
                @click="openScaffoldView(scope.row.path, scope.row.name)"
              >
                <sparc-tooltip placement="bottom-center" content="Open as 3d scaffold">
                  <template #item>
                    <svgo-icon-view class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div v-if="isBiolucidaViewFile(scope.row.path)" class="circle" @click="openViewerFile(scope)">
                <sparc-tooltip placement="bottom-center" content="Open Biolucida Viewer">
                  <template #item>
                    <svgo-icon-view class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div v-if="isPlotViewFile(scope.row.path)" class="circle" @click="openViewerFile(scope)">
                <sparc-tooltip placement="bottom-center" content="Open Plot Viewer">
                  <template #item>
                    <svgo-icon-view class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div v-if="isVideoViewFile(scope.row.path)" class="circle" @click="openViewerFile(scope)">
                <sparc-tooltip placement="bottom-center" content="Open Video Viewer">
                  <template #item>
                    <svgo-icon-view class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div v-if="isSegmentationViewFile(scope.row.path)" class="circle" @click="openViewerFile(scope)">
                <sparc-tooltip placement="bottom-center" content="Open Segmentation Viewer">
                  <template #item>
                    <svgo-icon-view class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div class="circle" @click="setDialogSelectedFile(scope)">
                <sparc-tooltip placement="bottom-center">
                  <template #data>
                    <div class="osparc-service-btn-tooltip">
                      Open in o<sup>2</sup>S<sup>2</sup>PARC. Login is required,
                      <a href="/resources/4LkLiH5s4FV0LVJd3htsvH#user-accounts" target="_blank">
                        <u>here</u>
                      </a>
                      you can find more information on how to get an account.
                    </div>
                  </template>
                  <template #item>
                    <svgo-icon-osparc fill="red" class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div v-if="isTimeseriesViewFile(scope.row)" class="circle" @click="openViewerFile(scope)">
                <sparc-tooltip placement="bottom-center" content="Open timeseries viewer">
                  <template #item>
                    <svgo-icon-view class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
              <div v-if="isFileOpenable(scope)" class="circle" @click="copyS3Url(scope)">
                <sparc-tooltip placement="bottom-center" content="Copy link">
                  <template #item>
                    <svgo-icon-permalink-nobg class="action-icon" />
                  </template>
                </sparc-tooltip>
              </div>
            </template>
            <template v-else> - </template>
          </template>
        </el-table-column>
      </el-table>
      <osparc-file-viewers-dialog
        :show-dialog="dialogSelectedFile !== null"
        :viewers="osparcViewers"
        :selected-file="dialogSelectedFile"
        @dialog-closed="() => setDialogSelectedFile(null)"
      />
    </div>
    <sparc-tooltip
      v-if="selected.length == 0"
      class="tooltip"
      placement="left-center"
      content="You must select a file to download"
    >
      <template #item>
        <bf-download-file
          class="mt-16"
          disabled
          :selected="selected"
          :dataset="datasetInfo"
          :file-path="path"
          @remove-selection="removeSelection"
        />
      </template>
    </sparc-tooltip>
    <sparc-tooltip
      v-else-if="selectedFilesSizeTooLarge"
      class="tooltip"
      placement="left-center"
      content="Selected file size(s) exceed 5GB"
    >
      <template #item>
        <bf-download-file
          class="mt-16"
          disabled
          :selected="selected"
          :dataset="datasetInfo"
          :file-path="path"
          @remove-selection="removeSelection"
        />
      </template>
    </sparc-tooltip>
    <bf-download-file
      v-else
      class="mt-16"
      :selected="selected"
      :dataset="datasetInfo"
      :file-path="path"
      @remove-selection="removeSelection"
    />
  </div>
</template>

<script>
import { compose, isEmpty, join, reject, slice, split, propOr, last, defaultTo, pathOr } from 'ramda'

import BfDownloadFile from '@/components/BfDownloadFile/BfDownloadFile'
import OsparcFileViewersDialog from '@/components/FilesTable/OsparcFileViewersDialog.vue'
import { mapState } from 'pinia'
import { useMainStore } from '../../store'

import FormatStorage from '@/mixins/bf-storage-metrics/index'
import { successMessage, failMessage } from '@/utils/notification-messages'

const openableFileTypes = ['pdf', 'text', 'jpeg', 'png', 'svg']

export const contentTypes = {
  pdf: 'application/pdf',
  text: 'text/plain',
  jpeg: 'image/jpeg',
  png: 'image/png',
  svg: 'img/svg+xml',
  mp4: 'video/mp4',
  csv: 'text/csv',
  msword: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
}

export default {
  name: 'FilesTable',

  components: {
    BfDownloadFile,
    OsparcFileViewersDialog
  },

  mixins: [FormatStorage],

  props: {
    osparcViewers: {
      type: Object,
      default: function() {
        return {}
      }
    },
    datasetScicrunch: {
      type: Object,
      default: () => {
        return {}
      }
    }
  },

  data: function() {
    return {
      previousPath: '',
      schemaRootPath: 'files',
      data: [],
      isLoading: false,
      hasError: false,
      limit: 500,
      selected: [],
      dialogSelectedFile: null,
      zipData: '',
      filtersApplied: []
    }
  },

  computed: {
    /**
     * Get dataset info from the store
     * @returns {Object}
     */
    ...mapState(useMainStore, ['datasetInfo', 'userToken']),
    /**
     * Compute the current path for the dataset's files.
     * @returns {String}
     */
    path: function() {
      return this.$route.query.path ? this.$route.query.path : this.schemaRootPath
    },

    breadcrumbs: function() {
      return compose(reject(isEmpty), split('/'))(this.path)
    },

    /**
     * Compute endpoint URL to get dataset's files
     * @returns {String}
     */
    getFilesurl: function() {
      const id = pathOr('', ['params', 'datasetId'], this.$route)
      const version = this.datasetVersion
      const url = `${this.$config.public.discover_api_host}/datasets/${id}/versions/${version}/files/browse`
      let filesUrl = `${url}?path=${this.path}&limit=${this.limit}`
      if (this.userToken) {
        filesUrl += `&api_key=${this.userToken}`
      }
      return filesUrl
    },

    /**
     * Url to retrieve the dataset to get the version number
     * @returns {String}
     */
    getFilesIdUrl: function() {
      const id = pathOr('', ['params', 'datasetId'], this.$route)
      const version = this.datasetVersion
      return `${this.$config.public.discover_api_host}/datasets/${id}/versions/${version}`
    },

    /**
     * Compute the version of this dataset.
     * @returns {String}
     */
    datasetVersion: function() {
      return propOr(1, 'version', this.datasetInfo)
    },
    /**
     * Compute URL for zipit service
     * @returns {String}
     */
    zipitUrl: function() {
      return this.$config.public.zipit_api_host
    },
    selectedFilesSizeTooLarge: function() {
      let totalSize = 0
      this.selected.forEach(file => {
        totalSize += file.size
      })
      return totalSize >= this.$config.public.max_download_size
    },
    isFilterApplied() {
      return this.filtersApplied.length > 0
    }
  },

  watch: {
    '$route.query.path': 'pathQueryChanged',
    userToken: {
      handler: function() {
        this.getFiles()
      },
      immediate: true
    }
  },

  methods: {
    /**
     * Check if the file is openable
     * MS Office files and native browser files
     * - Documents (pdf, text)
     * - Images (jpg, png)
     * - Video (MP4)
     * - Vector Drawings (svg)
     */
    isFileOpenable(scope) {
      const fileType = scope.row.fileType
      return this.isMicrosoftFileType(scope) || openableFileTypes.includes(fileType)
    },

    isFileTooLarge(file) {
      const fileSize = propOr(0, 'size', file)
      return fileSize > this.$config.public.max_download_size
    },

    handleSelectionChange(val) {
      this.selected = val
    },

    isTimeseriesViewFile(file) {
      const type = propOr('', 'packageType', file)
      return type === 'TimeSeries' && this.$config.public.SHOW_TIMESERIES_VIEWER == 'true'
    },

    /**
     * Converts a semver version string to an integer
     * @param {String} semverVersion
     */
    convertSchemaVersionToInteger: function(semverVersion) {
      // split version number into parts
      let parts = semverVersion.split('.')
      // make sure no part is larger than 1023 or else it won't fit
      // into 32-bit integer
      parts.forEach(part => {
        if (part >= 1024) {
          throw new Error(`Version string invalid, ${part} is too large`)
        }
      })
      let numericVersion = 0
      // shift all parts either 0, 10, or 20 bits to the left
      for (let i = 0; i < 3; i++) {
        numericVersion |= parts[i] << (i * 10)
      }
      return numericVersion
    },

    /**
     * Gets the dataset version number to get the files for the dataset
     */
    getDatasetVersionNumber: function() {
      this.isLoading = true
      this.hasError = false

      this.$axios
        .get(this.getFilesIdUrl)
        .then(({ data }) => {
          const schemaVersion = this.convertSchemaVersionToInteger(data.pennsieveSchemaVersion)
          if (schemaVersion < 4.0) {
            this.schemaRootPath = 'packages'
          }
          this.getFiles()
        })
        .catch(() => {
          this.hasError = true
        })
    },
    /**
     * Checks if file is MS Word, MS Excel, or MS Powerpoint
     * @param {Object} scope
     */
    isMicrosoftFileType: function(scope) {
      return scope.row.fileType == 'MSWord' || scope.row.fileType == 'MSExcel' || scope.row.fileType == 'PowerPoint'
    },
    /**
     * Get contents of directory
     */
    getFiles: function() {
      this.hasError = false
      this.isLoading = true
      this.previousPath = this.path

      this.$axios
        .get(this.getFilesurl)
        .then(({ data }) => {
          this.data = data.files
        })
        .catch(() => {
          this.hasError = true
        })
        .finally(() => {
          this.isLoading = false
        })
    },

    /**
     * When the path query changes get files.
     */
    pathQueryChanged: function() {
      this.$refs.table.clearFilter()
      this.handleResetFilters('fileType')
      this.getFiles()
    },

    /**
     * Navigate to another directory via breadcrumb
     * @param {Integer} idx
     */
    breadcrumbNavigation: function(idx) {
      const itemIdx = idx + 1

      return compose(join('/'), slice(0, itemIdx))(this.breadcrumbs)
    },

    /**
     * Format storage column
     * @param {Object} row
     * @param {Object} column
     * @param {Number} cellValue
     * @returns {String}
     */
    formatStorage: function(row, column, cellValue) {
      return this.formatMetric(cellValue)
    },

    /**
     * Shows the oSPARC viewers selector
     */
    setDialogSelectedFile: function(scope) {
      this.dialogSelectedFile = scope ? scope.row : null
    },

    getViewFileUrl(scope) {
      let uri = `${pathOr('', ['row', 'uri'], scope).replace('s3://', '')}`
      let s3BucketName = uri.substring(0, uri.indexOf('/'))
      const filePath = compose(last, defaultTo([]), split(`s3://${s3BucketName}/`), pathOr('', ['row', 'uri']))(scope)

      const fileType = scope.row.fileType.toLowerCase()
      const contentType = contentTypes[fileType]

      const requestUrl = `${this.$config.public.portal_api}/download?s3BucketName=${s3BucketName}&key=${filePath}&contentType=${contentType}`

      return this.$axios.get(requestUrl).then(({ data }) => {
        const url = data
        const encodedUrl = encodeURIComponent(url)
        return this.isMicrosoftFileType(scope) ? `https://view.officeapps.live.com/op/view.aspx?src=${encodedUrl}` : url
      })
    },

    /**
     * Opens a file in a new tab
     * This is currently for MS Word, MS Excel, and Powerpoint files only
     * @param {Object} scope
     */
    openFile: function(scope) {
      this.$gtm.trackEvent({
        event: 'interaction_event',
        event_name: 'view_file_in_web_browser',
        file_name: pathOr('', ['row', 'name'], scope),
        file_path: pathOr('', ['row', 'path'], scope),
        file_type: pathOr('', ['row', 'fileType'], scope),
        location: '',
        category: '',
        dataset_id: this.datasetInfo.id,
        version_id: this.datasetVersion,
        doi: '',
        citation_type: '',
        files: ''
      })
      this.getViewFileUrl(scope).then(response => {
        window.open(response, '_blank')
      })
    },

    executeDownload(downloadInfo) {
      const datasetVersionRegexp = /(?<datasetId>\d*)\/(?<filePath>.*)/
      let params = downloadInfo.uri.replace('s3://', '')
      let firstIndex = params.indexOf('/') + 1
      params = params.substr(firstIndex)
      const matches = params.match(datasetVersionRegexp)

      const payload = {
        paths: [matches.groups.filePath, 'manifest.json'],
        datasetId: matches.groups.datasetId,
        version: this.datasetVersion,
        archiveName: `sparc-portal-dataset-${this.datasetInfo.id}-version-${this.datasetVersion}-data`
      }

      this.zipData = JSON.stringify(payload, undefined)
      this.$nextTick(() => {
        this.$refs.zipForm.submit() // eslint-disable-line no-undef
      })
      this.$gtm.trackEvent({
        event: 'interaction_event',
        event_name: 'dataset_file_download',
        files: propOr('', 'paths', payload),
        file_name: '',
        file_path: '',
        file_type: '',
        location: '',
        category: '',
        dataset_id: this.datasetInfo.id,
        version_id: this.datasetVersion,
        doi: '',
        citation_type: ''
      })
    },

    /**
     * Create nuxt-link object for opening a scaffold.
     * @param {Object} scope
     */
    getScaffoldLink: function(path) {
      const id = pathOr('', ['params', 'datasetId'], this.$route)
      const version = this.datasetVersion
      return {
        name: 'maps',
        params: {},
        query: { type: 'scaffold', dataset_id: id, dataset_version: version, file_path: path }
      }
    },

    /**
     * Create nuxt-link object for opening a scaffold.
     * @param {Object} scope
     */
    getScaffoldViewLink: function(filePath, name) {
      const id = pathOr('', ['params', 'datasetId'], this.$route)
      const version = this.datasetVersion
      if (filePath && this.datasetScicrunch && this.datasetScicrunch['abi-scaffold-view-file']) {
        const shortened = filePath.replace('files/', '')

        // Find the file with a matching name
        let viewMetadata = this.datasetScicrunch['abi-scaffold-view-file'].filter(
          viewFile => viewFile.dataset.path === shortened
        )[0]

        // Find the current directory path. Note that the trailing '/' is included
        const currentDirectoryPath = filePath.split(name)[0]

        // Create paths for fetching the files from 'sparc-api/s3-resource/'
        const scaffoldPath = `${currentDirectoryPath}${viewMetadata.datacite.isDerivedFrom.relative.path[0]}`
        return {
          name: 'maps',
          params: {},
          query: { type: 'scaffold', dataset_id: id, dataset_version: version, file_path: scaffoldPath, viewURL: name }
        }
      }
      return {}
    },

    /**
     * Open scaffold
     * @param {Object} scope
     */
    openScaffold: function(path) {
      this.$router.push(this.getScaffoldLink(path))
    },

    /**
     * Open scaffold view file
     * @param {Object} scope
     */
    openScaffoldView: function(path, name) {
      const scaffoldViewLink = this.getScaffoldViewLink(path, name)
      if (scaffoldViewLink) {
        this.$router.push(scaffoldViewLink)
      }
    },
    /**
     * Checks if file is a scaffold view port
     * @param {Object} scope
     */
    isScaffoldViewFile: function(path) {
      if (path && this.datasetScicrunch && this.datasetScicrunch['abi-scaffold-view-file']) {
        path = path.replace('files/', '')
        for (let i = 0; i < this.datasetScicrunch['abi-scaffold-view-file'].length; i++) {
          if (this.datasetScicrunch['abi-scaffold-view-file'][i].dataset.path === path) return true
        }
      }
      return false
    },
    /**
     * Checks if file is openable by scaffold viewer
     * @param {Object} scope
     */
    isScaffoldMetaFile: function(path) {
      if (path && this.datasetScicrunch && this.datasetScicrunch['abi-scaffold-metadata-file']) {
        path = path.replace('files/', '')
        for (let i = 0; i < this.datasetScicrunch['abi-scaffold-metadata-file']?.length; i++) {
          if (this.datasetScicrunch['abi-scaffold-metadata-file'][i]?.dataset?.path === path) return true
        }
      }
      return false
    },
    isBiolucidaViewFile: function(path) {
      if (
        path &&
        this.datasetScicrunch &&
        (this.datasetScicrunch['biolucida-2d'] || this.datasetScicrunch['biolucida-3d'])
      ) {
        const biolucida2dObjects = this.datasetScicrunch['biolucida-2d']
        const biolucida3dObjects = this.datasetScicrunch['biolucida-3d']
        const biolucidaObjects =
          biolucida2dObjects == undefined
            ? biolucida3dObjects
            : biolucida2dObjects.concat(biolucida3dObjects).filter(item => item !== undefined)
        path = path.replace('files/', '')
        for (let i = 0; i < biolucidaObjects.length; i++) {
          const biolucidaId = biolucidaObjects[i]?.biolucida?.identifier
          if (biolucidaObjects[i].dataset.path === path && biolucidaId !== undefined) {
            return true
          }
        }
      }
      return false
    },
    isPlotViewFile: function(path) {
      if (path && this.datasetScicrunch && this.datasetScicrunch['abi-plot']) {
        let plotObjects = this.datasetScicrunch['abi-plot']
        path = path.replace('files/', '')
        for (let i = 0; i < plotObjects.length; i++) {
          if (plotObjects[i].dataset.path === path) return true
        }
      }
      return false
    },
    isVideoViewFile: function(path) {
      if (path && this.datasetScicrunch && this.datasetScicrunch['video']) {
        let videoObjects = this.datasetScicrunch['video']
        path = path.replace('files/', '')
        for (let i = 0; i < videoObjects.length; i++) {
          if (videoObjects[i].dataset.path == path) return true
        }
      }
      return false
    },
    isSegmentationViewFile: function(path) {
      if (path && this.datasetScicrunch && this.datasetScicrunch['mbf-segmentation']) {
        let segmentationObjects = this.datasetScicrunch['mbf-segmentation']
        path = path.replace('files/', '')
        for (let i = 0; i < segmentationObjects.length; i++) {
          if (segmentationObjects[i].dataset.path === path) return true
        }
      }
      return false
    },
    openViewerFile(scope) {
      const route = {
        name: 'file-datasetId-datasetVersion',
        params: {
          datasetId: this.datasetInfo.id,
          datasetVersion: this.datasetInfo.version
        },
        query: {
          path: this.s3Path(scope.row)
        }
      }

      this.$router.push(route)
    },
    /**
     * Compute if the file is an image
     * @returns {Boolean}
     */
    isImage: function(fileType) {
      const images = ['JPG', 'PNG', 'JPEG', 'TIFF', 'GIF']
      return images.indexOf(fileType) >= 0
    },

    /**
     * Remove selection
     * @param {Object} row
     */
    removeSelection(row) {
      this.selected = this.selected.filter(f => f.path !== row.path)

      const selectedPaths = this.selected.map(s => s.path)
      this.data.forEach(r => {
        this.$refs.table.toggleRowSelection(r, selectedPaths.includes(r.path))
      })
    },

    /**
     * Copy file URL to clipboard
     * @param {Object} scope
     */
    copyS3Url(scope) {
      this.getViewFileUrl(scope).then(response => {
        navigator.clipboard.writeText(response).then(
          () => {
            successMessage(`File URL copied to clipboard.`)
          },
          () => {
            failMessage(`Cannot copy to clipboard.`)
          }
        )
      })
    },
    sortWithCaseInsensitive(name1, name2) {
      var a = name1.toUpperCase()
      var b = name2.toUpperCase()
      if (a > b) return 1
      if (a < b) return -1
      return 0
    },
    s3Path(file) {
      const uri = file.uri
      return uri.substring(uri.indexOf('files/'))
    },
    getFileTypeFilters: function(data) {
      let fileTypeLabels = [...new Set(data.map(item => (item.fileType ? item.fileType : item.type)))]
      return fileTypeLabels.map(label => {
        if (label == 'Directory') {
          return {
            text: 'Folder',
            value: label
          }
        } else {
          return {
            text: label,
            value: label
          }
        }
      })
    },
    fileTypeFilterStatus: function(value, row, col) {
      return row.fileType ? row.fileType == value : row.type == value
    },
    handleFilterChange(filters) {
      this.filtersApplied = filters?.fileType
    },
    handleResetFilters(columnKey) {
      this.$refs.table.clearFilter([columnKey])
      this.filtersApplied = []
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.breadcrumb {
  background: none;
  height: auto;
}
.tooltip {
  display: flex;
  width: fit-content;
}
.files-table-header {
  align-items: center;
  display: flex;
}
.breadcrumb-list {
  align-items: center;
  display: flex;
  flex: 1;
  flex-wrap: wrap;
}
.breadcrumb-link {
  word-break: break-word;
  text-decoration: underline;
  color: $purple;
}
.breadcrumb-separator {
  margin: 0 4px;
}
.files-table-table {
  background: #fff;
}
.error-wrap {
  text-align: center;
}
.file-name-wrap {
  display: flex;
}
.truncated {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.file-name {
  color: $purple;
}
.file-icon {
  color: #000;
  font-size: 16px;
  flex-shrink: 0;
  margin: 3px 8px 0 0;
}
.circle {
  display: inline-block;
  height: 1.5em;
  width: 1.5em;
  line-height: 1.5em;
  margin-right: 4px;
  -moz-border-radius: 0.75em; /* or 50% */
  border-radius: 0.75em; /* or 50% */
  background-color: $purple;
  color: #fff;
  cursor: pointer;
  writing-mode: vertical-rl;
  -webkit-writing-mode: vertical-rl;
  vertical-align: top;
}
.disabled {
  opacity: 0.6;
}
:deep(.el-table) {
  th {
    .cell {
      color: black;
      font-size: 14px;
      font-weight: 500;
      line-height: 16px;
    }
    &.el-table-column--selection .cell {
      padding: 0 16px;
      text-overflow: unset;
    }
  }
}
.osparc-service-btn-tooltip {
  sup,
  sub {
    vertical-align: baseline;
    position: relative;
    top: -0.4em;
  }
  sub {
    top: 0.4em;
  }
}
.action-icon {
  width: 1.5rem;
  height: 1.5rem;
}
.custom-button {
  position: absolute;
  left: 7rem;
  top: 0.35rem;
  max-width: 5rem;
  width: -webkit-fill-available;
  height: 1rem;
}
:global(.file-type-filter .el-table-filter__bottom button) {
  background-color: $purple;
  color: white;
  border-radius: 10%;
  margin-right: 0.25rem;
  padding: 0.2rem 0.3rem 0.2rem 0.3rem;
}
</style>
