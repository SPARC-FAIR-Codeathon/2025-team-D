<template>
  <el-card :style="{ border: 'none', maxWidth: width + 'rem' }" class="card">
    <news-list-item
      :item="item"
    />
  </el-card>
</template>

<script>
import NewsListItem from '@/components/NewsListItem/NewsListItem.vue'

export default {
  name: 'HighlightCard',
  components: {
    NewsListItem
  },
  props: {
    item: {
      type: Object,
      default: {}
    },
    width: {
      type: Number,
      default: 68
    },
  },
}
</script>

<style scoped lang="scss">
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.card {
  background-color: transparent;
  position: relative;
  cursor: default;
}
</style>
