<template>
  <el-card :style="{ maxWidth: width + 'rem', boxShadow: 'none' }" class="card">
    <div class="title-container">
      <div class="title heading2">
        {{ title }}
      </div>
    </div>
    <div class="heading1 data">
      {{ data }}
    </div>
    <div v-if="showSubData" class="body1">
      {{ subData }}
    </div>
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
      default: 21
    },
    title: {
      type: String,
      default: ''
    },
    data: {
      type: String,
      default: '0'
    },
    subData: {
      type: String,
      default: '0'
    },
    showSubData: {
      type: Boolean,
      default: true
    }
  },
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.data {
  color: $purple;
}
.card {
  border: 1px solid $lineColor2;
  background-color: transparent;
  position: relative;
  cursor: default;
  text-align: center;
  min-height: 9rem;
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
</style>
