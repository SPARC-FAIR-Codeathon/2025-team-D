<template>
  <div class="section-container">
    <div v-if="maxSet" class="max-set-row" :style="`grid-template-columns: repeat(${maxPerRow}, 1fr)`">
      <div 
        v-for="(item, index) in metrics"
        :key="index"
        class="max-row-col"
        :style="`width: ${featureWidth}%`"
      >
        <consortia-metric
          :metric="item"
          :text-color="color"
          :consortia-ids="consortiaIds"
        />
      </div>
    </div>
    <div v-else class="row">
      <div 
        v-for="(item, index) in metrics"
        :key="index"
        class="col"
        :style="`width: ${featureWidth}%`"
      >
        <consortia-metric
          :metric="item"
          :text-color="color"
          :consortia-ids="consortiaIds"
        />
      </div>
    </div>
  </div>
</template>

<script>
import ConsortiaMetric from './ConsortiaMetric.vue'

export default {
  name: 'ConsortiaMetrics',
  components: {
    ConsortiaMetric
  },
  props: {
    metrics: {
      type: Array,
      default: () => []
    },
    consortiaIds: {
      type: Array,
      default: []
    },
    maxPerRow: {
      type: Number,
      default: Number.NaN
    },
    color: {
      type: String,
      default: ''
    }
  },
  computed: {
    featureWidth() {
      if (this.maxSet) {
        return 100.0
      }
      // Use 90 so that 10% of the width can be used for spacing between columns
      return 90.0 / this.metrics.length
    },
    maxSet() {
      return !isNaN(this.maxPerRow)
    },
    numRows() {
      if (isNaN(this.maxPerRow))
        return 1
      return Math.ceil(this.metrics.length / this.maxPerRow)
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
  justify-content: center;
  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
}
</style>
