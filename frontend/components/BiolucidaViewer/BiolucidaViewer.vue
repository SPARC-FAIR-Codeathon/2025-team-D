<template>
  <div class="biolucida-viewer">
    <template v-if="data.status !== 'error'">
      <el-row class="mb-2 justify-space-between" type="flex">
        <div>
          <el-button class="ml-8" @click="launchViewer">
            <sparc-tooltip
              placement="bottom-center"
              content="Open in Biolucida desktop application"
            >
              <template #item>
                <div>
                  View in 3D
                </div>
              </template>
            </sparc-tooltip>
          </el-button>
          <el-button class="ml-8" @click="launchNL360C">
            <sparc-tooltip
              placement="top-center"
              content="Open in Neurolucida 360 Cloud"
            >
            <template #item>
              <div>
                View in Neurolucida 360
              </div>
            </template>
            </sparc-tooltip>
          </el-button>
        </div>
        <button class="btn-copy-permalink" @click="queryView">
          <sparc-tooltip placement="bottom-center" content="Copy Link">
            <template #item>
              <div>
                <svgo-icon-permalink class="permalink-icon"/>
              </div>
            </template>
          </sparc-tooltip>
        </button>
      </el-row>
      <iframe ref="biolucida" :src="data.share_link" @load="biolucidaLoaded" />
      <biolucida-viewer-metadata
        :biolucidaData="data"
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
import { successMessage, failMessage } from '@/utils/notification-messages'

import BiolucidaViewerMetadata from '@/components/ViewersMetadata/BiolucidaViewerMetadata.vue'
import biolucida from '~/services/biolucida'

export default {
  name: 'BiolucidaViewer',

  components: {
    BiolucidaViewerMetadata,
  },

  props: {
    data: {
      type: Object,
      default: () => {
        return {
          biolucida_image_id: '',
          blv_link: '',
          share_link: '',
          status: '',
          location: '',
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
  },
  async setup(props) {
    try {
      const config = useRuntimeConfig()
      const image_identifier = props.data.biolucida_image_id
      const viewId = props.data.share_link.replace(
        config.public.BL_SHARE_LINK_PREFIX,
        ''
      )
      const [
        blv_info,
        view_info,
        image_info,
      ] = await Promise.all([
        biolucida.getBLVLink(image_identifier),
        biolucida.decodeViewParameter(viewId),
        biolucida.getImageInfo(image_identifier),
      ])
      const blv_link = props.data.blv_link ? props.data.blv_link : blv_info['link']
      const BASE_URL = `blv:${config.public.BL_SERVER_URL}`
      const queryParameters = `image_id=${image_identifier}&type=${view_info[1]}${view_info[2]}&filename=${image_info.name}`
      const webNeurolucidaLink = BASE_URL + '/image_view?' + queryParameters

      return {
        blv_link,
        webNeurolucidaLink
      }
    } catch (e) {
      console.log(e)
    }
  },
  mounted() {
    window.addEventListener('message', this.receiveMessage)
  },
  beforeDestroy() {
    window.removeEventListener('message', this.receiveMessage)
  },
  methods: {
    launchViewer() {
      window.open(this.blv_link, '_blank')
    },
    launchNL360C() {
      biolucida
        .fetchNeurolucida360Url({
          applicationRequest: 'NL360',
          userID: 'SPARCPortal',
          sessionContext: this.webNeurolucidaLink
        })
        .then(response => {
          if (response.data.url) {
            window.open(response.data.url, '_blank')
          } else {
            failMessage(
              'Unable to open image with Neurlucida 360 Cloud at this time.'
            )
          }
        })
        .catch(() => {
          failMessage(
            'Unable to open image with Neurlucida 360 Cloud at this time.'
          )
        })
    },
    queryView() {
      this.$refs.biolucida.contentWindow.postMessage(
        'getImgPos',
        this.$config.public.BL_SERVER_URL
      )
    },
    biolucidaLoaded() {
      if (this.data.location) {
        this.$refs.biolucida.contentWindow.postMessage(
          this.data.location,
          this.$config.public.BL_SERVER_URL
        )
      }
    },
    receiveMessage(event) {
      if (event.origin === this.$config.public.BL_SERVER_URL) {
        const message = event.data
        if (message === 'setting x,y,z,f failed') {
          failMessage('Unable to set image location.')
        } else if (!message.startsWith('setting x,y,z,f ')) {
          let linkPath = `${this.$config.public.ROOT_URL}${this.$route.fullPath}`
          if (this.$route.query && this.$route.query.location) {
            linkPath = linkPath.replace(this.$route.query.location, message)
          } else {
            linkPath += `&location=${message}`
          }
          navigator.clipboard.writeText(linkPath).then(
            () => {
              successMessage('Share link copied to clipboard.')
            },
            () => {
              failMessage('Failed to copy share link.')
            }
          )
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
@import '@/assets/_viewer.scss';

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

.justify-space-between {
  justify-content: space-between;
}
.permalink-icon {
  height: 1.75rem;
  width: 1.75rem;;
}
</style>
