<template>
  <div class="feature-container pt-0 px-16 pb-16">
    <img
      v-if="iconIsTopElement"
      class="icon"
      :src=iconUrl
    />
    <div class="heading2" :class="{ 'mb-8': !iconIsTopElement }">
      {{ title }}
    </div>
    <img
      v-if="!iconIsTopElement"
      class="icon"
      :src=iconUrl
    />
    <div class="body1 mt-16" v-html="parseMarkdown(description)" />
    <a class="button-link" :href="buttonLink">
      <el-button class="secondary">
        {{ buttonText }}
      </el-button>
    </a>
  </div>
</template>

<script>
import { pathOr } from 'ramda'
import marked from '@/mixins/marked/index'

export default {
  name: 'PortalFeature',

  mixins: [marked],

  props: {
    feature: {
      type: Object,
      default: () => {}
    },
    iconIsTopElement: {
      type: Boolean,
      default: true
    }
  },

  computed: {
    buttonLink() {
      return pathOr('', ['fields','buttonLink'], this.feature)
    },
    buttonText() {
      return pathOr('', ['fields','buttonText'], this.feature)
    },
    description() {
      return pathOr('', ['fields','description'], this.feature)
    },
    title() {
      return pathOr('', ['fields','title'], this.feature)
    },
    iconUrl() {
      return pathOr('', ['fields','icon', 'fields', 'file', 'url'], this.feature)
    }
  },
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.feature-container {
  border: 2px solid $grey;
  border-radius: .75rem;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}
.icon {
  margin: 0 auto;
  height: 8rem;
}
.centered {
  text-align: center;
}
.body1 {
  text-align: left;
}
.button-link {
  margin-top: auto;
}
</style>
