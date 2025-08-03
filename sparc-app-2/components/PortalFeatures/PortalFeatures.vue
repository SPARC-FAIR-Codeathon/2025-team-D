<template>
  <div class="section-container container pt-24 pb-48">
    <div class="heading2 mb-24">{{ title }}</div>
    <div v-if="maxSet" class="max-set-row" :style="`grid-template-columns: repeat(${maxPerRow}, 1fr)`">
      <div 
        v-for="(item, index) in features"
        :key="index"
        class="max-row-col"
        :style="`width: ${featureWidth}%`"
      >
        <portal-feature
          :feature="item"
          :icon-is-top-element="iconIsTopElement"
        />
      </div>
    </div>
    <div v-else class="row">
      <div 
        v-for="(item, index) in features"
        :key="index"
        class="col"
        :style="`width: ${featureWidth}%`"
      >
        <portal-feature
          :feature="item"
          :icon-is-top-element="iconIsTopElement"
        />
      </div>
    </div>
  </div>
</template>

<script>
import PortalFeature from './PortalFeature/PortalFeature.vue'

export default {
  name: 'PortalFeatures',
  components: {
    PortalFeature
  },
  props: {
    features: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: "What Can I Do with SPARC?"
    },
    iconIsTopElement: {
      type: Boolean,
      default: true
    },
    maxPerRow: {
      type: Number,
      default: Number.NaN
    }
  },
  computed: {
    featureWidth() {
      if (this.maxSet) {
        return 100.0
      }
      // Use 90 so that 10% of the width can be used for spacing between columns
      return 90.0 / this.features.length
    },
    maxSet() {
      return !isNaN(this.maxPerRow)
    },
    numRows() {
      if (isNaN(this.maxPerRow))
        return 1
      return Math.ceil(this.features.length / this.maxPerRow)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.section-container {
  text-align: center;
}
.max-row-col {
  margin: 0 auto
}
.max-set-row {
  display: grid;
  grid-row-gap: 3rem;
  grid-column-gap: 4rem;
  width: 97.5%
}
.col {
  display: flex;
  @media screen and (max-width: 767px) {
    width: 100% !important;
    margin-bottom: 1rem;
  }
}

.row {
  display: flex;
  justify-content: space-between;
  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
}
</style>
