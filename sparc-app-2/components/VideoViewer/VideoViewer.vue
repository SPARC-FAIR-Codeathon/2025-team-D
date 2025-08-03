<template>
  <div class="page-wrap container">
    <div class="video-container">
      <video ref="vid" class="video" controls crossorigin playsinline>
        <source :src="videoSource" :type="mimetype" size="1080" @error="failedVideoHandler"/>
        <p>
          Your browser doesn't support HTML5 video. Here is a a
          <a :href="videoSource">link to the video</a> instead.
        </p>
      </video>
    </div>
    <video-viewer-metadata
      :datasetInfo="datasetInfo"
      :file="file"
    />
  </div>
</template>

<script>
import Plyr from 'plyr'
import VideoViewerMetadata from "@/components/ViewersMetadata/VideoViewerMetadata.vue"
import FileDetails from '@/mixins/file-details'
import { failMessage } from '@/utils/notification-messages'
import { propOr } from 'ramda'

export default {
  name: 'VideoViewer',

  components: {
    VideoViewerMetadata,
  },

  mixins: [FileDetails],

  props: {
    videoData: {
      type: Object,
      default: () => {}
    },
    videoSource: {
      type: String,
      default: ""
    },
    file: {
      type: Object,
      default: () => {}
    },
    datasetInfo: {
      type: Object,
      default: () => {}
    },
  },
  
  data: () => {
    return {
      video_src: "",
    }
  },

  computed: {
    mimetype() {
      return this.videoData.mimetype.name
    },
    datasetId() {
      return propOr(undefined, "id", this.datasetInfo)
    },
    versionId() {
      return propOr(undefined, "version", this.datasetInfo)
    },
  },

  async fetch() {
    try {
      this.player = new Plyr(this.$refs.vid)
    } catch(e) {
      console.log(e)
    }
  },

  methods: {
    failedVideoHandler: function(e) {
      failMessage('There was a problem while opening the video. Please try with another browser or use the Download button below.')
    }
  },
}
</script>

<style scoped lang="scss">
@import '@/assets/_viewer.scss';
</style>
<style lang="scss">
.video-container {
  padding-top: 0.5rem;
}
.video {
  width: 100%;
}
</style>

