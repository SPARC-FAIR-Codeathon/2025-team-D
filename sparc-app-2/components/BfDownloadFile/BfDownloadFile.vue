<template>
  <div>
    <el-button class="secondary alt" @click="onDownloadClick" :disabled="disabled">
      Download Selected Files and Folders
    </el-button>
    <form id="zipForm" ref="zipForm" method="POST" :action="zipitUrl">
      <input v-model="zipData" type="hidden" name="data" />
    </form>
    <el-dialog
      v-model="confirmDownloadVisible"
      show-close
      @close="closeConfirmDownload"
    >
      <template #header>
        <div class="mb-16">
          Confirm Download
        </div>
      </template>
      <div class="bf-dialog-body">
        <div v-if="showReduceSize" class="mb-24">
          <p>
            The file(s) you are trying to download exceed the limit of
            {{ maxDownloadSize }}. Please reduce the number of files selected
            and try again.
          </p>
          <el-table :show-header="false" :border="false" :data="selected">
            <el-table-column prop="name" />
            <el-table-column align="right">
              <template v-slot="scope">
                {{ formatMetric(scope.row.size) }}
                <button @click="$emit('remove-selection', scope.row)" class="btn btn-remove">
                  <svgo-icon-remove
                    height="12"
                    width="12"
                  />
                </button>
              </template>
            </el-table-column>
          </el-table>
        </div>
        <div v-if="selected.length > 1" class="download-name mb-16">
          <label for="downloadName">
            File Name
          </label>
          <el-input id="downloadName" v-model="archiveName" />
          <span>.zip</span>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button class="secondary" @click="closeConfirmDownload">
            Cancel
          </el-button>
          <el-button :disabled="downloadDisabled" @click="confirmDownload">
            Download
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import StorageMetrics from '@/mixins/bf-storage-metrics'
import { propOr } from 'ramda'

export default {
  name: 'BfDownloadFile',

  mixins: [StorageMetrics],

  props: {
    selected: {
      type: Array,
      default: () => {
        return []
      }
    },
    dataset: {
      type: Object,
      default: () => {
        return {}
      }
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data(props) {
    return {
      zipData: '',
      confirmDownloadVisible: false,
      archiveName: `sparc-portal-dataset-${this.dataset.id}-version-${this.dataset.version}-data`,
      showReduceSize: false,
      downloadConfirmed: false
    }
  },

  computed: {
    /**
     * Compute URL for zipit service
     * @returns {String}
     */
    zipitUrl: function() {
      return this.$config.public.zipit_api_host
    },

    /**
     * download is disabled if the total size is greater than the threshold, or no rows are selected
     * @returns {Boolean}
     */
    downloadDisabled() {
      if (this.selected.length === 0) return true
      const totalSize = this.selected.reduce(
        (total, node) => total + node.size || 0,
        0
      )

      return totalSize > this.$config.public.max_download_size
    },

    /**
     * determines whether the confirm download dialog should open
     * @returns {Boolean}
     */
    shouldConfirmDownload() {
      return (
        this.downloadDisabled ||
        (this.selected.length > 1 && !this.downloadConfirmed)
      )
    },

    /**
     * Compute max size for download
     * @returns {Number}
     */
    maxDownloadSize() {
      return this.formatMetric(this.$config.public.max_download_size)
    }
  },

  methods: {
    /**
     * Show the confirm dialog if downloading multiple files
     * Otherwise, just download the file
     */
    onDownloadClick() {
      if (this.shouldConfirmDownload) {
        this.showReduceSize = this.downloadDisabled
        this.confirmDownloadVisible = true
      } else {
        this.executeDownload()
      }
    },

    /**
     * Confirm to start the download, or show the
     */
    confirmDownload() {
      this.downloadConfirmed = true
      this.onDownloadClick()
    },

    executeDownload() {
      const mainPayload = {
        paths: [...this.selected.map(f => f.path), "manifest.json"],
        datasetId: `${this.dataset.id}`,
        version: `${this.dataset.version}`
      }

      if (this.archiveName == "") {
        this.archiveName = `sparc-portal-dataset-${this.dataset.id}-version-${this.dataset.version}-data`
      }
      const archiveNamePayload = { archiveName: this.archiveName }

      const payload = {
        ...mainPayload,
        ...archiveNamePayload
      }

      this.zipData = JSON.stringify(payload, undefined)
      this.$nextTick(() => {
        this.$refs.zipForm.submit() // eslint-disable-line no-undef
      })
      this.$gtm.trackEvent({
        event: 'interaction_event',
        event_name: 'dataset_file_download',
        files: propOr('', 'paths', payload),
        file_name: "",
        file_path: "",
        file_type: "",
        category: "",
        dataset_id: this.dataset.id,
        version_id: this.dataset.version,
        doi: "",
        citation_type: "",
        location: ""
      })
      this.closeConfirmDownload()
    },

    closeConfirmDownload() {
      this.downloadConfirmed = false
      this.showReduceSize = false
      this.confirmDownloadVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.btn {
  background: none;
  border: none;
  color: #000;
  cursor: pointer;
  &:active {
    outline: none;
  }
}
.btn-remove {
  box-sizing: border-box;
  height: 1rem;
  width: 1rem;
}
.bf-dialog-header {
  align-items: center;
  display: flex;
  position: relative;
}
.bf-dialog-header-title {
  flex: 1;
  font-size: 18px;
  font-weight: 400;
  line-height: 1;
  margin-right: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #000;
}

.bf-dialog-body {
  word-break: normal;
}

.download-name {
  display: flex;
  align-items: center;
  label {
    min-width: 64px;
  }
  :deep(.el-input) {
    margin: 0 8px;
  }
}
</style>
