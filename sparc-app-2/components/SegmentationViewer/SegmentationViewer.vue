<template>
  <div class="biolucida-viewer">
    <template v-if="data.status !== 'error'">
      <p>
        <a :href="data.share_link" target="_blank">
          <el-button>
            View Full Screen
            <svgo-icon-full-screen
              class="icon-full-screen"
              height="24"
              width="24"
            />
          </el-button>
        </a>
      </p>
      <iframe :src="data.share_link" />
      <segmentation-viewer-metadata
        :segmentationData="data"
        :datasetInfo="datasetInfo"
        :file="file"
      />
    </template>
    <p v-else class="error">
      Sorry, an error has occurred
    </p>
  </div>
</template>

<script>
import SegmentationViewerMetadata from '@/components/ViewersMetadata/SegmentationViewerMetadata.vue'

export default {
  name: 'SegmentationViewer',

  components: {
    SegmentationViewerMetadata
  },

  props: {
    data: {
      type: Object,
      default: () => {
        return {
          share_link: '',
          status: ''
        }
      }
    },
    file: {
      type: Object,
      default: () => {}
    },
    datasetInfo: {
      type: Object,
      default: () => {}
    },
  }
}
</script>

<style lang="scss" scoped>
iframe {
  border: none;
  height: 500px;
  width: 100%;
}
.error {
  margin: 0;
  text-align: center;
}
.icon-full-screen {
  margin: -5px 0;
}
</style>
