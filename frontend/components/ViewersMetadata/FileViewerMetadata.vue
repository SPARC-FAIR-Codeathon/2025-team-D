<template>
  <div class="subpage">
    <div class="page-heading">
      <div class="heading2 file-detail__column">{{ file.name }}</div>
      <div class="page-heading__button">
        <el-button @click="executeDownload(file)">
          Download
        </el-button>
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column">Type</strong>
      <div class="file-detail__column">
        {{ file.fileType }}
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column">Size</strong>
      <div class="file-detail__column">
        {{ file.size ? formatMetric(file.size) : 'undefined' }}
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column">Date Created</strong>
      <div class="file-detail__column">
        {{ file.createdAt ? formatDate(file.createdAt) : 'undefined' }}
      </div>
    </div>
    <div class="file-detail">
      <strong class="file-detail__column">Dataset</strong>
      <div class="file-detail__column">
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
      <strong class="file-detail__column">File location</strong>
      <div class="file-detail__column">
        <nuxt-link
          :to="{
            name: `datasets-datasetId`,
            params: {
              datasetId
            },
            query: {
              datasetDetailsTab: 'files',
              path: location
            }
          }"
        >
          {{ location }}
        </nuxt-link>
      </div>
    </div>
  </div>
</template>

<script>
import FormatDate from '@/mixins/format-date'
import BfStorageMetrics from '@/mixins/bf-storage-metrics'

import { propOr } from 'ramda'

export default {
  name: "FileViewerMetadata",
  props: {
    file: {
      type: Object,
      default: () => {}
    },
    datasetInfo: {
      type: Object,
      default: () => {}
    }
  },
  mixins: [FormatDate, BfStorageMetrics],
  computed: {
    location: function() {
      return this.file.path.replace(`/${this.file.name}`, '')
    },
    datasetTitle: function() {
      return this.datasetInfo ? this.datasetInfo.name : 'Go to dataset'
    },
    datasetId: function() {
      return propOr(0, 'id', this.datasetInfo)
    }
  },
  methods: {
    executeDownload(file) {
      this.$emit("download-file", file)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
h1 {
  flex: 1;
  font-size: 1.5em;
  line-height: 2rem;
}
.page-heading {
  display: flex;
  flex-direction: column;
  margin-bottom: 1.375rem;
  @media (min-width: 48em) {
    flex-direction: row;
  }
  align-items: center;
}
.page-heading__button {
  flex-shrink: 0;
}

.file-detail {
  border-bottom: 1px solid $lineColor2;
  flex-direction: column;
  font-size: 0.875em;
  display: flex;
  padding: 1rem 0.625rem;
  @media (min-width: 48em) {
    flex-direction: row;
  }
}
.file-detail__column {
  flex: 1;
}

a {
  color: $purple;
}
</style>
