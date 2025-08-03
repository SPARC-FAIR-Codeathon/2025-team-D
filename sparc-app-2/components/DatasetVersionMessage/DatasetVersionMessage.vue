<template>
  <div
    :class="
      datasetDetails.embargo ? 'version-message-fixed' : 'version-message'
    "
    class="el-message el-message--info"
  >
    <p v-if="!datasetDetails.embargo" class="el-message__content">
      {{ messageCopy }} version {{ currentVersion }} of this dataset. A
      <nuxt-link
        :to="{
          name: 'datasets-datasetId',
          params: {
            datasetId: datasetDetails.id
          }
        }"
      >
        more recent version
      </nuxt-link>
      is available.
    </p>
    <p v-else class="el-message__content">
      This dataset is under embargo and will be made publicly available on
      {{ embargoedReleaseDate }}
    </p>
  </div>
</template>

<script>
import { propOr } from 'ramda'
import FormatDate from '@/mixins/format-date'
export default {
  name: 'DatasetVersionMessage',

  mixins: [FormatDate],

  props: {
    currentVersion: {
      type: Number,
      default: 1
    },
    datasetDetails: {
      type: Object,
      default: () => {}
    },
    isTombStone: {
      type: Boolean,
      default: false
    }
  },

  computed: {
    /**
     * Copy to show in the message
     * depeneding on whether the user is
     * on the tombstone page or not
     * @returns {String}
     */
    messageCopy() {
      return this.isTombStone ? 'You are attempting to view' : 'You are viewing'
    },

    /**
     * Get formatted embargoed date
     * @return {String}
     */
    embargoedReleaseDate() {
      const date = propOr('', 'embargoReleaseDate', this.datasetDetails)
      return this.formatCalendarDate(date)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.version-message {
  background: $darkBlue !important;
  color: #fff !important;
  min-width: 17.5rem;
  padding: 1rem;
  position: absolute;
  top: 98px;
  z-index: 99;
  @media (min-width: 48rem) {
    top: 96px;
    white-space: nowrap;
  }
  @media (min-width: 64rem) {
    top: 195px;
  }
  .el-message__content {
    color: #fff !important;
  }
}
a {
  color: #fff;
  // Removes the underlined space at the end
  // of the nuxt link to the latest version
  display: inline-block;
  text-decoration: underline;
  &:hover,
  &:focus {
    text-decoration: none;
  }
}

.version-message-fixed {
  box-sizing: border-box;
  top: 195px;
  max-width: 600px;
  width: 100%;
}
</style>
