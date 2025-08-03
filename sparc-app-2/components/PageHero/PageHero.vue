<template>
  <div class="page-hero">
    <div class="container">
      <el-row class="hero-row">
        <el-col class="text-container" :xs="0" :sm="24" :md="17" :lg="17" :xl="17">
          <slot />
        </el-col>
        <el-col :xs="0" :sm="0" :md="7" :lg="7" :xl="7">
          <div v-if="$slots['image']" class="graphic-container">
            <slot name="image" />
          </div>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHero',
  props: {
    justify: {
      type: String,
      default: 'center'
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.page-hero {
  background: $darkBlue;
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 400;
  color: white;
  .el-row {
    align-items: center;
    justify-content: center;
  }
  :deep(.graphic-container) {
    display: flex;
    img, video {
      height: 100%;
      width: 100%;
    }
  }
  :deep(.text-container) {
    padding-left: 0 !important;
    padding-right: 0 !important;
    color: white;
    h1 {
      font-size: 2em;
      line-height: 2.75rem;
      font-weight: 500;
    }
  }
  :deep(a) {
    color: white !important;
  }
}
</style>
