<template>
  <div class="p-12 breadcrumb nav3">
    <div>
      <template v-for="item in breadcrumb" :key="item.label">
        <nuxt-link :to="item.to">
          {{ item.label }}
        </nuxt-link>
        >
      </template>
      <span class="title" v-html="parseMarkdown(title)"/>
    </div>
  </div>
</template>

<script>
import marked from '@/mixins/marked/index'

export default {
  name: 'Breadcrumb',

  mixins: [marked],

  props: {
    breadcrumb: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.breadcrumb {
  background: $lineColor2;
  height: fit-content;
  a {
    text-decoration: none;
    color: $darkBlue;
  }
  & sup {
    vertical-align: baseline;
    position: relative;
    top: -0.4em;
  }
}
:deep(.title) {
  display: inline-block;
  p {
    margin: 0;
  }
}
</style>
