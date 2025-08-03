<template>
  <el-card :shadow="shadow" :style="{ padding: '0px', width: width + 'rem' }">
    <div v-loading="!isReady">
      <div class="cursor-pointer" @click.prevent="cardClicked">
        <img class="thumbnail" :src="thumbnail" alt="thumbnail loading ..." />
      </div>
      <div v-if="showCardDetails" class="details">
        <p v-if="!data.hideType">
          <b>{{ data.type }}</b>
        </p>
        <sparc-tooltip placement="top-center" :content="data.title" is-repeating-item-content>
          <template #item>
            <div class="title mb-16">
              {{ data.title }}
            </div>
          </template>
        </sparc-tooltip>
        <p v-show="data.hideTitle" class="title text-placeholder" />
        <el-button class="primary" @click.prevent="cardClicked"> View {{ data.type }}</el-button>
      </div>
    </div>
  </el-card>
</template>

<script>

function isValidHttpUrl(string) {
  let url = undefined

  try {
    url = new URL(string)
  } catch (_) {
    return false
  }
  return url.protocol === 'http:' || url.protocol === 'https:'
}

export default {
  name: 'GalleryCard',
  mixins: [],
  props: {
    data: {
      type: Object,
      required: true,
    },
    width: {
      type: Number,
      default: 3,
    },
    height: {
      type: Number,
      default: 3,
    },
    showCardDetails: {
      type: Boolean,
    },
    shadow: {
      type: String,
      default: 'always',
    },
  },
  data() {
    return {
      ro: null,
      triangleSize: 4,
      thumbnail: undefined,
      disableTooltip: false,
      tooltipCalculated: false,
      defaultImg: new URL('~/assets/logo-sparc-wave-primary.svg', import.meta.url).href,
    }
  },
  watch: {
    data: {
      deep: true,
      immediate: true,
      handler: function () {
        this.thumbnail = undefined
        this.tooltipCalculated = false
        this.disableTooltip = false
        if (this.data.thumbnail) {
          if (isValidHttpUrl(this.data.thumbnail) && this.data.mimetype) {
            this.downloadThumbnail(this.data.thumbnail, { fetchAttempts: 0 })
          } else {
            this.thumbnail = this.data.thumbnail
          }
        } else {
          this.thumbnail = this.defaultImg
        }
      },
    },
  },
  computed: {
    isReady() {
      return this.thumbnail && (this.data.link || this.data.userData)
    },
  },
  methods: {
    /**
     * Open a new link if link is provide.
     * Fire an event if userData is provide.
     */
    cardClicked: function () {
      if (this.data.link) {
        const link = document.createElement('a')
        link.href = this.data.link
        link.target = '_blank'
        document.body.appendChild(link)
        link.click()
        link.remove()
      }
      if (this.data.userData) {
        this.$emit('card-clicked', this.data.userData)
      }
    },
    /**
     * handle thumbnail downloading,, it will use a default svg image if fails
     */
    downloadThumbnail: function (url, info) {
      this.getRequest(url, {}, 11000).then(
        (response) => {
          let data = response.data
          if (typeof data === 'string' && data.startsWith('data:')) {
            this.thumbnail = response.data
          } else {
            if (this.data.mimetype) {
              this.thumbnail = `data:${this.data.mimetype};base64,${response.data}`
            } else {
              this.thumbnail = response.data
            }
          }
        },
        (reason) => {
          if (reason.message.includes('timeout') && reason.message.includes('exceeded') && info.fetchAttempts < 3) {
            info.fetchAttempts += 1
            this.downloadThumbnail(url, info)
          } else {
            this.thumbnail = this.defaultImg
          }
        }
      )
    },
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.card {
  position: relative;
}
.details {
  text-align: left;
}

.cursor-pointer {
  cursor: pointer;
}

.text-placeholder {
  height: 1rem;
}

.title {
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.thumbnail {
  object-fit: contain;
  height: 8rem;
  width: 100%;
}

p.bold {
  font-weight: bold;
}

.image-overlay {
  position: absolute;
  top: 0;
  right: 0;
}

.triangle-icon {
  position: absolute;
}

.triangle-right-corner {
  width: 0;
  height: 0;
  border-left: solid transparent;
  border-top: solid $purple;
}
</style>
