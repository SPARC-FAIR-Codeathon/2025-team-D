<template>
  <el-card :style="{ border: 'none', maxWidth: width + 'rem' }" class="card">
    <el-row :gutter="20">
      <el-col :span="8">
        <img class="banner-image" :src="item.banner" />
      </el-col>
      <el-col class="body1" :span="16">
        <nuxt-link
          class="dataset-name"
          :to="{
            name: 'datasets-datasetId',
            params: {
              datasetId: datasetId
            }
          }"
        >
          {{ datasetTitle }}
        </nuxt-link>
        <div>
          Total Downloads: <b>{{ numDownloads }}</b>
        </div>
        <div>
          Citations: <b>{{ numCitations }}</b>
        </div>
      </el-col>
    </el-row>
  </el-card>
</template>

<script>

import { propOr } from 'ramda'

export default {
  name: 'DatasetCard',
  props: {
    item: {
      type: Object,
      default: {}
    },
    width: {
      type: Number,
      default: 68
    },
  },
  computed: {
    datasetId() {
      return propOr('', 'intId', this.item)
    },
    datasetTitle() {
      return propOr('', 'name', this.item)
    },
    numDownloads() {
      return propOr('', 'numDownloads', this.item)
    },
    numCitations() {
      return propOr('', 'numCitations', this.item)
    }
  }
}
</script>

<style lang="scss" scoped>
.card {
  background-color: transparent;
  position: relative;
  cursor: default;
  text-align: left;
}
.banner-image {
  display: block;
  width: 100%;
  max-height: 200px;
}
.dataset-name {
  overflow-wrap: anywhere;
}
</style>
