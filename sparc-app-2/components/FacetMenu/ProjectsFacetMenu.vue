<template>
  <div class="dataset-facet-menu">
    <facet-menu
      :selectedFacets="selectedFacets"
      :visible-facet-categories="visibleCategories"
      @deselect-facet="deselectFacet"
      @deselect-all-facets="deselectAllFacets"
    />
    <hr class="expand-all-separator"/>
    <span class="flex expand-all-container">
      <el-link class="container-link" @click="expandAllCategories">
        Expand all
      </el-link>
    </span>
    <dropdown-multiselect
      ref="anatomicalFocusCategory"
      collapse-by-default
      :category="anatomicalFocusCategory"
      :default-checked-ids="defaultCheckedAnatomicalFocusIds"
      @selection-change="onAnatomicalFacetSelectionChange"
    />
  </div>
</template>

<script>
import { pluck } from 'ramda'
import FacetMenu from './FacetMenu.vue'

const ANATOMICAL_FOCUS_CATEGORY_ID = 'anatomicalFocus'

export default {
  name: 'ProjectsFacetMenu',

  components: { FacetMenu },

  props: {
    anatomicalFocusFacets: {
      type: Array,
      default: () => []
    }
  },  
  
  data() {
    return {
      selectedAnatomicalFocusFacets: [],
      defaultCheckedAnatomicalFocusIds: [],
    }
  },

  computed: {
    anatomicalFocusCategory: function() {
      return {
        label: 'Focus',
        id: ANATOMICAL_FOCUS_CATEGORY_ID,
        data: this.anatomicalFocusFacets
      }
    },
    visibleCategories: function() {
      return [ANATOMICAL_FOCUS_CATEGORY_ID]
    },
    selectedAnatomicalFocusIds: function() {
      return pluck('id', this.selectedAnatomicalFocusFacets).toString()
    },
    selectedFacets: function() {
      let facets = []
      if (this.selectedAnatomicalFocusFacets != []) {
        this.selectedAnatomicalFocusFacets.forEach(selectedOption => {
          facets.push({
            label: `${selectedOption.label}`,
            id: `${selectedOption.id}`,
            facetPropPath: this.anatomicalFocusCategory.id
          })
        })
      }
      return facets
    },
  },

  mounted() {
    if (this.$route.query.selectedProjectsAnatomicalFocusIds) {
      this.defaultCheckedAnatomicalFocusIds = this.$route.query.selectedProjectsAnatomicalFocusIds.split(",")
    }
    else {
      this.$emit('projects-selections-changed')
    }
  },

  methods: {
    onAnatomicalFacetSelectionChange: function(data) {
      this.selectedAnatomicalFocusFacets = data.checkedNodes
      const selectedFacetIds = this.selectedAnatomicalFocusFacets.length === 0 ? undefined : this.selectedAnatomicalFocusIds

      this.$router.replace({
        query: { 
          ...this.$route.query, 
          selectedProjectsAnatomicalFocusIds: selectedFacetIds
        }
      }).then(() => {
        this.$emit('projects-selections-changed')
      })
    },
    getSelectedAnatomicalFocusTypes: function() {
      return this.selectedAnatomicalFocusFacets.length > 0 ? this.selectedAnatomicalFocusIds : undefined
    },
    async deselectAllFacets() {
      await this.$router.replace(
        {
          query: {
            ...this.$route.query,
            selectedProjectsAnatomicalFocusIds: undefined
          }
        }).then(() => {
          this.$emit('projects-selections-changed')
          this.$refs.anatomicalFocusCategory.uncheckAll()
        })
    },
    deselectFacet(id) {
      this.$refs.anatomicalFocusCategory.uncheck(id)
    },
    expandAllCategories() {
      this.$refs.anatomicalFocusCategory.setCollapsed(false)
    },
	}
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';

.dataset-facet-menu > .sparc-design-system-component-dropdown-multiselect:not(:last-child) {
  border-bottom: none;
}

hr {
  margin: 0;
  border: none;
  border-bottom: 1px solid $lineColor2;
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

.flex {
  display: flex;
  border-left: 1px solid $lineColor2;
  border-right: 1px solid $lineColor2;
  .el-link {
    margin: .5rem .75rem .5rem auto;
  }
}

.expand-all-container {
  background-color: white;
}

</style>

