<template>
  <div class="tags-container">
    <span class="flex mb-8">
      Filters applied
      <el-popover
          title="How do filters work?"
          width="190"
          trigger="hover"
          :append-to-body=false
          class="popover"
          >
          <template v-slot:reference>
            <svgo-icon-help class="help-icon"/>
          </template>
          <div>
            <strong>Within categories:</strong> OR 
            <br/>
            example: 'heart' OR 'colon'
            <br/>
            <br/>
            <strong>Between categories:</strong> AND
            <br/>
            example: 'rat' AND 'lung'
          </div>
        </el-popover>
      <el-link class="container-link" @click="deselectAllFacets">Reset all</el-link>
    </span>
    <hr />
    <el-card shadow="never" class="facet-card">
      <span v-if="selectedFacets.length == 0" class="no-facets">
        No filters applied
      </span>
      <el-tag
        v-for="facet in selectedFacets"
        v-show="doShowTagFacet(facet)"
        :key="facet.id"
        class="capitalize"
        disable-transitions
        closable
        @close="deselectFacet(facet.id)"
      >
        {{ facet.label.split('.').pop() }}
      </el-tag>
    </el-card>
  </div>
</template>

<script>
import { pathOr } from 'ramda'

export default {
  name: 'TagsContainer',

  props: {
    // All facets contained in the menu
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
    },
    doShowTagFacet(facet) {
      // If visible facets is not set then we default to showing tags for all the facets in that category
      if (
        this.visibleFacetCategories.includes(facet.facetPropPath) &&
        this.visibleFacets === undefined
      ) {
        return true
      }
      return (
        this.visibleFacetCategories.includes(facet.facetPropPath) &&
        pathOr(
          undefined,
          [facet.facetPropPath, facet.label],
          this.visibleFacets
        ) !== undefined
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.tags-container {
  padding: 0.75rem;
  hr {
    padding-top: 0;
    padding-bottom: 0;
    margin-bottom: 0.5rem;
    border: none;
    border-bottom: 1px solid $lineColor2;
  }
  .flex {
    display: flex;
    .el-link {
      margin-left: auto;
    }
  }
  .facet-card {
    :deep(.el-card__body) {
      padding: 10px;
      height: 6rem;
      overflow-y: auto;
    }
    .no-facets {
      font-style: italic;
      opacity: 0.5;
    }
    .capitalize {
      text-transform: capitalize;
    }
  }
  .container-link {
    text-decoration: underline;
    text-transform: none;
    color: $purple;
    a:hover {
      text-decoration: none;
    }
  }
  //el-link adds a component with a border in order to underline the text.
  //The underline is too low so we cannot use it, and must instead hide it
  .el-link.el-link--default:after {
    border: none;
  }
  .help-icon {
    color: $purple;
    height: 1.5rem;
    width: 1.5rem;
  }
  :deep(.popover) {
    background-color: #f9f2fc;
  }
}
</style>
