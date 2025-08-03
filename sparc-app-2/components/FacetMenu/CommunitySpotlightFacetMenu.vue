<template>
  <div>
    <facet-menu
      class="remove-bottom-border"
      :selected-facets="selectedFacet"
      :visible-facet-categories="visibleCategories"
      @deselect-facet="deselectFacet"
      @deselect-all-facets="deselectAllFacets"
    />
    <dropdown-multiselect
      class="remove-bottom-border"
      ref="spotlightTypeCategory"
      collapse-by-default
      :category="spotlightTypes"
      enabled
      :default-checked-ids="selectedSpotlightTypes"
      @selection-change="selectedSpotlightTypesChanged"
    />
    <dropdown-multiselect
      ref="anatomicalStructuresCategory"
      collapse-by-default
      :category="anatomicalStructures"
      enabled
      :default-checked-ids="selectedAnatomicalStructures"
      @selection-change="selectedAnatomicalStructuresChanged"
    />
  </div>
</template>

<script>
import { pluck } from 'ramda'
import FacetMenu from './FacetMenu.vue'

const SPOTLIGHT_TYPE_CATEGORY_ID = 'spotlightType'
const ANATOMICAL_STRUCTURES_CATEGORY_ID = 'spotlightAnatomicalStructure'

const SPOTLIGHT_TYPE_OPTIONS = {
  label: 'Spotlight Type',
  id: SPOTLIGHT_TYPE_CATEGORY_ID,
  data: [
    {
      label: 'Fireside Chat',
      id: 'firesideChat',
    },
    {
      label: 'Success Story',
      id: 'successStory',
    }
  ]
}
const visibleCategories = ['spotlightType', ANATOMICAL_STRUCTURES_CATEGORY_ID]

export default {
  name: 'CommunitySpotlightFacetMenu',

  components: {
    FacetMenu
  },

  data() {
    return {
      spotlightTypes: SPOTLIGHT_TYPE_OPTIONS,
      selectedAnatomicalStructures: [],
      selectedSpotlightTypes: [],
      visibleCategories: visibleCategories,
    }
  },

  props: {
    anatomicalStructures: {
      type: Object,
      default: () =>  {}
    }
  },

  computed: {
    selectedFacet: function() {
      let facets = []
      if (this.selectedAnatomicalStructures != []) {
        this.selectedAnatomicalStructures.forEach(selectedOption => {
          facets.push({
            label: `${selectedOption.label}`,
            id: `${selectedOption.id}`,
            facetPropPath: this.anatomicalStructures.id
          })
        })
      }
      if (this.selectedSpotlightTypes != []) {
        this.selectedSpotlightTypes.forEach(selectedOption => {
          facets.push({
            label: `${selectedOption.label}`,
            id: `${selectedOption.id}`,
            facetPropPath: this.spotlightTypes.id
          })
        })
      }
      return facets
    }
  },

  mounted() {
    if (this.$route.query.selectedAnatomicalStructures) {
      this.selectedAnatomicalStructures = this.$route.query.selectedAnatomicalStructures.split(",")
    }
    if (this.$route.query.selectedSpotlightTypes) {
      this.selectedSpotlightTypes = this.$route.query.selectedSpotlightTypes.split(",")
    }
  },

  methods: {
    selectedAnatomicalStructuresChanged(newValue) {
      this.selectedAnatomicalStructures = newValue.checkedNodes
      this.$router.replace(
        {
          query: { ...this.$route.query, selectedAnatomicalStructures: this.selectedAnatomicalStructures.length === 0 ? undefined : pluck('id', this.selectedAnatomicalStructures).toString() }
        },
        () => {
          this.$emit('community-spotlight-selections-changed')
        }
      )
    },
    selectedSpotlightTypesChanged(newValue) {
      this.selectedSpotlightTypes = newValue.checkedNodes
      this.$router.replace(
        {
          query: { ...this.$route.query, selectedSpotlightTypes: this.selectedSpotlightTypes.length === 0 ? undefined : pluck('id', this.selectedSpotlightTypes).toString() }
        },
        () => {
          this.$emit('community-spotlight-selections-changed')
        }
      )
    },
    deselectAllFacets() {
      this.$refs.spotlightTypeCategory.uncheckAll()
      this.$refs.anatomicalStructuresCategory.uncheckAll()
    },
    deselectFacet(facetId) {
      this.$refs.anatomicalStructuresCategory.uncheck(facetId)
      this.$refs.spotlightTypeCategory.uncheck(facetId)
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'sparc-design-system-components-2/src/assets/_variables.scss';
.white-background {
  background-color: white;
  border: 0.1rem solid $lineColor2;
}

hr {
  border: none;
  border-bottom: 1px solid $lineColor1;
  margin: 0;
}

.remove-bottom-border {
  // hacky fix to address placing the design system drop down for the event type category outside the facet menu since it handles its own borders
  border-bottom: none;
}
</style>
