<template>
  <div class="white-background">
    <div class="heading2 px-12 py-4">
      Refine results
    </div>
    <hr />
    <tags-container
      :selected-facets="selectedFacets"
      :visibleFacetCategories="visibleFacetCategories"
      :visibleFacets="visibleFacets"
      @deselect-facet="deselectFacet"
      @deselect-all-facets="deselectAllFacets"
    />
    <slot />
  </div>
</template>

<script>
import TagsContainer from '@/components/FacetMenu/TagsContainer.vue'
export default {
  name: 'FacetMenu',

  components: { TagsContainer },

  props: {
    selectedFacets: {
      type: Array,
      default: () => []
    },
    visibleFacetCategories: {
      type: Array,
      default: () => []
    },
    visibleFacets: {
      type: Object,
      default: () => {}
    }
  },

  methods: {
    deselectAllFacets() {
      this.$emit('deselect-all-facets')
    },
    deselectFacet(id) {
      this.$emit('deselect-facet', id)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.white-background {
  background-color: white;
  border: 1px solid $lineColor2;
  border-bottom: none;
}

hr {
  border: none;
  border-bottom: 1px solid $lineColor2;
  margin: 0;
}
</style>
