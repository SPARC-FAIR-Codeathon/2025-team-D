<template>
  <el-card :style="{ border: 'none', maxWidth: width + 'rem' }" class="card">
    <el-row :gutter="20">
      <img class="banner-image" :src="datasetBanner" />
      <!--<nuxt-link
        class="dataset-name"
        :to="{
          name: 'datasets-datasetId',
          params: {
            datasetId: datasetId
          }
        }"
      >
        {{ datasetTitle }}
      </nuxt-link>-->
      <div class="description-container mb-4">
        {{ datasetDescription }}
      </div>
      <nuxt-link
        :to="{
          name: 'datasets-datasetId',
          params: {
            datasetId: datasetId
          },
          query: {
            datasetDetailsTab: 'images'
          }
        }"
      >
        <el-button>
          View Gallery
        </el-button>
      </nuxt-link>
    </el-row>
  </el-card>
</template>

<script>

import { propOr } from 'ramda'

export default {
  name: 'RelatedDatasetCard',
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
      return propOr('', 'id', this.item)
    },
    datasetTitle() {
      return propOr('', 'name', this.item)
    },
    datasetDescription() {
      return propOr('', 'description', this.item)
    },
    datasetBanner() {
      return propOr('', 'banner', this.item)
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
  max-height: 150px;
  object-fit: contain;
}
.dataset-name {
  overflow-wrap: anywhere;
}
.description-container {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  -webkit-line-clamp: 6;
}
</style>
