<template>
  <el-card :style="{ border: 'none', maxWidth: width + 'rem' }" class="card">
    <div class="image-container mb-16">
      <img class="thumbnail" :src="thumbnailUrl" alt="thumbnail loading ..." />
    </div>
    <div class="title-container">
      <div class="title heading2">
        {{title}}
      </div>
      <sparc-pill class="pill ml-16" v-if="showSparcTag">
        SPARC Program
      </sparc-pill>
    </div>
    <div class="heading3">
      {{subtitle}}
    </div>
    <div class="body1 mb-16">
      {{truncatedDescription}}
    </div>
    <a v-if="buttonLink !== null" :href="buttonLink">
      <el-button class="secondary">
        Learn More
      </el-button>
    </a>
  </el-card>
</template>

<script>
import SparcPill from '@/components/SparcPill/SparcPill.vue'
export default {
  name: 'ResourceCard',
  components: {
    SparcPill
  },
  props: {
    width: {
      type: Number,
      default: 13.8
    },
    title: {
      type: String,
      default: ''
    },
    showSparcTag: {
      type: Boolean,
      default: false
    },
    subtitle: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    buttonLink: {
      type: String,
      default: null
    },
    thumbnailUrl: {
      type: String,
      default: null
    },
    externalUrl: {
      type: String,
      default: null
    },
  },
  computed: {
    truncatedDescription() {
      return this.description?.length > 134 ? 
        `${this.description.substring(0, 134)}...` :
        this.description
    }
  }
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.card {
  background-color: transparent;
  position: relative;
  cursor: default;
}
.title-container {
  display: flex;
  align-items: center;
}
.title {
  overflow-x: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.thumbnail {
  height: auto;
  width: 100%;
  margin: auto;
}
.image-container {
  display: flex;
  aspect-ratio: 1 / 1;
  border: 2px solid $lineColor1;
  padding: .5rem;
  background-color: white;
}
.pill {
  height: fit-content;
}
</style>
